using Microsoft.AspNetCore.Mvc;
using Realstate_servcices.Server.Dto.Register;
using Realstate_servcices.Server.Services.ProfileCreation;

namespace Realstate_servcices.Server.Controllers.Client
{
    [ApiController]
    [Route("api/[controller]")]
    public class AgentController : ControllerBase
    {
        private readonly IAgentService _agentService;

        public AgentController(IAgentService agentService)
        {
            _agentService = agentService;
        }

        [HttpPost("register")]
        public async Task<ActionResult<RegisterResponse>> RegisterAgent([FromBody] AgentRegisterRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _agentService.CreateAgentAsync(request);

            if (result.Success)
            {
                return CreatedAtAction(nameof(GetAgent), new { id = result.UserId }, result);
            }

            return BadRequest(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AgentResponse>> GetAgent(int id)
        {
            var agent = await _agentService.GetAgentAsync(id);

            if (agent == null)
            {
                return NotFound(new RegisterResponse { Success = false, Message = "Agent not found" });
            }

            return Ok(agent);
        }

        [HttpGet]
        public async Task<ActionResult<List<AgentResponse>>> GetAllAgents()
        {
            var agents = await _agentService.GetAllAgentsAsync();
            return Ok(agents);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<RegisterResponse>> UpdateAgent(int id, [FromBody] AgentUpdateRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _agentService.UpdateAgentAsync(id, request);

            if (result.Success)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }

        [HttpPatch("{id}/status")]
        public async Task<ActionResult<RegisterResponse>> UpdateAgentStatus(int id, [FromBody] StatusUpdateRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _agentService.UpdateAgentStatusAsync(id, request.Status);

            if (result.Success)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<RegisterResponse>> DeleteAgent(int id)
        {
            var result = await _agentService.DeleteAgentAsync(id);

            if (result.Success)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }
    }
}