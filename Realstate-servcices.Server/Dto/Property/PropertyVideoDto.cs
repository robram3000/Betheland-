namespace Realstate_servcices.Server.Dto.Property
{
    public class PropertyVideoDto
    {
        public int Id { get; set; }
        public int PropertyId { get; set; }
        public string VideoUrl { get; set; } = string.Empty;
        public string ThumbnailUrl { get; set; } = string.Empty;
        public string Duration { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public string VideoName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
