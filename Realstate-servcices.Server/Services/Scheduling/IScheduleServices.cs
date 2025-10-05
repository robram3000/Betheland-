//using Realstate_servcices.Server.Dto.Scheduling;

//namespace Realstate_servcices.Server.Services.Scheduling
//{
//    public interface ISchedulePropertiesService
//    {
//        Task<ScheduleResponseDto?> GetScheduleAsync(int id);
//        Task<IEnumerable<ScheduleResponseDto>> GetClientSchedulesAsync(int clientId);
//        Task<IEnumerable<ScheduleResponseDto>> GetAgentSchedulesAsync(int agentId);
//        Task<IEnumerable<ScheduleResponseDto>> GetPropertySchedulesAsync(int propertyId);
//        Task<IEnumerable<ScheduleResponseDto>> GetUpcomingSchedulesAsync(int days = 7);
//        Task<ScheduleResponseDto> CreateScheduleAsync(CreateScheduleDto createDto);
//        Task<ScheduleResponseDto?> UpdateScheduleAsync(int id, UpdateScheduleDto updateDto);
//        Task<ScheduleResponseDto?> UpdateScheduleStatusAsync(int id, ScheduleStatusDto statusDto);
//        Task<bool> CancelScheduleAsync(int id);
//        Task<bool> DeleteScheduleAsync(int id);
//        Task<bool> IsScheduleConflictAsync(int propertyId, int agentId, DateTime scheduleTime);
//        Task<int> GetScheduleCountByStatusAsync(string status);
//    }
//}
