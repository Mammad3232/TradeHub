using Microsoft.EntityFrameworkCore;
using TradeHub.API.Data;
using TradeHub.API.DTOs.Products;
using TradeHub.API.Models;
using TradeHub.API.Services.Interfaces;

namespace TradeHub.API.Services;

public class RecommendationService : IRecommendationService
{
    private readonly AppDbContext _db;

    public RecommendationService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<ProductResponseDto>> GetRecommendationsAsync(int productId)
    {
        // 1. Get current product to verify existence and retrieve CategoryId
        var targetProduct = await _db.Products
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == productId);

        if (targetProduct is null)
        {
            return Enumerable.Empty<ProductResponseDto>();
        }

        const int targetCount = 6;
        var recommendedProducts = new List<Product>();
        var includedProductIds = new HashSet<int> { productId };

        // 2. Co-purchase strategy (Products bought in the same orders)
        // Query hits composite index IX_OrderItems_ProductId_OrderId
        var coPurchasedProductIdsWithCount = await _db.OrderItems
            .AsNoTracking()
            .Where(oi => _db.OrderItems.Where(targetOi => targetOi.ProductId == productId)
                                       .Select(targetOi => targetOi.OrderId)
                                       .Contains(oi.OrderId)
                         && oi.ProductId != productId
                         && oi.Product.IsActive
                         && oi.Product.StockQuantity > 0)
            .GroupBy(oi => oi.ProductId)
            .Select(g => new
            {
                ProductId = g.Key,
                CoOccurrenceCount = g.Count()
            })
            .OrderByDescending(g => g.CoOccurrenceCount)
            .ThenByDescending(g => g.ProductId)
            .Take(targetCount)
            .ToListAsync();

        if (coPurchasedProductIdsWithCount.Count > 0)
        {
            var coProductIds = coPurchasedProductIdsWithCount.Select(c => c.ProductId).ToList();

            var coProducts = await _db.Products
                .AsNoTracking()
                .Include(p => p.Category)
                .Include(p => p.Subcategory)
                .Include(p => p.Brand)
                .Include(p => p.Reviews)
                .Where(p => coProductIds.Contains(p.Id))
                .ToListAsync();

            // Preserve co-purchase ranking order
            foreach (var coItem in coPurchasedProductIdsWithCount)
            {
                var prod = coProducts.FirstOrDefault(p => p.Id == coItem.ProductId);
                if (prod != null)
                {
                    recommendedProducts.Add(prod);
                    includedProductIds.Add(prod.Id);
                }
            }
        }

        // 3. Category Fallback Strategy (Day 3 requirement built right in)
        // Fill remaining slots up to 6 with active, in-stock products from the same category
        if (recommendedProducts.Count < targetCount)
        {
            int remainingNeeded = targetCount - recommendedProducts.Count;

            var categoryFallbackProducts = await _db.Products
                .AsNoTracking()
                .Include(p => p.Category)
                .Include(p => p.Subcategory)
                .Include(p => p.Brand)
                .Include(p => p.Reviews)
                .Where(p => p.CategoryId == targetProduct.CategoryId
                         && p.IsActive
                         && p.StockQuantity > 0
                         && !includedProductIds.Contains(p.Id))
                .OrderByDescending(p => p.CreatedAt)
                .Take(remainingNeeded)
                .ToListAsync();

            foreach (var fallbackProd in categoryFallbackProducts)
            {
                recommendedProducts.Add(fallbackProd);
                includedProductIds.Add(fallbackProd.Id);
            }
        }

        return recommendedProducts.Select(MapToDto);
    }

    public async Task<IEnumerable<ProductResponseDto>> GetRecentlyViewedAsync(string sessionId, int? excludeProductId = null)
    {
        if (string.IsNullOrWhiteSpace(sessionId))
        {
            return Enumerable.Empty<ProductResponseDto>();
        }

        // Fetch distinct recently viewed product IDs for this session ordered by most recent view
        var recentProductIds = await _db.ProductViews
            .AsNoTracking()
            .Where(pv => pv.SessionId == sessionId
                         && (!excludeProductId.HasValue || pv.ProductId != excludeProductId.Value)
                         && pv.Product.IsActive)
            .OrderByDescending(pv => pv.ViewedAt)
            .Select(pv => pv.ProductId)
            .Distinct()
            .Take(8)
            .ToListAsync();

        if (recentProductIds.Count == 0)
        {
            return Enumerable.Empty<ProductResponseDto>();
        }

        var products = await _db.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.Subcategory)
            .Include(p => p.Brand)
            .Include(p => p.Reviews)
            .Where(p => recentProductIds.Contains(p.Id))
            .ToListAsync();

        // Preserve viewed ordering
        var orderedProducts = new List<Product>();
        foreach (var pId in recentProductIds)
        {
            var p = products.FirstOrDefault(x => x.Id == pId);
            if (p != null)
            {
                orderedProducts.Add(p);
            }
        }

        return orderedProducts.Select(MapToDto);
    }

    private static ProductResponseDto MapToDto(Product p) => new()
    {
        Id = p.Id,
        Title = p.Name,
        Description = p.Description,
        Price = p.Price,
        StockQuantity = p.StockQuantity,
        Image = p.ImageUrl,
        CategoryId = p.CategoryId,
        Category = p.Category?.Name ?? string.Empty,
        SubcategoryId = p.SubcategoryId,
        Subcategory = p.Subcategory?.Name,
        SubcategorySlug = p.Subcategory?.Slug,
        BrandId = p.BrandId,
        Brand = p.Brand?.Name,
        Rating = p.Reviews is { Count: > 0 }
            ? Math.Round(p.Reviews.Average(r => (double)r.Rating), 1)
            : 4.5,
        IsActive = p.IsActive,
        CreatedAt = p.CreatedAt,
        LowStockThreshold = p.LowStockThreshold,
    };
}
