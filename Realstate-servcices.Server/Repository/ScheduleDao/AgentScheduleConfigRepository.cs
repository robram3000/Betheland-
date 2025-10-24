
using Microsoft.EntityFrameworkCore;
using Realstate_servcices.Server.Data;
using Realstate_servcices.Server.Entity.Schedule;

namespace Realstate_servcices.Server.Repositories
{
    /// <summary>
    /// Repository for managing agent scheduling configuration settings
    /// </summary>
    /// <remarks>
    /// Handles agent-specific scheduling preferences and constraints
    /// </remarks>
    public interface IAgentScheduleConfigRepository
    {
        /// <summary>
        /// Retrieves a schedule configuration by its unique identifier
        /// </summary>
        /// <param name="id">The unique identifier of the configuration</param>
        /// <returns>The schedule configuration or null if not found</returns>
        Task<AgentScheduleConfig> GetByIdAsync(int id);

        /// <summary>
        /// Retrieves the schedule configuration for a specific agent
        /// </summary>
        /// <param name="agentId">The unique identifier of the agent</param>
        /// <returns>The agent's schedule configuration or null if not found</returns>
        Task<AgentScheduleConfig> GetByAgentIdAsync(int agentId);

        /// <summary>
        /// Retrieves all schedule configurations from the database
        /// </summary>
        /// <returns>A collection of all schedule configurations</returns>
        Task<IEnumerable<AgentScheduleConfig>> GetAllAsync();

        /// <summary>
        /// Adds a new schedule configuration to the database
        /// </summary>
        /// <param name="config">The configuration to add</param>
        /// <returns>The added configuration with updated identifiers</returns>
        Task<AgentScheduleConfig> AddAsync(AgentScheduleConfig config);

        /// <summary>
        /// Updates an existing schedule configuration in the database
        /// </summary>
        /// <param name="config">The configuration to update</param>
        /// <returns>The updated configuration</returns>
        Task<AgentScheduleConfig> UpdateAsync(AgentScheduleConfig config);

        /// <summary>
        /// Deletes a schedule configuration from the database
        /// </summary>
        /// <param name="id">The unique identifier of the configuration to delete</param>
        /// <returns>True if deletion was successful, false if the configuration was not found</returns>
        Task<bool> DeleteAsync(int id);

        /// <summary>
        /// Checks if a configuration exists for a specific agent
        /// </summary>
        /// <param name="agentId">The unique identifier of the agent</param>
        /// <returns>True if a configuration exists for the agent, false otherwise</returns>
        Task<bool> ConfigExistsForAgentAsync(int agentId);
    }

    /// <summary>
    /// Repository implementation for AgentScheduleConfig entity management
    /// </summary>
    /// <remarks>
    /// Provides data access operations for agent scheduling preferences and constraints
    /// </remarks>
    public class AgentScheduleConfigRepository : IAgentScheduleConfigRepository
    {
        private readonly ApplicationDbContext _context;

        /// <summary>
        /// Initializes a new instance of the AgentScheduleConfigRepository
        /// </summary>
        /// <param name="context">The database context to use for data operations</param>
        public AgentScheduleConfigRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Retrieves a schedule configuration by its unique identifier
        /// </summary>
        /// <param name="id">The unique identifier of the configuration</param>
        /// <returns>The schedule configuration or null if not found</returns>
        public async Task<AgentScheduleConfig> GetByIdAsync(int id)
        {
            return await _context.AgentScheduleConfigs.FindAsync(id);
        }

        /// <summary>
        /// Retrieves the schedule configuration for a specific agent
        /// </summary>
        /// <param name="agentId">The unique identifier of the agent</param>
        /// <returns>The agent's schedule configuration or null if not found</returns>
        public async Task<AgentScheduleConfig> GetByAgentIdAsync(int agentId)
        {
            return await _context.AgentScheduleConfigs
                .FirstOrDefaultAsync(c => c.AgentId == agentId);
        }

        /// <summary>
        /// Retrieves all schedule configurations from the database
        /// </summary>
        /// <returns>A collection of all schedule configurations</returns>
        public async Task<IEnumerable<AgentScheduleConfig>> GetAllAsync()
        {
            return await _context.AgentScheduleConfigs.ToListAsync();
        }

        /// <summary>
        /// Adds a new schedule configuration to the database
        /// </summary>
        /// <param name="config">The configuration to add</param>
        /// <returns>The added configuration with updated identifiers</returns>
        public async Task<AgentScheduleConfig> AddAsync(AgentScheduleConfig config)
        {
            _context.AgentScheduleConfigs.Add(config);
            await _context.SaveChangesAsync();
            return config;
        }

        /// <summary>
        /// Updates an existing schedule configuration in the database
        /// </summary>
        /// <param name="config">The configuration to update</param>
        /// <returns>The updated configuration</returns>
        public async Task<AgentScheduleConfig> UpdateAsync(AgentScheduleConfig config)
        {
            _context.AgentScheduleConfigs.Update(config);
            await _context.SaveChangesAsync();
            return config;
        }

        /// <summary>
        /// Deletes a schedule configuration from the database
        /// </summary>
        /// <param name="id">The unique identifier of the configuration to delete</param>
        /// <returns>True if deletion was successful, false if the configuration was not found</returns>
        public async Task<bool> DeleteAsync(int id)
        {
            var config = await _context.AgentScheduleConfigs.FindAsync(id);
            if (config == null)
                return false;

            _context.AgentScheduleConfigs.Remove(config);
            await _context.SaveChangesAsync();
            return true;
        }

        /// <summary>
        /// Checks if a configuration exists for a specific agent
        /// </summary>
        /// <param name="agentId">The unique identifier of the agent</param>
        /// <returns>True if a configuration exists for the agent, false otherwise</returns>
        public async Task<bool> ConfigExistsForAgentAsync(int agentId)
        {
            return await _context.AgentScheduleConfigs
                .AnyAsync(c => c.AgentId == agentId);
        }
    }
}