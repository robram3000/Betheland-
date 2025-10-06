using AutoMapper;
using Realstate_servcices.Server.Dto.Property;
using Realstate_servcices.Server.Dto.Scheduling;
using Realstate_servcices.Server.Entity.Properties;
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

        public async Task<ScheduleResponseDto> GetScheduleByIdAsync(int id)
        {
            var schedule = await _scheduleRepository.GetByIdAsync(id);
            if (schedule == null)
            {
                return new ScheduleResponseDto { Success = false, Message = "Schedule not found." };
            }

            return new ScheduleResponseDto
            {
                Success = true,
                Message = "Schedule retrieved successfully.",
                Data = MapToDto(schedule)
            };
        }

        public async Task<ScheduleResponseDto> GetScheduleByNoAsync(Guid scheduleNo)
        {
            var schedule = await _scheduleRepository.GetByScheduleNoAsync(scheduleNo);
            if (schedule == null)
            {
                return new ScheduleResponseDto { Success = false, Message = "Schedule not found." };
            }

            return new ScheduleResponseDto
            {
                Success = true,
                Message = "Schedule retrieved successfully.",
                Data = MapToDto(schedule)
            };
        }

        public async Task<SchedulesResponseDto> GetAllSchedulesAsync()
        {
            var schedules = await _scheduleRepository.GetAllAsync();
            return new SchedulesResponseDto
            {
                Success = true,
                Message = "Schedules retrieved successfully.",
                Data = schedules.Select(MapToDto).ToList()
            };
        }

        public async Task<SchedulesResponseDto> GetSchedulesByAgentAsync(int agentId)
        {
            var schedules = await _scheduleRepository.GetByAgentIdAsync(agentId);
            return new SchedulesResponseDto
            {
                Success = true,
                Message = "Agent schedules retrieved successfully.",
                Data = schedules.Select(MapToDto).ToList()
            };
        }

        public async Task<SchedulesResponseDto> GetSchedulesByClientAsync(int clientId)
        {
            var schedules = await _scheduleRepository.GetByClientIdAsync(clientId);
            return new SchedulesResponseDto
            {
                Success = true,
                Message = "Client schedules retrieved successfully.",
                Data = schedules.Select(MapToDto).ToList()
            };
        }

        public async Task<SchedulesResponseDto> GetSchedulesByPropertyAsync(int propertyId)
        {
            var schedules = await _scheduleRepository.GetByPropertyIdAsync(propertyId);
            return new SchedulesResponseDto
            {
                Success = true,
                Message = "Property schedules retrieved successfully.",
                Data = schedules.Select(MapToDto).ToList()
            };
        }

        public async Task<SchedulesResponseDto> GetSchedulesByStatusAsync(string status)
        {
            var schedules = await _scheduleRepository.GetByStatusAsync(status);
            return new SchedulesResponseDto
            {
                Success = true,
                Message = $"Schedules with status '{status}' retrieved successfully.",
                Data = schedules.Select(MapToDto).ToList()
            };
        }

        public async Task<SchedulesResponseDto> GetSchedulesByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            var schedules = await _scheduleRepository.GetSchedulesByDateRangeAsync(startDate, endDate);
            return new SchedulesResponseDto
            {
                Success = true,
                Message = "Schedules for date range retrieved successfully.",
                Data = schedules.Select(MapToDto).ToList()
            };
        }

        public async Task<ScheduleResponseDto> CreateScheduleAsync(CreateScheduleDto createDto)
        {
            // Check if time slot is available
            var isAvailable = await _scheduleRepository.IsTimeSlotAvailableAsync(createDto.AgentId, createDto.ScheduleTime);
            if (!isAvailable)
            {
                return new ScheduleResponseDto { Success = false, Message = "Time slot is not available for the selected agent." };
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

            var createdSchedule = await _scheduleRepository.CreateAsync(schedule);
            return new ScheduleResponseDto
            {
                Success = true,
                Message = "Schedule created successfully.",
                Data = MapToDto(createdSchedule)
            };
        }

        public async Task<ScheduleResponseDto> UpdateScheduleAsync(int id, UpdateScheduleDto updateDto)
        {
            var existingSchedule = await _scheduleRepository.GetByIdAsync(id);
            if (existingSchedule == null)
            {
                return new ScheduleResponseDto { Success = false, Message = "Schedule not found." };
            }

            // If changing time, check availability
            if (existingSchedule.ScheduleTime != updateDto.ScheduleTime)
            {
                var isAvailable = await _scheduleRepository.IsTimeSlotAvailableAsync(existingSchedule.AgentId, updateDto.ScheduleTime);
                if (!isAvailable)
                {
                    return new ScheduleResponseDto { Success = false, Message = "New time slot is not available for the agent." };
                }
            }

            existingSchedule.ScheduleTime = updateDto.ScheduleTime;
            existingSchedule.Status = updateDto.Status;
            existingSchedule.Notes = updateDto.Notes;
            existingSchedule.UpdatedAt = DateTime.UtcNow;

            var updatedSchedule = await _scheduleRepository.UpdateAsync(id, existingSchedule);
            if (updatedSchedule == null)
            {
                return new ScheduleResponseDto { Success = false, Message = "Failed to update schedule." };
            }

            return new ScheduleResponseDto
            {
                Success = true,
                Message = "Schedule updated successfully.",
                Data = MapToDto(updatedSchedule)
            };
        }

        public async Task<ScheduleResponseDto> CancelScheduleAsync(int id)
        {
            var schedule = await _scheduleRepository.GetByIdAsync(id);
            if (schedule == null)
            {
                return new ScheduleResponseDto { Success = false, Message = "Schedule not found." };
            }

            schedule.Status = "Cancelled";
            schedule.UpdatedAt = DateTime.UtcNow;

            var updatedSchedule = await _scheduleRepository.UpdateAsync(id, schedule);
            if (updatedSchedule == null)
            {
                return new ScheduleResponseDto { Success = false, Message = "Failed to cancel schedule." };
            }

            return new ScheduleResponseDto
            {
                Success = true,
                Message = "Schedule cancelled successfully.",
                Data = MapToDto(updatedSchedule)
            };
        }

        public async Task<ScheduleResponseDto> CompleteScheduleAsync(int id)
        {
            var schedule = await _scheduleRepository.GetByIdAsync(id);
            if (schedule == null)
            {
                return new ScheduleResponseDto { Success = false, Message = "Schedule not found." };
            }

            schedule.Status = "Completed";
            schedule.UpdatedAt = DateTime.UtcNow;

            var updatedSchedule = await _scheduleRepository.UpdateAsync(id, schedule);
            if (updatedSchedule == null)
            {
                return new ScheduleResponseDto { Success = false, Message = "Failed to complete schedule." };
            }

            return new ScheduleResponseDto
            {
                Success = true,
                Message = "Schedule completed successfully.",
                Data = MapToDto(updatedSchedule)
            };
        }

        public async Task<bool> DeleteScheduleAsync(int id)
        {
            return await _scheduleRepository.DeleteAsync(id);
        }

        public async Task<bool> IsTimeSlotAvailableAsync(int agentId, DateTime scheduleTime)
        {
            return await _scheduleRepository.IsTimeSlotAvailableAsync(agentId, scheduleTime);
        }

        private ScheduleDto MapToDto(ScheduleProperties schedule)
        {
            return new ScheduleDto
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
                PropertyTitle = schedule.Property?.Title,
                PropertyAddress = schedule.Property?.Address,
                AgentName = $"{schedule.Agent?.FirstName} {schedule.Agent?.LastName}",
                ClientName = $"{schedule.Client?.FirstName} {schedule.Client?.LastName}"
            };
        }
    }
}
