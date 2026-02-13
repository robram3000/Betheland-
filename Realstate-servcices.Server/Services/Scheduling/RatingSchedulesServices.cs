using Microsoft.Extensions.Logging;
using Realstate_servcices.Server.Dto.Scheduling;
using Realstate_servcices.Server.Entity.Ratings;
using Realstate_servcices.Server.Repositories;
using Realstate_servcices.Server.Repository.ScheduleDao;

namespace Realstate_servcices.Server.Services.Scheduling
{
    public interface IRatingSchedulesServices
    {
        Task<RatingScheduleDto?> GetRatingByIdAsync(int id);
        Task<IEnumerable<RatingScheduleDto>> GetAllRatingsAsync();
        Task<IEnumerable<RatingScheduleDto>> GetRatingsByAgentAsync(int agentId);
        Task<IEnumerable<RatingScheduleDto>> GetRatingsByClientAsync(int clientId);
        Task<RatingScheduleDto> CreateRatingAsync(CreateRatingScheduleDto createDto, int clientId);
        Task<RatingScheduleDto?> UpdateRatingAsync(int id, UpdateRatingScheduleDto updateDto);
        Task<bool> DeleteRatingAsync(int id);
        Task<RatingSummaryDto> GetRatingSummaryAsync(int agentId);
        Task<bool> CanRateScheduleAsync(int scheduleId, int clientId);
    }

    public class RatingSchedulesServices : IRatingSchedulesServices
    {
        private readonly IRatingSchedulesRepository _ratingRepository;
        private readonly ISchedulePropertiesRepository _scheduleRepository;
        private readonly ILogger<RatingSchedulesServices> _logger;

        public RatingSchedulesServices(
            IRatingSchedulesRepository ratingRepository,
            ISchedulePropertiesRepository scheduleRepository,
            ILogger<RatingSchedulesServices> logger)
        {
            _ratingRepository = ratingRepository;
            _scheduleRepository = scheduleRepository;
            _logger = logger;
        }

        public async Task<RatingScheduleDto?> GetRatingByIdAsync(int id)
        {
            var rating = await _ratingRepository.GetByIdAsync(id);
            return rating != null ? MapToDto(rating) : null;
        }

        public async Task<IEnumerable<RatingScheduleDto>> GetAllRatingsAsync()
        {
            var ratings = await _ratingRepository.GetAllAsync();
            return ratings.Select(MapToDto);
        }

        public async Task<IEnumerable<RatingScheduleDto>> GetRatingsByAgentAsync(int agentId)
        {
            var ratings = await _ratingRepository.GetByAgentIdAsync(agentId);
            return ratings.Select(MapToDto);
        }

        public async Task<IEnumerable<RatingScheduleDto>> GetRatingsByClientAsync(int clientId)
        {
            var ratings = await _ratingRepository.GetByClientIdAsync(clientId);
            return ratings.Select(MapToDto);
        }

        public async Task<RatingScheduleDto> CreateRatingAsync(CreateRatingScheduleDto createDto, int clientId)
        {
            _logger.LogInformation("Creating rating - ScheduleId: {ScheduleId}, ClientId: {ClientId}", createDto.ScheduleId, clientId);

            // Check if rating already exists for this schedule
            if (await _ratingRepository.ExistsForScheduleAsync(createDto.ScheduleId))
            {
                throw new InvalidOperationException("A rating already exists for this schedule.");
            }

            // Verify the schedule exists and client is authorized to rate it
            var schedule = await _scheduleRepository.GetByIdAsync(createDto.ScheduleId);
            if (schedule == null)
            {
                throw new ArgumentException("Schedule not found.");
            }

            if (schedule.ClientId != clientId)
            {
                throw new UnauthorizedAccessException("Client is not authorized to rate this schedule.");
            }

            var rating = new RatingSchedule
            {
                ScheduleId = createDto.ScheduleId,
                ClientId = clientId,
                AgentId = schedule.AgentId, // Get from schedule, not from DTO
                Rating = createDto.Rating,
                Comment = createDto.Comment,
                RatingType = createDto.RatingType,
                RatingDate = DateTime.UtcNow,
                IsVisible = true,
                Status = "Active"
            };

            var createdRating = await _ratingRepository.CreateAsync(rating);
            _logger.LogInformation("Rating created successfully - ID: {RatingId}", createdRating.Id);
            return MapToDto(createdRating);
        }

        public async Task<RatingScheduleDto?> UpdateRatingAsync(int id, UpdateRatingScheduleDto updateDto)
        {
            var rating = await _ratingRepository.GetByIdAsync(id);
            if (rating == null) return null;

            if (updateDto.Rating.HasValue)
                rating.Rating = updateDto.Rating.Value;

            if (updateDto.Comment != null)
                rating.Comment = updateDto.Comment;

            if (updateDto.RatingType != null)
                rating.RatingType = updateDto.RatingType;

            if (updateDto.IsVisible.HasValue)
                rating.IsVisible = updateDto.IsVisible.Value;

            var updatedRating = await _ratingRepository.UpdateAsync(rating);
            return MapToDto(updatedRating);
        }

        public async Task<bool> DeleteRatingAsync(int id)
        {
            return await _ratingRepository.DeleteAsync(id);
        }

        public async Task<RatingSummaryDto> GetRatingSummaryAsync(int agentId)
        {
            return await _ratingRepository.GetRatingSummaryAsync(agentId);
        }

        public async Task<bool> CanRateScheduleAsync(int scheduleId, int clientId)
        {
            try
            {
                _logger.LogInformation("🔍 Checking rating eligibility - ScheduleId: {ScheduleId}, ClientId: {ClientId}", scheduleId, clientId);

                var schedule = await _scheduleRepository.GetByIdAsync(scheduleId);
                if (schedule == null)
                {
                    _logger.LogWarning("❌ Schedule not found for ScheduleId: {ScheduleId}", scheduleId);
                    return false;
                }

                _logger.LogInformation("✅ Schedule found - ID: {ScheduleId}, ClientId: {ScheduleClientId}, Status: {ScheduleStatus}",
                    schedule.Id, schedule.ClientId, schedule.Status);

                // Check if client is the one who scheduled the appointment
                if (schedule.ClientId != clientId)
                {
                    _logger.LogWarning("❌ Client mismatch: Schedule ClientId {ScheduleClientId} != Current ClientId {CurrentClientId}",
                        schedule.ClientId, clientId);
                    return false;
                }

                // Check if schedule is completed - make comparison case-insensitive and handle different status formats
                var status = schedule.Status?.ToLower()?.Trim();
                _logger.LogInformation("📊 Status check - Raw: '{RawStatus}', Normalized: '{NormalizedStatus}'",
                    schedule.Status, status);

                if (status != "completed")
                {
                    _logger.LogWarning("❌ Schedule status is not completed. Current status: '{ScheduleStatus}'", schedule.Status);
                    return false;
                }

                // Check if rating already exists
                bool ratingExists = await _ratingRepository.ExistsForScheduleAsync(scheduleId);
                _logger.LogInformation("⭐ Rating already exists: {RatingExists}", ratingExists);

                bool canRate = !ratingExists;
                _logger.LogInformation("🎯 Final canRate result: {CanRate}", canRate);

                return canRate;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "💥 Error in CanRateScheduleAsync for ScheduleId: {ScheduleId}, ClientId: {ClientId}", scheduleId, clientId);
                return false;
            }
        }

        private static RatingScheduleDto MapToDto(RatingSchedule rating)
        {
            return new RatingScheduleDto
            {
                Id = rating.Id,
                ScheduleId = rating.ScheduleId,
                ClientId = rating.ClientId,
                AgentId = rating.AgentId,
                Rating = rating.Rating,
                Comment = rating.Comment,
                RatingType = rating.RatingType,
              
            };
        }
    }
}