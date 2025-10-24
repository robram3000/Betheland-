namespace Realstate_servcices.Server.Dto.Scheduling
{
    public class UpdateAgentScheduleConfigDto
    {
        public int? SlotDurationMinutes { get; set; }
        public int? BufferTimeMinutes { get; set; }
        public int? MaxSchedulesPerDay { get; set; }
        public TimeSpan? WorkDayStart { get; set; }
        public TimeSpan? WorkDayEnd { get; set; }
        public bool? AllowWeekendScheduling { get; set; }
    }
}
