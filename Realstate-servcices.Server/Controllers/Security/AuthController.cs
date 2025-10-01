using Microsoft.AspNetCore.Mvc;
using Realstate_servcices.Server.Dto.Auth;
using Realstate_servcices.Server.Services.Authentication;

namespace Realstate_servcices.Server.Controllers.Security
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IPasswordResetService _passwordResetService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            IPasswordResetService passwordResetService,
            ILogger<AuthController> logger)
        {
            _passwordResetService = passwordResetService;
            _logger = logger;
        }

        [HttpPost("verify-email-for-password-reset")]
        public async Task<IActionResult> VerifyEmailForPasswordReset([FromBody] VerifyEmailRequest request)
        {
            try
            {
                var result = await _passwordResetService.VerifyEmailForPasswordResetAsync(request);

                if (!result.Success)
                {
                    return BadRequest(new { message = result.Message });
                }

                return Ok(new
                {
                    message = result.Message,
                    email = result.Email
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in VerifyEmailForPasswordReset for email: {Email}", request.Email);
                return StatusCode(500, new { message = "An internal error occurred." });
            }
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            try
            {
                var result = await _passwordResetService.ResetPasswordAsync(request);

                if (!result.Success)
                {
                    return BadRequest(new { message = result.Message });
                }

                return Ok(new { message = result.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in ResetPassword for email: {Email}", request.Email);
                return StatusCode(500, new { message = "An internal error occurred." });
            }
        }
    }
}