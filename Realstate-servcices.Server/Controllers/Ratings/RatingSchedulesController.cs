using Microsoft.AspNetCore.Mvc;
using Realstate_servcices.Server.Dto.Scheduling;
using Realstate_servcices.Server.Services.Scheduling;
using System.Security.Claims;

namespace Realstate_servcices.Server.Controllers.Ratings
{
    [ApiController]
    [Route("api/[controller]")]
    public class RatingSchedulesController : ControllerBase
    {
        private readonly IRatingSchedulesServices _ratingServices;
        private readonly ILogger<RatingSchedulesController> _logger;

        public RatingSchedulesController(
            IRatingSchedulesServices ratingServices,
            ILogger<RatingSchedulesController> logger)
        {
            _ratingServices = ratingServices;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<RatingScheduleDto>>> GetAllRatings()
        {
            var ratings = await _ratingServices.GetAllRatingsAsync();
            return Ok(ratings);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<RatingScheduleDto>> GetRatingById(int id)
        {
            var rating = await _ratingServices.GetRatingByIdAsync(id);
            if (rating == null) return NotFound();
            return Ok(rating);
        }

        [HttpGet("agent/{agentId}")]
        public async Task<ActionResult<IEnumerable<RatingScheduleDto>>> GetRatingsByAgent(int agentId)
        {
            var ratings = await _ratingServices.GetRatingsByAgentAsync(agentId);
            return Ok(ratings);
        }

        [HttpGet("client/{clientId}")]
        public async Task<ActionResult<IEnumerable<RatingScheduleDto>>> GetRatingsByClient(int clientId)
        {
            var ratings = await _ratingServices.GetRatingsByClientAsync(clientId);
            return Ok(ratings);
        }

        [HttpGet("agent/{agentId}/summary")]
        public async Task<ActionResult<RatingSummaryDto>> GetRatingSummary(int agentId)
        {
            var summary = await _ratingServices.GetRatingSummaryAsync(agentId);
            return Ok(summary);
        }

        [HttpPost]
        public async Task<ActionResult<RatingScheduleDto>> CreateRating([FromBody] CreateRatingScheduleDto createDto)
        {
            try
            {
                // Get the client ID from the authenticated user
                var clientId = GetCurrentClientId();
                _logger.LogInformation("Creating rating for ScheduleId: {ScheduleId}, ClientId: {ClientId}", createDto.ScheduleId, clientId);

                var rating = await _ratingServices.CreateRatingAsync(createDto, clientId);
                return CreatedAtAction(nameof(GetRatingById), new { id = rating.Id }, rating);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid operation while creating rating");
                return BadRequest(ex.Message);
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized access while creating rating");
                return Unauthorized(ex.Message);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Argument error while creating rating");
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while creating rating");
                return StatusCode(500, "An unexpected error occurred");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<RatingScheduleDto>> UpdateRating(int id, [FromBody] UpdateRatingScheduleDto updateDto)
        {
            var updatedRating = await _ratingServices.UpdateRatingAsync(id, updateDto);
            if (updatedRating == null) return NotFound();
            return Ok(updatedRating);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteRating(int id)
        {
            var result = await _ratingServices.DeleteRatingAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }

        [HttpGet("can-rate/{scheduleId}")]
        public async Task<ActionResult<bool>> CanRateSchedule(int scheduleId)
        {
            try
            {
                var clientId = GetCurrentClientId();
                _logger.LogInformation("Checking can-rate for ScheduleId: {ScheduleId}, ClientId: {ClientId}", scheduleId, clientId);
                var canRate = await _ratingServices.CanRateScheduleAsync(scheduleId, clientId);
                _logger.LogInformation("CanRate result: {CanRate}", canRate);
                return Ok(canRate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CanRateSchedule endpoint for ScheduleId: {ScheduleId}", scheduleId);
                return StatusCode(500, false);
            }
        }

        private int GetCurrentClientId()
        {
            try
            {
                _logger.LogInformation("🔍 Getting current client ID from claims...");

                // Log all claims for debugging
                _logger.LogInformation("Available claims:");
                foreach (var claim in User.Claims)
                {
                    _logger.LogInformation("Claim Type: {ClaimType}, Value: {ClaimValue}", claim.Type, claim.Value);
                }

                var nameIdentifierClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (nameIdentifierClaim != null)
                {
                    _logger.LogInformation("Found NameIdentifier claim: {ClaimValue}", nameIdentifierClaim.Value);

                    if (int.TryParse(nameIdentifierClaim.Value, out int clientId))
                    {
                        _logger.LogInformation("✅ Successfully parsed client ID: {ClientId}", clientId);
                        return clientId;
                    }
                    else
                    {
                        _logger.LogWarning("❌ Could not parse NameIdentifier claim value: {ClaimValue}", nameIdentifierClaim.Value);
                    }
                }
                else
                {
                    _logger.LogWarning("❌ NameIdentifier claim not found");
                }

                // Fallback: Try other common claim types
                var fallbackClaims = new[]
                {
            "userId", "sub", "id", "clientId", "name", "unique_name"
        };

                foreach (var claimType in fallbackClaims)
                {
                    var claim = User.FindFirst(claimType);
                    if (claim != null && int.TryParse(claim.Value, out int clientId))
                    {
                        _logger.LogInformation("✅ Found client ID from fallback claim {ClaimType}: {ClientId}", claimType, clientId);
                        return clientId;
                    }
                }

                _logger.LogError("❌ No valid client ID claim found. Using fallback client ID 3 for testing.");
                return 3; // Temporary fallback for testing
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "💥 Error getting current client ID");
                return 3; // Temporary fallback for testing
            }
        }
    }
}