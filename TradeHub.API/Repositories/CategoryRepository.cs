using Microsoft.EntityFrameworkCore;
using TradeHub.API.Data;
using TradeHub.API.Models;
using TradeHub.API.Repositories.Interfaces;

namespace TradeHub.API.Repositories;

public class CategoryRepository : ICategoryRepository
{
    private readonly AppDbContext _db;

    public CategoryRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<Category>> GetAllAsync()
        => await _db.Categories
            .Include(c => c.Products.Where(p => p.IsActive))
            .ToListAsync();

    public async Task<Category?> GetByIdAsync(int id)
        => await _db.Categories.FindAsync(id);

    public async Task<Category> CreateAsync(Category category)
    {
        _db.Categories.Add(category);
        await _db.SaveChangesAsync();
        return category;
    }

    public async Task<bool> NameExistsAsync(string name)
        => await _db.Categories.AnyAsync(c => c.Name.ToLower() == name.ToLower());
}
