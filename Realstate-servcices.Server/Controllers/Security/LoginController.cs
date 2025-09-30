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

        public LoginController(
            IBaseMemberRepository baseMemberRepository,
            IClientRepository clientRepository,
            IJwtService jwtService)
        {
            _baseMemberRepository = baseMemberRepository;
            _clientRepository = clientRepository;
            _jwtService = jwtService;
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
        {
            try
            {
                // Validate input
                if (string.IsNullOrEmpty(request.UsernameOrEmail) || string.IsNullOrEmpty(request.Password))
                {
                    return BadRequest(new { message = "Username/email and password are required" });
                }

                // Find user by username or email using the repository method
                var baseMember = await _baseMemberRepository.FindByUsernameOrEmailAsync(request.UsernameOrEmail);
                if (baseMember == null)
                {
                    return Unauthorized(new { message = "Invalid credentials" });
                }

                // Verify password
                if (!BCrypt.Net.BCrypt.Verify(request.Password, baseMember.PasswordHash))
                {
                    return Unauthorized(new { message = "Invalid credentials" });
                }

                // Check if user is active
                if (baseMember.status != "Active")
                {
                    return Unauthorized(new { message = "Account is not active. Please contact administrator." });
                }

                // Generate claims with null checks
                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.NameIdentifier, baseMember.Id.ToString()),
                    new Claim(ClaimTypes.Email, baseMember.Email ?? string.Empty),
                    new Claim(ClaimTypes.Name, baseMember.Username ?? string.Empty),
                    new Claim(ClaimTypes.Role, baseMember.Role ?? "Client")
                };

                var accessToken = _jwtService.GenerateAccessToken(claims);
                var refreshToken = _jwtService.GenerateRefreshToken();

                var response = new AuthResponse
                {
                    AccessToken = accessToken,
                    RefreshToken = refreshToken,
                    ExpiresAt = DateTime.UtcNow.AddMinutes(60),
                    TokenType = "Bearer",
                    UserId = baseMember.Id.ToString(),
                    Email = baseMember.Email,
                    UserType = baseMember.Role
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred during login", error = ex.Message });
            }
        }

        [HttpPost("refresh-token")]
        public async Task<ActionResult<AuthResponse>> RefreshToken([FromBody] RefreshTokenRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.AccessToken) || string.IsNullOrEmpty(request.RefreshToken))
                {
                    return BadRequest(new { message = "Access token and refresh token are required" });
                }

                var principal = _jwtService.GetPrincipalFromExpiredToken(request.AccessToken);
                var userId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "Invalid token" });
                }

                // Get user from database to verify they still exist
                var baseMember = await _baseMemberRepository.FindByUsernameOrEmailAsync(userId);
                if (baseMember == null)
                {
                    return Unauthorized(new { message = "User not found" });
                }

                // Generate new claims with null checks
                var newClaims = new List<Claim>
                {
                    new Claim(ClaimTypes.NameIdentifier, baseMember.Id.ToString()),
                    new Claim(ClaimTypes.Email, baseMember.Email ?? string.Empty),
                    new Claim(ClaimTypes.Name, baseMember.Username ?? string.Empty),
                    new Claim(ClaimTypes.Role, baseMember.Role ?? "Client")
                };

                var newAccessToken = _jwtService.GenerateAccessToken(newClaims);
                var newRefreshToken = _jwtService.GenerateRefreshToken();

                var response = new AuthResponse
                {
                    AccessToken = newAccessToken,
                    RefreshToken = newRefreshToken,
                    ExpiresAt = DateTime.UtcNow.AddMinutes(60),
                    TokenType = "Bearer",
                    UserId = baseMember.Id.ToString(),
                    Email = baseMember.Email,
                    UserType = baseMember.Role
                };

                return Ok(response);
            }
            catch (SecurityTokenException ex)
            {
                return Unauthorized(new { message = "Invalid token", error = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred during token refresh", error = ex.Message });
            }
        }

        // Optional: Logout endpoint (if you want to handle server-side logout)
        [HttpPost("logout")]
        public async Task<ActionResult> Logout()
        {
            // In a real application, you might want to blacklist the token
            // or remove it from a valid tokens list
            return Ok(new { message = "Logged out successfully" });
        }
    }
}