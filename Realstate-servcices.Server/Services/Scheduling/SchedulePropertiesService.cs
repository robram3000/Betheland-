using Microsoft.EntityFrameworkCore;
using Realstate_servcices.Server.Data;
using Realstate_servcices.Server.Dto.Scheduling;
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
        Task<bool> AcceptScheduleAsync(int id);
        Task<bool> CancelScheduleAsync(int id, string cancellationReason = "");
        Task<bool> RescheduleAsync(int id, DateTime newScheduleTime, string reason = "");
        Task<bool> CompleteScheduleAsync(int id);
        Task<bool> ReopenScheduleAsync(int id);
        Task<bool> DeleteScheduleAsync(int id);
        Task<bool> IsTimeSlotAvailableAsync(int agentId, DateTime scheduleTime);
        Task<object> DebugTimeSlotAvailabilityAsync(int agentId, DateTime scheduleTime);
        Task<IEnumerable<string>> GetAvailableStatusTransitionsAsync(int id);
        bool CanScheduleBeEdited(ScheduleProperties schedule);
        bool CanScheduleBeDeleted(ScheduleProperties schedule);

        // New DTO methods
        Task<ScheduleResponseDto> GetScheduleByIdDtoAsync(int id);
        Task<IEnumerable<ScheduleResponseDto>> GetAllSchedulesDtoAsync();
        Task<IEnumerable<ScheduleResponseDto>> GetSchedulesByAgentDtoAsync(int agentId);
        Task<IEnumerable<ScheduleResponseDto>> GetSchedulesByClientDtoAsync(int clientId);
        Task<IEnumerable<ScheduleResponseDto>> GetSchedulesByPropertyDtoAsync(int propertyId);
        Task<IEnumerable<ScheduleResponseDto>> GetSchedulesByStatusDtoAsync(string status);
        Task<IEnumerable<ScheduleResponseDto>> GetSchedulesByDateRangeDtoAsync(DateTime startDate, DateTime endDate);
    }

    public class SchedulePropertiesService : ISchedulePropertiesService
    {
        private readonly ISchedulePropertiesRepository _scheduleRepository;
        private readonly IAgentTimeOffRepository _timeOffRepository;
        private readonly IAgentAvailabilityRepository _availabilityRepository;
        private readonly ApplicationDbContext _context;
        private readonly ILogger<SchedulePropertiesService> _logger;

        public SchedulePropertiesService(
            ISchedulePropertiesRepository scheduleRepository,
            IAgentTimeOffRepository timeOffRepository,
            IAgentAvailabilityRepository availabilityRepository,
            ApplicationDbContext context,
            ILogger<SchedulePropertiesService> logger)
        {
            _scheduleRepository = scheduleRepository;
            _timeOffRepository = timeOffRepository;
            _availabilityRepository = availabilityRepository;
            _context = context;
            _logger = logger;
        }

        public async Task<ScheduleProperties> GetScheduleByIdAsync(int id)
        {
            return await _scheduleRepository.GetByIdAsync(id);
        }

        public async Task<ScheduleResponseDto> GetScheduleByIdDtoAsync(int id)
        {
            var schedule = await _scheduleRepository.GetByIdAsync(id);
            return MapToDto(schedule);
        }

        public async Task<ScheduleProperties> GetScheduleByNoAsync(Guid scheduleNo)
        {
            return await _scheduleRepository.GetByScheduleNoAsync(scheduleNo);
        }

        public async Task<IEnumerable<ScheduleProperties>> GetAllSchedulesAsync()
        {
            return await _scheduleRepository.GetAllAsync();
        }

        public async Task<IEnumerable<ScheduleResponseDto>> GetAllSchedulesDtoAsync()
        {
            var schedules = await _scheduleRepository.GetAllAsync();
            return schedules.Select(MapToDto).ToList();
        }

        public async Task<IEnumerable<ScheduleProperties>> GetSchedulesByAgentAsync(int agentId)
        {
            return await _scheduleRepository.GetByAgentIdAsync(agentId);
        }

        public async Task<IEnumerable<ScheduleResponseDto>> GetSchedulesByAgentDtoAsync(int agentId)
        {
            var schedules = await _scheduleRepository.GetByAgentIdAsync(agentId);
            return schedules.Select(MapToDto).ToList();
        }

        public async Task<IEnumerable<ScheduleProperties>> GetSchedulesByClientAsync(int clientId)
        {
            return await _scheduleRepository.GetByClientIdAsync(clientId);
        }

        public async Task<IEnumerable<ScheduleResponseDto>> GetSchedulesByClientDtoAsync(int clientId)
        {
            var schedules = await _scheduleRepository.GetByClientIdAsync(clientId);
            return schedules.Select(MapToDto).ToList();
        }

        public async Task<IEnumerable<ScheduleProperties>> GetSchedulesByPropertyAsync(int propertyId)
        {
            return await _scheduleRepository.GetByPropertyIdAsync(propertyId);
        }

        public async Task<IEnumerable<ScheduleResponseDto>> GetSchedulesByPropertyDtoAsync(int propertyId)
        {
            var schedules = await _scheduleRepository.GetByPropertyIdAsync(propertyId);
            return schedules.Select(MapToDto).ToList();
        }

        public async Task<IEnumerable<ScheduleProperties>> GetSchedulesByStatusAsync(string status)
        {
            return await _scheduleRepository.GetByStatusAsync(status);
        }

        public async Task<IEnumerable<ScheduleResponseDto>> GetSchedulesByStatusDtoAsync(string status)
        {
            var schedules = await _scheduleRepository.GetByStatusAsync(status);
            return schedules.Select(MapToDto).ToList();
        }

        public async Task<IEnumerable<ScheduleProperties>> GetSchedulesByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            return await _scheduleRepository.GetSchedulesByDateRangeAsync(startDate, endDate);
        }

        public async Task<IEnumerable<ScheduleResponseDto>> GetSchedulesByDateRangeDtoAsync(DateTime startDate, DateTime endDate)
        {
            var schedules = await _scheduleRepository.GetSchedulesByDateRangeAsync(startDate, endDate);
            return schedules.Select(MapToDto).ToList();
        }

        public async Task<ScheduleProperties> CreateScheduleAsync(ScheduleProperties schedule)
        {
            try
            {
                _logger.LogInformation("=== CREATE SCHEDULE START ===");
                _logger.LogInformation("PropertyId: {PropertyId}", schedule.PropertyId);
                _logger.LogInformation("AgentId: {AgentId}", schedule.AgentId);
                _logger.LogInformation("ClientId: {ClientId}", schedule.ClientId);
                _logger.LogInformation("ScheduleTime: {ScheduleTime}", schedule.ScheduleTime);

                // Validate that all foreign key entities exist
                _logger.LogInformation("Validating foreign keys...");

                // Check if Agent exists
                var agentExists = await _context.Agents.AnyAsync(a => a.BaseMemberId == schedule.AgentId);
                if (!agentExists)
                {
                    throw new InvalidOperationException($"Agent with ID {schedule.AgentId} does not exist.");
                }

                // Check if Client exists
                var clientExists = await _context.Clients.AnyAsync(c => c.BaseMemberId == schedule.ClientId);
                if (!clientExists)
                {
                    throw new InvalidOperationException($"Client with ID {schedule.ClientId} does not exist.");
                }

                _logger.LogInformation("All foreign key validations passed");

                // Validate time slot availability
                var isAvailable = await IsTimeSlotAvailableAsync(schedule.AgentId, schedule.ScheduleTime);
                _logger.LogInformation("Time slot availability: {IsAvailable}", isAvailable);

                if (!isAvailable)
                {
                    throw new InvalidOperationException("The selected time slot is not available for scheduling.");
                }

                // Ensure all required fields are set
                schedule.ScheduleNo = Guid.NewGuid();
                schedule.Status = schedule.Status ?? "Pending";
                schedule.CreatedAt = DateTime.UtcNow;

                // Make sure ScheduleEndTime is set
                if (schedule.ScheduleEndTime == default)
                {
                    schedule.ScheduleEndTime = schedule.ScheduleTime.AddHours(1);
                }

                // Clear navigation properties to avoid EF tracking issues
                schedule.Property = null;
                schedule.Agent = null;
                schedule.Client = null;

                _logger.LogInformation("Attempting to save schedule to database...");

                var result = await _scheduleRepository.AddAsync(schedule);

                _logger.LogInformation("=== CREATE SCHEDULE SUCCESS ===");
                _logger.LogInformation("Created schedule with ID: {ScheduleId}", result.Id);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating schedule: {ErrorMessage}", ex.Message);
                throw;
            }
        }

        public async Task<ScheduleProperties> UpdateScheduleAsync(ScheduleProperties schedule)
        {
            var existingSchedule = await _scheduleRepository.GetByIdAsync(schedule.Id);
            if (existingSchedule == null)
                throw new KeyNotFoundException($"Schedule with ID {schedule.Id} not found.");

            // Check if schedule can be edited
            if (!CanScheduleBeEdited(existingSchedule))
                throw new InvalidOperationException("Cannot edit a schedule that is Completed or Cancelled.");

            // If schedule time changed, validate availability
            if (existingSchedule.ScheduleTime != schedule.ScheduleTime &&
                !await IsTimeSlotAvailableAsync(schedule.AgentId, schedule.ScheduleTime))
            {
                throw new InvalidOperationException("The selected time slot is not available for scheduling.");
            }

            schedule.UpdatedAt = DateTime.UtcNow;
            return await _scheduleRepository.UpdateAsync(schedule);
        }

        public async Task<bool> AcceptScheduleAsync(int id)
        {
            var schedule = await _scheduleRepository.GetByIdAsync(id);
            if (schedule == null)
                return false;

            // Validate status transition
            if (schedule.Status != "Pending")
                throw new InvalidOperationException($"Cannot accept schedule with status: {schedule.Status}");

            schedule.Status = "Scheduled";
            schedule.UpdatedAt = DateTime.UtcNow;
            await _scheduleRepository.UpdateAsync(schedule);
            return true;
        }

        public async Task<bool> CancelScheduleAsync(int id, string cancellationReason = "")
        {
            var schedule = await _scheduleRepository.GetByIdAsync(id);
            if (schedule == null)
                return false;

            // Validate status transition
            if (schedule.Status == "Completed" || schedule.Status == "Cancelled")
                throw new InvalidOperationException($"Cannot cancel schedule with status: {schedule.Status}");

            schedule.Status = "Cancelled";
            schedule.CancellationReason = cancellationReason;
            schedule.UpdatedAt = DateTime.UtcNow;
            schedule.CancelledAt = DateTime.UtcNow;
            await _scheduleRepository.UpdateAsync(schedule);
            return true;
        }

        public async Task<bool> RescheduleAsync(int id, DateTime newScheduleTime, string reason = "")
        {
            var schedule = await _scheduleRepository.GetByIdAsync(id);
            if (schedule == null)
                return false;

            // Validate status transition
            if (schedule.Status == "Completed" || schedule.Status == "Cancelled")
                throw new InvalidOperationException($"Cannot reschedule schedule with status: {schedule.Status}");

            // Validate new time slot availability
            if (!await IsTimeSlotAvailableAsync(schedule.AgentId, newScheduleTime))
            {
                throw new InvalidOperationException("The selected time slot is not available for rescheduling.");
            }

            schedule.ScheduleTime = newScheduleTime;
            schedule.ScheduleEndTime = newScheduleTime.AddHours(1);
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

            // Validate status transition
            if (schedule.Status != "Scheduled" && schedule.Status != "Rescheduled")
                throw new InvalidOperationException($"Cannot complete schedule with status: {schedule.Status}");

            schedule.Status = "Completed";
            schedule.UpdatedAt = DateTime.UtcNow;
            schedule.CompletedAt = DateTime.UtcNow;
            await _scheduleRepository.UpdateAsync(schedule);
            return true;
        }

        public async Task<bool> ReopenScheduleAsync(int id)
        {
            var schedule = await _scheduleRepository.GetByIdAsync(id);
            if (schedule == null)
                return false;

            // Validate status transition - only allow reopening from Cancelled
            if (schedule.Status != "Cancelled")
                throw new InvalidOperationException($"Cannot reopen schedule with status: {schedule.Status}");

            schedule.Status = "Pending";
            schedule.CancellationReason = null;
            schedule.CancelledAt = null;
            schedule.UpdatedAt = DateTime.UtcNow;
            await _scheduleRepository.UpdateAsync(schedule);
            return true;
        }

        public async Task<bool> DeleteScheduleAsync(int id)
        {
            var schedule = await _scheduleRepository.GetByIdAsync(id);
            if (schedule == null)
                return false;

            // Check if schedule can be deleted
            if (!CanScheduleBeDeleted(schedule))
                throw new InvalidOperationException("Cannot delete a schedule that is Completed or Cancelled.");

            return await _scheduleRepository.DeleteAsync(id);
        }

        public bool CanScheduleBeEdited(ScheduleProperties schedule)
        {
            return schedule.Status != "Completed" && schedule.Status != "Cancelled";
        }

        public bool CanScheduleBeDeleted(ScheduleProperties schedule)
        {
            return schedule.Status != "Completed" && schedule.Status != "Cancelled";
        }

        public async Task<IEnumerable<string>> GetAvailableStatusTransitionsAsync(int id)
        {
            var schedule = await _scheduleRepository.GetByIdAsync(id);
            if (schedule == null)
                return Enumerable.Empty<string>();

            var currentStatus = schedule.Status;
            var availableTransitions = new List<string>();

            switch (currentStatus)
            {
                case "Pending":
                    availableTransitions.AddRange(new[] { "Scheduled", "Cancelled" });
                    break;
                case "Scheduled":
                    availableTransitions.AddRange(new[] { "Completed", "Cancelled", "Rescheduled" });
                    break;
                case "Rescheduled":
                    availableTransitions.AddRange(new[] { "Completed", "Cancelled" });
                    break;
                case "Cancelled":
                    availableTransitions.Add("Pending"); // Reopen
                    break;
                case "Completed":
                    // No transitions from Completed
                    break;
            }

            return availableTransitions;
        }

        public async Task<bool> IsTimeSlotAvailableAsync(int agentId, DateTime scheduleTime)
        {
            try
            {
                Console.WriteLine($"=== AVAILABILITY CHECK DEBUG ===");
                Console.WriteLine($"AgentId: {agentId}");
                Console.WriteLine($"ScheduleTime: {scheduleTime}");
                Console.WriteLine($"ScheduleTime (Local): {scheduleTime.ToLocalTime()}");
                Console.WriteLine($"ScheduleTime (UTC): {scheduleTime.ToUniversalTime()}");
                Console.WriteLine($"DayOfWeek: {scheduleTime.DayOfWeek}");
                Console.WriteLine($"TimeOfDay: {scheduleTime.TimeOfDay}");

                var debugInfo = await DebugTimeSlotAvailabilityAsync(agentId, scheduleTime);
                var isAvailable = (bool)debugInfo.GetType().GetProperty("IsAvailable").GetValue(debugInfo);

                Console.WriteLine($"IsAvailable: {isAvailable}");
                Console.WriteLine($"=== END AVAILABILITY CHECK ===");

                return isAvailable;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in availability check: {ex.Message}");
                // Fail open to not block scheduling
                return true;
            }
        }

        // New comprehensive debug method
        public async Task<object> DebugTimeSlotAvailabilityAsync(int agentId, DateTime scheduleTime)
        {
            var debugInfo = new
            {
                AgentId = agentId,
                ScheduleTime = scheduleTime,
                DayOfWeek = scheduleTime.DayOfWeek,
                TimeOfDay = scheduleTime.TimeOfDay,
                Checks = new List<string>(),
                IsAvailable = true,
                FailedCheck = ""
            };

            try
            {
                // 1. Check if agent is on time off
                var isOnTimeOff = await _timeOffRepository.IsAgentOnTimeOffAsync(agentId, scheduleTime);
                debugInfo.Checks.Add($"Time Off Check: {(isOnTimeOff ? "FAILED - Agent on time off" : "PASSED")}");

                if (isOnTimeOff)
                {
                    return new
                    {
                        debugInfo.AgentId,
                        debugInfo.ScheduleTime,
                        debugInfo.DayOfWeek,
                        debugInfo.TimeOfDay,
                        Checks = debugInfo.Checks,
                        IsAvailable = false,
                        FailedCheck = "Agent is on time off"
                    };
                }

                // 2. Check existing schedules for conflicts
                var existingSchedules = await _scheduleRepository.GetSchedulesByDateRangeAsync(
                    scheduleTime.Date, scheduleTime.Date.AddDays(1));

                var agentSchedules = existingSchedules
                    .Where(s => s.AgentId == agentId && s.Status != "Cancelled")
                    .ToList();

                debugInfo.Checks.Add($"Found {agentSchedules.Count} existing schedules for this date");

                var conflictingSchedule = agentSchedules.Any(s =>
                {
                    var timeDiff = Math.Abs((s.ScheduleTime - scheduleTime).TotalMinutes);
                    var hasConflict = timeDiff < 60; // 1-hour buffer
                    if (hasConflict)
                    {
                        debugInfo.Checks.Add($"Schedule conflict: Existing at {s.ScheduleTime} (diff: {timeDiff} min)");
                    }
                    return hasConflict;
                });

                debugInfo.Checks.Add($"Schedule Conflict Check: {(conflictingSchedule ? "FAILED - Conflicting schedule" : "PASSED")}");

                if (conflictingSchedule)
                {
                    return new
                    {
                        debugInfo.AgentId,
                        debugInfo.ScheduleTime,
                        debugInfo.DayOfWeek,
                        debugInfo.TimeOfDay,
                        Checks = debugInfo.Checks,
                        IsAvailable = false,
                        FailedCheck = "Conflicting schedule exists"
                    };
                }

                // 3. Check agent availability data
                var dayOfWeek = scheduleTime.DayOfWeek;
                var timeOfDay = scheduleTime.TimeOfDay;

                // Get all availability slots for this agent and day
                var availabilitySlots = await _availabilityRepository.GetByAgentAndDayAsync(agentId, dayOfWeek);

                // Log each availability slot
                foreach (var slot in availabilitySlots)
                {
                    debugInfo.Checks.Add($"Slot: {slot.StartTime} - {slot.EndTime}, Available: {slot.IsAvailable}");
                }

                // Check if any availability slot covers the requested time
                var isAvailableFromData = availabilitySlots.Any(a =>
                    a.IsAvailable &&
                    a.StartTime <= timeOfDay &&
                    a.EndTime >= timeOfDay);

                debugInfo.Checks.Add($"Availability Data Check: {(isAvailableFromData ? "PASSED" : "FAILED - No matching availability slot")}");

                if (!isAvailableFromData)
                {
                    // Check if we have any availability data at all for this agent
                    var hasAnyAvailabilityData = await _context.AgentAvailabilities.AnyAsync(a => a.AgentId == agentId);
                    debugInfo.Checks.Add($"Has any availability data: {hasAnyAvailabilityData}");

                    if (!hasAnyAvailabilityData)
                    {
                        debugInfo.Checks.Add("No availability data found, using default business hours");
                        // Default fallback: 9 AM - 5 PM on weekdays
                        var isWeekday = scheduleTime.DayOfWeek >= DayOfWeek.Monday &&
                                       scheduleTime.DayOfWeek <= DayOfWeek.Friday;
                        var isBusinessHours = timeOfDay >= new TimeSpan(9, 0, 0) &&
                                            timeOfDay <= new TimeSpan(17, 0, 0);

                        var fallbackAvailable = isWeekday && isBusinessHours;
                        debugInfo.Checks.Add($"Fallback Check: Weekday={isWeekday}, BusinessHours={isBusinessHours}, Available={fallbackAvailable}");

                        return new
                        {
                            debugInfo.AgentId,
                            debugInfo.ScheduleTime,
                            debugInfo.DayOfWeek,
                            debugInfo.TimeOfDay,
                            Checks = debugInfo.Checks,
                            IsAvailable = fallbackAvailable,
                            FailedCheck = fallbackAvailable ? "" : "Not within default business hours"
                        };
                    }
                    else
                    {
                        return new
                        {
                            debugInfo.AgentId,
                            debugInfo.ScheduleTime,
                            debugInfo.DayOfWeek,
                            debugInfo.TimeOfDay,
                            Checks = debugInfo.Checks,
                            IsAvailable = false,
                            FailedCheck = "No matching availability slot found"
                        };
                    }
                }

                debugInfo.Checks.Add("✅ All checks passed - Time slot is AVAILABLE");
                return new
                {
                    debugInfo.AgentId,
                    debugInfo.ScheduleTime,
                    debugInfo.DayOfWeek,
                    debugInfo.TimeOfDay,
                    Checks = debugInfo.Checks,
                    IsAvailable = true,
                    FailedCheck = ""
                };
            }
            catch (Exception ex)
            {
                debugInfo.Checks.Add($"💥 ERROR: {ex.Message}");
                // If there's any error, assume available to not block scheduling
                return new
                {
                    debugInfo.AgentId,
                    debugInfo.ScheduleTime,
                    debugInfo.DayOfWeek,
                    debugInfo.TimeOfDay,
                    Checks = debugInfo.Checks,
                    IsAvailable = true, // Fail open to not block scheduling
                    FailedCheck = $"Error: {ex.Message}"
                };
            }
        }

        private ScheduleResponseDto MapToDto(ScheduleProperties schedule)
        {
            if (schedule == null) return null;

            return new ScheduleResponseDto
            {
                Id = schedule.Id,
                ScheduleNo = schedule.ScheduleNo,
                PropertyId = schedule.PropertyId,
                AgentId = schedule.AgentId,
                ClientId = schedule.ClientId,
                ScheduleTime = schedule.ScheduleTime,
                ScheduleEndTime = schedule.ScheduleEndTime,
                Status = schedule.Status,
                Notes = schedule.Notes,
                MeetingType = schedule.MeetingType,
                MeetingLocation = schedule.MeetingLocation,
                VirtualMeetingLink = schedule.VirtualMeetingLink,
                CancelledAt = schedule.CancelledAt,
                CompletedAt = schedule.CompletedAt,
                CancellationReason = schedule.CancellationReason,
           
                CreatedAt = schedule.CreatedAt,
                UpdatedAt = schedule.UpdatedAt,
                PropertyTitle = schedule.Property?.Title ?? string.Empty,
                PropertyAddress = schedule.Property?.Address ?? string.Empty,
                AgentName = schedule.Agent != null ? $"{schedule.Agent.FirstName} {schedule.Agent.LastName}" : string.Empty,
                ClientName = schedule.Client != null ? $"{schedule.Client.FirstName} {schedule.Client.LastName}" : string.Empty,
            };
        }
    }
}