using Realstate_servcices.Server.Entity.Chat;
namespace Realstate_servcices.Server.Repository.Conversation
{
    public interface IChatParticipantRepository
    {
        Task<List<ChatParticipant>> GetChatParticipantsAsync(int chatId);
        Task<ChatParticipant?> GetParticipantAsync(int chatId, int userId);
        Task<ChatParticipant> AddParticipantAsync(ChatParticipant participant);
        Task<bool> RemoveParticipantAsync(int chatId, int userId);
        Task UpdateLastReadAsync(int chatId, int userId);
    }
}
