using Microsoft.AspNetCore.Mvc;
using Realstate_servcices.Server.Dto.Rating;
using Realstate_servcices.Server.Services.Ratings;

namespace Realstate_servcices.Server.Controllers.Ratings
{
    [ApiController]
    [Route("api/[controller]")]
    public class RatingController : ControllerBase
    {
        private readonly IRatingService _ratingService;

        public RatingController(IRatingService ratingService)
        {
            _ratingService = ratingService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<RatingDto>>> GetAllRatings()
        {
            var ratings = await _ratingService.GetAllRatingsAsync();
            return Ok(ratings);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<RatingDto>> GetRatingById(int id)
        {
            var rating = await _ratingService.GetRatingByIdAsync(id);
            if (rating == null)
            {
                return NotFound();
            }
            return Ok(rating);
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<RatingDto>>> GetRatingsByUserId(int userId)
        {
            var ratings = await _ratingService.GetRatingsByUserIdAsync(userId);
            return Ok(ratings);
        }

        [HttpGet("rated/{ratedId}")]
        public async Task<ActionResult<IEnumerable<RatingDto>>> GetRatingsForUser(int ratedId)
        {
            var ratings = await _ratingService.GetRatingsForUserAsync(ratedId);
            return Ok(ratings);
        }

        [HttpPost]
        public async Task<ActionResult<RatingDto>> CreateRating(CreateRatingDto createRatingDto)
        {
            try
            {
                var rating = await _ratingService.CreateRatingAsync(createRatingDto);
                return CreatedAtAction(nameof(GetRatingById), new { id = rating.Id }, rating);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRating(int id, UpdateRatingDto updateRatingDto)
        {
            try
            {
                var rating = await _ratingService.UpdateRatingAsync(id, updateRatingDto);
                return Ok(rating);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRating(int id)
        {
            var result = await _ratingService.DeleteRatingAsync(id);
            if (!result)
            {
                return NotFound();
            }
            return NoContent();
        }

        [HttpGet("average/{ratedId}")]
        public async Task<ActionResult<double>> GetAverageRating(int ratedId)
        {
            var average = await _ratingService.GetAverageRatingAsync(ratedId);
            return Ok(average);
        }
    }
}
