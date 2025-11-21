using Microsoft.AspNetCore.Mvc;
using Realstate_servcices.Server.Dto.Scheduling;
using Realstate_servcices.Server.Services.Scheduling;

namespace Realstate_servcices.Server.Controllers.Ratings
{
    [ApiController]
    [Route("api/[controller]")]
    public class RatingSchedulesController : ControllerBase
    {
        private readonly IRatingSchedulesServices _ratingServices;

        public RatingSchedulesController(IRatingSchedulesServices ratingServices)
        {
            _ratingServices = ratingServices;
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
                // In a real application, you'd get the client ID from the authenticated user
                var clientId = GetCurrentClientId(); // Implement this based on your auth system

                var rating = await _ratingServices.CreateRatingAsync(createDto, clientId);
                return CreatedAtAction(nameof(GetRatingById), new { id = rating.Id }, rating);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (ArgumentException ex)
            {
                return NotFound(ex.Message);
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
            var clientId = GetCurrentClientId(); // Implement this based on your auth system
            var canRate = await _ratingServices.CanRateScheduleAsync(scheduleId, clientId);
            return Ok(canRate);
        }

        private int GetCurrentClientId()
        {
            // Implement this method to get the current client ID from your authentication system
            // This is a placeholder - replace with your actual implementation
            return 1; // Example client ID
        }
    }
}
