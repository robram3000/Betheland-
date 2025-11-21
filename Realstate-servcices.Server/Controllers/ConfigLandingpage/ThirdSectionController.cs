using Microsoft.AspNetCore.Mvc;
using Realstate_servcices.Server.Dto.ConfigLandingpage;
using Realstate_servcices.Server.Services.ConfigLandingpage;

namespace Realstate_servcices.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ThirdSectionController : ControllerBase
    {
        private readonly IThirdSectionServices _thirdSectionServices;
        private readonly ILogger<ThirdSectionController> _logger;

        public ThirdSectionController(IThirdSectionServices thirdSectionServices, ILogger<ThirdSectionController> logger)
        {
            _thirdSectionServices = thirdSectionServices;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<ThirdSectionDTO>> GetThirdSection()
        {
            try
            {
                _logger.LogInformation("🔍 ThirdSectionController: GetThirdSection endpoint called");

                var result = await _thirdSectionServices.GetThirdSectionAsync();

                if (result == null)
                {
                    _logger.LogWarning("❌ ThirdSectionController: GetThirdSectionAsync returned null");
                    return NotFound("Third section data not found");
                }

                _logger.LogInformation("✅ ThirdSectionController: Successfully retrieved third section data - " +
                    "ID: {Id}, Title: {Title}, ProcessSteps: {ProcessStepsCount}, FeatureItems: {FeatureItemsCount}",
                    result.Id,
                    result.Title,
                    result.ProcessSteps?.Count ?? 0,
                    result.FeatureItems?.Count ?? 0);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ ThirdSectionController: Error in GetThirdSection endpoint");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut]
        public async Task<ActionResult<ThirdSectionDTO>> UpdateThirdSection([FromBody] ThirdSectionDTO thirdSectionDto)
        {
            try
            {
                _logger.LogInformation("🔍 ThirdSectionController: UpdateThirdSection endpoint called");

                if (thirdSectionDto == null)
                {
                    _logger.LogWarning("❌ ThirdSectionController: Update request received null data");
                    return BadRequest("Third section data is required");
                }

                _logger.LogInformation("📥 ThirdSectionController: Received update data - " +
                    "ID: {Id}, Title: {Title}, ProcessSteps: {ProcessStepsCount}, FeatureItems: {FeatureItemsCount}",
                    thirdSectionDto.Id,
                    thirdSectionDto.Title,
                    thirdSectionDto.ProcessSteps?.Count ?? 0,
                    thirdSectionDto.FeatureItems?.Count ?? 0);

                var result = await _thirdSectionServices.UpdateThirdSectionAsync(thirdSectionDto);

                if (result == null)
                {
                    _logger.LogError("❌ ThirdSectionController: UpdateThirdSectionAsync returned null");
                    return StatusCode(500, "Failed to update third section");
                }

                _logger.LogInformation("✅ ThirdSectionController: Successfully updated third section - " +
                    "ID: {Id}, Title: {Title}", result.Id, result.Title);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ ThirdSectionController: Error in UpdateThirdSection endpoint");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}