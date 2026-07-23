using TradeHub.API.Models;

namespace TradeHub.API.Repositories.Interfaces;

public interface IProductRepository
{
    Task<IEnumerable<Product>> GetAllAsync(string? category, decimal? minPrice, decimal? maxPrice, string? search);
    Task<Product?> GetByIdAsync(int id);
    Task<Product> CreateAsync(Product product);
    Task<Product> UpdateAsync(Product product);
    Task SoftDeleteAsync(int id);
}
