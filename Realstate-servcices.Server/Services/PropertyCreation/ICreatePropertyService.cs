using Realstate_servcices.Server.Dto.Property;

namespace Realstate_servcices.Server.Services.PropertyCreation
{
    public interface ICreatePropertyService
    {
        Task<PropertyResponse> CreatePropertyAsync(CreatePropertyRequest request);
        Task<PropertyResponse> GetPropertyByIdAsync(int id);
        Task<PropertiesResponse> GetAllPropertiesAsync();
        Task<PropertiesResponse> GetPropertiesByOwnerIdAsync(int ownerId);
        Task<PropertiesResponse> GetPropertiesByAgentIdAsync(int agentId);
        Task<PropertiesResponse> GetPropertiesByStatusAsync(string status);
        Task<PropertiesResponse> SearchPropertiesAsync(string searchTerm);
        Task<PropertyResponse> UpdatePropertyAsync(int id, UpdatePropertyRequest request);
        Task<PropertyResponse> DeletePropertyAsync(int id);
        Task<PropertyResponse> AddPropertyImagesAsync(int propertyId, List<string> imageUrls);
        Task<PropertyResponse> AddPropertyVideosAsync(int propertyId, List<string> videoUrls);
    }
}