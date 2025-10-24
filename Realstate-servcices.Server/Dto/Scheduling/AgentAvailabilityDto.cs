namespace Realstate_servcices.Server.Dto.Scheduling
{
    public class AgentAvailabilityDto
    {
        public int Id { get; set; }
        public int AgentId { get; set; }
        public DayOfWeek DayOfWeek { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public bool IsAvailable { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

    }
}
