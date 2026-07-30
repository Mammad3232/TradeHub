using TradeHub.API.DTOs.Products;

namespace TradeHub.API.Services.Interfaces;

public interface IRecommendationService
{
    /// <summary>
    /// Returns 4-6 recommended products for a given productId using:
    /// 1. Co-purchase history (products bought together in past orders).
    /// 2. Category fallback (in-stock, active products in the same category) if co-purchases are under 6.
    /// </summary>
    Task<IEnumerable<ProductResponseDto>> GetRecommendationsAsync(int productId);

    /// <summary>
    /// Returns the last 5-8 distinct products viewed by a given SessionId.
    /// Excludes current product if excludeProductId is provided.
    /// </summary>
    Task<IEnumerable<ProductResponseDto>> GetRecentlyViewedAsync(string sessionId, int? excludeProductId = null);
}
