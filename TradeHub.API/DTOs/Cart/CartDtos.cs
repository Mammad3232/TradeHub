namespace TradeHub.API.DTOs.Cart;

public class CartItemDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal? OldPrice { get; set; }
    public int StockQuantity { get; set; }
    public string Image { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}

public class UpdateCartItemDto
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
}

public class UpdateCartResponseDto
{
    public int ProductId { get; set; }
    public int RequestedQuantity { get; set; }
    public int AllowedQuantity { get; set; }
    public int StockQuantity { get; set; }
    public bool IsStockExceeded { get; set; }
}
