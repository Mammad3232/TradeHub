using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TradeHub.API.Data;
using TradeHub.API.DTOs;
using TradeHub.API.DTOs.Cart;

namespace TradeHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class CartController : ControllerBase
{
    private readonly AppDbContext _db;

    public CartController(AppDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// GET /api/cart?ids=1,2,3
    /// Fetches live product stock, price, and availability details for cart items.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<CartItemDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCartItems([FromQuery] string? ids)
    {
        IQueryable<Models.Product> query = _db.Products
            .AsNoTracking()
            .Include(p => p.Brand);

        if (!string.IsNullOrWhiteSpace(ids))
        {
            var parsedIds = ids.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Select(id => int.TryParse(id, out var val) ? val : (int?)null)
                .Where(val => val.HasValue)
                .Select(val => val!.Value)
                .Distinct()
                .ToList();

            if (parsedIds.Count > 0)
            {
                query = query.Where(p => parsedIds.Contains(p.Id));
            }
        }

        var products = await query.ToListAsync();

        var cartItems = products.Select(p => new CartItemDto
        {
            Id = p.Id,
            Title = p.Name,
            Brand = p.Brand?.Name ?? "Vendora",
            Price = p.Price,
            OldPrice = p.OldPrice,
            StockQuantity = p.StockQuantity,
            Image = p.ImageUrl,
            IsActive = p.IsActive
        });

        return Ok(ApiResponse<IEnumerable<CartItemDto>>.Ok(cartItems));
    }

    /// <summary>
    /// POST /api/cart/update or PUT /api/cart/update or PUT /api/cart
    /// Validates requested cart item quantity against current database Product.StockQuantity.
    /// Returns 400 Bad Request if quantity exceeds available stock.
    /// </summary>
    [HttpPost("update")]
    [HttpPut("update")]
    [HttpPut]
    [ProducesResponseType(typeof(ApiResponse<UpdateCartResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateCartItem([FromBody] UpdateCartItemDto dto)
    {
        if (dto.ProductId <= 0)
        {
            return BadRequest(ApiResponse.Fail("Valid product ID is required."));
        }

        var product = await _db.Products
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == dto.ProductId);

        if (product is null || !product.IsActive)
        {
            return BadRequest(ApiResponse.Fail("Product is no longer available."));
        }

        if (dto.Quantity <= 0)
        {
            return BadRequest(ApiResponse.Fail("Quantity must be at least 1."));
        }

        if (dto.Quantity > product.StockQuantity)
        {
            var response = new UpdateCartResponseDto
            {
                ProductId = product.Id,
                RequestedQuantity = dto.Quantity,
                AllowedQuantity = Math.Max(0, product.StockQuantity),
                StockQuantity = product.StockQuantity,
                IsStockExceeded = true
            };

            var message = product.StockQuantity <= 0
                ? $"'{product.Name}' is out of stock."
                : $"Only {product.StockQuantity} item{(product.StockQuantity > 1 ? "s" : "")} available in stock for '{product.Name}'.";

            return BadRequest(ApiResponse.Fail(message, response));
        }

        var validResponse = new UpdateCartResponseDto
        {
            ProductId = product.Id,
            RequestedQuantity = dto.Quantity,
            AllowedQuantity = dto.Quantity,
            StockQuantity = product.StockQuantity,
            IsStockExceeded = false
        };

        return Ok(ApiResponse<UpdateCartResponseDto>.Ok(validResponse, "Cart quantity updated successfully."));
    }
}
