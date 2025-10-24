namespace Realstate_servcices.Server.Dto.Scheduling
{
    public class CreateAgentAvailabilityDto
    {
        public int AgentId { get; set; }
        public DayOfWeek DayOfWeek { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public bool IsAvailable { get; set; } = true;
    }
}
