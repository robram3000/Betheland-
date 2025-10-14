// ClientRepository.cs - FIXED VERSION
using Microsoft.EntityFrameworkCore;
using Realstate_servcices.Server.Data;
using Realstate_servcices.Server.Dto.Register;
using Realstate_servcices.Server.Entity.member;

namespace Realstate_servcices.Server.Repository.UserDAO
{
    public class ClientRepository : IClientRepository
    {
        private readonly ApplicationDbContext _context;

        public ClientRepository(ApplicationDbContext context)
        {
            _context = context;
        }

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

        // Get client by BaseMemberId
        public async Task<Client?> GetClientByIdAsync(int baseMemberId)
        {
            return await _context.Clients
                .Include(c => c.BaseMember)
                .FirstOrDefaultAsync(c => c.BaseMemberId == baseMemberId);
        }

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
                // Log the error
                Console.WriteLine($"Error retrieving client: {ex.Message}");
                return null;
            }
        }

        public async Task<List<Client>> GetAllClientsAsync()
        {
            return await _context.Clients
                .Include(c => c.BaseMember)
                .ToListAsync();
        }

        public async Task<Client> UpdateClientAsync(int baseMemberId, ClientUpdateRequest request)
        {
            var client = await _context.Clients
                .FirstOrDefaultAsync(c => c.BaseMemberId == baseMemberId);

            if (client == null)
                throw new ArgumentException($"Client with BaseMemberId {baseMemberId} not found");

            // Update all properties including MiddleName, Suffix, and Gender
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

            var baseMember = await _context.BaseMembers.FindAsync(client.BaseMemberId);
            if (baseMember != null)
            {
                baseMember.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return client;
        }

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

        public async Task<bool> ClientExistsAsync(int baseMemberId)
        {
            return await _context.Clients.AnyAsync(c => c.BaseMemberId == baseMemberId);
        }

        public async Task<bool> ClientExistsByClientIdAsync(int clientId)
        {
            return await _context.Clients.AnyAsync(c => c.Id == clientId);
        }
    }
}