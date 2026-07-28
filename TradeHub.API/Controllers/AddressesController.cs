using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TradeHub.API.Data;
using TradeHub.API.DTOs;
using TradeHub.API.DTOs.Account;
using TradeHub.API.Models;

namespace TradeHub.API.Controllers;

/// <summary>
/// Full CRUD for the authenticated user's shipping/billing addresses.
/// GET    /api/addresses          – list all addresses for current user
/// POST   /api/addresses          – create new address
/// PUT    /api/addresses/{id}     – update existing address
/// DELETE /api/addresses/{id}     – delete address
/// PUT    /api/addresses/{id}/primary – set as primary
/// </summary>
[ApiController]
[Route("api/addresses")]
[Authorize]
[Produces("application/json")]
public class AddressesController : ControllerBase
{
    private readonly AppDbContext _db;

    public AddressesController(AppDbContext db) => _db = db;

    private int CurrentUserId()
    {
        var claim = User.FindFirst("userId") ?? User.FindFirst(ClaimTypes.NameIdentifier);
        if (claim is null || !int.TryParse(claim.Value, out var id))
            throw new UnauthorizedAccessException("Token is missing the userId claim.");
        return id;
    }

    private static AddressDto Map(Address a) => new()
    {
        Id         = a.Id,
        Label      = a.Label,
        FullName   = a.FullName,
        Street     = a.Street,
        City       = a.City,
        State      = a.State,
        PostalCode = a.PostalCode,
        Country    = a.Country,
        Phone      = a.Phone,
        IsPrimary  = a.IsPrimary,
    };

    // ── GET /api/addresses ───────────────────────────────────────────────────────
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = CurrentUserId();
        var addresses = await _db.Addresses
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.IsPrimary)
            .ThenByDescending(a => a.CreatedAt)
            .Select(a => Map(a))
            .ToListAsync();

        return Ok(ApiResponse<IEnumerable<AddressDto>>.Ok(addresses));
    }

    // ── POST /api/addresses ──────────────────────────────────────────────────────
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] UpsertAddressDto dto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .Where(msg => !string.IsNullOrWhiteSpace(msg))
                .ToList();

            var message = errors.Count > 0 ? string.Join(" ", errors) : "Validation failed.";
            return BadRequest(ApiResponse.Fail(message, errors));
        }

        var userId = CurrentUserId();

        // If this is primary, unset all others
        if (dto.IsPrimary)
        {
            var existing = await _db.Addresses.Where(a => a.UserId == userId && a.IsPrimary).ToListAsync();
            existing.ForEach(a => a.IsPrimary = false);
        }

        var address = new Address
        {
            UserId     = userId,
            Label      = dto.Label.Trim(),
            FullName   = dto.FullName.Trim(),
            Street     = dto.Street.Trim(),
            City       = dto.City.Trim(),
            State      = dto.State.Trim(),
            PostalCode = dto.PostalCode.Trim(),
            Country    = dto.Country.Trim(),
            Phone      = dto.Phone?.Trim(),
            IsPrimary  = dto.IsPrimary,
            CreatedAt  = DateTime.UtcNow,
        };

        _db.Addresses.Add(address);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAll), Map(address));
    }

    // ── PUT /api/addresses/{id} ──────────────────────────────────────────────────
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpsertAddressDto dto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .Where(msg => !string.IsNullOrWhiteSpace(msg))
                .ToList();

            var message = errors.Count > 0 ? string.Join(" ", errors) : "Validation failed.";
            return BadRequest(ApiResponse.Fail(message, errors));
        }

        var userId = CurrentUserId();
        var address = await _db.Addresses.FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);
        if (address is null) return NotFound(ApiResponse.Fail($"Address {id} not found."));

        // If marking as primary, clear existing primary
        if (dto.IsPrimary && !address.IsPrimary)
        {
            var others = await _db.Addresses.Where(a => a.UserId == userId && a.IsPrimary && a.Id != id).ToListAsync();
            others.ForEach(a => a.IsPrimary = false);
        }

        address.Label      = dto.Label.Trim();
        address.FullName   = dto.FullName.Trim();
        address.Street     = dto.Street.Trim();
        address.City       = dto.City.Trim();
        address.State      = dto.State.Trim();
        address.PostalCode = dto.PostalCode.Trim();
        address.Country    = dto.Country.Trim();
        address.Phone      = dto.Phone?.Trim();
        address.IsPrimary  = dto.IsPrimary;

        await _db.SaveChangesAsync();
        return Ok(ApiResponse<AddressDto>.Ok(Map(address), "Address updated."));
    }

    // ── DELETE /api/addresses/{id} ───────────────────────────────────────────────
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = CurrentUserId();
        var address = await _db.Addresses.FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);
        if (address is null) return NotFound(ApiResponse.Fail($"Address {id} not found."));

        _db.Addresses.Remove(address);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse.Ok("Address deleted."));
    }

    // ── PUT /api/addresses/{id}/primary ─────────────────────────────────────────
    [HttpPut("{id:int}/primary")]
    public async Task<IActionResult> SetPrimary(int id)
    {
        var userId = CurrentUserId();
        var addresses = await _db.Addresses.Where(a => a.UserId == userId).ToListAsync();
        var target = addresses.FirstOrDefault(a => a.Id == id);
        if (target is null) return NotFound(ApiResponse.Fail($"Address {id} not found."));

        addresses.ForEach(a => a.IsPrimary = a.Id == id);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse.Ok("Primary address updated."));
    }
}
