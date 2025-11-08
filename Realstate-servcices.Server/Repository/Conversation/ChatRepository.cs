using Microsoft.EntityFrameworkCore;
using Realstate_servcices.Server.Data;
using Realstate_servcices.Server.Entity.Chat;

namespace Realstate_servcices.Server.Repository.Conversation
{
    public class ChatRepository : IChatRepository
    {
        private readonly ApplicationDbContext _context;

        public ChatRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Chat> GetByIdAsync(int chatId)
        {
            return await _context.Chats
                .Include(c => c.Participants)
                    .ThenInclude(p => p.BaseMember)
                        .ThenInclude(m => m.Client)
                .Include(c => c.Participants)
                    .ThenInclude(p => p.BaseMember)
                        .ThenInclude(m => m.Agent)
                .Include(c => c.Messages)
                    .ThenInclude(m => m.Sender)
                        .ThenInclude(s => s.Client)
                .Include(c => c.Messages)
                    .ThenInclude(m => m.Sender)
                        .ThenInclude(s => s.Agent)
                .Include(c => c.Messages)
                    .ThenInclude(m => m.MessageFiles)
                .Include(c => c.Messages)
                    .ThenInclude(m => m.Reactions)
                        .ThenInclude(r => r.BaseMember)
                            .ThenInclude(bm => bm.Client)
                .Include(c => c.Messages)
                    .ThenInclude(m => m.Reactions)
                        .ThenInclude(r => r.BaseMember)
                            .ThenInclude(bm => bm.Agent)
                .FirstOrDefaultAsync(c => c.Id == chatId);
        }

        public async Task<Chat?> GetByChatNoAsync(Guid chatNo)
        {
            return await _context.Chats
                .FirstOrDefaultAsync(c => c.ChatNo == chatNo);
        }

        public async Task<List<Chat>> GetUserChatsAsync(int userId)
        {
            return await _context.Chats
                .Include(c => c.Participants.Where(p => p.IsActive))
                    .ThenInclude(p => p.BaseMember)
                        .ThenInclude(bm => bm.Client)
                .Include(c => c.Participants.Where(p => p.IsActive))
                    .ThenInclude(p => p.BaseMember)
                        .ThenInclude(bm => bm.Agent)
                .Include(c => c.Messages.OrderByDescending(m => m.SentAt).Take(1))
                    .ThenInclude(m => m.Sender)
                        .ThenInclude(s => s.Client)
                .Include(c => c.Messages.OrderByDescending(m => m.SentAt).Take(1))
                    .ThenInclude(m => m.Sender)
                        .ThenInclude(s => s.Agent)
                .Where(c => c.Participants.Any(p => p.BaseMemberId == userId && p.IsActive))
                .OrderByDescending(c => c.UpdatedAt)
                .ToListAsync();
        }

        public async Task<List<Chat>> GetByClientChatAsync(int clientId)
        {
            return await _context.Chats
                .Include(c => c.Participants.Where(p => p.IsActive))
                    .ThenInclude(p => p.BaseMember)
                        .ThenInclude(bm => bm.Client)
                .Include(c => c.Participants.Where(p => p.IsActive))
                    .ThenInclude(p => p.BaseMember)
                        .ThenInclude(bm => bm.Agent)
                .Include(c => c.Messages.OrderByDescending(m => m.SentAt).Take(1))
                    .ThenInclude(m => m.Sender)
                        .ThenInclude(s => s.Client)
                .Include(c => c.Messages.OrderByDescending(m => m.SentAt).Take(1))
                    .ThenInclude(m => m.Sender)
                        .ThenInclude(s => s.Agent)
                .Where(c => c.Participants.Any(p => p.BaseMemberId == clientId && p.IsActive) &&
                           c.Participants.Any(p => p.BaseMember.Client != null))
                .OrderByDescending(c => c.UpdatedAt)
                .ToListAsync();
        }

        public async Task<List<Chat>> GetByAgentChatAsync(int agentId)
        {
            return await _context.Chats
                .Include(c => c.Participants.Where(p => p.IsActive))
                    .ThenInclude(p => p.BaseMember)
                        .ThenInclude(bm => bm.Client)
                .Include(c => c.Participants.Where(p => p.IsActive))
                    .ThenInclude(p => p.BaseMember)
                        .ThenInclude(bm => bm.Agent)
                .Include(c => c.Messages.OrderByDescending(m => m.SentAt).Take(1))
                    .ThenInclude(m => m.Sender)
                        .ThenInclude(s => s.Client)
                .Include(c => c.Messages.OrderByDescending(m => m.SentAt).Take(1))
                    .ThenInclude(m => m.Sender)
                        .ThenInclude(s => s.Agent)
                .Where(c => c.Participants.Any(p => p.BaseMemberId == agentId && p.IsActive) &&
                           c.Participants.Any(p => p.BaseMember.Agent != null))
                .OrderByDescending(c => c.UpdatedAt)
                .ToListAsync();
        }

        public async Task UpdateLastMessageAsync(int chatId, string lastMessage, DateTime lastMessageAt)
        {
            var chat = await _context.Chats.FindAsync(chatId);
            if (chat != null)
            {
                chat.LastMessage = lastMessage;
                chat.LastMessageAt = lastMessageAt;
                chat.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }

        public async Task<Chat> CreateAsync(Chat chat)
        {
            _context.Chats.Add(chat);
            await _context.SaveChangesAsync();
            return chat;
        }

        public async Task<Chat> UpdateAsync(Chat chat)
        {
            chat.UpdatedAt = DateTime.UtcNow;
            _context.Chats.Update(chat);
            await _context.SaveChangesAsync();
            return chat;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var chat = await _context.Chats.FindAsync(id);
            if (chat == null) return false;

            _context.Chats.Remove(chat);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UserHasAccessToChatAsync(int userId, int chatId)
        {
            return await _context.ChatParticipants
                .AnyAsync(p => p.ChatId == chatId && p.BaseMemberId == userId && p.IsActive);
        }
    }
}