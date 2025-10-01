using Realstate_servcices.Server.Dto.Auth;
using Realstate_servcices.Server.Repository.UserDAO;

namespace Realstate_servcices.Server.Services.Authentication
{
    public interface IPasswordResetService
    {
        Task<PasswordResetResponse> VerifyEmailForPasswordResetAsync(VerifyEmailRequest request);
        Task<PasswordResetResponse> ResetPasswordAsync(ResetPasswordRequest request);
    }

    public class PasswordResetService : IPasswordResetService
    {
        private readonly IBaseMemberRepository _baseMemberRepository;
        private readonly ILogger<PasswordResetService> _logger;

        public PasswordResetService(
            IBaseMemberRepository baseMemberRepository,
            ILogger<PasswordResetService> logger)
        {
            _baseMemberRepository = baseMemberRepository;
            _logger = logger;
        }

        public async Task<PasswordResetResponse> VerifyEmailForPasswordResetAsync(VerifyEmailRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Email))
                {
                    return new PasswordResetResponse
                    {
                        Success = false,
                        Message = "Email is required."
                    };
                }

                var member = await _baseMemberRepository.FindByEmailAsync(request.Email);

                if (member == null)
                {
                    return new PasswordResetResponse
                    {
                        Success = false,
                        Message = "Email not found in our system."
                    };
                }

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

        public async Task<PasswordResetResponse> ResetPasswordAsync(ResetPasswordRequest request)
        {
            try
            {
                // Validate required fields
                if (string.IsNullOrWhiteSpace(request.Email) ||
                    string.IsNullOrWhiteSpace(request.NewPassword))
                {
                    return new PasswordResetResponse
                    {
                        Success = false,
                        Message = "Email and new password are required."
                    };
                }

                // Validate password confirmation
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

                // Validate user exists and is active
                var member = await _baseMemberRepository.FindByEmailAsync(request.Email);
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
                        Message = "Account is not active. Please contact support."
                    };
                }

                // Hash the new password
                var newPasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);

                // Update password in database
                var updateResult = await _baseMemberRepository.UpdatePasswordAsync(member.Id, newPasswordHash);

                if (!updateResult)
                {
                    _logger.LogError("Failed to update password in database for user: {Email}", request.Email);
                    return new PasswordResetResponse
                    {
                        Success = false,
                        Message = "Failed to update password. Please try again."
                    };
                }

                _logger.LogInformation("Password reset successfully for user: {Email}", request.Email);

                return new PasswordResetResponse
                {
                    Success = true,
                    Message = "Password reset successfully. You can now login with your new password."
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resetting password for user: {Email}", request.Email);
                return new PasswordResetResponse
                {
                    Success = false,
                    Message = "An error occurred while resetting password. Please try again."
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

            return (true, string.Empty);
        }
    }
}