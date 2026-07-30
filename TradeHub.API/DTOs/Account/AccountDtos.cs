using System.ComponentModel.DataAnnotations;

namespace TradeHub.API.DTOs.Account;

/// <summary>Returns the current logged-in user's full profile.</summary>
public class ProfileDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? Location { get; set; }
    public string Role { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string? AvatarUrl { get; set; }
}

/// <summary>Payload for PUT /api/account/profile.</summary>
public class UpdateProfileDto
{
    [Required, MaxLength(150)]
    public string FullName { get; set; } = string.Empty;

    [MaxLength(30)]
    public string? PhoneNumber { get; set; }

    [MaxLength(200)]
    public string? Location { get; set; }
}

/// <summary>Payload for POST /api/account/change-password.</summary>
public class ChangePasswordDto
{
    [Required]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required, MinLength(6)]
    public string NewPassword { get; set; } = string.Empty;
}

/// <summary>Address response shape sent to frontend.</summary>
public class AddressDto
{
    public int Id { get; set; }
    public string Label { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Street { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string PostalCode { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public bool IsPrimary { get; set; }
}

/// <summary>Payload for POST /api/addresses and PUT /api/addresses/{id}.</summary>
public class UpsertAddressDto
{
    [Required(ErrorMessage = "Address label is required (e.g. Home, Office).")]
    [MinLength(2, ErrorMessage = "Address label must be at least 2 characters.")]
    [MaxLength(100, ErrorMessage = "Address label cannot exceed 100 characters.")]
    public string Label { get; set; } = string.Empty;

    [Required(ErrorMessage = "Full name is required.")]
    [MinLength(2, ErrorMessage = "Full name must be at least 2 characters.")]
    [MaxLength(150, ErrorMessage = "Full name cannot exceed 150 characters.")]
    public string FullName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Street address is required.")]
    [MinLength(5, ErrorMessage = "Street address must be at least 5 characters.")]
    [MaxLength(300, ErrorMessage = "Street address cannot exceed 300 characters.")]
    public string Street { get; set; } = string.Empty;

    [Required(ErrorMessage = "City is required.")]
    [MinLength(2, ErrorMessage = "City name must be at least 2 characters.")]
    [MaxLength(100, ErrorMessage = "City cannot exceed 100 characters.")]
    public string City { get; set; } = string.Empty;

    [MaxLength(100, ErrorMessage = "State/Region cannot exceed 100 characters.")]
    public string State { get; set; } = string.Empty;

    [Required(ErrorMessage = "Postal code is required.")]
    [MinLength(3, ErrorMessage = "Postal code must be at least 3 characters.")]
    [MaxLength(20, ErrorMessage = "Postal code cannot exceed 20 characters.")]
    public string PostalCode { get; set; } = string.Empty;

    [Required(ErrorMessage = "Country is required.")]
    [MinLength(2, ErrorMessage = "Country name must be at least 2 characters.")]
    [MaxLength(100, ErrorMessage = "Country cannot exceed 100 characters.")]
    public string Country { get; set; } = string.Empty;

    [MaxLength(30, ErrorMessage = "Phone number cannot exceed 30 characters.")]
    public string? Phone { get; set; }

    public bool IsPrimary { get; set; } = false;
}

public class UserPreferencesDto
{
    public bool OrderUpdates { get; set; } = true;
    public bool PromotionalEmails { get; set; } = false;
    public bool SmsAlerts { get; set; } = true;
    public string Language { get; set; } = "English";
    public string Currency { get; set; } = "USD ($)";
}
