namespace Realstate_servcices.Server.Entity.Scheduling
{
    public class UpdateScheduleDto
    {
        public DateTime? ScheduleTime { get; set; }
        public string? Status { get; set; }
        public string? Notes { get; set; }
    }
}
