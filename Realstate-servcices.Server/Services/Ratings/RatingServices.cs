using Realstate_servcices.Server.Dto.Rating;
using Realstate_servcices.Server.Entity.Chat;
using Realstate_servcices.Server.Repository.Ratings;

namespace Realstate_servcices.Server.Services.Ratings
{
    public interface IRatingService
    {
        Task<RatingDto?> GetRatingByIdAsync(int id);
        Task<IEnumerable<RatingDto>> GetAllRatingsAsync();
        Task<IEnumerable<RatingDto>> GetRatingsByUserIdAsync(int userId);
        Task<IEnumerable<RatingDto>> GetRatingsForUserAsync(int ratedId);
        Task<RatingDto> CreateRatingAsync(CreateRatingDto createRatingDto);
        Task<RatingDto> UpdateRatingAsync(int id, UpdateRatingDto updateRatingDto);
        Task<bool> DeleteRatingAsync(int id);
        Task<double> GetAverageRatingAsync(int ratedId);
        Task<int> GetRatingCountAsync(int ratedId);
        Task<bool> HasUserRatedAsync(int raterId, int ratedId, string? propertyId = null);
    }
    public class RatingService : IRatingService
    {
        private readonly IRatingRepository _ratingRepository;

        public RatingService(IRatingRepository ratingRepository)
        {
            _ratingRepository = ratingRepository;
        }

        public async Task<RatingDto?> GetRatingByIdAsync(int id)
        {
            var rating = await _ratingRepository.GetByIdAsync(id);
            return rating != null ? MapToDto(rating) : null;
        }

        public async Task<IEnumerable<RatingDto>> GetAllRatingsAsync()
        {
            var ratings = await _ratingRepository.GetAllAsync();
            return ratings.Select(MapToDto);
        }

        public async Task<IEnumerable<RatingDto>> GetRatingsByUserIdAsync(int userId)
        {
            var ratings = await _ratingRepository.GetByRaterIdAsync(userId);
            return ratings.Select(MapToDto);
        }

        public async Task<IEnumerable<RatingDto>> GetRatingsForUserAsync(int ratedId)
        {
            var ratings = await _ratingRepository.GetByRatedIdAsync(ratedId);
            return ratings.Select(MapToDto);
        }

        public async Task<RatingDto> CreateRatingAsync(CreateRatingDto createRatingDto)
        {
            // Check if user has already rated
            var hasRated = await _ratingRepository.HasUserRatedAsync(
                createRatingDto.RaterId,
                createRatingDto.RatedId,
                createRatingDto.PropertyId);

            if (hasRated)
            {
                throw new InvalidOperationException("You have already rated this user for this property.");
            }

            var rating = new Rating
            {
                RaterId = createRatingDto.RaterId,
                RatedId = createRatingDto.RatedId,
                Stars = createRatingDto.Stars,
                Comment = createRatingDto.Comment,
                RatingType = createRatingDto.RatingType,
                PropertyId = createRatingDto.PropertyId,
                ChatId = createRatingDto.ChatId,
                AgentId = createRatingDto.AgentId,
                ClientId = createRatingDto.ClientId,
                CreatedAt = DateTime.UtcNow
            };

            var createdRating = await _ratingRepository.AddAsync(rating);
            return MapToDto(createdRating);
        }

        public async Task<RatingDto> UpdateRatingAsync(int id, UpdateRatingDto updateRatingDto)
        {
            var rating = await _ratingRepository.GetByIdAsync(id);
            if (rating == null)
            {
                throw new ArgumentException("Rating not found");
            }

            rating.Stars = updateRatingDto.Stars;
            rating.Comment = updateRatingDto.Comment;
            rating.UpdatedAt = DateTime.UtcNow;

            var updatedRating = await _ratingRepository.UpdateAsync(rating);
            return MapToDto(updatedRating);
        }

        public async Task<bool> DeleteRatingAsync(int id)
        {
            return await _ratingRepository.DeleteAsync(id);
        }

        public async Task<double> GetAverageRatingAsync(int ratedId)
        {
            return await _ratingRepository.GetAverageRatingAsync(ratedId);
        }

        public async Task<int> GetRatingCountAsync(int ratedId)
        {
            return await _ratingRepository.GetRatingCountAsync(ratedId);
        }

        public async Task<bool> HasUserRatedAsync(int raterId, int ratedId, string? propertyId = null)
        {
            return await _ratingRepository.HasUserRatedAsync(raterId, ratedId, propertyId);
        }

        private static RatingDto MapToDto(Rating rating)
        {
            return new RatingDto
            {
                Id = rating.Id,
                RatingNo = rating.RatingNo,
                RaterId = rating.RaterId,
                RatedId = rating.RatedId,
                Stars = rating.Stars,
                Comment = rating.Comment,
                RatingType = rating.RatingType,
                PropertyId = rating.PropertyId,
                ChatId = rating.ChatId,
                AgentId = rating.AgentId,
                ClientId = rating.ClientId,
                IsVisible = rating.IsVisible,
                CreatedAt = rating.CreatedAt,
                UpdatedAt = rating.UpdatedAt,
            
            };
        }
    }
}
