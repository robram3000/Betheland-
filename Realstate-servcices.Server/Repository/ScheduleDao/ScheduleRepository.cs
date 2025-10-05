//// ScheduleRepository.cs
//using Microsoft.EntityFrameworkCore;
//using Realstate_servcices.Server.Data;
//using Realstate_servcices.Server.Entity.Properties;

//namespace Realstate_servcices.Server.Repository.ScheduleDao
//{
//    public class SchedulePropertiesRepository : ISchedulePropertiesRepository
//    {
//        private readonly ApplicationDbContext _context;

//        public SchedulePropertiesRepository(ApplicationDbContext context)
//        {
//            _context = context;
//        }

//        public async Task<ScheduleProperties?> GetByIdAsync(int id)
//        {
//            return await _context.ScheduleProperties
//                .Include(s => s.Property)
//                    .ThenInclude(p => p.PropertyImages)
//                .Include(s => s.Agent)
//                .Include(s => s.Client)
//                .FirstOrDefaultAsync(s => s.Id == id);
//        }

//        public async Task<IEnumerable<ScheduleProperties>> GetByClientIdAsync(int clientId)
//        {
//            return await _context.ScheduleProperties
//                .Include(s => s.Property)
//                    .ThenInclude(p => p.PropertyImages)
//                .Include(s => s.Agent)
//                .Include(s => s.Client)
//                .Where(s => s.ClientId == clientId)
//                .OrderByDescending(s => s.ScheduleTime)
//                .ToListAsync();
//        }

//        public async Task<IEnumerable<ScheduleProperties>> GetByAgentIdAsync(int agentId)
//        {
//            return await _context.ScheduleProperties
//                .Include(s => s.Property)
//                    .ThenInclude(p => p.PropertyImages)
//                .Include(s => s.Agent)
//                .Include(s => s.Client)
//                .Where(s => s.AgentId == agentId)
//                .OrderByDescending(s => s.ScheduleTime)
//                .ToListAsync();
//        }

//        public async Task<IEnumerable<ScheduleProperties>> GetByPropertyIdAsync(int propertyId)
//        {
//            return await _context.ScheduleProperties
//                .Include(s => s.Property)
//                .Include(s => s.Agent)
//                .Include(s => s.Client)
//                .Where(s => s.PropertyId == propertyId)
//                .OrderByDescending(s => s.ScheduleTime)
//                .ToListAsync();
//        }

//        public async Task<IEnumerable<ScheduleProperties>> GetSchedulesByDateAsync(DateTime date)
//        {
//            var startDate = date.Date;
//            var endDate = startDate.AddDays(1);

//            return await _context.ScheduleProperties
//                .Include(s => s.Property)
//                .Include(s => s.Agent)
//                .Include(s => s.Client)
//                .Where(s => s.ScheduleTime >= startDate && s.ScheduleTime < endDate)
//                .OrderBy(s => s.ScheduleTime)
//                .ToListAsync();
//        }

//        public async Task<IEnumerable<ScheduleProperties>> GetUpcomingSchedulesAsync(int days = 7)
//        {
//            var startDate = DateTime.UtcNow;
//            var endDate = startDate.AddDays(days);

//            return await _context.ScheduleProperties
//                .Include(s => s.Property)
//                    .ThenInclude(p => p.PropertyImages)
//                .Include(s => s.Agent)
//                .Include(s => s.Client)
//                .Where(s => s.ScheduleTime >= startDate && s.ScheduleTime <= endDate)
//                .OrderBy(s => s.ScheduleTime)
//                .ToListAsync();
//        }

//        public async Task<ScheduleProperties> AddAsync(ScheduleProperties schedule)
//        {
//            _context.ScheduleProperties.Add(schedule);
//            await _context.SaveChangesAsync();
//            return schedule;
//        }

//        public async Task UpdateAsync(ScheduleProperties schedule)
//        {
//            schedule.UpdatedAt = DateTime.UtcNow;
//            _context.ScheduleProperties.Update(schedule);
//            await _context.SaveChangesAsync();
//        }

//        public async Task DeleteAsync(int id)
//        {
//            var schedule = await _context.ScheduleProperties.FindAsync(id);
//            if (schedule != null)
//            {
//                _context.ScheduleProperties.Remove(schedule);
//                await _context.SaveChangesAsync();
//            }
//        }

//        public async Task<bool> ExistsAsync(int propertyId, int clientId, DateTime scheduleTime)
//        {
//            return await _context.ScheduleProperties
//                .AnyAsync(s => s.PropertyId == propertyId &&
//                              s.ClientId == clientId &&
//                              s.ScheduleTime.Date == scheduleTime.Date);
//        }

//        public async Task<int> GetScheduleCountByStatusAsync(string status)
//        {
//            return await _context.ScheduleProperties
//                .CountAsync(s => s.Status == status);
//        }
//    }
//}