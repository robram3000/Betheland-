using Realstate_servcices.Server.Dto.Scheduling;

namespace Realstate_servcices.Server.Services.Scheduling
{
    public interface ISchedulingServices
    {
        Task<ScheduleResponseDto?> GetScheduleByIdAsync(int id);
        Task<IEnumerable<ScheduleResponseDto>> GetAllSchedulesAsync();
        Task<IEnumerable<ScheduleResponseDto>> GetSchedulesByAgentAsync(int agentId);
        Task<IEnumerable<ScheduleResponseDto>> GetSchedulesByClientAsync(int clientId);
        Task<IEnumerable<ScheduleResponseDto>> GetSchedulesByPropertyAsync(int propertyId);
        Task<IEnumerable<ScheduleResponseDto>> GetUpcomingSchedulesAsync(int days = 7);
        Task<ScheduleResponseDto> CreateScheduleAsync(CreateScheduleDto createDto);
        Task<ScheduleResponseDto?> UpdateScheduleAsync(int id, UpdateScheduleDto updateDto);
        Task<bool> CancelScheduleAsync(int id);
        Task<bool> CompleteScheduleAsync(int id);
        Task<bool> DeleteScheduleAsync(int id);
        Task<bool> IsTimeSlotAvailableAsync(int agentId, DateTime scheduleTime);
    }
}
