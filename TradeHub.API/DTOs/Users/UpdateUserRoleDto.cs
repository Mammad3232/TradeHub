using System.ComponentModel.DataAnnotations;

namespace TradeHub.API.DTOs.Users;

public class UpdateUserRoleDto
{
    [Required]
    public string Role { get; set; } = string.Empty;
}
