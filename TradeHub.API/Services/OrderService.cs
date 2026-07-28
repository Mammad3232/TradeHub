using System.Text;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using TradeHub.API.Data;
using TradeHub.API.DTOs.Orders;
using TradeHub.API.Hubs;
using TradeHub.API.Models;
using TradeHub.API.Repositories.Interfaces;
using TradeHub.API.Services.Interfaces;

namespace TradeHub.API.Services;

public class OrderService : IOrderService
{
    private readonly IOrderRepository _orderRepo;
    private readonly AppDbContext _db;
    private readonly IEmailService _emailService;
    private readonly IHubContext<OrderHub> _hubContext;
    private readonly IStockAlertService _stockAlertService;

    public OrderService(
        IOrderRepository orderRepo,
        AppDbContext db,
        IEmailService emailService,
        IHubContext<OrderHub> hubContext,
        IStockAlertService stockAlertService)
    {
        _orderRepo = orderRepo;
        _db = db;
        _emailService = emailService;
        _hubContext = hubContext;
        _stockAlertService = stockAlertService;
    }

    public async Task<OrderResponseDto> CreateAsync(CreateOrderDto dto, int userId)
    {
        // 1. Validate products and check stock availability
        var productIds = dto.Items.Select(i => i.ProductId).Distinct().ToList();
        var products = await _db.Products
            .Where(p => productIds.Contains(p.Id) && p.IsActive)
            .ToListAsync();

        if (products.Count != productIds.Count)
            throw new InvalidOperationException("One or more products were not found or are no longer available.");

        // 2. Build order items and verify stock
        var orderItems = new List<OrderItem>();
        decimal total = 0;

        foreach (var item in dto.Items)
        {
            var product = products.First(p => p.Id == item.ProductId);

            // Ensure sufficient stock
            if (product.StockQuantity < item.Quantity)
            {
                throw new InvalidOperationException($"Insufficient stock for '{product.Name}'. Only {product.StockQuantity} item(s) available.");
            }

            orderItems.Add(new OrderItem
            {
                ProductId = item.ProductId,
                Quantity = item.Quantity,
                UnitPrice = product.Price  // lock the price at order time
            });

            total += product.Price * item.Quantity;

            // 3. Decrement stock
            product.StockQuantity -= item.Quantity;
        }

        // 4. Save the order + items + stock changes atomically
        var order = new Order
        {
            UserId = userId,
            OrderDate = DateTime.UtcNow,
            TotalPrice = total,
            Status = OrderStatus.Pending,
            OrderItems = orderItems
        };

        _db.Orders.Add(order);
        await _db.SaveChangesAsync();

        // 5. Reload with full navigation for the response
        var created = await _orderRepo.GetByIdAsync(order.Id)
            ?? throw new Exception("Order was created but could not be retrieved.");

        // 6. Send real-time SignalR notification to all connected Admins
        await NotifyAdminsAsync(created);

        // 7. Check low-stock threshold for every affected product
        foreach (var product in products)
            await _stockAlertService.CheckAndNotifyAsync(product);

        // 8. Send order confirmation email (non-blocking — failure never crashes the order)
        var user = await _db.Users.FindAsync(userId);
        if (user is not null)
        {
            var emailItems = created.OrderItems.Select(oi =>
                (oi.Product?.Name ?? "Product", oi.Quantity, oi.UnitPrice));

            _ = _emailService.SendOrderConfirmationAsync(
                user.Email,
                user.FullName,
                created.Id,
                created.TotalPrice,
                emailItems);
        }

        return MapToDto(created);
    }

    // ── SignalR + Notification persistence ─────────────────────────────────────

    private async Task NotifyAdminsAsync(Order order)
    {
        var customerName = order.User?.FullName ?? "A customer";
        var message = $"New order #{order.Id} from {customerName} — ${order.TotalPrice:F2}";

        // a) Push live event to every Admin who is currently connected
        try
        {
            await _hubContext.Clients.Group("Admins").SendAsync("NewOrderReceived", new
            {
                orderId     = order.Id,
                customerName,
                totalPrice  = order.TotalPrice,
                createdAt   = order.OrderDate
            });
        }
        catch
        {
            // SignalR failure must never crash the order flow — log in production
        }

        // b) Persist notification row so offline admins see it on next login
        try
        {
            _db.Notifications.Add(new Notification
            {
                Message        = message,
                IsRead         = false,
                CreatedAt      = DateTime.UtcNow,
                RelatedOrderId = order.Id
            });
            await _db.SaveChangesAsync();
        }
        catch
        {
            // DB failure must also never crash the order flow
        }
    }

    public async Task<IEnumerable<OrderResponseDto>> GetAllAsync(int userId, string userRole)
    {
        IEnumerable<Order> orders;

        if (userRole.Equals("Admin", StringComparison.OrdinalIgnoreCase))
            orders = await _orderRepo.GetAllAsync();
        else
            orders = await _orderRepo.GetByUserIdAsync(userId);

        return orders.Select(MapToDto);
    }

    public async Task<OrderResponseDto?> GetByIdAsync(int id, int userId, string userRole)
    {
        var order = await _orderRepo.GetByIdAsync(id);
        if (order is null) return null;

        // Customers can only see their own orders
        if (!userRole.Equals("Admin", StringComparison.OrdinalIgnoreCase) && order.UserId != userId)
            throw new UnauthorizedAccessException("You do not have permission to view this order.");

        return MapToDto(order);
    }

    public async Task<OrderResponseDto> UpdateStatusAsync(int id, UpdateOrderStatusDto dto)
    {
        if (!Enum.TryParse<OrderStatus>(dto.Status, true, out var status))
            throw new ArgumentException(
                $"Invalid status value '{dto.Status}'. Valid values: {string.Join(", ", Enum.GetNames<OrderStatus>())}");

        var updated = await _orderRepo.UpdateStatusAsync(id, status);

        // Re-load navigation properties
        var order = await _orderRepo.GetByIdAsync(updated.Id)!
            ?? throw new Exception("Failed to retrieve updated order.");

        return MapToDto(order);
    }

    public async Task<OrderTrackingDto?> GetTrackingAsync(int id, int userId, string userRole)
    {
        var order = await _orderRepo.GetByIdAsync(id);
        if (order is null) return null;

        if (!userRole.Equals("Admin", StringComparison.OrdinalIgnoreCase) && order.UserId != userId)
            throw new UnauthorizedAccessException("You do not have permission to view tracking for this order.");

        var statusStr = order.Status.ToString();
        var steps = new List<OrderTrackingStepDto>();

        bool isCancelled = order.Status == OrderStatus.Cancelled;
        bool isDelivered = order.Status == OrderStatus.Delivered;
        bool isShipped = order.Status == OrderStatus.Shipped || isDelivered;
        bool isConfirmed = order.Status == OrderStatus.Confirmed || isShipped || isDelivered;

        steps.Add(new OrderTrackingStepDto
        {
            Title = "Order Placed",
            Description = "Your order was successfully submitted and received.",
            Timestamp = order.OrderDate,
            IsCompleted = true,
            IsCurrent = order.Status == OrderStatus.Pending
        });

        if (isCancelled)
        {
            steps.Add(new OrderTrackingStepDto
            {
                Title = "Order Cancelled",
                Description = "This order has been cancelled.",
                Timestamp = order.OrderDate.AddHours(1),
                IsCompleted = true,
                IsCurrent = true
            });
        }
        else
        {
            steps.Add(new OrderTrackingStepDto
            {
                Title = "Order Confirmed",
                Description = "Payment verified and order confirmed by seller.",
                Timestamp = isConfirmed ? order.OrderDate.AddHours(2) : null,
                IsCompleted = isConfirmed,
                IsCurrent = order.Status == OrderStatus.Confirmed
            });

            steps.Add(new OrderTrackingStepDto
            {
                Title = "Package Shipped",
                Description = "Carrier picked up package and dispatched from warehouse.",
                Timestamp = isShipped ? order.OrderDate.AddDays(1) : null,
                IsCompleted = isShipped,
                IsCurrent = order.Status == OrderStatus.Shipped
            });

            steps.Add(new OrderTrackingStepDto
            {
                Title = "Out for Delivery",
                Description = "Courier is on the way to your delivery address.",
                Timestamp = isDelivered ? order.OrderDate.AddDays(2).AddHours(4) : null,
                IsCompleted = isDelivered,
                IsCurrent = false
            });

            steps.Add(new OrderTrackingStepDto
            {
                Title = "Delivered",
                Description = "Package handed over to recipient.",
                Timestamp = isDelivered ? order.OrderDate.AddDays(3) : null,
                IsCompleted = isDelivered,
                IsCurrent = isDelivered
            });
        }

        return new OrderTrackingDto
        {
            OrderId = order.Id,
            Status = statusStr,
            Carrier = "TradeHub Logistics",
            TrackingNumber = $"TRK-{order.Id:D6}-{order.OrderDate:yyyyMMdd}",
            EstimatedDelivery = order.OrderDate.AddDays(3),
            Steps = steps
        };
    }

    public async Task<(byte[] Content, string ContentType, string FileName)?> GetInvoiceAsync(int id, int userId, string userRole)
    {
        var order = await _orderRepo.GetByIdAsync(id);
        if (order is null) return null;

        if (!userRole.Equals("Admin", StringComparison.OrdinalIgnoreCase) && order.UserId != userId)
            throw new UnauthorizedAccessException("You do not have permission to download this invoice.");

        var sb = new StringBuilder();
        sb.AppendLine("=========================================================================");
        sb.AppendLine("                           TRADEHUB INVOICE                             ");
        sb.AppendLine("=========================================================================");
        sb.AppendLine($"Invoice Number : INV-{order.Id:D6}");
        sb.AppendLine($"Order Date     : {order.OrderDate:yyyy-MM-dd HH:mm:ss} UTC");
        sb.AppendLine($"Order Status   : {order.Status}");
        sb.AppendLine("-------------------------------------------------------------------------");
        sb.AppendLine("CUSTOMER INFORMATION:");
        sb.AppendLine($"Customer Name  : {order.User?.FullName ?? "Valued Customer"}");
        sb.AppendLine($"Customer Email : {order.User?.Email ?? "N/A"}");
        sb.AppendLine("-------------------------------------------------------------------------");
        sb.AppendLine("ORDER ITEMS:");
        sb.AppendLine(string.Format("{0,-6} | {1,-35} | {2,-10} | {3,-10}", "Qty", "Product Name", "Unit Price", "Subtotal"));
        sb.AppendLine(new string('-', 73));

        foreach (var item in order.OrderItems)
        {
            var pName = item.Product?.Name ?? "Product Item";
            if (pName.Length > 35) pName = pName.Substring(0, 32) + "...";
            var lineTotal = item.Quantity * item.UnitPrice;
            sb.AppendLine(string.Format("{0,-6} | {1,-35} | ${2,-9:F2} | ${3,-9:F2}", item.Quantity, pName, item.UnitPrice, lineTotal));
        }

        sb.AppendLine(new string('-', 73));
        sb.AppendLine($"Subtotal:                                                         ${order.TotalPrice:F2}");
        sb.AppendLine("Shipping:                                                         FREE");
        sb.AppendLine($"GRAND TOTAL PAID:                                                 ${order.TotalPrice:F2}");
        sb.AppendLine("=========================================================================");
        sb.AppendLine("               Thank you for your business with TradeHub!                ");
        sb.AppendLine("=========================================================================");

        var bytes = Encoding.UTF8.GetBytes(sb.ToString());
        return (bytes, "text/plain; charset=utf-8", $"Invoice_Order_{order.Id}.txt");
    }

    // ── Mapping ────────────────────────────────────────────────────────────────

    private static OrderResponseDto MapToDto(Order o) => new()
    {
        Id = o.Id,
        UserId = o.UserId,
        CustomerName = o.User?.FullName ?? "Unknown",
        CustomerEmail = o.User?.Email ?? "Unknown",
        OrderDate = o.OrderDate,
        TotalPrice = o.TotalPrice,
        Status = o.Status.ToString(),
        Items = o.OrderItems.Select(oi => new OrderItemResponseDto
        {
            ProductId = oi.ProductId,
            ProductName = oi.Product?.Name ?? "Unknown",
            ProductImage = oi.Product?.ImageUrl ?? string.Empty,
            Quantity = oi.Quantity,
            UnitPrice = oi.UnitPrice
        }).ToList()
    };
}
