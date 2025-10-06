using Microsoft.AspNetCore.Mvc;
using Realstate_servcices.Server.Dto.Scheduling;
using Realstate_servcices.Server.Services.Scheduling;

namespace Realstate_servcices.Server.Controllers.Client
{
    [ApiController]
    [Route("api/[controller]")]
    public class ScheduleController : ControllerBase
    {
        private readonly IScheduleServices _scheduleServices;

        public ScheduleController(IScheduleServices scheduleServices)
        {
            _scheduleServices = scheduleServices;
        }

        [HttpGet]
        public async Task<ActionResult<SchedulesResponseDto>> GetAllSchedules()
        {
            var result = await _scheduleServices.GetAllSchedulesAsync();
            if (!result.Success)
                return NotFound(result);

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ScheduleResponseDto>> GetScheduleById(int id)
        {
            var result = await _scheduleServices.GetScheduleByIdAsync(id);
            if (!result.Success)
                return NotFound(result);

            return Ok(result);
        }

        [HttpGet("number/{scheduleNo}")]
        public async Task<ActionResult<ScheduleResponseDto>> GetScheduleByNumber(Guid scheduleNo)
        {
            var result = await _scheduleServices.GetScheduleByNoAsync(scheduleNo);
            if (!result.Success)
                return NotFound(result);

            return Ok(result);
        }

        [HttpGet("agent/{agentId}")]
        public async Task<ActionResult<SchedulesResponseDto>> GetSchedulesByAgent(int agentId)
        {
            var result = await _scheduleServices.GetSchedulesByAgentAsync(agentId);
            return Ok(result);
        }

        [HttpGet("client/{clientId}")]
        public async Task<ActionResult<SchedulesResponseDto>> GetSchedulesByClient(int clientId)
        {
            var result = await _scheduleServices.GetSchedulesByClientAsync(clientId);
            return Ok(result);
        }

        [HttpGet("property/{propertyId}")]
        public async Task<ActionResult<SchedulesResponseDto>> GetSchedulesByProperty(int propertyId)
        {
            var result = await _scheduleServices.GetSchedulesByPropertyAsync(propertyId);
            return Ok(result);
        }

        [HttpGet("status/{status}")]
        public async Task<ActionResult<SchedulesResponseDto>> GetSchedulesByStatus(string status)
        {
            var result = await _scheduleServices.GetSchedulesByStatusAsync(status);
            return Ok(result);
        }

        [HttpGet("date-range")]
        public async Task<ActionResult<SchedulesResponseDto>> GetSchedulesByDateRange([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            var result = await _scheduleServices.GetSchedulesByDateRangeAsync(startDate, endDate);
            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<ScheduleResponseDto>> CreateSchedule(CreateScheduleDto createDto)
        {
            var result = await _scheduleServices.CreateScheduleAsync(createDto);
            if (!result.Success)
                return BadRequest(result);

            return CreatedAtAction(nameof(GetScheduleById), new { id = result.Data?.Id }, result);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ScheduleResponseDto>> UpdateSchedule(int id, UpdateScheduleDto updateDto)
        {
            var result = await _scheduleServices.UpdateScheduleAsync(id, updateDto);
            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        [HttpPatch("{id}/cancel")]
        public async Task<ActionResult<ScheduleResponseDto>> CancelSchedule(int id)
        {
            var result = await _scheduleServices.CancelScheduleAsync(id);
            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        [HttpPatch("{id}/complete")]
        public async Task<ActionResult<ScheduleResponseDto>> CompleteSchedule(int id)
        {
            var result = await _scheduleServices.CompleteScheduleAsync(id);
            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSchedule(int id)
        {
            var result = await _scheduleServices.DeleteScheduleAsync(id);
            if (!result)
                return NotFound(new { Success = false, Message = "Schedule not found." });

            return Ok(new { Success = true, Message = "Schedule deleted successfully." });
        }

        [HttpGet("check-availability")]
        public async Task<ActionResult<bool>> CheckTimeSlotAvailability([FromQuery] int agentId, [FromQuery] DateTime scheduleTime)
        {
            var isAvailable = await _scheduleServices.IsTimeSlotAvailableAsync(agentId, scheduleTime);
            return Ok(isAvailable);
        }
    }
}
