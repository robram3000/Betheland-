using Realstate_servcices.Server.Dto.Auth;
using Realstate_servcices.Server.Dto.OTP;
using Realstate_servcices.Server.Repository.UserDAO;
using Realstate_servcices.Server.Services.SMTP.interfaces;

namespace Realstate_servcices.Server.Services.Authentication
{
    public interface IPasswordResetService
    {
        Task<PasswordResetResponse> VerifyEmailForPasswordResetAsync(VerifyEmailRequest request);
        Task<PasswordResetResponse> ResetPasswordAsync(ResetPasswordRequest request);
        Task<PasswordResetResponse> ValidateResetRequestAsync(string email, string otpCode);
    }

    public class PasswordResetService : IPasswordResetService
    {
        private readonly IBaseMemberRepository _baseMemberRepository;
        private readonly IOTPService _otpService;
        private readonly ILogger<PasswordResetService> _logger;

        public PasswordResetService(
            IBaseMemberRepository baseMemberRepository,
            IOTPService otpService,
            ILogger<PasswordResetService> logger)
        {
            _baseMemberRepository = baseMemberRepository;
            _otpService = otpService;
            _logger = logger;
        }

        public async Task<PasswordResetResponse> VerifyEmailForPasswordResetAsync(VerifyEmailRequest request)
        {
            try
            {
                // Validate email input
                if (string.IsNullOrWhiteSpace(request.Email))
                {
                    return new PasswordResetResponse
                    {
                        Success = false,
                        Message = "Email is required."
                    };
                }

                // Check if email exists in database
                var member = await _baseMemberRepository.FindByEmailAsync(request.Email);

                if (member == null)
                {
                    return new PasswordResetResponse
                    {
                        Success = false,
                        Message = "Email not found in our system."
                    };
                }

                // Check if account is active/verified
                if (member.status != "Active" && member.status != "Verified")
                {
                    return new PasswordResetResponse
                    {
                        Success = false,
                        Message = "Account is not active. Please contact support."
                    };
                }

                return new PasswordResetResponse
                {
                    Success = true,
                    Message = "Email verified successfully",
                    Email = request.Email
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying email for password reset: {Email}", request.Email);
                return new PasswordResetResponse
                {
                    Success = false,
                    Message = "An error occurred while verifying email."
                };
            }
        }

        public async Task<PasswordResetResponse> ValidateResetRequestAsync(string email, string otpCode)
        {
            try
            {
                // Verify OTP
                var otpRequest = new VerifyOTPRequest
                {
                    Email = email,
                    OTPCode = otpCode
                };

                var otpResult = await _otpService.VerifyOTPAsync(otpRequest);

                if (!otpResult.Success)
                {
                    return new PasswordResetResponse
                    {
                        Success = false,
                        Message = otpResult.Message
                    };
                }

                // Verify user exists and is active
                var member = await _baseMemberRepository.FindByEmailAsync(email);
                if (member == null)
                {
                    return new PasswordResetResponse
                    {
                        Success = false,
                        Message = "User not found."
                    };
                }

                if (member.status != "Active" && member.status != "Verified")
                {
                    return new PasswordResetResponse
                    {
                        Success = false,
                        Message = "Account is not active."
                    };
                }

                return new PasswordResetResponse
                {
                    Success = true,
                    Message = "Reset request validated successfully"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating reset request: {Email}", email);
                return new PasswordResetResponse
                {
                    Success = false,
                    Message = "An error occurred while validating reset request."
                };
            }
        }

        public async Task<PasswordResetResponse> ResetPasswordAsync(ResetPasswordRequest request)
        {
            try
            {
                // Validate input
                if (string.IsNullOrWhiteSpace(request.Email) ||
                    string.IsNullOrWhiteSpace(request.NewPassword) ||
                    string.IsNullOrWhiteSpace(request.OTPCode))
                {
                    return new PasswordResetResponse
                    {
                        Success = false,
                        Message = "All fields are required."
                    };
                }

                // Validate passwords match
                if (request.NewPassword != request.ConfirmPassword)
                {
                    return new PasswordResetResponse
                    {
                        Success = false,
                        Message = "Passwords do not match."
                    };
                }

                // Validate password strength
                var passwordValidation = ValidatePassword(request.NewPassword);
                if (!passwordValidation.IsValid)
                {
                    return new PasswordResetResponse
                    {
                        Success = false,
                        Message = passwordValidation.ErrorMessage
                    };
                }

                // Validate the reset request (OTP and user status)
                var validationResult = await ValidateResetRequestAsync(request.Email, request.OTPCode);
                if (!validationResult.Success)
                {
                    return validationResult;
                }

                // Find user by email
                var member = await _baseMemberRepository.FindByEmailAsync(request.Email);
                if (member == null)
                {
                    return new PasswordResetResponse
                    {
                        Success = false,
                        Message = "User not found."
                    };
                }

                // Hash new password using BCrypt (same as in ClientService)
                var newPasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);

                // Update password in database
                await _baseMemberRepository.UpdatePasswordAsync(member.Id, newPasswordHash);

                _logger.LogInformation("Password reset successfully for user: {Email}", request.Email);

                return new PasswordResetResponse
                {
                    Success = true,
                    Message = "Password reset successfully."
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resetting password for user: {Email}", request.Email);
                return new PasswordResetResponse
                {
                    Success = false,
                    Message = "An error occurred while resetting password."
                };
            }
        }

        private (bool IsValid, string ErrorMessage) ValidatePassword(string password)
        {
            if (string.IsNullOrWhiteSpace(password))
                return (false, "Password is required.");

            if (password.Length < 8)
                return (false, "Password must be at least 8 characters long.");

            if (!password.Any(char.IsUpper))
                return (false, "Password must contain at least one uppercase letter.");

            if (!password.Any(char.IsLower))
                return (false, "Password must contain at least one lowercase letter.");

            if (!password.Any(char.IsDigit))
                return (false, "Password must contain at least one number.");

            // Optional: Add special character requirement
            // if (!password.Any(ch => !char.IsLetterOrDigit(ch)))
            //     return (false, "Password must contain at least one special character.");

            return (true, string.Empty);
        }
    }


}