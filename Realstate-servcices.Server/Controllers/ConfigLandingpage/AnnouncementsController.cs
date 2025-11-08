using Microsoft.AspNetCore.Mvc;
using Realstate_servcices.Server.Dto.ConfigLandingpage;
using Realstate_servcices.Server.Services.ConfigLandingpage;

namespace Realstate_servcices.Server.Controllers.ConfigLandingpage
{
    [ApiController]
    [Route("api/[controller]")]
    public class AnnouncementsController : ControllerBase
    {
        private readonly IAnnouncementService _announcementService;

        public AnnouncementsController(IAnnouncementService announcementService)
        {
            _announcementService = announcementService;
        }

        /// <summary>
        /// Get all active announcements for running letter display
        /// </summary>
        [HttpGet("active")]
        [ProducesResponseType(typeof(IEnumerable<AnnouncementDto>), 200)]
        public async Task<ActionResult<IEnumerable<AnnouncementDto>>> GetActiveAnnouncements()
        {
            try
            {
                var announcements = await _announcementService.GetActiveAnnouncementsAsync();
                return Ok(announcements);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Get all announcements (including inactive) for admin management
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<AnnouncementDto>), 200)]
        public async Task<ActionResult<IEnumerable<AnnouncementDto>>> GetAllAnnouncements()
        {
            try
            {
                var announcements = await _announcementService.GetAllAnnouncementsAsync();
                return Ok(announcements);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Get specific announcement by ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(AnnouncementDto), 200)]
        [ProducesResponseType(404)]
        public async Task<ActionResult<AnnouncementDto>> GetAnnouncementById(int id)
        {
            try
            {
                var announcement = await _announcementService.GetAnnouncementByIdAsync(id);
                if (announcement == null)
                {
                    return NotFound($"Announcement with ID {id} not found");
                }
                return Ok(announcement);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Create a new announcement
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(AnnouncementDto), 201)]
        [ProducesResponseType(400)]
        public async Task<ActionResult<AnnouncementDto>> CreateAnnouncement([FromBody] CreateAnnouncementDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var announcement = await _announcementService.CreateAnnouncementAsync(createDto);
                return CreatedAtAction(nameof(GetAnnouncementById), new { id = announcement.Id }, announcement);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Update an existing announcement
        /// </summary>
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(AnnouncementDto), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        public async Task<ActionResult<AnnouncementDto>> UpdateAnnouncement(int id, [FromBody] UpdateAnnouncementDto updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var updatedAnnouncement = await _announcementService.UpdateAnnouncementAsync(id, updateDto);
                if (updatedAnnouncement == null)
                {
                    return NotFound($"Announcement with ID {id} not found");
                }

                return Ok(updatedAnnouncement);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Delete an announcement
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> DeleteAnnouncement(int id)
        {
            try
            {
                var result = await _announcementService.DeleteAnnouncementAsync(id);
                if (!result)
                {
                    return NotFound($"Announcement with ID {id} not found");
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Toggle announcement active status
        /// </summary>
        [HttpPatch("{id}/status")]
        [ProducesResponseType(200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> ToggleAnnouncementStatus(int id, [FromBody] bool isActive)
        {
            try
            {
                var result = await _announcementService.ToggleAnnouncementStatusAsync(id, isActive);
                if (!result)
                {
                    return NotFound($"Announcement with ID {id} not found");
                }

                return Ok(new { message = $"Announcement status updated to {(isActive ? "active" : "inactive")}" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Bulk update announcement display order
        /// </summary>
        [HttpPut("reorder")]
        [ProducesResponseType(200)]
        public async Task<IActionResult> ReorderAnnouncements([FromBody] List<AnnouncementOrderDto> orderUpdates)
        {
            try
            {
                // This would require additional service method implementation
                // For now, return not implemented
                return StatusCode(501, "Bulk reorder functionality not implemented yet");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }

    // Additional DTO for bulk operations
    public class AnnouncementOrderDto
    {
        public int Id { get; set; }
        public int DisplayOrder { get; set; }
    }
}
