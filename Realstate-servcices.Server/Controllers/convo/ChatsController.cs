using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Realstate_servcices.Server.Dto.Chat;
using Realstate_servcices.Server.Services.Conversation;
using Realstate_servcices.Server.Utilities.Storage;
using System.Security.Claims;

namespace Realstate_servcices.Server.Controllers.convo
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
            var userId = GetCurrentUserId();
            var chats = await _chatService.GetUserChatsAsync(userId);
            return Ok(chats);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ChatDto>> GetChat(int id)
        {
            var userId = GetCurrentUserId();
            var chat = await _chatService.GetChatAsync(id, userId);

            if (chat == null)
                return NotFound();

            return Ok(chat);
        }

        [HttpPost]
        public async Task<ActionResult<ChatDto>> CreateChat(CreateChatDto createDto)
        {
            var userId = GetCurrentUserId();
            var chat = await _chatService.CreateChatAsync(createDto, userId);
            return CreatedAtAction(nameof(GetChat), new { id = chat.Id }, chat);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ChatDto>> UpdateChat(int id, UpdateChatDto updateDto)
        {
            var userId = GetCurrentUserId();
            var chat = await _chatService.UpdateChatAsync(id, updateDto, userId);
            return Ok(chat);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteChat(int id)
        {
            var userId = GetCurrentUserId();
            var result = await _chatService.DeleteChatAsync(id, userId);

            if (!result)
                return NotFound();

            return NoContent();
        }

        [HttpPost("{chatId}/participants")]
        public async Task<ActionResult<ChatParticipantDto>> AddParticipant(int chatId, AddParticipantDto addDto)
        {
            var userId = GetCurrentUserId();
            var participant = await _chatService.AddParticipantAsync(chatId, addDto, userId);
            return Ok(participant);
        }

        [HttpDelete("{chatId}/participants/{participantId}")]
        public async Task<IActionResult> RemoveParticipant(int chatId, int participantId)
        {
            var userId = GetCurrentUserId();
            var result = await _chatService.RemoveParticipantAsync(chatId, participantId, userId);

            if (!result)
                return NotFound();

            return NoContent();
        }

        [HttpGet("{chatId}/messages")]
        public async Task<ActionResult<List<MessageDto>>> GetChatMessages(int chatId, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            var userId = GetCurrentUserId();
            var messages = await _messageService.GetChatMessagesAsync(chatId, userId, page, pageSize);
            return Ok(messages);
        }

        private int GetCurrentUserId()
        {
            return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        }
    }

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
            var userId = GetCurrentUserId();
            var message = await _messageService.SendMessageAsync(createDto, userId);
            return Ok(message);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<MessageDto>> UpdateMessage(int id, UpdateMessageDto updateDto)
        {
            var userId = GetCurrentUserId();
            var message = await _messageService.UpdateMessageAsync(id, updateDto, userId);
            return Ok(message);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMessage(int id)
        {
            var userId = GetCurrentUserId();
            var result = await _messageService.DeleteMessageAsync(id, userId);

            if (!result)
                return NotFound();

            return NoContent();
        }

        [HttpPost("{id}/reactions")]
        public async Task<ActionResult<MessageDto>> AddReaction(int id, [FromBody] string emoji)
        {
            var userId = GetCurrentUserId();
            var message = await _messageService.AddReactionAsync(id, emoji, userId);
            return Ok(message);
        }

        [HttpDelete("{id}/reactions")]
        public async Task<IActionResult> RemoveReaction(int id)
        {
            var userId = GetCurrentUserId();
            var result = await _messageService.RemoveReactionAsync(id, userId);

            if (!result)
                return NotFound();

            return NoContent();
        }

        [HttpPost("upload")]
        public async Task<ActionResult<string>> UploadFile([FromForm] UploadFileDto uploadDto)
        {
            var fileUrl = await _fileStorageService.UploadFileAsync(uploadDto.File, uploadDto.FileType);
            return Ok(new { fileUrl });
        }

        private int GetCurrentUserId()
        {
            return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        }
    }
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationService _notificationService;

        public NotificationsController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        [HttpGet]
        public async Task<ActionResult<List<NotificationDto>>> GetNotifications([FromQuery] bool unreadOnly = false)
        {
            var userId = GetCurrentUserId();
            var notifications = await _notificationService.GetUserNotificationsAsync(userId, unreadOnly);
            return Ok(notifications);
        }

        [HttpPost("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var userId = GetCurrentUserId();
            await _notificationService.MarkNotificationAsReadAsync(id, userId);
            return NoContent();
        }

        [HttpPost("read-all")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var userId = GetCurrentUserId();
            await _notificationService.MarkAllNotificationsAsReadAsync(userId);
            return NoContent();
        }

        private int GetCurrentUserId()
        {
            return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        }
    }
}
