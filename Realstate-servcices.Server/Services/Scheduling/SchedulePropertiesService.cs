using Realstate_servcices.Server.Entity.Schedule;
using Realstate_servcices.Server.Repositories;

namespace Realstate_servcices.Server.Services.Scheduling
{
       public interface ISchedulePropertiesService
    {
        Task<ScheduleProperties> GetScheduleByIdAsync(int id);
        Task<ScheduleProperties> GetScheduleByNoAsync(Guid scheduleNo);
        Task<IEnumerable<ScheduleProperties>> GetAllSchedulesAsync();
        Task<IEnumerable<ScheduleProperties>> GetSchedulesByAgentAsync(int agentId);
        Task<IEnumerable<ScheduleProperties>> GetSchedulesByClientAsync(int clientId);
        Task<IEnumerable<ScheduleProperties>> GetSchedulesByPropertyAsync(int propertyId);
        Task<IEnumerable<ScheduleProperties>> GetSchedulesByStatusAsync(string status);
        Task<IEnumerable<ScheduleProperties>> GetSchedulesByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<ScheduleProperties> CreateScheduleAsync(ScheduleProperties schedule);
        Task<ScheduleProperties> UpdateScheduleAsync(ScheduleProperties schedule);
        Task<bool> CancelScheduleAsync(int id);
        Task<bool> RescheduleAsync(int id, DateTime newScheduleTime);
        Task<bool> CompleteScheduleAsync(int id);
        Task<bool> DeleteScheduleAsync(int id);
        Task<bool> IsTimeSlotAvailableAsync(int agentId, DateTime scheduleTime);
    }

    public class SchedulePropertiesService : ISchedulePropertiesService
    {
        private readonly ISchedulePropertiesRepository _scheduleRepository;
        private readonly IAgentTimeOffRepository _timeOffRepository;
        private readonly IAgentAvailabilityRepository _availabilityRepository;

        public SchedulePropertiesService(
            ISchedulePropertiesRepository scheduleRepository,
            IAgentTimeOffRepository timeOffRepository,
            IAgentAvailabilityRepository availabilityRepository)
        {
            _scheduleRepository = scheduleRepository;
            _timeOffRepository = timeOffRepository;
            _availabilityRepository = availabilityRepository;
        }

        public async Task<ScheduleProperties> GetScheduleByIdAsync(int id)
        {
            return await _scheduleRepository.GetByIdAsync(id);
        }

        public async Task<ScheduleProperties> GetScheduleByNoAsync(Guid scheduleNo)
        {
            return await _scheduleRepository.GetByScheduleNoAsync(scheduleNo);
        }

        public async Task<IEnumerable<ScheduleProperties>> GetAllSchedulesAsync()
        {
            return await _scheduleRepository.GetAllAsync();
        }

        public async Task<IEnumerable<ScheduleProperties>> GetSchedulesByAgentAsync(int agentId)
        {
            return await _scheduleRepository.GetByAgentIdAsync(agentId);
        }

        public async Task<IEnumerable<ScheduleProperties>> GetSchedulesByClientAsync(int clientId)
        {
            return await _scheduleRepository.GetByClientIdAsync(clientId);
        }

        public async Task<IEnumerable<ScheduleProperties>> GetSchedulesByPropertyAsync(int propertyId)
        {
            return await _scheduleRepository.GetByPropertyIdAsync(propertyId);
        }

        public async Task<IEnumerable<ScheduleProperties>> GetSchedulesByStatusAsync(string status)
        {
            return await _scheduleRepository.GetByStatusAsync(status);
        }

        public async Task<IEnumerable<ScheduleProperties>> GetSchedulesByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            return await _scheduleRepository.GetSchedulesByDateRangeAsync(startDate, endDate);
        }

        public async Task<ScheduleProperties> CreateScheduleAsync(ScheduleProperties schedule)
        {
            // Validate time slot availability
            if (!await IsTimeSlotAvailableAsync(schedule.AgentId, schedule.ScheduleTime))
            {
                throw new InvalidOperationException("The selected time slot is not available for scheduling.");
            }

            schedule.Status = "Scheduled";
            schedule.CreatedAt = DateTime.UtcNow;
            return await _scheduleRepository.AddAsync(schedule);
        }

        public async Task<ScheduleProperties> UpdateScheduleAsync(ScheduleProperties schedule)
        {
            var existingSchedule = await _scheduleRepository.GetByIdAsync(schedule.Id);
            if (existingSchedule == null)
                throw new KeyNotFoundException($"Schedule with ID {schedule.Id} not found.");

            // If schedule time changed, validate availability
            if (existingSchedule.ScheduleTime != schedule.ScheduleTime && 
                !await IsTimeSlotAvailableAsync(schedule.AgentId, schedule.ScheduleTime))
            {
                throw new InvalidOperationException("The selected time slot is not available for scheduling.");
            }

            schedule.UpdatedAt = DateTime.UtcNow;
            return await _scheduleRepository.UpdateAsync(schedule);
        }

        public async Task<bool> CancelScheduleAsync(int id)
        {
            var schedule = await _scheduleRepository.GetByIdAsync(id);
            if (schedule == null)
                return false;

            schedule.Status = "Cancelled";
            schedule.UpdatedAt = DateTime.UtcNow;
            await _scheduleRepository.UpdateAsync(schedule);
            return true;
        }

        public async Task<bool> RescheduleAsync(int id, DateTime newScheduleTime)
        {
            var schedule = await _scheduleRepository.GetByIdAsync(id);
            if (schedule == null)
                return false;

            // Validate new time slot availability
            if (!await IsTimeSlotAvailableAsync(schedule.AgentId, newScheduleTime))
            {
                throw new InvalidOperationException("The selected time slot is not available for rescheduling.");
            }

            schedule.ScheduleTime = newScheduleTime;
            schedule.Status = "Rescheduled";
            schedule.UpdatedAt = DateTime.UtcNow;
            await _scheduleRepository.UpdateAsync(schedule);
            return true;
        }

        public async Task<bool> CompleteScheduleAsync(int id)
        {
            var schedule = await _scheduleRepository.GetByIdAsync(id);
            if (schedule == null)
                return false;

            schedule.Status = "Completed";
            schedule.UpdatedAt = DateTime.UtcNow;
            await _scheduleRepository.UpdateAsync(schedule);
            return true;
        }

        public async Task<bool> DeleteScheduleAsync(int id)
        {
            return await _scheduleRepository.DeleteAsync(id);
        }

        public async Task<bool> IsTimeSlotAvailableAsync(int agentId, DateTime scheduleTime)
        {
            // Check if agent is on time off
            if (await _timeOffRepository.IsAgentOnTimeOffAsync(agentId, scheduleTime))
                return false;

            // Check if agent is available at this time (day of week and time)
            var dayOfWeek = scheduleTime.DayOfWeek;
            var time = scheduleTime.TimeOfDay;

            return await _availabilityRepository.IsAgentAvailableAsync(agentId, dayOfWeek, time);
        }
    }

}
