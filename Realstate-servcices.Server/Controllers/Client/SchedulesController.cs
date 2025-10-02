using Microsoft.AspNetCore.Mvc;
using Realstate_servcices.Server.Dto.Property;
using Realstate_servcices.Server.Dto.Scheduling;
using Realstate_servcices.Server.Entity.Properties;
using Realstate_servcices.Server.Repository.ScheduleDao;

namespace Realstate_servcices.Server.Controllers.Client
{
    [ApiController]
    [Route("api/[controller]")]
    public class SchedulesController : ControllerBase
    {
        private readonly IScheduleRepository _scheduleRepository;

        public SchedulesController(IScheduleRepository scheduleRepository)
        {
            _scheduleRepository = scheduleRepository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ScheduleDetailDto>>> GetAllSchedules()
        {
            var schedules = await _scheduleRepository.GetAllAsync();
            var scheduleDtos = schedules.Select(MapToScheduleDetailDto);
            return Ok(scheduleDtos);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ScheduleDetailDto>> GetScheduleById(int id)
        {
            var schedule = await _scheduleRepository.GetByIdAsync(id);
            if (schedule == null)
                return NotFound();

            return Ok(MapToScheduleDetailDto(schedule));
        }

        [HttpGet("schedule-no/{scheduleNo}")]
        public async Task<ActionResult<ScheduleDetailDto>> GetScheduleByScheduleNo(Guid scheduleNo)
        {
            var schedule = await _scheduleRepository.GetByScheduleNoAsync(scheduleNo);
            if (schedule == null)
                return NotFound();

            return Ok(MapToScheduleDetailDto(schedule));
        }

        [HttpGet("agent/{agentId}")]
        public async Task<ActionResult<IEnumerable<ScheduleDetailDto>>> GetSchedulesByAgent(int agentId)
        {
            var schedules = await _scheduleRepository.GetByAgentIdAsync(agentId);
            var scheduleDtos = schedules.Select(MapToScheduleDetailDto);
            return Ok(scheduleDtos);
        }

        [HttpGet("client/{clientId}")]
        public async Task<ActionResult<IEnumerable<ScheduleDetailDto>>> GetSchedulesByClient(int clientId)
        {
            var schedules = await _scheduleRepository.GetByClientIdAsync(clientId);
            var scheduleDtos = schedules.Select(MapToScheduleDetailDto);
            return Ok(scheduleDtos);
        }

        [HttpGet("property/{propertyId}")]
        public async Task<ActionResult<IEnumerable<ScheduleDetailDto>>> GetSchedulesByProperty(int propertyId)
        {
            var schedules = await _scheduleRepository.GetByPropertyIdAsync(propertyId);
            var scheduleDtos = schedules.Select(MapToScheduleDetailDto);
            return Ok(scheduleDtos);
        }

        [HttpGet("date-range")]
        public async Task<ActionResult<IEnumerable<ScheduleDetailDto>>> GetSchedulesByDateRange(
            [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            var schedules = await _scheduleRepository.GetSchedulesByDateRangeAsync(startDate, endDate);
            var scheduleDtos = schedules.Select(MapToScheduleDetailDto);
            return Ok(scheduleDtos);
        }

        [HttpGet("status/{status}")]
        public async Task<ActionResult<IEnumerable<ScheduleDetailDto>>> GetSchedulesByStatus(string status)
        {
            var schedules = await _scheduleRepository.GetSchedulesByStatusAsync(status);
            var scheduleDtos = schedules.Select(MapToScheduleDetailDto);
            return Ok(scheduleDtos);
        }

        [HttpPost]
        public async Task<ActionResult<ScheduleDetailDto>> CreateSchedule(CreateScheduleDto createDto)
        {
            // Check if time slot is available
            var isAvailable = await _scheduleRepository.IsTimeSlotAvailableAsync(
                createDto.AgentId, createDto.ScheduleTime);

            if (!isAvailable)
            {
                return BadRequest("The selected time slot is not available for this agent.");
            }

            var schedule = new ScheduleProperties
            {
                ScheduleNo = Guid.NewGuid(),
                PropertyId = createDto.PropertyId,
                AgentId = createDto.AgentId,
                ClientId = createDto.ClientId,
                ScheduleTime = createDto.ScheduleTime,
                Notes = createDto.Notes,
                Status = "Scheduled",
                CreatedAt = DateTime.UtcNow
            };

            var createdSchedule = await _scheduleRepository.CreateAsync(schedule);
            return CreatedAtAction(nameof(GetScheduleById), new { id = createdSchedule.Id }, MapToScheduleDetailDto(createdSchedule));
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ScheduleDetailDto>> UpdateSchedule(int id, UpdateScheduleDto updateDto)
        {
            var existingSchedule = await _scheduleRepository.GetByIdAsync(id);
            if (existingSchedule == null)
                return NotFound();

            // If schedule time is being updated, check availability
            if (updateDto.ScheduleTime.HasValue && updateDto.ScheduleTime.Value != existingSchedule.ScheduleTime)
            {
                var isAvailable = await _scheduleRepository.IsTimeSlotAvailableAsync(
                    existingSchedule.AgentId, updateDto.ScheduleTime.Value, id);

                if (!isAvailable)
                {
                    return BadRequest("The selected time slot is not available for this agent.");
                }
            }

            var scheduleToUpdate = new ScheduleProperties
            {
                ScheduleTime = updateDto.ScheduleTime ?? existingSchedule.ScheduleTime,
                Status = updateDto.Status ?? existingSchedule.Status,
                Notes = updateDto.Notes ?? existingSchedule.Notes
            };

            var updatedSchedule = await _scheduleRepository.UpdateAsync(id, scheduleToUpdate);
            if (updatedSchedule == null)
                return NotFound();

            return Ok(MapToScheduleDetailDto(updatedSchedule));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSchedule(int id)
        {
            var result = await _scheduleRepository.DeleteAsync(id);
            if (!result)
                return NotFound();

            return NoContent();
        }

        [HttpGet("check-availability")]
        public async Task<ActionResult<bool>> CheckTimeSlotAvailability(
            [FromQuery] int agentId, [FromQuery] DateTime scheduleTime, [FromQuery] int? excludeScheduleId = null)
        {
            var isAvailable = await _scheduleRepository.IsTimeSlotAvailableAsync(agentId, scheduleTime, excludeScheduleId);
            return Ok(isAvailable);
        }

        private ScheduleDetailDto MapToScheduleDetailDto(ScheduleProperties schedule)
        {
            var dto = new ScheduleDetailDto
            {
                Id = schedule.Id,
                ScheduleNo = schedule.ScheduleNo,
                ScheduleTime = schedule.ScheduleTime,
                Status = schedule.Status,
                Notes = schedule.Notes,
                CreatedAt = schedule.CreatedAt,
                UpdatedAt = schedule.UpdatedAt
            };

            // Map Agent with safe property access
            if (schedule.Agent != null)
            {
                dto.Agent = new AgentDto
                {
                    Id = schedule.Agent.Id
                    // Only map properties that actually exist on your Agent entity
                    // Remove Name and Email if they don't exist, or replace with correct properties
                };

                // Use reflection or conditional checks for optional properties
                var agentType = schedule.Agent.GetType();

                // Safely try to get Name property if it exists
                var nameProperty = agentType.GetProperty("Name");
                if (nameProperty != null)
                {
                    dto.Agent.Name = nameProperty.GetValue(schedule.Agent) as string;
                }

                // Safely try to get Email property if it exists
                var emailProperty = agentType.GetProperty("Email");
                if (emailProperty != null)
                {
                    dto.Agent.Email = emailProperty.GetValue(schedule.Agent) as string;
                }

                // Add other properties as they exist in your Agent entity
                var firstNameProperty = agentType.GetProperty("FirstName");
                var lastNameProperty = agentType.GetProperty("LastName");
                if (firstNameProperty != null && lastNameProperty != null)
                {
                    var firstName = firstNameProperty.GetValue(schedule.Agent) as string;
                    var lastName = lastNameProperty.GetValue(schedule.Agent) as string;
                    dto.Agent.Name = $"{firstName} {lastName}".Trim();
                }
            }

            // Map Client with safe property access
            if (schedule.Client != null)
            {
                dto.Client = new ClientDto
                {
                    Id = schedule.Client.Id
                    // Only map properties that actually exist on your Client entity
                };

                var clientType = schedule.Client.GetType();

                // Safely try to get Name property if it exists
                var nameProperty = clientType.GetProperty("Name");
                if (nameProperty != null)
                {
                    dto.Client.Name = nameProperty.GetValue(schedule.Client) as string;
                }

                // Safely try to get Email property if it exists
                var emailProperty = clientType.GetProperty("Email");
                if (emailProperty != null)
                {
                    dto.Client.Email = emailProperty.GetValue(schedule.Client) as string;
                }

                // Alternative: try FirstName/LastName if Name doesn't exist
                var firstNameProperty = clientType.GetProperty("FirstName");
                var lastNameProperty = clientType.GetProperty("LastName");
                if (firstNameProperty != null && lastNameProperty != null && string.IsNullOrEmpty(dto.Client.Name))
                {
                    var firstName = firstNameProperty.GetValue(schedule.Client) as string;
                    var lastName = lastNameProperty.GetValue(schedule.Client) as string;
                    dto.Client.Name = $"{firstName} {lastName}".Trim();
                }
            }

            // Map Property if needed
            if (schedule.Property != null)
            {
                // Initialize PropertyHouseDto with available properties
                dto.Property = new PropertyHouseDto
                {
                    Id = schedule.Property.Id
                    // Add other property fields as they exist in your Property entity
                };
            }

            return dto;
        }
    }
}
