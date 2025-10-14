using Realstate_servcices.Server.Entity.Properties;

namespace Realstate_servcices.Server.Repository.Properties
{
    public interface ICreatePropertyRepository
    {
        Task<PropertyHouse> CreatePropertyAsync(PropertyHouse property);
        Task<PropertyHouse?> GetPropertyByIdAsync(int id);
        Task<PropertyHouse?> UpdatePropertyAsync(PropertyHouse property);
        Task<bool> DeletePropertyAsync(int id);
        Task<IEnumerable<PropertyHouse>> GetAllPropertiesAsync();
        Task<IEnumerable<PropertyHouse>> GetPropertiesByOwnerIdAsync(int ownerId);
        Task<IEnumerable<PropertyHouse>> GetPropertiesByAgentIdAsync(int agentId);
        Task<IEnumerable<PropertyHouse>> GetPropertiesByStatusAsync(string status);
        Task<IEnumerable<PropertyHouse>> SearchPropertiesAsync(string searchTerm);
        Task<bool> PropertyExistsAsync(int id);
        Task<bool> OwnerExistsAsync(int ownerId);

        // Image methods
        Task AddPropertyImagesAsync(int propertyId, List<PropertyImage> images);
        Task UpdatePropertyImagesAsync(int propertyId, List<PropertyImage> images);

        // Video methods
        Task AddPropertyVideosAsync(int propertyId, List<PropertyVideo> videos);
        Task UpdatePropertyVideosAsync(int propertyId, List<PropertyVideo> videos);
    }
}