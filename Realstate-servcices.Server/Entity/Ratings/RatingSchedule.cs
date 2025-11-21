using Realstate_servcices.Server.Entity.member;
using Realstate_servcices.Server.Entity.Schedule;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Realstate_servcices.Server.Entity.Ratings
{
    public class RatingSchedule
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public int ScheduleId { get; set; }

        [Required]
        public int ClientId { get; set; } // Client who is giving the rating

        [Required]
        public int AgentId { get; set; } // Agent who is being rated

        [Required]
        [Range(1, 5)]
        public int Rating { get; set; } // 1-5 star rating

        [MaxLength(1000)]
        public string? Comment { get; set; }

        [Required]
        [MaxLength(20)]
        public string RatingType { get; set; } = "Service"; 

        [Required]
        public DateTime RatingDate { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        public bool IsVisible { get; set; } = true;

        [MaxLength(20)]
        public string Status { get; set; } = "Active"; // Active, Flagged, Removed

        // Navigation properties
        [ForeignKey("ScheduleId")]
        public virtual ScheduleProperties Schedule { get; set; } = null!;

        [ForeignKey("ClientId")]
        public virtual Client Client { get; set; } = null!;

        [ForeignKey("AgentId")]
        public virtual Agent Agent { get; set; } = null!;
    }
}
