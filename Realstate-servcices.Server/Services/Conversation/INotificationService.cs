using Realstate_servcices.Server.Dto.Chat;
namespace Realstate_servcices.Server.Services.Conversation
{
    public interface INotificationService
    {
        Task<List<NotificationDto>> GetUserNotificationsAsync(int userId, bool unreadOnly = false);
        Task<NotificationDto> CreateNotificationAsync(CreateNotificationDto createDto);
        Task MarkNotificationAsReadAsync(int notificationId, int userId);
        Task MarkAllNotificationsAsReadAsync(int userId);
        Task SendPushNotificationAsync(int userId, string title, string message, string? data = null);
    }
}
