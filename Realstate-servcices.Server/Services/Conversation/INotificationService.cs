using Realstate_servcices.Server.Dto.Chat;
namespace Realstate_servcices.Server.Services.Conversation
{
    public interface INotificationService
    {
        Task<List<NotificationDto>> GetUserNotificationsAsync(int userId, bool unreadOnly = false);
        Task MarkNotificationAsReadAsync(int notificationId, int userId);
        Task MarkAllNotificationsAsReadAsync(int userId);
    }

}
