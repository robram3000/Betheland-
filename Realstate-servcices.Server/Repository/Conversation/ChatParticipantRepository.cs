using Microsoft.EntityFrameworkCore;
using Realstate_servcices.Server.Data;
using Realstate_servcices.Server.Entity.Chat;
using Realstate_servcices.Server.Entity.Member;

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
                .Include(p => p.Recipient)
                .ToListAsync();
        }

        public async Task<ChatParticipant?> GetParticipantAsync(int chatId, int userId)
        {
            return await _context.ChatParticipants
                .Include(p => p.Recipient)
                .FirstOrDefaultAsync(p => p.ChatId == chatId && p.BaseMemberId == userId && p.IsActive);
        }

        public async Task<ChatParticipant> AddParticipantAsync(ChatParticipant participant)
        {
            // Auto-set RecipientId based on other participants for direct chats
            if (!participant.RecipientId.HasValue)
            {
                var otherParticipants = await _context.ChatParticipants
                    .Where(p => p.ChatId == participant.ChatId && p.BaseMemberId != participant.BaseMemberId && p.IsActive)
                    .ToListAsync();

                // For direct chats, set recipient as the other participant
                if (otherParticipants.Count == 1)
                {
                    participant.RecipientId = otherParticipants.First().BaseMemberId;

                    // Also update the other participant's RecipientId
                    var otherParticipant = otherParticipants.First();
                    if (!otherParticipant.RecipientId.HasValue)
                    {
                        otherParticipant.RecipientId = participant.BaseMemberId;
                        _context.ChatParticipants.Update(otherParticipant);
                    }
                }
            }

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

        public async Task UpdateParticipantAsync(ChatParticipant participant)
        {
            participant.LastReadAt = DateTime.UtcNow;
            _context.ChatParticipants.Update(participant);
            await _context.SaveChangesAsync();
        }

        public async Task IncrementUnreadCountForOthersAsync(int chatId, int excludedUserId)
        {
            var participants = await _context.ChatParticipants
                .Where(p => p.ChatId == chatId && p.BaseMemberId != excludedUserId && p.IsActive)
                .ToListAsync();

            foreach (var participant in participants)
            {
                participant.UnreadCount++;
            }

            await _context.SaveChangesAsync();
        }

        // New method to get recipient for a participant
        public async Task<BaseMember?> GetRecipientAsync(int chatId, int senderId)
        {
            var participant = await _context.ChatParticipants
                .Where(p => p.ChatId == chatId && p.BaseMemberId == senderId && p.IsActive)
                .Include(p => p.Recipient)
                .FirstOrDefaultAsync();

            return participant?.Recipient;
        }

        // New method to get participant by recipient
        public async Task<ChatParticipant?> GetParticipantByRecipientAsync(int chatId, int recipientId)
        {
            return await _context.ChatParticipants
                .Include(p => p.BaseMember)
                .Include(p => p.Recipient)
                .FirstOrDefaultAsync(p => p.ChatId == chatId && p.RecipientId == recipientId && p.IsActive);
        }

        public async Task<List<Chat>> GetChatsByRecipientAsync(int recipientId)
        {
            return await _context.Chats
                .Include(c => c.Participants.Where(p => p.IsActive))
                    .ThenInclude(p => p.BaseMember)
                .Include(c => c.Participants.Where(p => p.IsActive))
                    .ThenInclude(p => p.Recipient)
                .Include(c => c.Messages.OrderByDescending(m => m.SentAt).Take(1))
                .Where(c => c.Participants.Any(p => p.RecipientId == recipientId && p.IsActive))
                .OrderByDescending(c => c.UpdatedAt)
                .ToListAsync();
        }
     

    }
}