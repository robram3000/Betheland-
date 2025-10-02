using Realstate_servcices.Server.Dto.Property;

namespace Realstate_servcices.Server.Dto.Scheduling
{
    public class ScheduleDetailDto
    {
        public int Id { get; set; }
        public Guid ScheduleNo { get; set; }
        public PropertyHouseDto? Property { get; set; }
        public AgentDto? Agent { get; set; }
        public ClientDto? Client { get; set; }
        public DateTime ScheduleTime { get; set; }
        public string Status { get; set; } = "Scheduled";
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
