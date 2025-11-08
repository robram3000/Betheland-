using Microsoft.AspNetCore.Mvc;
using Realstate_servcices.Server.Dto.Scheduling;
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

        // AgentScheduleConfigController.cs - Update the CreateConfig method
        [HttpPost]
        public async Task<ActionResult<AgentScheduleConfig>> CreateConfig(AgentScheduleConfigDto configDto)
        {
            try
            {
                // Map DTO to entity with proper TimeSpan conversion
                var config = new AgentScheduleConfig
                {
                    AgentId = configDto.AgentId,
                    SlotDurationMinutes = configDto.SlotDurationMinutes,
                    BufferTimeMinutes = configDto.BufferTimeMinutes,
                    MaxSchedulesPerDay = configDto.MaxSchedulesPerDay,
                    WorkDayStart = TimeSpan.Parse(configDto.WorkDayStart), // Convert string to TimeSpan
                    WorkDayEnd = TimeSpan.Parse(configDto.WorkDayEnd),     // Convert string to TimeSpan
                    AllowWeekendScheduling = configDto.AllowWeekendScheduling,
                    AdvanceBookingDays = configDto.AdvanceBookingDays,
                    CreatedAt = DateTime.UtcNow
                };

                var createdConfig = await _configService.CreateConfigAsync(config);
                return CreatedAtAction(nameof(GetConfigById), new { id = createdConfig.Id }, createdConfig);
            }
            catch (FormatException ex)
            {
                return BadRequest($"Invalid time format: {ex.Message}");
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
        // AgentScheduleConfigController.cs - Update the UpdateConfig method
        [HttpPut("{id}")]
        public async Task<ActionResult<AgentScheduleConfig>> UpdateConfig(int id, AgentScheduleConfigDto configDto)
        {
            try
            {
                if (id != configDto.Id)
                    return BadRequest("ID mismatch");

                // Get existing config
                var existingConfig = await _configService.GetConfigByIdAsync(id);
                if (existingConfig == null)
                    return NotFound($"Configuration with ID {id} not found.");

                // Update properties with TimeSpan conversion
                existingConfig.SlotDurationMinutes = configDto.SlotDurationMinutes;
                existingConfig.BufferTimeMinutes = configDto.BufferTimeMinutes;
                existingConfig.MaxSchedulesPerDay = configDto.MaxSchedulesPerDay;
                existingConfig.WorkDayStart = TimeSpan.Parse(configDto.WorkDayStart); // Convert
                existingConfig.WorkDayEnd = TimeSpan.Parse(configDto.WorkDayEnd);     // Convert
                existingConfig.AllowWeekendScheduling = configDto.AllowWeekendScheduling;
                existingConfig.AdvanceBookingDays = configDto.AdvanceBookingDays;
                existingConfig.UpdatedAt = DateTime.UtcNow;

                var updatedConfig = await _configService.UpdateConfigAsync(existingConfig);
                return Ok(updatedConfig);
            }
            catch (FormatException ex)
            {
                return BadRequest($"Invalid time format: {ex.Message}");
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
        public async Task<ActionResult<IEnumerable<string>>> GetAvailableTimeSlots(
            int agentId, [FromQuery] DateTime date)
        {
            try
            {
                var timeSlots = await _configService.GetAvailableTimeSlotsAsync(agentId, date);
                var slotStrings = timeSlots.Select(ts => ts.ToString(@"hh\:mm"));
                return Ok(slotStrings);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("agent/{agentId}/default-hours")]
        public async Task<ActionResult<AgentScheduleConfig>> SetDefaultWorkingHours(int agentId)
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
    }
}