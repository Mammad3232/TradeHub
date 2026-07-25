using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TradeHub.API.DTOs;
using TradeHub.API.DTOs.Brands;
using TradeHub.API.Services.Interfaces;

namespace TradeHub.API.Controllers;

[ApiController]
[Route("api/brands")]
[Produces("application/json")]
public class BrandsController : ControllerBase
{
    private readonly IBrandService _brandService;

    public BrandsController(IBrandService brandService)
    {
        _brandService = brandService;
    }

    /// <summary>Get all brands.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<BrandDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var brands = await _brandService.GetAllAsync();
        return Ok(ApiResponse<IEnumerable<BrandDto>>.Ok(brands));
    }

    /// <summary>Get a brand by ID.</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<BrandDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var brand = await _brandService.GetByIdAsync(id);
        if (brand == null)
            return NotFound(ApiResponse.Fail($"Brand with ID {id} was not found."));

        return Ok(ApiResponse<BrandDto>.Ok(brand));
    }
}
