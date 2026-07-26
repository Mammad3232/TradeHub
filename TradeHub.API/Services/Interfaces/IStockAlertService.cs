using TradeHub.API.Models;

namespace TradeHub.API.Services.Interfaces;

/// <summary>
/// Encapsulates all low-stock alert logic so it can be called from any service
/// that changes a product's StockQuantity (OrderService, ProductService, etc.)
/// without duplicating business rules.
/// </summary>
public interface IStockAlertService
{
    /// <summary>
    /// Evaluates whether a low-stock notification should fire for <paramref name="product"/>.
    /// <list type="bullet">
    ///   <item>If stock &lt;= threshold (and threshold &gt; 0) AND no unresolved alert exists → creates a Notification row and pushes a real-time SignalR event to the "Admins" group.</item>
    ///   <item>If stock &gt; threshold → marks any existing unresolved LowStock notification for this product as IsResolved = true.</item>
    /// </list>
    /// This method swallows all exceptions so callers never fail because of alert logic.
    /// </summary>
    Task CheckAndNotifyAsync(Product product);
}
