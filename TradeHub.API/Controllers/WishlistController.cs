using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TradeHub.API.Data;
using TradeHub.API.DTOs;
using TradeHub.API.DTOs.Wishlist;
using TradeHub.API.Models;

namespace TradeHub.API.Controllers;

[ApiController]
[Route("api/wishlist")]
[Authorize]
[Produces("application/json")]
public class WishlistController : ControllerBase
{
    private readonly AppDbContext _db;

    public WishlistController(AppDbContext db)
    {
        _db = db;
    }

    private int GetCurrentUserId()
    {
        var claim = User.FindFirst("userId") ?? User.FindFirst(ClaimTypes.NameIdentifier);
        if (claim is null || !int.TryParse(claim.Value, out var id))
            throw new UnauthorizedAccessException("User identification token claim is missing or invalid.");
        return id;
    }

    /// <summary>
    /// GET /api/wishlist
    /// Returns the logged-in customer's saved wishlist items with real-time current price comparison fields.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<WishlistItemDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetWishlist()
    {
        var userId = GetCurrentUserId();

        var wishlistItems = await _db.WishlistItems
            .AsNoTracking()
            .Include(w => w.Product)
                .ThenInclude(p => p.Category)
            .Include(w => w.Product)
                .ThenInclude(p => p.Brand)
            .Where(w => w.UserId == userId)
            .OrderByDescending(w => w.AddedAt)
            .Select(w => new WishlistItemDto
            {
                Id              = w.Id,
                ProductId       = w.ProductId,
                ProductName     = w.Product.Name,
                ImageUrl        = w.Product.ImageUrl,
                Category        = w.Product.Category != null ? w.Product.Category.Name : "General",
                Brand           = w.Product.Brand != null ? w.Product.Brand.Name : "Vendora",
                PriceWhenAdded  = w.PriceWhenAdded,
                CurrentPrice    = w.Product.Price,
                HasPriceDropped = w.Product.Price < w.PriceWhenAdded,
                StockQuantity   = w.Product.StockQuantity,
                IsActive        = w.Product.IsActive,
                AddedAt         = w.AddedAt,
            })
            .ToListAsync();

        return Ok(ApiResponse<IEnumerable<WishlistItemDto>>.Ok(wishlistItems));
    }

    /// <summary>
    /// POST /api/wishlist
    /// Adds a product to the logged-in user's wishlist, capturing the current price as PriceWhenAdded.
    /// Returns 400 Bad Request if the product is already in the wishlist.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<WishlistItemDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AddToWishlist([FromBody] AddToWishlistDto dto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
            return BadRequest(ApiResponse.Fail("Validation failed.", errors));
        }

        var userId = GetCurrentUserId();

        // 1. Verify product exists
        var product = await _db.Products
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .FirstOrDefaultAsync(p => p.Id == dto.ProductId);

        if (product is null)
            return NotFound(ApiResponse.Fail($"Product with ID {dto.ProductId} was not found."));

        // 2. Check if already in user's wishlist
        var alreadyExists = await _db.WishlistItems
            .AnyAsync(w => w.UserId == userId && w.ProductId == dto.ProductId);

        if (alreadyExists)
            return BadRequest(ApiResponse.Fail("Product is already in your wishlist."));

        // 3. Create wishlist item with CURRENT price snapshot
        var item = new WishlistItem
        {
            UserId         = userId,
            ProductId      = dto.ProductId,
            PriceWhenAdded = product.Price,
            AddedAt        = DateTime.UtcNow,
        };

        _db.WishlistItems.Add(item);
        await _db.SaveChangesAsync();

        var resultDto = new WishlistItemDto
        {
            Id              = item.Id,
            ProductId       = item.ProductId,
            ProductName     = product.Name,
            ImageUrl        = product.ImageUrl,
            Category        = product.Category != null ? product.Category.Name : "General",
            Brand           = product.Brand != null ? product.Brand.Name : "Vendora",
            PriceWhenAdded  = item.PriceWhenAdded,
            CurrentPrice    = product.Price,
            HasPriceDropped = false,
            StockQuantity   = product.StockQuantity,
            IsActive        = product.IsActive,
            AddedAt         = item.AddedAt,
        };

        return CreatedAtAction(nameof(GetWishlist), null,
            ApiResponse<WishlistItemDto>.Ok(resultDto, "Product added to wishlist successfully."));
    }

    /// <summary>
    /// DELETE /api/wishlist/{id}
    /// Removes an item from the logged-in user's wishlist after verifying ownership.
    /// </summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RemoveFromWishlist(int id)
    {
        var userId = GetCurrentUserId();

        var item = await _db.WishlistItems.FindAsync(id);
        if (item is null)
            return NotFound(ApiResponse.Fail($"Wishlist item with ID {id} was not found."));

        // Strict ownership check: customer can only delete their own wishlist item
        if (item.UserId != userId)
            return StatusCode(StatusCodes.Status403Forbidden, ApiResponse.Fail("You can only remove items from your own wishlist."));

        _db.WishlistItems.Remove(item);
        await _db.SaveChangesAsync();

        return Ok(ApiResponse.Ok("Item removed from wishlist successfully."));
    }
}
