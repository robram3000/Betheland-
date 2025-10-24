using Realstate_servcices.Server.Entity.Member;

namespace Realstate_servcices.Server.Repository.UserDAO
{
    /// <summary>
    /// Interface for BaseMember repository operations
    /// Defines contract for base member data access
    /// </summary>
    public interface IBaseMemberRepository
    {
        /// <summary>
        /// Creates a new base member with basic information
        /// </summary>
        Task<BaseMember> CreateBaseMemberAsync(string email, string username, string passwordHash, string role);

        /// <summary>
        /// Creates a new base member specifically for agents with profile picture
        /// </summary>
        Task<BaseMember> CreateBaseAgentMemberAsync(string email, string username, string passwordHash, string profilePictureUrl, string role);

        /// <summary>
        /// Updates the status of a base member
        /// </summary>
        Task<BaseMember> UpdateBaseMemberStatusAsync(int id, string status);

        /// <summary>
        /// Checks if an email address already exists
        /// </summary>
        Task<bool> EmailExistsAsync(string email);

        /// <summary>
        /// Checks if a username already exists
        /// </summary>
        Task<bool> UsernameExistsAsync(string username);

        /// <summary>
        /// Finds a base member by email address
        /// </summary>
        Task<BaseMember?> FindByEmailAsync(string email);

        /// <summary>
        /// Finds a base member by username
        /// </summary>
        Task<BaseMember?> FindByUsernameAsync(string username);

        /// <summary>
        /// Finds a base member by either username or email
        /// </summary>
        Task<BaseMember?> FindByUsernameOrEmailAsync(string usernameOrEmail);

        /// <summary>
        /// Retrieves a base member by email address
        /// </summary>
        Task<BaseMember?> GetBaseMemberByEmailAsync(string email);

        /// <summary>
        /// Updates the password for a base member
        /// </summary>
        Task<bool> UpdatePasswordAsync(int id, string newPasswordHash);

        /// <summary>
        /// Updates the profile picture for a base member
        /// </summary>
        Task<bool> UpdateProfilePictureAsync(int id, string profilePictureUrl);

        /// <summary>
        /// Retrieves a base member by ID
        /// </summary>
        Task<BaseMember?> GetBaseMemberByIdAsync(int id);

        Task<BaseMember?> GetByIdAsync(int id);
        Task<BaseMember?> GetByEmailAsync(string email);
        Task<List<BaseMember>> GetByIdsAsync(List<int> ids);
    }
}