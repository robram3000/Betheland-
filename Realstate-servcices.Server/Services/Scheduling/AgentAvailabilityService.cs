using Realstate_servcices.Server.Entity.Schedule;
using Realstate_servcices.Server.Repositories;

namespace Realstate_servcices.Server.Services.Scheduling
{
    public interface IAgentAvailabilityService
    {
        Task<AgentAvailability> GetAvailabilityByIdAsync(int id);
        Task<IEnumerable<AgentAvailability>> GetAvailabilitiesByAgentAsync(int agentId);
        Task<IEnumerable<AgentAvailability>> GetAvailabilitiesByAgentAndDayAsync(int agentId, DayOfWeek dayOfWeek);
        Task<IEnumerable<AgentAvailability>> GetAllAvailabilitiesAsync();
        Task<AgentAvailability> CreateAvailabilityAsync(AgentAvailability availability);
        Task<AgentAvailability> UpdateAvailabilityAsync(AgentAvailability availability);
        Task<bool> DeleteAvailabilityAsync(int id);
        Task<bool> SetAgentAvailabilityAsync(int agentId, List<AgentAvailability> availabilities);
        Task<bool> IsAgentAvailableAsync(int agentId, DateTime dateTime);
        Task<IEnumerable<DayOfWeek>> GetAvailableDaysAsync(int agentId);
    }

    public class AgentAvailabilityService : IAgentAvailabilityService
    {
        private readonly IAgentAvailabilityRepository _availabilityRepository;
        private readonly IAgentTimeOffRepository _timeOffRepository;

        public AgentAvailabilityService(
            IAgentAvailabilityRepository availabilityRepository,
            IAgentTimeOffRepository timeOffRepository)
        {
            _availabilityRepository = availabilityRepository;
            _timeOffRepository = timeOffRepository;
        }

        public async Task<AgentAvailability> GetAvailabilityByIdAsync(int id)
        {
            return await _availabilityRepository.GetByIdAsync(id);
        }

        public async Task<IEnumerable<AgentAvailability>> GetAvailabilitiesByAgentAsync(int agentId)
        {
            return await _availabilityRepository.GetByAgentIdAsync(agentId);
        }

        public async Task<IEnumerable<AgentAvailability>> GetAvailabilitiesByAgentAndDayAsync(int agentId, DayOfWeek dayOfWeek)
        {
            return await _availabilityRepository.GetByAgentAndDayAsync(agentId, dayOfWeek);
        }

        public async Task<IEnumerable<AgentAvailability>> GetAllAvailabilitiesAsync()
        {
            return await _availabilityRepository.GetAllAsync();
        }

        public async Task<AgentAvailability> CreateAvailabilityAsync(AgentAvailability availability)
        {
            // Check for overlapping availability
            var existingAvailabilities = await _availabilityRepository.GetByAgentAndDayAsync(
                availability.AgentId, availability.DayOfWeek);

            var hasOverlap = existingAvailabilities.Any(a =>
                a.IsAvailable && availability.IsAvailable &&
                ((availability.StartTime >= a.StartTime && availability.StartTime < a.EndTime) ||
                 (availability.EndTime > a.StartTime && availability.EndTime <= a.EndTime) ||
                 (availability.StartTime <= a.StartTime && availability.EndTime >= a.EndTime)));

            if (hasOverlap)
            {
                throw new InvalidOperationException("The availability period overlaps with existing availability.");
            }

            availability.CreatedAt = DateTime.UtcNow;
            return await _availabilityRepository.AddAsync(availability);
        }

        public async Task<AgentAvailability> UpdateAvailabilityAsync(AgentAvailability availability)
        {
            try
            {
                Console.WriteLine($"UpdateAvailabilityAsync called with ID: {availability.Id}, AgentId: {availability.AgentId}, Day: {availability.DayOfWeek}");

                var existingAvailability = await _availabilityRepository.GetByIdAsync(availability.Id);
                if (existingAvailability == null)
                {
                    Console.WriteLine($"Availability with ID {availability.Id} not found");
                    throw new KeyNotFoundException($"Availability with ID {availability.Id} not found.");
                }

                Console.WriteLine($"Found existing availability: AgentId: {existingAvailability.AgentId}, Day: {existingAvailability.DayOfWeek}");

                // Check for overlapping availability (excluding the current one being updated)
                var existingAvailabilities = await _availabilityRepository.GetByAgentAndDayAsync(
                    availability.AgentId, availability.DayOfWeek);

                Console.WriteLine($"Found {existingAvailabilities.Count()} existing availabilities for this agent and day");

                var hasOverlap = existingAvailabilities.Any(a =>
                    a.Id != availability.Id && // Exclude current record
                    a.IsAvailable && availability.IsAvailable &&
                    ((availability.StartTime >= a.StartTime && availability.StartTime < a.EndTime) ||
                     (availability.EndTime > a.StartTime && availability.EndTime <= a.EndTime) ||
                     (availability.StartTime <= a.StartTime && availability.EndTime >= a.EndTime)));

                if (hasOverlap)
                {
                    Console.WriteLine("Overlap detected with existing availability");
                    throw new InvalidOperationException("The availability period overlaps with existing availability.");
                }

                // Preserve original creation date
                availability.CreatedAt = existingAvailability.CreatedAt;
                availability.UpdatedAt = DateTime.UtcNow;

                Console.WriteLine($"Updating availability with StartTime: {availability.StartTime}, EndTime: {availability.EndTime}");

                var result = await _availabilityRepository.UpdateAsync(availability);
                Console.WriteLine("Update successful");

                return result;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in UpdateAvailabilityAsync: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                throw;
            }
        }

        public async Task<bool> DeleteAvailabilityAsync(int id)
        {
            return await _availabilityRepository.DeleteAsync(id);
        }

        public async Task<bool> SetAgentAvailabilityAsync(int agentId, List<AgentAvailability> availabilities)
        {
            // Remove existing availabilities for the agent
            await _availabilityRepository.DeleteByAgentIdAsync(agentId);

            // Add new availabilities
            foreach (var availability in availabilities)
            {
                availability.AgentId = agentId;
                availability.CreatedAt = DateTime.UtcNow;
                await _availabilityRepository.AddAsync(availability);
            }

            return true;
        }

        public async Task<bool> IsAgentAvailableAsync(int agentId, DateTime dateTime)
        {
            // Check if agent is on time off
            if (await _timeOffRepository.IsAgentOnTimeOffAsync(agentId, dateTime))
                return false;

            // Check availability for the specific day and time
            var dayOfWeek = dateTime.DayOfWeek;
            var time = dateTime.TimeOfDay;

            return await _availabilityRepository.IsAgentAvailableAsync(agentId, dayOfWeek, time);
        }

        public async Task<IEnumerable<DayOfWeek>> GetAvailableDaysAsync(int agentId)
        {
            var availabilities = await _availabilityRepository.GetByAgentIdAsync(agentId);
            return availabilities
                .Where(a => a.IsAvailable)
                .Select(a => a.DayOfWeek)
                .Distinct()
                .OrderBy(d => d)
                .ToList();
        }
    }
}