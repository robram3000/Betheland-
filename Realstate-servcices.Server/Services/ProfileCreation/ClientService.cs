using Realstate_servcices.Server.Dto.Register;
using Realstate_servcices.Server.Dto.OTP;
using Realstate_servcices.Server.Entity.member;
using Realstate_servcices.Server.Repository.UserDAO;
using Realstate_servcices.Server.Services.ProfileCreation;
using Realstate_servcices.Server.Services.SMTP.interfaces;

namespace Realstate_servcices.Server.Services.ProfileCreation
{
    public class ClientService : IClientService
    {
        private readonly IBaseMemberRepository _baseMemberRepository;
        private readonly IClientRepository _clientRepository;
        private readonly IOTPService _otpService;

        public ClientService(
            IBaseMemberRepository baseMemberRepository,
            IClientRepository clientRepository,
            IOTPService otpService)
        {
            _baseMemberRepository = baseMemberRepository;
            _clientRepository = clientRepository;
            _otpService = otpService;
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

                // Hash password
                var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

                // Create BaseMember
                var baseMember = await _baseMemberRepository.CreateBaseMemberAsync(
                    request.Email, request.Username, passwordHash, "Client");

                // Create Client
                var client = await _clientRepository.CreateClientAsync(request, baseMember.Id);

                return new RegisterResponse
                {
                    Success = true,
                    Message = "Client created successfully",
                    UserId = client.Id.ToString()
                };
            }
            catch (Exception ex)
            {
                return new RegisterResponse
                {
                    Success = false,
                    Message = $"Error creating client: {ex.Message}"
                };
            }
        }

        public async Task<ClientResponse?> GetClientAsync(int id)
        {
            var client = await _clientRepository.GetClientByIdAsync(id);
            if (client == null) return null;

            return new ClientResponse
            {
                Id = client.Id,
                Email = client.BaseMember.Email,
                Username = client.BaseMember.Username,
                FirstName = client.FirstName,
                LastName = client.LastName,
                CellPhoneNo = client.CellPhoneNo,
                Country = client.Country,
                City = client.City,
                Street = client.Street,
                ZipCode = client.ZipCode,
                Status = client.BaseMember.status,
                CreatedAt = client.BaseMember.CreatedAt
            };
        }

        public async Task<List<ClientResponse>> GetAllClientsAsync()
        {
            var clients = await _clientRepository.GetAllClientsAsync();
            return clients.Select(client => new ClientResponse
            {
                Id = client.Id,
                Email = client.BaseMember.Email,
                Username = client.BaseMember.Username,
                FirstName = client.FirstName,
                LastName = client.LastName,
                CellPhoneNo = client.CellPhoneNo,
                Country = client.Country,
                City = client.City,
                Street = client.Street,
                ZipCode = client.ZipCode,
                Status = client.BaseMember.status,
                CreatedAt = client.BaseMember.CreatedAt
            }).ToList();
        }

        public async Task<RegisterResponse> UpdateClientAsync(int id, ClientUpdateRequest request)
        {
            try
            {
                var client = await _clientRepository.GetClientByIdAsync(id);
                if (client == null)
                {
                    return new RegisterResponse { Success = false, Message = "Client not found" };
                }

                await _clientRepository.UpdateClientAsync(id, request);
                return new RegisterResponse { Success = true, Message = "Client updated successfully" };
            }
            catch (Exception ex)
            {
                return new RegisterResponse { Success = false, Message = $"Error updating client: {ex.Message}" };
            }
        }

        public async Task<RegisterResponse> UpdateClientStatusAsync(int id, string status)
        {
            try
            {
                var client = await _clientRepository.GetClientByIdAsync(id);
                if (client == null)
                {
                    return new RegisterResponse { Success = false, Message = "Client not found" };
                }

                await _baseMemberRepository.UpdateBaseMemberStatusAsync(client.BaseMemberId, status);
                return new RegisterResponse { Success = true, Message = "Client status updated successfully" };
            }
            catch (Exception ex)
            {
                return new RegisterResponse { Success = false, Message = $"Error updating client status: {ex.Message}" };
            }
        }

        public async Task<RegisterResponse> DeleteClientAsync(int id)
        {
            try
            {
                var success = await _clientRepository.DeleteClientAsync(id);
                if (!success)
                {
                    return new RegisterResponse { Success = false, Message = "Client not found" };
                }

                return new RegisterResponse { Success = true, Message = "Client deleted successfully" };
            }
            catch (Exception ex)
            {
                return new RegisterResponse { Success = false, Message = $"Error deleting client: {ex.Message}" };
            }
        }
    }
}