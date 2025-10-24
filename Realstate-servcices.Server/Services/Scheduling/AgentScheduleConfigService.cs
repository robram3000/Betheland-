using Realstate_servcices.Server.Entity.Schedule;
using Realstate_servcices.Server.Repositories;

namespace Realstate_servcices.Server.Services.Scheduling
{
    public interface IAgentScheduleConfigService
    {
        Task<AgentScheduleConfig> GetConfigByIdAsync(int id);
        Task<AgentScheduleConfig> GetConfigByAgentAsync(int agentId);
        Task<IEnumerable<AgentScheduleConfig>> GetAllConfigsAsync();
        Task<AgentScheduleConfig> CreateConfigAsync(AgentScheduleConfig config);
        Task<AgentScheduleConfig> UpdateConfigAsync(AgentScheduleConfig config);
        Task<bool> DeleteConfigAsync(int id);
        Task<AgentScheduleConfig> GetOrCreateDefaultConfigAsync(int agentId);
        Task<bool> ValidateScheduleTimeAsync(int agentId, DateTime scheduleTime);
        Task<IEnumerable<TimeSpan>> GetAvailableTimeSlotsAsync(int agentId, DateTime date);
    }

    public class AgentScheduleConfigService : IAgentScheduleConfigService
    {
        private readonly IAgentScheduleConfigRepository _configRepository;
        private readonly IAgentAvailabilityRepository _availabilityRepository;
        private readonly ISchedulePropertiesRepository _scheduleRepository;

        public AgentScheduleConfigService(
            IAgentScheduleConfigRepository configRepository,
            IAgentAvailabilityRepository availabilityRepository,
            ISchedulePropertiesRepository scheduleRepository)
        {
            _configRepository = configRepository;
            _availabilityRepository = availabilityRepository;
            _scheduleRepository = scheduleRepository;
        }

        public async Task<AgentScheduleConfig> GetConfigByIdAsync(int id)
        {
            return await _configRepository.GetByIdAsync(id);
        }

        public async Task<AgentScheduleConfig> GetConfigByAgentAsync(int agentId)
        {
            return await _configRepository.GetByAgentIdAsync(agentId);
        }

        public async Task<IEnumerable<AgentScheduleConfig>> GetAllConfigsAsync()
        {
            return await _configRepository.GetAllAsync();
        }

        public async Task<AgentScheduleConfig> CreateConfigAsync(AgentScheduleConfig config)
        {
            // Check if config already exists for agent
            if (await _configRepository.ConfigExistsForAgentAsync(config.AgentId))
            {
                throw new InvalidOperationException($"Configuration already exists for agent ID {config.AgentId}");
            }

            config.CreatedAt = DateTime.UtcNow;
            return await _configRepository.AddAsync(config);
        }

        public async Task<AgentScheduleConfig> UpdateConfigAsync(AgentScheduleConfig config)
        {
            var existingConfig = await _configRepository.GetByIdAsync(config.Id);
            if (existingConfig == null)
                throw new KeyNotFoundException($"Configuration with ID {config.Id} not found.");

            config.UpdatedAt = DateTime.UtcNow;
            return await _configRepository.UpdateAsync(config);
        }

        public async Task<bool> DeleteConfigAsync(int id)
        {
            return await _configRepository.DeleteAsync(id);
        }

        public async Task<AgentScheduleConfig> GetOrCreateDefaultConfigAsync(int agentId)
        {
            var config = await _configRepository.GetByAgentIdAsync(agentId);
            if (config != null)
                return config;

            // Create default configuration with updated property names
            var defaultConfig = new AgentScheduleConfig
            {
                AgentId = agentId,
                SlotDurationMinutes = 60,
                MaxSchedulesPerDay = 8, // ✅ Fixed: Updated property name
                BufferTimeMinutes = 15,
                AllowWeekendScheduling = false, // ✅ Fixed: Updated property name
                WorkDayStart = new TimeSpan(9, 0, 0), // ✅ Fixed: Updated property name
                WorkDayEnd = new TimeSpan(17, 0, 0), // ✅ Fixed: Updated property name
                AdvanceBookingDays = 30,
                CreatedAt = DateTime.UtcNow
            };

            return await _configRepository.AddAsync(defaultConfig);
        }

        public async Task<bool> ValidateScheduleTimeAsync(int agentId, DateTime scheduleTime)
        {
            var config = await GetOrCreateDefaultConfigAsync(agentId);

            // Check if within advance booking window
            if (scheduleTime.Date > DateTime.Today.AddDays(config.AdvanceBookingDays))
                return false;

            // Check if weekend appointments are allowed
            if (!config.AllowWeekendScheduling && (scheduleTime.DayOfWeek == DayOfWeek.Saturday || scheduleTime.DayOfWeek == DayOfWeek.Sunday)) // ✅ Fixed: Updated property name
                return false;

            // Check if within working hours
            var scheduleTimeOfDay = scheduleTime.TimeOfDay;
            if (scheduleTimeOfDay < config.WorkDayStart || scheduleTimeOfDay > config.WorkDayEnd) // ✅ Fixed: Updated property names
                return false;

            // Check agent availability for the specific day and time
            return await _availabilityRepository.IsAgentAvailableAsync(agentId, scheduleTime.DayOfWeek, scheduleTimeOfDay);
        }

        public async Task<IEnumerable<TimeSpan>> GetAvailableTimeSlotsAsync(int agentId, DateTime date)
        {
            var config = await GetOrCreateDefaultConfigAsync(agentId);
            var availability = await _availabilityRepository.GetByAgentAndDayAsync(agentId, date.DayOfWeek);
            var scheduledAppointments = await _scheduleRepository.GetSchedulesByDateRangeAsync(date.Date, date.Date.AddDays(1));
            var agentSchedules = scheduledAppointments.Where(s => s.AgentId == agentId && s.Status != "Cancelled");

            var availableSlots = new List<TimeSpan>();
            var currentTime = config.WorkDayStart; // ✅ Fixed: Updated property name

            while (currentTime + TimeSpan.FromMinutes(config.SlotDurationMinutes) <= config.WorkDayEnd) // ✅ Fixed: Updated property name
            {
                var slotEnd = currentTime + TimeSpan.FromMinutes(config.SlotDurationMinutes);

                // Check if slot is within agent's availability
                var isAvailable = availability.Any(a =>
                    a.IsAvailable &&
                    a.StartTime <= currentTime &&
                    a.EndTime >= slotEnd);

                // Check if slot is not booked
                var isBooked = agentSchedules.Any(s =>
                    s.ScheduleTime.TimeOfDay >= currentTime &&
                    s.ScheduleTime.TimeOfDay < slotEnd);

                if (isAvailable && !isBooked && agentSchedules.Count() < config.MaxSchedulesPerDay) // ✅ Fixed: Updated property name
                {
                    availableSlots.Add(currentTime);
                }

                currentTime = currentTime.Add(TimeSpan.FromMinutes(config.SlotDurationMinutes + config.BufferTimeMinutes));
            }

            return availableSlots;
        }
    }
}