namespace Realstate_servcices.Server.Dto.Rating
{
    public class RatingDto
    {
        public int Id { get; set; }
        public Guid RatingNo { get; set; }
        public int RaterId { get; set; }
        public int RatedId { get; set; }
        public int Stars { get; set; }
        public string? Comment { get; set; }
        public string RatingType { get; set; } = "agent";
        public string? PropertyId { get; set; }
        public int? ChatId { get; set; }
        public int? AgentId { get; set; }
        public int? ClientId { get; set; }
        public bool IsVisible { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? RaterName { get; set; }
        public string? RatedName { get; set; }
    }
}
