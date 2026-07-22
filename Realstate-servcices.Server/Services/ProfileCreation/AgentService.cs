using Realstate_servcices.Server.Dto.Register;
using Realstate_servcices.Server.Entity.member;
using Realstate_servcices.Server.Repository.UserDAO;
using Realstate_servcices.Server.Services.ProfileCreation.Interfaces;
namespace Realstate_servcices.Server.Services.ProfileCreation
{

    /// <summary>
    /// Service for managing agent profiles and operations
    /// </summary>
    public class AgentService : IAgentService
    {
        private readonly IBaseMemberRepository _baseMemberRepository;
        private readonly IAgentRepository _agentRepository;
        /// <summary>
        /// Initializes a new instance of the AgentService class
        /// </summary>
        /// <param name="baseMemberRepository">Repository for base member data operations</param>
        /// <param name="agentRepository">Repository for agent-specific data operations</param>
        public AgentService(IBaseMemberRepository baseMemberRepository, IAgentRepository agentRepository)
        {
            _baseMemberRepository = baseMemberRepository;
            _agentRepository = agentRepository;
        }
        /// <summary>
        /// Creates a new agent profile with validation for duplicate email and username
        /// </summary>
        /// <param name="request">Agent registration data including email, username, password, license information, and profile details</param>
        /// <returns>Registration response indicating success or failure</returns>
        public async Task<RegisterResponse> CreateAgentAsync(AgentRegisterRequest request)
        {
            try
            {
                if (await _baseMemberRepository.EmailExistsAsync(request.Email))
                {
                    return new RegisterResponse { Success = false, Message = "Email already exists" };
                }

                if (await _baseMemberRepository.UsernameExistsAsync(request.Username))
                {
                    return new RegisterResponse { Success = false, Message = "Username already exists" };
                }

                var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

                // Ensure Photourl is properly passed and handled
                var baseMember = await _baseMemberRepository.CreateBaseAgentMemberAsync(
                    request.Email,
                    request.Username,
                    passwordHash,
                    "Agent",
                    request.Photourl ?? string.Empty); // Make sure this isn't null

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

        /// <summary>
        /// Retrieves an agent by their base member ID
        /// </summary>
        /// <param name="baseMemberId">The unique identifier of the base member</param>
        /// <returns>Agent response with complete profile information or null if not found</returns>
        public async Task<AgentResponse?> GetAgentByBaseMemberIdAsync(int baseMemberId)
        {
            try
            {
                var agent = await _agentRepository.GetAgentByBaseMemberIdAsync(baseMemberId);
                if (agent == null) return null;

                if (agent.BaseMember == null)
                {
                    throw new Exception("BaseMember not found for agent");
                }

                return new AgentResponse
                {
                    Id = agent.Id,
                    BaseMemberId = agent.BaseMemberId,
                    Email = agent.BaseMember?.Email ?? string.Empty,
                    Username = agent.BaseMember?.Username ?? string.Empty,
                    FirstName = agent.FirstName,
                    MiddleName = agent.MiddleName,
                    LastName = agent.LastName,
                    Suffix = agent.Suffix,
                    CellPhoneNo = agent.CellPhoneNo,
                    LicenseNumber = agent.LicenseNumber,
                    Bio = agent.Bio,
                    LicenseExpiry = agent.LicenseExpiry,
                    Experience = agent.Experience,
                    Specialization = agent.Specialization,
                    OfficeAddress = agent.OfficeAddress,
                    OfficePhone = agent.OfficePhone,
                    Website = agent.Website,
                    Languages = agent.Languages,
                    Education = agent.Education,
                    Awards = agent.Awards,
                    YearsOfExperience = agent.YearsOfExperience,
                    BrokerageName = agent.BrokerageName,
                    IsVerified = agent.IsVerified,
                    VerificationDate = agent.VerificationDate,
                    Status = agent.BaseMember?.status ?? "Unknown",
                    CreatedAt = agent.BaseMember?.CreatedAt ?? DateTime.MinValue,
                    DateRegistered = agent.DateRegistered,
                    ProfilePictureUrl = agent.BaseMember?.ProfilePictureUrl
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetAgentByBaseMemberIdAsync: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Retrieves an agent by their agent ID
        /// </summary>
        /// <param name="id">The unique identifier of the agent</param>
        /// <returns>Agent response with complete profile information or null if not found</returns>

        public async Task<AgentResponse?> GetAgentAsync(int id)
        {
            try
            {
                var agent = await _agentRepository.GetAgentByIdAsync(id);
                if (agent == null) return null;

                if (agent.BaseMember == null)
                {
                    throw new Exception("BaseMember not found for agent");
                }

                return new AgentResponse
                {
                    Id = agent.Id,
                    BaseMemberId = agent.BaseMemberId,
                    Email = agent.BaseMember?.Email ?? string.Empty,
                    Username = agent.BaseMember?.Username ?? string.Empty,
                    FirstName = agent.FirstName,
                    MiddleName = agent.MiddleName,
                    LastName = agent.LastName,
                    Suffix = agent.Suffix,
                    CellPhoneNo = agent.CellPhoneNo,
                    LicenseNumber = agent.LicenseNumber,
                    Bio = agent.Bio,
                    LicenseExpiry = agent.LicenseExpiry,
                    Experience = agent.Experience,
                    Specialization = agent.Specialization,
                    OfficeAddress = agent.OfficeAddress,
                    OfficePhone = agent.OfficePhone,
                    Website = agent.Website,
                    Languages = agent.Languages,
                    Education = agent.Education,
                    Awards = agent.Awards,
                    YearsOfExperience = agent.YearsOfExperience,
                    BrokerageName = agent.BrokerageName,
                    IsVerified = agent.IsVerified,
                    VerificationDate = agent.VerificationDate,
                    Status = agent.BaseMember?.status ?? "Unknown",
                    CreatedAt = agent.BaseMember?.CreatedAt ?? DateTime.MinValue,
                    DateRegistered = agent.DateRegistered,
                    ProfilePictureUrl = agent.BaseMember?.ProfilePictureUrl
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetAgentAsync: {ex.Message}");
                throw;
            }
        }
        /// <summary>
        /// Retrieves all agents in the system with their complete profile information
        /// </summary>
        /// <returns>List of all agent responses with complete profile information</returns>

        public async Task<List<AgentResponse>> GetAllAgentsAsync()
        {
            try
            {
                var agents = await _agentRepository.GetAllAgentsAsync();
                return agents.Select(agent => new AgentResponse
                {
                    Id = agent.Id,
                    BaseMemberId = agent.BaseMemberId,
                    Email = agent.BaseMember?.Email ?? string.Empty,
                    Username = agent.BaseMember?.Username ?? string.Empty,
                    FirstName = agent.FirstName,
                    MiddleName = agent.MiddleName,
                    LastName = agent.LastName,
                    Suffix = agent.Suffix,
                    CellPhoneNo = agent.CellPhoneNo,
                    LicenseNumber = agent.LicenseNumber,
                    Bio = agent.Bio,
                    LicenseExpiry = agent.LicenseExpiry,
                    Experience = agent.Experience,
                    Specialization = agent.Specialization,
                    OfficeAddress = agent.OfficeAddress,
                    OfficePhone = agent.OfficePhone,
                    Website = agent.Website,
                    Languages = agent.Languages,
                    Education = agent.Education,
                    Awards = agent.Awards,
                    YearsOfExperience = agent.YearsOfExperience,
                    BrokerageName = agent.BrokerageName,
                    IsVerified = agent.IsVerified,
                    VerificationDate = agent.VerificationDate,
                    Status = agent.BaseMember?.status ?? "Unknown",
                    CreatedAt = agent.BaseMember?.CreatedAt ?? DateTime.MinValue,
                    DateRegistered = agent.DateRegistered,
                    ProfilePictureUrl = agent.BaseMember?.ProfilePictureUrl
                }).ToList();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetAllAgentsAsync: {ex.Message}");
                throw;
            }
        }
        /// <summary>
        /// Updates an existing agent's profile information including profile picture
        /// </summary>
        /// <param name="id">The unique identifier of the agent to update</param>
        /// <param name="request">Updated agent data including profile information and picture URL</param>
        /// <returns>Registration response indicating success or failure of the update</returns>
        public async Task<RegisterResponse> UpdateAgentAsync(int id, AgentUpdateRequest request)
        {
            try
            {
                var agent = await _agentRepository.GetAgentByIdAsync(id);
                if (agent == null)
                {
                    return new RegisterResponse { Success = false, Message = "Agent not found" };
                }

                // Update base member profile picture if provided
                if (!string.IsNullOrEmpty(request.ProfilePictureUrl))
                {
                    var imageUrl = request.ProfilePictureUrl ;
                    await _baseMemberRepository.UpdateProfilePictureAsync(agent.BaseMemberId, imageUrl);
                }

                await _agentRepository.UpdateAgentAsync(id, request);
                return new RegisterResponse { Success = true, Message = "Agent updated successfully" };
            }
            catch (Exception ex)
            {
                return new RegisterResponse { Success = false, Message = $"Error updating agent: {ex.Message}" };
            }
        }
        /// <summary>
        /// Updates the status of an agent and handles verification status accordingly
        /// </summary>
        /// <param name="id">The unique identifier of the agent</param>
        /// <param name="status">The new status to assign to the agent (Verified, Inactive, Suspended, etc.)</param>
        /// <returns>Registration response indicating success or failure</returns>
        public async Task<RegisterResponse> UpdateAgentStatusAsync(int id, string status)
        {
            try
            {
                var agent = await _agentRepository.GetAgentByIdAsync(id);
                if (agent == null)
                {
                    return new RegisterResponse { Success = false, Message = "Agent not found" };
                }

                // Update base member status
                await _baseMemberRepository.UpdateBaseMemberStatusAsync(agent.BaseMemberId, status);

                // Also update verification status if status is "Verified"
                if (status == "Verified")
                {
                    await _agentRepository.UpdateVerificationStatusAsync(id, true);
                }
                else if (status == "Inactive" || status == "Suspended")
                {
                    await _agentRepository.UpdateVerificationStatusAsync(id, false);
                }

                return new RegisterResponse { Success = true, Message = "Agent status updated successfully" };
            }
            catch (Exception ex)
            {
                return new RegisterResponse { Success = false, Message = $"Error updating agent status: {ex.Message}" };
            }
        }
        /// <summary>
        /// Deletes an agent profile from the system
        /// </summary>
        /// <param name="id">The unique identifier of the agent to delete</param>
        /// <returns>Registration response indicating success or failure</returns>
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