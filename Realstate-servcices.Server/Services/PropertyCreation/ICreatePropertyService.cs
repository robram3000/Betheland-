using Realstate_servcices.Server.Dto.Property;

namespace Realstate_servcices.Server.Services.PropertyCreation
{
    public interface ICreatePropertyService
    {
        Task<PropertyResponse> CreatePropertyAsync(CreatePropertyRequest request, List<IFormFile>? imageFiles = null);
        Task<PropertyResponse> GetPropertyByIdAsync(int id);
        Task<PropertyResponse> UpdatePropertyAsync(int id, UpdatePropertyRequest request);
        Task<PropertyResponse> DeletePropertyAsync(int id);
        Task<PropertiesResponse> GetAllPropertiesAsync();
        Task<PropertiesResponse> GetPropertiesByOwnerIdAsync(int ownerId);
        Task<PropertiesResponse> GetPropertiesByAgentIdAsync(int agentId);
    }
}