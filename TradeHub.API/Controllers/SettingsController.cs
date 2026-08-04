using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TradeHub.API.Data;
using TradeHub.API.Models;

namespace TradeHub.API.Controllers;

public class UpdateSettingsRequest
{
    public string SiteName { get; set; } = "Vendora";
    public string? SupportEmail { get; set; } = "support@vendora.store";
    public double CommissionRate { get; set; } = 5;
    public bool MaintenanceMode { get; set; } = false;
    public bool RequireTwoFactor { get; set; } = true;
    public IFormFile? Logo { get; set; }
    public IFormFile? Favicon { get; set; }
}

[ApiController]
[Route("api/admin/settings")]
[Route("api/settings")]
public class SettingsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IWebHostEnvironment _env;

    public SettingsController(AppDbContext db, IWebHostEnvironment env)
    {
        _db = db;
        _env = env;
    }

    private async Task<SiteSetting> GetOrCreateSettingsAsync()
    {
        var setting = await _db.SiteSettings.FirstOrDefaultAsync();
        if (setting == null)
        {
            setting = new SiteSetting
            {
                SiteName = "Vendora",
                SupportEmail = "support@vendora.store",
                CommissionRate = 5,
                MaintenanceMode = false,
                RequireTwoFactor = true,
                UpdatedAt = DateTime.UtcNow
            };
            _db.SiteSettings.Add(setting);
            await _db.SaveChangesAsync();
        }
        return setting;
    }

    private async Task<string> SaveFileAsync(IFormFile file, string prefix)
    {
        var webRootPath = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        var uploadsFolder = Path.Combine(webRootPath, "uploads", "site-identity");

        if (!Directory.Exists(uploadsFolder))
        {
            Directory.CreateDirectory(uploadsFolder);
        }

        var extension = Path.GetExtension(file.FileName);
        var fileName = $"{prefix}_{Guid.NewGuid():N}{extension}";
        var filePath = Path.Combine(uploadsFolder, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        return $"/uploads/site-identity/{fileName}";
    }

    // ── GET /api/admin/settings or /api/settings ─────────────────────────────
    [HttpGet]
    public async Task<IActionResult> GetSettings()
    {
        var settings = await GetOrCreateSettingsAsync();
        return Ok(settings);
    }

    // ── POST /api/admin/settings/upload-logo ───────────────────────────────
    [HttpPost("upload-logo")]
    public async Task<IActionResult> UploadLogo([FromForm] IFormFile? file, [FromForm] IFormFile? logo)
    {
        var targetFile = file ?? logo ?? Request.Form.Files.FirstOrDefault();
        if (targetFile == null || targetFile.Length == 0)
        {
            return BadRequest(new { message = "No image file provided." });
        }

        var logoUrl = await SaveFileAsync(targetFile, "logo");
        var settings = await GetOrCreateSettingsAsync();
        settings.LogoUrl = logoUrl;
        settings.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = "Logo uploaded successfully.",
            logoUrl = logoUrl,
            settings
        });
    }

    // ── POST /api/admin/settings/upload-favicon ────────────────────────────
    [HttpPost("upload-favicon")]
    public async Task<IActionResult> UploadFavicon([FromForm] IFormFile? file, [FromForm] IFormFile? favicon)
    {
        var targetFile = file ?? favicon ?? Request.Form.Files.FirstOrDefault();
        if (targetFile == null || targetFile.Length == 0)
        {
            return BadRequest(new { message = "No favicon file provided." });
        }

        var faviconUrl = await SaveFileAsync(targetFile, "favicon");
        var settings = await GetOrCreateSettingsAsync();
        settings.FaviconUrl = faviconUrl;
        settings.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = "Favicon uploaded successfully.",
            faviconUrl = faviconUrl,
            settings
        });
    }

    // ── POST /api/admin/settings/remove-logo ───────────────────────────────
    [HttpPost("remove-logo")]
    [HttpDelete("logo")]
    public async Task<IActionResult> RemoveLogo()
    {
        var settings = await GetOrCreateSettingsAsync();
        settings.LogoUrl = null;
        settings.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = "Logo removed successfully.",
            settings
        });
    }

    // ── POST /api/admin/settings/remove-favicon ────────────────────────────
    [HttpPost("remove-favicon")]
    [HttpDelete("favicon")]
    public async Task<IActionResult> RemoveFavicon()
    {
        var settings = await GetOrCreateSettingsAsync();
        settings.FaviconUrl = null;
        settings.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = "Favicon removed successfully.",
            settings
        });
    }

    // ── POST /api/admin/settings or PUT /api/admin/settings ────────────────
    [HttpPost]
    [HttpPut]
    public async Task<IActionResult> UpdateSettings([FromForm] UpdateSettingsRequest request)
    {
        var settings = await GetOrCreateSettingsAsync();

        settings.SiteName = request.SiteName ?? settings.SiteName;
        settings.SupportEmail = request.SupportEmail ?? settings.SupportEmail;
        settings.CommissionRate = request.CommissionRate;
        settings.MaintenanceMode = request.MaintenanceMode;
        settings.RequireTwoFactor = request.RequireTwoFactor;

        if (request.Logo != null && request.Logo.Length > 0)
        {
            settings.LogoUrl = await SaveFileAsync(request.Logo, "logo");
        }

        if (request.Favicon != null && request.Favicon.Length > 0)
        {
            settings.FaviconUrl = await SaveFileAsync(request.Favicon, "favicon");
        }

        settings.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(settings);
    }
}
