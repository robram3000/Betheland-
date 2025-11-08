using Realstate_servcices.Server.Dto.Register;
namespace Realstate_servcices.Server.Services.ProfileCreation
{
    public interface IClientService
    {
        /// <summary>
        /// Creates a new client profile
        /// </summary>
        /// <param name="request">Client registration data including email, username, password, and personal information</param>
        /// <returns>Registration response indicating success or failure</returns>
        Task<RegisterResponse> CreateClientAsync(ClientRegisterRequest request);

        /// <summary>
        /// Retrieves a client by their base member ID
        /// </summary>
        /// <param name="baseMemberId">The unique identifier of the base member</param>
        /// <returns>Client response with complete profile information or null if not found</returns>
        Task<ClientResponse?> GetClientAsync(int baseMemberId);

        /// <summary>
        /// Retrieves all clients in the system
        /// </summary>
        /// <returns>List of all client responses with complete profile information</returns>
        Task<List<ClientResponse>> GetAllClientsAsync();

        /// <summary>
        /// Retrieves multiple clients by their base member IDs
        /// </summary>
        /// <param name="baseMemberIds">List of base member IDs to search for</param>
        /// <returns>List of client responses matching the provided base member IDs</returns>
        Task<List<ClientResponse>> GetAllClientsByBaseMemberIdsAsync(List<int> baseMemberIds);

        /// <summary>
        /// Updates an existing client's profile information
        /// </summary>
        /// <param name="baseMemberId">The unique identifier of the client to update</param>
        /// <param name="request">Updated client data including personal information</param>
        /// <returns>Registration response indicating success or failure of the update</returns>
        Task<RegisterResponse> UpdateClientAsync(int baseMemberId, ClientUpdateRequest request);

        /// <summary>
        /// Updates the status of a client (Active, Inactive, Suspended, etc.)
        /// </summary>
        /// <param name="baseMemberId">The unique identifier of the client</param>
        /// <param name="status">The new status to assign to the client</param>
        /// <returns>Registration response indicating success or failure</returns>
        Task<RegisterResponse> UpdateClientStatusAsync(int baseMemberId, string status);

        /// <summary>
        /// Deletes a client profile from the system
        /// </summary>
        /// <param name="baseMemberId">The unique identifier of the client to delete</param>
        /// <returns>Registration response indicating success or failure</returns>
        Task<RegisterResponse> DeleteClientAsync(int baseMemberId);

        /// <summary>
        /// Uploads a profile picture for a client
        /// </summary>
        /// <param name="baseMemberId">The unique identifier of the client</param>
        /// <param name="file">The image file to upload as profile picture</param>
        /// <returns>Profile picture response with upload result and URL</returns>
        Task<ProfilePictureResponse> UploadProfilePictureAsync(int baseMemberId, IFormFile file);

        /// <summary>
        /// Deletes the profile picture of a client
        /// </summary>
        /// <param name="baseMemberId">The unique identifier of the client</param>
        /// <returns>Profile picture response indicating success or failure</returns>
        Task<ProfilePictureResponse> DeleteProfilePictureAsync(int baseMemberId);

        /// <summary>
        /// Retrieves the profile picture URL of a client
        /// </summary>
        /// <param name="baseMemberId">The unique identifier of the client</param>
        /// <returns>Profile picture URL string or null if not found</returns>
        Task<string?> GetProfilePictureAsync(int baseMemberId);
    }
}