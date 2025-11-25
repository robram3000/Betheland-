using Realstate_servcices.Server.Entity.Chat;
namespace Realstate_servcices.Server.Repository.Conversation
{
    public interface INotificationRepository
    {
        Task<Notification?> GetByIdAsync(int id);
        Task<Notification> CreateAsync(Notification notification);
        Task<Notification> UpdateAsync(Notification notification);
        Task<bool> DeleteAsync(int notificationId);
        Task<List<Notification>> GetUserNotificationsAsync(int userId, bool unreadOnly = false);
        Task MarkAsReadAsync(int notificationId);
        Task MarkAllAsReadAsync(int userId);
        Task<int> GetUnreadCountAsync(int userId);
        Task<List<Notification>> GetRecentNotificationsAsync(int userId, int count = 10);
    }
}
