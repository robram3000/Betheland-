using Microsoft.AspNetCore.Mvc;
using Realstate_servcices.Server.Dto.Login;
using Realstate_servcices.Server.Dto.Jwt;
using Realstate_servcices.Server.Services.Security;
using Realstate_servcices.Server.Repository.UserDAO;
using Realstate_servcices.Server.Entity.Member;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authorization;

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
                    new Claim(ClaimTypes.NameIdentifier, baseMember.Id.ToString() ?? "0"),
                    new Claim(ClaimTypes.Email, baseMember.Email ?? ""),
                    new Claim(ClaimTypes.Name, baseMember.Username ?? ""),
                    new Claim(ClaimTypes.Role, baseMember.Role ?? "Client"),
                    new Claim("userId", baseMember.Id.ToString() ?? "0")
                };

                var accessToken = _jwtService.GenerateAccessToken(claims);
                var refreshToken = _jwtService.GenerateRefreshToken();

                // **Store session data**
                HttpContext.Session.SetString("UserId", baseMember.Id.ToString());
                HttpContext.Session.SetString("UserEmail", baseMember.Email ?? "");
                HttpContext.Session.SetString("UserName", baseMember.Username ?? "");
                HttpContext.Session.SetString("UserRole", baseMember.Role ?? "Client");
                HttpContext.Session.SetString("ProfilePicture", baseMember.ProfilePictureUrl ?? "");
                HttpContext.Session.SetString("IsAuthenticated", "true");

                // Store refresh token in session (in production, consider using distributed cache)
                HttpContext.Session.SetString("RefreshToken", refreshToken);

                // Store login timestamp
                HttpContext.Session.SetString("LoginTime", DateTime.UtcNow.ToString("o"));

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
                    sessionId = HttpContext.Session.Id,
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

                // Check if refresh token matches the one in session
                var storedRefreshToken = HttpContext.Session.GetString("RefreshToken");
                if (storedRefreshToken != request.RefreshToken)
                {
                    return Unauthorized(new
                    {
                        success = false,
                        message = "Invalid refresh token"
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
                    new Claim(ClaimTypes.NameIdentifier, baseMember.Id.ToString() ?? "0"),
                    new Claim(ClaimTypes.Email, baseMember.Email ?? ""),
                    new Claim(ClaimTypes.Name, baseMember.Username ?? ""),
                    new Claim(ClaimTypes.Role, baseMember.Role ?? "Client"),
                };

                var newAccessToken = _jwtService.GenerateAccessToken(newClaims);
                var newRefreshToken = _jwtService.GenerateRefreshToken();

                // Update refresh token in session
                HttpContext.Session.SetString("RefreshToken", newRefreshToken);

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
        [Authorize]
        public async Task<ActionResult> Logout()
        {
            try
            {
                // Clear all session data
                HttpContext.Session.Clear();

                // Optional: Remove the session cookie
                Response.Cookies.Delete(".AspNetCore.Session");

                return Ok(new
                {
                    success = true,
                    message = "Logged out successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during logout");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Error during logout",
                    error = ex.Message
                });
            }
        }

        [HttpGet("session-info")]
        [Authorize]
        public ActionResult GetSessionInfo()
        {
            var sessionInfo = new
            {
                SessionId = HttpContext.Session.Id,
                IsAuthenticated = HttpContext.Session.GetString("IsAuthenticated"),
                UserId = HttpContext.Session.GetString("UserId"),
                UserName = HttpContext.Session.GetString("UserName"),
                UserEmail = HttpContext.Session.GetString("UserEmail"),
                UserRole = HttpContext.Session.GetString("UserRole"),
                LoginTime = HttpContext.Session.GetString("LoginTime"),
                SessionKeys = HttpContext.Session.Keys
            };

            return Ok(new
            {
                success = true,
                data = sessionInfo
            });
        }

        [HttpGet("check-auth")]
        public ActionResult CheckAuthentication()
        {
            var isAuthenticated = HttpContext.Session.GetString("IsAuthenticated") == "true";

            return Ok(new
            {
                success = true,
                isAuthenticated = isAuthenticated,
                userId = isAuthenticated ? HttpContext.Session.GetString("UserId") : null,
                userRole = isAuthenticated ? HttpContext.Session.GetString("UserRole") : null
            });
        }
    }
}