
using Microsoft.EntityFrameworkCore;
using Realstate_servcices.Server.Data;
using Realstate_servcices.Server.Entity.Properties;
using Realstate_servcices.Server.Entity.Schedule;

namespace Realstate_servcices.Server.Repositories
{
    /// <summary>
    /// Repository for managing ScheduleProperties entities in the database
    /// </summary>
    /// <remarks>
    /// This repository provides CRUD operations and specialized queries for property scheduling
    /// </remarks>
    public interface ISchedulePropertiesRepository
    {
        /// <summary>
        /// Retrieves a schedule property by its unique identifier
        /// </summary>
        /// <param name="id">The unique identifier of the schedule property</param>
        /// <returns>The schedule property with related entities or null if not found</returns>
        Task<ScheduleProperties> GetByIdAsync(int id);

        /// <summary>
        /// Retrieves a schedule property by its unique schedule number
        /// </summary>
        /// <param name="scheduleNo">The globally unique schedule number</param>
        /// <returns>The schedule property with related entities or null if not found</returns>
        Task<ScheduleProperties> GetByScheduleNoAsync(Guid scheduleNo);

        /// <summary>
        /// Retrieves all schedule properties from the database
        /// </summary>
        /// <returns>A collection of all schedule properties with related entities</returns>
        Task<IEnumerable<ScheduleProperties>> GetAllAsync();

        /// <summary>
        /// Retrieves schedule properties associated with a specific agent
        /// </summary>
        /// <param name="agentId">The unique identifier of the agent</param>
        /// <returns>A collection of schedule properties for the specified agent</returns>
        Task<IEnumerable<ScheduleProperties>> GetByAgentIdAsync(int agentId);

        /// <summary>
        /// Retrieves schedule properties associated with a specific client
        /// </summary>
        /// <param name="clientId">The unique identifier of the client</param>
        /// <returns>A collection of schedule properties for the specified client</returns>
        Task<IEnumerable<ScheduleProperties>> GetByClientIdAsync(int clientId);

        /// <summary>
        /// Retrieves schedule properties associated with a specific property
        /// </summary>
        /// <param name="propertyId">The unique identifier of the property</param>
        /// <returns>A collection of schedule properties for the specified property</returns>
        Task<IEnumerable<ScheduleProperties>> GetByPropertyIdAsync(int propertyId);

        /// <summary>
        /// Retrieves schedule properties by their status
        /// </summary>
        /// <param name="status">The status to filter by (e.g., "Pending", "Confirmed", "Cancelled")</param>
        /// <returns>A collection of schedule properties with the specified status</returns>
        Task<IEnumerable<ScheduleProperties>> GetByStatusAsync(string status);

        /// <summary>
        /// Retrieves schedule properties within a specific date range
        /// </summary>
        /// <param name="startDate">The start date of the range (inclusive)</param>
        /// <param name="endDate">The end date of the range (inclusive)</param>
        /// <returns>A collection of schedule properties within the specified date range</returns>
        Task<IEnumerable<ScheduleProperties>> GetSchedulesByDateRangeAsync(DateTime startDate, DateTime endDate);

        /// <summary>
        /// Adds a new schedule property to the database
        /// </summary>
        /// <param name="schedule">The schedule property entity to add</param>
        /// <returns>The added schedule property with updated identifiers</returns>
        Task<ScheduleProperties> AddAsync(ScheduleProperties schedule);

        /// <summary>
        /// Updates an existing schedule property in the database
        /// </summary>
        /// <param name="schedule">The schedule property entity to update</param>
        /// <returns>The updated schedule property entity</returns>
        Task<ScheduleProperties> UpdateAsync(ScheduleProperties schedule);

        /// <summary>
        /// Deletes a schedule property from the database
        /// </summary>
        /// <param name="id">The unique identifier of the schedule property to delete</param>
        /// <returns>True if deletion was successful, false if the entity was not found</returns>
        Task<bool> DeleteAsync(int id);

        /// <summary>
        /// Checks if a schedule property exists in the database
        /// </summary>
        /// <param name="id">The unique identifier to check</param>
        /// <returns>True if the schedule property exists, false otherwise</returns>
        Task<bool> ExistsAsync(int id);
    }

    /// <summary>
    /// Repository implementation for ScheduleProperties entity management
    /// </summary>
    /// <remarks>
    /// Provides data access operations for ScheduleProperties using Entity Framework Core
    /// </remarks>
    public class SchedulePropertiesRepository : ISchedulePropertiesRepository
    {
        private readonly ApplicationDbContext _context;

        /// <summary>
        /// Initializes a new instance of the SchedulePropertiesRepository
        /// </summary>
        /// <param name="context">The database context to use for data operations</param>
        public SchedulePropertiesRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Retrieves a schedule property by its unique identifier
        /// </summary>
        /// <param name="id">The unique identifier of the schedule property</param>
        /// <returns>The schedule property with related entities or null if not found</returns>
        public async Task<ScheduleProperties> GetByIdAsync(int id)
        {
            return await _context.ScheduleProperties
                .Include(sp => sp.Property)
                .Include(sp => sp.Agent)
                .Include(sp => sp.Client)
                .FirstOrDefaultAsync(sp => sp.Id == id);
        }

        /// <summary>
        /// Retrieves a schedule property by its unique schedule number
        /// </summary>
        /// <param name="scheduleNo">The globally unique schedule number</param>
        /// <returns>The schedule property with related entities or null if not found</returns>
        public async Task<ScheduleProperties> GetByScheduleNoAsync(Guid scheduleNo)
        {
            return await _context.ScheduleProperties
                .Include(sp => sp.Property)
                .Include(sp => sp.Agent)
                .Include(sp => sp.Client)
                .FirstOrDefaultAsync(sp => sp.ScheduleNo == scheduleNo);
        }

        /// <summary>
        /// Retrieves all schedule properties from the database
        /// </summary>
        /// <returns>A collection of all schedule properties with related entities</returns>
        public async Task<IEnumerable<ScheduleProperties>> GetAllAsync()
        {
            return await _context.ScheduleProperties
                .Include(sp => sp.Property)
                .Include(sp => sp.Agent)
                .Include(sp => sp.Client)
                .ToListAsync();
        }

        /// <summary>
        /// Retrieves schedule properties associated with a specific agent
        /// </summary>
        /// <param name="agentId">The unique identifier of the agent</param>
        /// <returns>A collection of schedule properties for the specified agent</returns>
        public async Task<IEnumerable<ScheduleProperties>> GetByAgentIdAsync(int agentId)
        {
            return await _context.ScheduleProperties
                .Include(sp => sp.Property)
                .Include(sp => sp.Agent)
                .Include(sp => sp.Client)
                .Where(sp => sp.AgentId == agentId)
                .ToListAsync();
        }

        /// <summary>
        /// Retrieves schedule properties associated with a specific client
        /// </summary>
        /// <param name="clientId">The unique identifier of the client</param>
        /// <returns>A collection of schedule properties for the specified client</returns>
        public async Task<IEnumerable<ScheduleProperties>> GetByClientIdAsync(int clientId)
        {
            return await _context.ScheduleProperties
                .Include(sp => sp.Property)
                .Include(sp => sp.Agent)
                .Include(sp => sp.Client)
                .Where(sp => sp.ClientId == clientId)
                .ToListAsync();
        }

        /// <summary>
        /// Retrieves schedule properties associated with a specific property
        /// </summary>
        /// <param name="propertyId">The unique identifier of the property</param>
        /// <returns>A collection of schedule properties for the specified property</returns>
        public async Task<IEnumerable<ScheduleProperties>> GetByPropertyIdAsync(int propertyId)
        {
            return await _context.ScheduleProperties
                .Include(sp => sp.Property)
                .Include(sp => sp.Agent)
                .Include(sp => sp.Client)
                .Where(sp => sp.PropertyId == propertyId)
                .ToListAsync();
        }

        /// <summary>
        /// Retrieves schedule properties by their status
        /// </summary>
        /// <param name="status">The status to filter by (e.g., "Pending", "Confirmed", "Cancelled")</param>
        /// <returns>A collection of schedule properties with the specified status</returns>
        public async Task<IEnumerable<ScheduleProperties>> GetByStatusAsync(string status)
        {
            return await _context.ScheduleProperties
                .Include(sp => sp.Property)
                .Include(sp => sp.Agent)
                .Include(sp => sp.Client)
                .Where(sp => sp.Status == status)
                .ToListAsync();
        }

        /// <summary>
        /// Retrieves schedule properties within a specific date range
        /// </summary>
        /// <param name="startDate">The start date of the range (inclusive)</param>
        /// <param name="endDate">The end date of the range (inclusive)</param>
        /// <returns>A collection of schedule properties within the specified date range</returns>
        public async Task<IEnumerable<ScheduleProperties>> GetSchedulesByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            return await _context.ScheduleProperties
                .Include(sp => sp.Property)
                .Include(sp => sp.Agent)
                .Include(sp => sp.Client)
                .Where(sp => sp.ScheduleTime >= startDate && sp.ScheduleTime <= endDate)
                .ToListAsync();
        }

        /// <summary>
        /// Adds a new schedule property to the database
        /// </summary>
        /// <param name="schedule">The schedule property entity to add</param>
        /// <returns>The added schedule property with updated identifiers</returns>
        public async Task<ScheduleProperties> AddAsync(ScheduleProperties schedule)
        {
            schedule.CreatedAt = DateTime.UtcNow;
            _context.ScheduleProperties.Add(schedule);
            await _context.SaveChangesAsync();
            return schedule;
        }

        /// <summary>
        /// Updates an existing schedule property in the database
        /// </summary>
        /// <param name="schedule">The schedule property entity to update</param>
        /// <returns>The updated schedule property entity</returns>
        public async Task<ScheduleProperties> UpdateAsync(ScheduleProperties schedule)
        {
            schedule.UpdatedAt = DateTime.UtcNow;
            _context.ScheduleProperties.Update(schedule);
            await _context.SaveChangesAsync();
            return schedule;
        }

        /// <summary>
        /// Deletes a schedule property from the database
        /// </summary>
        /// <param name="id">The unique identifier of the schedule property to delete</param>
        /// <returns>True if deletion was successful, false if the entity was not found</returns>
        public async Task<bool> DeleteAsync(int id)
        {
            var schedule = await _context.ScheduleProperties.FindAsync(id);
            if (schedule == null)
                return false;

            _context.ScheduleProperties.Remove(schedule);
            await _context.SaveChangesAsync();
            return true;
        }

        /// <summary>
        /// Checks if a schedule property exists in the database
        /// </summary>
        /// <param name="id">The unique identifier to check</param>
        /// <returns>True if the schedule property exists, false otherwise</returns>
        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.ScheduleProperties.AnyAsync(sp => sp.Id == id);
        }
    }
}