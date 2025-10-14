// BaseMemberRepository.cs
using Microsoft.EntityFrameworkCore;
using Realstate_servcices.Server.Data;
using Realstate_servcices.Server.Entity.Member;

namespace Realstate_servcices.Server.Repository.UserDAO
{
    public class BaseMemberRepository : IBaseMemberRepository
    {
        private readonly ApplicationDbContext _context;

        public BaseMemberRepository(ApplicationDbContext context)
        {
            _context = context;
        }

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

        public async Task<bool> EmailExistsAsync(string email)
        {
            return await _context.BaseMembers.AnyAsync(b => b.Email == email);
        }

        public async Task<bool> UsernameExistsAsync(string username)
        {
            return await _context.BaseMembers.AnyAsync(b => b.Username == username);
        }

        public async Task<BaseMember?> FindByEmailAsync(string email)
        {
            return await _context.BaseMembers
                .FirstOrDefaultAsync(b => b.Email == email);
        }

        public async Task<BaseMember?> FindByUsernameAsync(string username)
        {
            return await _context.BaseMembers
                .FirstOrDefaultAsync(b => b.Username == username);
        }

        public async Task<BaseMember?> FindByUsernameOrEmailAsync(string usernameOrEmail)
        {
            return await _context.BaseMembers
                .FirstOrDefaultAsync(b => b.Username == usernameOrEmail || b.Email == usernameOrEmail);
        }

        public async Task<BaseMember?> GetBaseMemberByEmailAsync(string email)
        {
            return await _context.BaseMembers
                .FirstOrDefaultAsync(bm => bm.Email == email);
        }

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

        public async Task<BaseMember?> GetBaseMemberByIdAsync(int id)
        {
            return await _context.BaseMembers
                .FirstOrDefaultAsync(b => b.Id == id);
        }
    }
}