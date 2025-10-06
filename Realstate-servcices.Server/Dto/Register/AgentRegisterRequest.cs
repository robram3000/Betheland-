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
        public string? MiddleName { get; set; }
        public string? Suffix { get; set; }
        public string? Bio { get; set; }
        public DateTime? LicenseExpiry { get; set; }
        public string? Experience { get; set; }
        public string? Specialization { get; set; }
        public string? OfficeAddress { get; set; }
        public string? OfficePhone { get; set; }
        public string? Website { get; set; }
        public string? Languages { get; set; }
        public string? Education { get; set; }
        public string? Awards { get; set; }
        public int? YearsOfExperience { get; set; }
        public string? BrokerageName { get; set; }
    }

    public class AgentUpdateRequest
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string CellPhoneNo { get; set; } = string.Empty;
        public string LicenseNumber { get; set; } = string.Empty;
        public string? MiddleName { get; set; }
        public string? Suffix { get; set; }
        public string? Bio { get; set; }
        public DateTime? LicenseExpiry { get; set; }
        public string? Experience { get; set; }
        public string? Specialization { get; set; }
        public string? OfficeAddress { get; set; }
        public string? OfficePhone { get; set; }
        public string? Website { get; set; }
        public string? Languages { get; set; }
        public string? Education { get; set; }
        public string? Awards { get; set; }
        public int? YearsOfExperience { get; set; }
        public string? BrokerageName { get; set; }
        public bool? IsVerified { get; set; }
    }

    public class AgentResponse
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? MiddleName { get; set; }
        public string? Suffix { get; set; }
        public string CellPhoneNo { get; set; } = string.Empty;
        public string LicenseNumber { get; set; } = string.Empty;
        public string? Bio { get; set; }
        public DateTime? LicenseExpiry { get; set; }
        public string? Experience { get; set; }
        public string? Specialization { get; set; }
        public string? OfficeAddress { get; set; }
        public string? OfficePhone { get; set; }
        public string? Website { get; set; }
        public string? Languages { get; set; }
        public string? Education { get; set; }
        public string? Awards { get; set; }
        public int? YearsOfExperience { get; set; }
        public string? BrokerageName { get; set; }
        public bool IsVerified { get; set; }
        public DateTime? VerificationDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime DateRegistered { get; set; }
    }
}