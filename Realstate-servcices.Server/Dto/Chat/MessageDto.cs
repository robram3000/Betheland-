namespace Realstate_servcices.Server.Dto.Chat
{
    public class MessageDto
    {
        public int Id { get; set; }
        public Guid MessageNo { get; set; }
        public int ChatId { get; set; }
        public int SenderId { get; set; }
        public string? Content { get; set; }
        public string MessageType { get; set; } = "text";
        public bool IsEdited { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime SentAt { get; set; }
        public DateTime? ReadAt { get; set; }
        public DateTime? EditedAt { get; set; }
        public BaseMemberDto? Sender { get; set; }
        public List<MessageFileDto> Files { get; set; } = new List<MessageFileDto>();
        public List<MessageReactionDto> Reactions { get; set; } = new List<MessageReactionDto>();
    }

}
