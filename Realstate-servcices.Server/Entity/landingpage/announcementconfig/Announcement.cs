namespace Realstate_servcices.Server.Entity.landingpage.announcementconfig
{
    public class AnnouncementConfig
    {
        public int Id { get; set; }
        public string Content { get; set; } = string.Empty;
        public int DisplayOrder { get; set; }
        public string Category { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
