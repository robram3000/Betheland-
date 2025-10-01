using Realstate_servcices.Server.Entity.Properties;

namespace Realstate_servcices.Server.Repository.ScheduleDao
{
    public interface IScheduleRepository
    {
        Task<ScheduleProperties?> GetByIdAsync(int id);
        Task<ScheduleProperties?> GetByScheduleNoAsync(Guid scheduleNo);
        Task<IEnumerable<ScheduleProperties>> GetAllAsync();
        Task<IEnumerable<ScheduleProperties>> GetByAgentIdAsync(int agentId);
        Task<IEnumerable<ScheduleProperties>> GetByClientIdAsync(int clientId);
        Task<IEnumerable<ScheduleProperties>> GetByPropertyIdAsync(int propertyId);
        Task<IEnumerable<ScheduleProperties>> GetSchedulesByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<IEnumerable<ScheduleProperties>> GetSchedulesByStatusAsync(string status);
        Task<ScheduleProperties> CreateAsync(ScheduleProperties schedule);
        Task<ScheduleProperties?> UpdateAsync(int id, ScheduleProperties schedule);
        Task<bool> DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
        Task<bool> IsTimeSlotAvailableAsync(int agentId, DateTime scheduleTime, int? excludeScheduleId = null);
    }
}
