using Microsoft.EntityFrameworkCore;
using Realstate_servcices.Server.Data;
using Realstate_servcices.Server.Dto.Property;
using Realstate_servcices.Server.Dto.Wishlist;
using Realstate_servcices.Server.Entity.member;
using Realstate_servcices.Server.Entity.Properties;
using Realstate_servcices.Server.Repository.WishRepo;


namespace Realstate_servcices.Server.Services.Wishlist
{
    public class WishlistService : IWishlistService
    {
        private readonly IWishlistRepository _wishlistRepository;
        private readonly ApplicationDbContext _context;

        public WishlistService(IWishlistRepository wishlistRepository , ApplicationDbContext context)
        {
            _wishlistRepository = wishlistRepository;
            _context = context; 
        }

        public async Task<WishlistDto?> GetWishlistItemAsync(int id)
        {
            var wishlist = await _wishlistRepository.GetByIdAsync(id);
            return wishlist != null ? EntityToDto(wishlist) : null;
        }

        public async Task<IEnumerable<WishlistDetailDto>> GetClientWishlistAsync(int clientId)
        {
            return await _wishlistRepository.GetDetailedByClientIdAsync(clientId);
        }

        public async Task<WishlistDto> AddToWishlistAsync(CreateWishlistDto createDto)
        {
            // Validate client exists
            var clientExists = await _context.Clients.AnyAsync(c => c.Id == createDto.ClientId);
            if (!clientExists)
            {
                throw new ArgumentException($"Client with ID {createDto.ClientId} does not exist");
            }

            // Validate property exists
            var propertyExists = await _context.Properties.AnyAsync(p => p.Id == createDto.PropertyId);
            if (!propertyExists)
            {
                throw new ArgumentException($"Property with ID {createDto.PropertyId} does not exist");
            }

            // Check if already in wishlist
            var existing = await _wishlistRepository.GetByClientAndPropertyAsync(createDto.ClientId, createDto.PropertyId);
            if (existing != null)
            {
                return EntityToDto(existing);
            }

            var wishlist = new WishlistProperties
            {
                ClientId = createDto.ClientId,
                PropertyId = createDto.PropertyId,
                Notes = createDto.Notes,
                AddedDate = DateTime.UtcNow
            };

            var created = await _wishlistRepository.CreateAsync(wishlist);
            return EntityToDto(created);
        }

        public async Task<WishlistDto?> UpdateWishlistItemAsync(int id, UpdateWishlistDto updateDto)
        {
            var updated = await _wishlistRepository.UpdateAsync(id, updateDto);
            return updated != null ? EntityToDto(updated) : null;
        }

        public async Task<bool> RemoveFromWishlistAsync(int id)
        {
            return await _wishlistRepository.DeleteAsync(id);
        }

        public async Task<bool> IsPropertyInWishlistAsync(int clientId, int propertyId)
        {
            return await _wishlistRepository.ExistsAsync(clientId, propertyId);
        }

        public async Task<int> GetWishlistCountAsync(int clientId)
        {
            return await _wishlistRepository.GetCountByClientIdAsync(clientId);
        }

        private static WishlistDto EntityToDto(WishlistProperties wishlist)
        {
            return new WishlistDto
            {
                Id = wishlist.Id,
                WishlistNo = wishlist.WishlistNo,
                ClientId = wishlist.ClientId,
                PropertyId = wishlist.PropertyId,
                AddedDate = wishlist.AddedDate,
                Notes = wishlist.Notes
            };
        }
    }
}