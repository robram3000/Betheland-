using Realstate_servcices.Server.Entity.Chat;
namespace Realstate_servcices.Server.Repository.Conversation
{
    public interface INotificationPreferenceRepository
    {
        Task<NotificationPreference> GetByUserIdAsync(int userId);
        Task<NotificationPreference> CreateAsync(NotificationPreference preference);
        Task<NotificationPreference> UpdateAsync(NotificationPreference preference);
        Task<bool> DeleteAsync(int userId);
    }
}
