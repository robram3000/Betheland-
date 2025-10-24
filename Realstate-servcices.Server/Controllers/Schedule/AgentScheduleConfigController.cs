using Microsoft.AspNetCore.Mvc;
using Realstate_servcices.Server.Entity.Schedule;
using Realstate_servcices.Server.Services.Scheduling;

namespace Realstate_servcices.Server.Controllers.Schedule
{
    [ApiController]
    [Route("api/[controller]")]
    public class AgentScheduleConfigController : ControllerBase
    {
        private readonly IAgentScheduleConfigService _configService;

        public AgentScheduleConfigController(IAgentScheduleConfigService configService)
        {
            _configService = configService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<AgentScheduleConfig>>> GetAllConfigs()
        {
            try
            {
                var configs = await _configService.GetAllConfigsAsync();
                return Ok(configs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AgentScheduleConfig>> GetConfigById(int id)
        {
            try
            {
                var config = await _configService.GetConfigByIdAsync(id);
                if (config == null)
                    return NotFound($"Configuration with ID {id} not found.");

                return Ok(config);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("agent/{agentId}")]
        public async Task<ActionResult<AgentScheduleConfig>> GetConfigByAgent(int agentId)
        {
            try
            {
                var config = await _configService.GetConfigByAgentAsync(agentId);
                if (config == null)
                    return NotFound($"Configuration for agent ID {agentId} not found.");

                return Ok(config);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("agent/{agentId}/default")]
        public async Task<ActionResult<AgentScheduleConfig>> GetOrCreateDefaultConfig(int agentId)
        {
            try
            {
                var config = await _configService.GetOrCreateDefaultConfigAsync(agentId);
                return Ok(config);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<AgentScheduleConfig>> CreateConfig(AgentScheduleConfig config)
        {
            try
            {
                var createdConfig = await _configService.CreateConfigAsync(config);
                return CreatedAtAction(nameof(GetConfigById), new { id = createdConfig.Id }, createdConfig);
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
        public async Task<ActionResult<AgentScheduleConfig>> UpdateConfig(int id, AgentScheduleConfig config)
        {
            try
            {
                if (id != config.Id)
                    return BadRequest("ID mismatch");

                var updatedConfig = await _configService.UpdateConfigAsync(config);
                return Ok(updatedConfig);
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
        public async Task<ActionResult> DeleteConfig(int id)
        {
            try
            {
                var result = await _configService.DeleteConfigAsync(id);
                if (!result)
                    return NotFound($"Configuration with ID {id} not found.");

                return Ok(new { message = "Configuration deleted successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("validate-schedule-time")]
        public async Task<ActionResult<bool>> ValidateScheduleTime(
            [FromQuery] int agentId, [FromQuery] DateTime scheduleTime)
        {
            try
            {
                var isValid = await _configService.ValidateScheduleTimeAsync(agentId, scheduleTime);
                return Ok(new { isValid });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("agent/{agentId}/available-slots")]
        public async Task<ActionResult<IEnumerable<TimeSpan>>> GetAvailableTimeSlots(
            int agentId, [FromQuery] DateTime date)
        {
            try
            {
                var timeSlots = await _configService.GetAvailableTimeSlotsAsync(agentId, date);
                return Ok(timeSlots);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
