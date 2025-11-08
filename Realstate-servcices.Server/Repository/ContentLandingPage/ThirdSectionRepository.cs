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

        public ThirdSectionRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ThirdSection> GetThirdSectionAsync()
        {
            return await _context.ThirdSections
                .Include(ts => ts.ProcessSteps)
                .Include(ts => ts.FeatureItems)
                .AsNoTracking()
                .FirstOrDefaultAsync();
        }

        public async Task<ThirdSection> UpdateThirdSectionAsync(ThirdSection thirdSection)
        {
            var existingThirdSection = await _context.ThirdSections
                .Include(ts => ts.ProcessSteps)
                .Include(ts => ts.FeatureItems)
                .FirstOrDefaultAsync(ts => ts.Id == thirdSection.Id);

            if (existingThirdSection == null)
            {
                // If it doesn't exist, add it
                _context.ThirdSections.Add(thirdSection);
            }
            else
            {
                // If it exists, update it
                _context.Entry(existingThirdSection).CurrentValues.SetValues(thirdSection);

                // Update ProcessSteps
                UpdateProcessSteps(existingThirdSection, thirdSection);

                // Update FeatureItems
                UpdateFeatureItems(existingThirdSection, thirdSection);
            }

            await _context.SaveChangesAsync();
            return thirdSection;
        }

        private void UpdateProcessSteps(ThirdSection existingThirdSection, ThirdSection updatedThirdSection)
        {
            // Remove ProcessSteps that are not in the updated list
            foreach (var existingStep in existingThirdSection.ProcessSteps.ToList())
            {
                if (!updatedThirdSection.ProcessSteps.Any(ps => ps.Id == existingStep.Id))
                {
                    _context.ProcessSteps.Remove(existingStep);
                }
            }

            // Update or add ProcessSteps
            foreach (var updatedStep in updatedThirdSection.ProcessSteps)
            {
                var existingStep = existingThirdSection.ProcessSteps
                    .FirstOrDefault(ps => ps.Id == updatedStep.Id);

                if (existingStep != null)
                {
                    // Update existing step
                    _context.Entry(existingStep).CurrentValues.SetValues(updatedStep);
                }
                else
                {
                    // Add new step
                    updatedStep.ThirdSectionId = existingThirdSection.Id;
                    existingThirdSection.ProcessSteps.Add(updatedStep);
                }
            }
        }

        private void UpdateFeatureItems(ThirdSection existingThirdSection, ThirdSection updatedThirdSection)
        {
            // Remove FeatureItems that are not in the updated list
            foreach (var existingItem in existingThirdSection.FeatureItems.ToList())
            {
                if (!updatedThirdSection.FeatureItems.Any(fi => fi.Id == existingItem.Id))
                {
                    _context.FeatureItems.Remove(existingItem);
                }
            }

            // Update or add FeatureItems
            foreach (var updatedItem in updatedThirdSection.FeatureItems)
            {
                var existingItem = existingThirdSection.FeatureItems
                    .FirstOrDefault(fi => fi.Id == updatedItem.Id);

                if (existingItem != null)
                {
                    // Update existing item
                    _context.Entry(existingItem).CurrentValues.SetValues(updatedItem);
                }
                else
                {
                    // Add new item
                    updatedItem.ThirdSectionId = existingThirdSection.Id;
                    existingThirdSection.FeatureItems.Add(updatedItem);
                }
            }
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}