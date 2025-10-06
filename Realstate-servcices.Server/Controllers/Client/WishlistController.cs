using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Realstate_servcices.Server.Data;
using Realstate_servcices.Server.Dto.Wishlist;
using Realstate_servcices.Server.Services.Wishlist;
using System.Security.Claims;

namespace Realstate_servcices.Server.Controllers.Client
{
    [ApiController]
    [Route("api/[controller]")]
    public class WishlistController : ControllerBase
    {
        private readonly IWishlistService _wishlistService;
        private readonly ApplicationDbContext _context;
        public WishlistController(IWishlistService wishlistService , ApplicationDbContext context)
        {
            _wishlistService = wishlistService;
            _context = context;
        }

        [HttpGet("client/{clientId}")]
        public async Task<ActionResult<IEnumerable<WishlistDetailDto>>> GetClientWishlist(int clientId)
        {
            try
            {
                var wishlist = await _wishlistService.GetClientWishlistAsync(clientId);
                return Ok(wishlist);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<WishlistDto>> GetWishlistItem(int id)
        {
            try
            {
                var wishlistItem = await _wishlistService.GetWishlistItemAsync(id);
                if (wishlistItem == null)
                    return NotFound();

                return Ok(wishlistItem);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<WishlistDto>> AddToWishlist(CreateWishlistDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var wishlistItem = await _wishlistService.AddToWishlistAsync(createDto);
                return CreatedAtAction(nameof(GetWishlistItem), new { id = wishlistItem.Id }, wishlistItem);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<WishlistDto>> UpdateWishlistItem(int id, UpdateWishlistDto updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var updatedItem = await _wishlistService.UpdateWishlistItemAsync(id, updateDto);
                if (updatedItem == null)
                    return NotFound();

                return Ok(updatedItem);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        [HttpDelete("{id}")]
        public async Task<ActionResult> RemoveFromWishlist(int id)
        {
            try
            {
                var result = await _wishlistService.RemoveFromWishlistAsync(id);
                if (!result)
                    return NotFound();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("client/{clientId}/property/{propertyId}")]
        public async Task<ActionResult> RemoveFromWishlistByProperty(int clientId, int propertyId)
        {
            try
            {
                // Find the wishlist item by clientId and propertyId
                var wishlistItem = await _context.Wishlists
                    .FirstOrDefaultAsync(w => w.ClientId == clientId && w.PropertyId == propertyId);

                if (wishlistItem == null)
                    return NotFound();

                var result = await _wishlistService.RemoveFromWishlistAsync(wishlistItem.Id);
                if (!result)
                    return NotFound();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("client/{clientId}/property/{propertyId}/exists")]
        public async Task<ActionResult<bool>> CheckPropertyInWishlist(int clientId, int propertyId)
        {
            try
            {
                var exists = await _wishlistService.IsPropertyInWishlistAsync(clientId, propertyId);
                return Ok(exists);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("client/{clientId}/count")]
        public async Task<ActionResult<int>> GetWishlistCount(int clientId)
        {
            try
            {
                var count = await _wishlistService.GetWishlistCountAsync(clientId);
                return Ok(count);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("my-client-id")]
        public async Task<ActionResult<int>> GetMyClientId()
        {
            try
            {
                // Get user ID from claims (adjust based on your auth setup)
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                    return Unauthorized();

                if (!int.TryParse(userIdClaim, out int userId))
                    return BadRequest("Invalid user ID");

                // Find client associated with this user
                var client = await _context.Clients
                    .FirstOrDefaultAsync(c => c.BaseMemberId == userId);

                if (client == null)
                    return NotFound("Client profile not found");

                return Ok(client.Id);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

    }
}
