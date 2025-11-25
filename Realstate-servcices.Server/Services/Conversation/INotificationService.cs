using Realstate_servcices.Server.Dto.Chat;
namespace Realstate_servcices.Server.Services.Conversation
{
    public interface INotificationService
    {
        Task<List<NotificationDto>> GetUserNotificationsAsync(int userId, bool unreadOnly = false);
        Task<NotificationDto> CreateNotificationAsync(CreateNotificationDto createDto);
        Task MarkNotificationAsReadAsync(int notificationId, int userId);
        Task MarkAllNotificationsAsReadAsync(int userId);
        Task<bool> DeleteNotificationAsync(int notificationId, int userId);
        Task NotifyNewMessageAsync(int chatId, int messageId, int senderId, List<int> recipientIds);
        Task NotifyPropertyUpdateAsync(int propertyId, string propertyTitle, List<int> recipientIds, string updateType);
        Task NotifyAppointmentAsync(int appointmentId, string appointmentTitle, int recipientId, string appointmentType);
        Task NotifySystemMessageAsync(int userId, string title, string content, string priority = "normal");
    }

}
