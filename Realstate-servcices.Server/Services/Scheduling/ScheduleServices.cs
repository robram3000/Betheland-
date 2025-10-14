using AutoMapper;
using Realstate_servcices.Server.Dto.Property;
using Realstate_servcices.Server.Dto.Scheduling;
using Realstate_servcices.Server.Entity.Properties;
using Realstate_servcices.Server.Repository.ScheduleDao;

namespace Realstate_servcices.Server.Services.Scheduling
{
    public class SchedulingServices : ISchedulingServices
    {
        private readonly ISchedulingRepository _schedulingRepository;

        public SchedulingServices(ISchedulingRepository schedulingRepository)
        {
            _schedulingRepository = schedulingRepository;
        }

        public async Task<ScheduleResponseDto?> GetScheduleByIdAsync(int id)
        {
            var schedule = await _schedulingRepository.GetByIdAsync(id);
            return schedule != null ? MapToDto(schedule) : null;
        }

        public async Task<IEnumerable<ScheduleResponseDto>> GetAllSchedulesAsync()
        {
            var schedules = await _schedulingRepository.GetAllAsync();
            return schedules.Select(MapToDto);
        }

        public async Task<IEnumerable<ScheduleResponseDto>> GetSchedulesByAgentAsync(int agentId)
        {
            var schedules = await _schedulingRepository.GetByAgentIdAsync(agentId);
            return schedules.Select(MapToDto);
        }

        public async Task<IEnumerable<ScheduleResponseDto>> GetSchedulesByClientAsync(int clientId)
        {
            var schedules = await _schedulingRepository.GetByClientIdAsync(clientId);
            return schedules.Select(MapToDto);
        }

        public async Task<IEnumerable<ScheduleResponseDto>> GetSchedulesByPropertyAsync(int propertyId)
        {
            var schedules = await _schedulingRepository.GetByPropertyIdAsync(propertyId);
            return schedules.Select(MapToDto);
        }

        public async Task<IEnumerable<ScheduleResponseDto>> GetUpcomingSchedulesAsync(int days = 7)
        {
            var schedules = await _schedulingRepository.GetUpcomingSchedulesAsync(days);
            return schedules.Select(MapToDto);
        }

        public async Task<ScheduleResponseDto> CreateScheduleAsync(CreateScheduleDto createDto)
        {
            // Validate time slot availability
            var isAvailable = await _schedulingRepository.IsTimeSlotAvailableAsync(
                createDto.AgentId, createDto.ScheduleTime);

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
                Status = "Scheduled",
                CreatedAt = DateTime.UtcNow
            };

            var createdSchedule = await _schedulingRepository.CreateAsync(schedule);
            return MapToDto(createdSchedule);
        }

        public async Task<ScheduleResponseDto?> UpdateScheduleAsync(int id, UpdateScheduleDto updateDto)
        {
            var existingSchedule = await _schedulingRepository.GetByIdAsync(id);
            if (existingSchedule == null)
                return null;

            // If time is changed, check availability
            if (existingSchedule.ScheduleTime != updateDto.ScheduleTime)
            {
                var isAvailable = await _schedulingRepository.IsTimeSlotAvailableAsync(
                    existingSchedule.AgentId, updateDto.ScheduleTime);

                if (!isAvailable)
                {
                    throw new InvalidOperationException("The selected time slot is not available for this agent.");
                }
            }

            existingSchedule.ScheduleTime = updateDto.ScheduleTime;
            existingSchedule.Status = updateDto.Status;
            existingSchedule.Notes = updateDto.Notes;
            existingSchedule.UpdatedAt = DateTime.UtcNow;

            var updatedSchedule = await _schedulingRepository.UpdateAsync(existingSchedule);
            return MapToDto(updatedSchedule);
        }

        public async Task<bool> CancelScheduleAsync(int id)
        {
            var schedule = await _schedulingRepository.GetByIdAsync(id);
            if (schedule == null)
                return false;

            schedule.Status = "Cancelled";
            schedule.UpdatedAt = DateTime.UtcNow;
            await _schedulingRepository.UpdateAsync(schedule);
            return true;
        }

        public async Task<bool> CompleteScheduleAsync(int id)
        {
            var schedule = await _schedulingRepository.GetByIdAsync(id);
            if (schedule == null)
                return false;

            schedule.Status = "Completed";
            schedule.UpdatedAt = DateTime.UtcNow;
            await _schedulingRepository.UpdateAsync(schedule);
            return true;
        }

        public async Task<bool> DeleteScheduleAsync(int id)
        {
            return await _schedulingRepository.DeleteAsync(id);
        }

        public async Task<bool> IsTimeSlotAvailableAsync(int agentId, DateTime scheduleTime)
        {
            return await _schedulingRepository.IsTimeSlotAvailableAsync(agentId, scheduleTime);
        }

        private static ScheduleResponseDto MapToDto(ScheduleProperties schedule)
        {
            return new ScheduleResponseDto
            {
                Id = schedule.Id,
                ScheduleNo = schedule.ScheduleNo,
                PropertyId = schedule.PropertyId,
                AgentId = schedule.AgentId,
                ClientId = schedule.ClientId,
                ScheduleTime = schedule.ScheduleTime,
                Status = schedule.Status,
                Notes = schedule.Notes,
                CreatedAt = schedule.CreatedAt,
                UpdatedAt = schedule.UpdatedAt,
                PropertyTitle = schedule.Property?.Title ?? string.Empty,
                AgentName = $"{schedule.Agent?.FirstName} {schedule.Agent?.LastName}",
                ClientName = $"{schedule.Client?.FirstName} {schedule.Client?.LastName}",
                PropertyAddress = schedule.Property?.Address ?? string.Empty
            };
        }
    }
}
