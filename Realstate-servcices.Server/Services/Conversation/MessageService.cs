using Realstate_servcices.Server.Dto.Chat;
using Realstate_servcices.Server.Entity.Chat;
using Realstate_servcices.Server.Repository.Conversation;
using Realstate_servcices.Server.Utilities.Storage;

namespace Realstate_servcices.Server.Services.Conversation
{
    public class MessageService : IMessageService
    {
        private readonly IMessageRepository _messageRepository;
        private readonly IChatRepository _chatRepository;
        private readonly IChatParticipantRepository _participantRepository;
        private readonly IFileStorageService _fileStorageService;

        public MessageService(IMessageRepository messageRepository, IChatRepository chatRepository,
            IChatParticipantRepository participantRepository, IFileStorageService fileStorageService)
        {
            _messageRepository = messageRepository;
            _chatRepository = chatRepository;
            _participantRepository = participantRepository;
            _fileStorageService = fileStorageService;
        }

        public async Task<MessageDto> SendMessageAsync(CreateMessageDto createDto, int senderId)
        {
            if (!await _chatRepository.UserHasAccessToChatAsync(senderId, createDto.ChatId))
                throw new UnauthorizedAccessException("No access to this chat");

            var message = new Message
            {
                ChatId = createDto.ChatId,
                SenderId = senderId,
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

            return MapToMessageDto(createdMessage);
        }

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

        private MessageDto MapToMessageDto(Message message)
        {
            return new MessageDto
            {
                Id = message.Id,
                MessageNo = message.MessageNo,
                ChatId = message.ChatId,
                SenderId = message.SenderId,
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
                 
                    } : null
                }).ToList()
            };
        }
    }
}