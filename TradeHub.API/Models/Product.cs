namespace TradeHub.API.Models;

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public int? SubcategoryId { get; set; }

    /// <summary>
    /// Optional foreign key to Brand. Nullable to support products created before
    /// the Brand entity was introduced and to avoid breaking existing data.
    /// </summary>
    public int? BrandId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public Category Category { get; set; } = null!;
    public Subcategory? Subcategory { get; set; }
    public Brand? Brand { get; set; }
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
}