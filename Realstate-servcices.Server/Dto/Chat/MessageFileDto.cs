namespace Realstate_servcices.Server.Dto.Chat
{
    public class MessageFileDto
    {
        public int Id { get; set; }
        public int MessageId { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string FileUrl { get; set; } = string.Empty;
        public string FileType { get; set; } = "image";
        public long FileSize { get; set; }
        public string? ThumbnailUrl { get; set; }
        public string? MimeType { get; set; }
        public DateTime UploadedAt { get; set; }
    }
}
