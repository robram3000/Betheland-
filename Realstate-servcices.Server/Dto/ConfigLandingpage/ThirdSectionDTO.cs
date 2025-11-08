namespace Realstate_servcices.Server.Dto.ConfigLandingpage
{
    public class ThirdSectionDTO
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Subtitle { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public List<ProcessStepDTO> ProcessSteps { get; set; } = new List<ProcessStepDTO>();
        public List<FeatureItemDTO> FeatureItems { get; set; } = new List<FeatureItemDTO>();
    }

    public class ProcessStepDTO
    {
        public int Id { get; set; }
        public int StepNumber { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Icon { get; set; } = string.Empty;
    }

    public class FeatureItemDTO
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Icon { get; set; } = string.Empty;
    }
}
