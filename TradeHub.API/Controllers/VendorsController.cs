using Microsoft.AspNetCore.Mvc;
using TradeHub.API.Data;
using TradeHub.API.DTOs;
using TradeHub.API.Models;
using Microsoft.EntityFrameworkCore;

namespace TradeHub.API.Controllers;

[ApiController]
[Route("api/vendors")]
[Produces("application/json")]
public class VendorsController : ControllerBase
{
    private readonly AppDbContext _context;

    // Static list holding submitted merchant applications across requests
    private static readonly List<VendorResponseDto> _vendorApplications = new()
    {
        new VendorResponseDto { Id = 1, StoreName = "Baku Tech Hub", Owner = "Rashad Guliyev", Email = "info@bakutech.az", Products = 48, TotalSales = 42150.00m, Status = "Active" },
        new VendorResponseDto { Id = 2, StoreName = "Saray Boutique", Owner = "Nigar Musayeva", Email = "saray@boutique.com", Products = 94, TotalSales = 28900.50m, Status = "Active" },
        new VendorResponseDto { Id = 3, StoreName = "Caspian Art Gallery", Owner = "Kamran Alizade", Email = "caspian@art.com", Products = 22, TotalSales = 9400.00m, Status = "Pending" },
        new VendorResponseDto { Id = 4, StoreName = "SoundCore Baku", Owner = "Nicat Mammadov", Email = "soundcore@baku.az", Products = 31, TotalSales = 63200.00m, Status = "Active" },
        new VendorResponseDto { Id = 5, StoreName = "Nordic Furniture", Owner = "Farid Ibrahimov", Email = "nordic@home.az", Products = 15, TotalSales = 0.00m, Status = "Suspended" }
    };

    public VendorsController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// GET /api/vendors
    /// Returns ALL vendors (including Pending, Active, Suspended) for Admin Panel directory.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<VendorResponseDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var dbUsers = await _context.Users
            .Where(u => u.Role == UserRole.Vendor)
            .ToListAsync();

        var list = new List<VendorResponseDto>(_vendorApplications);

        foreach (var user in dbUsers)
        {
            if (!list.Any(v => v.Email.Equals(user.Email, StringComparison.OrdinalIgnoreCase)))
            {
                list.Add(new VendorResponseDto
                {
                    Id = user.Id,
                    StoreName = user.FullName,
                    Owner = user.FullName,
                    Email = user.Email,
                    Products = 0,
                    TotalSales = 0,
                    Status = "Active"
                });
            }
        }

        return Ok(ApiResponse<IEnumerable<VendorResponseDto>>.Ok(list));
    }

    /// <summary>
    /// POST /api/vendors/apply
    /// Receives merchant application from Become a Vendor form and saves with default status "Pending".
    /// </summary>
    [HttpPost("apply")]
    [ProducesResponseType(typeof(ApiResponse<VendorResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    public IActionResult Apply([FromBody] VendorApplyDto dto)
    {
        if (dto is null || string.IsNullOrWhiteSpace(dto.BusinessName))
        {
            return BadRequest(ApiResponse.Fail("Invalid application data."));
        }

        // Check for duplicate Email or Tax ID (VÖEN)
        if (!string.IsNullOrWhiteSpace(dto.Email) && _vendorApplications.Any(v => v.Email.Equals(dto.Email, StringComparison.OrdinalIgnoreCase)))
        {
            return Conflict(ApiResponse.Fail("This Email is already registered with another vendor application."));
        }

        if (!string.IsNullOrWhiteSpace(dto.TaxId) && _vendorApplications.Any(v => !string.IsNullOrEmpty(v.TaxId) && v.TaxId == dto.TaxId))
        {
            return Conflict(ApiResponse.Fail("This Tax ID (VÖEN) is already registered with another vendor application."));
        }

        var newVendor = new VendorResponseDto
        {
            Id = (int)(DateTime.UtcNow.Ticks % 1000000),
            StoreName = dto.BusinessName,
            Owner = dto.LegalName,
            Email = dto.Email,
            Phone = dto.Phone,
            TaxId = dto.TaxId,
            Products = 0,
            TotalSales = 0,
            Status = "Pending" // Defaults to Pending status
        };

        _vendorApplications.Insert(0, newVendor);

        return Ok(ApiResponse<VendorResponseDto>.Ok(newVendor, "Vendor application submitted successfully with status Pending."));
    }

    /// <summary>
    /// PUT /api/vendors/{id}/status
    /// Updates a vendor's status (e.g. Approve "Pending" -> "Active").
    /// </summary>
    [HttpPut("{id:int}/status")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateVendorStatusDto dto)
    {
        var item = _vendorApplications.FirstOrDefault(v => v.Id == id);
        if (item != null)
        {
            item.Status = dto.Status;
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id);
        if (user != null && dto.Status == "Active")
        {
            user.Role = UserRole.Vendor;
            await _context.SaveChangesAsync();
        }

        return Ok(ApiResponse.Ok($"Vendor status updated to '{dto.Status}' successfully."));
    }
}

public class VendorApplyDto
{
    public string BusinessName { get; set; } = string.Empty;
    public string LegalName { get; set; } = string.Empty;
    public string TaxId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
}

public class VendorResponseDto
{
    public int Id { get; set; }
    public string StoreName { get; set; } = string.Empty;
    public string Owner { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? TaxId { get; set; }
    public int Products { get; set; }
    public decimal TotalSales { get; set; }
    public string Status { get; set; } = "Pending";
}

public class UpdateVendorStatusDto
{
    public string Status { get; set; } = "Active";
}
