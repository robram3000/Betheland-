namespace Realstate_servcices.Server.Dto.Scheduling
{
    public class AgentScheduleConfigDto
    {
        public int Id { get; set; }
        public int AgentId { get; set; }
        public int SlotDurationMinutes { get; set; } = 60;
        public int BufferTimeMinutes { get; set; } = 15;
        public int MaxSchedulesPerDay { get; set; } = 8; 
        public TimeSpan WorkDayStart { get; set; } = new TimeSpan(9, 0, 0); 
        public TimeSpan WorkDayEnd { get; set; } = new TimeSpan(17, 0, 0); 
        public bool AllowWeekendScheduling { get; set; } = false;
        public int AdvanceBookingDays { get; set; } = 30; 
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
