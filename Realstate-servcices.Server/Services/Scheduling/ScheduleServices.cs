using Realstate_servcices.Server.Entity.Properties;
using Realstate_servcices.Server.Entity.Scheduling;
using Realstate_servcices.Server.Repository.ScheduleDao;

namespace Realstate_servcices.Server.Services.Scheduling
{
    public class ScheduleServices : IScheduleServices
    {
        private readonly IScheduleRepository _scheduleRepository;

        public ScheduleServices(IScheduleRepository scheduleRepository)
        {
            _scheduleRepository = scheduleRepository;
        }

        public async Task<ScheduleDetailDto?> GetScheduleByIdAsync(int id)
        {
            var schedule = await _scheduleRepository.GetByIdAsync(id);
            return schedule != null ? MapToDetailDto(schedule) : null;
        }

        public async Task<ScheduleDetailDto?> GetScheduleByNoAsync(Guid scheduleNo)
        {
            var schedule = await _scheduleRepository.GetByScheduleNoAsync(scheduleNo);
            return schedule != null ? MapToDetailDto(schedule) : null;
        }

        public async Task<IEnumerable<ScheduleDetailDto>> GetAllSchedulesAsync()
        {
            var schedules = await _scheduleRepository.GetAllAsync();
            return schedules.Select(MapToDetailDto);
        }

        public async Task<IEnumerable<ScheduleDetailDto>> GetSchedulesByAgentAsync(int agentId)
        {
            var schedules = await _scheduleRepository.GetByAgentIdAsync(agentId);
            return schedules.Select(MapToDetailDto);
        }

        public async Task<IEnumerable<ScheduleDetailDto>> GetSchedulesByClientAsync(int clientId)
        {
            var schedules = await _scheduleRepository.GetByClientIdAsync(clientId);
            return schedules.Select(MapToDetailDto);
        }

        public async Task<IEnumerable<ScheduleDetailDto>> GetSchedulesByPropertyAsync(int propertyId)
        {
            var schedules = await _scheduleRepository.GetByPropertyIdAsync(propertyId);
            return schedules.Select(MapToDetailDto);
        }

        public async Task<IEnumerable<ScheduleDetailDto>> GetSchedulesByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            var schedules = await _scheduleRepository.GetSchedulesByDateRangeAsync(startDate, endDate);
            return schedules.Select(MapToDetailDto);
        }

        public async Task<IEnumerable<ScheduleDetailDto>> GetSchedulesByStatusAsync(string status)
        {
            var schedules = await _scheduleRepository.GetSchedulesByStatusAsync(status);
            return schedules.Select(MapToDetailDto);
        }

        public async Task<ScheduleDetailDto> CreateScheduleAsync(CreateScheduleDto createDto)
        {
            // Check if time slot is available
            var isAvailable = await _scheduleRepository.IsTimeSlotAvailableAsync(createDto.AgentId, createDto.ScheduleTime);
            if (!isAvailable)
            {
                throw new InvalidOperationException("The selected time slot is not available for this agent.");
            }

            var schedule = new ScheduleProperties
            {
                PropertyId = createDto.PropertyId,
                AgentId = createDto.AgentId,
                ClientId = createDto.ClientId,
                ScheduleTime = createDto.ScheduleTime,
                Notes = createDto.Notes,
                Status = "Scheduled"
            };

            var createdSchedule = await _scheduleRepository.CreateAsync(schedule);
            return MapToDetailDto(createdSchedule);
        }

        public async Task<ScheduleDetailDto?> UpdateScheduleAsync(int id, UpdateScheduleDto updateDto)
        {
            var existingSchedule = await _scheduleRepository.GetByIdAsync(id);
            if (existingSchedule == null)
                return null;

            // If schedule time is being updated, check availability
            if (updateDto.ScheduleTime.HasValue && updateDto.ScheduleTime.Value != existingSchedule.ScheduleTime)
            {
                var isAvailable = await _scheduleRepository.IsTimeSlotAvailableAsync(
                    existingSchedule.AgentId, updateDto.ScheduleTime.Value, id);

                if (!isAvailable)
                {
                    throw new InvalidOperationException("The selected time slot is not available for this agent.");
                }
            }

            // Update properties
            if (updateDto.ScheduleTime.HasValue)
                existingSchedule.ScheduleTime = updateDto.ScheduleTime.Value;

            if (!string.IsNullOrEmpty(updateDto.Status))
                existingSchedule.Status = updateDto.Status;

            if (updateDto.Notes != null)
                existingSchedule.Notes = updateDto.Notes;

            var updatedSchedule = await _scheduleRepository.UpdateAsync(id, existingSchedule);
            return updatedSchedule != null ? MapToDetailDto(updatedSchedule) : null;
        }

        public async Task<bool> CancelScheduleAsync(int id)
        {
            var schedule = await _scheduleRepository.GetByIdAsync(id);
            if (schedule == null)
                return false;

            schedule.Status = "Cancelled";
            schedule.UpdatedAt = DateTime.UtcNow;

            var result = await _scheduleRepository.UpdateAsync(id, schedule);
            return result != null;
        }

        public async Task<bool> CompleteScheduleAsync(int id)
        {
            var schedule = await _scheduleRepository.GetByIdAsync(id);
            if (schedule == null)
                return false;

            schedule.Status = "Completed";
            schedule.UpdatedAt = DateTime.UtcNow;

            var result = await _scheduleRepository.UpdateAsync(id, schedule);
            return result != null;
        }

        public async Task<bool> DeleteScheduleAsync(int id)
        {
            return await _scheduleRepository.DeleteAsync(id);
        }

        public async Task<bool> IsTimeSlotAvailableAsync(int agentId, DateTime scheduleTime, int? excludeScheduleId = null)
        {
            return await _scheduleRepository.IsTimeSlotAvailableAsync(agentId, scheduleTime, excludeScheduleId);
        }

        private static ScheduleDetailDto MapToDetailDto(ScheduleProperties schedule)
        {
            return new ScheduleDetailDto
            {
                Id = schedule.Id,
                ScheduleNo = schedule.ScheduleNo,
                ScheduleTime = schedule.ScheduleTime,
                Status = schedule.Status,
                Notes = schedule.Notes,
                CreatedAt = schedule.CreatedAt,
                UpdatedAt = schedule.UpdatedAt,
                Property = schedule.Property != null ? new PropertyHouseDto
                {
                    Id = schedule.Property.Id,
                    Title = schedule.Property.Title, // Adjust based on your PropertyHouse entity
                    Address = schedule.Property.Address // Adjust based on your PropertyHouse entity
                } : null,
                Agent = schedule.Agent != null ? new AgentDto
                {
                    Id = schedule.Agent.Id,
                    Name = schedule.Agent.Name, // Adjust based on your Agent entity
                    Email = schedule.Agent.Email // Adjust based on your Agent entity
                } : null,
                Client = schedule.Client != null ? new ClientDto
                {
                    Id = schedule.Client.Id,
                    Name = schedule.Client.Name, // Adjust based on your Client entity
                    Email = schedule.Client.Email // Adjust based on your Client entity
                } : null
            };
        }
    }
}
