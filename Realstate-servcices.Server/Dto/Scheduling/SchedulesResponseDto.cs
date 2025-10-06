namespace Realstate_servcices.Server.Dto.Scheduling
{
    public class SchedulesResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public List<ScheduleDto>? Data { get; set; }
    }
}
