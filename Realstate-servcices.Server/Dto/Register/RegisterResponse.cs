namespace Realstate_servcices.Server.Dto.Register
{
    public class RegisterResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? UserId { get; set; } 
    }
    public class StatusUpdateRequest
    {
        public string Status { get; set; } = string.Empty;
    }
}
