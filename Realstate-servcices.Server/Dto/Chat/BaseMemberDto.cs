namespace Realstate_servcices.Server.Dto.Chat
{
    public class BaseMemberDto
    {
        public int Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string FullName => $"{FirstName} {LastName}";
        public string? ProfileImage { get; set; }
        public string MemberType { get; set; } = "user";
    }
}
