using TradeHub.API.DTOs.Categories;

namespace TradeHub.API.Services.Interfaces;

public interface ICategoryService
{
    Task<IEnumerable<CategoryResponseDto>> GetAllAsync();
    Task<CategoryResponseDto> CreateAsync(CreateCategoryDto dto);
}
