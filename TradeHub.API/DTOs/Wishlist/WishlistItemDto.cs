namespace TradeHub.API.DTOs.Wishlist;

public class WishlistItemDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public decimal PriceWhenAdded { get; set; }
    public decimal CurrentPrice { get; set; }
    public bool HasPriceDropped { get; set; }
    public int StockQuantity { get; set; }
    public bool IsActive { get; set; }
    public DateTime AddedAt { get; set; }
}
