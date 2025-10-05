//using Microsoft.AspNetCore.Mvc;
//using Realstate_servcices.Server.Dto.Scheduling;
//using Realstate_servcices.Server.Services.Scheduling;

//namespace Realstate_servcices.Server.Controllers.Agent
//{
//    [ApiController]
//    [Route("api/[controller]")]
//    public class SchedulePropertiesController : ControllerBase
//    {
//        private readonly ISchedulePropertiesService _scheduleService;

//        public SchedulePropertiesController(ISchedulePropertiesService scheduleService)
//        {
//            _scheduleService = scheduleService;
//        }

//        [HttpGet("{id}")]
//        public async Task<ActionResult<ScheduleResponseDto>> GetSchedule(int id)
//        {
//            try
//            {
//                var schedule = await _scheduleService.GetScheduleAsync(id);
//                if (schedule == null)
//                    return NotFound();

//                return Ok(schedule);
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, $"Internal server error: {ex.Message}");
//            }
//        }

//        [HttpGet("client/{clientId}")]
//        public async Task<ActionResult<IEnumerable<ScheduleResponseDto>>> GetClientSchedules(int clientId)
//        {
//            try
//            {
//                var schedules = await _scheduleService.GetClientSchedulesAsync(clientId);
//                return Ok(schedules);
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, $"Internal server error: {ex.Message}");
//            }
//        }

//        [HttpGet("agent/{agentId}")]
//        public async Task<ActionResult<IEnumerable<ScheduleResponseDto>>> GetAgentSchedules(int agentId)
//        {
//            try
//            {
//                var schedules = await _scheduleService.GetAgentSchedulesAsync(agentId);
//                return Ok(schedules);
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, $"Internal server error: {ex.Message}");
//            }
//        }

//        [HttpGet("property/{propertyId}")]
//        public async Task<ActionResult<IEnumerable<ScheduleResponseDto>>> GetPropertySchedules(int propertyId)
//        {
//            try
//            {
//                var schedules = await _scheduleService.GetPropertySchedulesAsync(propertyId);
//                return Ok(schedules);
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, $"Internal server error: {ex.Message}");
//            }
//        }

//        [HttpGet("upcoming")]
//        public async Task<ActionResult<IEnumerable<ScheduleResponseDto>>> GetUpcomingSchedules([FromQuery] int days = 7)
//        {
//            try
//            {
//                var schedules = await _scheduleService.GetUpcomingSchedulesAsync(days);
//                return Ok(schedules);
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, $"Internal server error: {ex.Message}");
//            }
//        }

//        [HttpPost]
//        public async Task<ActionResult<ScheduleResponseDto>> CreateSchedule(CreateScheduleDto createDto)
//        {
//            try
//            {
//                if (!ModelState.IsValid)
//                    return BadRequest(ModelState);

//                var schedule = await _scheduleService.CreateScheduleAsync(createDto);
//                return CreatedAtAction(nameof(GetSchedule), new { id = schedule.Id }, schedule);
//            }
//            catch (InvalidOperationException ex)
//            {
//                return Conflict(ex.Message);
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, $"Internal server error: {ex.Message}");
//            }
//        }

//        [HttpPut("{id}")]
//        public async Task<ActionResult<ScheduleResponseDto>> UpdateSchedule(int id, UpdateScheduleDto updateDto)
//        {
//            try
//            {
//                if (!ModelState.IsValid)
//                    return BadRequest(ModelState);

//                var updatedSchedule = await _scheduleService.UpdateScheduleAsync(id, updateDto);
//                if (updatedSchedule == null)
//                    return NotFound();

//                return Ok(updatedSchedule);
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, $"Internal server error: {ex.Message}");
//            }
//        }

//        [HttpPatch("{id}/status")]
//        public async Task<ActionResult<ScheduleResponseDto>> UpdateScheduleStatus(int id, ScheduleStatusDto statusDto)
//        {
//            try
//            {
//                if (!ModelState.IsValid)
//                    return BadRequest(ModelState);

//                var updatedSchedule = await _scheduleService.UpdateScheduleStatusAsync(id, statusDto);
//                if (updatedSchedule == null)
//                    return NotFound();

//                return Ok(updatedSchedule);
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, $"Internal server error: {ex.Message}");
//            }
//        }

//        [HttpPatch("{id}/cancel")]
//        public async Task<IActionResult> CancelSchedule(int id)
//        {
//            try
//            {
//                var result = await _scheduleService.CancelScheduleAsync(id);
//                if (!result)
//                    return NotFound();

//                return NoContent();
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, $"Internal server error: {ex.Message}");
//            }
//        }

//        [HttpDelete("{id}")]
//        public async Task<IActionResult> DeleteSchedule(int id)
//        {
//            try
//            {
//                var result = await _scheduleService.DeleteScheduleAsync(id);
//                if (!result)
//                    return NotFound();

//                return NoContent();
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, $"Internal server error: {ex.Message}");
//            }
//        }

//        [HttpGet("conflict-check")]
//        public async Task<ActionResult<bool>> CheckScheduleConflict(
//            [FromQuery] int propertyId,
//            [FromQuery] int agentId,
//            [FromQuery] DateTime scheduleTime)
//        {
//            try
//            {
//                var conflict = await _scheduleService.IsScheduleConflictAsync(propertyId, agentId, scheduleTime);
//                return Ok(conflict);
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, $"Internal server error: {ex.Message}");
//            }
//        }

//        [HttpGet("status/{status}/count")]
//        public async Task<ActionResult<int>> GetScheduleCountByStatus(string status)
//        {
//            try
//            {
//                var count = await _scheduleService.GetScheduleCountByStatusAsync(status);
//                return Ok(count);
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, $"Internal server error: {ex.Message}");
//            }
//        }
//    }
//}
