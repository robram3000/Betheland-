using Microsoft.AspNetCore.Mvc;
using Realstate_servcices.Server.Entity.Schedule;
using Realstate_servcices.Server.Services.Scheduling;

namespace Realstate_servcices.Server.Controllers.Schedule
{
    [ApiController]
    [Route("api/[controller]")]
    public class AgentTimeOffController : ControllerBase
    {
        private readonly IAgentTimeOffService _timeOffService;

        public AgentTimeOffController(IAgentTimeOffService timeOffService)
        {
            _timeOffService = timeOffService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<AgentTimeOff>>> GetAllTimeOffs()
        {
            try
            {
                var timeOffs = await _timeOffService.GetAllTimeOffsAsync();
                return Ok(timeOffs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AgentTimeOff>> GetTimeOffById(int id)
        {
            try
            {
                var timeOff = await _timeOffService.GetTimeOffByIdAsync(id);
                if (timeOff == null)
                    return NotFound($"Time off with ID {id} not found.");

                return Ok(timeOff);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("agent/{agentId}")]
        public async Task<ActionResult<IEnumerable<AgentTimeOff>>> GetTimeOffsByAgent(int agentId)
        {
            try
            {
                var timeOffs = await _timeOffService.GetTimeOffsByAgentAsync(agentId);
                return Ok(timeOffs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("upcoming")]
        public async Task<ActionResult<IEnumerable<AgentTimeOff>>> GetUpcomingTimeOffs([FromQuery] int daysAhead = 30)
        {
            try
            {
                var timeOffs = await _timeOffService.GetUpcomingTimeOffsAsync(daysAhead);
                return Ok(timeOffs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("agent/{agentId}/date-range")]
        public async Task<ActionResult<IEnumerable<AgentTimeOff>>> GetTimeOffsByDateRange(
            int agentId, [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            try
            {
                var timeOffs = await _timeOffService.GetTimeOffsByDateRangeAsync(agentId, startDate, endDate);
                return Ok(timeOffs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<AgentTimeOff>> RequestTimeOff(AgentTimeOff timeOff)
        {
            try
            {
                var createdTimeOff = await _timeOffService.RequestTimeOffAsync(timeOff);
                return CreatedAtAction(nameof(GetTimeOffById), new { id = createdTimeOff.Id }, createdTimeOff);
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
        public async Task<ActionResult<AgentTimeOff>> UpdateTimeOff(int id, AgentTimeOff timeOff)
        {
            try
            {
                if (id != timeOff.Id)
                    return BadRequest("ID mismatch");

                var updatedTimeOff = await _timeOffService.UpdateTimeOffAsync(timeOff);
                return Ok(updatedTimeOff);
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

        [HttpPatch("{id}/approve")]
        public async Task<ActionResult> ApproveTimeOff(int id)
        {
            try
            {
                var result = await _timeOffService.ApproveTimeOffAsync(id);
                if (!result)
                    return NotFound($"Time off with ID {id} not found.");

                return Ok(new { message = "Time off approved successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPatch("{id}/reject")]
        public async Task<ActionResult> RejectTimeOff(int id)
        {
            try
            {
                var result = await _timeOffService.RejectTimeOffAsync(id);
                if (!result)
                    return NotFound($"Time off with ID {id} not found.");

                return Ok(new { message = "Time off rejected." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteTimeOff(int id)
        {
            try
            {
                var result = await _timeOffService.DeleteTimeOffAsync(id);
                if (!result)
                    return NotFound($"Time off with ID {id} not found.");

                return Ok(new { message = "Time off deleted successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("check-availability")]
        public async Task<ActionResult<bool>> CheckAgentAvailability(
            [FromQuery] int agentId, [FromQuery] DateTime date)
        {
            try
            {
                var isAvailable = await _timeOffService.IsAgentAvailableAsync(agentId, date);
                return Ok(new { isAvailable });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("check-conflict")]
        public async Task<ActionResult<bool>> CheckTimeOffConflict(
            [FromQuery] int agentId, [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            try
            {
                var hasConflict = await _timeOffService.HasTimeOffConflictAsync(agentId, startDate, endDate);
                return Ok(new { hasConflict });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
