using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Realstate_servcices.Server.Dto.Chat;
using Realstate_servcices.Server.Services.Conversation;
using System.Security.Claims;

namespace Realstate_servcices.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ChatsController : ControllerBase
    {
        private readonly IChatService _chatService;
        private readonly IMessageService _messageService;

        public ChatsController(IChatService chatService, IMessageService messageService)
        {
            _chatService = chatService;
            _messageService = messageService;
        }

        [HttpGet]
        public async Task<ActionResult<List<ChatDto>>> GetUserChats()
        {
            try
            {
                var userId = GetCurrentUserId();
                var chats = await _chatService.GetUserChatsAsync(userId);
                return Ok(new { success = true, data = chats });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("client/{clientId}")]
        public async Task<ActionResult<List<ChatDto>>> GetClientChats(int clientId)
        {
            try
            {
                var chats = await _chatService.GetByClientChatAsync(clientId);
                return Ok(new { success = true, data = chats });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("agent/{agentId}")]
        public async Task<ActionResult<List<ChatDto>>> GetAgentChats(int agentId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var chats = await _chatService.GetByAgentChatAsync(agentId);
                return Ok(new { success = true, data = chats });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ChatDto>> GetChat(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var chat = await _chatService.GetChatAsync(id, userId);

                if (chat == null)
                    return NotFound(new { success = false, message = "Chat not found" });

                return Ok(new { success = true, data = chat });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<ChatDto>> CreateChat(CreateChatDto createDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var chat = await _chatService.CreateChatAsync(createDto, userId);
                return Ok(new { success = true, data = chat });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ChatDto>> UpdateChat(int id, UpdateChatDto updateDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var chat = await _chatService.UpdateChatAsync(id, updateDto, userId);
                return Ok(new { success = true, data = chat });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteChat(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _chatService.DeleteChatAsync(id, userId);

                if (!result)
                    return NotFound(new { success = false, message = "Chat not found" });

                return Ok(new { success = true, message = "Chat deleted successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("{chatId}/participants")]
        public async Task<ActionResult<ChatParticipantDto>> AddParticipant(int chatId, AddParticipantDto addDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var participant = await _chatService.AddParticipantAsync(chatId, addDto, userId);
                return Ok(new { success = true, data = participant });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpDelete("{chatId}/participants/{participantId}")]
        public async Task<IActionResult> RemoveParticipant(int chatId, int participantId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _chatService.RemoveParticipantAsync(chatId, participantId, userId);

                if (!result)
                    return NotFound(new { success = false, message = "Participant not found" });

                return Ok(new { success = true, message = "Participant removed successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("{chatId}/messages")]
        public async Task<ActionResult<List<MessageDto>>> GetChatMessages(int chatId, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            try
            {
                var userId = GetCurrentUserId();
                var messages = await _messageService.GetChatMessagesAsync(chatId, userId, page, pageSize);
                return Ok(new { success = true, data = messages });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        // NEW ENDPOINTS FOR RECIPIENT FUNCTIONALITY

        [HttpGet("recipient/{recipientId}")]
        public async Task<ActionResult<List<ChatDto>>> GetChatsByRecipient(int recipientId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var chats = await _chatService.GetChatsByRecipientAsync(recipientId, userId);
                return Ok(new { success = true, data = chats });
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