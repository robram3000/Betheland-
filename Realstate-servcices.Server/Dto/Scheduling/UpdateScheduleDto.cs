namespace Realstate_servcices.Server.Dto.Scheduling
{
    public class UpdateScheduleDto
    {
        public DateTime ScheduleTime { get; set; }
        public string Status { get; set; } = "Scheduled";
        public string? Notes { get; set; }
    }
}
