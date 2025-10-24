using Realstate_servcices.Server.Dto.Wishlist;
using Realstate_servcices.Server.Entity.Properties;

namespace Realstate_servcices.Server.Repository.WishRepo
{
    /// <summary>
    /// Interface for Wishlist repository operations
    /// Defines contract for wishlist data access and management
    /// </summary>
    public interface IWishlistRepository
    {
        /// <summary>
        /// Retrieves a wishlist item by its unique identifier
        /// </summary>
        /// <param name="id">The unique ID of the wishlist item</param>
        /// <returns>WishlistProperties entity if found, null otherwise</returns>
        Task<WishlistProperties?> GetByIdAsync(int id);

        /// <summary>
        /// Retrieves a wishlist item by client ID and property ID combination
        /// </summary>
        /// <param name="clientId">The ID of the client</param>
        /// <param name="propertyId">The ID of the property</param>
        /// <returns>WishlistProperties entity if found, null otherwise</returns>
        Task<WishlistProperties?> GetByClientAndPropertyAsync(int clientId, int propertyId);

        /// <summary>
        /// Retrieves all wishlist items for a specific client
        /// </summary>
        /// <param name="clientId">The ID of the client</param>
        /// <returns>Collection of WishlistProperties entities for the client</returns>
        Task<IEnumerable<WishlistProperties>> GetByClientIdAsync(int clientId);

        /// <summary>
        /// Retrieves detailed wishlist information for a specific client including property details and images
        /// </summary>
        /// <param name="clientId">The ID of the client</param>
        /// <returns>Collection of WishlistDetailDto objects with comprehensive wishlist data</returns>
        Task<IEnumerable<WishlistDetailDto>> GetDetailedByClientIdAsync(int clientId);

        /// <summary>
        /// Creates a new wishlist item
        /// </summary>
        /// <param name="wishlist">The WishlistProperties entity to create</param>
        /// <returns>Newly created WishlistProperties entity</returns>
        Task<WishlistProperties> CreateAsync(WishlistProperties wishlist);

        /// <summary>
        /// Updates an existing wishlist item
        /// </summary>
        /// <param name="id">The ID of the wishlist item to update</param>
        /// <param name="updateDto">Data transfer object containing updated wishlist information</param>
        /// <returns>Updated WishlistProperties entity if found, null otherwise</returns>
        Task<WishlistProperties?> UpdateAsync(int id, UpdateWishlistDto updateDto);

        /// <summary>
        /// Deletes a wishlist item
        /// </summary>
        /// <param name="id">The ID of the wishlist item to delete</param>
        /// <returns>True if deletion was successful, false if item was not found</returns>
        Task<bool> DeleteAsync(int id);

        /// <summary>
        /// Checks if a wishlist item exists for the given client and property combination
        /// </summary>
        /// <param name="clientId">The ID of the client</param>
        /// <param name="propertyId">The ID of the property</param>
        /// <returns>True if wishlist item exists, false otherwise</returns>
        Task<bool> ExistsAsync(int clientId, int propertyId);

        /// <summary>
        /// Gets the count of wishlist items for a specific client
        /// </summary>
        /// <param name="clientId">The ID of the client</param>
        /// <returns>The number of wishlist items for the client</returns>
        Task<int> GetCountByClientIdAsync(int clientId);
    }
}