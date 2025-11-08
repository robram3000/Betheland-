using Realstate_servcices.Server.Dto.ConfigLandingpage;
using Realstate_servcices.Server.Entity.landingpage.announcementconfig;
using Realstate_servcices.Server.Repository.ContentLandingPage;

namespace Realstate_servcices.Server.Services.ConfigLandingpage
{
    public interface IAnnouncementService
    {
        Task<IEnumerable<AnnouncementDto>> GetActiveAnnouncementsAsync();
        Task<IEnumerable<AnnouncementDto>> GetAllAnnouncementsAsync();
        Task<AnnouncementDto?> GetAnnouncementByIdAsync(int id);
        Task<AnnouncementDto> CreateAnnouncementAsync(CreateAnnouncementDto createDto);
        Task<AnnouncementDto?> UpdateAnnouncementAsync(int id, UpdateAnnouncementDto updateDto);
        Task<bool> DeleteAnnouncementAsync(int id);
        Task<bool> ToggleAnnouncementStatusAsync(int id, bool isActive);
    }

    public class AnnouncementService : IAnnouncementService
    {
        private readonly IAnnouncementRepository _announcementRepository;

        public AnnouncementService(IAnnouncementRepository announcementRepository)
        {
            _announcementRepository = announcementRepository;
        }

        public async Task<IEnumerable<AnnouncementDto>> GetActiveAnnouncementsAsync()
        {
            var announcements = await _announcementRepository.GetAllActiveAsync();
            return announcements.Select(MapToDto);
        }

        public async Task<IEnumerable<AnnouncementDto>> GetAllAnnouncementsAsync()
        {
            var announcements = await _announcementRepository.GetAllAsync();
            return announcements.Select(MapToDto);
        }

        public async Task<AnnouncementDto?> GetAnnouncementByIdAsync(int id)
        {
            var announcement = await _announcementRepository.GetByIdAsync(id);
            return announcement == null ? null : MapToDto(announcement);
        }

        public async Task<AnnouncementDto> CreateAnnouncementAsync(CreateAnnouncementDto createDto)
        {
            var announcement = new AnnouncementConfig // Fixed: Changed from Announcements to AnnouncementConfig
            {
                Content = createDto.Content,
                DisplayOrder = createDto.DisplayOrder,
                Category = createDto.Category,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            var created = await _announcementRepository.CreateAsync(announcement);
            return MapToDto(created);
        }

        public async Task<AnnouncementDto?> UpdateAnnouncementAsync(int id, UpdateAnnouncementDto updateDto)
        {
            var announcement = await _announcementRepository.GetByIdAsync(id);
            if (announcement == null) return null;

            announcement.Content = updateDto.Content;
            announcement.IsActive = updateDto.IsActive;
            announcement.DisplayOrder = updateDto.DisplayOrder;
            announcement.Category = updateDto.Category;
            announcement.UpdatedAt = DateTime.UtcNow;

            var updated = await _announcementRepository.UpdateAsync(announcement);
            return MapToDto(updated);
        }

        public async Task<bool> DeleteAnnouncementAsync(int id)
        {
            return await _announcementRepository.DeleteAsync(id);
        }

        public async Task<bool> ToggleAnnouncementStatusAsync(int id, bool isActive)
        {
            return await _announcementRepository.ToggleStatusAsync(id, isActive);
        }

        private static AnnouncementDto MapToDto(AnnouncementConfig announcement) 
        {
            return new AnnouncementDto
            {
                Id = announcement.Id,
                Content = announcement.Content,
                DisplayOrder = announcement.DisplayOrder,
                Category = announcement.Category,
                IsActive = announcement.IsActive,
                CreatedAt = announcement.CreatedAt,
                UpdatedAt = announcement.UpdatedAt
            };
        }
    }
}