namespace TradeHub.API.DTOs.Products;

/// <summary>
/// Response DTO - field names match what the frontend currently expects.
/// </summary>
public class ProductResponseDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;       // maps from Product.Name
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal? OldPrice { get; set; }
    public int StockQuantity { get; set; }
    public string Image { get; set; } = string.Empty;       // maps from Product.ImageUrl
    public int CategoryId { get; set; }
    public string Category { get; set; } = string.Empty;    // flat category name
    public int? SubcategoryId { get; set; }
    public string? Subcategory { get; set; }                // flat subcategory name
    public string? SubcategorySlug { get; set; }            // slug for URL filtering
    public int? BrandId { get; set; }
    public string? Brand { get; set; }                      // flat brand name
    /// <summary>Average rating computed from Reviews (1–5). Defaults to 4.5 when no reviews exist.</summary>
    public double Rating { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }

    /// <summary>Low-stock alert threshold set by the admin. Null means no alert configured.</summary>
    public int? LowStockThreshold { get; set; }

    /// <summary>Vendor / store name that created this product, if available.</summary>
    public string? VendorName { get; set; }
}