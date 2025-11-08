namespace Realstate_servcices.Server.Dto.Scheduling
{
    public class CreateScheduleRequest
    {
        public int PropertyId { get; set; }
        public int AgentId { get; set; }
        public int ClientId { get; set; }
        public DateTime ScheduleTime { get; set; }
        public DateTime? ScheduleEndTime { get; set; }
        public string? Notes { get; set; }
        public string MeetingType { get; set; } = "InPerson";
        public string? MeetingLocation { get; set; }
        public string? VirtualMeetingLink { get; set; }
    }
}
