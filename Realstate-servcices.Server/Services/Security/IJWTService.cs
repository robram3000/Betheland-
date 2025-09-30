using System.Security.Claims;

namespace Realstate_servcices.Server.Services.Security
{
    public interface IJwtService
    {
        string GenerateAccessToken(IEnumerable<Claim> claims);
        string GenerateRefreshToken();
        ClaimsPrincipal GetPrincipalFromExpiredToken(string token);
       
    }
}
