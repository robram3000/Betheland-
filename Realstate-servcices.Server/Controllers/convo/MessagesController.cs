using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Realstate_servcices.Server.Dto.Chat;
using Realstate_servcices.Server.Services.Conversation;
using Realstate_servcices.Server.Utilities.Storage;
using System.Security.Claims;

namespace Realstate_servcices.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MessagesController : ControllerBase
    {
        private readonly IMessageService _messageService;
        private readonly IFileStorageService _fileStorageService;

        public MessagesController(IMessageService messageService, IFileStorageService fileStorageService)
        {
            _messageService = messageService;
            _fileStorageService = fileStorageService;
        }

        [HttpPost]
        public async Task<ActionResult<MessageDto>> SendMessage(CreateMessageDto createDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var message = await _messageService.SendMessageAsync(createDto, userId);
                return Ok(new { success = true, data = message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<MessageDto>> UpdateMessage(int id, UpdateMessageDto updateDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var message = await _messageService.UpdateMessageAsync(id, updateDto, userId);
                return Ok(new { success = true, data = message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMessage(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _messageService.DeleteMessageAsync(id, userId);

                if (!result)
                    return NotFound(new { success = false, message = "Message not found" });

                return Ok(new { success = true, message = "Message deleted successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("{id}/reactions")]
        public async Task<ActionResult<MessageDto>> AddReaction(int id, [FromBody] string emoji)
        {
            try
            {
                var userId = GetCurrentUserId();
                var message = await _messageService.AddReactionAsync(id, emoji, userId);
                return Ok(new { success = true, data = message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpDelete("{id}/reactions")]
        public async Task<IActionResult> RemoveReaction(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _messageService.RemoveReactionAsync(id, userId);

                if (!result)
                    return NotFound(new { success = false, message = "Reaction not found" });

                return Ok(new { success = true, message = "Reaction removed successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("upload")]
        public async Task<ActionResult<string>> UploadFile([FromForm] UploadFileDto uploadDto)
        {
            try
            {
                var fileUrl = await _fileStorageService.UploadFileAsync(uploadDto.File, uploadDto.FileType);
                return Ok(new { success = true, fileUrl });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        // NEW ENDPOINTS FOR RECIPIENT FUNCTIONALITY

        [HttpGet("recipient/{recipientId}")]
        public async Task<ActionResult<List<MessageDto>>> GetMessagesByRecipient(int recipientId, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            try
            {
                var userId = GetCurrentUserId();
                var messages = await _messageService.GetMessagesByRecipientAsync(recipientId, userId, page, pageSize);
                return Ok(new { success = true, data = messages });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("my-messages")]
        public async Task<ActionResult<List<MessageDto>>> GetMyMessages([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            try
            {
                var userId = GetCurrentUserId();
                // Get messages where current user is the recipient
                var messages = await _messageService.GetMessagesByRecipientAsync(userId, userId, page, pageSize);
                return Ok(new { success = true, data = messages });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("sent-to-me")]
        public async Task<ActionResult<List<MessageDto>>> GetMessagesSentToMe([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            try
            {
                var userId = GetCurrentUserId();
                // Get messages where current user is the recipient
                var messages = await _messageService.GetMessagesByRecipientAsync(userId, userId, page, pageSize);
                return Ok(new { success = true, data = messages });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        private int GetCurrentUserId()
        {
            return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        }
    }
}