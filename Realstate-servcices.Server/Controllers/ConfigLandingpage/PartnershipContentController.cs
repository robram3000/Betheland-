using Microsoft.AspNetCore.Mvc;
using Realstate_servcices.Server.Dto.ConfigLandingpage;
using Realstate_servcices.Server.Services.ConfigLandingpage;

namespace Realstate_servcices.Server.Controllers.ConfigLandingpage
{
    [ApiController]
    [Route("api/[controller]")]
    public class PartnershipContentController : ControllerBase
    {
        private readonly IPartnershipContentService _service;

        public PartnershipContentController(IPartnershipContentService service)
        {
            _service = service;
        }

        [HttpGet("content")]
        public async Task<ActionResult<PartnershipContentDto>> GetPartnershipContent()
        {
            var content = await _service.GetPartnershipContentAsync();
            return Ok(content);
        }

        [HttpGet("partners")]
        public async Task<ActionResult<ApiResponse<List<PartnerResponseDto>>>> GetAllPartners()
        {
            var result = await _service.GetAllPartnersAsync();
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpGet("partners/active")]
        public async Task<ActionResult<ApiResponse<List<PartnerResponseDto>>>> GetActivePartners()
        {
            var result = await _service.GetActivePartnersAsync();
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpGet("partners/{id}")]
        public async Task<ActionResult<ApiResponse<PartnerResponseDto>>> GetPartnerById(int id)
        {
            var result = await _service.GetPartnerByIdAsync(id);
            return result.Success ? Ok(result) : NotFound(result);
        }

        [HttpPost("partners")]
        public async Task<ActionResult<ApiResponse<PartnerResponseDto>>> CreatePartner(CreatePartnerDto createDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<PartnerResponseDto>.Fail("Invalid data",
                    ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList()));

            var result = await _service.CreatePartnerAsync(createDto);
            return result.Success ? CreatedAtAction(nameof(GetPartnerById), new { id = result.Data?.Id }, result) : BadRequest(result);
        }

        [HttpPut("partners/{id}")]
        public async Task<ActionResult<ApiResponse<PartnerResponseDto>>> UpdatePartner(int id, UpdatePartnerDto updateDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<PartnerResponseDto>.Fail("Invalid data",
                    ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList()));

            var result = await _service.UpdatePartnerAsync(id, updateDto);
            return result.Success ? Ok(result) : NotFound(result);
        }

        [HttpDelete("partners/{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> DeletePartner(int id)
        {
            var result = await _service.DeletePartnerAsync(id);
            return result.Success ? Ok(result) : NotFound(result);
        }

        [HttpPatch("partners/{id}/status")]
        public async Task<ActionResult<ApiResponse<bool>>> TogglePartnerStatus(int id, [FromBody] bool isActive)
        {
            var result = await _service.TogglePartnerStatusAsync(id, isActive);
            return result.Success ? Ok(result) : NotFound(result);
        }
    }
}
