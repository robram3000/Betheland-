namespace Realstate_servcices.Server.Entity.landingpage.Third_Section
{
    public class FeatureItem
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Icon { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Foreign key
        public int ThirdSectionId { get; set; }

        // Navigation property
        public ThirdSection ThirdSection { get; set; }
    }
}