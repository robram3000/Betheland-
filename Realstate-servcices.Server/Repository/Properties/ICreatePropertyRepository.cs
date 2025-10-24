using Realstate_servcices.Server.Entity.Properties;

namespace Realstate_servcices.Server.Repository.Properties
{
    /// <summary>
    /// Interface for Property repository operations
    /// Defines contract for property data access and management
    /// </summary>
    public interface ICreatePropertyRepository
    {
        /// <summary>
        /// Creates a new property in the database
        /// </summary>
        /// <param name="property">The PropertyHouse entity to create</param>
        /// <returns>Newly created PropertyHouse entity</returns>
        Task<PropertyHouse> CreatePropertyAsync(PropertyHouse property);

        /// <summary>
        /// Retrieves a property by its unique identifier
        /// </summary>
        /// <param name="id">The unique ID of the property</param>
        /// <returns>PropertyHouse entity if found, null otherwise</returns>
        Task<PropertyHouse?> GetPropertyByIdAsync(int id);

        /// <summary>
        /// Updates an existing property
        /// </summary>
        /// <param name="property">The PropertyHouse entity with updated information</param>
        /// <returns>Updated PropertyHouse entity if found, null otherwise</returns>
        Task<PropertyHouse?> UpdatePropertyAsync(PropertyHouse property);

        /// <summary>
        /// Deletes a property from the database
        /// </summary>
        /// <param name="id">The ID of the property to delete</param>
        /// <returns>True if deletion was successful, false if property was not found</returns>
        Task<bool> DeletePropertyAsync(int id);

        /// <summary>
        /// Retrieves all properties from the database
        /// </summary>
        /// <returns>Collection of all PropertyHouse entities</returns>
        Task<IEnumerable<PropertyHouse>> GetAllPropertiesAsync();

        /// <summary>
        /// Retrieves properties by owner ID
        /// </summary>
        /// <param name="ownerId">The ID of the property owner</param>
        /// <returns>Collection of PropertyHouse entities for the specified owner</returns>
        Task<IEnumerable<PropertyHouse>> GetPropertiesByOwnerIdAsync(int ownerId);

        /// <summary>
        /// Retrieves properties by agent ID
        /// </summary>
        /// <param name="agentId">The ID of the agent</param>
        /// <returns>Collection of PropertyHouse entities for the specified agent</returns>
        Task<IEnumerable<PropertyHouse>> GetPropertiesByAgentIdAsync(int agentId);

        /// <summary>
        /// Retrieves properties by status
        /// </summary>
        /// <param name="status">The status to filter by (e.g., "Available", "Sold", "Rented")</param>
        /// <returns>Collection of PropertyHouse entities with the specified status</returns>
        Task<IEnumerable<PropertyHouse>> GetPropertiesByStatusAsync(string status);

        /// <summary>
        /// Searches properties based on search term
        /// </summary>
        /// <param name="searchTerm">The term to search in title, description, address, etc.</param>
        /// <returns>Collection of PropertyHouse entities matching the search criteria</returns>
        Task<IEnumerable<PropertyHouse>> SearchPropertiesAsync(string searchTerm);

        /// <summary>
        /// Checks if a property exists with the specified ID
        /// </summary>
        /// <param name="id">The ID to check for existence</param>
        /// <returns>True if property exists, false otherwise</returns>
        Task<bool> PropertyExistsAsync(int id);

        /// <summary>
        /// Checks if an owner exists with the specified ID
        /// </summary>
        /// <param name="ownerId">The owner ID to check for existence</param>
        /// <returns>True if owner exists, false otherwise</returns>
        Task<bool> OwnerExistsAsync(int ownerId);

        /// <summary>
        /// Adds property images to an existing property
        /// </summary>
        /// <param name="propertyId">The ID of the property to add images to</param>
        /// <param name="images">List of PropertyImage entities to add</param>
        Task AddPropertyImagesAsync(int propertyId, List<PropertyImage> images);

        /// <summary>
        /// Updates property images for an existing property (replaces all existing images)
        /// </summary>
        /// <param name="propertyId">The ID of the property to update images for</param>
        /// <param name="images">List of new PropertyImage entities</param>
        Task UpdatePropertyImagesAsync(int propertyId, List<PropertyImage> images);

        /// <summary>
        /// Adds property videos to an existing property
        /// </summary>
        /// <param name="propertyId">The ID of the property to add videos to</param>
        /// <param name="videos">List of PropertyVideo entities to add</param>
        Task AddPropertyVideosAsync(int propertyId, List<PropertyVideo> videos);

        /// <summary>
        /// Updates property videos for an existing property (replaces all existing videos)
        /// </summary>
        /// <param name="propertyId">The ID of the property to update videos for</param>
        /// <param name="videos">List of new PropertyVideo entities</param>
        Task UpdatePropertyVideosAsync(int propertyId, List<PropertyVideo> videos);
    }
}