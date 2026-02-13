using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
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
        private readonly ILogger<AgentAvailabilityController> _logger;

        public AgentAvailabilityController(
            IAgentAvailabilityService availabilityService,
            ILogger<AgentAvailabilityController> logger)
        {
            _availabilityService = availabilityService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<AgentAvailability>>> GetAllAvailabilities()
        {
            try
            {
                _logger.LogInformation("🔍 GetAllAvailabilities called");
                var availabilities = await _availabilityService.GetAllAvailabilitiesAsync();
                _logger.LogInformation($"✅ Retrieved {availabilities?.Count() ?? 0} availabilities");
                return Ok(availabilities);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error in GetAllAvailabilities");
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
                _logger.LogError(ex, "Error getting availability by ID {Id}", id);
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
                _logger.LogError(ex, "Error getting availabilities for agent {AgentId}", agentId);
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<AgentAvailability>> CreateAvailability([FromBody] AgentAvailabilityDto availabilityDto)
        {
            try
            {
                // Verify agent exists before creating availability
                var agentExists = await VerifyAgentExists(availabilityDto.AgentId);
                if (!agentExists)
                    return BadRequest($"Agent with ID {availabilityDto.AgentId} does not exist.");

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
                _logger.LogError(ex, "Error creating availability");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        private async Task<bool> VerifyAgentExists(int agentId)
        {
            // Implement agent existence check
            return await Task.FromResult(true); // Replace with actual check
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<AgentAvailability>> UpdateAvailability(int id, [FromBody] AgentAvailabilityDto availabilityDto)
        {
            try
            {
                if (id != availabilityDto.Id)
                    return BadRequest("ID mismatch");

                var existingAvailability = await _availabilityService.GetAvailabilityByIdAsync(id);
                if (existingAvailability == null)
                    return NotFound($"Availability with ID {id} not found.");

                var agentExists = await VerifyAgentExists(availabilityDto.AgentId);
                if (!agentExists)
                    return BadRequest($"Agent with ID {availabilityDto.AgentId} does not exist.");

                var availability = new AgentAvailability
                {
                    Id = id,
                    AgentId = availabilityDto.AgentId,
                    DayOfWeek = availabilityDto.DayOfWeek,
                    StartTime = availabilityDto.StartTime,
                    EndTime = availabilityDto.EndTime,
                    IsAvailable = availabilityDto.IsAvailable,
                    CreatedAt = existingAvailability.CreatedAt,
                    UpdatedAt = DateTime.UtcNow
                };

                var updatedAvailability = await _availabilityService.UpdateAvailabilityAsync(availability);
                return Ok(updatedAvailability);
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
                _logger.LogError(ex, "Error updating availability {Id}", id);
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
                _logger.LogError(ex, "Error deleting availability {Id}", id);
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("health-check")]
        public ActionResult HealthCheck()
        {
            _logger.LogInformation("✅ Health check endpoint called");
            return Ok(new
            {
                status = "Healthy",
                timestamp = DateTime.UtcNow,
                controller = nameof(AgentAvailabilityController)
            });
        }
    }
}