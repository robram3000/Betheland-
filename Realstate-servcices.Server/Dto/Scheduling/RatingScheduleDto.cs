using Realstate_servcices.Server.Enum;
using System.ComponentModel.DataAnnotations;

namespace Realstate_servcices.Server.Dto.Scheduling
{
    public class RatingScheduleDto
    {
        public int Id { get; set; }

        [Required]
        public int ScheduleId { get; set; }

        [Required]
        public int ClientId { get; set; }

        [Required]
        public int AgentId { get; set; }

        [Required]
        [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5")]
        public int Rating { get; set; }

        [MaxLength(1000)]
        public string? Comment { get; set; }

        [Required]
        [MaxLength(20)]
        public string RatingType { get; set; } = "Service";
    }

    public class CreateRatingScheduleDto
    {
        [Required]
        public int ScheduleId { get; set; }

        [Required]
        [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5")]
        public int Rating { get; set; }

        [MaxLength(1000)]
        public string? Comment { get; set; }

        [MaxLength(20)]
        public string RatingType { get; set; } = "Service";
    }

    public class UpdateRatingScheduleDto
    {
        [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5")]
        public int? Rating { get; set; }

        [MaxLength(1000)]
        public string? Comment { get; set; }

        [MaxLength(20)]
        public string? RatingType { get; set; }

        public bool? IsVisible { get; set; }
    }

    public class RatingSummaryDto
    {
        public int AgentId { get; set; }
        public double AverageRating { get; set; }
        public int TotalRatings { get; set; }
        public int FiveStar { get; set; }
        public int FourStar { get; set; }
        public int ThreeStar { get; set; }
        public int TwoStar { get; set; }
        public int OneStar { get; set; }
    }
}
