using Microsoft.AspNetCore.Hosting;
using TradeHub.API.DTOs.Products;
using TradeHub.API.Models;
using TradeHub.API.Repositories.Interfaces;
using TradeHub.API.Services.Interfaces;

namespace TradeHub.API.Services;

public class ProductService : IProductService
{
    private readonly IProductRepository _productRepo;
    private readonly ICategoryRepository _categoryRepo;
    private readonly IWebHostEnvironment _env;

    public ProductService(
        IProductRepository productRepo,
        ICategoryRepository categoryRepo,
        IWebHostEnvironment env)
    {
        _productRepo = productRepo;
        _categoryRepo = categoryRepo;
        _env = env;
    }

    public async Task<IEnumerable<ProductResponseDto>> GetAllAsync(
        string? category, decimal? minPrice, decimal? maxPrice, string? search)
    {
        var products = await _productRepo.GetAllAsync(category, minPrice, maxPrice, search);
        return products.Select(MapToDto);
    }

    public async Task<ProductResponseDto?> GetByIdAsync(int id)
    {
        var product = await _productRepo.GetByIdAsync(id);
        return product is null ? null : MapToDto(product);
    }

    public async Task<ProductResponseDto> CreateAsync(CreateProductDto dto)
    {
        // Validate that the category exists
        var category = await _categoryRepo.GetByIdAsync(dto.CategoryId)
            ?? throw new KeyNotFoundException($"Category with ID {dto.CategoryId} does not exist.");

        string imageUrl = "/uploads/products/placeholder.png";

        if (dto.ImageFile != null && dto.ImageFile.Length > 0)
        {
            const long maxFileSize = 5 * 1024 * 1024; // 5 MB
            if (dto.ImageFile.Length > maxFileSize)
            {
                throw new ArgumentException("Image file size cannot exceed 5MB.");
            }

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            var extension = Path.GetExtension(dto.ImageFile.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(extension))
            {
                throw new ArgumentException("Invalid image file format. Allowed formats: .jpg, .jpeg, .png, .webp");
            }

            var uploadsFolder = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads", "products");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var uniqueFileName = $"{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await dto.ImageFile.CopyToAsync(stream);
            }

            imageUrl = $"/uploads/products/{uniqueFileName}";
        }

        var product = new Product
        {
            Name = dto.Name.Trim(),
            Description = dto.Description?.Trim() ?? string.Empty,
            Price = dto.Price,
            StockQuantity = dto.StockQuantity,
            ImageUrl = imageUrl,
            CategoryId = dto.CategoryId,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _productRepo.CreateAsync(product);
        created.Category = category;   // attach for mapping
        return MapToDto(created);
    }

    public async Task<ProductResponseDto> UpdateAsync(int id, UpdateProductDto dto)
    {
        var product = await _productRepo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Product with ID {id} was not found.");

        // Apply only the fields that were sent (PATCH semantics)
        if (dto.Name is not null)         product.Name = dto.Name.Trim();
        if (dto.Description is not null)  product.Description = dto.Description.Trim();
        if (dto.Price.HasValue)           product.Price = dto.Price.Value;
        if (dto.StockQuantity.HasValue)   product.StockQuantity = dto.StockQuantity.Value;
        if (dto.ImageUrl is not null)     product.ImageUrl = dto.ImageUrl.Trim();
        if (dto.IsActive.HasValue)        product.IsActive = dto.IsActive.Value;

        if (dto.CategoryId.HasValue)
        {
            var category = await _categoryRepo.GetByIdAsync(dto.CategoryId.Value)
                ?? throw new KeyNotFoundException($"Category with ID {dto.CategoryId} does not exist.");
            product.CategoryId = dto.CategoryId.Value;
            product.Category = category;
        }

        var updated = await _productRepo.UpdateAsync(product);
        return MapToDto(updated);
    }

    public async Task DeleteAsync(int id)
    {
        var product = await _productRepo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Product with ID {id} was not found.");

        await _productRepo.SoftDeleteAsync(product.Id);
    }

    // ── Mapping ────────────────────────────────────────────────────────────────

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
        Rating = 4.5,   // placeholder until review system is built
        IsActive = p.IsActive,
        CreatedAt = p.CreatedAt
    };
}
