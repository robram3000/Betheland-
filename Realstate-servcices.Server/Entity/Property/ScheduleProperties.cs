using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Realstate_servcices.Server.Entity.member;

namespace Realstate_servcices.Server.Entity.Property
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
        public DateTime ScheduleTime { get; set; } // Combined date and time

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Scheduled"; // Scheduled, Completed, Cancelled

        [MaxLength(500)]
        public string? Notes { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        [ForeignKey("PropertyId")]
        public virtual Property Property { get; set; } = null!;

        [ForeignKey("AgentId")]
        public virtual Agent Agent { get; set; } = null!;

        [ForeignKey("ClientId")]
        public virtual Client Client { get; set; } = null!;
    }
}