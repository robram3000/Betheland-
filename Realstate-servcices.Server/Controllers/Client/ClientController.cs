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

        public ClientController(IClientService clientService)
        {
            _clientService = clientService;
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
                return CreatedAtAction(nameof(GetClient), new { id = result.UserId }, result);
            }

            return BadRequest(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ClientResponse>> GetClient(int id)
        {
            var client = await _clientService.GetClientAsync(id);

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

        [HttpPut("{id}")]
        public async Task<ActionResult<RegisterResponse>> UpdateClient(int id, [FromBody] ClientUpdateRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _clientService.UpdateClientAsync(id, request);

            if (result.Success)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }

        [HttpPatch("{id}/status")]
        public async Task<ActionResult<RegisterResponse>> UpdateClientStatus(int id, [FromBody] StatusUpdateRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _clientService.UpdateClientStatusAsync(id, request.Status);

            if (result.Success)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<RegisterResponse>> DeleteClient(int id)
        {
            var result = await _clientService.DeleteClientAsync(id);

            if (result.Success)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }
    }
}
