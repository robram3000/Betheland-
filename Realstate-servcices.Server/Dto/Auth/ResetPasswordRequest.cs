namespace Realstate_servcices.Server.Dto.Auth
{
    public class ResetPasswordRequest
    {
        public string Email { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
        public string ConfirmPassword { get; set; } = string.Empty;
        public string OTPCode { get; set; } = string.Empty;
    }
}
