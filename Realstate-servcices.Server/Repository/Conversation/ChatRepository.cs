// ChatRepository.cs
using Microsoft.EntityFrameworkCore;
using Realstate_servcices.Server.Data;
using Realstate_servcices.Server.Entity.Chat;
using Realstate_servcices.Server.Repository.Conversation.Interfaces;

namespace Realstate_servcices.Server.Repository.Conversation
{
    public class ChatRepository : IChatRepository
    {
        private readonly ApplicationDbContext _context;

        public ChatRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Chat> CreateAsync(Chat chat)
        {
            _context.Chats.Add(chat);
            await _context.SaveChangesAsync();
            return chat;
        }

        public async Task<Chat?> GetByIdAsync(int id)
        {
            return await _context.Chats
                .Include(c => c.Participants)
                .Include(c => c.Messages)
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<Chat?> GetByIdWithPropertyAsync(int id)
        {
            return await _context.Chats
                .Include(c => c.Participants)
                    .ThenInclude(p => p.BaseMember)
                        .ThenInclude(bm => bm.Client)
                .Include(c => c.Participants)
                    .ThenInclude(p => p.BaseMember)
                        .ThenInclude(bm => bm.Agent)
                .Include(c => c.Participants)
                    .ThenInclude(p => p.Recipient)
                .Include(c => c.Messages)
                    .ThenInclude(m => m.Sender)
                .Include(c => c.Messages)
                    .ThenInclude(m => m.Recipient)
                .Include(c => c.Messages)
                    .ThenInclude(m => m.MessageFiles)
                .Include(c => c.Messages)
                    .ThenInclude(m => m.Reactions)
                        .ThenInclude(r => r.BaseMember)
                .Include(c => c.Property) // Include property
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<List<Chat>> GetUserChatsAsync(int userId)
        {
            return await _context.Chats
                .Where(c => c.Participants.Any(p => p.BaseMemberId == userId && p.IsActive))
                .Include(c => c.Participants)
                .Include(c => c.Messages)
                .OrderByDescending(c => c.LastMessageAt ?? c.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<Chat>> GetUserChatsWithPropertiesAsync(int userId)
        {
            return await _context.Chats
                .Where(c => c.Participants.Any(p => p.BaseMemberId == userId && p.IsActive))
                .Include(c => c.Participants)
                .Include(c => c.Messages)
                .Include(c => c.Property) // Include property
                .OrderByDescending(c => c.LastMessageAt ?? c.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<Chat>> GetByClientChatAsync(int clientId)
        {
            return await _context.Chats
                .Where(c => c.Participants.Any(p => p.BaseMemberId == clientId && p.IsActive))
                .Include(c => c.Participants)
                .Include(c => c.Messages)
                .OrderByDescending(c => c.LastMessageAt ?? c.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<Chat>> GetByClientChatWithPropertiesAsync(int clientId)
        {
            return await _context.Chats
                .Where(c => c.Participants.Any(p => p.BaseMemberId == clientId && p.IsActive))
                .Include(c => c.Participants)
                .Include(c => c.Messages)
                .Include(c => c.Property) // Include property
                .OrderByDescending(c => c.LastMessageAt ?? c.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<Chat>> GetByAgentChatAsync(int agentId)
        {
            return await _context.Chats
                .Where(c => c.Participants.Any(p => p.BaseMemberId == agentId && p.IsActive))
                .Include(c => c.Participants)
                .Include(c => c.Messages)
                .OrderByDescending(c => c.LastMessageAt ?? c.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<Chat>> GetByAgentChatWithPropertiesAsync(int agentId)
        {
            return await _context.Chats
                .Where(c => c.Participants.Any(p => p.BaseMemberId == agentId && p.IsActive))
                .Include(c => c.Participants)
                .Include(c => c.Messages)
                .Include(c => c.Property) // Include property
                .OrderByDescending(c => c.LastMessageAt ?? c.CreatedAt)
                .ToListAsync();
        }

        public async Task<Chat> UpdateAsync(Chat chat)
        {
            _context.Chats.Update(chat);
            await _context.SaveChangesAsync();
            return chat;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var chat = await _context.Chats.FindAsync(id);
            if (chat == null)
                return false;

            _context.Chats.Remove(chat);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UserHasAccessToChatAsync(int userId, int chatId)
        {
            return await _context.ChatParticipants
                .AnyAsync(p => p.ChatId == chatId && p.BaseMemberId == userId && p.IsActive);
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

        public async Task<List<Chat>> GetChatsByRecipientAsync(int recipientId)
        {
            return await _context.Chats
                .Where(c => c.Participants.Any(p => p.BaseMemberId == recipientId && p.IsActive))
                .Include(c => c.Participants)
                .Include(c => c.Messages)
                .OrderByDescending(c => c.LastMessageAt ?? c.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<Chat>> GetChatsByRecipientWithPropertiesAsync(int recipientId)
        {
            return await _context.Chats
                .Where(c => c.Participants.Any(p => p.BaseMemberId == recipientId && p.IsActive))
                .Include(c => c.Participants)
                .Include(c => c.Messages)
                .Include(c => c.Property) 
                .OrderByDescending(c => c.LastMessageAt ?? c.CreatedAt)
                .ToListAsync();
        }
    }
}