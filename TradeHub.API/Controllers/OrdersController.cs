using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TradeHub.API.DTOs;
using TradeHub.API.DTOs.Orders;
using TradeHub.API.Services.Interfaces;

namespace TradeHub.API.Controllers;

[ApiController]
[Route("api/orders")]
[Authorize]
[Produces("application/json")]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    private int GetCurrentUserId()
    {
        var claim = User.FindFirst("userId") ?? User.FindFirst(ClaimTypes.NameIdentifier);
        if (claim is null || !int.TryParse(claim.Value, out var id))
            throw new UnauthorizedAccessException("User identification token claim is missing or invalid.");
        return id;
    }

    private string GetCurrentUserRole()
    {
        var claim = User.FindFirst(ClaimTypes.Role);
        return claim?.Value ?? "Customer";
    }

    /// <summary>Checkout cart items and create a new order.</summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<OrderResponseDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateOrderDto dto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
            return BadRequest(ApiResponse.Fail("Validation failed.", errors));
        }

        var userId = GetCurrentUserId();
        var created = await _orderService.CreateAsync(dto, userId);

        return CreatedAtAction(nameof(GetById), new { id = created.Id },
            ApiResponse<OrderResponseDto>.Ok(created, "Order placed successfully."));
    }

    /// <summary>Get orders. Admin sees all, customer sees only their own.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<OrderResponseDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var userId = GetCurrentUserId();
        var role = GetCurrentUserRole();
        var orders = await _orderService.GetAllAsync(userId, role);
        return Ok(ApiResponse<IEnumerable<OrderResponseDto>>.Ok(orders));
    }

    /// <summary>Get a single order by ID.</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<OrderResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var userId = GetCurrentUserId();
        var role = GetCurrentUserRole();
        var order = await _orderService.GetByIdAsync(id, userId, role);

        if (order is null)
            return NotFound(ApiResponse.Fail($"Order with ID {id} was not found."));

        return Ok(ApiResponse<OrderResponseDto>.Ok(order));
    }

    /// <summary>Update order status. Admin only.</summary>
    [HttpPut("{id:int}/status")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<OrderResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateOrderStatusDto dto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
            return BadRequest(ApiResponse.Fail("Validation failed.", errors));
        }

        var updated = await _orderService.UpdateStatusAsync(id, dto);
        return Ok(ApiResponse<OrderResponseDto>.Ok(updated, "Order status updated successfully."));
    }
}
