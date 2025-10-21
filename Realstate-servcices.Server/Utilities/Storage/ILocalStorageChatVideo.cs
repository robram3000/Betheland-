namespace Realstate_servcices.Server.Utilities.Storage
{
    public interface ILocalStorageChatVideo
    {
        Task<string> SaveVideoAsync(IFormFile videoFile, string folderPath = "chat/videos");
        Task<string> SaveVideoAsync(byte[] videoData, string fileName, string folderPath = "chat/videos");
        Task<bool> DeleteVideoAsync(string videoPath);
        Task<string> GenerateVideoThumbnailAsync(string videoPath, TimeSpan? snapshotTime = null);
        Task<Stream> GetVideoAsync(string videoPath);
        Task<bool> VideoExistsAsync(string videoPath);
        Task<long> GetVideoSizeAsync(string videoPath);
    }
}
