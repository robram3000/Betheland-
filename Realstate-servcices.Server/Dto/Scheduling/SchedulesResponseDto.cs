namespace Realstate_servcices.Server.Dto.Scheduling
{
    public class ScheduleResponseDto
    {
        public int Id { get; set; }
        public Guid ScheduleNo { get; set; }
        public int PropertyId { get; set; }
        public int AgentId { get; set; }
        public int ClientId { get; set; }
        public DateTime ScheduleTime { get; set; }
        public DateTime ScheduleEndTime { get; set; }
        public string Status { get; set; } = "Scheduled";
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string PropertyTitle { get; set; } = string.Empty;
        public string AgentName { get; set; } = string.Empty;
        public string ClientName { get; set; } = string.Empty;
        public string PropertyAddress { get; set; } = string.Empty;

        // NEW: Enhanced scheduling fields
        public string MeetingType { get; set; } = "InPerson";
        public string? MeetingLocation { get; set; }
        public string? VirtualMeetingLink { get; set;}
        public DateTime? CancelledAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public string? CancellationReason { get; set; }
    }
}
