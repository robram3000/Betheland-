// NotificationService.cs - FIXED VERSION
using Realstate_servcices.Server.Dto.Chat;
using Realstate_servcices.Server.Entity.Chat;
using Realstate_servcices.Server.Repository.UserDAO;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Realstate_servcices.Server.Services.Conversation.Interfaces;
using Realstate_servcices.Server.Repository.Conversation.Interfaces;

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
            try
            {
                var notifications = await _notificationRepository.GetUserNotificationsAsync(userId, unreadOnly);
                return notifications.Select(CreateNotificationDto).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting notifications for user {UserId}", userId);
                throw;
            }
        }

        public async Task<NotificationDto> CreateNotificationAsync(CreateNotificationDto createDto)
        {
            try
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

                // Send external notifications (email, push, etc.)
                await SendExternalNotificationsAsync(createdNotification);

                return CreateNotificationDto(createdNotification);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating notification for user {UserId}", createDto.BaseMemberId);
                throw;
            }
        }

        public async Task MarkNotificationAsReadAsync(int notificationId, int userId)
        {
            try
            {
                var notification = await _notificationRepository.GetByIdAsync(notificationId);
                if (notification == null || notification.BaseMemberId != userId)
                    throw new UnauthorizedAccessException("Notification not found or access denied");

                await _notificationRepository.MarkAsReadAsync(notificationId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking notification {NotificationId} as read for user {UserId}", notificationId, userId);
                throw;
            }
        }

        public async Task MarkAllNotificationsAsReadAsync(int userId)
        {
            try
            {
                await _notificationRepository.MarkAllAsReadAsync(userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking all notifications as read for user {UserId}", userId);
                throw;
            }
        }

        public async Task<bool> DeleteNotificationAsync(int notificationId, int userId)
        {
            try
            {
                var notification = await _notificationRepository.GetByIdAsync(notificationId);
                if (notification == null || notification.BaseMemberId != userId)
                    return false;

                // In a real implementation, you might want to soft delete
                // For now, we'll just mark as read and hide it
                notification.IsRead = true;
                await _notificationRepository.UpdateAsync(notification);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting notification {NotificationId} for user {UserId}", notificationId, userId);
                return false;
            }
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
                        Content = $"{sender?.Username ?? "User"}: {messagePreview}",
                        ChatId = chatId,
                        MessageId = messageId,
                        Priority = "normal",
                        Data = JsonSerializer.Serialize(new
                        {
                            senderId = senderId,
                            senderName = sender?.Username,
                            chatId = chatId,
                            messagePreview = messagePreview
                        })
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
                        NotificationType = "property_update",
                        Title = $"Property {updateType}",
                        Content = $"{propertyTitle} has been {updateType}",
                        PropertyId = propertyId,
                        Priority = "normal",
                        Data = JsonSerializer.Serialize(new
                        {
                            propertyId = propertyId,
                            propertyTitle = propertyTitle,
                            updateType = updateType
                        })
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
                    Data = JsonSerializer.Serialize(new
                    {
                        appointmentId = appointmentId,
                        appointmentType = appointmentType,
                        title = appointmentTitle
                    }),
                    Priority = "high"
                };

                await CreateNotificationAsync(notificationDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating appointment notification for user {UserId}", recipientId);
            }
        }

        public async Task NotifySystemMessageAsync(int userId, string title, string content, string priority = "normal")
        {
            try
            {
                var preferences = await _preferenceRepository.GetByUserIdAsync(userId);
                if (!preferences.SystemNotifications)
                    return;

                var notificationDto = new CreateNotificationDto
                {
                    BaseMemberId = userId,
                    NotificationType = "system",
                    Title = title,
                    Content = content,
                    Priority = priority,
                    Data = JsonSerializer.Serialize(new
                    {
                        systemEvent = true,
                        timestamp = DateTime.UtcNow
                    })
                };

                await CreateNotificationAsync(notificationDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating system notification for user {UserId}", userId);
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

                // Email notifications
                if (preferences.EmailNotifications && !string.IsNullOrEmpty(member.Email))
                {
                    await SendEmailNotificationAsync(notification, member.Email);
                }

                // Push notifications
                if (preferences.PushNotifications)
                {
                    await SendPushNotificationAsync(notification);
                }

                // SMS notifications
                if (preferences.SMSNotifications)
                {
                    // Implement SMS notification logic here
                }

                await MarkNotificationAsPushedAsync(notification.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending external notifications for notification {NotificationId}", notification.Id);
            }
        }

        private async Task SendEmailNotificationAsync(Notification notification, string email)
        {
            try
            {
                // Implement email sending logic here
                // This could use SendGrid, SMTP, or other email services
                _logger.LogInformation("Would send email to {Email} for notification {NotificationId}", email, notification.Id);

                // Example implementation:
                // var emailService = new EmailService();
                // await emailService.SendNotificationEmail(email, notification.Title, notification.Content);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending email notification for {NotificationId}", notification.Id);
            }
        }

        private async Task SendPushNotificationAsync(Notification notification)
        {
            try
            {
                // Implement push notification logic here
                // This could use Firebase Cloud Messaging, Apple Push Notification Service, etc.
                _logger.LogInformation("Would send push notification for notification {NotificationId}", notification.Id);

                // Example implementation:
                // var pushService = new PushNotificationService();
                // await pushService.SendPushAsync(notification.BaseMemberId, notification.Title, notification.Content);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending push notification for {NotificationId}", notification.Id);
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

        private async Task<string> GetMessagePreviewAsync(int messageId)
        {
            try
            {
                // In a real implementation, you would fetch the actual message content
                // For now, return a generic preview
                return "New message received";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting message preview for message {MessageId}", messageId);
                return "New message";
            }
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