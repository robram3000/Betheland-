using Realstate_servcices.Server.Entity.Chat;
using Realstate_servcices.Server.Entity.Member;

namespace Realstate_servcices.Server.Repository.Conversation.Interfaces
{
    public interface IChatParticipantRepository
    {
        Task<List<ChatParticipant>> GetChatParticipantsAsync(int chatId);
        Task<ChatParticipant?> GetParticipantAsync(int chatId, int userId);
        Task<ChatParticipant> AddParticipantAsync(ChatParticipant participant);
        Task<bool> RemoveParticipantAsync(int chatId, int userId);
        Task UpdateLastReadAsync(int chatId, int userId);

        // Add these missing methods
        Task<BaseMember?> GetRecipientAsync(int chatId, int senderId);
        Task<ChatParticipant?> GetParticipantByRecipientAsync(int chatId, int recipientId);
        Task UpdateParticipantAsync(ChatParticipant participant);


        Task IncrementUnreadCountForOthersAsync(int chatId, int excludedUserId);
    }
}