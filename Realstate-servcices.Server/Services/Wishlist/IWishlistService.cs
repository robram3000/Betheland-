using Realstate_servcices.Server.Dto.Wishlist;

namespace Realstate_servcices.Server.Services.Wishlist
{
    public interface IWishlistService
    {
        Task<WishlistDto?> GetWishlistItemAsync(int id);
        Task<IEnumerable<WishlistDetailDto>> GetClientWishlistAsync(int clientId);
        Task<WishlistDto> AddToWishlistAsync(CreateWishlistDto createDto);
        Task<WishlistDto?> UpdateWishlistItemAsync(int id, UpdateWishlistDto updateDto);
        Task<bool> RemoveFromWishlistAsync(int id);
        Task<bool> IsPropertyInWishlistAsync(int clientId, int propertyId);
        Task<int> GetWishlistCountAsync(int clientId);
    }
}
