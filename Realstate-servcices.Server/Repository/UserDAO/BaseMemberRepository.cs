using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Realstate_servcices.Server.Data;
using Realstate_servcices.Server.Entity.Member;
using Realstate_servcices.Server.Enum;

namespace Realstate_servcices.Server.Repository.UserDAO
{
    /// <summary>
    /// Repository for managing BaseMember entities in the database
    /// Implements IBaseMemberRepository interface for base member operations
    /// </summary>
    public class BaseMemberRepository : IBaseMemberRepository
    {
        private readonly ApplicationDbContext _context;

        /// <summary>
        /// Initializes a new instance of BaseMemberRepository
        /// </summary>
        /// <param name="context">The application database context for data access</param>
        public BaseMemberRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        // ADD THESE MISSING METHODS:

        /// <summary>
        /// Retrieves a base member by their ID with related entities
        /// </summary>
        /// <param name="id">The ID of the base member</param>
        /// <returns>BaseMember entity if found, null otherwise</returns>
        public async Task<BaseMember?> GetByIdAsync(int id)
        {
            return await _context.BaseMembers
                .Include(b => b.Agent)
                .Include(b => b.Client)
                .FirstOrDefaultAsync(b => b.Id == id);
        }

        /// <summary>
        /// Retrieves a base member by their email with related entities
        /// </summary>
        /// <param name="email">The email address to search for</param>
        /// <returns>BaseMember entity if found, null otherwise</returns>
        public async Task<BaseMember?> GetByEmailAsync(string email)
        {
            return await _context.BaseMembers
                .Include(b => b.Agent)
                .Include(b => b.Client)
                .FirstOrDefaultAsync(b => b.Email == email);
        }

        /// <summary>
        /// Retrieves multiple base members by their IDs
        /// </summary>
        /// <param name="ids">List of base member IDs</param>
        /// <returns>List of BaseMember entities</returns>
        public async Task<List<BaseMember>> GetByIdsAsync(List<int> ids)
        {
            return await _context.BaseMembers
                .Include(b => b.Agent)
                .Include(b => b.Client)
                .Where(b => ids.Contains(b.Id))
                .ToListAsync();
        }

        // YOUR EXISTING METHODS CONTINUE BELOW:

        /// <summary>
        /// Creates a new base member with basic information
        /// </summary>
        /// <param name="email">The email address of the member</param>
        /// <param name="username">The username for the member</param>
        /// <param name="passwordHash">The hashed password for security</param>
        /// <param name="role">The role assigned to the member (e.g., "Client", "Agent")</param>
        /// <returns>Newly created BaseMember entity</returns>
        public async Task<BaseMember> CreateBaseMemberAsync(string email, string username, string passwordHash, string role)
        {
            var baseMember = new BaseMember
            {
                Email = email,
                Username = username,
                PasswordHash = passwordHash,
                Role = role,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                status = "Active"
            };

            _context.BaseMembers.Add(baseMember);
            await _context.SaveChangesAsync();
            return baseMember;
        }

        /// <summary>
        /// Creates a new base member specifically for agents with profile picture
        /// </summary>
        /// <param name="email">The email address of the agent member</param>
        /// <param name="username">The username for the agent member</param>
        /// <param name="passwordHash">The hashed password for security</param>
        /// <param name="role">The role assigned to the member (typically "Agent")</param>
        /// <param name="profilePictureUrl">URL to the agent's profile picture</param>
        /// <returns>Newly created BaseMember entity for agent</returns>
        public async Task<BaseMember> CreateBaseAgentMemberAsync(string email, string username, string passwordHash, string role, string profilePictureUrl)
        {
            var baseMember = new BaseMember
            {
                Email = email,
                Username = username,
                PasswordHash = passwordHash,
                Role = role,
                ProfilePictureUrl = profilePictureUrl,
                status = "Active",
                CreatedAt = DateTime.UtcNow
            };

            _context.BaseMembers.Add(baseMember);
            await _context.SaveChangesAsync();
            return baseMember;
        }

        /// <summary>
        /// Updates the status of a base member
        /// </summary>
        /// <param name="id">The ID of the base member to update</param>
        /// <param name="status">The new status value (e.g., "Active", "Inactive", "Suspended")</param>
        /// <returns>Updated BaseMember entity</returns>
        /// <exception cref="ArgumentException">Thrown when base member with specified ID is not found</exception>
        public async Task<BaseMember> UpdateBaseMemberStatusAsync(int id, string status)
        {
            var baseMember = await _context.BaseMembers.FindAsync(id);
            if (baseMember == null)
                throw new ArgumentException($"BaseMember with ID {id} not found");

            baseMember.status = status;
            baseMember.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return baseMember;
        }

        /// <summary>
        /// Checks if an email address already exists in the database
        /// </summary>
        /// <param name="email">The email address to check</param>
        /// <returns>True if email exists, false otherwise</returns>
        public async Task<bool> EmailExistsAsync(string email)
        {
            return await _context.BaseMembers.AnyAsync(b => b.Email == email);
        }

        /// <summary>
        /// Checks if a username already exists in the database
        /// </summary>
        /// <param name="username">The username to check</param>
        /// <returns>True if username exists, false otherwise</returns>
        public async Task<bool> UsernameExistsAsync(string username)
        {
            return await _context.BaseMembers.AnyAsync(b => b.Username == username);
        }

        /// <summary>
        /// Finds a base member by their email address
        /// </summary>
        /// <param name="email">The email address to search for</param>
        /// <returns>BaseMember entity if found, null otherwise</returns>
        public async Task<BaseMember?> FindByEmailAsync(string email)
        {
            return await _context.BaseMembers
                .FirstOrDefaultAsync(b => b.Email == email);
        }

        /// <summary>
        /// Finds a base member by their username
        /// </summary>
        /// <param name="username">The username to search for</param>
        /// <returns>BaseMember entity if found, null otherwise</returns>
        public async Task<BaseMember?> FindByUsernameAsync(string username)
        {
            return await _context.BaseMembers
                .FirstOrDefaultAsync(b => b.Username == username);
        }

        /// <summary>
        /// Finds a base member by either username or email address
        /// </summary>
        /// <param name="usernameOrEmail">The username or email address to search for</param>
        /// <returns>BaseMember entity if found, null otherwise</returns>
        public async Task<BaseMember?> FindByUsernameOrEmailAsync(string usernameOrEmail)
        {
            return await _context.BaseMembers
                .FirstOrDefaultAsync(b => b.Username == usernameOrEmail || b.Email == usernameOrEmail);
        }

        /// <summary>
        /// Retrieves a base member by their email address
        /// </summary>
        /// <param name="email">The email address to search for</param>
        /// <returns>BaseMember entity if found, null otherwise</returns>
        public async Task<BaseMember?> GetBaseMemberByEmailAsync(string email)
        {
            return await _context.BaseMembers
                .FirstOrDefaultAsync(bm => bm.Email == email);
        }

        /// <summary>
        /// Updates the password hash for a base member
        /// </summary>
        /// <param name="id">The ID of the base member to update</param>
        /// <param name="newPasswordHash">The new hashed password</param>
        /// <returns>True if update was successful, false otherwise</returns>
        public async Task<bool> UpdatePasswordAsync(int id, string newPasswordHash)
        {
            try
            {
                var baseMember = await _context.BaseMembers.FindAsync(id);
                if (baseMember == null)
                    return false;

                baseMember.PasswordHash = newPasswordHash;
                baseMember.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating password: {ex.Message}");
                return false;
            }
        }

        /// <summary>
        /// Updates the profile picture URL for a base member
        /// </summary>
        /// <param name="id">The ID of the base member to update</param>
        /// <param name="profilePictureUrl">The new profile picture URL</param>
        /// <returns>True if update was successful, false otherwise</returns>
        public async Task<bool> UpdateProfilePictureAsync(int id, string profilePictureUrl)
        {
            try
            {
                var baseMember = await _context.BaseMembers.FindAsync(id);
                if (baseMember == null)
                    return false;

                baseMember.ProfilePictureUrl = profilePictureUrl;
                baseMember.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating profile picture: {ex.Message}");
                return false;
            }
        }

        /// <summary>
        /// Retrieves a base member by their unique identifier
        /// </summary>
        /// <param name="id">The ID of the base member to retrieve</param>
        /// <returns>BaseMember entity if found, null otherwise</returns>
        public async Task<BaseMember?> GetBaseMemberByIdAsync(int id)
        {
            return await _context.BaseMembers
                .FirstOrDefaultAsync(b => b.Id == id);
        }
    }
}