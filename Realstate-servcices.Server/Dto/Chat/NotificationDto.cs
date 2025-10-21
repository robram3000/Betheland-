namespace Realstate_servcices.Server.Dto.Chat
{
    public class NotificationDto
    {
        public int Id { get; set; }
        public Guid NotificationNo { get; set; }
        public int BaseMemberId { get; set; }
        public string NotificationType { get; set; } = "message";
        public string Title { get; set; } = string.Empty;
        public string? Content { get; set; }
        public string? Data { get; set; }
        public int? ChatId { get; set; }
        public int? MessageId { get; set; }
        public int? PropertyId { get; set; }
        public bool IsRead { get; set; }
        public bool IsPushed { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ReadAt { get; set; }
        public DateTime? PushedAt { get; set; }
        public string Priority { get; set; } = "normal";
    }
}
