using Realstate_servcices.Server.Dto.ConfigLandingpage;

using Realstate_servcices.Server.Entity.landingpage;
using Realstate_servcices.Server.Entity.landingpage.Third_Section;
using Realstate_servcices.Server.Repository.ContentLandingPage;

namespace Realstate_servcices.Server.Services.ConfigLandingpage
{
    public interface IThirdSectionServices
    {
        Task<ThirdSectionDTO> GetThirdSectionAsync();
        Task<ThirdSectionDTO> UpdateThirdSectionAsync(ThirdSectionDTO thirdSectionDto);
    }

    public class ThirdSectionServices : IThirdSectionServices
    {
        private readonly IThirdSectionRepository _thirdSectionRepository;

        public ThirdSectionServices(IThirdSectionRepository thirdSectionRepository)
        {
            _thirdSectionRepository = thirdSectionRepository;
        }

        public async Task<ThirdSectionDTO> GetThirdSectionAsync()
        {
            try
            {
                var thirdSection = await _thirdSectionRepository.GetThirdSectionAsync();
                return MapToDTO(thirdSection);
            }
            catch (Exception ex)
            {
                // Log error here
                throw new Exception($"Error getting third section: {ex.Message}");
            }
        }

        public async Task<ThirdSectionDTO> UpdateThirdSectionAsync(ThirdSectionDTO thirdSectionDto)
        {
            try
            {
                var existingSection = await _thirdSectionRepository.GetThirdSectionAsync();

                if (existingSection == null)
                {
                    // Create new section with proper initialization
                    var newSection = new ThirdSection
                    {
                        Title = thirdSectionDto.Title ?? "Default Title",
                        Subtitle = thirdSectionDto.Subtitle ?? "Default Subtitle",
                        Description = thirdSectionDto.Description ?? "Default Description",
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                        ProcessSteps = thirdSectionDto.ProcessSteps?.Select(ps => new ProcessStep
                        {
                            StepNumber = ps.StepNumber,
                            Title = ps.Title ?? string.Empty,
                            Description = ps.Description ?? string.Empty,
                            Icon = ps.Icon ?? string.Empty,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        }).ToList() ?? new List<ProcessStep>(),
                        FeatureItems = thirdSectionDto.FeatureItems?.Select(fi => new FeatureItem
                        {
                            Title = fi.Title ?? string.Empty,
                            Description = fi.Description ?? string.Empty,
                            Icon = fi.Icon ?? string.Empty,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        }).ToList() ?? new List<FeatureItem>()
                    };

                    var created = await _thirdSectionRepository.UpdateThirdSectionAsync(newSection);
                    return MapToDTO(created);
                }
                else
                {
                    // Update existing section
                    var updatedSection = MapToEntity(thirdSectionDto, existingSection);
                    var result = await _thirdSectionRepository.UpdateThirdSectionAsync(updatedSection);
                    return MapToDTO(result);
                }
            }
            catch (Exception ex)
            {
                // Log error here
                throw new Exception($"Error updating third section: {ex.Message}");
            }
        }

        private ThirdSectionDTO MapToDTO(ThirdSection thirdSection)
        {
            if (thirdSection == null)
                return new ThirdSectionDTO(); // Return empty DTO instead of null

            return new ThirdSectionDTO
            {
                Id = thirdSection.Id,
                Title = thirdSection.Title ?? string.Empty,
                Subtitle = thirdSection.Subtitle ?? string.Empty,
                Description = thirdSection.Description ?? string.Empty,
                ProcessSteps = thirdSection.ProcessSteps?.Select(ps => new ProcessStepDTO
                {
                    Id = ps.Id,
                    StepNumber = ps.StepNumber,
                    Title = ps.Title ?? string.Empty,
                    Description = ps.Description ?? string.Empty,
                    Icon = ps.Icon ?? string.Empty
                }).ToList() ?? new List<ProcessStepDTO>(),
                FeatureItems = thirdSection.FeatureItems?.Select(fi => new FeatureItemDTO
                {
                    Id = fi.Id,
                    Title = fi.Title ?? string.Empty,
                    Description = fi.Description ?? string.Empty,
                    Icon = fi.Icon ?? string.Empty
                }).ToList() ?? new List<FeatureItemDTO>()
            };
        }

        private ThirdSection MapToEntity(ThirdSectionDTO dto, ThirdSection existingEntity = null)
        {
            var entity = existingEntity ?? new ThirdSection();

            entity.Title = dto.Title ?? string.Empty;
            entity.Subtitle = dto.Subtitle ?? string.Empty;
            entity.Description = dto.Description ?? string.Empty;
            entity.UpdatedAt = DateTime.UtcNow;

            // Update process steps
            if (dto.ProcessSteps != null)
            {
                entity.ProcessSteps = dto.ProcessSteps.Select(ps => new ProcessStep
                {
                    Id = ps.Id,
                    StepNumber = ps.StepNumber,
                    Title = ps.Title ?? string.Empty,
                    Description = ps.Description ?? string.Empty,
                    Icon = ps.Icon ?? string.Empty,
                    ThirdSectionId = entity.Id,
                    UpdatedAt = DateTime.UtcNow
                }).ToList();
            }

            // Update feature items
            if (dto.FeatureItems != null)
            {
                entity.FeatureItems = dto.FeatureItems.Select(fi => new FeatureItem
                {
                    Id = fi.Id,
                    Title = fi.Title ?? string.Empty,
                    Description = fi.Description ?? string.Empty,
                    Icon = fi.Icon ?? string.Empty,
                    ThirdSectionId = entity.Id,
                    UpdatedAt = DateTime.UtcNow
                }).ToList();
            }

            return entity;
        }
    }
}