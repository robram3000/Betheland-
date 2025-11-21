using Microsoft.EntityFrameworkCore;
using Realstate_servcices.Server.Data;
using Realstate_servcices.Server.Dto.Scheduling;
using Realstate_servcices.Server.Entity.Ratings;


namespace Realstate_servcices.Server.Repository.ScheduleDao
{
    public interface IRatingSchedulesRepository
    {
        Task<RatingSchedule?> GetByIdAsync(int id);
        Task<IEnumerable<RatingSchedule>> GetAllAsync();
        Task<IEnumerable<RatingSchedule>> GetByAgentIdAsync(int agentId);
        Task<IEnumerable<RatingSchedule>> GetByClientIdAsync(int clientId);
        Task<IEnumerable<RatingSchedule>> GetByScheduleIdAsync(int scheduleId);
        Task<RatingSchedule> CreateAsync(RatingSchedule ratingSchedule);
        Task<RatingSchedule> UpdateAsync(RatingSchedule ratingSchedule);
        Task<bool> DeleteAsync(int id);
        Task<bool> ExistsForScheduleAsync(int scheduleId);
        Task<RatingSummaryDto> GetRatingSummaryAsync(int agentId);
        Task<double?> GetAverageRatingAsync(int agentId);
    }
    public class RatingSchedulesRepository : IRatingSchedulesRepository
    {
        private readonly ApplicationDbContext _context;

        public RatingSchedulesRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<RatingSchedule?> GetByIdAsync(int id)
        {
            return await _context.RatingSchedules
                .Include(r => r.Schedule)
                .Include(r => r.Agent)
                .Include(r => r.Client)
                .FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task<IEnumerable<RatingSchedule>> GetAllAsync()
        {
            return await _context.RatingSchedules
                .Include(r => r.Schedule)
                .Include(r => r.Agent)
                .Include(r => r.Client)
                .Where(r => r.IsVisible && r.Status == "Active")
                .ToListAsync();
        }

        public async Task<IEnumerable<RatingSchedule>> GetByAgentIdAsync(int agentId)
        {
            return await _context.RatingSchedules
                .Include(r => r.Schedule)
                .Include(r => r.Client)
                .Where(r => r.AgentId == agentId && r.IsVisible && r.Status == "Active")
                .ToListAsync();
        }

        public async Task<IEnumerable<RatingSchedule>> GetByClientIdAsync(int clientId)
        {
            return await _context.RatingSchedules
                .Include(r => r.Schedule)
                .Include(r => r.Agent)
                .Where(r => r.ClientId == clientId && r.IsVisible && r.Status == "Active")
                .ToListAsync();
        }

        public async Task<IEnumerable<RatingSchedule>> GetByScheduleIdAsync(int scheduleId)
        {
            return await _context.RatingSchedules
                .Include(r => r.Agent)
                .Include(r => r.Client)
                .Where(r => r.ScheduleId == scheduleId && r.IsVisible && r.Status == "Active")
                .ToListAsync();
        }

        public async Task<RatingSchedule> CreateAsync(RatingSchedule ratingSchedule)
        {
            _context.RatingSchedules.Add(ratingSchedule);
            await _context.SaveChangesAsync();
            return ratingSchedule;
        }

        public async Task<RatingSchedule> UpdateAsync(RatingSchedule ratingSchedule)
        {
            ratingSchedule.UpdatedAt = DateTime.UtcNow;
            _context.RatingSchedules.Update(ratingSchedule);
            await _context.SaveChangesAsync();
            return ratingSchedule;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var rating = await _context.RatingSchedules.FindAsync(id);
            if (rating == null) return false;

            _context.RatingSchedules.Remove(rating);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsForScheduleAsync(int scheduleId)
        {
            return await _context.RatingSchedules
                .AnyAsync(r => r.ScheduleId == scheduleId && r.Status == "Active");
        }

        public async Task<RatingSummaryDto> GetRatingSummaryAsync(int agentId)
        {
            var ratings = await _context.RatingSchedules
                .Where(r => r.AgentId == agentId && r.IsVisible && r.Status == "Active")
                .ToListAsync();

            var summary = new RatingSummaryDto
            {
                AgentId = agentId,
                TotalRatings = ratings.Count,
                AverageRating = ratings.Any() ? ratings.Average(r => r.Rating) : 0,
                FiveStar = ratings.Count(r => r.Rating == 5),
                FourStar = ratings.Count(r => r.Rating == 4),
                ThreeStar = ratings.Count(r => r.Rating == 3),
                TwoStar = ratings.Count(r => r.Rating == 2),
                OneStar = ratings.Count(r => r.Rating == 1)
            };

            return summary;
        }

        public async Task<double?> GetAverageRatingAsync(int agentId)
        {
            var ratings = await _context.RatingSchedules
                .Where(r => r.AgentId == agentId && r.IsVisible && r.Status == "Active")
                .Select(r => r.Rating)
                .ToListAsync();

            return ratings.Any() ? ratings.Average() : null;
        }
    }
}
