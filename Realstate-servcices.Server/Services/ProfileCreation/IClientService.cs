using Realstate_servcices.Server.Dto.Register;

namespace Realstate_servcices.Server.Services.ProfileCreation
{
    public interface IClientService
    {
        Task<RegisterResponse> CreateClientAsync(ClientRegisterRequest request);
        Task<ClientResponse?> GetClientAsync(int id);
        Task<List<ClientResponse>> GetAllClientsAsync();
        Task<RegisterResponse> UpdateClientAsync(int id, ClientUpdateRequest request);
        Task<RegisterResponse> UpdateClientStatusAsync(int id, string status);
        Task<RegisterResponse> DeleteClientAsync(int id);
    }
}
