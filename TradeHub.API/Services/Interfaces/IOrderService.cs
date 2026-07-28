using TradeHub.API.DTOs.Orders;

namespace TradeHub.API.Services.Interfaces;

public interface IOrderService
{
    Task<OrderResponseDto> CreateAsync(CreateOrderDto dto, int userId);
    Task<IEnumerable<OrderResponseDto>> GetAllAsync(int userId, string userRole);
    Task<OrderResponseDto?> GetByIdAsync(int id, int userId, string userRole);
    Task<OrderResponseDto> UpdateStatusAsync(int id, UpdateOrderStatusDto dto);
    Task<OrderTrackingDto?> GetTrackingAsync(int id, int userId, string userRole);
    Task<(byte[] Content, string ContentType, string FileName)?> GetInvoiceAsync(int id, int userId, string userRole);
}
