using Realstate_servcices.Server.Data;
using Realstate_servcices.Server.Entity.Properties;
using Microsoft.EntityFrameworkCore;
using Realstate_servcices.Server.Dto.Wishlist;

namespace Realstate_servcices.Server.Repository.WishRepo
{
    /// <summary>
    /// Repository for managing Wishlist entities in the database
    /// Implements IWishlistRepository interface for wishlist operations
    /// </summary>
    public class WishlistRepository : IWishlistRepository
    {
        private readonly ApplicationDbContext _context;

        /// <summary>
        /// Initializes a new instance of WishlistRepository
        /// </summary>
        /// <param name="context">The application database context for data access</param>
        public WishlistRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Retrieves a wishlist item by its unique identifier
        /// </summary>
        /// <param name="id">The unique ID of the wishlist item</param>
        /// <returns>WishlistProperties entity if found, null otherwise</returns>
        public async Task<WishlistProperties?> GetByIdAsync(int id)
        {
            return await _context.Wishlists
                .Include(w => w.Client)
                .Include(w => w.Property)
                .FirstOrDefaultAsync(w => w.Id == id);
        }

        /// <summary>
        /// Retrieves a wishlist item by client ID and property ID combination
        /// </summary>
        /// <param name="clientId">The ID of the client</param>
        /// <param name="propertyId">The ID of the property</param>
        /// <returns>WishlistProperties entity if found, null otherwise</returns>
        public async Task<WishlistProperties?> GetByClientAndPropertyAsync(int clientId, int propertyId)
        {
            return await _context.Wishlists
                .FirstOrDefaultAsync(w => w.ClientId == clientId && w.PropertyId == propertyId);
        }

        /// <summary>
        /// Retrieves all wishlist items for a specific client
        /// </summary>
        /// <param name="clientId">The ID of the client</param>
        /// <returns>Collection of WishlistProperties entities for the client</returns>
        public async Task<IEnumerable<WishlistProperties>> GetByClientIdAsync(int clientId)
        {
            return await _context.Wishlists
                .Where(w => w.ClientId == clientId)
                .Include(w => w.Property)
                .OrderByDescending(w => w.AddedDate)
                .ToListAsync();
        }

        /// <summary>
        /// Retrieves detailed wishlist information for a specific client including property details and images
        /// </summary>
        /// <param name="clientId">The ID of the client</param>
        /// <returns>Collection of WishlistDetailDto objects with comprehensive wishlist data</returns>
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

        /// <summary>
        /// Creates a new wishlist item
        /// </summary>
        /// <param name="wishlist">The WishlistProperties entity to create</param>
        /// <returns>Newly created WishlistProperties entity</returns>
        public async Task<WishlistProperties> CreateAsync(WishlistProperties wishlist)
        {
            _context.Wishlists.Add(wishlist);
            await _context.SaveChangesAsync();
            return wishlist;
        }

        /// <summary>
        /// Updates an existing wishlist item
        /// </summary>
        /// <param name="id">The ID of the wishlist item to update</param>
        /// <param name="updateDto">Data transfer object containing updated wishlist information</param>
        /// <returns>Updated WishlistProperties entity if found, null otherwise</returns>
        public async Task<WishlistProperties?> UpdateAsync(int id, UpdateWishlistDto updateDto)
        {
            var wishlist = await _context.Wishlists.FindAsync(id);
            if (wishlist == null)
                return null;

            wishlist.Notes = updateDto.Notes;

            await _context.SaveChangesAsync();
            return wishlist;
        }

        /// <summary>
        /// Deletes a wishlist item
        /// </summary>
        /// <param name="id">The ID of the wishlist item to delete</param>
        /// <returns>True if deletion was successful, false if item was not found</returns>
        public async Task<bool> DeleteAsync(int id)
        {
            var wishlist = await _context.Wishlists.FindAsync(id);
            if (wishlist == null)
                return false;

            _context.Wishlists.Remove(wishlist);
            await _context.SaveChangesAsync();
            return true;
        }

        /// <summary>
        /// Checks if a wishlist item exists for the given client and property combination
        /// </summary>
        /// <param name="clientId">The ID of the client</param>
        /// <param name="propertyId">The ID of the property</param>
        /// <returns>True if wishlist item exists, false otherwise</returns>
        public async Task<bool> ExistsAsync(int clientId, int propertyId)
        {
            return await _context.Wishlists
                .AnyAsync(w => w.ClientId == clientId && w.PropertyId == propertyId);
        }

        /// <summary>
        /// Gets the count of wishlist items for a specific client
        /// </summary>
        /// <param name="clientId">The ID of the client</param>
        /// <returns>The number of wishlist items for the client</returns>
        public async Task<int> GetCountByClientIdAsync(int clientId)
        {
            return await _context.Wishlists
                .CountAsync(w => w.ClientId == clientId);
        }
    }
}