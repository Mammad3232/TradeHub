using System.Collections.Generic;
using System.Threading.Tasks;
using TradeHub.API.DTOs.Brands;

namespace TradeHub.API.Services.Interfaces;

public interface IBrandService
{
    Task<IEnumerable<BrandDto>> GetAllAsync();
    Task<BrandDto?> GetByIdAsync(int id);
}
