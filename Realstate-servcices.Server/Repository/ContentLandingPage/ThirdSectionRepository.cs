using Microsoft.EntityFrameworkCore;
using Realstate_servcices.Server.Data;
using Realstate_servcices.Server.Entity.landingpage;
using Realstate_servcices.Server.Entity.landingpage.Third_Section;

namespace Realstate_servcices.Server.Repository.ContentLandingPage
{
    public interface IThirdSectionRepository
    {
        Task<ThirdSection> GetThirdSectionAsync();
        Task<ThirdSection> UpdateThirdSectionAsync(ThirdSection thirdSection);
        Task<bool> SaveChangesAsync();
    }

    public class ThirdSectionRepository : IThirdSectionRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ThirdSectionRepository> _logger;

        public ThirdSectionRepository(ApplicationDbContext context, ILogger<ThirdSectionRepository> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<ThirdSection> GetThirdSectionAsync()
        {
            try
            {
                _logger.LogInformation("🔍 ThirdSectionRepository: Querying database for third section");

                var thirdSection = await _context.ThirdSections
                    .Include(ts => ts.ProcessSteps.OrderBy(ps => ps.StepNumber))
                    .Include(ts => ts.FeatureItems)
                    .AsNoTracking()
                    .FirstOrDefaultAsync();

                if (thirdSection != null)
                {
                    _logger.LogInformation("✅ ThirdSectionRepository: Found third section - " +
                        "ID: {Id}, Title: {Title}, ProcessSteps: {ProcessStepsCount}, FeatureItems: {FeatureItemsCount}",
                        thirdSection.Id,
                        thirdSection.Title,
                        thirdSection.ProcessSteps?.Count ?? 0,
                        thirdSection.FeatureItems?.Count ?? 0);
                }
                else
                {
                    _logger.LogInformation("ℹ️ ThirdSectionRepository: No third section found in database");
                }

                return thirdSection;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ ThirdSectionRepository: Error getting third section from database");
                throw;
            }
        }

        public async Task<ThirdSection> UpdateThirdSectionAsync(ThirdSection thirdSection)
        {
            try
            {
                _logger.LogInformation("🔍 ThirdSectionRepository: Starting update for ID: {Id}", thirdSection.Id);

                var existingThirdSection = await _context.ThirdSections
                    .Include(ts => ts.ProcessSteps)
                    .Include(ts => ts.FeatureItems)
                    .FirstOrDefaultAsync(ts => ts.Id == thirdSection.Id);

                if (existingThirdSection == null)
                {
                    _logger.LogInformation("🆕 ThirdSectionRepository: Creating new ThirdSection");

                    // If it doesn't exist, add it
                    thirdSection.CreatedAt = DateTime.UtcNow;
                    thirdSection.UpdatedAt = DateTime.UtcNow;

                    // Set IDs for new items
                    foreach (var step in thirdSection.ProcessSteps)
                    {
                        step.Id = 0; // Ensure new items have ID = 0
                        step.CreatedAt = DateTime.UtcNow;
                        step.UpdatedAt = DateTime.UtcNow;
                    }

                    foreach (var item in thirdSection.FeatureItems)
                    {
                        item.Id = 0; // Ensure new items have ID = 0
                        item.CreatedAt = DateTime.UtcNow;
                        item.UpdatedAt = DateTime.UtcNow;
                    }

                    _context.ThirdSections.Add(thirdSection);
                    _logger.LogInformation("📝 ThirdSectionRepository: Added new third section to context");
                }
                else
                {
                    _logger.LogInformation("📝 ThirdSectionRepository: Updating existing ThirdSection ID: {Id}", existingThirdSection.Id);

                    // If it exists, update it
                    existingThirdSection.Title = thirdSection.Title;
                    existingThirdSection.Subtitle = thirdSection.Subtitle;
                    existingThirdSection.Description = thirdSection.Description;
                    existingThirdSection.UpdatedAt = DateTime.UtcNow;

                    // Update ProcessSteps
                    UpdateProcessSteps(existingThirdSection, thirdSection.ProcessSteps);

                    // Update FeatureItems
                    UpdateFeatureItems(existingThirdSection, thirdSection.FeatureItems);
                }

                var changes = await _context.SaveChangesAsync();
                _logger.LogInformation("💾 ThirdSectionRepository: Saved {Changes} changes to database", changes);

                // Return the updated entity
                var result = await _context.ThirdSections
                    .Include(ts => ts.ProcessSteps.OrderBy(ps => ps.StepNumber))
                    .Include(ts => ts.FeatureItems)
                    .FirstOrDefaultAsync(ts => ts.Id == ( thirdSection.Id));

                _logger.LogInformation("✅ ThirdSectionRepository: Update completed successfully for ID: {Id}", result?.Id);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ ThirdSectionRepository: Error updating third section in database");
                throw;
            }
        }

        private void UpdateProcessSteps(ThirdSection existingThirdSection, List<ProcessStep> updatedSteps)
        {
            if (updatedSteps == null) return;

            _logger.LogDebug("🔧 ThirdSectionRepository: Updating process steps for section ID: {Id}", existingThirdSection.Id);

            // Remove ProcessSteps that are not in the updated list
            var stepsToRemove = existingThirdSection.ProcessSteps
                .Where(existingStep => !updatedSteps.Any(updatedStep => updatedStep.Id == existingStep.Id && updatedStep.Id != 0))
                .ToList();

            foreach (var stepToRemove in stepsToRemove)
            {
                _logger.LogDebug("🗑️ ThirdSectionRepository: Removing ProcessStep ID: {StepId}", stepToRemove.Id);
                _context.ProcessSteps.Remove(stepToRemove);
            }

            // Update or add ProcessSteps
            foreach (var updatedStep in updatedSteps)
            {
                // Check if this is a new step (ID = 0) or existing step
                if (updatedStep.Id == 0)
                {
                    // Add new step
                    _logger.LogDebug("➕ ThirdSectionRepository: Adding new ProcessStep");
                    var newStep = new ProcessStep
                    {
                        StepNumber = updatedStep.StepNumber,
                        Title = updatedStep.Title ?? string.Empty,
                        Description = updatedStep.Description ?? string.Empty,
                        Icon = updatedStep.Icon ?? string.Empty,
                        ThirdSectionId = existingThirdSection.Id,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _context.ProcessSteps.Add(newStep);
                    existingThirdSection.ProcessSteps.Add(newStep);
                }
                else
                {
                    // Update existing step
                    var existingStep = existingThirdSection.ProcessSteps
                        .FirstOrDefault(ps => ps.Id == updatedStep.Id);

                    if (existingStep != null)
                    {
                        _logger.LogDebug("📝 ThirdSectionRepository: Updating ProcessStep ID: {StepId}", existingStep.Id);
                        existingStep.StepNumber = updatedStep.StepNumber;
                        existingStep.Title = updatedStep.Title ?? string.Empty;
                        existingStep.Description = updatedStep.Description ?? string.Empty;
                        existingStep.Icon = updatedStep.Icon ?? string.Empty;
                        existingStep.UpdatedAt = DateTime.UtcNow;
                    }
                    else
                    {
                        // This shouldn't happen, but if it does, add as new
                        _logger.LogWarning("⚠️ ThirdSectionRepository: Step ID {StepId} not found, adding as new", updatedStep.Id);
                        var newStep = new ProcessStep
                        {
                            StepNumber = updatedStep.StepNumber,
                            Title = updatedStep.Title ?? string.Empty,
                            Description = updatedStep.Description ?? string.Empty,
                            Icon = updatedStep.Icon ?? string.Empty,
                            ThirdSectionId = existingThirdSection.Id,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        };
                        _context.ProcessSteps.Add(newStep);
                        existingThirdSection.ProcessSteps.Add(newStep);
                    }
                }
            }
        }

        private void UpdateFeatureItems(ThirdSection existingThirdSection, List<FeatureItem> updatedItems)
        {
            if (updatedItems == null) return;

            _logger.LogDebug("🔧 ThirdSectionRepository: Updating feature items for section ID: {Id}", existingThirdSection.Id);

            // Remove FeatureItems that are not in the updated list
            var itemsToRemove = existingThirdSection.FeatureItems
                .Where(existingItem => !updatedItems.Any(updatedItem => updatedItem.Id == existingItem.Id && updatedItem.Id != 0))
                .ToList();

            foreach (var itemToRemove in itemsToRemove)
            {
                _logger.LogDebug("🗑️ ThirdSectionRepository: Removing FeatureItem ID: {ItemId}", itemToRemove.Id);
                _context.FeatureItems.Remove(itemToRemove);
            }

            // Update or add FeatureItems
            foreach (var updatedItem in updatedItems)
            {
                // Check if this is a new item (ID = 0) or existing item
                if (updatedItem.Id == 0)
                {
                    // Add new item
                    _logger.LogDebug("➕ ThirdSectionRepository: Adding new FeatureItem");
                    var newItem = new FeatureItem
                    {
                        Title = updatedItem.Title ?? string.Empty,
                        Description = updatedItem.Description ?? string.Empty,
                        Icon = updatedItem.Icon ?? string.Empty,
                        ThirdSectionId = existingThirdSection.Id,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _context.FeatureItems.Add(newItem);
                    existingThirdSection.FeatureItems.Add(newItem);
                }
                else
                {
                    // Update existing item
                    var existingItem = existingThirdSection.FeatureItems
                        .FirstOrDefault(fi => fi.Id == updatedItem.Id);

                    if (existingItem != null)
                    {
                        _logger.LogDebug("📝 ThirdSectionRepository: Updating FeatureItem ID: {ItemId}", existingItem.Id);
                        existingItem.Title = updatedItem.Title ?? string.Empty;
                        existingItem.Description = updatedItem.Description ?? string.Empty;
                        existingItem.Icon = updatedItem.Icon ?? string.Empty;
                        existingItem.UpdatedAt = DateTime.UtcNow;
                    }
                    else
                    {
                        // This shouldn't happen, but if it does, add as new
                        _logger.LogWarning("⚠️ ThirdSectionRepository: FeatureItem ID {ItemId} not found, adding as new", updatedItem.Id);
                        var newItem = new FeatureItem
                        {
                            Title = updatedItem.Title ?? string.Empty,
                            Description = updatedItem.Description ?? string.Empty,
                            Icon = updatedItem.Icon ?? string.Empty,
                            ThirdSectionId = existingThirdSection.Id,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        };
                        _context.FeatureItems.Add(newItem);
                        existingThirdSection.FeatureItems.Add(newItem);
                    }
                }
            }
        }

        public async Task<bool> SaveChangesAsync()
        {
            var changes = await _context.SaveChangesAsync();
            _logger.LogDebug("💾 ThirdSectionRepository: SaveChangesAsync - {Changes} changes saved", changes);
            return changes > 0;
        }
    }
}