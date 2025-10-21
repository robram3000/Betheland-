using Realstate_servcices.Server.Entity.Chat;
namespace Realstate_servcices.Server.Repository.Conversation
{
    public interface IMessageRepository
    {
        Task<Message?> GetByIdAsync(int id);
        Task<List<Message>> GetChatMessagesAsync(int chatId, int page = 1, int pageSize = 50);
        Task<Message> CreateAsync(Message message);
        Task<Message> UpdateAsync(Message message);
        Task<bool> DeleteAsync(int id);
        Task<int> GetUnreadCountAsync(int chatId, int userId);
    }
}
