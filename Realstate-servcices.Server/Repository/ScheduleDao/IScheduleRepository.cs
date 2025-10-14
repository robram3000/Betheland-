using Realstate_servcices.Server.Entity.Properties;

namespace Realstate_servcices.Server.Repository.ScheduleDao
{
    public interface ISchedulingRepository
    {
        Task<ScheduleProperties?> GetByIdAsync(int id);
        Task<IEnumerable<ScheduleProperties>> GetAllAsync();
        Task<IEnumerable<ScheduleProperties>> GetByAgentIdAsync(int agentId);
        Task<IEnumerable<ScheduleProperties>> GetByClientIdAsync(int clientId);
        Task<IEnumerable<ScheduleProperties>> GetByPropertyIdAsync(int propertyId);
        Task<IEnumerable<ScheduleProperties>> GetSchedulesByDateAsync(DateTime date);
        Task<IEnumerable<ScheduleProperties>> GetUpcomingSchedulesAsync(int days = 7);
        Task<ScheduleProperties> CreateAsync(ScheduleProperties schedule);
        Task<ScheduleProperties> UpdateAsync(ScheduleProperties schedule);
        Task<bool> DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
        Task<bool> IsTimeSlotAvailableAsync(int agentId, DateTime scheduleTime);
    }
}
