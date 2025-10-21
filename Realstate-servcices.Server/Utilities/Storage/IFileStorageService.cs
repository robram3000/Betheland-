namespace Realstate_servcices.Server.Utilities.Storage
{
    public interface IFileStorageService
    {
        Task<string> UploadFileAsync(IFormFile file, string fileType);
        Task<bool> DeleteFileAsync(string fileUrl);
        Task<string> GenerateThumbnailAsync(string imageUrl);
    }
}
