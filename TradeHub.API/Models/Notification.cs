namespace TradeHub.API.Models;

/// <summary>
/// Persisted record of an admin notification.
/// Supports two notification types:
///   - NewOrder  : created whenever a customer places an order.
///   - LowStock  : created when a product's stock drops to or below its LowStockThreshold.
/// Admins who were offline still see the notification when they next open the panel.
/// </summary>
public class Notification
{
    public int Id { get; set; }

    /// <summary>Human-readable message shown in the UI (e.g. "New order from John — $149.00").</summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Discriminates between notification kinds so the frontend can style them differently.
    /// Valid values: "NewOrder" | "LowStock"
    /// </summary>
    public string Type { get; set; } = NotificationType.NewOrder;

    public bool IsRead { get; set; } = false;

    /// <summary>
    /// For LowStock notifications: set to true when an admin pushes stock back above
    /// the threshold. Prevents the same alert from re-firing until stock drops again.
    /// Always false for NewOrder notifications.
    /// </summary>
    public bool IsResolved { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>Optional FK back to the order that triggered this notification.</summary>
    public int? RelatedOrderId { get; set; }
    public Order? RelatedOrder { get; set; }

    /// <summary>Optional FK back to the product that triggered a LowStock notification.</summary>
    public int? RelatedProductId { get; set; }
    public Product? RelatedProduct { get; set; }
}

/// <summary>Strongly-typed string constants for Notification.Type.</summary>
public static class NotificationType
{
    public const string NewOrder  = "NewOrder";
    public const string LowStock  = "LowStock";
}
