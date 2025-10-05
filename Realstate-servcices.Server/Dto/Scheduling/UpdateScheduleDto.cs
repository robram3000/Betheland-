using System.ComponentModel.DataAnnotations;

namespace Realstate_servcices.Server.Dto.Scheduling
{
    public class UpdateScheduleDto
    {
        public DateTime? ScheduleTime { get; set; }

        [MaxLength(20)]
        public string? Status { get; set; }

        [MaxLength(500)]
        public string? Notes { get; set; }
    }
}
