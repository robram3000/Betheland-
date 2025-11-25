using Realstate_servcices.Server.Dto.Chat;
namespace Realstate_servcices.Server.Services.Conversation
{
    public interface IMessageService
    {
        Task<MessageDto> SendMessageAsync(CreateMessageDto createDto, int senderId);
        Task<List<MessageDto>> GetChatMessagesAsync(int chatId, int userId, int page = 1, int pageSize = 50);
        Task<MessageDto> UpdateMessageAsync(int messageId, UpdateMessageDto updateDto, int userId);
        Task<bool> DeleteMessageAsync(int messageId, int userId);
        Task<MessageDto> AddReactionAsync(int messageId, string emoji, int userId);
        Task<bool> RemoveReactionAsync(int messageId, int userId);

        // New method for recipient functionality
        Task<List<MessageDto>> GetMessagesByRecipientAsync(int recipientId, int userId, int page = 1, int pageSize = 50);
    }
}