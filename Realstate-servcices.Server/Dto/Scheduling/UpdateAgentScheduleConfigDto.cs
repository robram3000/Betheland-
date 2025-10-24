namespace Realstate_servcices.Server.Dto.Scheduling
{
    public class UpdateAgentScheduleConfigDto
    {
        public int? SlotDurationMinutes { get; set; }
        public int? BufferTimeMinutes { get; set; }
        public int? MaxSchedulesPerDay { get; set; } // ✅ Consistent
        public TimeSpan? WorkDayStart { get; set; } // ✅ Consistent
        public TimeSpan? WorkDayEnd { get; set; } // ✅ Consistent
        public bool? AllowWeekendScheduling { get; set; } // ✅ Consistent
        public int? AdvanceBookingDays { get; set; } // ✅ Added missing property
    }
}
