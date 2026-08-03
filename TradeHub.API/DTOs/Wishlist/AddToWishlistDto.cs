using System.ComponentModel.DataAnnotations;

namespace TradeHub.API.DTOs.Wishlist;

public class AddToWishlistDto
{
    [Required]
    public int ProductId { get; set; }
}
