namespace Realstate_servcices.Server.Dto.Scheduling
{
    public class UpdateAgentScheduleConfigDto
    {
        public int? SlotDurationMinutes { get; set; }
        public int? BufferTimeMinutes { get; set; }
        public int? MaxSchedulesPerDay { get; set; }
        public string WorkDayStart { get; set; } // ✅ Change to string
        public string WorkDayEnd { get; set; } // ✅ Change to string
        public bool? AllowWeekendScheduling { get; set; }
        public int? AdvanceBookingDays { get; set; }
    }
}
