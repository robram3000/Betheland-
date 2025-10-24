namespace Realstate_servcices.Server.Dto.Scheduling
{
    public class CreateScheduleDto
    {
        public int PropertyId { get; set; }
        public int AgentId { get; set; }
        public int ClientId { get; set; }
        public DateTime ScheduleTime { get; set; }
        public string? Notes { get; set; }
        public string status { get; set; }

        // NEW: Enhanced scheduling fields
        public string MeetingType { get; set; } = "InPerson";
        public string? MeetingLocation { get; set; }
        public string? VirtualMeetingLink { get; set; }
    }
}
