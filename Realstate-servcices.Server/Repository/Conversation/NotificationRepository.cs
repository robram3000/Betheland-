// NotificationRepository.cs - FIXED VERSION
using Microsoft.EntityFrameworkCore;
using Realstate_servcices.Server.Data;
using Realstate_servcices.Server.Entity.Chat;

namespace Realstate_servcices.Server.Repository.Conversation
{
    public class NotificationRepository : INotificationRepository
    {
        private readonly ApplicationDbContext _context;

        public NotificationRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Notification?> GetByIdAsync(int id)
        {
            return await _context.Notifications
                .Include(n => n.Chat)
                .Include(n => n.Message)
                .Include(n => n.BaseMember)
                .FirstOrDefaultAsync(n => n.Id == id);
        }

        public async Task<Notification> UpdateAsync(Notification notification)
        {
            
            _context.Notifications.Update(notification);
            await _context.SaveChangesAsync();
            return notification;
        }

        public async Task<List<Notification>> GetUserNotificationsAsync(int userId, bool unreadOnly = false)
        {
            var query = _context.Notifications
                .Where(n => n.BaseMemberId == userId)
                .Include(n => n.Chat)
                .Include(n => n.Message)
                .Include(n => n.BaseMember)
                .OrderByDescending(n => n.CreatedAt);

            if (unreadOnly)
            {
                query = query.Where(n => !n.IsRead) as IOrderedQueryable<Notification>;
            }

            return await query.ToListAsync();
        }

        public async Task<Notification> CreateAsync(Notification notification)
        {
            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();
            return notification;
        }

        public async Task MarkAsReadAsync(int notificationId)
        {
            var notification = await _context.Notifications.FindAsync(notificationId);
            if (notification != null)
            {
                notification.IsRead = true;
                notification.ReadAt = DateTime.UtcNow;
         
                await _context.SaveChangesAsync();
            }
        }

        public async Task MarkAllAsReadAsync(int userId)
        {
            var notifications = await _context.Notifications
                .Where(n => n.BaseMemberId == userId && !n.IsRead)
                .ToListAsync();

            foreach (var notification in notifications)
            {
                notification.IsRead = true;
                notification.ReadAt = DateTime.UtcNow;
             
            }

            await _context.SaveChangesAsync();
        }

        public async Task<bool> DeleteAsync(int notificationId)
        {
            var notification = await _context.Notifications.FindAsync(notificationId);
            if (notification == null)
                return false;

            _context.Notifications.Remove(notification);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<int> GetUnreadCountAsync(int userId)
        {
            return await _context.Notifications
                .CountAsync(n => n.BaseMemberId == userId && !n.IsRead);
        }

        public async Task<List<Notification>> GetRecentNotificationsAsync(int userId, int count = 10)
        {
            return await _context.Notifications
                .Where(n => n.BaseMemberId == userId)
                .Include(n => n.Chat)
                .Include(n => n.Message)
                .Include(n => n.BaseMember)
                .OrderByDescending(n => n.CreatedAt)
                .Take(count)
                .ToListAsync();
        }
    }
}