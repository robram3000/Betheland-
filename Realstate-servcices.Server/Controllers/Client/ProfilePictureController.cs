using Microsoft.AspNetCore.Mvc;
using Realstate_servcices.Server.Dto.Register;
using Realstate_servcices.Server.Services.ProfileCreation;

namespace Realstate_servcices.Server.Controllers.Client
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProfilePictureController : ControllerBase
    {
        private readonly IProfilePictureService _profilePictureService;
        private readonly ILogger<ProfilePictureController> _logger;

        public ProfilePictureController(
            IProfilePictureService profilePictureService,
            ILogger<ProfilePictureController> logger)
        {
            _profilePictureService = profilePictureService;
            _logger = logger;
        }

        [HttpPost("{baseMemberId}/upload")]
        public async Task<ActionResult<ProfilePictureResponse>> UploadProfilePicture(int baseMemberId, [FromForm] UpdateProfilePictureRequest request)
        {
            try
            {
                if (request.File == null || request.File.Length == 0)
                {
                    return BadRequest(new ProfilePictureResponse { Success = false, Message = "No file provided" });
                }

                var result = await _profilePictureService.UploadProfilePictureAsync(baseMemberId, request.File);

                if (result.Success)
                {
                    _logger.LogInformation("Profile picture uploaded successfully for BaseMemberId: {BaseMemberId}", baseMemberId);
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

        [HttpDelete("{baseMemberId}")]
        public async Task<ActionResult<ProfilePictureResponse>> DeleteProfilePicture(int baseMemberId)
        {
            try
            {
                var result = await _profilePictureService.DeleteProfilePictureAsync(baseMemberId);

                if (result.Success)
                {
                    _logger.LogInformation("Profile picture deleted successfully for BaseMemberId: {BaseMemberId}", baseMemberId);
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting profile picture for BaseMemberId: {BaseMemberId}", baseMemberId);
                return StatusCode(500, new ProfilePictureResponse { Success = false, Message = "Internal server error" });
            }
        }

        [HttpGet("{baseMemberId}")]
        public async Task<ActionResult<ProfilePictureResponse>> GetProfilePicture(int baseMemberId)
        {
            try
            {
                var profilePictureUrl = await _profilePictureService.GetProfilePictureAsync(baseMemberId);

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
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting profile picture for BaseMemberId: {BaseMemberId}", baseMemberId);
                return StatusCode(500, new ProfilePictureResponse { Success = false, Message = "Internal server error" });
            }
        }
    }
}
