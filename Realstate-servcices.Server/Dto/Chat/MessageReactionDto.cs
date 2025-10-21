namespace Realstate_servcices.Server.Dto.Chat
{
    public class MessageReactionDto
    {
        public int Id { get; set; }
        public int MessageId { get; set; }
        public int BaseMemberId { get; set; }
        public string Emoji { get; set; } = string.Empty;
        public DateTime ReactedAt { get; set; }
        public BaseMemberDto? Member { get; set; }
    }
}
