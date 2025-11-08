namespace Realstate_servcices.Server.Dto.ConfigLandingpage
{
    public class AnnouncementDto
    {
        public int Id { get; set; }
        public string Content { get; set; } = string.Empty;
        public int DisplayOrder { get; set; }
        public string Category { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
    public class CreateAnnouncementDto
    {
        public string Content { get; set; } = string.Empty;
        public int DisplayOrder { get; set; }
        public string Category { get; set; } = string.Empty;
    }

    public class UpdateAnnouncementDto
    {
        public string Content { get; set; } = string.Empty;
        public int DisplayOrder { get; set; }
        public string Category { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }
}
