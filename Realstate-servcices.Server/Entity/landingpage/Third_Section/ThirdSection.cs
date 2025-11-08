
namespace Realstate_servcices.Server.Entity.landingpage.Third_Section
{
    public class ThirdSection
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Subtitle { get; set; }
        public string Description { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public List<ProcessStep> ProcessSteps { get; set; } = new List<ProcessStep>();
        public List<FeatureItem> FeatureItems { get; set; } = new List<FeatureItem>();
    }
}