using Realstate_servcices.Server.Utilities.Storage.Interfaces;

namespace Realstate_servcices.Server.Utilities.Storage
{
    public class LocalStorageChatVideo : ILocalStorageChatVideo
    {
        private readonly IWebHostEnvironment _environment;
        private readonly IConfiguration _configuration;

        public LocalStorageChatVideo(IWebHostEnvironment environment, IConfiguration configuration)
        {
            _environment = environment;
            _configuration = configuration;
        }

        public async Task<string> SaveVideoAsync(IFormFile videoFile, string folderPath = "chat/videos")
        {
            if (videoFile == null || videoFile.Length == 0)
                throw new ArgumentException("Invalid video file");

            // Validate file type
            var allowedExtensions = new[] { ".mp4", ".avi", ".mov", ".wmv", ".flv", ".webm" };
            var fileExtension = Path.GetExtension(videoFile.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(fileExtension))
                throw new InvalidOperationException("Invalid video file type");

            // Check file size (e.g., 100MB limit)
            var maxFileSize = 100 * 1024 * 1024; // 100MB
            if (videoFile.Length > maxFileSize)
                throw new InvalidOperationException("Video file too large");

            // Create directory if it doesn't exist
            var uploadPath = Path.Combine(_environment.WebRootPath, folderPath);
            if (!Directory.Exists(uploadPath))
                Directory.CreateDirectory(uploadPath);

            // Generate unique filename
            var fileName = $"{Guid.NewGuid()}{fileExtension}";
            var filePath = Path.Combine(uploadPath, fileName);

            // Save file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await videoFile.CopyToAsync(stream);
            }

            return $"/{folderPath}/{fileName}";
        }

        public async Task<string> SaveVideoAsync(byte[] videoData, string fileName, string folderPath = "chat/videos")
        {
            if (videoData == null || videoData.Length == 0)
                throw new ArgumentException("Invalid video data");

            // Create directory if it doesn't exist
            var uploadPath = Path.Combine(_environment.WebRootPath, folderPath);
            if (!Directory.Exists(uploadPath))
                Directory.CreateDirectory(uploadPath);

            // Generate unique filename if not provided
            var finalFileName = string.IsNullOrEmpty(fileName) ? $"{Guid.NewGuid()}.mp4" : fileName;
            var filePath = Path.Combine(uploadPath, finalFileName);

            // Save file
            await File.WriteAllBytesAsync(filePath, videoData);

            return $"/{folderPath}/{finalFileName}";
        }

        public async Task<bool> DeleteVideoAsync(string videoPath)
        {
            if (string.IsNullOrEmpty(videoPath))
                return false;

            var relativePath = videoPath.TrimStart('/');
            var fullPath = Path.Combine(_environment.WebRootPath, relativePath);

            if (!File.Exists(fullPath))
                return false;

            try
            {
                File.Delete(fullPath);
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<string> GenerateVideoThumbnailAsync(string videoPath, TimeSpan? snapshotTime = null)
        {
            // This would require FFmpeg or similar video processing library
            // For now, return a placeholder or implement with FFmpeg

            // Placeholder implementation
            var thumbnailPath = "/chat/images/video_placeholder.jpg";

            // In real implementation, you would:
            // 1. Use FFmpeg to extract a frame from the video
            // 2. Save it as an image
            // 3. Return the thumbnail path

            return thumbnailPath;
        }

        public async Task<Stream> GetVideoAsync(string videoPath)
        {
            var relativePath = videoPath.TrimStart('/');
            var fullPath = Path.Combine(_environment.WebRootPath, relativePath);

            if (!File.Exists(fullPath))
                throw new FileNotFoundException("Video file not found");

            return new FileStream(fullPath, FileMode.Open, FileAccess.Read);
        }

        public async Task<bool> VideoExistsAsync(string videoPath)
        {
            var relativePath = videoPath.TrimStart('/');
            var fullPath = Path.Combine(_environment.WebRootPath, relativePath);
            return File.Exists(fullPath);
        }

        public async Task<long> GetVideoSizeAsync(string videoPath)
        {
            var relativePath = videoPath.TrimStart('/');
            var fullPath = Path.Combine(_environment.WebRootPath, relativePath);

            if (!File.Exists(fullPath))
                throw new FileNotFoundException("Video file not found");

            return new FileInfo(fullPath).Length;
        }
    }
}
