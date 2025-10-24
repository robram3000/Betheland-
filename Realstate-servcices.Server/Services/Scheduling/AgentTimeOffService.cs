using Realstate_servcices.Server.Entity.Schedule;
using Realstate_servcices.Server.Repositories;

namespace Realstate_servcices.Server.Services.Scheduling
{
    /// <summary>
    /// Service interface for managing agent time off requests and availability
    /// </summary>
    public interface IAgentTimeOffService
    {
        Task<AgentTimeOff> GetTimeOffByIdAsync(int id);
        Task<IEnumerable<AgentTimeOff>> GetAllTimeOffsAsync();
        Task<IEnumerable<AgentTimeOff>> GetTimeOffsByAgentAsync(int agentId);
        Task<IEnumerable<AgentTimeOff>> GetUpcomingTimeOffsAsync(int daysAhead = 30);
        Task<IEnumerable<AgentTimeOff>> GetTimeOffsByDateRangeAsync(int agentId, DateTime startDate, DateTime endDate);
        Task<AgentTimeOff> RequestTimeOffAsync(AgentTimeOff timeOff);
        Task<AgentTimeOff> UpdateTimeOffAsync(AgentTimeOff timeOff);
        Task<bool> ApproveTimeOffAsync(int id);
        Task<bool> RejectTimeOffAsync(int id);
        Task<bool> DeleteTimeOffAsync(int id);
        Task<bool> IsAgentAvailableAsync(int agentId, DateTime date);
        Task<bool> HasTimeOffConflictAsync(int agentId, DateTime startDate, DateTime endDate);
    }

    /// <summary>
    /// Implementation of agent time off management service
    /// Handles time off requests, approvals, and availability checks
    /// </summary>
    public class AgentTimeOffService : IAgentTimeOffService
    {
        private readonly IAgentTimeOffRepository _timeOffRepository;
        private readonly ISchedulePropertiesRepository _scheduleRepository;

        /// <summary>
        /// Initializes a new instance of the AgentTimeOffService
        /// </summary>
        /// <param name="timeOffRepository">Repository for time off data access</param>
        /// <param name="scheduleRepository">Repository for schedule data access</param>
        public AgentTimeOffService(
            IAgentTimeOffRepository timeOffRepository,
            ISchedulePropertiesRepository scheduleRepository)
        {
            _timeOffRepository = timeOffRepository;
            _scheduleRepository = scheduleRepository;
        }

        public async Task<AgentTimeOff> GetTimeOffByIdAsync(int id)
        {
            return await _timeOffRepository.GetByIdAsync(id);
        }

        public async Task<IEnumerable<AgentTimeOff>> GetAllTimeOffsAsync()
        {
            return await _timeOffRepository.GetAllAsync();
        }

        public async Task<IEnumerable<AgentTimeOff>> GetTimeOffsByAgentAsync(int agentId)
        {
            return await _timeOffRepository.GetByAgentIdAsync(agentId);
        }

        public async Task<IEnumerable<AgentTimeOff>> GetUpcomingTimeOffsAsync(int daysAhead = 30)
        {
            var startDate = DateTime.Today;
            var endDate = startDate.AddDays(daysAhead);

            var allTimeOffs = await _timeOffRepository.GetAllAsync();
            return allTimeOffs.Where(to => to.StartDate <= endDate && to.EndDate >= startDate)
                             .OrderBy(to => to.StartDate)
                             .ToList();
        }

        public async Task<IEnumerable<AgentTimeOff>> GetTimeOffsByDateRangeAsync(int agentId, DateTime startDate, DateTime endDate)
        {
            return await _timeOffRepository.GetTimeOffByDateRangeAsync(agentId, startDate, endDate);
        }

        public async Task<AgentTimeOff> RequestTimeOffAsync(AgentTimeOff timeOff)
        {
            // Check for conflicts with existing time off
            if (await HasTimeOffConflictAsync(timeOff.AgentId, timeOff.StartDate, timeOff.EndDate))
            {
                throw new InvalidOperationException("Time off request conflicts with existing time off.");
            }

            // Check for conflicts with existing schedules
            var existingSchedules = await _scheduleRepository.GetSchedulesByDateRangeAsync(
                timeOff.StartDate, timeOff.EndDate);

            var agentSchedules = existingSchedules.Where(s => s.AgentId == timeOff.AgentId);
            if (agentSchedules.Any())
            {
                throw new InvalidOperationException("Time off request conflicts with existing schedules.");
            }

            timeOff.IsApproved = false;
            timeOff.CreatedAt = DateTime.UtcNow;
            return await _timeOffRepository.AddAsync(timeOff);
        }

        public async Task<AgentTimeOff> UpdateTimeOffAsync(AgentTimeOff timeOff)
        {
            var existingTimeOff = await _timeOffRepository.GetByIdAsync(timeOff.Id);
            if (existingTimeOff == null)
                throw new KeyNotFoundException($"Time off with ID {timeOff.Id} not found.");

            // If dates changed, check for conflicts
            if (existingTimeOff.StartDate != timeOff.StartDate || existingTimeOff.EndDate != timeOff.EndDate)
            {
                if (await HasTimeOffConflictAsync(timeOff.AgentId, timeOff.StartDate, timeOff.EndDate, timeOff.Id))
                {
                    throw new InvalidOperationException("Updated time off conflicts with existing time off.");
                }
            }

            timeOff.UpdatedAt = DateTime.UtcNow;
            return await _timeOffRepository.UpdateAsync(timeOff);
        }

        public async Task<bool> ApproveTimeOffAsync(int id)
        {
            var timeOff = await _timeOffRepository.GetByIdAsync(id);
            if (timeOff == null)
                return false;

            timeOff.IsApproved = true;
            timeOff.UpdatedAt = DateTime.UtcNow;
            await _timeOffRepository.UpdateAsync(timeOff);
            return true;
        }

        public async Task<bool> RejectTimeOffAsync(int id)
        {
            var timeOff = await _timeOffRepository.GetByIdAsync(id);
            if (timeOff == null)
                return false;

            timeOff.IsApproved = false;
            timeOff.UpdatedAt = DateTime.UtcNow;
            await _timeOffRepository.UpdateAsync(timeOff);
            return true;
        }

        public async Task<bool> DeleteTimeOffAsync(int id)
        {
            return await _timeOffRepository.DeleteAsync(id);
        }

        public async Task<bool> IsAgentAvailableAsync(int agentId, DateTime date)
        {
            return !await _timeOffRepository.IsAgentOnTimeOffAsync(agentId, date);
        }

        // Interface implementation without excludeId parameter
        public async Task<bool> HasTimeOffConflictAsync(int agentId, DateTime startDate, DateTime endDate)
        {
            return await HasTimeOffConflictAsync(agentId, startDate, endDate, null);
        }

        // Helper method with optional excludeId parameter
        private async Task<bool> HasTimeOffConflictAsync(int agentId, DateTime startDate, DateTime endDate, int? excludeId = null)
        {
            var existingTimeOffs = await _timeOffRepository.GetTimeOffByDateRangeAsync(agentId, startDate, endDate);

            if (excludeId.HasValue)
            {
                existingTimeOffs = existingTimeOffs.Where(to => to.Id != excludeId.Value);
            }

            return existingTimeOffs.Any();
        }
    }
}