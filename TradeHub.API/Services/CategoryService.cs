using TradeHub.API.DTOs.Categories;
using TradeHub.API.Models;
using TradeHub.API.Repositories.Interfaces;
using TradeHub.API.Services.Interfaces;

namespace TradeHub.API.Services;

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _categoryRepo;

    public CategoryService(ICategoryRepository categoryRepo)
    {
        _categoryRepo = categoryRepo;
    }

    public async Task<IEnumerable<CategoryResponseDto>> GetAllAsync()
    {
        var categories = await _categoryRepo.GetAllAsync();
        return categories.Select(c => new CategoryResponseDto
        {
            Id = c.Id,
            Name = c.Name,
            ProductCount = c.Products.Count(p => p.IsActive),
            Subcategories = c.Subcategories.Select(s => new SubcategoryResponseDto
            {
                Id = s.Id,
                Name = s.Name,
                Slug = s.Slug,
                CategoryId = s.CategoryId
            }).ToList()
        });
    }

    public async Task<CategoryResponseDto> CreateAsync(CreateCategoryDto dto)
    {
        if (await _categoryRepo.NameExistsAsync(dto.Name))
            throw new InvalidOperationException($"A category named '{dto.Name}' already exists.");

        var category = new Category { Name = dto.Name.Trim() };
        var created = await _categoryRepo.CreateAsync(category);

        return new CategoryResponseDto
        {
            Id = created.Id,
            Name = created.Name,
            ProductCount = 0,
            Subcategories = new()
        };
    }

    public async Task<IEnumerable<SubcategoryResponseDto>> GetSubcategoriesByCategoryIdAsync(int categoryId)
    {
        var subcategories = await _categoryRepo.GetSubcategoriesByCategoryIdAsync(categoryId);
        return subcategories.Select(s => new SubcategoryResponseDto
        {
            Id = s.Id,
            Name = s.Name,
            Slug = s.Slug,
            CategoryId = s.CategoryId
        });
    }
}