using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Realstate_servcices.Server.Entity.member;
using Realstate_servcices.Server.Entity.Properties;

namespace Realstate_servcices.Server.Entity.Schedule
{
    public class ScheduleProperties
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public Guid ScheduleNo { get; set; } = Guid.NewGuid();

        [Required]
        public int PropertyId { get; set; }

        [Required]
        public int AgentId { get; set; }

        [Required]
        public int ClientId { get; set; }

        [Required]
        public DateTime ScheduleTime { get; set; }

        [Required]
        public DateTime ScheduleEndTime { get; set; } // Calculated end time

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Scheduled"; // "Scheduled", "Confirmed", "Completed", "Cancelled", "NoShow"

        [MaxLength(500)]
        public string? Notes { get; set; }

        // Meeting details
        [MaxLength(50)]
        public string MeetingType { get; set; } = "InPerson"; // "InPerson", "Virtual", "Phone"

        [MaxLength(255)]
        public string? MeetingLocation { get; set; }

        [MaxLength(500)]
        public string? VirtualMeetingLink { get; set; }

        // Cancellation tracking
        public DateTime? CancelledAt { get; set; }

        [MaxLength(100)]
        public string? CancellationReason { get; set; }

        public DateTime? CompletedAt { get; set; }

        public DateTime? ReminderSentAt { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        [ForeignKey("PropertyId")]
        public virtual PropertyHouse Property { get; set; } = null!;

        [ForeignKey("AgentId")]
        public virtual Agent Agent { get; set; } = null!;

        [ForeignKey("ClientId")]
        public virtual Client Client { get; set; } = null!;
    }
}