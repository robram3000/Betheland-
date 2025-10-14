// LoginController.cs
using Microsoft.AspNetCore.Mvc;
using Realstate_servcices.Server.Dto.Login;
using Realstate_servcices.Server.Dto.Jwt;
using Realstate_servcices.Server.Services.Security;
using Realstate_servcices.Server.Repository.UserDAO;
using Realstate_servcices.Server.Entity.Member;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;

namespace Realstate_servcices.Server.Controllers.Security
{
    [ApiController]
    [Route("api/[controller]")]
    public class LoginController : ControllerBase
    {
        private readonly IBaseMemberRepository _baseMemberRepository;
        private readonly IClientRepository _clientRepository;
        private readonly IJwtService _jwtService;
        private readonly ILogger<LoginController> _logger;

        public LoginController(
            IBaseMemberRepository baseMemberRepository,
            IClientRepository clientRepository,
            IJwtService jwtService,
            ILogger<LoginController> logger)
        {
            _baseMemberRepository = baseMemberRepository;
            _clientRepository = clientRepository;
            _jwtService = jwtService;
            _logger = logger;
        }

        [HttpPost("login")]
        public async Task<ActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                // Validate input
                if (string.IsNullOrWhiteSpace(request.UsernameOrEmail) || string.IsNullOrWhiteSpace(request.Password))
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Username/email and password are required"
                    });
                }

                var baseMember = await _baseMemberRepository.FindByUsernameOrEmailAsync(request.UsernameOrEmail);
                if (baseMember == null)
                {
                    return Unauthorized(new
                    {
                        success = false,
                        message = "Invalid credentials"
                    });
                }

                // Verify password with null check
                if (string.IsNullOrEmpty(baseMember.PasswordHash) ||
                    !BCrypt.Net.BCrypt.Verify(request.Password, baseMember.PasswordHash))
                {
                    return Unauthorized(new
                    {
                        success = false,
                        message = "Invalid credentials"
                    });
                }

                // Check if user is active
                if (baseMember.status != "Active")
                {
                    return Unauthorized(new
                    {
                        success = false,
                        message = "Account is not active. Please contact administrator."
                    });
                }

                // Generate claims with comprehensive null checks
                var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, baseMember.Id.ToString() ?? ""),
            new Claim(ClaimTypes.Email, baseMember.Email ?? ""),
            new Claim(ClaimTypes.Name, baseMember.Username ?? ""),
            new Claim(ClaimTypes.Role, baseMember.Role ?? "Client"),
            new Claim("userId", baseMember.Id.ToString() ?? "")
        };

                var accessToken = _jwtService.GenerateAccessToken(claims);
                var refreshToken = _jwtService.GenerateRefreshToken();

                // FIXED: Proper logging
                _logger.LogInformation("_____image url data: {ProfilePictureUrl}", baseMember.ProfilePictureUrl ?? "null");
           
                var response = new
                {
                    success = true,
                    accessToken = accessToken,
                    refreshToken = refreshToken,
                    expiresAt = DateTime.UtcNow.AddMinutes(60),
                    tokenType = "Bearer",
                    userId = baseMember.Id.ToString(),
                    email = baseMember.Email,
                    userType = baseMember.Role,
                    ImageProfile = baseMember.ProfilePictureUrl, 
                    message = "Login successful"
                };
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Login error for user: {Username}", request.UsernameOrEmail);

                return StatusCode(500, new
                {
                    success = false,
                    message = "An error occurred during login",
                    error = ex.Message
                });
            }
        }

        [HttpPost("refresh-token")]
        public async Task<ActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.AccessToken) || string.IsNullOrEmpty(request.RefreshToken))
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Access token and refresh token are required"
                    });
                }

                var principal = _jwtService.GetPrincipalFromExpiredToken(request.AccessToken);
                var userId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new
                    {
                        success = false,
                        message = "Invalid token"
                    });
                }

      
                var baseMember = await _baseMemberRepository.FindByUsernameOrEmailAsync(userId);
                if (baseMember == null)
                {
                    return Unauthorized(new
                    {
                        success = false,
                        message = "User not found"
                    });
                }
                var newClaims = new List<Claim>
                {
                    new Claim(ClaimTypes.NameIdentifier, baseMember.Id.ToString()),
                    new Claim(ClaimTypes.Email, baseMember.Email ?? string.Empty),
                    new Claim(ClaimTypes.Name, baseMember.Username ?? string.Empty),
                    new Claim(ClaimTypes.Role, baseMember.Role ?? "Client"),
                  
                };

                var newAccessToken = _jwtService.GenerateAccessToken(newClaims);
                var newRefreshToken = _jwtService.GenerateRefreshToken();
                Console.WriteLine("____photourl :" , baseMember  );
            
                var response = new
                {
                    success = true,
                    accessToken = newAccessToken,
                    refreshToken = newRefreshToken,
                    expiresAt = DateTime.UtcNow.AddMinutes(60),
                    tokenType = "Bearer",
                    userId = baseMember.Id.ToString(),
                    email = baseMember.Email,
                    username = baseMember.Username,
                    userType = baseMember.Role,
                    ImageProfile = baseMember.ProfilePictureUrl, 
                    message = "Token refreshed successfully"
                };

                return Ok(response);
            }
            catch (SecurityTokenException ex)
            {
                return Unauthorized(new
                {
                    success = false,
                    message = "Invalid token",
                    error = ex.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "An error occurred during token refresh",
                    error = ex.Message
                });
            }
        }
        [HttpPost("logout")]
        public async Task<ActionResult> Logout()
        {      
            return Ok(new
            {
                success = true,
                message = "Logged out successfully"
            });
        }
    }
}