using Microsoft.AspNetCore.Http;

namespace Realstate_servcices.Server.Utilities.Storage
{
    public interface ILocalstorageImage
    {
        Task<string> UploadImageAsync(IFormFile file, string folderPath = "properties");
        Task<string> UploadMemberImageAsync(IFormFile file, string memberId, string folderPath = "members");
        Task<bool> DeleteImageAsync(string imageUrl);
        Task<List<string>> UploadMultipleImagesAsync(List<IFormFile> files, string folderPath = "properties");
        Task<List<string>> UploadMultipleMemberImagesAsync(List<IFormFile> files, string memberId, string folderPath = "members");
        string GetImagePath(string imageUrl);
        List<string> GetMemberImages(string memberId, string folderPath = "members");
        Task<bool> DeleteMemberImageAsync(string memberId, string imageName, string folderPath = "members");
    }
}