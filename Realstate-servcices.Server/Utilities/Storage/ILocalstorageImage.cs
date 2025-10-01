using Microsoft.AspNetCore.Http;

namespace Realstate_servcices.Server.Utilities.Storage
{
    public interface ILocalstorageImage
    {
        Task<string> UploadImageAsync(IFormFile file, string folderPath = "properties");
        Task<bool> DeleteImageAsync(string imageUrl);
        Task<List<string>> UploadMultipleImagesAsync(List<IFormFile> files, string folderPath = "properties");
        string GetImagePath(string imageUrl);
    }
}