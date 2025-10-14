using Realstate_servcices.Server.Dto.Register;

namespace Realstate_servcices.Server.Services.ProfileCreation
{
    public interface IClientService
    {
        Task<RegisterResponse> CreateClientAsync(ClientRegisterRequest request);
        Task<ClientResponse?> GetClientAsync(int baseMemberId);
        Task<List<ClientResponse>> GetAllClientsAsync();
        Task<RegisterResponse> UpdateClientAsync(int baseMemberId, ClientUpdateRequest request);
        Task<RegisterResponse> UpdateClientStatusAsync(int baseMemberId, string status);
        Task<RegisterResponse> DeleteClientAsync(int baseMemberId);

        // Profile picture methods
        Task<ProfilePictureResponse> UploadProfilePictureAsync(int baseMemberId, IFormFile file);
        Task<ProfilePictureResponse> DeleteProfilePictureAsync(int baseMemberId);
        Task<string?> GetProfilePictureAsync(int baseMemberId);
    }
}
