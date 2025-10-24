using Microsoft.EntityFrameworkCore;
using Realstate_servcices.Server.Data;
using Realstate_servcices.Server.Dto.Register;
using Realstate_servcices.Server.Entity.member;
using Realstate_servcices.Server.Repository.UserDAO;

namespace Realstate_servcices.Server.Repository.UserDAO
{
    /// <summary>
    /// Repository for managing Agent entities in the database
    /// Implements IAgentRepository interface for agent-specific operations
    /// </summary>
    public class AgentRepository : IAgentRepository
    {
        private readonly ApplicationDbContext _context;

        /// <summary>
        /// Initializes a new instance of AgentRepository
        /// </summary>
        /// <param name="context">The application database context for data access</param>
        public AgentRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Creates a new agent entity in the database
        /// </summary>
        /// <param name="request">Agent registration data transfer object containing agent details</param>
        /// <param name="baseMemberId">The ID of the associated base member record</param>
        /// <returns>Newly created Agent entity</returns>
        public async Task<Agent> CreateAgentAsync(AgentRegisterRequest request, int baseMemberId)
        {
            var agent = new Agent
            {
                BaseMemberId = baseMemberId,
                FirstName = request.FirstName,
                MiddleName = request.MiddleName,
                LastName = request.LastName,
                Suffix = request.Suffix,
                CellPhoneNo = request.CellPhoneNo,
                LicenseNumber = request.LicenseNumber,
                Bio = request.Bio,
                LicenseExpiry = request.LicenseExpiry,
                Experience = request.Experience ?? string.Empty,
                Specialization = request.Specialization ?? "[]",
                OfficeAddress = request.OfficeAddress,
                OfficePhone = request.OfficePhone,
                Website = request.Website,
                Languages = request.Languages,
                Education = request.Education,
                Awards = request.Awards,
                YearsOfExperience = request.YearsOfExperience,
                BrokerageName = request.BrokerageName,
                DateRegistered = DateTime.UtcNow
            };

            _context.Agents.Add(agent);
            await _context.SaveChangesAsync();
            return agent;
        }

        /// <summary>
        /// Retrieves an agent by their unique identifier
        /// </summary>
        /// <param name="id">The unique ID of the agent to retrieve</param>
        /// <returns>Agent entity if found, null otherwise</returns>
        public async Task<Agent?> GetAgentByIdAsync(int id)
        {
            try
            {
                return await _context.Agents
                    .Include(a => a.BaseMember)
                    .AsNoTracking()
                    .FirstOrDefaultAsync(a => a.Id == id);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetAgentByIdAsync: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Retrieves an agent by their base member ID
        /// </summary>
        /// <param name="baseMemberId">The base member ID associated with the agent</param>
        /// <returns>Agent entity if found, null otherwise</returns>
        public async Task<Agent?> GetAgentByBaseMemberIdAsync(int baseMemberId)
        {
            return await _context.Agents
                .Include(a => a.BaseMember)
                .FirstOrDefaultAsync(a => a.BaseMemberId == baseMemberId);
        }

        /// <summary>
        /// Retrieves all agents from the database
        /// </summary>
        /// <returns>List of all Agent entities</returns>
        public async Task<List<Agent>> GetAllAgentsAsync()
        {
            return await _context.Agents
                .Include(a => a.BaseMember)
                .ToListAsync();
        }

        /// <summary>
        /// Updates an existing agent's information
        /// </summary>
        /// <param name="id">The ID of the agent to update</param>
        /// <param name="request">Agent update data transfer object containing updated fields</param>
        /// <returns>Updated Agent entity</returns>
        /// <exception cref="ArgumentException">Thrown when agent with specified ID is not found</exception>
        public async Task<Agent> UpdateAgentAsync(int id, AgentUpdateRequest request)
        {
            var agent = await _context.Agents.FindAsync(id);
            if (agent == null)
                throw new ArgumentException($"Agent with ID {id} not found");

            // Update agent properties
            agent.FirstName = request.FirstName;
            agent.MiddleName = request.MiddleName;
            agent.LastName = request.LastName;
            agent.Suffix = request.Suffix;
            agent.CellPhoneNo = request.CellPhoneNo;
            agent.LicenseNumber = request.LicenseNumber;
            agent.Bio = request.Bio;
            agent.LicenseExpiry = request.LicenseExpiry;
            agent.Experience = request.Experience ?? string.Empty;
            agent.Specialization = request.Specialization ?? "[]";
            agent.OfficeAddress = request.OfficeAddress;
            agent.OfficePhone = request.OfficePhone;
            agent.Website = request.Website;
            agent.Languages = request.Languages;
            agent.Education = request.Education;
            agent.Awards = request.Awards;
            agent.YearsOfExperience = request.YearsOfExperience;
            agent.BrokerageName = request.BrokerageName;

            // Update verification status if provided
            if (request.IsVerified.HasValue)
            {
                agent.IsVerified = request.IsVerified.Value;
                if (request.IsVerified.Value && !agent.IsVerified)
                {
                    agent.VerificationDate = DateTime.UtcNow;
                }
            }

            // Update associated base member
            var baseMember = await _context.BaseMembers.FindAsync(agent.BaseMemberId);
            if (baseMember != null)
            {
                baseMember.ProfilePictureUrl = request.ProfilePictureUrl ?? baseMember.ProfilePictureUrl;
                baseMember.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return agent;
        }

        /// <summary>
        /// Updates the verification status of an agent
        /// </summary>
        /// <param name="id">The ID of the agent to update</param>
        /// <param name="isVerified">Boolean indicating verification status (true = verified, false = not verified)</param>
        /// <returns>True if update was successful, false if agent was not found</returns>
        public async Task<bool> UpdateVerificationStatusAsync(int id, bool isVerified)
        {
            var agent = await _context.Agents.FindAsync(id);
            if (agent == null)
                return false;

            agent.IsVerified = isVerified;
            if (isVerified)
            {
                agent.VerificationDate = DateTime.UtcNow;
            }
            else
            {
                agent.VerificationDate = null;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        /// <summary>
        /// Deletes an agent from the database
        /// </summary>
        /// <param name="id">The ID of the agent to delete</param>
        /// <returns>True if deletion was successful, false if agent was not found</returns>
        public async Task<bool> DeleteAgentAsync(int id)
        {
            var agent = await _context.Agents.FindAsync(id);
            if (agent == null)
                return false;

            _context.Agents.Remove(agent);
            await _context.SaveChangesAsync();
            return true;
        }

        /// <summary>
        /// Checks if an agent exists with the specified ID
        /// </summary>
        /// <param name="id">The ID to check for existence</param>
        /// <returns>True if agent exists, false otherwise</returns>
        public async Task<bool> AgentExistsAsync(int id)
        {
            return await _context.Agents.AnyAsync(a => a.Id == id);
        }
    }
}