
using Microsoft.EntityFrameworkCore;
using Realstate_servcices.Server.Data;
using Realstate_servcices.Server.Entity.Schedule;
using Realstate_servcices.Server.Entity.member;


namespace Realstate_servcices.Server.Repositories
{
    /// <summary>
    /// Repository for managing agent time-off requests and records
    /// </summary>
    /// <remarks>
    /// Handles agent vacation, sick leave, and other time-off scenarios for scheduling conflicts
    /// </remarks>
    public interface IAgentTimeOffRepository
    {
        /// <summary>
        /// Retrieves a time-off record by its unique identifier
        /// </summary>
        /// <param name="id">The unique identifier of the time-off record</param>
        /// <returns>The time-off record or null if not found</returns>
        Task<AgentTimeOff> GetByIdAsync(int id);

        /// <summary>
        /// Retrieves all time-off records from the database
        /// </summary>
        /// <returns>A collection of all time-off records</returns>
        Task<IEnumerable<AgentTimeOff>> GetAllAsync();

        /// <summary>
        /// Retrieves time-off records for a specific agent
        /// </summary>
        /// <param name="agentId">The unique identifier of the agent</param>
        /// <returns>A collection of time-off records for the specified agent</returns>
        Task<IEnumerable<AgentTimeOff>> GetByAgentIdAsync(int agentId);

        /// <summary>
        /// Retrieves time-off records for an agent within a specific date range
        /// </summary>
        /// <param name="agentId">The unique identifier of the agent</param>
        /// <param name="startDate">The start date of the range (inclusive)</param>
        /// <param name="endDate">The end date of the range (inclusive)</param>
        /// <returns>A collection of time-off records within the specified date range</returns>
        Task<IEnumerable<AgentTimeOff>> GetTimeOffByDateRangeAsync(int agentId, DateTime startDate, DateTime endDate);

        /// <summary>
        /// Adds a new time-off record to the database
        /// </summary>
        /// <param name="timeOff">The time-off record to add</param>
        /// <returns>The added time-off record with updated identifiers</returns>
        Task<AgentTimeOff> AddAsync(AgentTimeOff timeOff);

        /// <summary>
        /// Updates an existing time-off record in the database
        /// </summary>
        /// <param name="timeOff">The time-off record to update</param>
        /// <returns>The updated time-off record</returns>
        Task<AgentTimeOff> UpdateAsync(AgentTimeOff timeOff);

        /// <summary>
        /// Deletes a time-off record from the database
        /// </summary>
        /// <param name="id">The unique identifier of the time-off record to delete</param>
        /// <returns>True if deletion was successful, false if the record was not found</returns>
        Task<bool> DeleteAsync(int id);

        /// <summary>
        /// Checks if an agent is on approved time-off on a specific date
        /// </summary>
        /// <param name="agentId">The unique identifier of the agent</param>
        /// <param name="date">The date to check for time-off</param>
        /// <returns>True if the agent is on approved time-off, false otherwise</returns>
        Task<bool> IsAgentOnTimeOffAsync(int agentId, DateTime date);
    }

    /// <summary>
    /// Repository implementation for AgentTimeOff entity management
    /// </summary>
    /// <remarks>
    /// Provides data access operations for agent time-off requests and availability conflicts
    /// </remarks>
    public class AgentTimeOffRepository : IAgentTimeOffRepository
    {
        private readonly ApplicationDbContext _context;

        /// <summary>
        /// Initializes a new instance of the AgentTimeOffRepository
        /// </summary>
        /// <param name="context">The database context to use for data operations</param>
        public AgentTimeOffRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Retrieves a time-off record by its unique identifier
        /// </summary>
        /// <param name="id">The unique identifier of the time-off record</param>
        /// <returns>The time-off record or null if not found</returns>
        public async Task<AgentTimeOff> GetByIdAsync(int id)
        {
            return await _context.AgentTimeOffs.FindAsync(id);
        }

        /// <summary>
        /// Retrieves all time-off records from the database
        /// </summary>
        /// <returns>A collection of all time-off records</returns>
        public async Task<IEnumerable<AgentTimeOff>> GetAllAsync()
        {
            return await _context.AgentTimeOffs.ToListAsync();
        }

        /// <summary>
        /// Retrieves time-off records for a specific agent
        /// </summary>
        /// <param name="agentId">The unique identifier of the agent</param>
        /// <returns>A collection of time-off records for the specified agent</returns>
        public async Task<IEnumerable<AgentTimeOff>> GetByAgentIdAsync(int agentId)
        {
            return await _context.AgentTimeOffs
                .Where(to => to.AgentId == agentId)
                .ToListAsync();
        }

        /// <summary>
        /// Retrieves time-off records for an agent within a specific date range
        /// </summary>
        /// <param name="agentId">The unique identifier of the agent</param>
        /// <param name="startDate">The start date of the range (inclusive)</param>
        /// <param name="endDate">The end date of the range (inclusive)</param>
        /// <returns>A collection of time-off records within the specified date range</returns>
        public async Task<IEnumerable<AgentTimeOff>> GetTimeOffByDateRangeAsync(int agentId, DateTime startDate, DateTime endDate)
        {
            return await _context.AgentTimeOffs
                .Where(to => to.AgentId == agentId &&
                            to.StartDate <= endDate &&
                            to.EndDate >= startDate)
                .ToListAsync();
        }

        /// <summary>
        /// Adds a new time-off record to the database
        /// </summary>
        /// <param name="timeOff">The time-off record to add</param>
        /// <returns>The added time-off record with updated identifiers</returns>
        public async Task<AgentTimeOff> AddAsync(AgentTimeOff timeOff)
        {
            _context.AgentTimeOffs.Add(timeOff);
            await _context.SaveChangesAsync();
            return timeOff;
        }

        /// <summary>
        /// Updates an existing time-off record in the database
        /// </summary>
        /// <param name="timeOff">The time-off record to update</param>
        /// <returns>The updated time-off record</returns>
        public async Task<AgentTimeOff> UpdateAsync(AgentTimeOff timeOff)
        {
            _context.AgentTimeOffs.Update(timeOff);
            await _context.SaveChangesAsync();
            return timeOff;
        }

        /// <summary>
        /// Deletes a time-off record from the database
        /// </summary>
        /// <param name="id">The unique identifier of the time-off record to delete</param>
        /// <returns>True if deletion was successful, false if the record was not found</returns>
        public async Task<bool> DeleteAsync(int id)
        {
            var timeOff = await _context.AgentTimeOffs.FindAsync(id);
            if (timeOff == null)
                return false;

            _context.AgentTimeOffs.Remove(timeOff);
            await _context.SaveChangesAsync();
            return true;
        }

        /// <summary>
        /// Checks if an agent is on approved time-off on a specific date
        /// </summary>
        /// <param name="agentId">The unique identifier of the agent</param>
        /// <param name="date">The date to check for time-off</param>
        /// <returns>True if the agent is on approved time-off, false otherwise</returns>
        public async Task<bool> IsAgentOnTimeOffAsync(int agentId, DateTime date)
        {
            return await _context.AgentTimeOffs
                .AnyAsync(to => to.AgentId == agentId &&
                               to.StartDate <= date &&
                               to.EndDate >= date &&
                               to.IsApproved);
        }
    }
}