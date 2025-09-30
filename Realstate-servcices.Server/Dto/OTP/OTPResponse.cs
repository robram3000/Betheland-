namespace Realstate_servcices.Server.Dto.OTP
{
    public class OTPResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public DateTime? ExpiresAt { get; set; }
    }
}