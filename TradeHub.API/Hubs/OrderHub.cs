using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace TradeHub.API.Hubs;

/// <summary>
/// Real-time hub for order events.
/// - Clients never call methods on this hub; the server only pushes to clients.
/// - On connect, Admin users are placed into the "Admins" SignalR group so that
///   notifications can be targeted exclusively to them.
/// </summary>
[Authorize]
public class OrderHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        // Place Admin users into the shared "Admins" group.
        // ClaimTypes.Role ("http://schemas.microsoft.com/ws/2008/06/identity/claims/role")
        // is what JwtBearer maps the role claim to, so IsInRole works here.
        if (Context.User?.IsInRole("Admin") == true)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "Admins");
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        // ASP.NET Core SignalR automatically removes the connection from all groups
        // on disconnect, but we call base explicitly for correctness.
        await base.OnDisconnectedAsync(exception);
    }
}
