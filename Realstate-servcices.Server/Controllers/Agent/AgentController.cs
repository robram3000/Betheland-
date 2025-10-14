// AgentController.cs
using Microsoft.AspNetCore.Mvc;
using Realstate_servcices.Server.Dto.Register;
using Realstate_servcices.Server.Services.ProfileCreation;
using Realstate_servcices.Server.Utilities.Storage; // Add this
using Microsoft.AspNetCore.Http; // Add this

namespace Realstate_servcices.Server.Controllers.Client
{
    [ApiController]
    [Route("api/[controller]")]
    public class AgentController : ControllerBase
    {
        private readonly IAgentService _agentService;
        private readonly ILocalstorageImage _localStorageImage; // Add this

        // Update constructor to inject ILocalstorageImage
        public AgentController(IAgentService agentService, ILocalstorageImage localStorageImage)
        {
            _agentService = agentService;
            _localStorageImage = localStorageImage;
        }

        [HttpPost("upload")]
        public async Task<ActionResult> UploadImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { Success = false, Message = "No file uploaded" });
            }

            try
            {
                var imageUrl = await _localStorageImage.UploadImageAsync(file, "agents");
                return Ok(new { Success = true, Url = imageUrl });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Success = false, Message = ex.Message });
            }
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
                return Ok(result);
            }

            return BadRequest(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AgentResponse>> GetAgent(int id)
        {
            try
            {
                var agent = await _agentService.GetAgentAsync(id);

                if (agent == null)
                {
                    return NotFound(new { Success = false, Message = "Agent not found" });
                }

                return Ok(new { Success = true, Data = agent });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Success = false, Message = "An error occurred while retrieving agent", Error = ex.Message });
            }
        }

        [HttpGet("member/{baseMemberId}")]
        public async Task<ActionResult<AgentResponse>> GetAgentByBaseMemberId(int baseMemberId)
        {
            try
            {
                var agent = await _agentService.GetAgentByBaseMemberIdAsync(baseMemberId);

                if (agent == null)
                {
                    return NotFound(new { Success = false, Message = "Agent not found for the specified base member" });
                }

                return Ok(new { Success = true, Data = agent });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Success = false, Message = "An error occurred while retrieving agent", Error = ex.Message });
            }
        }

        [HttpGet]
        public async Task<ActionResult<List<AgentResponse>>> GetAllAgents()
        {
            try
            {
                var agents = await _agentService.GetAllAgentsAsync();
                return Ok(new { Success = true, Data = agents });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Success = false, Message = "An error occurred while retrieving agents", Error = ex.Message });
            }
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

        [HttpPatch("{id}/verify")]
        public async Task<ActionResult<RegisterResponse>> VerifyAgent(int id)
        {
            try
            {
                var result = await _agentService.UpdateAgentStatusAsync(id, "Verified");

                if (result.Success)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Success = false, Message = "An error occurred while verifying agent", Error = ex.Message });
            }
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