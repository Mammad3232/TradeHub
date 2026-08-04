using System.ComponentModel.DataAnnotations;

namespace TradeHub.API.DTOs.Reviews;

public class CreateReviewDto
{
    [Required]
    [Range(1, 5, ErrorMessage = "Rating must be an integer between 1 and 5.")]
    public int Rating { get; set; }

    [MaxLength(1000, ErrorMessage = "Comment cannot exceed 1000 characters.")]
    public string? Comment { get; set; }
}
