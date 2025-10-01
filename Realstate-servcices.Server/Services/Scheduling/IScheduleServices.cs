using Realstate_servcices.Server.Dto.Scheduling;

namespace Realstate_servcices.Server.Services.Scheduling
{
    public interface IScheduleServices
    {
        Task<ScheduleDetailDto?> GetScheduleByIdAsync(int id);
        Task<ScheduleDetailDto?> GetScheduleByNoAsync(Guid scheduleNo);
        Task<IEnumerable<ScheduleDetailDto>> GetAllSchedulesAsync();
        Task<IEnumerable<ScheduleDetailDto>> GetSchedulesByAgentAsync(int agentId);
        Task<IEnumerable<ScheduleDetailDto>> GetSchedulesByClientAsync(int clientId);
        Task<IEnumerable<ScheduleDetailDto>> GetSchedulesByPropertyAsync(int propertyId);
        Task<IEnumerable<ScheduleDetailDto>> GetSchedulesByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<IEnumerable<ScheduleDetailDto>> GetSchedulesByStatusAsync(string status);
        Task<ScheduleDetailDto> CreateScheduleAsync(CreateScheduleDto createDto);
        Task<ScheduleDetailDto?> UpdateScheduleAsync(int id, UpdateScheduleDto updateDto);
        Task<bool> CancelScheduleAsync(int id);
        Task<bool> CompleteScheduleAsync(int id);
        Task<bool> DeleteScheduleAsync(int id);
        Task<bool> IsTimeSlotAvailableAsync(int agentId, DateTime scheduleTime, int? excludeScheduleId = null);
    }
}
