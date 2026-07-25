namespace TradeHub.API.Models;

/// <summary>
/// Represents a product brand (e.g. Apple, Samsung, Nike).
/// Products reference this entity via a foreign key instead of a plain string.
/// </summary>
public class Brand
{
    public int Id { get; set; }

    /// <summary>Brand display name. Unique across the table.</summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>Optional URL to the brand's logo image.</summary>
    public string? LogoUrl { get; set; }

    // Navigation properties
    public ICollection<Product> Products { get; set; } = new List<Product>();
}
