namespace Realstate_servcices.Server.Dto.Scheduling
{
    public class UpdateScheduleDto
    {
        public DateTime ScheduleTime { get; set; }
        public string Status { get; set; } = "Scheduled";
        public string? Notes { get; set; }

        // NEW: Enhanced scheduling fields
        public string MeetingType { get; set; } = "InPerson";
        public string? MeetingLocation { get; set; }
        public string? VirtualMeetingLink { get; set; }
    }

}
