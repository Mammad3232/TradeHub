namespace TradeHub.API.Models;

public class Category
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    // Navigation properties
    public ICollection<Subcategory> Subcategories { get; set; } = new List<Subcategory>();
    public ICollection<Product> Products { get; set; } = new List<Product>();
}