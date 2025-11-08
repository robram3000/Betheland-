using Realstate_servcices.Server.Entity.Chat;

namespace Realstate_servcices.Server.Repository.Conversation
{
    public interface IChatRepository
    {
        Task<Chat?> GetByIdAsync(int id);
        Task<List<Chat>> GetUserChatsAsync(int userId);
        Task<bool> UserHasAccessToChatAsync(int userId, int chatId);
        Task<Chat> CreateAsync(Chat chat);
        Task<Chat> UpdateAsync(Chat chat);
        Task<bool> DeleteAsync(int id);
        Task UpdateLastMessageAsync(int chatId, string lastMessage, DateTime lastMessageAt);

        // New methods
        Task<List<Chat>> GetByClientChatAsync(int clientId);
        Task<List<Chat>> GetByAgentChatAsync(int agentId);
    }
}