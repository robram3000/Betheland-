using System.ComponentModel.DataAnnotations;

namespace Realstate_servcices.Server.Dto.Scheduling
{
    public class ScheduleStatusDto
    {
        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Scheduled";
    }

}
