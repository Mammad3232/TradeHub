using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using TradeHub.API.Data;
using TradeHub.API.Hubs;
using TradeHub.API.Models;
using TradeHub.API.Services.Interfaces;

namespace TradeHub.API.Services;

/// <summary>
/// Centralised, reusable low-stock alert service.
/// Called after any operation that mutates Product.StockQuantity.
/// </summary>
public class StockAlertService : IStockAlertService
{
    private readonly AppDbContext _db;
    private readonly IHubContext<OrderHub> _hubContext;

    public StockAlertService(AppDbContext db, IHubContext<OrderHub> hubContext)
    {
        _db = db;
        _hubContext = hubContext;
    }

    /// <inheritdoc />
    public async Task CheckAndNotifyAsync(Product product)
    {
        try
        {
            bool thresholdSet = product.LowStockThreshold.HasValue
                             && product.LowStockThreshold.Value > 0;

            if (!thresholdSet)
                return; // No alert configured for this product

            bool stockIsLow = product.StockQuantity <= product.LowStockThreshold!.Value;

            if (stockIsLow)
            {
                await FireLowStockAlertIfNeededAsync(product);
            }
            else
            {
                await ResolveExistingAlertsAsync(product.Id);
            }
        }
        catch
        {
            // Alert logic must never crash the calling operation (order checkout, admin update, etc.)
            // In production, log the exception here.
        }
    }

    // ── Private helpers ────────────────────────────────────────────────────────

    /// <summary>
    /// Creates a new LowStock notification + SignalR push, but ONLY if no unresolved
    /// alert already exists for this product (spam prevention).
    /// </summary>
    private async Task FireLowStockAlertIfNeededAsync(Product product)
    {
        // Spam prevention: skip if an unresolved alert already exists
        bool alreadyAlerted = await _db.Notifications
            .AnyAsync(n => n.Type == NotificationType.LowStock
                        && n.RelatedProductId == product.Id
                        && !n.IsResolved);

        if (alreadyAlerted)
            return;

        var message = $"Low stock: \"{product.Name}\" has only {product.StockQuantity} unit(s) left" +
                      $" (threshold: {product.LowStockThreshold}).";

        // a) Persist notification row so offline admins see it on next login
        var notification = new Notification
        {
            Message          = message,
            Type             = NotificationType.LowStock,
            IsRead           = false,
            IsResolved       = false,
            CreatedAt        = DateTime.UtcNow,
            RelatedProductId = product.Id
        };

        _db.Notifications.Add(notification);
        await _db.SaveChangesAsync();

        // b) Push live event to all currently connected Admins (non-blocking)
        try
        {
            await _hubContext.Clients.Group("Admins").SendAsync("LowStockAlert", new
            {
                notificationId  = notification.Id,
                productId       = product.Id,
                productName     = product.Name,
                stockQuantity   = product.StockQuantity,
                threshold       = product.LowStockThreshold,
                message,
                createdAt       = notification.CreatedAt
            });
        }
        catch
        {
            // SignalR failure must never roll back the DB notification that was already saved
        }
    }

    /// <summary>
    /// When stock is pushed back above the threshold, marks all unresolved LowStock
    /// alerts for this product as resolved (IsResolved = true), preventing duplicate
    /// alerts from firing on the next stock decrement until it drops low again.
    /// </summary>
    private async Task ResolveExistingAlertsAsync(int productId)
    {
        var unresolvedAlerts = await _db.Notifications
            .Where(n => n.Type == NotificationType.LowStock
                     && n.RelatedProductId == productId
                     && !n.IsResolved)
            .ToListAsync();

        if (unresolvedAlerts.Count == 0)
            return;

        foreach (var alert in unresolvedAlerts)
            alert.IsResolved = true;

        await _db.SaveChangesAsync();
    }
}
