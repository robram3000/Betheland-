// IBaseMemberRepository.cs
using Realstate_servcices.Server.Entity.Member;

namespace Realstate_servcices.Server.Repository.UserDAO
{
    public interface IBaseMemberRepository
    {
        Task<BaseMember> CreateBaseMemberAsync(string email, string username, string passwordHash, string role);
        Task<BaseMember> UpdateBaseMemberStatusAsync(int id, string status);
        Task<bool> EmailExistsAsync(string email);
        Task<bool> UsernameExistsAsync(string username);

        // Add these methods for login functionality
        Task<BaseMember?> FindByEmailAsync(string email);
        Task<BaseMember?> FindByUsernameAsync(string username);
        Task<BaseMember?> FindByUsernameOrEmailAsync(string usernameOrEmail);

        Task<BaseMember?> GetBaseMemberByEmailAsync(string email);
        Task UpdatePasswordAsync(int id, string newPasswordHash);
    }
}