using Realstate_servcices.Server.Dto.Chat;
using Realstate_servcices.Server.Entity.Chat;
using Realstate_servcices.Server.Repository.Conversation;
using Realstate_servcices.Server.Repository.UserDAO;
using System.Text.Json;
using Microsoft.Extensions.Logging;

namespace Realstate_servcices.Server.Services.Conversation
{
    public class NotificationService : INotificationService
    {
        private readonly INotificationRepository _notificationRepository;
        private readonly INotificationPreferenceRepository _preferenceRepository;
        private readonly IBaseMemberRepository _memberRepository;
        private readonly ILogger<NotificationService> _logger;

        public NotificationService(
            INotificationRepository notificationRepository,
            INotificationPreferenceRepository preferenceRepository,
            IBaseMemberRepository memberRepository,
            ILogger<NotificationService> logger)
        {
            _notificationRepository = notificationRepository;
            _preferenceRepository = preferenceRepository;
            _memberRepository = memberRepository;
            _logger = logger;
        }

        public async Task<List<NotificationDto>> GetUserNotificationsAsync(int userId, bool unreadOnly = false)
        {
            var notifications = await _notificationRepository.GetUserNotificationsAsync(userId, unreadOnly);
            return notifications.Select(CreateNotificationDto).ToList();
        }

        public async Task<NotificationDto> CreateNotificationAsync(CreateNotificationDto createDto)
        {
            var notification = new Notification
            {
                BaseMemberId = createDto.BaseMemberId,
                NotificationType = createDto.NotificationType,
                Title = createDto.Title,
                Content = createDto.Content,
                Data = createDto.Data,
                ChatId = createDto.ChatId,
                MessageId = createDto.MessageId,
                PropertyId = createDto.PropertyId,
                Priority = createDto.Priority,
                CreatedAt = DateTime.UtcNow
            };

            var createdNotification = await _notificationRepository.CreateAsync(notification);
            await SendExternalNotificationsAsync(createdNotification);

            return CreateNotificationDto(createdNotification);
        }

        public async Task MarkNotificationAsReadAsync(int notificationId, int userId)
        {
            var notification = await _notificationRepository.GetByIdAsync(notificationId);
            if (notification == null || notification.BaseMemberId != userId)
                throw new UnauthorizedAccessException("Notification not found or access denied");

            await _notificationRepository.MarkAsReadAsync(notificationId);
        }

        public async Task MarkAllNotificationsAsReadAsync(int userId)
        {
            await _notificationRepository.MarkAllAsReadAsync(userId);
        }

        public async Task NotifyNewMessageAsync(int chatId, int messageId, int senderId, List<int> recipientIds)
        {
            foreach (var recipientId in recipientIds.Where(id => id != senderId))
            {
                try
                {
                    var preferences = await _preferenceRepository.GetByUserIdAsync(recipientId);
                    if (!preferences.NewMessageNotifications)
                        continue;

                    var sender = await _memberRepository.GetByIdAsync(senderId);
                    var messagePreview = await GetMessagePreviewAsync(messageId);

                    var notificationDto = new CreateNotificationDto
                    {
                        BaseMemberId = recipientId,
                        NotificationType = "message",
                        Title = "New Message",
                        Content = $"{sender?.Email ?? "User"}: {messagePreview}",
                        ChatId = chatId,
                        MessageId = messageId,
                        Priority = "normal"
                    };

                    await CreateNotificationAsync(notificationDto);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error creating message notification for user {UserId}", recipientId);
                }
            }
        }

        public async Task NotifyPropertyUpdateAsync(int propertyId, string propertyTitle, List<int> recipientIds, string updateType)
        {
            foreach (var recipientId in recipientIds)
            {
                try
                {
                    var preferences = await _preferenceRepository.GetByUserIdAsync(recipientId);
                    if (!preferences.PropertyUpdateNotifications)
                        continue;

                    var notificationDto = new CreateNotificationDto
                    {
                        BaseMemberId = recipientId,
                        NotificationType = "property",
                        Title = $"Property {updateType}",
                        Content = $"{propertyTitle} has been {updateType}",
                        PropertyId = propertyId,
                        Priority = "normal"
                    };

                    await CreateNotificationAsync(notificationDto);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error creating property notification for user {UserId}", recipientId);
                }
            }
        }

        public async Task NotifyAppointmentAsync(int appointmentId, string appointmentTitle, int recipientId, string appointmentType)
        {
            try
            {
                var preferences = await _preferenceRepository.GetByUserIdAsync(recipientId);
                if (!preferences.AppointmentNotifications)
                    return;

                var notificationDto = new CreateNotificationDto
                {
                    BaseMemberId = recipientId,
                    NotificationType = "appointment",
                    Title = $"Appointment {appointmentType}",
                    Content = appointmentTitle,
                    Data = $"{{\"appointmentId\": {appointmentId}}}",
                    Priority = "high"
                };

                await CreateNotificationAsync(notificationDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating appointment notification for user {UserId}", recipientId);
            }
        }

        private async Task SendExternalNotificationsAsync(Notification notification)
        {
            try
            {
                var preferences = await _preferenceRepository.GetByUserIdAsync(notification.BaseMemberId);
                var member = await _memberRepository.GetByIdAsync(notification.BaseMemberId);

                if (member == null)
                    return;

                // Push notifications have been removed - only internal notifications remain
                // You can add other notification types here in the future (email, SMS, etc.)

                await MarkNotificationAsPushedAsync(notification.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending external notifications for notification {NotificationId}", notification.Id);
            }
        }

        private async Task MarkNotificationAsPushedAsync(int notificationId)
        {
            try
            {
                var notification = await _notificationRepository.GetByIdAsync(notificationId);
                if (notification != null)
                {
                    notification.IsPushed = true;
                    notification.PushedAt = DateTime.UtcNow;
                    await _notificationRepository.UpdateAsync(notification);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking notification {NotificationId} as pushed", notificationId);
            }
        }

        private List<string> ParseDeviceTokens(string? deviceTokensJson)
        {
            if (string.IsNullOrEmpty(deviceTokensJson))
                return new List<string>();

            try
            {
                return JsonSerializer.Deserialize<List<string>>(deviceTokensJson) ?? new List<string>();
            }
            catch
            {
                return new List<string>();
            }
        }

        private async Task<string> GetMessagePreviewAsync(int messageId)
        {
            return "New message";
        }

        private NotificationDto CreateNotificationDto(Notification notification)
        {
            return new NotificationDto
            {
                Id = notification.Id,
                NotificationNo = notification.NotificationNo,
                BaseMemberId = notification.BaseMemberId,
                NotificationType = notification.NotificationType,
                Title = notification.Title,
                Content = notification.Content,
                Data = notification.Data,
                ChatId = notification.ChatId,
                MessageId = notification.MessageId,
                PropertyId = notification.PropertyId,
                IsRead = notification.IsRead,
                IsPushed = notification.IsPushed,
                CreatedAt = notification.CreatedAt,
                ReadAt = notification.ReadAt,
                PushedAt = notification.PushedAt,
                Priority = notification.Priority
            };
        }
    }
}