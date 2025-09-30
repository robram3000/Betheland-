namespace Realstate_servcices.Server.Dto.Auth
{
    public class PasswordResetResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? Email { get; set; }
    }
}
