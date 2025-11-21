namespace Realstate_servcices.Server.Dto.Rating
{
    public class CreateRatingDto
    {
        public int RaterId { get; set; }
        public int RatedId { get; set; }
        public int Stars { get; set; }
        public string? Comment { get; set; }
        public string RatingType { get; set; } = "agent";
        public string? PropertyId { get; set; }
        public int? ChatId { get; set; }
        public int? AgentId { get; set; }
        public int? ClientId { get; set; }
    }
}
