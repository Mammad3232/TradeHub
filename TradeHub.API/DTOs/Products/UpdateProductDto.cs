using System.ComponentModel.DataAnnotations;

namespace TradeHub.API.DTOs.Products;

public class UpdateProductDto
{
    [StringLength(300, MinimumLength = 2)]
    public string? Name { get; set; }

    [StringLength(2000)]
    public string? Description { get; set; }

    [Range(0.01, 999999.99)]
    public decimal? Price { get; set; }

    [Range(0, int.MaxValue)]
    public int? StockQuantity { get; set; }

    [Url]
    public string? ImageUrl { get; set; }

    public int? CategoryId { get; set; }

    public bool? IsActive { get; set; }
}
