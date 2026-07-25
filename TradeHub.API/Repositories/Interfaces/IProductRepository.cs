using TradeHub.API.Models;

namespace TradeHub.API.Repositories.Interfaces;

public interface IProductRepository
{
    Task<IEnumerable<Product>> GetAllAsync(
        string? category,
        decimal? minPrice,
        decimal? maxPrice,
        string? search,
        int? subcategoryId = null,
        string? subcategorySlug = null,
        IEnumerable<int>? brandIds = null,
        double? minRating = null);
    Task<Product?> GetByIdAsync(int id);
    Task<Product> CreateAsync(Product product);
    Task<Product> UpdateAsync(Product product);
    Task SoftDeleteAsync(int id);
}