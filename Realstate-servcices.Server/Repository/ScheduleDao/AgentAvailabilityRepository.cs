
using Microsoft.EntityFrameworkCore;
using Realstate_servcices.Server.Data;
using Realstate_servcices.Server.Entity.Schedule;


namespace Realstate_servcices.Server.Repositories
{
    /// <summary>
    /// Repository for managing agent availability schedules
    /// </summary>
    /// <remarks>
    /// Handles agent working hours and availability checks for scheduling appointments
    /// </remarks>
    public interface IAgentAvailabilityRepository
    {
        /// <summary>
        /// Retrieves agent availability by its unique identifier
        /// </summary>
        /// <param name="id">The unique identifier of the availability record</param>
        /// <returns>The agent availability record or null if not found</returns>
        Task<AgentAvailability> GetByIdAsync(int id);

        /// <summary>
        /// Retrieves all availability records for a specific agent
        /// </summary>
        /// <param name="agentId">The unique identifier of the agent</param>
        /// <returns>A collection of availability records for the specified agent</returns>
        Task<IEnumerable<AgentAvailability>> GetByAgentIdAsync(int agentId);

        /// <summary>
        /// Retrieves availability records for a specific agent and day of week
        /// </summary>
        /// <param name="agentId">The unique identifier of the agent</param>
        /// <param name="dayOfWeek">The day of week to filter by</param>
        /// <returns>A collection of availability records matching the criteria</returns>
        Task<IEnumerable<AgentAvailability>> GetByAgentAndDayAsync(int agentId, DayOfWeek dayOfWeek);

        /// <summary>
        /// Retrieves all agent availability records from the database
        /// </summary>
        /// <returns>A collection of all agent availability records</returns>
        Task<IEnumerable<AgentAvailability>> GetAllAsync();

        /// <summary>
        /// Adds a new agent availability record to the database
        /// </summary>
        /// <param name="availability">The availability record to add</param>
        /// <returns>The added availability record with updated identifiers</returns>
        Task<AgentAvailability> AddAsync(AgentAvailability availability);

        /// <summary>
        /// Updates an existing agent availability record in the database
        /// </summary>
        /// <param name="availability">The availability record to update</param>
        /// <returns>The updated availability record</returns>
        Task<AgentAvailability> UpdateAsync(AgentAvailability availability);

        /// <summary>
        /// Deletes an agent availability record from the database
        /// </summary>
        /// <param name="id">The unique identifier of the availability record to delete</param>
        /// <returns>True if deletion was successful, false if the record was not found</returns>
        Task<bool> DeleteAsync(int id);

        /// <summary>
        /// Deletes all availability records for a specific agent
        /// </summary>
        /// <param name="agentId">The unique identifier of the agent</param>
        /// <returns>True if deletion was successful, false if no records were found</returns>
        Task<bool> DeleteByAgentIdAsync(int agentId);

        /// <summary>
        /// Checks if an agent is available at a specific time on a given day
        /// </summary>
        /// <param name="agentId">The unique identifier of the agent</param>
        /// <param name="dayOfWeek">The day of week to check</param>
        /// <param name="time">The time to check availability for</param>
        /// <returns>True if the agent is available, false otherwise</returns>
        Task<bool> IsAgentAvailableAsync(int agentId, DayOfWeek dayOfWeek, TimeSpan time);
    }

    /// <summary>
    /// Repository implementation for AgentAvailability entity management
    /// </summary>
    /// <remarks>
    /// Provides data access operations for agent working hours and availability checks
    /// </remarks>
    public class AgentAvailabilityRepository : IAgentAvailabilityRepository
    {
        private readonly ApplicationDbContext _context;

        public AgentAvailabilityRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<AgentAvailability> GetByIdAsync(int id)
        {
            return await _context.AgentAvailabilities.FindAsync(id);
        }

        public async Task<IEnumerable<AgentAvailability>> GetByAgentIdAsync(int agentId)
        {
            return await _context.AgentAvailabilities
                .Where(a => a.AgentId == agentId)
                .OrderBy(a => a.DayOfWeek)
                .ThenBy(a => a.StartTime)
                .ToListAsync();
        }

        public async Task<IEnumerable<AgentAvailability>> GetByAgentAndDayAsync(int agentId, DayOfWeek dayOfWeek)
        {
            return await _context.AgentAvailabilities
                .Where(a => a.AgentId == agentId && a.DayOfWeek == dayOfWeek)
                .OrderBy(a => a.StartTime)
                .ToListAsync();
        }

        public async Task<IEnumerable<AgentAvailability>> GetAllAsync()
        {
            return await _context.AgentAvailabilities.ToListAsync();
        }

        public async Task<AgentAvailability> AddAsync(AgentAvailability availability)
        {
            _context.AgentAvailabilities.Add(availability);
            await _context.SaveChangesAsync();
            return availability;
        }

        public async Task<AgentAvailability> UpdateAsync(AgentAvailability availability)
        {
            _context.AgentAvailabilities.Update(availability);
            await _context.SaveChangesAsync();
            return availability;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var availability = await _context.AgentAvailabilities.FindAsync(id);
            if (availability == null)
                return false;

            _context.AgentAvailabilities.Remove(availability);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteByAgentIdAsync(int agentId)
        {
            var availabilities = await _context.AgentAvailabilities
                .Where(a => a.AgentId == agentId)
                .ToListAsync();

            if (!availabilities.Any())
                return false;

            _context.AgentAvailabilities.RemoveRange(availabilities);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> IsAgentAvailableAsync(int agentId, DayOfWeek dayOfWeek, TimeSpan time)
        {
            return await _context.AgentAvailabilities
                .AnyAsync(a => a.AgentId == agentId &&
                              a.DayOfWeek == dayOfWeek &&
                              a.StartTime <= time &&
                              a.EndTime >= time &&
                              a.IsAvailable);
        }
    }
}