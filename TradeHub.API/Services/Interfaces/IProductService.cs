using TradeHub.API.DTOs.Products;

namespace TradeHub.API.Services.Interfaces;

public interface IProductService
{
    Task<IEnumerable<ProductResponseDto>> GetAllAsync(
        string? category,
        decimal? minPrice,
        decimal? maxPrice,
        string? search,
        int? subcategoryId = null,
        string? subcategorySlug = null,
        IEnumerable<int>? brandIds = null,
        double? minRating = null,
        int? categoryId = null);
    Task<ProductResponseDto?> GetByIdAsync(int id);
    Task<ProductResponseDto> CreateAsync(CreateProductDto dto);
    Task<ProductResponseDto> UpdateAsync(int id, UpdateProductDto dto);
    Task DeleteAsync(int id);
    Task<ProductResponseDto> AddReviewAsync(int productId, int userId, TradeHub.API.DTOs.Reviews.CreateReviewDto dto);
}