using Realstate_servcices.Server.Entity.member;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Realstate_servcices.Server.Entity.Schedule
{
    public class AgentScheduleConfig
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public int AgentId { get; set; }

        [Required]
        public int SlotDurationMinutes { get; set; } = 60;

        [Required]
        public int MaxSchedulesPerDay { get; set; } = 8;

        [Required]
        public int BufferTimeMinutes { get; set; } = 15;

        [Required]
        public bool AllowWeekendScheduling { get; set; } = false; 

        [Required]
        public TimeSpan WorkDayStart { get; set; } = new TimeSpan(9, 0, 0); 

        [Required]
        public TimeSpan WorkDayEnd { get; set; } = new TimeSpan(17, 0, 0); 

        [Required]
        public int AdvanceBookingDays { get; set; } = 30;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        [ForeignKey("AgentId")]
        public virtual Agent Agent { get; set; } = null!;
    }
}