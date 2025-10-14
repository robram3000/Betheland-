
using Microsoft.AspNetCore.Mvc;
using Realstate_servcices.Server.Dto.Register;
using Realstate_servcices.Server.Services.ProfileCreation;

namespace Realstate_servcices.Server.Controllers.Client
{
    [ApiController]
    [Route("api/[controller]")]
    public class ClientController : ControllerBase
    {
        private readonly IClientService _clientService;
        private readonly ILogger<ClientController> _logger;

        public ClientController(IClientService clientService, ILogger<ClientController> logger)
        {
            _clientService = clientService;
            _logger = logger;
        }

        [HttpPost("register")]
        public async Task<ActionResult<RegisterResponse>> RegisterClient([FromBody] ClientRegisterRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _clientService.CreateClientAsync(request);

            if (result.Success)
            {
                return CreatedAtAction(nameof(GetClient), new { baseMemberId = result.UserId }, result);
            }

            return BadRequest(result);
        }

        [HttpGet("{baseMemberId}")]
        public async Task<ActionResult<ClientResponse>> GetClient(int baseMemberId)
        {
            var client = await _clientService.GetClientAsync(baseMemberId);

            if (client == null)
            {
                return NotFound(new RegisterResponse { Success = false, Message = "Client not found" });
            }

            return Ok(client);
        }

        [HttpGet]
        public async Task<ActionResult<List<ClientResponse>>> GetAllClients()
        {
            var clients = await _clientService.GetAllClientsAsync();
            return Ok(clients);
        }

        [HttpPut("{baseMemberId}")]
        public async Task<ActionResult<RegisterResponse>> UpdateClient(int baseMemberId, [FromBody] ClientUpdateRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _clientService.UpdateClientAsync(baseMemberId, request);

            if (result.Success)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }

        [HttpPatch("{baseMemberId}/status")]
        public async Task<ActionResult<RegisterResponse>> UpdateClientStatus(int baseMemberId, [FromBody] StatusUpdateRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _clientService.UpdateClientStatusAsync(baseMemberId, request.Status);

            if (result.Success)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }

        [HttpDelete("{baseMemberId}")]
        public async Task<ActionResult<RegisterResponse>> DeleteClient(int baseMemberId)
        {
            var result = await _clientService.DeleteClientAsync(baseMemberId);

            if (result.Success)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }

        // Profile picture endpoints
        [HttpPost("{baseMemberId}/profile-picture")]
        public async Task<ActionResult<ProfilePictureResponse>> UploadProfilePicture(int baseMemberId, [FromForm] UpdateProfilePictureRequest request)
        {
            try
            {
                if (request.File == null || request.File.Length == 0)
                {
                    return BadRequest(new ProfilePictureResponse { Success = false, Message = "No file provided" });
                }

                var result = await _clientService.UploadProfilePictureAsync(baseMemberId, request.File);

                if (result.Success)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading profile picture for BaseMemberId: {BaseMemberId}", baseMemberId);
                return StatusCode(500, new ProfilePictureResponse { Success = false, Message = "Internal server error" });
            }
        }

        [HttpDelete("{baseMemberId}/profile-picture")]
        public async Task<ActionResult<ProfilePictureResponse>> DeleteProfilePicture(int baseMemberId)
        {
            var result = await _clientService.DeleteProfilePictureAsync(baseMemberId);

            if (result.Success)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }

        [HttpGet("{baseMemberId}/profile-picture")]
        public async Task<ActionResult<ProfilePictureResponse>> GetProfilePicture(int baseMemberId)
        {
            var profilePictureUrl = await _clientService.GetProfilePictureAsync(baseMemberId);

            if (string.IsNullOrEmpty(profilePictureUrl))
            {
                return NotFound(new ProfilePictureResponse { Success = false, Message = "Profile picture not found" });
            }

            return Ok(new ProfilePictureResponse
            {
                Success = true,
                ProfilePictureUrl = profilePictureUrl,
                Message = "Profile picture retrieved successfully"
            });
        }
    }
}