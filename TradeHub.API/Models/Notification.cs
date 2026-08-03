namespace TradeHub.API.Models;

/// <summary>
/// Persisted record of a notification for admins or customers.
/// Supports notification types:
///   - NewOrder   : created whenever a customer places an order (admin).
///   - LowStock   : created when a product's stock drops below threshold (admin).
///   - PriceDrop  : created by the background job when a wishlisted product drops in price (customer).
/// </summary>
public class Notification
{
    public int Id { get; set; }

    /// <summary>Human-readable message shown in the UI.</summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Discriminates between notification kinds so the frontend can style them differently.
    /// Valid values: "NewOrder" | "LowStock" | "PriceDrop"
    /// </summary>
    public string Type { get; set; } = NotificationType.NewOrder;

    public bool IsRead { get; set; } = false;

    /// <summary>
    /// For LowStock notifications: set to true when an admin pushes stock back above
    /// the threshold. Prevents the same alert from re-firing until stock drops again.
    /// Always false for NewOrder and PriceDrop notifications.
    /// </summary>
    [System.ComponentModel.DataAnnotations.Schema.NotMapped]
    public bool IsResolved { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Optional FK to the customer this notification targets.
    /// Null for admin-only notifications (NewOrder, LowStock).
    /// Set for PriceDrop notifications so the customer can query their own feed.
    /// Configured as SetNull — notification survives user deletion.
    /// </summary>
    public int? UserId { get; set; }
    public User? User { get; set; }

    /// <summary>Optional FK back to the order that triggered this notification.</summary>
    public int? RelatedOrderId { get; set; }
    public Order? RelatedOrder { get; set; }

    /// <summary>Optional FK back to the product that triggered a LowStock or PriceDrop notification.</summary>
    public int? RelatedProductId { get; set; }
    public Product? RelatedProduct { get; set; }

    /// <summary>
    /// Optional FK to the wishlist item that triggered a PriceDrop notification.
    /// Configured as SetNull so the notification history survives even if the
    /// customer later removes the item from their wishlist.
    /// </summary>
    public int? RelatedWishlistItemId { get; set; }
    public WishlistItem? RelatedWishlistItem { get; set; }
}

/// <summary>Strongly-typed string constants for Notification.Type.</summary>
public static class NotificationType
{
    public const string NewOrder  = "NewOrder";
    public const string LowStock  = "LowStock";
    public const string PriceDrop = "PriceDrop";
}
