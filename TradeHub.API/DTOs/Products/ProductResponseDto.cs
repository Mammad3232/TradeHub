namespace TradeHub.API.DTOs.Products;

/// <summary>
/// Response DTO — field names match what the frontend currently expects
/// (e.g. "title" not "name", "image" not "imageUrl").
/// </summary>
public class ProductResponseDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;       // maps from Product.Name
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
    public string Image { get; set; } = string.Empty;       // maps from Product.ImageUrl
    public int CategoryId { get; set; }
    public string Category { get; set; } = string.Empty;    // flat string for the frontend filter
    public double Rating { get; set; }                      // static 4.5 until reviews are implemented
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}
