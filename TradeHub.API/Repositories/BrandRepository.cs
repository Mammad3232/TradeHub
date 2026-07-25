using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TradeHub.API.Data;
using TradeHub.API.Models;
using TradeHub.API.Repositories.Interfaces;

namespace TradeHub.API.Repositories;

public class BrandRepository : IBrandRepository
{
    private readonly AppDbContext _db;

    public BrandRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<Brand>> GetAllAsync()
    {
        return await _db.Brands.OrderBy(b => b.Name).ToListAsync();
    }

    public async Task<Brand?> GetByIdAsync(int id)
    {
        return await _db.Brands.FindAsync(id);
    }
}
