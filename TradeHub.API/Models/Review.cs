using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TradeHub.API.Models;

/// <summary>
/// Represents a customer review for a product (rating 1–5 with optional comment).
/// </summary>
public class Review
{
    public int Id { get; set; }

    // ── Foreign Keys ────────────────────────────────────────────────────────────
    public int ProductId { get; set; }
    public int UserId { get; set; }

    // ── Review Content ──────────────────────────────────────────────────────────
    /// <summary>Star rating between 1 (worst) and 5 (best).</summary>
    [Range(1, 5)]
    public int Rating { get; set; }

    /// <summary>Optional written comment from the reviewer.</summary>
    [MaxLength(1000)]
    public string? Comment { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // ── Navigation Properties ───────────────────────────────────────────────────
    public Product Product { get; set; } = null!;
    public User User { get; set; } = null!;
}
