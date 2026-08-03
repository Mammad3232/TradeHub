using System.ComponentModel.DataAnnotations;
using TradeHub.API.Models;

namespace TradeHub.API.DTOs.Orders;

/// <summary>
/// Sent by the frontend when a customer checks out their cart.
/// </summary>
public class CreateOrderDto
{
    [Required]
    [MinLength(1, ErrorMessage = "Order must contain at least one item.")]
    public List<OrderItemDto> Items { get; set; } = new();
}

public class OrderItemDto
{
    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "Product ID must be valid.")]
    public int ProductId { get; set; }

    [Required]
    [Range(1, 9999, ErrorMessage = "Quantity must be between 1 and 9,999.")]
    public int Quantity { get; set; }
}

/// <summary>
/// Returned to the client when querying orders.
/// </summary>
public class OrderResponseDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public DateTime OrderDate { get; set; }
    public decimal TotalPrice { get; set; }
    public string Status { get; set; } = string.Empty;
    public List<OrderItemResponseDto> Items { get; set; } = new();
}

public class OrderItemResponseDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string ProductImage { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal SubTotal => UnitPrice * Quantity;
}

public class UpdateOrderStatusDto
{
    [Required]
    public string Status { get; set; } = string.Empty;
}

public class OrderTrackingDto
{
    public int OrderId { get; set; }
    public string Status { get; set; } = string.Empty;
    public string TrackingNumber { get; set; } = string.Empty;
    public string Carrier { get; set; } = string.Empty;
    public DateTime EstimatedDelivery { get; set; }
    public List<OrderTrackingStepDto> Steps { get; set; } = new();
}

public class OrderTrackingStepDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime? Timestamp { get; set; }
    public bool IsCompleted { get; set; }
    public bool IsCurrent { get; set; }
}

