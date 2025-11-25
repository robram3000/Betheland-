using Realstate_servcices.Server.Utilities.Storage;

namespace Realstate_servcices.Server.Services.ConfigLandingpage
{
    public interface IPartnerLogoService
    {
        Task<string> HandleLogoUploadAsync(IFormFile logoFile, string partnerName);
        Task<bool> HandleLogoDeletionAsync(string logoUrl);
        Task<string> HandleLogoUpdateAsync(IFormFile newLogoFile, string existingLogoUrl, string partnerName);
    }

    public class PartnerLogoService : IPartnerLogoService
    {
        private readonly ILogoStorage _logoStorage;

        public PartnerLogoService(ILogoStorage logoStorage)
        {
            _logoStorage = logoStorage;
        }

        public async Task<string> HandleLogoUploadAsync(IFormFile logoFile, string partnerName)
        {
            if (logoFile == null || logoFile.Length == 0)
                throw new ArgumentException("Logo file is required");

            return await _logoStorage.UploadPartnerLogoAsync(logoFile, partnerName);
        }

        public async Task<bool> HandleLogoDeletionAsync(string logoUrl)
        {
            if (string.IsNullOrEmpty(logoUrl))
                return true;

            return await _logoStorage.DeletePartnerLogoAsync(logoUrl);
        }

        public async Task<string> HandleLogoUpdateAsync(IFormFile newLogoFile, string existingLogoUrl, string partnerName)
        {
            if (newLogoFile == null || newLogoFile.Length == 0)
                throw new ArgumentException("New logo file is required");

            return await _logoStorage.UpdatePartnerLogoAsync(newLogoFile, existingLogoUrl, partnerName);
        }
    }
}
