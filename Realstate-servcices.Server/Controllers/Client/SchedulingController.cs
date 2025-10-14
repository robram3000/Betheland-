using Microsoft.AspNetCore.Mvc;
using Realstate_servcices.Server.Dto.Scheduling;
using Realstate_servcices.Server.Services.Scheduling;

namespace Realstate_servcices.Server.Controllers.Client
{
    [ApiController]
    [Route("api/[controller]")]
    public class SchedulingController : ControllerBase
    {
        private readonly ISchedulingServices _schedulingServices;

        public SchedulingController(ISchedulingServices schedulingServices)
        {
            _schedulingServices = schedulingServices;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ScheduleResponseDto>>> GetAllSchedules()
        {
            var schedules = await _schedulingServices.GetAllSchedulesAsync();
            return Ok(schedules);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ScheduleResponseDto>> GetScheduleById(int id)
        {
            var schedule = await _schedulingServices.GetScheduleByIdAsync(id);
            if (schedule == null)
                return NotFound();

            return Ok(schedule);
        }

        [HttpGet("agent/{agentId}")]
        public async Task<ActionResult<IEnumerable<ScheduleResponseDto>>> GetSchedulesByAgent(int agentId)
        {
            var schedules = await _schedulingServices.GetSchedulesByAgentAsync(agentId);
            return Ok(schedules);
        }

        [HttpGet("client/{clientId}")]
        public async Task<ActionResult<IEnumerable<ScheduleResponseDto>>> GetSchedulesByClient(int clientId)
        {
            var schedules = await _schedulingServices.GetSchedulesByClientAsync(clientId);
            return Ok(schedules);
        }

        [HttpGet("property/{propertyId}")]
        public async Task<ActionResult<IEnumerable<ScheduleResponseDto>>> GetSchedulesByProperty(int propertyId)
        {
            var schedules = await _schedulingServices.GetSchedulesByPropertyAsync(propertyId);
            return Ok(schedules);
        }

        [HttpGet("upcoming")]
        public async Task<ActionResult<IEnumerable<ScheduleResponseDto>>> GetUpcomingSchedules([FromQuery] int days = 7)
        {
            var schedules = await _schedulingServices.GetUpcomingSchedulesAsync(days);
            return Ok(schedules);
        }

        [HttpPost]
        public async Task<ActionResult<ScheduleResponseDto>> CreateSchedule(CreateScheduleDto createDto)
        {
            try
            {
                var schedule = await _schedulingServices.CreateScheduleAsync(createDto);
                return CreatedAtAction(nameof(GetScheduleById), new { id = schedule.Id }, schedule);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ScheduleResponseDto>> UpdateSchedule(int id, UpdateScheduleDto updateDto)
        {
            try
            {
                var schedule = await _schedulingServices.UpdateScheduleAsync(id, updateDto);
                if (schedule == null)
                    return NotFound();

                return Ok(schedule);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPatch("{id}/cancel")]
        public async Task<IActionResult> CancelSchedule(int id)
        {
            var result = await _schedulingServices.CancelScheduleAsync(id);
            if (!result)
                return NotFound();

            return NoContent();
        }

        [HttpPatch("{id}/complete")]
        public async Task<IActionResult> CompleteSchedule(int id)
        {
            var result = await _schedulingServices.CompleteScheduleAsync(id);
            if (!result)
                return NotFound();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSchedule(int id)
        {
            var result = await _schedulingServices.DeleteScheduleAsync(id);
            if (!result)
                return NotFound();

            return NoContent();
        }

        [HttpGet("availability")]
        public async Task<ActionResult<bool>> CheckTimeSlotAvailability(
            [FromQuery] int agentId,
            [FromQuery] DateTime scheduleTime)
        {
            var isAvailable = await _schedulingServices.IsTimeSlotAvailableAsync(agentId, scheduleTime);
            return Ok(isAvailable);
        }
    }
}
