// PartnershipContentController.cs
using Microsoft.AspNetCore.Mvc;
using Realstate_servcices.Server.Dto.ConfigLandingpage;
using Realstate_servcices.Server.Services.ConfigLandingpage;
using Realstate_servcices.Server.Utilities.Storage;
using System.ComponentModel.DataAnnotations;

namespace Realstate_servcices.Server.Controllers.ConfigLandingpage
{
    [ApiController]
    [Route("api/[controller]")]
    public class PartnershipContentController : ControllerBase
    {
        private readonly IPartnershipContentService _service;
        private readonly IPartnerLogoService _logoService;

        public PartnershipContentController(
            IPartnershipContentService service,
            IPartnerLogoService logoService)
        {
            _service = service;
            _logoService = logoService;
        }

        // ... rest of the controller methods remain the same ...
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
        public async Task<ActionResult<ApiResponse<PartnerResponseDto>>> CreatePartner([FromForm] CreatePartnerWithLogoDto createDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<PartnerResponseDto>.Fail("Invalid data",
                    ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList()));

            try
            {
                // Handle logo upload
                string logoUrl = string.Empty;
                if (createDto.LogoFile != null && createDto.LogoFile.Length > 0)
                {
                    logoUrl = await _logoService.HandleLogoUploadAsync(createDto.LogoFile, createDto.Name);
                }
                else
                {
                    return BadRequest(ApiResponse<PartnerResponseDto>.Fail("Logo file is required"));
                }

                // Create the partner with the logo URL
                var createPartnerDto = new CreatePartnerDto
                {
                    Name = createDto.Name,
                    LogoUrl = logoUrl,
                    Category = createDto.Category,
                    DisplayOrder = createDto.DisplayOrder
                };

                var result = await _service.CreatePartnerAsync(createPartnerDto);
                return result.Success ? CreatedAtAction(nameof(GetPartnerById), new { id = result.Data?.Id }, result) : BadRequest(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<PartnerResponseDto>.Fail($"Error creating partner: {ex.Message}"));
            }
        }

        [HttpPut("partners/{id}")]
        public async Task<ActionResult<ApiResponse<PartnerResponseDto>>> UpdatePartner(int id, [FromForm] UpdatePartnerWithLogoDto updateDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<PartnerResponseDto>.Fail("Invalid data",
                    ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList()));

            try
            {
                // Get existing partner to check current logo
                var existingPartnerResult = await _service.GetPartnerByIdAsync(id);
                if (!existingPartnerResult.Success || existingPartnerResult.Data == null)
                    return NotFound(ApiResponse<PartnerResponseDto>.Fail("Partner not found"));

                var existingPartner = existingPartnerResult.Data;
                string logoUrl = existingPartner.LogoUrl;

                // Handle logo update if new file provided
                if (updateDto.LogoFile != null && updateDto.LogoFile.Length > 0)
                {
                    logoUrl = await _logoService.HandleLogoUpdateAsync(
                        updateDto.LogoFile,
                        logoUrl,
                        updateDto.Name ?? existingPartner.Name);
                }

                // Update the partner
                var updatePartnerDto = new UpdatePartnerDto
                {
                    Name = updateDto.Name,
                    LogoUrl = logoUrl,
                    Category = updateDto.Category,
                    DisplayOrder = updateDto.DisplayOrder,
                    IsActive = updateDto.IsActive
                };

                var result = await _service.UpdatePartnerAsync(id, updatePartnerDto);
                return result.Success ? Ok(result) : NotFound(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<PartnerResponseDto>.Fail($"Error updating partner: {ex.Message}"));
            }
        }

        [HttpDelete("partners/{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> DeletePartner(int id)
        {
            try
            {
                // Get partner first to get logo URL for cleanup
                var partnerResult = await _service.GetPartnerByIdAsync(id);
                if (partnerResult.Success && partnerResult.Data != null)
                {
                    // Delete the logo file
                    await _logoService.HandleLogoDeletionAsync(partnerResult.Data.LogoUrl);
                }

                var result = await _service.DeletePartnerAsync(id);
                return result.Success ? Ok(result) : NotFound(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<bool>.Fail($"Error deleting partner: ${ex.Message}"));
            }
        }

        [HttpPatch("partners/{id}/status")]
        public async Task<ActionResult<ApiResponse<bool>>> TogglePartnerStatus(int id, [FromBody] StatusUpdateDto statusDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<bool>.Fail("Invalid status data"));

            var result = await _service.TogglePartnerStatusAsync(id, statusDto.IsActive);
            return result.Success ? Ok(result) : NotFound(result);
        }
    }
}