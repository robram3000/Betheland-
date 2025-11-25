// ChatService.cs
using Microsoft.EntityFrameworkCore;
using Realstate_servcices.Server.Data;
using Realstate_servcices.Server.Dto.Chat;
using Realstate_servcices.Server.Dto.Property;
using Realstate_servcices.Server.Entity.Chat;
using Realstate_servcices.Server.Entity.Properties;
using Realstate_servcices.Server.Repository.Conversation;

namespace Realstate_servcices.Server.Services.Conversation
{
    public class ChatService : IChatService
    {
        private readonly IChatRepository _chatRepository;
        private readonly IChatParticipantRepository _participantRepository;
        private readonly ApplicationDbContext _context;

        public ChatService(IChatRepository chatRepository,
            IChatParticipantRepository participantRepository,
            ApplicationDbContext context)
        {
            _chatRepository = chatRepository;
            _participantRepository = participantRepository;
            _context = context;
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

            // Add creator as participant
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

            // Reload chat with participants and property
            var fullChat = await _chatRepository.GetByIdWithPropertyAsync(createdChat.Id);
            return await MapToChatDtoAsync(fullChat);
        }

        public async Task<List<ChatDto>> GetUserChatsAsync(int userId)
        {
            var chats = await _chatRepository.GetUserChatsWithPropertiesAsync(userId);
            var chatDtos = new List<ChatDto>();

            foreach (var chat in chats)
            {
                chatDtos.Add(await MapToChatDtoAsync(chat));
            }

            return chatDtos;
        }

        public async Task<List<ChatDto>> GetByClientChatAsync(int clientId)
        {
            var chats = await _chatRepository.GetByClientChatWithPropertiesAsync(clientId);
            var chatDtos = new List<ChatDto>();

            foreach (var chat in chats)
            {
                chatDtos.Add(await MapToChatDtoAsync(chat));
            }

            return chatDtos;
        }

        public async Task<List<ChatDto>> GetByAgentChatAsync(int agentId)
        {
            var chats = await _chatRepository.GetByAgentChatWithPropertiesAsync(agentId);
            var chatDtos = new List<ChatDto>();

            foreach (var chat in chats)
            {
                chatDtos.Add(await MapToChatDtoAsync(chat));
            }

            return chatDtos;
        }

        public async Task<ChatDto?> GetChatAsync(int chatId, int userId)
        {
            if (!await _chatRepository.UserHasAccessToChatAsync(userId, chatId))
                return null;

            var chat = await _chatRepository.GetByIdWithPropertyAsync(chatId);
            return chat != null ? await MapToChatDtoAsync(chat) : null;
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
            var fullChat = await _chatRepository.GetByIdWithPropertyAsync(updatedChat.Id);
            return await MapToChatDtoAsync(fullChat);
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
                existingParticipant.RecipientId = addDto.RecipientId;
                await _participantRepository.UpdateParticipantAsync(existingParticipant);
                return MapToChatParticipantDto(existingParticipant);
            }

            var participant = new ChatParticipant
            {
                ChatId = chatId,
                BaseMemberId = addDto.BaseMemberId,
                RecipientId = addDto.RecipientId,
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

        public async Task<List<ChatDto>> GetChatsByRecipientAsync(int recipientId, int userId)
        {
            // Security check: user can only see chats where they are involved
            if (recipientId != userId)
            {
                var hasCommonChats = await _context.ChatParticipants
                    .AnyAsync(p => p.BaseMemberId == userId && p.IsActive &&
                                 _context.ChatParticipants
                                     .Any(op => op.ChatId == p.ChatId && op.BaseMemberId == recipientId && op.IsActive));

                if (!hasCommonChats)
                {
                    throw new UnauthorizedAccessException("No access to view these chats");
                }
            }

            var chats = await _chatRepository.GetChatsByRecipientWithPropertiesAsync(recipientId);

            // Additional security: filter chats to ensure user has access
            var accessibleChats = new List<ChatDto>();
            foreach (var chat in chats)
            {
                if (await _chatRepository.UserHasAccessToChatAsync(userId, chat.Id))
                {
                    accessibleChats.Add(await MapToChatDtoAsync(chat));
                }
            }

            return accessibleChats;
        }

        private async Task<bool> HasAdminAccess(int chatId, int userId)
        {
            var participant = await _participantRepository.GetParticipantAsync(chatId, userId);
            return participant?.Role == "admin";
        }

        private async Task<ChatDto> MapToChatDtoAsync(Chat chat)
        {
            // Get property details if exists
            PropertyDto? propertyDto = null;
            if (chat.PropertyId.HasValue)
            {
                if (chat.Property == null)
                {
                    // If property wasn't included in the query, load it separately
                    var property = await _context.Properties
                        .FirstOrDefaultAsync(p => p.Id == chat.PropertyId.Value);

                    if (property != null)
                    {
                        propertyDto = MapToPropertyDto(property);
                    }
                }
                else
                {
                    propertyDto = MapToPropertyDto(chat.Property);
                }
            }

            // Calculate unread count for the current user
            var currentUserId = await GetCurrentUserIdFromContext();
            var unreadCount = 0;
            if (currentUserId > 0)
            {
                var participant = await _participantRepository.GetParticipantAsync(chat.Id, currentUserId);
                unreadCount = participant?.UnreadCount ?? 0;
            }

            return new ChatDto
            {
                Id = chat.Id,
                ChatNo = chat.ChatNo,
                Name = chat.Name,
                ChatType = chat.ChatType,
                PropertyId = chat.PropertyId,
                Property = propertyDto,
                LastMessage = chat.LastMessage,
                LastMessageAt = chat.LastMessageAt,
                CreatedAt = chat.CreatedAt,
                UpdatedAt = chat.UpdatedAt,
                UnreadCount = unreadCount,
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

        private PropertyDto MapToPropertyDto(PropertyHouse property)
        {
            return new PropertyDto
            {
                Id = property.Id,
                PropertyNo = property.PropertyNo,
                Title = property.Title,
                Description = property.Description,
                Type = property.Type,
                Price = property.Price,
                Bedrooms = property.Bedrooms,
                Bathrooms = property.Bathrooms,
                AreaSqm = property.AreaSqm,
                Address = property.Address,
                City = property.City,
                State = property.State,
                ZipCode = property.ZipCode,
                Status = property.Status,
                ListedDate = property.ListedDate,
                Country = property.Country,
                Barangay = property.Barangay,
                OwnerId = property.OwnerId,
                AgentId = property.AgentId,
         
            };
        }

        private ChatParticipantDto MapToChatParticipantDto(ChatParticipant participant)
        {
            string? firstName = null;
            string? lastName = null;
            string? fullName = null;
            string? profileImage = null;
            string? memberType = null;

            string? recipientFirstName = null;
            string? recipientLastName = null;
            string? recipientFullName = null;
            string? recipientProfileImage = null;
            string? recipientMemberType = null;

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

            // Get recipient details
            if (participant.Recipient?.Client != null)
            {
                recipientFirstName = participant.Recipient.Client.FirstName;
                recipientLastName = participant.Recipient.Client.LastName;
                recipientFullName = $"{participant.Recipient.Client.FirstName} {participant.Recipient.Client.LastName}";
                recipientProfileImage = participant.Recipient.ProfilePictureUrl;
                recipientMemberType = "Client";
            }
            else if (participant.Recipient?.Agent != null)
            {
                recipientFirstName = participant.Recipient.Agent.FirstName;
                recipientLastName = participant.Recipient.Agent.LastName;
                recipientFullName = $"{participant.Recipient.Agent.FirstName} {participant.Recipient.Agent.LastName}";
                recipientProfileImage = participant.Recipient.ProfilePictureUrl;
                recipientMemberType = "Agent";
            }
            else if (participant.Recipient != null)
            {
                recipientFirstName = participant.Recipient.Username;
                recipientLastName = string.Empty;
                recipientFullName = participant.Recipient.Username;
                recipientProfileImage = participant.Recipient.ProfilePictureUrl;
                recipientMemberType = participant.Recipient.Role ?? "User";
            }

            return new ChatParticipantDto
            {
                Id = participant.Id,
                ChatId = participant.ChatId,
                BaseMemberId = participant.BaseMemberId,
                RecipientId = participant.RecipientId,
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
                } : null,
                Recipient = participant.Recipient != null ? new BaseMemberDto
                {
                    Id = participant.Recipient.Id,
                    FirstName = recipientFirstName,
                    LastName = recipientLastName,
                    FullName = recipientFullName,
                    ProfileImage = recipientProfileImage,
                    MemberType = recipientMemberType,
                    Email = participant.Recipient.Email,
                    Username = participant.Recipient.Username
                } : null
            };
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

        private async Task<int> GetCurrentUserIdFromContext()
        {
            // This would typically get the current user ID from HttpContext
            // You'll need to implement this based on your authentication system
            // For now, return 0 as a placeholder
            return 0;
        }
    }
}