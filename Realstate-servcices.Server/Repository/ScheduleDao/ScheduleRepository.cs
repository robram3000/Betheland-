// ScheduleRepository.cs
using Microsoft.EntityFrameworkCore;
using Realstate_servcices.Server.Data;
using Realstate_servcices.Server.Entity.Properties;

namespace Realstate_servcices.Server.Repository.ScheduleDao
{
    public class SchedulingRepository : ISchedulingRepository
    {
        private readonly ApplicationDbContext _context;

        public SchedulingRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ScheduleProperties?> GetByIdAsync(int id)
        {
            return await _context.ScheduleProperties
                .Include(sp => sp.Property)
                .Include(sp => sp.Agent)
                .Include(sp => sp.Client)
                .FirstOrDefaultAsync(sp => sp.Id == id);
        }

        public async Task<IEnumerable<ScheduleProperties>> GetAllAsync()
        {
            return await _context.ScheduleProperties
                .Include(sp => sp.Property)
                .Include(sp => sp.Agent)
                .Include(sp => sp.Client)
                .OrderByDescending(sp => sp.ScheduleTime)
                .ToListAsync();
        }

        public async Task<IEnumerable<ScheduleProperties>> GetByAgentIdAsync(int agentId)
        {
            return await _context.ScheduleProperties
                .Include(sp => sp.Property)
                .Include(sp => sp.Agent)
                .Include(sp => sp.Client)
                .Where(sp => sp.AgentId == agentId)
                .OrderByDescending(sp => sp.ScheduleTime)
                .ToListAsync();
        }

        public async Task<IEnumerable<ScheduleProperties>> GetByClientIdAsync(int clientId)
        {
            return await _context.ScheduleProperties
                .Include(sp => sp.Property)
                .Include(sp => sp.Agent)
                .Include(sp => sp.Client)
                .Where(sp => sp.ClientId == clientId)
                .OrderByDescending(sp => sp.ScheduleTime)
                .ToListAsync();
        }

        public async Task<IEnumerable<ScheduleProperties>> GetByPropertyIdAsync(int propertyId)
        {
            return await _context.ScheduleProperties
                .Include(sp => sp.Property)
                .Include(sp => sp.Agent)
                .Include(sp => sp.Client)
                .Where(sp => sp.PropertyId == propertyId)
                .OrderByDescending(sp => sp.ScheduleTime)
                .ToListAsync();
        }

        public async Task<IEnumerable<ScheduleProperties>> GetSchedulesByDateAsync(DateTime date)
        {
            var startDate = date.Date;
            var endDate = startDate.AddDays(1);

            return await _context.ScheduleProperties
                .Include(sp => sp.Property)
                .Include(sp => sp.Agent)
                .Include(sp => sp.Client)
                .Where(sp => sp.ScheduleTime >= startDate && sp.ScheduleTime < endDate)
                .OrderBy(sp => sp.ScheduleTime)
                .ToListAsync();
        }

        public async Task<IEnumerable<ScheduleProperties>> GetUpcomingSchedulesAsync(int days = 7)
        {
            var startDate = DateTime.UtcNow;
            var endDate = startDate.AddDays(days);

            return await _context.ScheduleProperties
                .Include(sp => sp.Property)
                .Include(sp => sp.Agent)
                .Include(sp => sp.Client)
                .Where(sp => sp.ScheduleTime >= startDate && sp.ScheduleTime <= endDate)
                .OrderBy(sp => sp.ScheduleTime)
                .ToListAsync();
        }

        public async Task<ScheduleProperties> CreateAsync(ScheduleProperties schedule)
        {
            _context.ScheduleProperties.Add(schedule);
            await _context.SaveChangesAsync();
            return schedule;
        }

        public async Task<ScheduleProperties> UpdateAsync(ScheduleProperties schedule)
        {
            schedule.UpdatedAt = DateTime.UtcNow;
            _context.ScheduleProperties.Update(schedule);
            await _context.SaveChangesAsync();
            return schedule;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var schedule = await _context.ScheduleProperties.FindAsync(id);
            if (schedule == null)
                return false;

            _context.ScheduleProperties.Remove(schedule);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.ScheduleProperties.AnyAsync(sp => sp.Id == id);
        }

        public async Task<bool> IsTimeSlotAvailableAsync(int agentId, DateTime scheduleTime)
        {
            // Check if agent has any overlapping schedules
            var bufferTime = TimeSpan.FromMinutes(30); // 30-minute buffer
            var startTime = scheduleTime.Add(-bufferTime);
            var endTime = scheduleTime.Add(bufferTime);

            var conflictingSchedule = await _context.ScheduleProperties
                .Where(sp => sp.AgentId == agentId &&
                           sp.ScheduleTime >= startTime &&
                           sp.ScheduleTime <= endTime &&
                           sp.Status != "Cancelled")
                .FirstOrDefaultAsync();

            return conflictingSchedule == null;
        }
    }
}