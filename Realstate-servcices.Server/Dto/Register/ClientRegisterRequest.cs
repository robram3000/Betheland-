namespace Realstate_servcices.Server.Dto.Register
{
    public class ClientRegisterRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;

        // Basic Information
        public string FirstName { get; set; } = string.Empty;
        public string? MiddleName { get; set; }
        public string LastName { get; set; } = string.Empty;
        public string? Suffix { get; set; }
        public string CellPhoneNo { get; set; } = string.Empty;
        public string Gender { get; set; } = string.Empty;

        // Make these optional since they're not collected in all forms
        public string? Country { get; set; }
        public string? City { get; set; }
        public string? Street { get; set; }
        public string? ZipCode { get; set; }

        // OTP Verification
        public string OTPCode { get; set; } = string.Empty;
    }

    public class ClientUpdateRequest
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? MiddleName { get; set; }
        public string? Suffix { get; set; }
        public string? CellPhoneNo { get; set; }
        public string? Gender { get; set; }
        public string? Country { get; set; }
        public string? City { get; set; }
        public string? Street { get; set; }
        public string? ZipCode { get; set; }
        public string? Address { get; set; }
    }

    public class ClientResponse
    {
        public int Id { get; set; }
        public int BaseMemberId { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string? MiddleName { get; set; }
        public string LastName { get; set; } = string.Empty;
        public string? Suffix { get; set; }
        public string CellPhoneNo { get; set; } = string.Empty;
        public string Gender { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string? Country { get; set; }
        public string? City { get; set; }
        public string? Street { get; set; }
        public string? ZipCode { get; set; }
        public DateTime DateRegistered { get; set; }

        // BaseMember properties
        public string Email { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string? ProfilePictureUrl { get; set; }
        public string Role { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }



}