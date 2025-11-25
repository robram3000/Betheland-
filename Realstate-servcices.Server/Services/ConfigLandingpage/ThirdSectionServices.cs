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
        private readonly ILogger<ThirdSectionServices> _logger;

        // Constants for limits
        private const int MAX_PROCESS_STEPS = 5;
        private const int MAX_FEATURE_ITEMS = 5;

        public ThirdSectionServices(IThirdSectionRepository thirdSectionRepository, ILogger<ThirdSectionServices> logger)
        {
            _thirdSectionRepository = thirdSectionRepository;
            _logger = logger;
        }

        public async Task<ThirdSectionDTO> GetThirdSectionAsync()
        {
            try
            {
                _logger.LogInformation("🔍 ThirdSectionServices: Getting third section data from repository");

                var thirdSection = await _thirdSectionRepository.GetThirdSectionAsync();

                // Return empty DTO instead of null when no data exists
                if (thirdSection == null)
                {
                    _logger.LogInformation("ℹ️ ThirdSectionServices: No existing data found, returning empty DTO");
                    return new ThirdSectionDTO
                    {
                        Id = 0,
                        Title = string.Empty,
                        Subtitle = string.Empty,
                        Description = string.Empty,
                        ProcessSteps = new List<ProcessStepDTO>(),
                        FeatureItems = new List<FeatureItemDTO>()
                    };
                }

                _logger.LogInformation("✅ ThirdSectionServices: Successfully retrieved data from repository - " +
                    "ID: {Id}, Title: {Title}, ProcessSteps: {ProcessStepsCount}, FeatureItems: {FeatureItemsCount}",
                    thirdSection.Id,
                    thirdSection.Title,
                    thirdSection.ProcessSteps?.Count ?? 0,
                    thirdSection.FeatureItems?.Count ?? 0);

                return MapToDTO(thirdSection);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ ThirdSectionServices: Error getting third section from repository");
                throw new Exception($"Error getting third section: {ex.Message}");
            }
        }

        public async Task<ThirdSectionDTO> UpdateThirdSectionAsync(ThirdSectionDTO thirdSectionDto)
        {
            try
            {
                _logger.LogInformation("🔍 ThirdSectionServices: Starting update process for third section");

                // Validate limits
                if (thirdSectionDto.ProcessSteps?.Count > MAX_PROCESS_STEPS)
                {
                    throw new InvalidOperationException($"Cannot have more than {MAX_PROCESS_STEPS} process steps");
                }

                if (thirdSectionDto.FeatureItems?.Count > MAX_FEATURE_ITEMS)
                {
                    throw new InvalidOperationException($"Cannot have more than {MAX_FEATURE_ITEMS} feature items");
                }

                var existingSection = await _thirdSectionRepository.GetThirdSectionAsync();

                if (existingSection == null)
                {
                    _logger.LogInformation("🆕 ThirdSectionServices: No existing section found, creating new one");

                    // Apply limits when creating new
                    var processSteps = thirdSectionDto.ProcessSteps?
                        .Take(MAX_PROCESS_STEPS)
                        .ToList() ?? new List<ProcessStepDTO>();

                    var featureItems = thirdSectionDto.FeatureItems?
                        .Take(MAX_FEATURE_ITEMS)
                        .ToList() ?? new List<FeatureItemDTO>();

                    // Create new section with proper initialization
                    var newSection = new ThirdSection
                    {
                        Title = thirdSectionDto.Title ?? "Default Title",
                        Subtitle = thirdSectionDto.Subtitle ?? "Default Subtitle",
                        Description = thirdSectionDto.Description ?? "Default Description",
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                        ProcessSteps = processSteps.Select(ps => new ProcessStep
                        {
                            StepNumber = ps.StepNumber,
                            Title = ps.Title ?? string.Empty,
                            Description = ps.Description ?? string.Empty,
                            Icon = ps.Icon ?? string.Empty,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        }).ToList(),
                        FeatureItems = featureItems.Select(fi => new FeatureItem
                        {
                            Title = fi.Title ?? string.Empty,
                            Description = fi.Description ?? string.Empty,
                            Icon = fi.Icon ?? string.Empty,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        }).ToList()
                    };

                    _logger.LogInformation("📝 ThirdSectionServices: Creating new section with " +
                        "{ProcessStepsCount} process steps and {FeatureItemsCount} feature items",
                        newSection.ProcessSteps.Count,
                        newSection.FeatureItems.Count);

                    var created = await _thirdSectionRepository.UpdateThirdSectionAsync(newSection);
                    _logger.LogInformation("✅ ThirdSectionServices: Successfully created new third section with ID: {Id}", created.Id);

                    return MapToDTO(created);
                }
                else
                {
                    _logger.LogInformation("📝 ThirdSectionServices: Updating existing section ID: {Id}", existingSection.Id);

                    // Apply limits when updating
                    if (thirdSectionDto.ProcessSteps != null)
                    {
                        thirdSectionDto.ProcessSteps = thirdSectionDto.ProcessSteps
                            .Take(MAX_PROCESS_STEPS)
                            .ToList();
                    }

                    if (thirdSectionDto.FeatureItems != null)
                    {
                        thirdSectionDto.FeatureItems = thirdSectionDto.FeatureItems
                            .Take(MAX_FEATURE_ITEMS)
                            .ToList();
                    }

                    // Update existing section
                    var updatedSection = MapToEntity(thirdSectionDto, existingSection);
                    var result = await _thirdSectionRepository.UpdateThirdSectionAsync(updatedSection);

                    _logger.LogInformation("✅ ThirdSectionServices: Successfully updated third section ID: {Id}", result.Id);
                    return MapToDTO(result);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ ThirdSectionServices: Error updating third section");
                throw new Exception($"Error updating third section: {ex.Message}");
            }
        }

        private ThirdSectionDTO MapToDTO(ThirdSection thirdSection)
        {
            // Return empty DTO instead of null when no data exists
            if (thirdSection == null)
            {
                _logger.LogWarning("⚠️ ThirdSectionServices: MapToDTO received null entity, returning empty DTO");
                return new ThirdSectionDTO
                {
                    Id = 0,
                    Title = string.Empty,
                    Subtitle = string.Empty,
                    Description = string.Empty,
                    ProcessSteps = new List<ProcessStepDTO>(),
                    FeatureItems = new List<FeatureItemDTO>()
                };
            }

            _logger.LogDebug("🔧 ThirdSectionServices: Mapping entity to DTO - ID: {Id}", thirdSection.Id);

            // Apply limits when mapping to DTO
            return new ThirdSectionDTO
            {
                Id = thirdSection.Id,
                Title = thirdSection.Title ?? string.Empty,
                Subtitle = thirdSection.Subtitle ?? string.Empty,
                Description = thirdSection.Description ?? string.Empty,
                ProcessSteps = thirdSection.ProcessSteps?
                    .Take(MAX_PROCESS_STEPS)
                    .Select(ps => new ProcessStepDTO
                    {
                        Id = ps.Id,
                        StepNumber = ps.StepNumber,
                        Title = ps.Title ?? string.Empty,
                        Description = ps.Description ?? string.Empty,
                        Icon = ps.Icon ?? string.Empty
                    }).ToList() ?? new List<ProcessStepDTO>(),
                FeatureItems = thirdSection.FeatureItems?
                    .Take(MAX_FEATURE_ITEMS)
                    .Select(fi => new FeatureItemDTO
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
            _logger.LogDebug("🔧 ThirdSectionServices: Mapping DTO to entity - DTO ID: {Id}", dto?.Id ?? 0);

            var entity = existingEntity ?? new ThirdSection();

            entity.Title = dto.Title ?? string.Empty;
            entity.Subtitle = dto.Subtitle ?? string.Empty;
            entity.Description = dto.Description ?? string.Empty;
            entity.UpdatedAt = DateTime.UtcNow;

            // Update process steps - ensure IDs are preserved for existing items and apply limits
            if (dto.ProcessSteps != null)
            {
                entity.ProcessSteps = dto.ProcessSteps
                    .Take(MAX_PROCESS_STEPS)
                    .Select(ps => new ProcessStep
                    {
                        Id = ps.Id, // Preserve the ID from DTO
                        StepNumber = ps.StepNumber,
                        Title = ps.Title ?? string.Empty,
                        Description = ps.Description ?? string.Empty,
                        Icon = ps.Icon ?? string.Empty,
                        ThirdSectionId = entity.Id,
                        UpdatedAt = DateTime.UtcNow,
                        CreatedAt = ps.Id == 0 ? DateTime.UtcNow : (existingEntity?.ProcessSteps?.FirstOrDefault(p => p.Id == ps.Id)?.CreatedAt ?? DateTime.UtcNow)
                    }).ToList();

                _logger.LogDebug("🔧 ThirdSectionServices: Mapped {ProcessStepsCount} process steps", entity.ProcessSteps.Count);
            }

            // Update feature items - ensure IDs are preserved for existing items and apply limits
            if (dto.FeatureItems != null)
            {
                entity.FeatureItems = dto.FeatureItems
                    .Take(MAX_FEATURE_ITEMS)
                    .Select(fi => new FeatureItem
                    {
                        Id = fi.Id, // Preserve the ID from DTO
                        Title = fi.Title ?? string.Empty,
                        Description = fi.Description ?? string.Empty,
                        Icon = fi.Icon ?? string.Empty,
                        ThirdSectionId = entity.Id,
                        UpdatedAt = DateTime.UtcNow,
                        CreatedAt = fi.Id == 0 ? DateTime.UtcNow : (existingEntity?.FeatureItems?.FirstOrDefault(f => f.Id == fi.Id)?.CreatedAt ?? DateTime.UtcNow)
                    }).ToList();

                _logger.LogDebug("🔧 ThirdSectionServices: Mapped {FeatureItemsCount} feature items", entity.FeatureItems.Count);
            }

            return entity;
        }
    }
}