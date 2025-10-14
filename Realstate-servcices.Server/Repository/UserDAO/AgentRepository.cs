using Microsoft.EntityFrameworkCore;
using Realstate_servcices.Server.Data;
using Realstate_servcices.Server.Dto.Register;
using Realstate_servcices.Server.Entity.member;
using Realstate_servcices.Server.Repository.UserDAO;

namespace Realstate_servcices.Server.Repository.UserDAO
{
    public class AgentRepository : IAgentRepository
    {
        private readonly ApplicationDbContext _context;

        public AgentRepository(ApplicationDbContext context)
        {
            _context = context;
        }

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

        public async Task<Agent?> GetAgentByBaseMemberIdAsync(int baseMemberId)
        {
            return await _context.Agents
                .Include(a => a.BaseMember)
                .FirstOrDefaultAsync(a => a.BaseMemberId == baseMemberId);
        }

        public async Task<List<Agent>> GetAllAgentsAsync()
        {
            return await _context.Agents
                .Include(a => a.BaseMember)
                .ToListAsync();
        }

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

            // Handle verification status
            if (request.IsVerified.HasValue)
            {
                agent.IsVerified = request.IsVerified.Value;
                if (request.IsVerified.Value && !agent.IsVerified)
                {
                    agent.VerificationDate = DateTime.UtcNow;
                }
            }

            // Update base member timestamp
            var baseMember = await _context.BaseMembers.FindAsync(agent.BaseMemberId);
            if (baseMember != null)
            {
                baseMember.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return agent;
        }

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

        public async Task<bool> DeleteAgentAsync(int id)
        {
            var agent = await _context.Agents.FindAsync(id);
            if (agent == null)
                return false;

            _context.Agents.Remove(agent);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> AgentExistsAsync(int id)
        {
            return await _context.Agents.AnyAsync(a => a.Id == id);
        }
    }
}