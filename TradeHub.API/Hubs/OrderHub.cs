using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace TradeHub.API.Hubs;

[Authorize]
public class OrderHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        if (IsAdminUser(Context.User))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "Admins");
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await base.OnDisconnectedAsync(exception);
    }

    public async Task TrackPageChange(string pageUrl)
    {
        // Admins should not track Admins (prevent self-notifications / activity spam)
        if (IsAdminUser(Context.User))
        {
            return;
        }

        var userId = Context.UserIdentifier 
                       ?? Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                       ?? Context.User?.FindFirst("sub")?.Value 
                       ?? "Naməlum";

        var userName = Context.User?.Identity?.Name 
                       ?? Context.User?.FindFirst(ClaimTypes.Name)?.Value 
                       ?? Context.User?.FindFirst(ClaimTypes.Email)?.Value 
                       ?? Context.User?.FindFirst("email")?.Value 
                       ?? "İstifadəçi";

        var activityData = new
        {
            userId = userId,
            userName = userName,
            pageUrl = pageUrl,
            message = $"{userName} səhifəni dəyişdi: {pageUrl}",
            createdAt = DateTime.UtcNow.ToString("o")
        };

        // Broadcast user page activity notification to the Admins group
        await Clients.Group("Admins").SendAsync("UserPageActivity", activityData);
    }

    private static bool IsAdminUser(ClaimsPrincipal? user)
    {
        if (user == null) return false;

        var roleClaim = user.FindFirst(ClaimTypes.Role)?.Value 
                        ?? user.FindFirst("role")?.Value 
                        ?? user.FindFirst("http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;

        var emailClaim = user.FindFirst(ClaimTypes.Email)?.Value 
                         ?? user.FindFirst("email")?.Value;

        return user.IsInRole("Admin")
               || user.IsInRole("admin")
               || string.Equals(roleClaim, "Admin", StringComparison.OrdinalIgnoreCase)
               || string.Equals(roleClaim, "admin", StringComparison.OrdinalIgnoreCase)
               || string.Equals(emailClaim, "admin@vendora.store", StringComparison.OrdinalIgnoreCase)
               || string.Equals(emailClaim, "admin@vendora.com", StringComparison.OrdinalIgnoreCase);
    }
}