using Realstate_servcices.Server.Entity.Chat;
namespace Realstate_servcices.Server.Repository.Conversation
{
    public interface INotificationRepository
    {
        Task<Notification?> GetByIdAsync(int id);
        Task<Notification> UpdateAsync(Notification notification);
        Task<List<Notification>> GetUserNotificationsAsync(int userId, bool unreadOnly = false);
        Task<Notification> CreateAsync(Notification notification);
        Task MarkAsReadAsync(int notificationId);
        Task MarkAllAsReadAsync(int userId);
    }
}
