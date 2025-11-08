using Realstate_servcices.Server.Data;
using Realstate_servcices.Server.Dto.ConfigLandingpage;
using Realstate_servcices.Server.Entity.landingpage.PartConfig;
using Microsoft.EntityFrameworkCore;

namespace Realstate_servcices.Server.Repository.ContentLandingPage
{
    public interface IPartnershipContentRepository
    {
        Task<PartnershipContentDto> GetPartnershipContentAsync();
        Task<List<PartnerResponseDto>> GetAllPartnersAsync();
        Task<PartnerResponseDto?> GetPartnerByIdAsync(int id);
        Task<PartnerResponseDto> CreatePartnerAsync(CreatePartnerDto createDto);
        Task<PartnerResponseDto?> UpdatePartnerAsync(int id, UpdatePartnerDto updateDto);
        Task<bool> DeletePartnerAsync(int id);
        Task<bool> TogglePartnerStatusAsync(int id, bool isActive);
        Task<List<PartnerResponseDto>> GetActivePartnersAsync();
        Task<bool> PartnerExistsAsync(int id);
        Task<bool> PartnerNameExistsAsync(string name, int? excludeId = null);
    }
    public class PartnershipContentRepository : IPartnershipContentRepository
    {
        private readonly ApplicationDbContext _context;

        public PartnershipContentRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<PartnershipContentDto> GetPartnershipContentAsync()
        {
            var partners = await _context.Partners
                .Where(p => p.IsActive)
                .OrderBy(p => p.DisplayOrder)
                .ThenBy(p => p.Name)
                .Select(p => new PartnerDto
                {
                    Name = p.Name,
                    Logo = p.LogoUrl,
                    Category = p.Category
                })
                .ToListAsync();

            return new PartnershipContentDto
            {
                Title = "Our Trusted Partners",
                Description = "Collaborating with the Philippines' leading real estate developers and brokers to bring you the best properties.",
                Partners = partners
            };
        }

        public async Task<List<PartnerResponseDto>> GetAllPartnersAsync()
        {
            return await _context.Partners
                .OrderBy(p => p.DisplayOrder)
                .ThenBy(p => p.Name)
                .Select(p => new PartnerResponseDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    LogoUrl = p.LogoUrl,
                    Category = p.Category,
                    DisplayOrder = p.DisplayOrder,
                    IsActive = p.IsActive,
                    CreatedAt = p.CreatedAt,
                    UpdatedAt = p.UpdatedAt
                })
                .ToListAsync();
        }

        public async Task<PartnerResponseDto?> GetPartnerByIdAsync(int id)
        {
            return await _context.Partners
                .Where(p => p.Id == id)
                .Select(p => new PartnerResponseDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    LogoUrl = p.LogoUrl,
                    Category = p.Category,
                    DisplayOrder = p.DisplayOrder,
                    IsActive = p.IsActive,
                    CreatedAt = p.CreatedAt,
                    UpdatedAt = p.UpdatedAt
                })
                .FirstOrDefaultAsync();
        }

        public async Task<PartnerResponseDto> CreatePartnerAsync(CreatePartnerDto createDto)
        {
            var partner = new Partner
            {
                Name = createDto.Name,
                LogoUrl = createDto.LogoUrl,
                Category = createDto.Category,
                DisplayOrder = createDto.DisplayOrder,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Partners.Add(partner);
            await _context.SaveChangesAsync();

            return new PartnerResponseDto
            {
                Id = partner.Id,
                Name = partner.Name,
                LogoUrl = partner.LogoUrl,
                Category = partner.Category,
                DisplayOrder = partner.DisplayOrder,
                IsActive = partner.IsActive,
                CreatedAt = partner.CreatedAt,
                UpdatedAt = partner.UpdatedAt
            };
        }

        public async Task<PartnerResponseDto?> UpdatePartnerAsync(int id, UpdatePartnerDto updateDto)
        {
            var partner = await _context.Partners.FindAsync(id);
            if (partner == null) return null;

            if (!string.IsNullOrEmpty(updateDto.Name))
                partner.Name = updateDto.Name;

            if (!string.IsNullOrEmpty(updateDto.LogoUrl))
                partner.LogoUrl = updateDto.LogoUrl;

            if (!string.IsNullOrEmpty(updateDto.Category))
                partner.Category = updateDto.Category;

            if (updateDto.DisplayOrder.HasValue)
                partner.DisplayOrder = updateDto.DisplayOrder.Value;

            if (updateDto.IsActive.HasValue)
                partner.IsActive = updateDto.IsActive.Value;

            partner.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return new PartnerResponseDto
            {
                Id = partner.Id,
                Name = partner.Name,
                LogoUrl = partner.LogoUrl,
                Category = partner.Category,
                DisplayOrder = partner.DisplayOrder,
                IsActive = partner.IsActive,
                CreatedAt = partner.CreatedAt,
                UpdatedAt = partner.UpdatedAt
            };
        }

        public async Task<bool> DeletePartnerAsync(int id)
        {
            var partner = await _context.Partners.FindAsync(id);
            if (partner == null) return false;

            _context.Partners.Remove(partner);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> TogglePartnerStatusAsync(int id, bool isActive)
        {
            var partner = await _context.Partners.FindAsync(id);
            if (partner == null) return false;

            partner.IsActive = isActive;
            partner.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<PartnerResponseDto>> GetActivePartnersAsync()
        {
            return await _context.Partners
                .Where(p => p.IsActive)
                .OrderBy(p => p.DisplayOrder)
                .ThenBy(p => p.Name)
                .Select(p => new PartnerResponseDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    LogoUrl = p.LogoUrl,
                    Category = p.Category,
                    DisplayOrder = p.DisplayOrder,
                    IsActive = p.IsActive,
                    CreatedAt = p.CreatedAt,
                    UpdatedAt = p.UpdatedAt
                })
                .ToListAsync();
        }

        public async Task<bool> PartnerExistsAsync(int id)
        {
            return await _context.Partners.AnyAsync(p => p.Id == id);
        }

        public async Task<bool> PartnerNameExistsAsync(string name, int? excludeId = null)
        {
            return await _context.Partners
                .AnyAsync(p => p.Name.ToLower() == name.ToLower() &&
                              (!excludeId.HasValue || p.Id != excludeId.Value));
        }
    }
}
