using Microsoft.EntityFrameworkCore;
using Realstate_servcices.Server.Data;
using Realstate_servcices.Server.Entity.landingpage.announcementconfig;

namespace Realstate_servcices.Server.Repository.ContentLandingPage
{
    public interface IAnnouncementRepository
    {
        Task<IEnumerable<AnnouncementConfig>> GetAllActiveAsync();
        Task<IEnumerable<AnnouncementConfig>> GetAllAsync();
        Task<AnnouncementConfig?> GetByIdAsync(int id);
        Task<AnnouncementConfig> CreateAsync(AnnouncementConfig announcement);
        Task<AnnouncementConfig> UpdateAsync(AnnouncementConfig announcement);
        Task<bool> DeleteAsync(int id);
        Task<bool> ToggleStatusAsync(int id, bool isActive);
    }
    public class AnnouncementRepository : IAnnouncementRepository
    {
        private readonly ApplicationDbContext _context;

        public AnnouncementRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<AnnouncementConfig>> GetAllActiveAsync()
        {
            return await _context.Announcements
                .Where(a => a.IsActive)
                .OrderBy(a => a.DisplayOrder)
                .ThenBy(a => a.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<AnnouncementConfig>> GetAllAsync()
        {
            return await _context.Announcements
                .OrderBy(a => a.DisplayOrder)
                .ThenBy(a => a.CreatedAt)
                .ToListAsync();
        }

        public async Task<AnnouncementConfig?> GetByIdAsync(int id)
        {
            return await _context.Announcements.FindAsync(id);
        }

        public async Task<AnnouncementConfig> CreateAsync(AnnouncementConfig announcement)
        {
            _context.Announcements.Add(announcement);
            await _context.SaveChangesAsync();
            return announcement;
        }

        public async Task<AnnouncementConfig> UpdateAsync(AnnouncementConfig announcement)
        {
            announcement.UpdatedAt = DateTime.UtcNow;
            _context.Announcements.Update(announcement);
            await _context.SaveChangesAsync();
            return announcement;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var announcement = await _context.Announcements.FindAsync(id);
            if (announcement == null) return false;

            _context.Announcements.Remove(announcement);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ToggleStatusAsync(int id, bool isActive)
        {
            var announcement = await _context.Announcements.FindAsync(id);
            if (announcement == null) return false;

            announcement.IsActive = isActive;
            announcement.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
