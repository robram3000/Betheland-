namespace Realstate_servcices.Server.Dto.Chat
{
    public class CreateNotificationDto
    {
        public int BaseMemberId { get; set; }
        public string NotificationType { get; set; } = "message";
        public string Title { get; set; } = string.Empty;
        public string? Content { get; set; }
        public string? Data { get; set; }
        public int? ChatId { get; set; }
        public int? MessageId { get; set; }
        public int? PropertyId { get; set; }
        public string Priority { get; set; } = "normal";
    }
}
