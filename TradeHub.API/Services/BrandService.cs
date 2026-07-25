using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TradeHub.API.DTOs.Brands;
using TradeHub.API.Repositories.Interfaces;
using TradeHub.API.Services.Interfaces;

namespace TradeHub.API.Services;

public class BrandService : IBrandService
{
    private readonly IBrandRepository _brandRepository;

    public BrandService(IBrandRepository brandRepository)
    {
        _brandRepository = brandRepository;
    }

    public async Task<IEnumerable<BrandDto>> GetAllAsync()
    {
        var brands = await _brandRepository.GetAllAsync();
        return brands.Select(b => new BrandDto
        {
            Id = b.Id,
            Name = b.Name,
            LogoUrl = b.LogoUrl
        });
    }

    public async Task<BrandDto?> GetByIdAsync(int id)
    {
        var brand = await _brandRepository.GetByIdAsync(id);
        if (brand == null) return null;

        return new BrandDto
        {
            Id = brand.Id,
            Name = brand.Name,
            LogoUrl = brand.LogoUrl
        };
    }
}
