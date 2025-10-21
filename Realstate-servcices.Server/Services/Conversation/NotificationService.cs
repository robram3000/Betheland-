//using AutoMapper;
//using Realstate_servcices.Server.Dto.Chat;
//using Realstate_servcices.Server.Entity.Chat;
//using Realstate_servcices.Server.Repository.Conversation;
//using Realstate_servcices.Server.Repository.UserDAO;
//using Realstate_servcices.Server.Services.SMTP.interfaces;
//using System.Text.Json;

//namespace Realstate_servcices.Server.Services.Conversation
//{
//    public class NotificationService : INotificationService
//    {
//        private readonly INotificationRepository _notificationRepository;
//        private readonly INotificationPreferenceRepository _preferenceRepository;
//        private readonly IBaseMemberRepository _memberRepository;
//        private readonly IEmailService _emailService;
//        private readonly IPushNotificationService _pushNotificationService;
//        private readonly IMapper _mapper;
//        private readonly ILogger<NotificationService> _logger;

//        public NotificationService(
//            INotificationRepository notificationRepository,
//            INotificationPreferenceRepository preferenceRepository,
//            IBaseMemberRepository memberRepository,
//            IEmailService emailService,
//            IPushNotificationService pushNotificationService,
//            IMapper mapper,
//            ILogger<NotificationService> logger)
//        {
//            _notificationRepository = notificationRepository;
//            _preferenceRepository = preferenceRepository;
//            _memberRepository = memberRepository;
//            _emailService = emailService;
//            _pushNotificationService = pushNotificationService;
//            _mapper = mapper;
//            _logger = logger;
//        }

//        public async Task<List<NotificationDto>> GetUserNotificationsAsync(int userId, bool unreadOnly = false)
//        {
//            var notifications = await _notificationRepository.GetUserNotificationsAsync(userId, unreadOnly);
//            return _mapper.Map<List<NotificationDto>>(notifications);
//        }

//        public async Task<NotificationDto> CreateNotificationAsync(CreateNotificationDto createDto)
//        {
//            // Create the notification entity
//            var notification = new Notification
//            {
//                BaseMemberId = createDto.BaseMemberId,
//                NotificationType = createDto.NotificationType,
//                Title = createDto.Title,
//                Content = createDto.Content,
//                Data = createDto.Data,
//                ChatId = createDto.ChatId,
//                MessageId = createDto.MessageId,
//                PropertyId = createDto.PropertyId,
//                Priority = createDto.Priority,
//                CreatedAt = DateTime.UtcNow
//            };

//            var createdNotification = await _notificationRepository.CreateAsync(notification);

//            // Send push/email notifications based on user preferences
//            await SendExternalNotificationsAsync(createdNotification);

//            return _mapper.Map<NotificationDto>(createdNotification);
//        }

//        public async Task MarkNotificationAsReadAsync(int notificationId, int userId)
//        {
//            var notification = await _notificationRepository.GetByIdAsync(notificationId);
//            if (notification == null || notification.BaseMemberId != userId)
//                throw new UnauthorizedAccessException("Notification not found or access denied");

//            await _notificationRepository.MarkAsReadAsync(notificationId);
//        }

//        public async Task MarkAllNotificationsAsReadAsync(int userId)
//        {
//            await _notificationRepository.MarkAllAsReadAsync(userId);
//        }

//        public async Task SendPushNotificationAsync(int userId, string title, string message, string? data = null)
//        {
//            try
//            {
//                var preferences = await _preferenceRepository.GetByUserIdAsync(userId);
//                if (!preferences.PushNotifications)
//                    return;

//                var member = await _memberRepository.GetByIdAsync(userId);
//                if (member == null)
//                    return;

//                // Parse device tokens
//                var deviceTokens = ParseDeviceTokens(preferences.DeviceTokens);
//                if (!deviceTokens.Any())
//                    return;

//                foreach (var token in deviceTokens)
//                {
//                    await _pushNotificationService.SendPushAsync(token, title, message, data);
//                }

//                _logger.LogInformation("Push notification sent to user {UserId}", userId);
//            }
//            catch (Exception ex)
//            {
//                _logger.LogError(ex, "Error sending push notification to user {UserId}", userId);
//            }
//        }

//        public async Task NotifyNewMessageAsync(int chatId, int messageId, int senderId, List<int> recipientIds)
//        {
//            foreach (var recipientId in recipientIds.Where(id => id != senderId))
//            {
//                try
//                {
//                    var preferences = await _preferenceRepository.GetByUserIdAsync(recipientId);
//                    if (!preferences.NewMessageNotifications)
//                        continue;

//                    var sender = await _memberRepository.GetByIdAsync(senderId);
//                    var message = await GetMessagePreviewAsync(messageId);

//                    var notificationDto = new CreateNotificationDto
//                    {
//                        BaseMemberId = recipientId,
//                        NotificationType = "message",
//                        Title = "New Message",
//                        Content = $"{sender?.FirstName ?? "User"}: {message}",
//                        ChatId = chatId,
//                        MessageId = messageId,
//                        Priority = "normal"
//                    };

//                    await CreateNotificationAsync(notificationDto);
//                }
//                catch (Exception ex)
//                {
//                    _logger.LogError(ex, "Error creating message notification for user {UserId}", recipientId);
//                }
//            }
//        }

//        public async Task NotifyPropertyUpdateAsync(int propertyId, string propertyTitle, List<int> recipientIds, string updateType)
//        {
//            foreach (var recipientId in recipientIds)
//            {
//                try
//                {
//                    var preferences = await _preferenceRepository.GetByUserIdAsync(recipientId);
//                    if (!preferences.PropertyUpdateNotifications)
//                        continue;

//                    var notificationDto = new CreateNotificationDto
//                    {
//                        BaseMemberId = recipientId,
//                        NotificationType = "property",
//                        Title = $"Property {updateType}",
//                        Content = $"{propertyTitle} has been {updateType}",
//                        PropertyId = propertyId,
//                        Priority = "normal"
//                    };

//                    await CreateNotificationAsync(notificationDto);
//                }
//                catch (Exception ex)
//                {
//                    _logger.LogError(ex, "Error creating property notification for user {UserId}", recipientId);
//                }
//            }
//        }

//        public async Task NotifyAppointmentAsync(int appointmentId, string appointmentTitle, int recipientId, string appointmentType)
//        {
//            try
//            {
//                var preferences = await _preferenceRepository.GetByUserIdAsync(recipientId);
//                if (!preferences.AppointmentNotifications)
//                    return;

//                var notificationDto = new CreateNotificationDto
//                {
//                    BaseMemberId = recipientId,
//                    NotificationType = "appointment",
//                    Title = $"Appointment {appointmentType}",
//                    Content = appointmentTitle,
//                    Data = $"{{\"appointmentId\": {appointmentId}}}",
//                    Priority = "high"
//                };

//                await CreateNotificationAsync(notificationDto);
//            }
//            catch (Exception ex)
//            {
//                _logger.LogError(ex, "Error creating appointment notification for user {UserId}", recipientId);
//            }
//        }

//        private async Task SendExternalNotificationsAsync(Notification notification)
//        {
//            try
//            {
//                var preferences = await _preferenceRepository.GetByUserIdAsync(notification.BaseMemberId);
//                var member = await _memberRepository.GetByIdAsync(notification.BaseMemberId);

//                if (member == null)
//                    return;

//                // Send email notification
//                if (preferences.EmailNotifications && !string.IsNullOrEmpty(member.Email))
//                {
//                    await SendEmailNotificationAsync(member.Email, notification);
//                }

//                // Send push notification
//                if (preferences.PushNotifications)
//                {
//                    await SendPushNotificationAsync(notification.BaseMemberId, notification.Title, notification.Content ?? "", notification.Data);
//                }

//                // Update notification as pushed
//                await MarkNotificationAsPushedAsync(notification.Id);
//            }
//            catch (Exception ex)
//            {
//                _logger.LogError(ex, "Error sending external notifications for notification {NotificationId}", notification.Id);
//            }
//        }

//        private async Task SendEmailNotificationAsync(string email, Notification notification)
//        {
//            try
//            {
//                var subject = notification.Title;
//                var body = $@"
//                    <h2>{notification.Title}</h2>
//                    <p>{notification.Content}</p>
//                    <p><small>Sent at: {notification.CreatedAt:yyyy-MM-dd HH:mm}</small></p>";

//                await _emailService.SendEmailAsync(email, subject, body);
//            }
//            catch (Exception ex)
//            {
//                _logger.LogError(ex, "Error sending email notification to {Email}", email);
//            }
//        }

//        private async Task MarkNotificationAsPushedAsync(int notificationId)
//        {
//            try
//            {
//                var notification = await _notificationRepository.GetByIdAsync(notificationId);
//                if (notification != null)
//                {
//                    notification.IsPushed = true;
//                    notification.PushedAt = DateTime.UtcNow;
//                    await _notificationRepository.UpdateAsync(notification);
//                }
//            }
//            catch (Exception ex)
//            {
//                _logger.LogError(ex, "Error marking notification {NotificationId} as pushed", notificationId);
//            }
//        }

//        private List<string> ParseDeviceTokens(string? deviceTokensJson)
//        {
//            if (string.IsNullOrEmpty(deviceTokensJson))
//                return new List<string>();

//            try
//            {
//                return JsonSerializer.Deserialize<List<string>>(deviceTokensJson) ?? new List<string>();
//            }
//            catch
//            {
//                return new List<string>();
//            }
//        }

//        private async Task<string> GetMessagePreviewAsync(int messageId)
//        {
//            // This would typically fetch the message content from repository
//            // For now, return a placeholder
//            return "New message";
//        }
//    }
//}
