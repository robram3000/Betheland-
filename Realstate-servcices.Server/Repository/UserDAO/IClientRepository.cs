using Realstate_servcices.Server.Dto.Register;
using Realstate_servcices.Server.Entity.member;

namespace Realstate_servcices.Server.Repository.UserDAO
{
    /// <summary>
    /// Interface for Client repository operations
    /// Defines contract for client data access
    /// </summary>
    public interface IClientRepository
    {
        /// <summary>
        /// Creates a new client entity
        /// </summary>
        Task<Client> CreateClientAsync(ClientRegisterRequest request, int baseMemberId);

        /// <summary>
        /// Retrieves a client by base member ID
        /// </summary>
        Task<Client?> GetClientByIdAsync(int baseMemberId);

        /// <summary>
        /// Retrieves a client by base member ID with comprehensive data
        /// </summary>
        Task<Client?> GetClientByBaseMemberIdAsync(int baseMemberId);

        /// <summary>
        /// Retrieves all clients
        /// </summary>
        Task<List<Client>> GetAllClientsAsync();

        /// <summary>
        /// Updates an existing client
        /// </summary>
        Task<Client> UpdateClientAsync(int baseMemberId, ClientUpdateRequest request);

        /// <summary>
        /// Deletes a client
        /// </summary>
        Task<bool> DeleteClientAsync(int baseMemberId);

        /// <summary>
        /// Checks if a client exists by base member ID
        /// </summary>
        Task<bool> ClientExistsAsync(int baseMemberId);

        /// <summary>
        /// Checks if a client exists by client ID
        /// </summary>
        Task<bool> ClientExistsByClientIdAsync(int clientId);

        /// <summary>
        /// Retrieves multiple clients by their base member IDs
        /// </summary>
        /// <param name="baseMemberIds">List of base member IDs to search for</param>
        /// <returns>List of Client entities matching the provided base member IDs</returns>
        Task<List<Client>> GetAllClientsByBaseMemberIdsAsync(List<int> baseMemberIds);
    }
}