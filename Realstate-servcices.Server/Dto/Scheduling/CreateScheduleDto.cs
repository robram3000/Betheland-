namespace Realstate_servcices.Server.Dto.Scheduling
{
    public class CreateScheduleDto
    {
        public int PropertyId { get; set; }
        public int AgentId { get; set; }
        public int ClientId { get; set; }
        public DateTime ScheduleTime { get; set; }
        public string? Notes { get; set; }
    }
}
