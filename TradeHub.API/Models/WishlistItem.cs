namespace TradeHub.API.Models;

/// <summary>
/// Represents a product that a logged-in customer has saved to their wishlist.
/// PriceWhenAdded captures the product's price at the moment of saving so the
/// background job can detect if it has dropped since.
/// </summary>
public class WishlistItem
{
    public int Id { get; set; }

    /// <summary>The customer who saved this item.</summary>
    public int UserId { get; set; }

    /// <summary>
    /// The product being tracked. Configured with CASCADE delete in AppDbContext —
    /// if an admin hard-deletes a product, all related wishlist rows are automatically
    /// removed, preventing orphan data and FK constraint violations.
    /// </summary>
    public int ProductId { get; set; }

    /// <summary>
    /// Snapshot of the product's price at the moment this item was added.
    /// The background job compares Product.Price against this value to decide
    /// whether a price-drop alert should fire.
    /// </summary>
    public decimal PriceWhenAdded { get; set; }

    public DateTime AddedAt { get; set; } = DateTime.UtcNow;

    // ── Navigation Properties ─────────────────────────────────────────────────
    public User User { get; set; } = null!;
    public Product Product { get; set; } = null!;

    /// <summary>
    /// All alerts that have been fired for this wishlist item.
    /// Used by the job to check the last alert price before deciding to fire again.
    /// </summary>
    public ICollection<PriceAlert> PriceAlerts { get; set; } = new List<PriceAlert>();
}
