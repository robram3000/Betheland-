namespace Realstate_servcices.Server.Dto.Chat
{
    public class ChatParticipantDto
    {
        public int Id { get; set; }
        public int ChatId { get; set; }
        public int BaseMemberId { get; set; }
        public int? RecipientId { get; set; }
        public string Role { get; set; }
        public string ParticipantType { get; set; }
        public int UnreadCount { get; set; }
        public DateTime? LastReadAt { get; set; }
        public DateTime JoinedAt { get; set; }
        public bool IsActive { get; set; }
        public BaseMemberDto Member { get; set; }
        public BaseMemberDto Recipient { get; set; }
    }
}
