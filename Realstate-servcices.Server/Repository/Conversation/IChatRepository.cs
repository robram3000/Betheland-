using Realstate_servcices.Server.Entity.Chat;
namespace Realstate_servcices.Server.Repository.Conversation
{
    public interface IChatRepository
    {
        Task<Chat?> GetByIdAsync(int id);
        Task<Chat?> GetByChatNoAsync(Guid chatNo);
        Task<List<Chat>> GetUserChatsAsync(int userId);
        Task<Chat> CreateAsync(Chat chat);
        Task<Chat> UpdateAsync(Chat chat);
        Task<bool> DeleteAsync(int id);
        Task<bool> UserHasAccessToChatAsync(int userId, int chatId);
    }
}
