// MessageService.cs - FIXED VERSION
using Realstate_servcices.Server.Dto.Chat;
using Realstate_servcices.Server.Entity.Chat;
using Realstate_servcices.Server.Repository.Conversation;
using Realstate_servcices.Server.Utilities.Storage;
using Microsoft.EntityFrameworkCore;

namespace Realstate_servcices.Server.Services.Conversation
{
    public class MessageService : IMessageService
    {
        private readonly IMessageRepository _messageRepository;
        private readonly IChatRepository _chatRepository;
        private readonly IChatParticipantRepository _participantRepository;
        private readonly IFileStorageService _fileStorageService;
        private readonly INotificationService _notificationService;

        public MessageService(IMessageRepository messageRepository, IChatRepository chatRepository,
            IChatParticipantRepository participantRepository, IFileStorageService fileStorageService,
            INotificationService notificationService)
        {
            _messageRepository = messageRepository;
            _chatRepository = chatRepository;
            _participantRepository = participantRepository;
            _fileStorageService = fileStorageService;
            _notificationService = notificationService;
        }

        public async Task<MessageDto> SendMessageAsync(CreateMessageDto createDto, int senderId)
        {
            if (!await _chatRepository.UserHasAccessToChatAsync(senderId, createDto.ChatId))
                throw new UnauthorizedAccessException("No access to this chat");

            // FIXED: Determine recipient ID if not provided
            int? recipientId = createDto.RecipientId;
            if (!recipientId.HasValue || recipientId == 0)
            {
                // Get other participants in the chat to determine recipient
                var chatParticipants = await _participantRepository.GetChatParticipantsAsync(createDto.ChatId);
                var otherParticipant = chatParticipants.FirstOrDefault(p => p.BaseMemberId != senderId && p.IsActive);
                recipientId = otherParticipant?.BaseMemberId;
            }

            var message = new Message
            {
                ChatId = createDto.ChatId,
                SenderId = senderId,
                RecipientId = recipientId,
                Content = createDto.Content,
                MessageType = createDto.MessageType,
                SentAt = DateTime.UtcNow
            };

            if (createDto.Files != null && createDto.Files.Any())
            {
                foreach (var fileDto in createDto.Files)
                {
                    var messageFile = new MessageFile
                    {
                        FileName = fileDto.FileName,
                        FileUrl = fileDto.FileUrl,
                        FileType = fileDto.FileType,
                        FileSize = fileDto.FileSize,
                        ThumbnailUrl = fileDto.ThumbnailUrl,
                        MimeType = fileDto.MimeType,
                        UploadedAt = DateTime.UtcNow
                    };
                    message.MessageFiles.Add(messageFile);
                }
            }

            var createdMessage = await _messageRepository.CreateAsync(message);

            // Update chat's last message
            await _chatRepository.UpdateLastMessageAsync(createDto.ChatId, createDto.Content, DateTime.UtcNow);

            // Update unread counts for other participants
            await _participantRepository.IncrementUnreadCountForOthersAsync(createDto.ChatId, senderId);

            // FIX 1: CREATE NOTIFICATION
            await CreateMessageNotificationAsync(createdMessage, senderId);

            return MapToMessageDto(createdMessage);
        }

        private async Task CreateMessageNotificationAsync(Message message, int senderId)
        {
            try
            {
                // Get other participants in the chat (excluding sender)
                var participants = await _participantRepository.GetChatParticipantsAsync(message.ChatId);
                var recipientIds = participants
                    .Where(p => p.BaseMemberId != senderId && p.IsActive)
                    .Select(p => p.BaseMemberId)
                    .ToList();

                if (recipientIds.Any())
                {
                    await _notificationService.NotifyNewMessageAsync(
                        message.ChatId,
                        message.Id,
                        senderId,
                        recipientIds
                    );
                }
            }
            catch (Exception ex)
            {
                // Log error but don't break message sending
                Console.WriteLine($"Error creating notification: {ex.Message}");
            }
        }

        // ... REST OF THE EXISTING METHODS REMAIN THE SAME ...
        public async Task<List<MessageDto>> GetChatMessagesAsync(int chatId, int userId, int page = 1, int pageSize = 50)
        {
            if (!await _chatRepository.UserHasAccessToChatAsync(userId, chatId))
                throw new UnauthorizedAccessException("No access to this chat");

            var messages = await _messageRepository.GetChatMessagesAsync(chatId, page, pageSize);
            await _participantRepository.UpdateLastReadAsync(chatId, userId);

            return messages.Select(MapToMessageDto).ToList();
        }

        public async Task<MessageDto> UpdateMessageAsync(int messageId, UpdateMessageDto updateDto, int userId)
        {
            var message = await _messageRepository.GetByIdAsync(messageId);
            if (message == null)
                throw new ArgumentException("Message not found");

            if (message.SenderId != userId)
                throw new UnauthorizedAccessException("Can only edit your own messages");

            message.Content = updateDto.Content;
            message.IsEdited = true;
            message.EditedAt = DateTime.UtcNow;

            var updatedMessage = await _messageRepository.UpdateAsync(message);
            return MapToMessageDto(updatedMessage);
        }

        public async Task<bool> DeleteMessageAsync(int messageId, int userId)
        {
            var message = await _messageRepository.GetByIdAsync(messageId);
            if (message == null)
                throw new ArgumentException("Message not found");

            if (message.SenderId != userId)
                throw new UnauthorizedAccessException("Can only delete your own messages");

            message.IsDeleted = true;
            await _messageRepository.UpdateAsync(message);
            return true;
        }

        public async Task<MessageDto> AddReactionAsync(int messageId, string emoji, int userId)
        {
            var message = await _messageRepository.GetByIdAsync(messageId);
            if (message == null)
                throw new ArgumentException("Message not found");

            var existingReaction = message.Reactions.FirstOrDefault(r => r.BaseMemberId == userId && r.Emoji == emoji);
            if (existingReaction != null)
                return MapToMessageDto(message);

            var reaction = new MessageReaction
            {
                MessageId = messageId,
                BaseMemberId = userId,
                Emoji = emoji,
                ReactedAt = DateTime.UtcNow
            };

            message.Reactions.Add(reaction);
            await _messageRepository.UpdateAsync(message);

            return MapToMessageDto(message);
        }

        public async Task<bool> RemoveReactionAsync(int messageId, int userId)
        {
            var message = await _messageRepository.GetByIdAsync(messageId);
            if (message == null)
                throw new ArgumentException("Message not found");

            var reaction = message.Reactions.FirstOrDefault(r => r.BaseMemberId == userId);
            if (reaction == null)
                return false;

            message.Reactions.Remove(reaction);
            await _messageRepository.UpdateAsync(message);
            return true;
        }

        public async Task<List<MessageDto>> GetMessagesByRecipientAsync(int recipientId, int userId, int page = 1, int pageSize = 50)
        {
            // Security check: user can only see messages where they are involved
            if (recipientId != userId)
            {
                // If user is requesting messages for someone else, check if they have permission
                var hasAccess = await _participantRepository.GetParticipantByRecipientAsync(0, recipientId) != null;
                if (!hasAccess)
                {
                    throw new UnauthorizedAccessException("No access to view these messages");
                }
            }

            var messages = await _messageRepository.GetMessagesByRecipientAsync(recipientId, page, pageSize);

            // Additional security: filter messages to ensure user has access to the chat
            var accessibleMessages = new List<Message>();
            foreach (var message in messages)
            {
                if (await _chatRepository.UserHasAccessToChatAsync(userId, message.ChatId))
                {
                    accessibleMessages.Add(message);
                }
            }

            return accessibleMessages.Select(MapToMessageDto).ToList();
        }

        private MessageDto MapToMessageDto(Message message)
        {
            string? senderFirstName = null;
            string? senderLastName = null;
            string? senderFullName = null;
            string? senderProfileImage = null;
            string? senderMemberType = null;

            string? recipientFirstName = null;
            string? recipientLastName = null;
            string? recipientFullName = null;
            string? recipientProfileImage = null;
            string? recipientMemberType = null;

            // Get sender details from Client if available
            if (message.Sender?.Client != null)
            {
                senderFirstName = message.Sender.Client.FirstName;
                senderLastName = message.Sender.Client.LastName;
                senderFullName = $"{message.Sender.Client.FirstName} {message.Sender.Client.LastName}";
                senderProfileImage = message.Sender.ProfilePictureUrl;
                senderMemberType = "Client";
            }
            // Get sender details from Agent if available
            else if (message.Sender?.Agent != null)
            {
                senderFirstName = message.Sender.Agent.FirstName;
                senderLastName = message.Sender.Agent.LastName;
                senderFullName = $"{message.Sender.Agent.FirstName} {message.Sender.Agent.LastName}";
                senderProfileImage = message.Sender.ProfilePictureUrl;
                senderMemberType = "Agent";
            }
            // Fallback to BaseMember properties
            else if (message.Sender != null)
            {
                senderFirstName = message.Sender.Username;
                senderLastName = string.Empty;
                senderFullName = message.Sender.Username;
                senderProfileImage = message.Sender.ProfilePictureUrl;
                senderMemberType = message.Sender.Role ?? "User";
            }

            // Get recipient details
            if (message.Recipient?.Client != null)
            {
                recipientFirstName = message.Recipient.Client.FirstName;
                recipientLastName = message.Recipient.Client.LastName;
                recipientFullName = $"{message.Recipient.Client.FirstName} {message.Recipient.Client.LastName}";
                recipientProfileImage = message.Recipient.ProfilePictureUrl;
                recipientMemberType = "Client";
            }
            else if (message.Recipient?.Agent != null)
            {
                recipientFirstName = message.Recipient.Agent.FirstName;
                recipientLastName = message.Recipient.Agent.LastName;
                recipientFullName = $"{message.Recipient.Agent.FirstName} {message.Recipient.Agent.LastName}";
                recipientProfileImage = message.Recipient.ProfilePictureUrl;
                recipientMemberType = "Agent";
            }
            else if (message.Recipient != null)
            {
                recipientFirstName = message.Recipient.Username;
                recipientLastName = string.Empty;
                recipientFullName = message.Recipient.Username;
                recipientProfileImage = message.Recipient.ProfilePictureUrl;
                recipientMemberType = message.Recipient.Role ?? "User";
            }

            return new MessageDto
            {
                Id = message.Id,
                MessageNo = message.MessageNo,
                ChatId = message.ChatId,
                SenderId = message.SenderId,
                RecipientId = message.RecipientId,
                Content = message.Content,
                MessageType = message.MessageType,
                IsEdited = message.IsEdited,
                IsDeleted = message.IsDeleted,
                SentAt = message.SentAt,
                ReadAt = message.ReadAt,
                EditedAt = message.EditedAt,
                Sender = message.Sender != null ? new BaseMemberDto
                {
                    Id = message.Sender.Id,
                    FirstName = senderFirstName,
                    LastName = senderLastName,
                    FullName = senderFullName,
                    ProfileImage = senderProfileImage,
                    MemberType = senderMemberType,
                    Email = message.Sender.Email,
                    Username = message.Sender.Username
                } : null,
                Recipient = message.Recipient != null ? new BaseMemberDto
                {
                    Id = message.Recipient.Id,
                    FirstName = recipientFirstName,
                    LastName = recipientLastName,
                    FullName = recipientFullName,
                    ProfileImage = recipientProfileImage,
                    MemberType = recipientMemberType,
                    Email = message.Recipient.Email,
                    Username = message.Recipient.Username
                } : null,
                Files = message.MessageFiles.Select(f => new MessageFileDto
                {
                    Id = f.Id,
                    MessageId = f.MessageId,
                    FileName = f.FileName,
                    FileUrl = f.FileUrl,
                    FileType = f.FileType,
                    FileSize = f.FileSize,
                    ThumbnailUrl = f.ThumbnailUrl,
                    MimeType = f.MimeType,
                    UploadedAt = f.UploadedAt
                }).ToList(),
                Reactions = message.Reactions.Select(r => new MessageReactionDto
                {
                    Id = r.Id,
                    MessageId = r.MessageId,
                    BaseMemberId = r.BaseMemberId,
                    Emoji = r.Emoji,
                    ReactedAt = r.ReactedAt,
                    Member = r.BaseMember != null ? new BaseMemberDto
                    {
                        Id = r.BaseMember.Id,
                        FirstName = r.BaseMember.Client?.FirstName ?? r.BaseMember.Agent?.FirstName ?? r.BaseMember.Username,
                        LastName = r.BaseMember.Client?.LastName ?? r.BaseMember.Agent?.LastName ?? string.Empty,
                        FullName = r.BaseMember.Client != null ?
                            $"{r.BaseMember.Client.FirstName} {r.BaseMember.Client.LastName}" :
                            r.BaseMember.Agent != null ?
                            $"{r.BaseMember.Agent.FirstName} {r.BaseMember.Agent.LastName}" :
                            r.BaseMember.Username,
                        ProfileImage = r.BaseMember.ProfilePictureUrl,
                        MemberType = r.BaseMember.Role ?? "User"
                    } : null
                }).ToList()
            };
        }
    }
}