using Microsoft.AspNetCore.Mvc;
using Realstate_servcices.Server.Dto.Scheduling;
using Realstate_servcices.Server.Entity.Schedule;
using Realstate_servcices.Server.Services.Scheduling;

namespace Realstate_servcices.Server.Controllers.Schedule
{
    [ApiController]
    [Route("api/[controller]")]
    public class SchedulePropertiesController : ControllerBase
    {
        private readonly ISchedulePropertiesService _scheduleService;

        public SchedulePropertiesController(ISchedulePropertiesService scheduleService)
        {
            _scheduleService = scheduleService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ScheduleProperties>>> GetAllSchedules()
        {
            try
            {
                var schedules = await _scheduleService.GetAllSchedulesAsync();
                return Ok(schedules);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ScheduleProperties>> GetScheduleById(int id)
        {
            try
            {
                var schedule = await _scheduleService.GetScheduleByIdAsync(id);
                if (schedule == null)
                    return NotFound($"Schedule with ID {id} not found.");

                return Ok(schedule);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("schedule-no/{scheduleNo}")]
        public async Task<ActionResult<ScheduleProperties>> GetScheduleByNo(Guid scheduleNo)
        {
            try
            {
                var schedule = await _scheduleService.GetScheduleByNoAsync(scheduleNo);
                if (schedule == null)
                    return NotFound($"Schedule with number {scheduleNo} not found.");

                return Ok(schedule);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        // In SchedulePropertiesController.cs - Update the GetSchedulesByAgent method
        [HttpGet("agent/{agentId}")]
        public async Task<ActionResult<IEnumerable<ScheduleResponseDto>>> GetSchedulesByAgent(int agentId)
        {
            try
            {
                var schedules = await _scheduleService.GetSchedulesByAgentAsync(agentId);
                var scheduleDtos = schedules.Select(s => new ScheduleResponseDto
                {
                    Id = s.Id,
                    ScheduleNo = s.ScheduleNo,
                    PropertyId = s.PropertyId,
                    AgentId = s.AgentId,
                    ClientId = s.ClientId,
                    ScheduleTime = s.ScheduleTime,
                    ScheduleEndTime = s.ScheduleEndTime,
                    Status = s.Status,
                    Notes = s.Notes,
                    MeetingType = s.MeetingType,
                    MeetingLocation = s.MeetingLocation,
                    VirtualMeetingLink = s.VirtualMeetingLink,
                    CancelledAt = s.CancelledAt,
                    CompletedAt = s.CompletedAt,
                    CancellationReason = s.CancellationReason,
                    CreatedAt = s.CreatedAt,
                    UpdatedAt = s.UpdatedAt,

                    // Enhanced mapping with null checks
                    PropertyTitle = s.Property?.Title ?? string.Empty,
                    PropertyAddress = s.Property?.Address ?? string.Empty,
                    AgentName = s.Agent != null ? $"{s.Agent.FirstName} {s.Agent.LastName}" : string.Empty,
                    ClientName = s.Client != null ? $"{s.Client.FirstName} {s.Client.LastName}" : string.Empty,
                        
                }).ToList();

                return Ok(scheduleDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }


        [HttpGet("client/{clientId}")]
        public async Task<ActionResult<IEnumerable<ScheduleProperties>>> GetSchedulesByClient(int clientId)
        {
            try
            {
                var schedules = await _scheduleService.GetSchedulesByClientAsync(clientId);
                return Ok(schedules);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("property/{propertyId}")]
        public async Task<ActionResult<IEnumerable<ScheduleProperties>>> GetSchedulesByProperty(int propertyId)
        {
            try
            {
                var schedules = await _scheduleService.GetSchedulesByPropertyAsync(propertyId);
                return Ok(schedules);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("status/{status}")]
        public async Task<ActionResult<IEnumerable<ScheduleProperties>>> GetSchedulesByStatus(string status)
        {
            try
            {
                var schedules = await _scheduleService.GetSchedulesByStatusAsync(status);
                return Ok(schedules);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("date-range")]
        public async Task<ActionResult<IEnumerable<ScheduleProperties>>> GetSchedulesByDateRange(
            [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            try
            {
                var schedules = await _scheduleService.GetSchedulesByDateRangeAsync(startDate, endDate);
                return Ok(schedules);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        [HttpPost]
        public async Task<ActionResult<ScheduleProperties>> CreateSchedule(CreateScheduleRequest request)
        {
            try
            {
                // Map DTO to entity
                var schedule = new ScheduleProperties
                {
                    PropertyId = request.PropertyId,
                    AgentId = request.AgentId,
                    ClientId = request.ClientId,
                    ScheduleTime = request.ScheduleTime,
                    ScheduleEndTime = request.ScheduleEndTime ?? request.ScheduleTime.AddHours(1),
                    Notes = request.Notes,
                    MeetingType = request.MeetingType,
                    MeetingLocation = request.MeetingLocation,
                    VirtualMeetingLink = request.VirtualMeetingLink,
                    Status = "Scheduled",
                    CreatedAt = DateTime.UtcNow
                };

                var createdSchedule = await _scheduleService.CreateScheduleAsync(schedule);
                return CreatedAtAction(nameof(GetScheduleById), new { id = createdSchedule.Id }, createdSchedule);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ScheduleProperties>> UpdateSchedule(int id, ScheduleProperties schedule)
        {
            try
            {
                if (id != schedule.Id)
                    return BadRequest("ID mismatch");

                var updatedSchedule = await _scheduleService.UpdateScheduleAsync(schedule);
                return Ok(updatedSchedule);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPatch("{id}/cancel")]
        public async Task<ActionResult> CancelSchedule(int id)
        {
            try
            {
                var result = await _scheduleService.CancelScheduleAsync(id);
                if (!result)
                    return NotFound($"Schedule with ID {id} not found.");

                return Ok(new { message = "Schedule cancelled successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPatch("{id}/reschedule")]
        public async Task<ActionResult> Reschedule(int id, [FromBody] DateTime newScheduleTime)
        {
            try
            {
                var result = await _scheduleService.RescheduleAsync(id, newScheduleTime);
                if (!result)
                    return NotFound($"Schedule with ID {id} not found.");

                return Ok(new { message = "Schedule rescheduled successfully." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPatch("{id}/complete")]
        public async Task<ActionResult> CompleteSchedule(int id)
        {
            try
            {
                var result = await _scheduleService.CompleteScheduleAsync(id);
                if (!result)
                    return NotFound($"Schedule with ID {id} not found.");

                return Ok(new { message = "Schedule marked as completed." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteSchedule(int id)
        {
            try
            {
                var result = await _scheduleService.DeleteScheduleAsync(id);
                if (!result)
                    return NotFound($"Schedule with ID {id} not found.");

                return Ok(new { message = "Schedule deleted successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("check-availability")]
        public async Task<ActionResult<bool>> CheckTimeSlotAvailability(
            [FromQuery] int agentId, [FromQuery] DateTime scheduleTime)
        {
            try
            {
                var isAvailable = await _scheduleService.IsTimeSlotAvailableAsync(agentId, scheduleTime);
                return Ok(new { isAvailable });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // NEW DEBUG ENDPOINTS

        [HttpGet("debug/availability")]
        public async Task<ActionResult> DebugTimeSlotAvailability(
            [FromQuery] int agentId, [FromQuery] DateTime scheduleTime)
        {
            try
            {
                var debugInfo = await _scheduleService.DebugTimeSlotAvailabilityAsync(agentId, scheduleTime);
                return Ok(debugInfo);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("debug/agent/{agentId}/availability-data")]
        public async Task<ActionResult> GetAgentAvailabilityData(int agentId)
        {
            try
            {
                var availabilities = await _scheduleService.GetSchedulesByAgentAsync(agentId);

                // Group by day for better visualization
                var availabilityByDay = availabilities
                    .GroupBy(s => s.ScheduleTime.DayOfWeek)
                    .Select(g => new
                    {
                        DayOfWeek = g.Key,
                        Schedules = g.Select(s => new
                        {
                            Time = s.ScheduleTime.ToString("HH:mm"),
                            Status = s.Status,
                            PropertyId = s.PropertyId
                        }).OrderBy(s => s.Time)
                    });

                return Ok(new
                {
                    AgentId = agentId,
                    TotalSchedules = availabilities.Count(),
                    AvailabilityByDay = availabilityByDay
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}