namespace TradeHub.API.Models;

/// <summary>
/// An immutable audit record that a price-drop alert was sent for a specific
/// wishlist item at a specific price.
///
/// This is the single source of truth used by the background job to prevent
/// duplicate/spam alerts:
///   - If no PriceAlert row exists for a WishlistItemId → fire alert.
///   - If a PriceAlert exists but Product.Price has dropped FURTHER below
///     the PriceAtAlert of the last record → fire a new alert.
///   - Otherwise → skip (no duplicate).
///
/// Cascade rule: if the parent WishlistItem is deleted, all its PriceAlert
/// rows are also deleted automatically.
/// </summary>
public class PriceAlert
{
    public int Id { get; set; }

    /// <summary>FK to the wishlist item this alert belongs to.</summary>
    public int WishlistItemId { get; set; }

    /// <summary>
    /// The product price at the moment this alert was created.
    /// The job uses this (not PriceWhenAdded) as the baseline for detecting
    /// further drops. This correctly handles the scenario:
    ///   price drops → alert sent (PriceAtAlert = $80)
    ///   price rises → no alert
    ///   price drops below $80 again → new alert fires
    /// </summary>
    public decimal PriceAtAlert { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Whether the customer has read/dismissed this alert in the UI.
    /// Separate from Notification.IsRead — both are tracked independently.
    /// </summary>
    public bool IsRead { get; set; } = false;

    // ── Navigation ────────────────────────────────────────────────────────────
    public WishlistItem WishlistItem { get; set; } = null!;
}
