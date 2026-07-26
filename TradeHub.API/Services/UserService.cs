using Microsoft.AspNetCore.SignalR;
using TradeHub.API.DTOs.Users;
using TradeHub.API.Hubs;
using TradeHub.API.Models;
using TradeHub.API.Repositories.Interfaces;
using TradeHub.API.Services.Interfaces;

namespace TradeHub.API.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepo;
    private readonly IHubContext<OrderHub> _hubContext;

    public UserService(IUserRepository userRepo, IHubContext<OrderHub> hubContext)
    {
        _userRepo = userRepo;
        _hubContext = hubContext;
    }

    public async Task<IEnumerable<UserResponseDto>> GetAllUsersAsync()
    {
        var users = await _userRepo.GetAllAsync();
        return users.Select(u => new UserResponseDto
        {
            Id = u.Id,
            FullName = u.FullName,
            Email = u.Email,
            Role = u.Role.ToString(),
            CreatedAt = u.CreatedAt,
            Status = "Active"
        });
    }

    public async Task<UserResponseDto> UpdateUserRoleAsync(int userId, string newRole)
    {
        var user = await _userRepo.GetByIdAsync(userId)
            ?? throw new KeyNotFoundException($"User with ID {userId} was not found.");

        // Parse the new role; reject unknown values
        if (!Enum.TryParse<UserRole>(newRole, ignoreCase: true, out var parsedRole))
            throw new ArgumentException($"'{newRole}' is not a valid role. Accepted values: Admin, Vendor, Customer.");

        user.Role = parsedRole;
        await _userRepo.UpdateAsync(user);

        // Send targeted SignalR event to the specific user's active session(s)
        try
        {
            await _hubContext.Clients.User(userId.ToString()).SendAsync("RoleUpdated", new
            {
                userId,
                newRole = parsedRole.ToString(),
                message = "Your account permissions have been updated. Please log in again to apply changes."
            });
        }
        catch
        {
            // SignalR notification failure must never block the role update response
        }

        return new UserResponseDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role.ToString(),
            CreatedAt = user.CreatedAt,
            Status = "Active"
        };
    }
}
