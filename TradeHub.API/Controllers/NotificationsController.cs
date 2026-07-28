using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TradeHub.API.Data;
using TradeHub.API.DTOs;
using TradeHub.API.DTOs.Notifications;

namespace TradeHub.API.Controllers;

/// <summary>
/// Admin-only endpoints for reading and dismissing order notifications.
/// GET  /api/notifications          — list all (optionally filter unread only)
/// PUT  /api/notifications/{id}/read — mark a single notification as read
/// PUT  /api/notifications/read-all  — mark all as read
/// </summary>
[ApiController]
[Route("api/notifications")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly AppDbContext _db;

    public NotificationsController(AppDbContext db)
    {
        _db = db;
    }

    // ── GET /api/notifications ─────────────────────────────────────────────────
    // Returns all notifications newest-first.
    // Optional ?unreadOnly=true to fetch only unread rows.
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] bool unreadOnly = false)
    {
        var query = _db.Notifications.AsQueryable();

        if (unreadOnly)
            query = query.Where(n => !n.IsRead);

        var notifications = await query
            .OrderByDescending(n => n.CreatedAt)
            .Select(n => new NotificationDto
            {
                Id               = n.Id,
                Message          = n.Message,
                Type             = n.Type,
                IsRead           = n.IsRead,
                IsResolved       = n.IsResolved,
                CreatedAt        = n.CreatedAt,
                RelatedOrderId   = n.RelatedOrderId,
                RelatedProductId = n.RelatedProductId
            })
            .ToListAsync();

        var unreadCount = await _db.Notifications.CountAsync(n => !n.IsRead);

        return Ok(ApiResponse<object>.Ok(new
        {
            notifications,
            unreadCount
        }));
    }

    // ── PUT /api/notifications/{id}/read ───────────────────────────────────────
    [HttpPut("{id:int}/read")]
    public async Task<IActionResult> MarkRead(int id)
    {
        var notification = await _db.Notifications.FindAsync(id);
        if (notification is null)
            return NotFound(ApiResponse.Fail($"Notification {id} not found."));

        notification.IsRead = true;
        await _db.SaveChangesAsync();

        return Ok(ApiResponse.Ok("Notification marked as read."));
    }

    // ── PUT /api/notifications/read-all ───────────────────────────────────────
    // Convenience endpoint — marks every unread notification as read in one call
    // (used by the "Mark all read" button in the admin bell dropdown).
    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllRead()
    {
        var unread = await _db.Notifications
            .Where(n => !n.IsRead)
            .ToListAsync();

        foreach (var n in unread)
            n.IsRead = true;

        await _db.SaveChangesAsync();

        return Ok(ApiResponse.Ok($"{unread.Count} notification(s) marked as read."));
    }
}
