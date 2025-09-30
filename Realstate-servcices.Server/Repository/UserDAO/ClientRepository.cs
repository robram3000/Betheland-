using Microsoft.EntityFrameworkCore;
using Realstate_servcices.Server.Data;
using Realstate_servcices.Server.Dto.Register;
using Realstate_servcices.Server.Entity.member;
using Realstate_servcices.Server.Repository.UserDAO;

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
                DateRegistered = DateTime.UtcNow
            };

            _context.Clients.Add(client);
            await _context.SaveChangesAsync();
            return client;
        }

        public async Task<Client?> GetClientByIdAsync(int id)
        {
            return await _context.Clients
                .Include(c => c.BaseMember)
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<Client?> GetClientByBaseMemberIdAsync(int baseMemberId)
        {
            return await _context.Clients
                .Include(c => c.BaseMember)
                .FirstOrDefaultAsync(c => c.BaseMemberId == baseMemberId);
        }

        public async Task<List<Client>> GetAllClientsAsync()
        {
            return await _context.Clients
                .Include(c => c.BaseMember)
                .ToListAsync();
        }

        public async Task<Client> UpdateClientAsync(int id, ClientUpdateRequest request)
        {
            var client = await _context.Clients.FindAsync(id);
            if (client == null)
                throw new ArgumentException($"Client with ID {id} not found");

            client.FirstName = request.FirstName;
            client.LastName = request.LastName;
            client.CellPhoneNo = request.CellPhoneNo;
            client.Country = request.Country;
            client.City = request.City;
            client.Street = request.Street;
            client.ZipCode = request.ZipCode;

            // Update BaseMember's UpdatedAt
            var baseMember = await _context.BaseMembers.FindAsync(client.BaseMemberId);
            if (baseMember != null)
            {
                baseMember.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return client;
        }

        public async Task<bool> DeleteClientAsync(int id)
        {
            var client = await _context.Clients.FindAsync(id);
            if (client == null)
                return false;

            _context.Clients.Remove(client);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ClientExistsAsync(int id)
        {
            return await _context.Clients.AnyAsync(c => c.Id == id);
        }
    }
}