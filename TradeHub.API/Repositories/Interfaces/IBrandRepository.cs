using System.Collections.Generic;
using System.Threading.Tasks;
using TradeHub.API.Models;

namespace TradeHub.API.Repositories.Interfaces;

public interface IBrandRepository
{
    Task<IEnumerable<Brand>> GetAllAsync();
    Task<Brand?> GetByIdAsync(int id);
}
