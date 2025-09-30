namespace Realstate_servcices.Server.Dto.Auth
{
    public class ValidateResetRequest
    {
        public string Email { get; set; } = string.Empty;
        public string OTPCode { get; set; } = string.Empty;
    }
}
