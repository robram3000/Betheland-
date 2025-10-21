using AutoMapper;
using Realstate_servcices.Server.Dto.Chat;
using Realstate_servcices.Server.Entity.Chat;
using Realstate_servcices.Server.Repository.Conversation;
namespace Realstate_servcices.Server.Services.Conversation
{
    public class ChatService : IChatService
    {
        private readonly IChatRepository _chatRepository;
        private readonly IChatParticipantRepository _participantRepository;
        private readonly IMapper _mapper;

        public ChatService(IChatRepository chatRepository, IChatParticipantRepository participantRepository, IMapper mapper)
        {
            _chatRepository = chatRepository;
            _participantRepository = participantRepository;
            _mapper = mapper;
        }

        public async Task<ChatDto> CreateChatAsync(CreateChatDto createDto, int creatorId)
        {
            var chat = new Chat
            {
                Name = createDto.Name,
                ChatType = createDto.ChatType,
                PropertyId = createDto.PropertyId
            };

            var createdChat = await _chatRepository.CreateAsync(chat);

            // Add creator as participant
            var creatorParticipant = new ChatParticipant
            {
                ChatId = createdChat.Id,
                BaseMemberId = creatorId,
                Role = "admin",
                ParticipantType = "user"
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
                    ParticipantType = "user"
                };
                await _participantRepository.AddParticipantAsync(participant);
            }

            return _mapper.Map<ChatDto>(createdChat);
        }

        public async Task<List<ChatDto>> GetUserChatsAsync(int userId)
        {
            var chats = await _chatRepository.GetUserChatsAsync(userId);
            return _mapper.Map<List<ChatDto>>(chats);
        }

        public async Task<ChatDto?> GetChatAsync(int chatId, int userId)
        {
            if (!await _chatRepository.UserHasAccessToChatAsync(userId, chatId))
                return null;

            var chat = await _chatRepository.GetByIdAsync(chatId);
            return _mapper.Map<ChatDto>(chat);
        }

        public async Task<ChatDto> UpdateChatAsync(int chatId, UpdateChatDto updateDto, int userId)
        {
            var chat = await _chatRepository.GetByIdAsync(chatId);
    

            if (!await HasAdminAccess(chatId, userId))
                throw new UnauthorizedAccessException("Only admins can update chat");

            chat.Name = updateDto.Name ?? chat.Name;
            chat.PropertyId = updateDto.PropertyId ?? chat.PropertyId;

            var updatedChat = await _chatRepository.UpdateAsync(chat);
            return _mapper.Map<ChatDto>(updatedChat);
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

                // Reactivate existing participant
                existingParticipant.IsActive = true;
                existingParticipant.Role = addDto.Role;
                await _participantRepository.AddParticipantAsync(existingParticipant);
                return _mapper.Map<ChatParticipantDto>(existingParticipant);
            }

            var participant = new ChatParticipant
            {
                ChatId = chatId,
                BaseMemberId = addDto.BaseMemberId,
                Role = addDto.Role,
                ParticipantType = addDto.ParticipantType
            };

            var createdParticipant = await _participantRepository.AddParticipantAsync(participant);
            return _mapper.Map<ChatParticipantDto>(createdParticipant);
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
    }
}
