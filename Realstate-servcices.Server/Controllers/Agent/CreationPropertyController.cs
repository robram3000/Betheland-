
using Microsoft.AspNetCore.Mvc;
using Realstate_servcices.Server.Dto.Property;

using Realstate_servcices.Server.Repository.Property;
using Realstate_servcices.Server.Services.PropertyCreation;

namespace Realstate_servcices.Server.Controllers.Agent
{
    [ApiController]
    [Route("api/[controller]")]
    public class CreatePropertyController : ControllerBase
    {
        private readonly ICreatePropertyService _propertyService;

        public CreatePropertyController(ICreatePropertyService propertyService)
        {
            _propertyService = propertyService;
        }

        [HttpPost]
        public async Task<ActionResult<PropertyResponse>> CreateProperty([FromBody] CreatePropertyRequest request)
        {
            var result = await _propertyService.CreatePropertyAsync(request);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return CreatedAtAction(nameof(GetProperty), new { id = result.Property?.Id }, result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PropertyResponse>> GetProperty(int id)
        {
            var result = await _propertyService.GetPropertyByIdAsync(id);

            if (!result.Success)
            {
                return NotFound(result);
            }

            return Ok(result);
        }

        [HttpGet]
        public async Task<ActionResult<PropertiesResponse>> GetAllProperties()
        {
            var result = await _propertyService.GetAllPropertiesAsync();
            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }
        [HttpGet("owner/{ownerId}")]
        public async Task<ActionResult<PropertiesResponse>> GetPropertiesByOwner(int ownerId)
        {
            var result = await _propertyService.GetPropertiesByOwnerIdAsync(ownerId);
            return Ok(result);
        }

        [HttpGet("agent/{agentId}")]
        public async Task<ActionResult<PropertiesResponse>> GetPropertiesByAgent(int agentId)
        {
            var result = await _propertyService.GetPropertiesByAgentIdAsync(agentId);
            return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<PropertyResponse>> UpdateProperty(int id, [FromBody] UpdatePropertyRequest request)
        {
            var result = await _propertyService.UpdatePropertyAsync(id, request);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<PropertyResponse>> DeleteProperty(int id)
        {
            var result = await _propertyService.DeletePropertyAsync(id);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

    }
}