using Microsoft.AspNetCore.Http;


namespace Realstate_servcices.Server.Utilities.Storage
{
    public interface ILogoStorage
    {
        Task<string> UploadPartnerLogoAsync(IFormFile logoFile, string partnerName = "");
        Task<bool> DeletePartnerLogoAsync(string logoUrl);
        Task<string> UpdatePartnerLogoAsync(IFormFile newLogoFile, string existingLogoUrl, string partnerName = "");
        string GetLogoUrl(string storedFileName);
    }
}
