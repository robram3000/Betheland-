using Microsoft.EntityFrameworkCore;
using Realstate_servcices.Server.Data;
using Realstate_servcices.Server.Entity.Chat;
namespace Realstate_servcices.Server.Repository.Conversation
{
    public class MessageRepository : IMessageRepository
    {
        private readonly ApplicationDbContext _context;

        public MessageRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Message?> GetByIdAsync(int id)
        {
            return await _context.Messages
                .Include(m => m.Sender)
                .Include(m => m.Recipient)
                .Include(m => m.MessageFiles)
                .Include(m => m.Reactions)
                .FirstOrDefaultAsync(m => m.Id == id);
        }

        public async Task<List<Message>> GetChatMessagesAsync(int chatId, int page = 1, int pageSize = 50)
        {
            return await _context.Messages
                .Where(m => m.ChatId == chatId && !m.IsDeleted)
                .Include(m => m.Sender)
                .Include(m => m.Recipient)
                .Include(m => m.MessageFiles)
                .Include(m => m.Reactions)
                .ThenInclude(r => r.BaseMember)
                .OrderByDescending(m => m.SentAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .OrderBy(m => m.SentAt)
                .ToListAsync();
        }

        public async Task<Message> CreateAsync(Message message)
        {
            // Auto-set RecipientId if not provided
            if (!message.RecipientId.HasValue)
            {
                var participant = await _context.ChatParticipants
                    .Where(p => p.ChatId == message.ChatId && p.BaseMemberId == message.SenderId && p.IsActive)
                    .FirstOrDefaultAsync();

                if (participant?.RecipientId != null)
                {
                    message.RecipientId = participant.RecipientId;
                }
                else
                {
                    // Fallback: get first other participant
                    var otherParticipant = await _context.ChatParticipants
                        .Where(p => p.ChatId == message.ChatId && p.BaseMemberId != message.SenderId && p.IsActive)
                        .FirstOrDefaultAsync();

                    if (otherParticipant != null)
                    {
                        message.RecipientId = otherParticipant.BaseMemberId;
                    }
                }
            }

            _context.Messages.Add(message);

            var chat = await _context.Chats.FindAsync(message.ChatId);
            if (chat != null)
            {
                chat.LastMessage = message.Content;
                chat.LastMessageAt = message.SentAt;
                chat.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return message;
        }

        public async Task<Message> UpdateAsync(Message message)
        {
            message.EditedAt = DateTime.UtcNow;
            _context.Messages.Update(message);
            await _context.SaveChangesAsync();
            return message;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var message = await _context.Messages.FindAsync(id);
            if (message == null) return false;

            message.IsDeleted = true;
            message.Content = "[This message was deleted]";
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<int> GetUnreadCountAsync(int chatId, int userId)
        {
            var lastRead = await _context.ChatParticipants
                .Where(p => p.ChatId == chatId && p.BaseMemberId == userId)
                .Select(p => p.LastReadAt)
                .FirstOrDefaultAsync();

            return await _context.Messages
                .CountAsync(m => m.ChatId == chatId &&
                               m.SentAt > lastRead &&
                               m.SenderId != userId &&
                               !m.IsDeleted);
        }

        // New method to get messages by recipient
        public async Task<List<Message>> GetMessagesByRecipientAsync(int recipientId, int page = 1, int pageSize = 50)
        {
            return await _context.Messages
                .Where(m => m.RecipientId == recipientId && !m.IsDeleted)
                .Include(m => m.Sender)
                .Include(m => m.Recipient)
                .Include(m => m.MessageFiles)
                .Include(m => m.Reactions)
                .OrderByDescending(m => m.SentAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }
    }
}