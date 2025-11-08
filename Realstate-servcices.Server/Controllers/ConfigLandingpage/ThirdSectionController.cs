using Microsoft.AspNetCore.Mvc;
using Realstate_servcices.Server.Dto.ConfigLandingpage;
using Realstate_servcices.Server.Services.ConfigLandingpage;

namespace Realstate_servcices.Server.Controllers.ConfigLandingpage
{
    [ApiController]
    [Route("api/[controller]")]
    public class ThirdSectionController : ControllerBase
    {
        private readonly IThirdSectionServices _thirdSectionServices;

        public ThirdSectionController(IThirdSectionServices thirdSectionServices)
        {
            _thirdSectionServices = thirdSectionServices;
        }

        [HttpGet]
        public async Task<ActionResult<ThirdSectionDTO>> GetThirdSection()
        {
            try
            {
                var thirdSection = await _thirdSectionServices.GetThirdSectionAsync();
                return Ok(thirdSection);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut]
        public async Task<ActionResult<ThirdSectionDTO>> UpdateThirdSection(ThirdSectionDTO thirdSectionDto)
        {
            try
            {
                var updatedSection = await _thirdSectionServices.UpdateThirdSectionAsync(thirdSectionDto);
                return Ok(updatedSection);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
