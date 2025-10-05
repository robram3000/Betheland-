//using Realstate_servcices.Server.Entity.Properties;

//namespace Realstate_servcices.Server.Repository.ScheduleDao
//{
//    public interface ISchedulePropertiesRepository
//    {
//        Task<ScheduleProperties?> GetByIdAsync(int id);
//        Task<IEnumerable<ScheduleProperties>> GetByClientIdAsync(int clientId);
//        Task<IEnumerable<ScheduleProperties>> GetByAgentIdAsync(int agentId);
//        Task<IEnumerable<ScheduleProperties>> GetByPropertyIdAsync(int propertyId);
//        Task<IEnumerable<ScheduleProperties>> GetSchedulesByDateAsync(DateTime date);
//        Task<IEnumerable<ScheduleProperties>> GetUpcomingSchedulesAsync(int days = 7);
//        Task<ScheduleProperties> AddAsync(ScheduleProperties schedule);
//        Task UpdateAsync(ScheduleProperties schedule);
//        Task DeleteAsync(int id);
//        Task<bool> ExistsAsync(int propertyId, int clientId, DateTime scheduleTime);
//        Task<int> GetScheduleCountByStatusAsync(string status);
//    }
//}
