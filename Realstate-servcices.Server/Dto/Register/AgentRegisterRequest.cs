namespace Realstate_servcices.Server.Dto.Register
{
    public class AgentRegisterRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string CellPhoneNo { get; set; } = string.Empty;
        public string LicenseNumber { get; set; } = string.Empty;
    }

    public class AgentUpdateRequest
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string CellPhoneNo { get; set; } = string.Empty;
        public string LicenseNumber { get; set; } = string.Empty;
    }

    public class AgentResponse
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string CellPhoneNo { get; set; } = string.Empty;
        public string LicenseNumber { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
