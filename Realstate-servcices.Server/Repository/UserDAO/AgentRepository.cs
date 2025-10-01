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
                LastName = request.LastName,
                CellPhoneNo = request.CellPhoneNo,
                LicenseNumber = request.LicenseNumber,
                DateRegistered = DateTime.UtcNow
            };

            _context.Agents.Add(agent);
            await _context.SaveChangesAsync();
            return agent;
        }

        public async Task<Agent?> GetAgentByIdAsync(int id)
        {
            return await _context.Agents
                .Include(a => a.BaseMember)
                .FirstOrDefaultAsync(a => a.Id == id);
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

            agent.FirstName = request.FirstName;
            agent.LastName = request.LastName;
            agent.CellPhoneNo = request.CellPhoneNo;
            agent.LicenseNumber = request.LicenseNumber;

            var baseMember = await _context.BaseMembers.FindAsync(agent.BaseMemberId);
            if (baseMember != null)
            {
                baseMember.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return agent;
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