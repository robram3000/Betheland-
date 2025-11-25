// NotificationsController.cs - FIXED VERSION
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
            try
            {
                var userId = GetCurrentUserId();
                var notifications = await _notificationService.GetUserNotificationsAsync(userId, unreadOnly);

                return Ok(new
                {
                    success = true,
                    data = notifications,
                    count = notifications.Count,
                    unreadCount = notifications.Count(n => !n.IsRead)
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<NotificationDto>> GetNotification(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var notifications = await _notificationService.GetUserNotificationsAsync(userId, false);
                var notification = notifications.FirstOrDefault(n => n.Id == id);

                if (notification == null)
                    return NotFound(new { success = false, message = "Notification not found" });

                return Ok(new { success = true, data = notification });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                await _notificationService.MarkNotificationAsReadAsync(id, userId);

                return Ok(new
                {
                    success = true,
                    message = "Notification marked as read",
                    notificationId = id
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("read-all")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            try
            {
                var userId = GetCurrentUserId();
                await _notificationService.MarkAllNotificationsAsReadAsync(userId);

                return Ok(new
                {
                    success = true,
                    message = "All notifications marked as read",
                    userId = userId
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNotification(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _notificationService.DeleteNotificationAsync(id, userId);

                if (!result)
                    return NotFound(new { success = false, message = "Notification not found" });

                return Ok(new
                {
                    success = true,
                    message = "Notification deleted successfully",
                    notificationId = id
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("count")]
        public async Task<ActionResult> GetNotificationCount()
        {
            try
            {
                var userId = GetCurrentUserId();
                var notifications = await _notificationService.GetUserNotificationsAsync(userId, true);
                var unreadCount = notifications.Count(n => !n.IsRead);
                var totalCount = notifications.Count;

                return Ok(new
                {
                    success = true,
                    data = new
                    {
                        totalCount,
                        unreadCount
                    }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<NotificationDto>> CreateNotification(CreateNotificationDto createDto)
        {
            try
            {
                var notification = await _notificationService.CreateNotificationAsync(createDto);
                return Ok(new { success = true, data = notification });
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