using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TradeHub.API.Data;
using TradeHub.API.DTOs;
using TradeHub.API.Models;

namespace TradeHub.API.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize(Roles = "Admin")]
[Produces("application/json")]
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _db;

    public DashboardController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("stats")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStats()
    {
        var totalSales = await _db.Orders
            .Where(o => o.Status != OrderStatus.Cancelled)
            .SumAsync(o => (decimal?)o.TotalPrice) ?? 0m;

        var totalOrders = await _db.Orders.CountAsync();
        var totalUsers = await _db.Users.CountAsync();
        var totalProducts = await _db.Products.CountAsync(p => p.IsActive);

        // Sales by day (last 7 days)
        var sevenDaysAgo = DateTime.UtcNow.Date.AddDays(-6);
        var recentOrders = await _db.Orders
            .Where(o => o.OrderDate >= sevenDaysAgo && o.Status != OrderStatus.Cancelled)
            .ToListAsync();

        var salesByDay = Enumerable.Range(0, 7).Select(i =>
        {
            var date = sevenDaysAgo.AddDays(i);
            var dayName = date.ToString("ddd");
            var dayTotal = recentOrders
                .Where(o => o.OrderDate.Date == date)
                .Sum(o => o.TotalPrice);

            return new { day = dayName, total = dayTotal };
        });

        // Category distribution
        var categoryStats = await _db.Categories
            .Select(c => new
            {
                category = c.Name,
                count = c.Products.Count(p => p.IsActive)
            })
            .ToListAsync();

        return Ok(ApiResponse<object>.Ok(new
        {
            totalSales,
            totalOrders,
            totalUsers,
            totalProducts,
            salesByDay,
            categoryStats
        }));
    }
}
