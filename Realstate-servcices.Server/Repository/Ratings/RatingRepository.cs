using Microsoft.EntityFrameworkCore;
using Realstate_servcices.Server.Data;
using Realstate_servcices.Server.Entity.Chat;

namespace Realstate_servcices.Server.Repository.Ratings
{
    public interface IRatingRepository
    {
        Task<Rating?> GetByIdAsync(int id);
        Task<IEnumerable<Rating>> GetAllAsync();
        Task<IEnumerable<Rating>> GetByRaterIdAsync(int raterId);
        Task<IEnumerable<Rating>> GetByRatedIdAsync(int ratedId);
        Task<Rating> AddAsync(Rating rating);
        Task<Rating> UpdateAsync(Rating rating);
        Task<bool> DeleteAsync(int id);
        Task<double> GetAverageRatingAsync(int ratedId);
        Task<int> GetRatingCountAsync(int ratedId);
        Task<bool> HasUserRatedAsync(int raterId, int ratedId, string? propertyId = null);
    }
    public class RatingRepository : IRatingRepository
    {
        private readonly ApplicationDbContext _context;

        public RatingRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Rating?> GetByIdAsync(int id)
        {
            return await _context.Ratings
                .Include(r => r.Rater)
                .Include(r => r.Rated)
                .Include(r => r.Agent)
                .Include(r => r.Client)
                .FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task<IEnumerable<Rating>> GetAllAsync()
        {
            return await _context.Ratings
                .Include(r => r.Rater)
                .Include(r => r.Rated)
                .Include(r => r.Agent)
                .Include(r => r.Client)
                .Where(r => r.IsVisible)
                .ToListAsync();
        }

        public async Task<IEnumerable<Rating>> GetByRaterIdAsync(int raterId)
        {
            return await _context.Ratings
                .Include(r => r.Rater)
                .Include(r => r.Rated)
                .Where(r => r.RaterId == raterId && r.IsVisible)
                .ToListAsync();
        }

        public async Task<IEnumerable<Rating>> GetByRatedIdAsync(int ratedId)
        {
            return await _context.Ratings
                .Include(r => r.Rater)
                .Include(r => r.Rated)
                .Where(r => r.RatedId == ratedId && r.IsVisible)
                .ToListAsync();
        }

        public async Task<Rating> AddAsync(Rating rating)
        {
            _context.Ratings.Add(rating);
            await _context.SaveChangesAsync();
            return rating;
        }

        public async Task<Rating> UpdateAsync(Rating rating)
        {
            rating.UpdatedAt = DateTime.UtcNow;
            _context.Ratings.Update(rating);
            await _context.SaveChangesAsync();
            return rating;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var rating = await GetByIdAsync(id);
            if (rating == null)
                return false;

            // Soft delete by setting IsVisible to false
            rating.IsVisible = false;
            rating.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<double> GetAverageRatingAsync(int ratedId)
        {
            var ratings = await _context.Ratings
                .Where(r => r.RatedId == ratedId && r.IsVisible)
                .ToListAsync();

            if (!ratings.Any())
                return 0;

            return ratings.Average(r => r.Stars);
        }

        public async Task<int> GetRatingCountAsync(int ratedId)
        {
            return await _context.Ratings
                .CountAsync(r => r.RatedId == ratedId && r.IsVisible);
        }

        public async Task<bool> HasUserRatedAsync(int raterId, int ratedId, string? propertyId = null)
        {
            var query = _context.Ratings
                .Where(r => r.RaterId == raterId && r.RatedId == ratedId && r.IsVisible);

            if (!string.IsNullOrEmpty(propertyId))
            {
                query = query.Where(r => r.PropertyId == propertyId);
            }

            return await query.AnyAsync();
        }
    }
}
