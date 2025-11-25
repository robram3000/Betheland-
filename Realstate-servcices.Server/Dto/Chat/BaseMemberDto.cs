namespace Realstate_servcices.Server.Dto.Chat
{
    public class BaseMemberDto
    {
        public int Id { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? FullName { get; set; }
        public string? ProfileImage { get; set; }
        public string? MemberType { get; set; }
        public string Email { get; set; }
        public string Username { get; set; }

        public int Recipient { get; set; }
    }
}
