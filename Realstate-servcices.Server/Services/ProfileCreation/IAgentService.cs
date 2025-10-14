using Realstate_servcices.Server.Dto.Register;

namespace Realstate_servcices.Server.Services.ProfileCreation
{
    public interface IAgentService
    {
        Task<RegisterResponse> CreateAgentAsync(AgentRegisterRequest request);
        Task<AgentResponse?> GetAgentAsync(int id);
        Task<List<AgentResponse>> GetAllAgentsAsync();
        Task<RegisterResponse> UpdateAgentAsync(int id, AgentUpdateRequest request);
        Task<RegisterResponse> UpdateAgentStatusAsync(int id, string status);
        Task<RegisterResponse> DeleteAgentAsync(int id);
        Task<AgentResponse?> GetAgentByBaseMemberIdAsync(int baseMemberId); 
  
    }
}
