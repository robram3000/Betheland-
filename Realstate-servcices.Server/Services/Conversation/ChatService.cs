using Realstate_servcices.Server.Dto.Chat;
using Realstate_servcices.Server.Entity.Chat;
using Realstate_servcices.Server.Repository.Conversation;

namespace Realstate_servcices.Server.Services.Conversation
{
    public class ChatService : IChatService
    {
        private readonly IChatRepository _chatRepository;
        private readonly IChatParticipantRepository _participantRepository;

        public ChatService(IChatRepository chatRepository, IChatParticipantRepository participantRepository)
        {
            _chatRepository = chatRepository;
            _participantRepository = participantRepository;
        }

        public async Task<ChatDto> CreateChatAsync(CreateChatDto createDto, int creatorId)
        {
            var chat = new Chat
            {
                Name = createDto.Name,
                ChatType = createDto.ChatType,
                PropertyId = createDto.PropertyId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            var createdChat = await _chatRepository.CreateAsync(chat);

            // Add creator as admin
            var creatorParticipant = new ChatParticipant
            {
                ChatId = createdChat.Id,
                BaseMemberId = creatorId,
                Role = "admin",
                ParticipantType = "user",
                JoinedAt = DateTime.UtcNow,
                IsActive = true
            };
            await _participantRepository.AddParticipantAsync(creatorParticipant);

            // Add other participants
            foreach (var participantId in createDto.ParticipantIds.Where(id => id != creatorId))
            {
                var participant = new ChatParticipant
                {
                    ChatId = createdChat.Id,
                    BaseMemberId = participantId,
                    Role = "member",
                    ParticipantType = "user",
                    JoinedAt = DateTime.UtcNow,
                    IsActive = true
                };
                await _participantRepository.AddParticipantAsync(participant);
            }

            // Reload chat with participants
            var fullChat = await _chatRepository.GetByIdAsync(createdChat.Id);
            return MapToChatDto(fullChat);
        }

        public async Task<List<ChatDto>> GetUserChatsAsync(int userId)
        {
            var chats = await _chatRepository.GetUserChatsAsync(userId);
            return chats.Select(MapToChatDto).ToList();
        }

        public async Task<ChatDto?> GetChatAsync(int chatId, int userId)
        {
            if (!await _chatRepository.UserHasAccessToChatAsync(userId, chatId))
                return null;

            var chat = await _chatRepository.GetByIdAsync(chatId);
            return chat != null ? MapToChatDto(chat) : null;
        }

        public async Task<ChatDto> UpdateChatAsync(int chatId, UpdateChatDto updateDto, int userId)
        {
            var chat = await _chatRepository.GetByIdAsync(chatId);
            if (chat == null)
                throw new ArgumentException("Chat not found");

            if (!await HasAdminAccess(chatId, userId))
                throw new UnauthorizedAccessException("Only admins can update chat");

            chat.Name = updateDto.Name ?? chat.Name;
            chat.PropertyId = updateDto.PropertyId ?? chat.PropertyId;
            chat.UpdatedAt = DateTime.UtcNow;

            var updatedChat = await _chatRepository.UpdateAsync(chat);
            return MapToChatDto(updatedChat);
        }

        public async Task<bool> DeleteChatAsync(int chatId, int userId)
        {
            if (!await HasAdminAccess(chatId, userId))
                throw new UnauthorizedAccessException("Only admins can delete chat");

            return await _chatRepository.DeleteAsync(chatId);
        }

        public async Task<ChatParticipantDto> AddParticipantAsync(int chatId, AddParticipantDto addDto, int requesterId)
        {
            if (!await HasAdminAccess(chatId, requesterId))
                throw new UnauthorizedAccessException("Only admins can add participants");

            var existingParticipant = await _participantRepository.GetParticipantAsync(chatId, addDto.BaseMemberId);
            if (existingParticipant != null)
            {
                if (existingParticipant.IsActive)
                    throw new InvalidOperationException("User is already a participant");

                existingParticipant.IsActive = true;
                existingParticipant.Role = addDto.Role;
                await _participantRepository.UpdateParticipantAsync(existingParticipant);
                return MapToChatParticipantDto(existingParticipant);
            }

            var participant = new ChatParticipant
            {
                ChatId = chatId,
                BaseMemberId = addDto.BaseMemberId,
                Role = addDto.Role,
                ParticipantType = addDto.ParticipantType,
                JoinedAt = DateTime.UtcNow,
                IsActive = true
            };

            var createdParticipant = await _participantRepository.AddParticipantAsync(participant);
            return MapToChatParticipantDto(createdParticipant);
        }

        public async Task<bool> RemoveParticipantAsync(int chatId, int participantId, int requesterId)
        {
            if (!await HasAdminAccess(chatId, requesterId) && requesterId != participantId)
                throw new UnauthorizedAccessException("No permission to remove participant");

            return await _participantRepository.RemoveParticipantAsync(chatId, participantId);
        }

        private async Task<bool> HasAdminAccess(int chatId, int userId)
        {
            var participant = await _participantRepository.GetParticipantAsync(chatId, userId);
            return participant?.Role == "admin";
        }

        private ChatDto MapToChatDto(Chat chat)
        {
            return new ChatDto
            {
                Id = chat.Id,
                ChatNo = chat.ChatNo,
                Name = chat.Name,
                ChatType = chat.ChatType,
                PropertyId = chat.PropertyId,
                LastMessage = chat.LastMessage,
                LastMessageAt = chat.LastMessageAt,
                CreatedAt = chat.CreatedAt,
                UpdatedAt = chat.UpdatedAt,
                Participants = chat.Participants?
                    .Where(p => p.IsActive)
                    .Select(MapToChatParticipantDto)
                    .ToList() ?? new List<ChatParticipantDto>(),
                Messages = chat.Messages?
                    .Where(m => !m.IsDeleted)
                    .OrderByDescending(m => m.SentAt)
                    .Take(50)
                    .Select(MapToMessageDto)
                    .ToList() ?? new List<MessageDto>()
            };
        }

        private ChatParticipantDto MapToChatParticipantDto(ChatParticipant participant)
        {
            return new ChatParticipantDto
            {
                Id = participant.Id,
                ChatId = participant.ChatId,
                BaseMemberId = participant.BaseMemberId,
                Role = participant.Role,
                ParticipantType = participant.ParticipantType,
                UnreadCount = participant.UnreadCount,
                LastReadAt = participant.LastReadAt,
                JoinedAt = participant.JoinedAt,
                IsActive = participant.IsActive,
                Member = participant.BaseMember != null ? new BaseMemberDto
                {
                    Id = participant.BaseMember.Id,
              
                } : null
            };
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
                Files = message.MessageFiles.Select(MapToMessageFileDto).ToList(),
                Reactions = message.Reactions.Select(MapToMessageReactionDto).ToList()
            };
        }

        private MessageFileDto MapToMessageFileDto(MessageFile file)
        {
            return new MessageFileDto
            {
                Id = file.Id,
                MessageId = file.MessageId,
                FileName = file.FileName,
                FileUrl = file.FileUrl,
                FileType = file.FileType,
                FileSize = file.FileSize,
                ThumbnailUrl = file.ThumbnailUrl,
                MimeType = file.MimeType,
                UploadedAt = file.UploadedAt
            };
        }

        private MessageReactionDto MapToMessageReactionDto(MessageReaction reaction)
        {
            return new MessageReactionDto
            {
                Id = reaction.Id,
                MessageId = reaction.MessageId,
                BaseMemberId = reaction.BaseMemberId,
                Emoji = reaction.Emoji,
                ReactedAt = reaction.ReactedAt,
                Member = reaction.BaseMember != null ? new BaseMemberDto
                {
                    Id = reaction.BaseMember.Id,
                  
                } : null
            };
        }
    }
}