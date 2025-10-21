using Microsoft.EntityFrameworkCore;
using Realstate_servcices.Server.Data;
using Realstate_servcices.Server.Entity.Chat;
namespace Realstate_servcices.Server.Repository.Conversation
{
    public class ChatParticipantRepository : IChatParticipantRepository
    {
        private readonly ApplicationDbContext _context;

        public ChatParticipantRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<ChatParticipant>> GetChatParticipantsAsync(int chatId)
        {
            return await _context.ChatParticipants
                .Where(p => p.ChatId == chatId && p.IsActive)
                .Include(p => p.BaseMember)
                .ToListAsync();
        }

        public async Task<ChatParticipant?> GetParticipantAsync(int chatId, int userId)
        {
            return await _context.ChatParticipants
                .FirstOrDefaultAsync(p => p.ChatId == chatId && p.BaseMemberId == userId && p.IsActive);
        }

        public async Task<ChatParticipant> AddParticipantAsync(ChatParticipant participant)
        {
            _context.ChatParticipants.Add(participant);
            await _context.SaveChangesAsync();
            return participant;
        }

        public async Task<bool> RemoveParticipantAsync(int chatId, int userId)
        {
            var participant = await GetParticipantAsync(chatId, userId);
            if (participant == null) return false;

            participant.IsActive = false;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task UpdateLastReadAsync(int chatId, int userId)
        {
            var participant = await GetParticipantAsync(chatId, userId);
            if (participant != null)
            {
                participant.LastReadAt = DateTime.UtcNow;
                participant.UnreadCount = 0;
                await _context.SaveChangesAsync();
            }
        }
    }
}
