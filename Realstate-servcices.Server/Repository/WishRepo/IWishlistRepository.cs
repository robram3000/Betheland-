using Realstate_servcices.Server.Dto.Wishlist;
using Realstate_servcices.Server.Entity.Properties;

namespace Realstate_servcices.Server.Repository.WishRepo
{
    public interface IWishlistRepository
    {
        Task<WishlistProperties?> GetByIdAsync(int id);
        Task<WishlistProperties?> GetByClientAndPropertyAsync(int clientId, int propertyId);
        Task<IEnumerable<WishlistProperties>> GetByClientIdAsync(int clientId);
        Task<IEnumerable<WishlistDetailDto>> GetDetailedByClientIdAsync(int clientId);
        Task<WishlistProperties> CreateAsync(WishlistProperties wishlist);
        Task<WishlistProperties?> UpdateAsync(int id, UpdateWishlistDto updateDto);
        Task<bool> DeleteAsync(int id);
        Task<bool> ExistsAsync(int clientId, int propertyId);
        Task<int> GetCountByClientIdAsync(int clientId);
    }
}
