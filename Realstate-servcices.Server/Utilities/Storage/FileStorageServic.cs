namespace Realstate_servcices.Server.Utilities.Storage
{
    public class FileStorageService : IFileStorageService
    {
        private readonly ILocalStorageChatImage _imageStorage;
        private readonly ILocalStorageChatVideo _videoStorage;

        public FileStorageService(ILocalStorageChatImage imageStorage, ILocalStorageChatVideo videoStorage)
        {
            _imageStorage = imageStorage;
            _videoStorage = videoStorage;
        }

        public async Task<string> UploadFileAsync(IFormFile file, string fileType)
        {
            return fileType.ToLower() switch
            {
                "image" or "image/jpeg" or "image/png" or "image/gif" =>
                    await _imageStorage.SaveImageAsync(file),

                "video" or "video/mp4" or "video/avi" or "video/mov" =>
                    await _videoStorage.SaveVideoAsync(file),

                _ => throw new InvalidOperationException($"Unsupported file type: {fileType}")
            };
        }

        public async Task<bool> DeleteFileAsync(string fileUrl)
        {
            if (fileUrl.Contains("/chat/images/"))
                return await _imageStorage.DeleteImageAsync(fileUrl);

            if (fileUrl.Contains("/chat/videos/"))
                return await _videoStorage.DeleteVideoAsync(fileUrl);

            return false;
        }

        public async Task<string> GenerateThumbnailAsync(string fileUrl)
        {
            if (fileUrl.Contains("/chat/images/"))
                return await _imageStorage.GenerateImageThumbnailAsync(fileUrl);

            if (fileUrl.Contains("/chat/videos/"))
                return await _videoStorage.GenerateVideoThumbnailAsync(fileUrl);

            throw new InvalidOperationException("Unsupported file type for thumbnail generation");
        }
    }
}
