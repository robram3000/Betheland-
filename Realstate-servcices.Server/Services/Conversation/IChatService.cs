using Realstate_servcices.Server.Dto.Chat;

namespace Realstate_servcices.Server.Services.Conversation
{
    public interface IChatService
    {
        Task<ChatDto> CreateChatAsync(CreateChatDto createDto, int creatorId);
        Task<List<ChatDto>> GetUserChatsAsync(int userId);
        Task<ChatDto?> GetChatAsync(int chatId, int userId);
        Task<ChatDto> UpdateChatAsync(int chatId, UpdateChatDto updateDto, int userId);
        Task<bool> DeleteChatAsync(int chatId, int userId);
        Task<ChatParticipantDto> AddParticipantAsync(int chatId, AddParticipantDto addDto, int requesterId);
        Task<bool> RemoveParticipantAsync(int chatId, int participantId, int requesterId);

        // Existing methods
        Task<List<ChatDto>> GetByClientChatAsync(int clientId);
        Task<List<ChatDto>> GetByAgentChatAsync(int agentId);

        // New method for recipient functionality
        Task<List<ChatDto>> GetChatsByRecipientAsync(int recipientId, int userId);
    }
}