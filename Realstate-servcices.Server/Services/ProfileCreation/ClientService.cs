// ClientService.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Realstate_servcices.Server.Data;
using Realstate_servcices.Server.Dto.Register;
using Realstate_servcices.Server.Entity.member;
using Realstate_servcices.Server.Repository.UserDAO;
using Realstate_servcices.Server.Services.ProfileCreation;
using Realstate_servcices.Server.Utilities.Storage;

namespace Realstate_servcices.Server.Services.ProfileCreation
{
    public class ClientService : IClientService
    {
        private readonly IBaseMemberRepository _baseMemberRepository;
        private readonly IClientRepository _clientRepository;
        private readonly IProfilePictureService _profilePictureService;
        private readonly ILogger<ClientService> _logger;
        private readonly ApplicationDbContext _context;

        public ClientService(
            IBaseMemberRepository baseMemberRepository,
            IClientRepository clientRepository,
            IProfilePictureService profilePictureService,
            ILogger<ClientService> logger,
            ApplicationDbContext context)
        {
            _baseMemberRepository = baseMemberRepository;
            _clientRepository = clientRepository;
            _profilePictureService = profilePictureService;
            _logger = logger;
            _context = context;
        }

        public async Task<RegisterResponse> CreateClientAsync(ClientRegisterRequest request)
        {
            try
            {
                if (await _baseMemberRepository.EmailExistsAsync(request.Email))
                {
                    return new RegisterResponse { Success = false, Message = "Email already exists" };
                }

                if (await _baseMemberRepository.UsernameExistsAsync(request.Username))
                {
                    return new RegisterResponse { Success = false, Message = "Username already exists" };
                }

                var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

                var baseMember = await _baseMemberRepository.CreateBaseMemberAsync(
                    request.Email, request.Username, passwordHash, "Client");

                var client = await _clientRepository.CreateClientAsync(request, baseMember.Id);

                return new RegisterResponse
                {
                    Success = true,
                    Message = "Client created successfully",
                    UserId = baseMember.Id.ToString()
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating client");
                return new RegisterResponse
                {
                    Success = false,
                    Message = $"Error creating client: {ex.Message}"
                };
            }
        }

        public async Task<ClientResponse?> GetClientAsync(int baseMemberId)
        {
            try
            {
                var client = await _context.Clients
                    .Include(c => c.BaseMember)
                    .Where(c => c.BaseMemberId == baseMemberId)
                    .Select(c => new ClientResponse
                    {
                        Id = c.Id,
                        BaseMemberId = c.BaseMemberId,
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

                        // BaseMember properties
                        Email = c.BaseMember!.Email ?? string.Empty,
                        Username = c.BaseMember.Username ?? string.Empty,
                        ProfilePictureUrl = c.BaseMember.ProfilePictureUrl ?? string.Empty,
                        Role = c.BaseMember.Role ?? string.Empty,
                        Status = c.BaseMember.status ?? "Unknown",
                        CreatedAt = c.BaseMember.CreatedAt,
                        UpdatedAt = c.BaseMember.UpdatedAt
                    })
                    .AsNoTracking()
                    .FirstOrDefaultAsync();

                return client;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting client for BaseMemberId: {BaseMemberId}", baseMemberId);
                return null;
            }
        }

        public async Task<List<ClientResponse>> GetAllClientsAsync()
        {
            try
            {
                var clients = await _clientRepository.GetAllClientsAsync();
                return clients.Select(client => new ClientResponse
                {
                    Id = client.Id,
                    BaseMemberId = client.BaseMemberId,
                    Email = client.BaseMember?.Email ?? string.Empty,
                    Username = client.BaseMember?.Username ?? string.Empty,
                    ProfilePictureUrl = client.BaseMember?.ProfilePictureUrl ?? string.Empty,
                    FirstName = client.FirstName ?? string.Empty,
                    LastName = client.LastName ?? string.Empty,
                    MiddleName = client.MiddleName ?? string.Empty,
                    Suffix = client.Suffix ?? string.Empty,
                    CellPhoneNo = client.CellPhoneNo ?? string.Empty,
                    Country = client.Country ?? string.Empty,
                    City = client.City ?? string.Empty,
                    Street = client.Street ?? string.Empty,
                    ZipCode = client.ZipCode ?? string.Empty,
                    Gender = client.Gender ?? string.Empty,
                    Status = client.BaseMember?.status ?? "Unknown",
                    CreatedAt = client.BaseMember?.CreatedAt ?? DateTime.UtcNow,
                    DateRegistered = client.DateRegistered
                }).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all clients");
                return new List<ClientResponse>();
            }
        }

        public async Task<RegisterResponse> UpdateClientAsync(int baseMemberId, ClientUpdateRequest request)
        {
            try
            {
                var client = await _clientRepository.GetClientByIdAsync(baseMemberId);
                if (client == null)
                {
                    return new RegisterResponse { Success = false, Message = "Client not found" };
                }

                await _clientRepository.UpdateClientAsync(baseMemberId, request);
                return new RegisterResponse { Success = true, Message = "Client updated successfully" };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating client for BaseMemberId: {BaseMemberId}", baseMemberId);
                return new RegisterResponse { Success = false, Message = $"Error updating client: {ex.Message}" };
            }
        }

        public async Task<RegisterResponse> UpdateClientStatusAsync(int baseMemberId, string status)
        {
            try
            {
                var client = await _clientRepository.GetClientByIdAsync(baseMemberId);
                if (client == null)
                {
                    return new RegisterResponse { Success = false, Message = "Client not found" };
                }

                await _baseMemberRepository.UpdateBaseMemberStatusAsync(client.BaseMemberId, status);
                return new RegisterResponse { Success = true, Message = "Client status updated successfully" };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating client status for BaseMemberId: {BaseMemberId}", baseMemberId);
                return new RegisterResponse { Success = false, Message = $"Error updating client status: {ex.Message}" };
            }
        }

        public async Task<RegisterResponse> DeleteClientAsync(int baseMemberId)
        {
            try
            {
                var success = await _clientRepository.DeleteClientAsync(baseMemberId);
                if (!success)
                {
                    return new RegisterResponse { Success = false, Message = "Client not found" };
                }

                return new RegisterResponse { Success = true, Message = "Client deleted successfully" };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting client for BaseMemberId: {BaseMemberId}", baseMemberId);
                return new RegisterResponse { Success = false, Message = $"Error deleting client: {ex.Message}" };
            }
        }

        // Profile picture methods
        public async Task<ProfilePictureResponse> UploadProfilePictureAsync(int baseMemberId, IFormFile file)
        {
            return await _profilePictureService.UploadProfilePictureAsync(baseMemberId, file);
        }

        public async Task<ProfilePictureResponse> DeleteProfilePictureAsync(int baseMemberId)
        {
            return await _profilePictureService.DeleteProfilePictureAsync(baseMemberId);
        }

        public async Task<string?> GetProfilePictureAsync(int baseMemberId)
        {
            return await _profilePictureService.GetProfilePictureAsync(baseMemberId);
        }
    }
}