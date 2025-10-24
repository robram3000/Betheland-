using Realstate_servcices.Server.Dto.Register;
namespace Realstate_servcices.Server.Services.ProfileCreation
{

    public interface IAgentService
    {
        /// <summary>
        /// Creates a new agent profile
        /// </summary>
        /// <param name="request">Agent registration data including email, username, password, and profile information</param>
        /// <returns>Registration response indicating success or failure</returns>
        Task<RegisterResponse> CreateAgentAsync(AgentRegisterRequest request);
        /// <summary>
        /// Retrieves an agent by their agent ID
        /// </summary>
        /// <param name="id">The unique identifier of the agent</param>
        /// <returns>Agent response with complete profile information or null if not found</returns>
        Task<AgentResponse?> GetAgentAsync(int id);
        /// <summary>
        /// Retrieves all agents in the system
        /// </summary>
        /// <returns>List of all agent responses with complete profile information</returns>
        Task<List<AgentResponse>> GetAllAgentsAsync();
        /// <summary>
        /// Updates an existing agent's profile information
        /// </summary>
        /// <param name="id">The unique identifier of the agent to update</param>
        /// <param name="request">Updated agent data including profile information</param>
        /// <returns>Registration response indicating success or failure of the update</returns>
        Task<RegisterResponse> UpdateAgentAsync(int id, AgentUpdateRequest request);
        /// <summary>
        /// Updates the status of an agent (Active, Inactive, Suspended, etc.)
        /// </summary>
        /// <param name="id">The unique identifier of the agent</param>
        /// <param name="status">The new status to assign to the agent</param>
        /// <returns>Registration response indicating success or failure</returns>
        Task<RegisterResponse> UpdateAgentStatusAsync(int id, string status);
        /// <summary>
        /// Deletes an agent profile from the system
        /// </summary>
        /// <param name="id">The unique identifier of the agent to delete</param>
        /// <returns>Registration response indicating success or failure</returns>
        Task<RegisterResponse> DeleteAgentAsync(int id);
        /// <summary>
        /// Retrieves an agent by their base member ID
        /// </summary>
        /// <param name="baseMemberId">The unique identifier of the base member</param>
        /// <returns>Agent response with complete profile information or null if not found</returns>
        Task<AgentResponse?> GetAgentByBaseMemberIdAsync(int baseMemberId); 
  
    }
}
