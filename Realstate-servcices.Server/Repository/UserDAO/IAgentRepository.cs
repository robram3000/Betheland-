using Realstate_servcices.Server.Dto.Register;
using Realstate_servcices.Server.Entity.member;

namespace Realstate_servcices.Server.Repository.UserDAO
{
    /// <summary>
    /// Interface for Agent repository operations
    /// Defines contract for agent data access
    /// </summary>
    public interface IAgentRepository
    {
        /// <summary>
        /// Creates a new agent entity
        /// </summary>
        Task<Agent> CreateAgentAsync(AgentRegisterRequest request, int baseMemberId);

        /// <summary>
        /// Retrieves an agent by ID
        /// </summary>
        Task<Agent?> GetAgentByIdAsync(int id);

        /// <summary>
        /// Retrieves an agent by base member ID
        /// </summary>
        Task<Agent?> GetAgentByBaseMemberIdAsync(int baseMemberId);

        /// <summary>
        /// Retrieves all agents
        /// </summary>
        Task<List<Agent>> GetAllAgentsAsync();

        /// <summary>
        /// Updates an existing agent
        /// </summary>
        Task<Agent> UpdateAgentAsync(int id, AgentUpdateRequest request);

        /// <summary>
        /// Deletes an agent
        /// </summary>
        Task<bool> DeleteAgentAsync(int id);

        /// <summary>
        /// Checks if an agent exists
        /// </summary>
        Task<bool> AgentExistsAsync(int id);

        /// <summary>
        /// Updates the verification status of an agent
        /// </summary>
        Task<bool> UpdateVerificationStatusAsync(int id, bool isVerified);
    }
}