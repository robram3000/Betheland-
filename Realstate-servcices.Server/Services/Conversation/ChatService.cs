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

        public async Task<List<ChatDto>> GetByClientChatAsync(int clientId)
        {
            var chats = await _chatRepository.GetByClientChatAsync(clientId);
            return chats.Select(MapToChatDto).ToList();
        }

        public async Task<List<ChatDto>> GetByAgentChatAsync(int agentId)
        {
            var chats = await _chatRepository.GetByAgentChatAsync(agentId);
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
            string? firstName = null;
            string? lastName = null;
            string? fullName = null;
            string? profileImage = null;
            string? memberType = null;

            // Get user details from Client if available
            if (participant.BaseMember?.Client != null)
            {
                firstName = participant.BaseMember.Client.FirstName;
                lastName = participant.BaseMember.Client.LastName;
                fullName = $"{participant.BaseMember.Client.FirstName} {participant.BaseMember.Client.LastName}";
                profileImage = participant.BaseMember.ProfilePictureUrl;
                memberType = "Client";
            }
            // Get user details from Agent if available
            else if (participant.BaseMember?.Agent != null)
            {
                firstName = participant.BaseMember.Agent.FirstName;
                lastName = participant.BaseMember.Agent.LastName;
                fullName = $"{participant.BaseMember.Agent.FirstName} {participant.BaseMember.Agent.LastName}";
                profileImage = participant.BaseMember.ProfilePictureUrl;
                memberType = "Agent";
            }
            // Fallback to BaseMember properties
            else if (participant.BaseMember != null)
            {
                firstName = participant.BaseMember.Username;
                lastName = string.Empty;
                fullName = participant.BaseMember.Username;
                profileImage = participant.BaseMember.ProfilePictureUrl;
                memberType = participant.BaseMember.Role ?? "User";
            }

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
                    FirstName = firstName,
                    LastName = lastName,
                    FullName = fullName,
                    ProfileImage = profileImage,
                    MemberType = memberType,
                    Email = participant.BaseMember.Email,
                    Username = participant.BaseMember.Username
                } : null
            };
        }

        private MessageDto MapToMessageDto(Message message)
        {
            string? firstName = null;
            string? lastName = null;
            string? fullName = null;
            string? profileImage = null;
            string? memberType = null;

            // Get sender details from Client if available
            if (message.Sender?.Client != null)
            {
                firstName = message.Sender.Client.FirstName;
                lastName = message.Sender.Client.LastName;
                fullName = $"{message.Sender.Client.FirstName} {message.Sender.Client.LastName}";
                profileImage = message.Sender.ProfilePictureUrl;
                memberType = "Client";
            }
            // Get sender details from Agent if available
            else if (message.Sender?.Agent != null)
            {
                firstName = message.Sender.Agent.FirstName;
                lastName = message.Sender.Agent.LastName;
                fullName = $"{message.Sender.Agent.FirstName} {message.Sender.Agent.LastName}";
                profileImage = message.Sender.ProfilePictureUrl;
                memberType = "Agent";
            }
            // Fallback to BaseMember properties
            else if (message.Sender != null)
            {
                firstName = message.Sender.Username;
                lastName = string.Empty;
                fullName = message.Sender.Username;
                profileImage = message.Sender.ProfilePictureUrl;
                memberType = message.Sender.Role ?? "User";
            }

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
                    FirstName = firstName,
                    LastName = lastName,
                    FullName = fullName,
                    ProfileImage = profileImage,
                    MemberType = memberType,
                    Email = message.Sender.Email,
                    Username = message.Sender.Username
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