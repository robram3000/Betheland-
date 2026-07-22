namespace Realstate_servcices.Server.Utilities.Storage.Interfaces
{
    public interface IFileStorageService
    {
        Task<string> UploadFileAsync(IFormFile file, string fileType);
        Task<bool> DeleteFileAsync(string fileUrl);
        Task<string> GenerateThumbnailAsync(string imageUrl);
    }
}
