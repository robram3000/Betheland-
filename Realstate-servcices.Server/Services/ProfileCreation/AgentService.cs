using Realstate_servcices.Server.Dto.Register;
using Realstate_servcices.Server.Entity.member;
using Realstate_servcices.Server.Repository.UserDAO;
using Realstate_servcices.Server.Services.ProfileCreation;

namespace Realstate_servcices.Server.Services.ProfileCreation
{
    public class AgentService : IAgentService
    {
        private readonly IBaseMemberRepository _baseMemberRepository;
        private readonly IAgentRepository _agentRepository;

        public AgentService(IBaseMemberRepository baseMemberRepository, IAgentRepository agentRepository)
        {
            _baseMemberRepository = baseMemberRepository;
            _agentRepository = agentRepository;
        }

        public async Task<RegisterResponse> CreateAgentAsync(AgentRegisterRequest request)
        {
            try
            {
                // Check if email or username already exists
                if (await _baseMemberRepository.EmailExistsAsync(request.Email))
                {
                    return new RegisterResponse { Success = false, Message = "Email already exists" };
                }

                if (await _baseMemberRepository.UsernameExistsAsync(request.Username))
                {
                    return new RegisterResponse { Success = false, Message = "Username already exists" };
                }

                // Hash password (in a real application, use proper hashing)
                var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

                // Create BaseMember
                var baseMember = await _baseMemberRepository.CreateBaseMemberAsync(
                    request.Email, request.Username, passwordHash, "Agent");

                // Create Agent
                var agent = await _agentRepository.CreateAgentAsync(request, baseMember.Id);

                return new RegisterResponse
                {
                    Success = true,
                    Message = "Agent created successfully",
                    UserId = agent.Id.ToString()
                };
            }
            catch (Exception ex)
            {
                return new RegisterResponse
                {
                    Success = false,
                    Message = $"Error creating agent: {ex.Message}"
                };
            }
        }

        public async Task<AgentResponse?> GetAgentAsync(int id)
        {
            var agent = await _agentRepository.GetAgentByIdAsync(id);
            if (agent == null) return null;

            return new AgentResponse
            {
                Id = agent.Id,
                Email = agent.BaseMember.Email,
                Username = agent.BaseMember.Username,
                FirstName = agent.FirstName,
                LastName = agent.LastName,
                CellPhoneNo = agent.CellPhoneNo,
                LicenseNumber = agent.LicenseNumber,
                Status = agent.BaseMember.status,
                CreatedAt = agent.BaseMember.CreatedAt
            };
        }

        public async Task<List<AgentResponse>> GetAllAgentsAsync()
        {
            var agents = await _agentRepository.GetAllAgentsAsync();
            return agents.Select(agent => new AgentResponse
            {
                Id = agent.Id,
                Email = agent.BaseMember.Email,
                Username = agent.BaseMember.Username,
                FirstName = agent.FirstName,
                LastName = agent.LastName,
                CellPhoneNo = agent.CellPhoneNo,
                LicenseNumber = agent.LicenseNumber,
                Status = agent.BaseMember.status,
                CreatedAt = agent.BaseMember.CreatedAt
            }).ToList();
        }

        public async Task<RegisterResponse> UpdateAgentAsync(int id, AgentUpdateRequest request)
        {
            try
            {
                var agent = await _agentRepository.GetAgentByIdAsync(id);
                if (agent == null)
                {
                    return new RegisterResponse { Success = false, Message = "Agent not found" };
                }

                await _agentRepository.UpdateAgentAsync(id, request);
                return new RegisterResponse { Success = true, Message = "Agent updated successfully" };
            }
            catch (Exception ex)
            {
                return new RegisterResponse { Success = false, Message = $"Error updating agent: {ex.Message}" };
            }
        }

        public async Task<RegisterResponse> UpdateAgentStatusAsync(int id, string status)
        {
            try
            {
                var agent = await _agentRepository.GetAgentByIdAsync(id);
                if (agent == null)
                {
                    return new RegisterResponse { Success = false, Message = "Agent not found" };
                }

                await _baseMemberRepository.UpdateBaseMemberStatusAsync(agent.BaseMemberId, status);
                return new RegisterResponse { Success = true, Message = "Agent status updated successfully" };
            }
            catch (Exception ex)
            {
                return new RegisterResponse { Success = false, Message = $"Error updating agent status: {ex.Message}" };
            }
        }

        public async Task<RegisterResponse> DeleteAgentAsync(int id)
        {
            try
            {
                var success = await _agentRepository.DeleteAgentAsync(id);
                if (!success)
                {
                    return new RegisterResponse { Success = false, Message = "Agent not found" };
                }

                return new RegisterResponse { Success = true, Message = "Agent deleted successfully" };
            }
            catch (Exception ex)
            {
                return new RegisterResponse { Success = false, Message = $"Error deleting agent: {ex.Message}" };
            }
        }
    }
}