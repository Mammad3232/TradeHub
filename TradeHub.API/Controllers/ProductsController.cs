using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TradeHub.API.DTOs;
using TradeHub.API.DTOs.Products;
using TradeHub.API.Services.Interfaces;

namespace TradeHub.API.Controllers;

[ApiController]
[Route("api/products")]
[Produces("application/json")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;

    public ProductsController(IProductService productService)
    {
        _productService = productService;
    }

    /// <summary>
    /// Get all active products. Supports filtering by category, subcategory, price range, brand IDs, minimum rating, and search term.
    /// Brand IDs can be passed multiple times: ?brandIds=1&amp;brandIds=3
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<ProductResponseDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? category,
        [FromQuery] int? subcategoryId,
        [FromQuery] string? subcategorySlug,
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice,
        [FromQuery] string? search,
        [FromQuery] List<int>? brandIds,
        [FromQuery] double? minRating)
    {
        var products = await _productService.GetAllAsync(
            category, minPrice, maxPrice, search,
            subcategoryId, subcategorySlug,
            brandIds, minRating);
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
}