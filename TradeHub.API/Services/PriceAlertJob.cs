using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using TradeHub.API.Data;
using TradeHub.API.Hubs;
using TradeHub.API.Models;
using TradeHub.API.Services.Interfaces;

namespace TradeHub.API.Services;

/// <summary>
/// Background job class executed periodically by Hangfire to check for wishlisted product price drops.
/// Enforces performance, stock availability, active status, and strict duplicate-prevention rules.
/// </summary>
public class PriceAlertJob
{
    private readonly AppDbContext _db;
    private readonly IHubContext<OrderHub> _hubContext;
    private readonly IEmailService _emailService;
    private readonly ILogger<PriceAlertJob> _logger;

    public PriceAlertJob(
        AppDbContext db,
        IHubContext<OrderHub> hubContext,
        IEmailService emailService,
        ILogger<PriceAlertJob> logger)
    {
        _db = db;
        _hubContext = hubContext;
        _emailService = emailService;
        _logger = logger;
    }

    /// <summary>
    /// Core job entry point called by Hangfire.
    /// Performs DB-side filtering to find active, in-stock products whose current price
    /// is less than PriceWhenAdded, then checks each item's alert history to prevent duplicate spam.
    /// </summary>
    public async Task CheckWishlistPriceDrops()
    {
        _logger.LogInformation("[PriceAlertJob] Starting wishlist price drop check at {Time}...", DateTime.UtcNow);

        try
        {
            // PERFORMANCE RULE: Filter on the database side via EF Core LINQ query.
            // Only select WishlistItems where:
            //   1. Related Product is active (IsActive == true)
            //   2. Related Product is in stock (StockQuantity > 0)
            //   3. Related Product's current price is less than PriceWhenAdded
            var candidateItems = await _db.WishlistItems
                .Include(w => w.Product)
                .Include(w => w.User)
                .Include(w => w.PriceAlerts)
                .Where(w => w.Product.IsActive &&
                            w.Product.StockQuantity > 0 &&
                            w.Product.Price < w.PriceWhenAdded)
                .ToListAsync();

            if (candidateItems.Count == 0)
            {
                _logger.LogInformation("[PriceAlertJob] No qualifying price drops found.");
                return;
            }

            int alertsCreated = 0;

            foreach (var item in candidateItems)
            {
                var currentPrice = item.Product.Price;

                // DUPLICATE ALERT PREVENTION RULE:
                // Check if an alert was ALREADY created for this WishlistItemId.
                // If alerts exist, find the lowest PriceAtAlert previously sent.
                // Only alert again if currentPrice is LOWER than the previous lowest alert price.
                var lastAlertPrice = item.PriceAlerts.Count > 0
                    ? item.PriceAlerts.Min(pa => pa.PriceAtAlert)
                    : (decimal?)null;

                bool shouldAlert = lastAlertPrice is null
                    ? true // First alert for this wishlist item
                    : currentPrice < lastAlertPrice.Value; // Only alert if price dropped FURTHER than previous alert

                if (!shouldAlert)
                {
                    _logger.LogDebug(
                        "[PriceAlertJob] Skipping WishlistItem #{Id} (Product #{ProductId}). Current price {CurrentPrice:C} is not lower than last alert price {LastAlertPrice:C}.",
                        item.Id, item.ProductId, currentPrice, lastAlertPrice);
                    continue;
                }

                // 1. Create PriceAlert audit record
                var priceAlert = new PriceAlert
                {
                    WishlistItemId = item.Id,
                    PriceAtAlert   = currentPrice,
                    CreatedAt      = DateTime.UtcNow,
                    IsRead         = false
                };
                _db.PriceAlerts.Add(priceAlert);

                // 2. Create in-app Notification for customer
                var notificationMessage = $"🎉 Price Drop Alert! \"{item.Product.Name}\" is now ${currentPrice:F2} (was ${item.PriceWhenAdded:F2})!";
                var notification = new Notification
                {
                    UserId               = item.UserId,
                    Message              = notificationMessage,
                    Type                 = NotificationType.PriceDrop,
                    IsRead               = false,
                    CreatedAt            = DateTime.UtcNow,
                    RelatedProductId     = item.ProductId,
                    RelatedWishlistItemId = item.Id
                };
                _db.Notifications.Add(notification);

                // Save DB changes for this item
                await _db.SaveChangesAsync();
                alertsCreated++;

                _logger.LogInformation(
                    "[PriceAlertJob] Created PriceAlert + Notification for User #{UserId}, Product \"{ProductName}\" (Price: {OldPrice:C} -> {NewPrice:C}).",
                    item.UserId, item.Product.Name, item.PriceWhenAdded, currentPrice);

                // 3. Live SignalR push notification (non-blocking)
                try
                {
                    await _hubContext.Clients.User(item.UserId.ToString()).SendAsync("PriceDropAlert", new
                    {
                        notificationId = notification.Id,
                        wishlistItemId = item.Id,
                        productId      = item.ProductId,
                        productName    = item.Product.Name,
                        imageUrl       = item.Product.ImageUrl,
                        oldPrice       = item.PriceWhenAdded,
                        newPrice       = currentPrice,
                        message        = notificationMessage,
                        createdAt      = notification.CreatedAt
                    });
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "[PriceAlertJob] Failed to push SignalR notification to User #{UserId}.", item.UserId);
                }

                // 4. Email notification (wrapped in try-catch so email failure never breaks job or DB persistence)
                if (!string.IsNullOrWhiteSpace(item.User?.Email))
                {
                    try
                    {
                        await _emailService.SendPriceDropEmailAsync(
                            item.User.Email,
                            item.User.FullName ?? "Valued Customer",
                            item.Product.Name,
                            item.PriceWhenAdded,
                            currentPrice);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "[PriceAlertJob] Failed to send price drop email to {Email}.", item.User.Email);
                    }
                }
            }

            _logger.LogInformation("[PriceAlertJob] Finished wishlist price drop check. Total new alerts sent: {Count}.", alertsCreated);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[PriceAlertJob] Error occurred during CheckWishlistPriceDrops execution.");
        }
    }
}
