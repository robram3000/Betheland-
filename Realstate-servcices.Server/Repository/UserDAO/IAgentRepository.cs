using Realstate_servcices.Server.Dto.Register;
using Realstate_servcices.Server.Entity.member;

namespace Realstate_servcices.Server.Repository.UserDAO
{
    public interface IAgentRepository
    {
        Task<Agent> CreateAgentAsync(AgentRegisterRequest request, int baseMemberId);
        Task<Agent?> GetAgentByIdAsync(int id);
        Task<Agent?> GetAgentByBaseMemberIdAsync(int baseMemberId);
        Task<List<Agent>> GetAllAgentsAsync();
        Task<Agent> UpdateAgentAsync(int id, AgentUpdateRequest request);
        Task<bool> DeleteAgentAsync(int id);
        Task<bool> AgentExistsAsync(int id);
        Task<bool> UpdateVerificationStatusAsync(int id, bool isVerified);
    }
}