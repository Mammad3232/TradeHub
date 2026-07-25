namespace TradeHub.API.Models;

public class Subcategory
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;   // e.g. "phones", "laptops"
    public int CategoryId { get; set; }

    // Navigation properties
    public Category Category { get; set; } = null!;
    public ICollection<Product> Products { get; set; } = new List<Product>();
}