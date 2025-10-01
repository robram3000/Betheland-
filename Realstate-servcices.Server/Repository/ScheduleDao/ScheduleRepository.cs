using Realstate_servcices.Server.Data;
using Realstate_servcices.Server.Entity.Properties;

namespace Realstate_servcices.Server.Repository.ScheduleDao
{
    public class ScheduleRepository : IScheduleRepository
    {
        private readonly ApplicationDbContext _context;

        public ScheduleRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ScheduleProperties?> GetByIdAsync(int id)
        {
            return await _context.ScheduleProperties
                .Include(s => s.Property)
                .Include(s => s.Agent)
                .Include(s => s.Client)
                .FirstOrDefaultAsync(s => s.Id == id);
        }

        public async Task<ScheduleProperties?> GetByScheduleNoAsync(Guid scheduleNo)
        {
            return await _context.ScheduleProperties
                .Include(s => s.Property)
                .Include(s => s.Agent)
                .Include(s => s.Client)
                .FirstOrDefaultAsync(s => s.ScheduleNo == scheduleNo);
        }

        public async Task<IEnumerable<ScheduleProperties>> GetAllAsync()
        {
            return await _context.ScheduleProperties
                .Include(s => s.Property)
                .Include(s => s.Agent)
                .Include(s => s.Client)
                .OrderByDescending(s => s.ScheduleTime)
                .ToListAsync();
        }

        public async Task<IEnumerable<ScheduleProperties>> GetByAgentIdAsync(int agentId)
        {
            return await _context.ScheduleProperties
                .Include(s => s.Property)
                .Include(s => s.Client)
                .Where(s => s.AgentId == agentId)
                .OrderByDescending(s => s.ScheduleTime)
                .ToListAsync();
        }

        public async Task<IEnumerable<ScheduleProperties>> GetByClientIdAsync(int clientId)
        {
            return await _context.ScheduleProperties
                .Include(s => s.Property)
                .Include(s => s.Agent)
                .Where(s => s.ClientId == clientId)
                .OrderByDescending(s => s.ScheduleTime)
                .ToListAsync();
        }

        public async Task<IEnumerable<ScheduleProperties>> GetByPropertyIdAsync(int propertyId)
        {
            return await _context.ScheduleProperties
                .Include(s => s.Agent)
                .Include(s => s.Client)
                .Where(s => s.PropertyId == propertyId)
                .OrderByDescending(s => s.ScheduleTime)
                .ToListAsync();
        }

        public async Task<IEnumerable<ScheduleProperties>> GetSchedulesByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            return await _context.ScheduleProperties
                .Include(s => s.Property)
                .Include(s => s.Agent)
                .Include(s => s.Client)
                .Where(s => s.ScheduleTime >= startDate && s.ScheduleTime <= endDate)
                .OrderBy(s => s.ScheduleTime)
                .ToListAsync();
        }

        public async Task<IEnumerable<ScheduleProperties>> GetSchedulesByStatusAsync(string status)
        {
            return await _context.ScheduleProperties
                .Include(s => s.Property)
                .Include(s => s.Agent)
                .Include(s => s.Client)
                .Where(s => s.Status == status)
                .OrderByDescending(s => s.ScheduleTime)
                .ToListAsync();
        }

        public async Task<ScheduleProperties> CreateAsync(ScheduleProperties schedule)
        {
            schedule.CreatedAt = DateTime.UtcNow;
            _context.ScheduleProperties.Add(schedule);
            await _context.SaveChangesAsync();
            return schedule;
        }

        public async Task<ScheduleProperties?> UpdateAsync(int id, ScheduleProperties schedule)
        {
            var existingSchedule = await _context.ScheduleProperties.FindAsync(id);
            if (existingSchedule == null)
                return null;

            existingSchedule.ScheduleTime = schedule.ScheduleTime;
            existingSchedule.Status = schedule.Status;
            existingSchedule.Notes = schedule.Notes;
            existingSchedule.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return existingSchedule;
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
            return await _context.ScheduleProperties.AnyAsync(s => s.Id == id);
        }

        public async Task<bool> IsTimeSlotAvailableAsync(int agentId, DateTime scheduleTime, int? excludeScheduleId = null)
        {
            // Check if agent has any schedule within 1 hour of the requested time
            var startTime = scheduleTime.AddHours(-1);
            var endTime = scheduleTime.AddHours(1);

            var query = _context.ScheduleProperties
                .Where(s => s.AgentId == agentId &&
                           s.ScheduleTime >= startTime &&
                           s.ScheduleTime <= endTime &&
                           s.Status != "Cancelled");

            if (excludeScheduleId.HasValue)
            {
                query = query.Where(s => s.Id != excludeScheduleId.Value);
            }

            return !await query.AnyAsync();
        }
    }
}
