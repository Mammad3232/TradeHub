using TradeHub.API.DTOs.Users;

namespace TradeHub.API.Services.Interfaces;

public interface IUserService
{
    Task<IEnumerable<UserResponseDto>> GetAllUsersAsync();
    Task<UserResponseDto> UpdateUserRoleAsync(int userId, string newRole);
}
