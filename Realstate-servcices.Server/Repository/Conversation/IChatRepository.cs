using Realstate_servcices.Server.Entity.Chat;

namespace Realstate_servcices.Server.Repository.Conversation
{
    public interface IChatRepository
    {
        Task<Chat> CreateAsync(Chat chat);
        Task<Chat?> GetByIdAsync(int id);
        Task<Chat?> GetByIdWithPropertyAsync(int id);
        Task<List<Chat>> GetUserChatsAsync(int userId);
        Task<List<Chat>> GetUserChatsWithPropertiesAsync(int userId);
        Task<List<Chat>> GetByClientChatAsync(int clientId);
        Task<List<Chat>> GetByClientChatWithPropertiesAsync(int clientId);
        Task<List<Chat>> GetByAgentChatAsync(int agentId);
        Task<List<Chat>> GetByAgentChatWithPropertiesAsync(int agentId);
        Task<Chat> UpdateAsync(Chat chat);
        Task<bool> DeleteAsync(int id);
        Task<bool> UserHasAccessToChatAsync(int userId, int chatId);
        Task UpdateLastMessageAsync(int chatId, string lastMessage, DateTime lastMessageAt);
        Task<List<Chat>> GetChatsByRecipientAsync(int recipientId);
        Task<List<Chat>> GetChatsByRecipientWithPropertiesAsync(int recipientId);
    }
}