using System.ComponentModel.DataAnnotations;

namespace TradeHub.API.DTOs.Products;

public class CreateProductDto
{
    [Required(ErrorMessage = "Product name is required.")]
    [StringLength(300, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;

    [StringLength(2000)]
    public string Description { get; set; } = string.Empty;

    [Required]
    [Range(0.01, 999999.99, ErrorMessage = "Price must be greater than zero.")]
    public decimal Price { get; set; }

    [Range(0.01, 999999.99, ErrorMessage = "Old price must be greater than zero.")]
    public decimal? OldPrice { get; set; }

    [Required]
    [Range(0, int.MaxValue, ErrorMessage = "Stock quantity cannot be negative.")]
    public int StockQuantity { get; set; }

    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "A valid category must be selected.")]
    public int CategoryId { get; set; }

    /// <summary>Optional subcategory (department) ID.</summary>
    public int? SubcategoryId { get; set; }

    /// <summary>Optional Brand ID.</summary>
    public int? BrandId { get; set; }

    /// <summary>
    /// Optional low-stock alert threshold. When StockQuantity reaches or drops below
    /// this number, a LowStock notification is fired. Leave null (or 0) to disable.
    /// </summary>
    [Range(0, int.MaxValue)]
    public int? LowStockThreshold { get; set; }

    /// <summary>
    /// The image file uploaded from the client (multipart/form-data).
    /// Allowed types: .jpg, .jpeg, .png, .webp - max 5 MB.
    /// </summary>
    public IFormFile? ImageFile { get; set; }
}