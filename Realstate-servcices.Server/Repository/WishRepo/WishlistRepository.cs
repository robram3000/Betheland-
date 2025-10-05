using Realstate_servcices.Server.Data;
using Realstate_servcices.Server.Entity.Properties;
using Microsoft.EntityFrameworkCore;
using Realstate_servcices.Server.Dto.Wishlist;

namespace Realstate_servcices.Server.Repository.WishRepo
{
    public class WishlistRepository : IWishlistRepository
    {
        private readonly ApplicationDbContext _context;

        public WishlistRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<WishlistProperties?> GetByIdAsync(int id)
        {
            return await _context.Wishlists
                .Include(w => w.Client)
                .Include(w => w.Property)
                .FirstOrDefaultAsync(w => w.Id == id);
        }

        public async Task<WishlistProperties?> GetByClientAndPropertyAsync(int clientId, int propertyId)
        {
            return await _context.Wishlists
                .FirstOrDefaultAsync(w => w.ClientId == clientId && w.PropertyId == propertyId);
        }

        public async Task<IEnumerable<WishlistProperties>> GetByClientIdAsync(int clientId)
        {
            return await _context.Wishlists
                .Where(w => w.ClientId == clientId)
                .Include(w => w.Property)
                .OrderByDescending(w => w.AddedDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<WishlistDetailDto>> GetDetailedByClientIdAsync(int clientId)
        {
            return await _context.Wishlists
                .Where(w => w.ClientId == clientId)
                .Include(w => w.Client)
                .Include(w => w.Property)
                    .ThenInclude(p => p.PropertyImages)
                .OrderByDescending(w => w.AddedDate)
                .Select(w => new WishlistDetailDto
                {
                    Id = w.Id,
                    WishlistNo = w.WishlistNo,
                    ClientId = w.ClientId,
                    ClientName = $"{w.Client.FirstName} {w.Client.LastName}",
                    PropertyId = w.PropertyId,
                    PropertyTitle = w.Property.Title,
                    PropertyPrice = w.Property.Price,
                    PropertyAddress = $"{w.Property.Address}, {w.Property.City}, {w.Property.State}",
                    PropertyStatus = w.Property.Status,
                    AddedDate = w.AddedDate,
                    Notes = w.Notes,
                    PropertyImages = w.Property.PropertyImages != null ?
                        w.Property.PropertyImages.Select(pi => pi.ImageUrl).ToList() :
                        new List<string>()
                })
                .ToListAsync();
        }

        public async Task<WishlistProperties> CreateAsync(WishlistProperties wishlist)
        {
            _context.Wishlists.Add(wishlist);
            await _context.SaveChangesAsync();
            return wishlist;
        }

        public async Task<WishlistProperties?> UpdateAsync(int id, UpdateWishlistDto updateDto)
        {
            var wishlist = await _context.Wishlists.FindAsync(id);
            if (wishlist == null)
                return null;

            wishlist.Notes = updateDto.Notes;

            await _context.SaveChangesAsync();
            return wishlist;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var wishlist = await _context.Wishlists.FindAsync(id);
            if (wishlist == null)
                return false;

            _context.Wishlists.Remove(wishlist);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsAsync(int clientId, int propertyId)
        {
            return await _context.Wishlists
                .AnyAsync(w => w.ClientId == clientId && w.PropertyId == propertyId);
        }

        public async Task<int> GetCountByClientIdAsync(int clientId)
        {
            return await _context.Wishlists
                .CountAsync(w => w.ClientId == clientId);
        }
    }
}
