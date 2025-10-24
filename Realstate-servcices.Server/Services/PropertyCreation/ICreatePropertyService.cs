using Realstate_servcices.Server.Dto.Property;
namespace Realstate_servcices.Server.Services.PropertyCreation
{
    public interface ICreatePropertyService
    {
        /// <summary>
        /// Creates a new property with the provided details
        /// </summary>
        /// <param name="request">The property creation request containing property data, images, and videos</param>
        /// <returns>A response indicating success or failure with the created property details</returns>
        Task<PropertyResponse> CreatePropertyAsync(CreatePropertyRequest request);

        /// <summary>
        /// Retrieves a property by its unique identifier
        /// </summary>
        /// <param name="id">The unique identifier of the property to retrieve</param>
        /// <returns>A response containing the property details or an error message</returns>
        Task<PropertyResponse> GetPropertyByIdAsync(int id);

        /// <summary>
        /// Retrieves all properties from the system
        /// </summary>
        /// <returns>A response containing all properties or an error message</returns>
        Task<PropertiesResponse> GetAllPropertiesAsync();

        /// <summary>
        /// Retrieves all properties associated with a specific owner
        /// </summary>
        /// <param name="ownerId">The unique identifier of the property owner</param>
        /// <returns>A response containing the owner's properties or an error message</returns>
        Task<PropertiesResponse> GetPropertiesByOwnerIdAsync(int ownerId);

        /// <summary>
        /// Retrieves all properties managed by a specific agent
        /// </summary>
        /// <param name="agentId">The unique identifier of the property agent</param>
        /// <returns>A response containing the agent's properties or an error message</returns>
        Task<PropertiesResponse> GetPropertiesByAgentIdAsync(int agentId);

        /// <summary>
        /// Retrieves all properties with a specific status
        /// </summary>
        /// <param name="status">The status to filter properties by (e.g., "Available", "Sold", "Rented")</param>
        /// <returns>A response containing properties with the specified status or an error message</returns>
        Task<PropertiesResponse> GetPropertiesByStatusAsync(string status);

        /// <summary>
        /// Searches properties based on the provided search term
        /// </summary>
        /// <param name="searchTerm">The term to search for in property titles, descriptions, addresses, etc.</param>
        /// <returns>A response containing matching properties or an error message</returns>
        Task<PropertiesResponse> SearchPropertiesAsync(string searchTerm);

        /// <summary>
        /// Updates an existing property with new information
        /// </summary>
        /// <param name="id">The unique identifier of the property to update</param>
        /// <param name="request">The update request containing new property data, images, and videos</param>
        /// <returns>A response indicating success or failure with the updated property details</returns>
        Task<PropertyResponse> UpdatePropertyAsync(int id, UpdatePropertyRequest request);

        /// <summary>
        /// Deletes a property from the system
        /// </summary>
        /// <param name="id">The unique identifier of the property to delete</param>
        /// <returns>A response indicating success or failure of the deletion</returns>
        Task<PropertyResponse> DeletePropertyAsync(int id);

        /// <summary>
        /// Adds images to an existing property
        /// </summary>
        /// <param name="propertyId">The unique identifier of the property to add images to</param>
        /// <param name="imageUrls">List of image URLs to add to the property</param>
        /// <returns>A response indicating success or failure with the updated property details</returns>
        Task<PropertyResponse> AddPropertyImagesAsync(int propertyId, List<string> imageUrls);

        /// <summary>
        /// Adds videos to an existing property
        /// </summary>
        /// <param name="propertyId">The unique identifier of the property to add videos to</param>
        /// <param name="videoUrls">List of video URLs to add to the property</param>
        /// <returns>A response indicating success or failure with the updated property details</returns>
        Task<PropertyResponse> AddPropertyVideosAsync(int propertyId, List<string> videoUrls);
    }
}