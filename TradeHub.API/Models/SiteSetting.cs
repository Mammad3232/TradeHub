namespace TradeHub.API.Models;

public class SiteSetting
{
    public int Id { get; set; }
    public string SiteName { get; set; } = "Vendora";
    public string? SupportEmail { get; set; } = "support@vendora.store";
    public double CommissionRate { get; set; } = 5;
    public bool MaintenanceMode { get; set; } = false;
    public bool RequireTwoFactor { get; set; } = true;
    public string? LogoUrl { get; set; }
    public string? FaviconUrl { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
