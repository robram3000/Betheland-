using Realstate_servcices.Server.Dto.Register;
using Realstate_servcices.Server.Entity.member;

namespace Realstate_servcices.Server.Repository.UserDAO
{
    public interface IClientRepository
    {
        Task<Client> CreateClientAsync(ClientRegisterRequest request, int baseMemberId);
        Task<Client?> GetClientByIdAsync(int id);
        Task<Client?> GetClientByBaseMemberIdAsync(int baseMemberId);
        Task<List<Client>> GetAllClientsAsync();
        Task<Client> UpdateClientAsync(int id, ClientUpdateRequest request);
        Task<bool> DeleteClientAsync(int id);
        Task<bool> ClientExistsAsync(int id);
    }
}
