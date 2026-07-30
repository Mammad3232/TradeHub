using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TradeHub.API.Data;
using TradeHub.API.DTOs;
using TradeHub.API.DTOs.Account;

namespace TradeHub.API.Controllers;

/// <summary>
/// Endpoints for the currently authenticated user's own profile.
/// GET    /api/account/me                – fetch own profile
/// PUT    /api/account/profile           – update name / phone / location
/// POST   /api/account/change-password  – change password
/// </summary>
[ApiController]
[Route("api/account")]
[Route("api/users")]
[Authorize]
[Produces("application/json")]
public class AccountController : ControllerBase
{
    private readonly AppDbContext _db;

    public AccountController(AppDbContext db) => _db = db;

    // ─── helpers ────────────────────────────────────────────────────────────────

    private int CurrentUserId()
    {
        var claim = User.FindFirst("userId") ?? User.FindFirst(ClaimTypes.NameIdentifier);
        if (claim is null || !int.TryParse(claim.Value, out var id))
            throw new UnauthorizedAccessException("Token is missing the userId claim.");
        return id;
    }

    // ── GET /api/account/me ──────────────────────────────────────────────────────
    [HttpGet("me")]
    public async Task<IActionResult> GetMe()
    {
        var userId = CurrentUserId();
        var user = await _db.Users.FindAsync(userId);
        if (user is null) return NotFound(ApiResponse.Fail("User not found."));

        return Ok(ApiResponse<ProfileDto>.Ok(new ProfileDto
        {
            Id          = user.Id,
            FullName    = user.FullName,
            Email       = user.Email,
            PhoneNumber = user.PhoneNumber,
            Location    = user.Location,
            Role        = user.Role.ToString(),
            CreatedAt   = user.CreatedAt,
            AvatarUrl   = user.AvatarUrl
        }));
    }

    // ── PUT /api/account/profile ─────────────────────────────────────────────────
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
            return BadRequest(ApiResponse.Fail("Validation failed.", errors));
        }

        var userId = CurrentUserId();
        var user = await _db.Users.FindAsync(userId);
        if (user is null) return NotFound(ApiResponse.Fail("User not found."));

        user.FullName    = dto.FullName.Trim();
        user.PhoneNumber = dto.PhoneNumber?.Trim();
        user.Location    = dto.Location?.Trim();

        await _db.SaveChangesAsync();

        return Ok(ApiResponse<ProfileDto>.Ok(new ProfileDto
        {
            Id          = user.Id,
            FullName    = user.FullName,
            Email       = user.Email,
            PhoneNumber = user.PhoneNumber,
            Location    = user.Location,
            Role        = user.Role.ToString(),
            CreatedAt   = user.CreatedAt,
            AvatarUrl   = user.AvatarUrl
        }, "Profile updated successfully."));
    }

    // ── POST /api/account/avatar ────────────────────────────────────────────────
    /// <summary>Upload and update user profile picture.</summary>
    [HttpPost("avatar")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadAvatar(IFormFile file, [FromServices] IWebHostEnvironment env)
    {
        if (file == null || file.Length == 0)
            return BadRequest(ApiResponse.Fail("Please select an image file to upload."));

        const long maxFileSize = 5 * 1024 * 1024; // 5 MB
        if (file.Length > maxFileSize)
            return BadRequest(ApiResponse.Fail("Avatar file size cannot exceed 5MB."));

        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(extension))
            return BadRequest(ApiResponse.Fail("Invalid image format. Allowed formats: .jpg, .jpeg, .png, .webp"));

        var userId = CurrentUserId();
        var user = await _db.Users.FindAsync(userId);
        if (user is null) return NotFound(ApiResponse.Fail("User not found."));

        var uploadsFolder = Path.Combine(env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads", "avatars");
        if (!Directory.Exists(uploadsFolder))
        {
            Directory.CreateDirectory(uploadsFolder);
        }

        var uniqueFileName = $"user_{userId}_{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(uploadsFolder, uniqueFileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        user.AvatarUrl = $"/uploads/avatars/{uniqueFileName}";
        await _db.SaveChangesAsync();

        return Ok(ApiResponse<ProfileDto>.Ok(new ProfileDto
        {
            Id          = user.Id,
            FullName    = user.FullName,
            Email       = user.Email,
            PhoneNumber = user.PhoneNumber,
            Location    = user.Location,
            Role        = user.Role.ToString(),
            CreatedAt   = user.CreatedAt,
            AvatarUrl   = user.AvatarUrl
        }, "Profile picture updated successfully."));
    }

    // ── DELETE /api/account/avatar ─────────────────────────────────────────────
    /// <summary>Remove user profile picture (reverts to default initials).</summary>
    [HttpDelete("avatar")]
    public async Task<IActionResult> DeleteAvatar()
    {
        var userId = CurrentUserId();
        var user = await _db.Users.FindAsync(userId);
        if (user is null) return NotFound(ApiResponse.Fail("User not found."));

        user.AvatarUrl = null;
        await _db.SaveChangesAsync();

        return Ok(ApiResponse<ProfileDto>.Ok(new ProfileDto
        {
            Id          = user.Id,
            FullName    = user.FullName,
            Email       = user.Email,
            PhoneNumber = user.PhoneNumber,
            Location    = user.Location,
            Role        = user.Role.ToString(),
            CreatedAt   = user.CreatedAt,
            AvatarUrl   = null
        }, "Profile picture removed successfully."));
    }

    // ── POST /api/account/change-password ────────────────────────────────────────
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
            return BadRequest(ApiResponse.Fail("Validation failed.", errors));
        }

        var userId = CurrentUserId();
        var user = await _db.Users.FindAsync(userId);
        if (user is null) return NotFound(ApiResponse.Fail("User not found."));

        // Verify current password
        if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
            return BadRequest(ApiResponse.Fail("Current password is incorrect."));

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword, 11);
        await _db.SaveChangesAsync();

        return Ok(ApiResponse.Ok("Password changed successfully."));
    }

    private static readonly System.Collections.Concurrent.ConcurrentDictionary<int, UserPreferencesDto> _userPreferences = new();

    // ── GET /api/account/preferences ─────────────────────────────────────────────
    [HttpGet("preferences")]
    public IActionResult GetPreferences()
    {
        var userId = CurrentUserId();
        if (!_userPreferences.TryGetValue(userId, out var prefs))
        {
            prefs = new UserPreferencesDto();
            _userPreferences[userId] = prefs;
        }
        return Ok(ApiResponse<UserPreferencesDto>.Ok(prefs));
    }

    // ── PUT /api/account/preferences ─────────────────────────────────────────────
    [HttpPut("preferences")]
    public IActionResult UpdatePreferences([FromBody] UserPreferencesDto dto)
    {
        var userId = CurrentUserId();
        _userPreferences[userId] = dto;
        return Ok(ApiResponse<UserPreferencesDto>.Ok(dto, "Preferences saved successfully."));
    }

    // ── DELETE /api/account/me ───────────────────────────────────────────────────
    [HttpDelete("me")]
    public async Task<IActionResult> DeleteMe()
    {
        var userId = CurrentUserId();
        var user = await _db.Users.Include(u => u.Addresses).FirstOrDefaultAsync(u => u.Id == userId);
        if (user is null) return NotFound(ApiResponse.Fail("User account not found."));

        if (user.Addresses.Count > 0)
        {
            _db.Addresses.RemoveRange(user.Addresses);
        }

        _db.Users.Remove(user);
        await _db.SaveChangesAsync();

        _userPreferences.TryRemove(userId, out _);

        return Ok(ApiResponse.Ok("Account permanently deleted."));
    }
}
