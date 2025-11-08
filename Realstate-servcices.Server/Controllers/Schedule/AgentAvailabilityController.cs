using Microsoft.AspNetCore.Mvc;
using Realstate_servcices.Server.Dto.Scheduling;
using Realstate_servcices.Server.Entity.Schedule;
using Realstate_servcices.Server.Services.Scheduling;

namespace Realstate_servcices.Server.Controllers.Schedule
{
    [ApiController]
    [Route("api/[controller]")]
    public class AgentAvailabilityController : ControllerBase
    {
        private readonly IAgentAvailabilityService _availabilityService;

        public AgentAvailabilityController(IAgentAvailabilityService availabilityService)
        {
            _availabilityService = availabilityService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<AgentAvailability>>> GetAllAvailabilities()
        {
            try
            {
                var availabilities = await _availabilityService.GetAllAvailabilitiesAsync();
                return Ok(availabilities);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AgentAvailability>> GetAvailabilityById(int id)
        {
            try
            {
                var availability = await _availabilityService.GetAvailabilityByIdAsync(id);
                if (availability == null)
                    return NotFound($"Availability with ID {id} not found.");

                return Ok(availability);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("agent/{agentId}")]
        public async Task<ActionResult<IEnumerable<AgentAvailability>>> GetAvailabilitiesByAgent(int agentId)
        {
            try
            {
                var availabilities = await _availabilityService.GetAvailabilitiesByAgentAsync(agentId);
                return Ok(availabilities);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("agent/{agentId}/day/{dayOfWeek}")]
        public async Task<ActionResult<IEnumerable<AgentAvailability>>> GetAvailabilitiesByAgentAndDay(
            int agentId, DayOfWeek dayOfWeek)
        {
            try
            {
                var availabilities = await _availabilityService.GetAvailabilitiesByAgentAndDayAsync(agentId, dayOfWeek);
                return Ok(availabilities);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        [HttpPost]
        public async Task<ActionResult<AgentAvailability>> CreateAvailability([FromBody] AgentAvailabilityDto availabilityDto)
        {
            try
            {
                // Map DTO to entity
                var availability = new AgentAvailability
                {
                    AgentId = availabilityDto.AgentId,
                    DayOfWeek = availabilityDto.DayOfWeek,
                    StartTime = availabilityDto.StartTime,
                    EndTime = availabilityDto.EndTime,
                    IsAvailable = availabilityDto.IsAvailable,
                    CreatedAt = DateTime.UtcNow
                };

                var createdAvailability = await _availabilityService.CreateAvailabilityAsync(availability);
                return CreatedAtAction(nameof(GetAvailabilityById), new { id = createdAvailability.Id }, createdAvailability);
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
        public async Task<ActionResult<AgentAvailability>> UpdateAvailability(int id, [FromBody] AgentAvailabilityDto availabilityDto)
        {
            try
            {
                if (id != availabilityDto.Id)
                    return BadRequest("ID mismatch");

                // Map DTO to entity
                var availability = new AgentAvailability
                {
                    Id = id,
                    AgentId = availabilityDto.AgentId,
                    DayOfWeek = availabilityDto.DayOfWeek,
                    StartTime = availabilityDto.StartTime,
                    EndTime = availabilityDto.EndTime,
                    IsAvailable = availabilityDto.IsAvailable,
                    UpdatedAt = DateTime.UtcNow
                };

                var updatedAvailability = await _availabilityService.UpdateAvailabilityAsync(availability);
                return Ok(updatedAvailability);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteAvailability(int id)
        {
            try
            {
                var result = await _availabilityService.DeleteAvailabilityAsync(id);
                if (!result)
                    return NotFound($"Availability with ID {id} not found.");

                return Ok(new { message = "Availability deleted successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("agent/{agentId}/set-availability")]
        public async Task<ActionResult> SetAgentAvailability(int agentId, [FromBody] List<AgentAvailabilityDto> availabilityDtos)
        {
            try
            {
                // Map DTOs to entities
                var availabilities = availabilityDtos.Select(dto => new AgentAvailability
                {
                    AgentId = agentId,
                    DayOfWeek = dto.DayOfWeek,
                    StartTime = dto.StartTime,
                    EndTime = dto.EndTime,
                    IsAvailable = dto.IsAvailable,
                    CreatedAt = DateTime.UtcNow
                }).ToList();

                var result = await _availabilityService.SetAgentAvailabilityAsync(agentId, availabilities);
                return Ok(new { message = "Agent availability set successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("check-availability")]
        public async Task<ActionResult<bool>> CheckAgentAvailability(
            [FromQuery] int agentId, [FromQuery] DateTime dateTime)
        {
            try
            {
                var isAvailable = await _availabilityService.IsAgentAvailableAsync(agentId, dateTime);
                return Ok(new { isAvailable });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("agent/{agentId}/available-days")]
        public async Task<ActionResult<IEnumerable<DayOfWeek>>> GetAvailableDays(int agentId)
        {
            try
            {
                var availableDays = await _availabilityService.GetAvailableDaysAsync(agentId);
                return Ok(availableDays);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
