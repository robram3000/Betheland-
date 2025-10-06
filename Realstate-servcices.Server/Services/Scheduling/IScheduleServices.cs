using Realstate_servcices.Server.Dto.Scheduling;

namespace Realstate_servcices.Server.Services.Scheduling
{
    public interface IScheduleServices
    {
        Task<ScheduleResponseDto> GetScheduleByIdAsync(int id);
        Task<ScheduleResponseDto> GetScheduleByNoAsync(Guid scheduleNo);
        Task<SchedulesResponseDto> GetAllSchedulesAsync();
        Task<SchedulesResponseDto> GetSchedulesByAgentAsync(int agentId);
        Task<SchedulesResponseDto> GetSchedulesByClientAsync(int clientId);
        Task<SchedulesResponseDto> GetSchedulesByPropertyAsync(int propertyId);
        Task<SchedulesResponseDto> GetSchedulesByStatusAsync(string status);
        Task<SchedulesResponseDto> GetSchedulesByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<ScheduleResponseDto> CreateScheduleAsync(CreateScheduleDto createDto);
        Task<ScheduleResponseDto> UpdateScheduleAsync(int id, UpdateScheduleDto updateDto);
        Task<ScheduleResponseDto> CancelScheduleAsync(int id);
        Task<ScheduleResponseDto> CompleteScheduleAsync(int id);
        Task<bool> DeleteScheduleAsync(int id);
        Task<bool> IsTimeSlotAvailableAsync(int agentId, DateTime scheduleTime);
    }
}
