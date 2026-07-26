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
    private readonly IBrandRepository _brandRepo;
    private readonly IWebHostEnvironment _env;
    private readonly IStockAlertService _stockAlertService;

    public ProductService(
        IProductRepository productRepo,
        ICategoryRepository categoryRepo,
        IBrandRepository brandRepo,
        IWebHostEnvironment env,
        IStockAlertService stockAlertService)
    {
        _productRepo = productRepo;
        _categoryRepo = categoryRepo;
        _brandRepo = brandRepo;
        _env = env;
        _stockAlertService = stockAlertService;
    }

    public async Task<IEnumerable<ProductResponseDto>> GetAllAsync(
        string? category,
        decimal? minPrice,
        decimal? maxPrice,
        string? search,
        int? subcategoryId = null,
        string? subcategorySlug = null,
        IEnumerable<int>? brandIds = null,
        double? minRating = null)
    {
        var products = await _productRepo.GetAllAsync(
            category, minPrice, maxPrice, search,
            subcategoryId, subcategorySlug,
            brandIds, minRating);
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

        // Validate subcategory if passed
        Subcategory? subcategory = null;
        if (dto.SubcategoryId.HasValue)
        {
            subcategory = category.Subcategories.FirstOrDefault(s => s.Id == dto.SubcategoryId.Value);
            if (subcategory is null)
            {
                throw new KeyNotFoundException($"Subcategory with ID {dto.SubcategoryId.Value} does not exist in Category '{category.Name}'.");
            }
        }

        // Validate brand if passed
        Brand? brand = null;
        if (dto.BrandId.HasValue)
        {
            brand = await _brandRepo.GetByIdAsync(dto.BrandId.Value)
                ?? throw new KeyNotFoundException($"Brand with ID {dto.BrandId.Value} does not exist.");
        }

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
            SubcategoryId = dto.SubcategoryId,
            BrandId = dto.BrandId,
            LowStockThreshold = dto.LowStockThreshold > 0 ? dto.LowStockThreshold : null,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _productRepo.CreateAsync(product);
        created.Category = category;
        created.Subcategory = subcategory;
        created.Brand = brand;
        return MapToDto(created);
    }

    public async Task<ProductResponseDto> UpdateAsync(int id, UpdateProductDto dto)
    {
        var product = await _productRepo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Product with ID {id} was not found.");

        if (dto.Name is not null)         product.Name = dto.Name.Trim();
        if (dto.Description is not null)  product.Description = dto.Description.Trim();
        if (dto.Price.HasValue)           product.Price = dto.Price.Value;
        if (dto.StockQuantity.HasValue)   product.StockQuantity = dto.StockQuantity.Value;
        if (dto.ImageUrl is not null)     product.ImageUrl = dto.ImageUrl.Trim();
        if (dto.IsActive.HasValue)        product.IsActive = dto.IsActive.Value;

        // LowStockThreshold: explicit 0 disables alerts (stored as null); positive value sets threshold.
        if (dto.LowStockThreshold.HasValue)
            product.LowStockThreshold = dto.LowStockThreshold.Value > 0 ? dto.LowStockThreshold : null;

        if (dto.CategoryId.HasValue)
        {
            var category = await _categoryRepo.GetByIdAsync(dto.CategoryId.Value)
                ?? throw new KeyNotFoundException($"Category with ID {dto.CategoryId} does not exist.");
            product.CategoryId = dto.CategoryId.Value;
            product.Category = category;
        }

        if (dto.SubcategoryId.HasValue)
        {
            product.SubcategoryId = dto.SubcategoryId.Value;
        }

        if (dto.BrandId.HasValue)
        {
            var brand = await _brandRepo.GetByIdAsync(dto.BrandId.Value)
                ?? throw new KeyNotFoundException($"Brand with ID {dto.BrandId.Value} does not exist.");
            product.BrandId = dto.BrandId.Value;
            product.Brand = brand;
        }

        var updated = await _productRepo.UpdateAsync(product);

        // After saving, evaluate whether a low-stock alert should fire OR be resolved.
        // Non-blocking — a SignalR failure must never roll back the admin's product update.
        _ = _stockAlertService.CheckAndNotifyAsync(updated);

        return MapToDto(updated);
    }

    public async Task DeleteAsync(int id)
    {
        var product = await _productRepo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Product with ID {id} was not found.");

        await _productRepo.SoftDeleteAsync(product.Id);
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
        // Compute real average from reviews; fall back to 4.5 if no reviews yet
        Rating = p.Reviews is { Count: > 0 }
            ? Math.Round(p.Reviews.Average(r => (double)r.Rating), 1)
            : 4.5,
        IsActive = p.IsActive,
        CreatedAt = p.CreatedAt,
        LowStockThreshold = p.LowStockThreshold,
    };
}