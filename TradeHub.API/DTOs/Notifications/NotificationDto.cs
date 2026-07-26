namespace TradeHub.API.DTOs.Notifications;

public class NotificationDto
{
    public int Id { get; set; }
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = "NewOrder";
    public bool IsRead { get; set; }
    public bool IsResolved { get; set; }
    public DateTime CreatedAt { get; set; }
    public int? RelatedOrderId { get; set; }
    public int? RelatedProductId { get; set; }
}
