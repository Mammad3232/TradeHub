using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using TradeHub.API.Data;
using TradeHub.API.DTOs;
using TradeHub.API.DTOs.Products;
using TradeHub.API.Models;
using TradeHub.API.Services.Interfaces;

namespace TradeHub.API.Controllers;

[ApiController]
[Route("api/products")]
[Produces("application/json")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;
    private readonly IRecommendationService _recommendationService;
    private readonly IServiceScopeFactory _scopeFactory;

    public ProductsController(
        IProductService productService,
        IRecommendationService recommendationService,
        IServiceScopeFactory scopeFactory)
    {
        _productService = productService;
        _recommendationService = recommendationService;
        _scopeFactory = scopeFactory;
    }

    /// <summary>
    /// Get all active products. Supports filtering by category, subcategory, price range, brand IDs, minimum rating, and search term.
    /// Brand IDs can be passed multiple times: ?brandIds=1&amp;brandIds=3
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<ProductResponseDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? category,
        [FromQuery] int? categoryId,
        [FromQuery] int? subcategoryId,
        [FromQuery] string? subcategorySlug,
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice,
        [FromQuery] string? search,
        [FromQuery] string? searchTerm,
        [FromQuery] string? searchQuery,
        [FromQuery] List<int>? brandIds,
        [FromQuery] double? minRating)
    {
        var effectiveSearch = !string.IsNullOrWhiteSpace(searchTerm)
            ? searchTerm
            : (!string.IsNullOrWhiteSpace(searchQuery) ? searchQuery : search);

        var products = await _productService.GetAllAsync(
            category, minPrice, maxPrice, effectiveSearch,
            subcategoryId, subcategorySlug,
            brandIds, minRating, categoryId);
        return Ok(ApiResponse<IEnumerable<ProductResponseDto>>.Ok(products));
    }

    /// <summary>Get a single product by ID.</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<ProductResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var product = await _productService.GetByIdAsync(id);
        if (product is null)
            return NotFound(ApiResponse.Fail($"Product with ID {id} was not found."));

        return Ok(ApiResponse<ProductResponseDto>.Ok(product));
    }

    /// <summary>Create a new product. Admins and Vendors only.</summary>
    [HttpPost]
    [Authorize(Roles = "Admin,Vendor")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(ApiResponse<ProductResponseDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Create([FromForm] CreateProductDto dto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
            return BadRequest(ApiResponse.Fail("Validation failed.", errors));
        }

        try
        {
            var created = await _productService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id },
                ApiResponse<ProductResponseDto>.Ok(created, "Product created successfully."));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse.Fail(ex.Message));
        }
    }

    /// <summary>Update a product. Admins and Vendors only.</summary>
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin,Vendor")]
    [ProducesResponseType(typeof(ApiResponse<ProductResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateProductDto dto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
            return BadRequest(ApiResponse.Fail("Validation failed.", errors));
        }

        var updated = await _productService.UpdateAsync(id, dto);
        return Ok(ApiResponse<ProductResponseDto>.Ok(updated, "Product updated successfully."));
    }

    /// <summary>Soft-delete a product (sets IsActive=false). Admins and Vendors only.</summary>
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin,Vendor")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        await _productService.DeleteAsync(id);
        return Ok(ApiResponse.Ok("Product deleted successfully."));
    }

    // ── Tracking & Recommendations ────────────────────────────────────────────────

    /// <summary>
    /// Record a product-detail page view. Fire-and-forget — returns 202 immediately
    /// so a DB slowdown never blocks the user's page render.
    /// Called once when the Product Detail page mounts in the frontend.
    /// </summary>
    [HttpPost("{id:int}/view")]
    [ProducesResponseType(StatusCodes.Status202Accepted)]
    public IActionResult TrackView(int id, [FromBody] TrackViewDto dto)
    {
        // Fire-and-forget: kick off DB write without awaiting so the response returns
        // immediately (202 Accepted) without blocking the user's page render.
        //
        // IMPORTANT: We create a fresh DI scope inside the Task.Run lambda.
        // Capturing the controller's scoped _db directly would cause a
        // "DbContext was disposed" exception because the HTTP request scope ends
        // as soon as we return Accepted() below.
        _ = Task.Run(async () =>
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                // Silently skip if product doesn't exist (avoids FK violation)
                var productExists = await db.Products.AnyAsync(p => p.Id == id && p.IsActive);
                if (!productExists) return;

                var view = new ProductView
                {
                    ProductId = id,
                    SessionId = dto.SessionId,
                    UserId    = dto.UserId,
                    ViewedAt  = DateTime.UtcNow,
                };

                db.ProductViews.Add(view);
                await db.SaveChangesAsync();
            }
            catch
            {
                // Silently swallow — view tracking must never crash the user experience.
            }
        });

        return Accepted();
    }

    /// <summary>
    /// Get products frequently co-purchased with the target product, falling back to same-category products.
    /// </summary>
    [HttpGet("{id:int}/recommendations")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<ProductResponseDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetRecommendations(int id)
    {
        var recommendations = await _recommendationService.GetRecommendationsAsync(id);
        return Ok(ApiResponse<IEnumerable<ProductResponseDto>>.Ok(recommendations));
    }

    /// <summary>
    /// Get recently viewed products for the current session/user, excluding the current product if requested.
    /// </summary>
    [HttpGet("recently-viewed")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<ProductResponseDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetRecentlyViewed([FromQuery] string sessionId, [FromQuery] int? excludeProductId = null)
    {
        if (string.IsNullOrWhiteSpace(sessionId))
        {
            return Ok(ApiResponse<IEnumerable<ProductResponseDto>>.Ok(Enumerable.Empty<ProductResponseDto>()));
        }

        var recentlyViewed = await _recommendationService.GetRecentlyViewedAsync(sessionId, excludeProductId);
        return Ok(ApiResponse<IEnumerable<ProductResponseDto>>.Ok(recentlyViewed));
    }
}