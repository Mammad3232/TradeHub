namespace TradeHub.API.Models;

/// <summary>
/// Tracks a single product-detail page view.
/// Used for:
///   1. "Recently Viewed" feature — surfaces the last N products a session viewed.
///   2. Recommendation relevance signal — future extension beyond pure co-purchase data.
///
/// SessionId is a client-generated GUID stored in localStorage. It correctly identifies
/// both authenticated users AND guests without requiring cookies or a login.
/// UserId is nullable — set only when the request carries a valid JWT.
/// </summary>
public class ProductView
{
    public int Id { get; set; }

    /// <summary>
    /// Client-generated GUID persisted in localStorage as "tradehub_session_id".
    /// Ensures accurate guest tracking across page reloads.
    /// </summary>
    public string SessionId { get; set; } = string.Empty;

    /// <summary>
    /// Nullable — populated from JWT claim when user is authenticated.
    /// Null for anonymous / guest sessions.
    /// </summary>
    public int? UserId { get; set; }

    public int ProductId { get; set; }

    public DateTime ViewedAt { get; set; } = DateTime.UtcNow;

    // ── Navigation properties ────────────────────────────────────────────────────
    public Product Product { get; set; } = null!;
    public User? User { get; set; }
}
