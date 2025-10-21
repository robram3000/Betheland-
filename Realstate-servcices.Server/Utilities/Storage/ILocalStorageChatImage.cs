namespace Realstate_servcices.Server.Utilities.Storage
{
    public interface ILocalStorageChatImage
    {
        Task<string> SaveImageAsync(IFormFile imageFile, string folderPath = "chat/images");
        Task<string> SaveImageAsync(byte[] imageData, string fileName, string folderPath = "chat/images");
        Task<bool> DeleteImageAsync(string imagePath);
        Task<string> GenerateImageThumbnailAsync(string imagePath, int width = 200, int height = 200);
        Task<Stream> GetImageAsync(string imagePath);
        Task<bool> ImageExistsAsync(string imagePath);
    }
}
