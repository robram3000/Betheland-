
using Realstate_servcices.Server.Entity.Member;

namespace Realstate_servcices.Server.Repository.UserDAO
{
    public interface IBaseMemberRepository
    {
        Task<BaseMember> CreateBaseMemberAsync(string email, string username, string passwordHash, string role);
        Task<BaseMember> UpdateBaseMemberStatusAsync(int id, string status);
        Task<bool> EmailExistsAsync(string email);
        Task<bool> UsernameExistsAsync(string username);

        Task<BaseMember?> FindByEmailAsync(string email);
        Task<BaseMember?> FindByUsernameAsync(string username);
        Task<BaseMember?> FindByUsernameOrEmailAsync(string usernameOrEmail);

        Task<BaseMember?> GetBaseMemberByEmailAsync(string email);
        Task<bool> UpdatePasswordAsync(int id, string newPasswordHash);
    }
}