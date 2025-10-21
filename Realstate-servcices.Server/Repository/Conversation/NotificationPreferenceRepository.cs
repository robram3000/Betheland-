using Microsoft.EntityFrameworkCore;
using Realstate_servcices.Server.Data;
using Realstate_servcices.Server.Entity.Chat;
namespace Realstate_servcices.Server.Repository.Conversation
{
    public class NotificationPreferenceRepository : INotificationPreferenceRepository
    {
        private readonly ApplicationDbContext _context;

        public NotificationPreferenceRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<NotificationPreference> GetByUserIdAsync(int userId)
        {
            var preference = await _context.NotificationPreferences
                .FirstOrDefaultAsync(np => np.BaseMemberId == userId);

            if (preference == null)
            {
                preference = new NotificationPreference
                {
                    BaseMemberId = userId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.NotificationPreferences.Add(preference);
                await _context.SaveChangesAsync();
            }

            return preference;
        }

        public async Task<NotificationPreference> CreateAsync(NotificationPreference preference)
        {
            _context.NotificationPreferences.Add(preference);
            await _context.SaveChangesAsync();
            return preference;
        }

        public async Task<NotificationPreference> UpdateAsync(NotificationPreference preference)
        {
            preference.UpdatedAt = DateTime.UtcNow;
            _context.NotificationPreferences.Update(preference);
            await _context.SaveChangesAsync();
            return preference;
        }

        public async Task<bool> DeleteAsync(int userId)
        {
            var preference = await _context.NotificationPreferences
                .FirstOrDefaultAsync(np => np.BaseMemberId == userId);

            if (preference == null)
                return false;

            _context.NotificationPreferences.Remove(preference);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
