using System.ComponentModel.DataAnnotations;

namespace TradeHub.API.DTOs.Products;

/// <summary>
/// Payload for POST /api/products/{id}/view.
/// The frontend sends this once when a product detail page mounts.
/// </summary>
public class TrackViewDto
{
    /// <summary>
    /// Client-generated GUID from localStorage ("tradehub_session_id").
    /// Required — identifies both guests and logged-in users for view tracking.
    /// </summary>
    [Required]
    [MaxLength(100)]
    public string SessionId { get; set; } = string.Empty;

    /// <summary>
    /// Optional — the authenticated user's ID extracted from JWT on the frontend.
    /// Null for guest sessions.
    /// </summary>
    public int? UserId { get; set; }
}
