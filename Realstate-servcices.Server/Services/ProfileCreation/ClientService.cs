
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
    /// <summary>
    /// Service implementation for managing client profiles and operations
    /// </summary>
    public class ClientService : IClientService
    {
        private readonly IBaseMemberRepository _baseMemberRepository;
        private readonly IClientRepository _clientRepository;
        private readonly IProfilePictureService _profilePictureService;
        private readonly ILogger<ClientService> _logger;
        private readonly ApplicationDbContext _context;


        /// <summary>
        /// Initializes a new instance of the ClientService class
        /// </summary>
        /// <param name="baseMemberRepository">Repository for base member data operations</param>
        /// <param name="clientRepository">Repository for client-specific data operations</param>
        /// <param name="profilePictureService">Service for profile picture management</param>
        /// <param name="logger">Logger for tracking service operations and errors</param>
        /// <param name="context">Database context for entity framework operations</param>

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
        /// <summary>
        /// Creates a new client profile with validation for duplicate email and username
        /// </summary>
        /// <param name="request">Client registration data including email, username, password, and personal information</param>
        /// <returns>Registration response indicating success or failure</returns>

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

        /// <summary>
        /// Retrieves a complete client profile by base member ID including personal and base member information
        /// </summary>
        /// <param name="baseMemberId">The unique identifier of the base member</param>
        /// <returns>Client response with complete profile information or null if not found</returns>

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

        /// <summary>
        /// Retrieves all clients with their complete profile information
        /// </summary>
        /// <returns>List of all client responses with complete profile information</returns>
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
        /// <summary>
        /// Updates an existing client's profile information
        /// </summary>
        /// <param name="baseMemberId">The unique identifier of the client to update</param>
        /// <param name="request">Updated client data including personal information</param>
        /// <returns>Registration response indicating success or failure of the update</returns>
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
        /// <summary>
        /// Updates the status of a client (Active, Inactive, Suspended, etc.)
        /// </summary>
        /// <param name="baseMemberId">The unique identifier of the client</param>
        /// <param name="status">The new status to assign to the client</param>
        /// <returns>Registration response indicating success or failure</returns>
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
        /// <summary>
        /// Deletes a client profile from the system
        /// </summary>
        /// <param name="baseMemberId">The unique identifier of the client to delete</param>
        /// <returns>Registration response indicating success or failure</returns>
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

        /// <summary>
        /// Uploads a profile picture for a client using the profile picture service
        /// </summary>
        /// <param name="baseMemberId">The unique identifier of the client</param>
        /// <param name="file">The image file to upload as profile picture</param>
        /// <returns>Profile picture response with upload result and URL</returns>
        public async Task<ProfilePictureResponse> UploadProfilePictureAsync(int baseMemberId, IFormFile file)
        {
            return await _profilePictureService.UploadProfilePictureAsync(baseMemberId, file);
        }
        /// <summary>
        /// Deletes the profile picture of a client using the profile picture service
        /// </summary>
        /// <param name="baseMemberId">The unique identifier of the client</param>
        /// <returns>Profile picture response indicating success or failure</returns>
        public async Task<ProfilePictureResponse> DeleteProfilePictureAsync(int baseMemberId)
        {
            return await _profilePictureService.DeleteProfilePictureAsync(baseMemberId);
        }
        /// <summary>
        /// Retrieves the profile picture URL of a client using the profile picture service
        /// </summary>
        /// <param name="baseMemberId">The unique identifier of the client</param>
        /// <returns>Profile picture URL string or null if not found</returns>
        public async Task<string?> GetProfilePictureAsync(int baseMemberId)
        {
            return await _profilePictureService.GetProfilePictureAsync(baseMemberId);
        }
    }
}