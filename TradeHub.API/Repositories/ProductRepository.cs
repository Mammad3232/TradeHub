using Microsoft.EntityFrameworkCore;
using TradeHub.API.Data;
using TradeHub.API.Models;
using TradeHub.API.Repositories.Interfaces;

namespace TradeHub.API.Repositories;

public class ProductRepository : IProductRepository
{
    private readonly AppDbContext _db;

    public ProductRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<Product>> GetAllAsync(
        string? category,
        decimal? minPrice,
        decimal? maxPrice,
        string? search,
        int? subcategoryId = null,
        string? subcategorySlug = null,
        IEnumerable<int>? brandIds = null,
        double? minRating = null,
        int? categoryId = null)
    {
        var query = _db.Products
            .Include(p => p.Category)
            .Include(p => p.Subcategory)
            .Include(p => p.Brand)
            .Include(p => p.Reviews)
            .Where(p => p.IsActive)
            .AsQueryable();

        if (categoryId.HasValue)
            query = query.Where(p => p.CategoryId == categoryId.Value);

        if (!string.IsNullOrWhiteSpace(category) && category.ToLower() != "all")
            query = query.Where(p => p.Category.Name.ToLower() == category.ToLower());

        if (subcategoryId.HasValue)
            query = query.Where(p => p.SubcategoryId == subcategoryId.Value);

        if (!string.IsNullOrWhiteSpace(subcategorySlug))
            query = query.Where(p => p.Subcategory != null && p.Subcategory.Slug.ToLower() == subcategorySlug.ToLower());

        if (minPrice.HasValue)
            query = query.Where(p => p.Price >= minPrice.Value);

        if (maxPrice.HasValue)
            query = query.Where(p => p.Price <= maxPrice.Value);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(p => p.Name.ToLower().Contains(term));
        }

        // Filter by one or more Brand IDs (multi-select)
        var brandIdList = brandIds?.ToList();
        if (brandIdList is { Count: > 0 })
            query = query.Where(p => p.BrandId.HasValue && brandIdList.Contains(p.BrandId.Value));

        // Rating filter — based on stored AverageRating of product
        if (minRating.HasValue)
        {
            var floor = minRating.Value;
            query = query.Where(p => p.AverageRating >= floor);
        }

        return await query.OrderByDescending(p => p.CreatedAt).ToListAsync();
    }


    public async Task<Product?> GetByIdAsync(int id)
        => await _db.Products
            .Include(p => p.Category)
            .Include(p => p.Subcategory)
            .Include(p => p.Brand)
            .Include(p => p.Reviews)
            .FirstOrDefaultAsync(p => p.Id == id && p.IsActive);

    public async Task<Product> CreateAsync(Product product)
    {
        _db.Products.Add(product);
        await _db.SaveChangesAsync();
        return product;
    }

    public async Task<Product> UpdateAsync(Product product)
    {
        _db.Products.Update(product);
        await _db.SaveChangesAsync();
        return product;
    }

    public async Task SoftDeleteAsync(int id)
    {
        var product = await _db.Products.FindAsync(id);
        if (product is not null)
        {
            product.IsActive = false;
            await _db.SaveChangesAsync();
        }
    }
}