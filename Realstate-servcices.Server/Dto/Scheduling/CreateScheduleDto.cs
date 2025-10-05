using System.ComponentModel.DataAnnotations;

namespace Realstate_servcices.Server.Dto.Scheduling
{
    public class CreateScheduleDto
    {
        [Required]
        public int PropertyId { get; set; }

        [Required]
        public int AgentId { get; set; }

        [Required]
        public int ClientId { get; set; }

        [Required]
        public DateTime ScheduleTime { get; set; }

        [MaxLength(500)]
        public string? Notes { get; set; }
    }
}
