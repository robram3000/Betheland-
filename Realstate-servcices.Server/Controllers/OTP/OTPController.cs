using Microsoft.AspNetCore.Mvc;
using Realstate_servcices.Server.Dto.OTP;
using Realstate_servcices.Server.Services.SMTP.interfaces;

namespace Realstate_servcices.Server.Controllers.OTP
{
    [ApiController]
    [Route("api/[controller]")]
    public class OTPController : ControllerBase
    {
        private readonly IOTPService _otpService;
        private readonly ILogger<OTPController> _logger;

        public OTPController(IOTPService otpService, ILogger<OTPController> logger)
        {
            _otpService = otpService;
            _logger = logger;
        }

        [HttpPost("generate")]
        public async Task<ActionResult<OTPResponse>> GenerateOTP([FromBody] GenerateOTPRequest request)
        {
            try
            {
                _logger.LogInformation($"Generating OTP for email: {request.Email}");
                var result = await _otpService.GenerateAndSendOTPAsync(request);

                if (!result.Success)
                {
                    _logger.LogWarning($"OTP generation failed for {request.Email}: {result.Message}");
                    return BadRequest(result);
                }

                _logger.LogInformation($"OTP generated successfully for: {request.Email}");
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error generating OTP for {request.Email}");
                return StatusCode(500, new OTPResponse
                {
                    Success = false,
                    Message = "An internal server error occurred"
                });
            }
        }

        [HttpPost("verify")]
        public async Task<ActionResult<OTPResponse>> VerifyOTP([FromBody] VerifyOTPRequest request)
        {
            try
            {
                _logger.LogInformation($"Verifying OTP for email: {request.Email}, OTP: {request.OTPCode}");

                // Log the incoming request for debugging
                _logger.LogInformation($"Request received - Email: {request.Email}, OTP Code Length: {request.OTPCode?.Length}");

                var result = await _otpService.VerifyOTPAsync(request);

                if (!result.Success)
                {
                    _logger.LogWarning($"OTP verification failed for {request.Email}: {result.Message}");
                    return BadRequest(result);
                }

                _logger.LogInformation($"OTP verified successfully for: {request.Email}");
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error verifying OTP for {request.Email}");
                return StatusCode(500, new OTPResponse
                {
                    Success = false,
                    Message = "An internal server error occurred"
                });
            }
        }
        [HttpPost("resend")]
        public async Task<ActionResult<OTPResponse>> ResendOTP([FromBody] ResendOTPRequest request)
        {
            try
            {
                _logger.LogInformation($"Resending OTP for email: {request.Email}");
                var result = await _otpService.ResendOTPAsync(request);

                if (!result.Success)
                {
                    _logger.LogWarning($"OTP resend failed for {request.Email}: {result.Message}");
                    return BadRequest(result);
                }

                _logger.LogInformation($"OTP resent successfully for: {request.Email}");
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error resending OTP for {request.Email}");
                return StatusCode(500, new OTPResponse
                {
                    Success = false,
                    Message = "An internal server error occurred"
                });
            }
        }
    }
}