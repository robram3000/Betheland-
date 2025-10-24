using Microsoft.EntityFrameworkCore;
using Realstate_servcices.Server.Data;
using Realstate_servcices.Server.Dto.Register;
using Realstate_servcices.Server.Entity.member;

namespace Realstate_servcices.Server.Repository.UserDAO
{
    /// <summary>
    /// Repository for managing Client entities in the database
    /// Implements IClientRepository interface for client-specific operations
    /// </summary>
    public class ClientRepository : IClientRepository
    {
        private readonly ApplicationDbContext _context;

        /// <summary>
        /// Initializes a new instance of ClientRepository
        /// </summary>
        /// <param name="context">The application database context for data access</param>
        public ClientRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Creates a new client entity in the database
        /// </summary>
        /// <param name="request">Client registration data transfer object containing client details</param>
        /// <param name="baseMemberId">The ID of the associated base member record</param>
        /// <returns>Newly created Client entity</returns>
        public async Task<Client> CreateClientAsync(ClientRegisterRequest request, int baseMemberId)
        {
            var client = new Client
            {
                BaseMemberId = baseMemberId,
                FirstName = request.FirstName,
                LastName = request.LastName,
                CellPhoneNo = request.CellPhoneNo,
                Country = request.Country,
                City = request.City,
                Street = request.Street,
                ZipCode = request.ZipCode,
                MiddleName = request.MiddleName,
                Suffix = request.Suffix,
                Gender = request.Gender,
                DateRegistered = DateTime.UtcNow
            };

            _context.Clients.Add(client);
            await _context.SaveChangesAsync();
            return client;
        }

        /// <summary>
        /// Retrieves a client by their base member ID
        /// </summary>
        /// <param name="baseMemberId">The base member ID associated with the client</param>
        /// <returns>Client entity if found, null otherwise</returns>
        public async Task<Client?> GetClientByIdAsync(int baseMemberId)
        {
            return await _context.Clients
                .Include(c => c.BaseMember)
                .FirstOrDefaultAsync(c => c.BaseMemberId == baseMemberId);
        }

        /// <summary>
        /// Retrieves a client by their base member ID with comprehensive data
        /// </summary>
        /// <param name="baseMemberId">The base member ID associated with the client</param>
        /// <returns>Client entity with all related data if found, null otherwise</returns>
        public async Task<Client?> GetClientByBaseMemberIdAsync(int baseMemberId)
        {
            try
            {
                return await _context.Clients
                    .Include(c => c.BaseMember)
                    .Where(c => c.BaseMemberId == baseMemberId)
                    .Select(c => new Client
                    {
                        Id = c.Id,
                        BaseMemberId = c.BaseMemberId,
                        ClientNo = c.ClientNo,
                        FirstName = c.FirstName ?? string.Empty,
                        MiddleName = c.MiddleName ?? string.Empty,
                        LastName = c.LastName ?? string.Empty,
                        Suffix = c.Suffix ?? string.Empty,
                        CellPhoneNo = c.CellPhoneNo ?? string.Empty,
                        Gender = c.Gender ?? string.Empty,
                        Country = c.Country ?? string.Empty,
                        City = c.City ?? string.Empty,
                        Street = c.Street ?? string.Empty,
                        ZipCode = c.ZipCode ?? string.Empty,
                        Address = c.Address ?? string.Empty,
                        DateRegistered = c.DateRegistered,
                        BaseMember = c.BaseMember,
                        Properties = c.Properties,
                        ScheduleProperties = c.ScheduleProperties,
                        Wishlists = c.Wishlists,
                        Ratings = c.Ratings
                    })
                    .AsNoTracking()
                    .FirstOrDefaultAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error retrieving client: {ex.Message}");
                return null;
            }
        }

        /// <summary>
        /// Retrieves all clients from the database
        /// </summary>
        /// <returns>List of all Client entities</returns>
        public async Task<List<Client>> GetAllClientsAsync()
        {
            return await _context.Clients
                .Include(c => c.BaseMember)
                .ToListAsync();
        }

        /// <summary>
        /// Updates an existing client's information
        /// </summary>
        /// <param name="baseMemberId">The base member ID of the client to update</param>
        /// <param name="request">Client update data transfer object containing updated fields</param>
        /// <returns>Updated Client entity</returns>
        /// <exception cref="ArgumentException">Thrown when client with specified base member ID is not found</exception>
        public async Task<Client> UpdateClientAsync(int baseMemberId, ClientUpdateRequest request)
        {
            var client = await _context.Clients
                .FirstOrDefaultAsync(c => c.BaseMemberId == baseMemberId);

            if (client == null)
                throw new ArgumentException($"Client with BaseMemberId {baseMemberId} not found");

            // Update all properties including optional fields
            if (!string.IsNullOrEmpty(request.FirstName))
                client.FirstName = request.FirstName;

            if (!string.IsNullOrEmpty(request.LastName))
                client.LastName = request.LastName;

            if (!string.IsNullOrEmpty(request.MiddleName))
                client.MiddleName = request.MiddleName;

            if (!string.IsNullOrEmpty(request.Suffix))
                client.Suffix = request.Suffix;

            if (!string.IsNullOrEmpty(request.CellPhoneNo))
                client.CellPhoneNo = request.CellPhoneNo;

            if (!string.IsNullOrEmpty(request.Gender))
                client.Gender = request.Gender;

            if (!string.IsNullOrEmpty(request.Country))
                client.Country = request.Country;

            if (!string.IsNullOrEmpty(request.City))
                client.City = request.City;

            if (!string.IsNullOrEmpty(request.Street))
                client.Street = request.Street;

            if (!string.IsNullOrEmpty(request.ZipCode))
                client.ZipCode = request.ZipCode;

            if (!string.IsNullOrEmpty(request.Address))
                client.Address = request.Address;

            // Update base member timestamp
            var baseMember = await _context.BaseMembers.FindAsync(client.BaseMemberId);
            if (baseMember != null)
            {
                baseMember.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return client;
        }

        /// <summary>
        /// Deletes a client from the database
        /// </summary>
        /// <param name="baseMemberId">The base member ID of the client to delete</param>
        /// <returns>True if deletion was successful, false if client was not found</returns>
        public async Task<bool> DeleteClientAsync(int baseMemberId)
        {
            var client = await _context.Clients
                .FirstOrDefaultAsync(c => c.BaseMemberId == baseMemberId);

            if (client == null)
                return false;

            _context.Clients.Remove(client);
            await _context.SaveChangesAsync();
            return true;
        }

        /// <summary>
        /// Checks if a client exists with the specified base member ID
        /// </summary>
        /// <param name="baseMemberId">The base member ID to check for existence</param>
        /// <returns>True if client exists, false otherwise</returns>
        public async Task<bool> ClientExistsAsync(int baseMemberId)
        {
            return await _context.Clients.AnyAsync(c => c.BaseMemberId == baseMemberId);
        }

        /// <summary>
        /// Checks if a client exists with the specified client ID
        /// </summary>
        /// <param name="clientId">The client ID to check for existence</param>
        /// <returns>True if client exists, false otherwise</returns>
        public async Task<bool> ClientExistsByClientIdAsync(int clientId)
        {
            return await _context.Clients.AnyAsync(c => c.Id == clientId);
        }
    }
}