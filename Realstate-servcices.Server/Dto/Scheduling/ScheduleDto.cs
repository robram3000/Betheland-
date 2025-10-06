namespace Realstate_servcices.Server.Dto.Scheduling
{
    public class ScheduleDto
    {
        public int Id { get; set; }
        public Guid ScheduleNo { get; set; }
        public int PropertyId { get; set; }
        public int AgentId { get; set; }
        public int ClientId { get; set; }
        public DateTime ScheduleTime { get; set; }
        public string Status { get; set; } = "Scheduled";
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Additional properties for display
        public string? PropertyTitle { get; set; }
        public string? AgentName { get; set; }
        public string? ClientName { get; set; }
        public string? PropertyAddress { get; set; }
    }
}
