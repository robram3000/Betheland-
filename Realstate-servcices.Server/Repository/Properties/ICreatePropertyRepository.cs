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
        Task<bool> PropertyExistsAsync(int id);
        Task<IEnumerable<PropertyHouse>> GetPropertiesByStatusAsync(string status);
        Task<IEnumerable<PropertyHouse>> SearchPropertiesAsync(string searchTerm);
    }
}