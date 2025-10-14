using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace Realstate_servcices.Server.Utilities.Storage
{
    public class LocalStorageVideo : ILocalStorageVideo
    {
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<LocalStorageVideo> _logger;
        private const string BaseUploadPath = "uploads";
        private const string PropertyVideosFolder = "properties";

        public LocalStorageVideo(IWebHostEnvironment environment, ILogger<LocalStorageVideo> logger)
        {
            _environment = environment;
            _logger = logger;
            EnsureDirectoriesExist();
        }

        private void EnsureDirectoriesExist()
        {
            try
            {
                var uploadsPath = Path.Combine(_environment.WebRootPath, BaseUploadPath);
                var videosPath = Path.Combine(uploadsPath, "videos");
                var propertyVideosPath = Path.Combine(videosPath, PropertyVideosFolder);
                var memberVideosPath = Path.Combine(uploadsPath, "member-videos");

                if (!Directory.Exists(uploadsPath))
                    Directory.CreateDirectory(uploadsPath);

                if (!Directory.Exists(videosPath))
                    Directory.CreateDirectory(videosPath);

                if (!Directory.Exists(propertyVideosPath))
                    Directory.CreateDirectory(propertyVideosPath);

                if (!Directory.Exists(memberVideosPath))
                    Directory.CreateDirectory(memberVideosPath);

                _logger.LogInformation("Video upload directories created successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create video upload directories");
                throw;
            }
        }

        public async Task<string> UploadVideoAsync(IFormFile file, string folderPath = "videos")
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("File is empty");

            ValidateVideoFile(file);

            try
            {
                // Use properties subfolder for property videos
                var actualFolderPath = folderPath == "videos" ? Path.Combine("videos", PropertyVideosFolder) : folderPath;
                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
                var relativePath = Path.Combine(BaseUploadPath, actualFolderPath, fileName);
                var fullPath = Path.Combine(_environment.WebRootPath, relativePath);

                var directory = Path.GetDirectoryName(fullPath);
                if (!Directory.Exists(directory))
                    Directory.CreateDirectory(directory!);

                using (var stream = new FileStream(fullPath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                _logger.LogInformation($"Video uploaded successfully: {relativePath}");
                return $"/{relativePath.Replace('\\', '/')}";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error uploading video: {file.FileName}");
                throw new Exception($"Failed to upload video: {ex.Message}");
            }
        }

        public async Task<string> UploadMemberVideoAsync(IFormFile file, string memberId, string folderPath = "member-videos")
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("File is empty");

            if (string.IsNullOrEmpty(memberId))
                throw new ArgumentException("Member ID is required");

            ValidateVideoFile(file);

            try
            {
                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
                var memberFolder = Path.Combine(folderPath, memberId);
                var relativePath = Path.Combine(BaseUploadPath, memberFolder, fileName);
                var fullPath = Path.Combine(_environment.WebRootPath, relativePath);

                var directory = Path.GetDirectoryName(fullPath);
                if (!Directory.Exists(directory))
                    Directory.CreateDirectory(directory!);

                using (var stream = new FileStream(fullPath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                _logger.LogInformation($"Member video uploaded successfully: {relativePath}");
                return $"/{relativePath.Replace('\\', '/')}";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error uploading member video for member {memberId}: {file.FileName}");
                throw new Exception($"Failed to upload member video: {ex.Message}");
            }
        }

        public async Task<List<string>> UploadMultipleVideosAsync(List<IFormFile> files, string folderPath = "videos")
        {
            var uploadedUrls = new List<string>();

            foreach (var file in files)
            {
                if (file.Length > 0)
                {
                    try
                    {
                        var url = await UploadVideoAsync(file, folderPath);
                        uploadedUrls.Add(url);
                        _logger.LogInformation($"Successfully uploaded video: {file.FileName} -> {url}");
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, $"Failed to upload video: {file.FileName}");
                        throw;
                    }
                }
            }

            _logger.LogInformation($"Successfully uploaded {uploadedUrls.Count} videos");
            return uploadedUrls;
        }

        public async Task<List<string>> UploadMultipleMemberVideosAsync(List<IFormFile> files, string memberId, string folderPath = "member-videos")
        {
            var uploadedUrls = new List<string>();

            foreach (var file in files)
            {
                if (file.Length > 0)
                {
                    try
                    {
                        var url = await UploadMemberVideoAsync(file, memberId, folderPath);
                        uploadedUrls.Add(url);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, $"Failed to upload member video for member {memberId}: {file.FileName}");
                        throw;
                    }
                }
            }

            _logger.LogInformation($"Successfully uploaded {uploadedUrls.Count} videos for member {memberId}");
            return uploadedUrls;
        }

        public async Task<bool> DeleteVideoAsync(string videoUrl)
        {
            try
            {
                if (string.IsNullOrEmpty(videoUrl))
                    return false;

                var relativePath = videoUrl.TrimStart('/');
                var fullPath = Path.Combine(_environment.WebRootPath, relativePath);

                if (File.Exists(fullPath))
                {
                    File.Delete(fullPath);
                    _logger.LogInformation($"Video deleted successfully: {fullPath}");
                    return true;
                }

                _logger.LogWarning($"Video not found for deletion: {fullPath}");
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting video: {videoUrl}");
                return false;
            }
        }

        public async Task<bool> DeleteMemberVideoAsync(string memberId, string videoName, string folderPath = "member-videos")
        {
            try
            {
                if (string.IsNullOrEmpty(memberId) || string.IsNullOrEmpty(videoName))
                    return false;

                var memberFolder = Path.Combine(folderPath, memberId);
                var relativePath = Path.Combine(BaseUploadPath, memberFolder, videoName);
                var fullPath = Path.Combine(_environment.WebRootPath, relativePath);

                if (File.Exists(fullPath))
                {
                    File.Delete(fullPath);
                    _logger.LogInformation($"Member video deleted successfully: {fullPath}");
                    return true;
                }

                _logger.LogWarning($"Member video not found for deletion: {fullPath}");
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting member video for member {memberId}: {videoName}");
                return false;
            }
        }

        public string GetVideoPath(string videoUrl)
        {
            if (string.IsNullOrEmpty(videoUrl))
                return string.Empty;

            var relativePath = videoUrl.TrimStart('/');
            return Path.Combine(_environment.WebRootPath, relativePath);
        }

        public List<string> GetMemberVideos(string memberId, string folderPath = "member-videos")
        {
            try
            {
                var memberFolderPath = Path.Combine(_environment.WebRootPath, BaseUploadPath, folderPath, memberId);

                if (!Directory.Exists(memberFolderPath))
                    return new List<string>();

                var files = Directory.GetFiles(memberFolderPath)
                    .Where(f => IsVideoFile(f))
                    .Select(f => {
                        var relativePath = Path.GetRelativePath(_environment.WebRootPath, f);
                        return $"/{relativePath.Replace('\\', '/')}";
                    })
                    .ToList();

                return files;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting videos for member {memberId}");
                return new List<string>();
            }
        }

        public async Task<string> GetVideoDurationAsync(string videoUrl)
        {
            try
            {
                if (string.IsNullOrEmpty(videoUrl))
                    return "Unknown";

                var filePath = GetVideoPath(videoUrl);
                if (!File.Exists(filePath))
                    return "Unknown";

                // For now, return a placeholder
                // In production, integrate with FFmpeg or other video processing library
                _logger.LogInformation($"Duration detection requested for: {videoUrl}");

                // Placeholder - you can implement actual duration detection here
                return "00:00"; // Replace with actual duration detection
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting video duration for: {videoUrl}");
                return "Unknown";
            }
        }

        public async Task<long> GetVideoSizeAsync(string videoUrl)
        {
            try
            {
                if (string.IsNullOrEmpty(videoUrl))
                    return 0;

                var filePath = GetVideoPath(videoUrl);
                if (!File.Exists(filePath))
                    return 0;

                var fileInfo = new FileInfo(filePath);
                return fileInfo.Length;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting video size for: {videoUrl}");
                return 0;
            }
        }

        private bool IsVideoFile(string filePath)
        {
            var allowedExtensions = new[] { ".mp4", ".avi", ".mov", ".wmv", ".flv", ".webm", ".mkv", ".m4v" };
            var extension = Path.GetExtension(filePath).ToLowerInvariant();
            return allowedExtensions.Contains(extension);
        }

        private void ValidateVideoFile(IFormFile file)
        {
            var allowedExtensions = new[] { ".mp4", ".avi", ".mov", ".wmv", ".flv", ".webm", ".mkv", ".m4v" };
            var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();

            if (string.IsNullOrEmpty(fileExtension) || !allowedExtensions.Contains(fileExtension))
                throw new ArgumentException("Invalid video file type. Allowed types: " + string.Join(", ", allowedExtensions));

            // Larger size limit for videos (100MB)
            if (file.Length > 100 * 1024 * 1024)
                throw new ArgumentException("Video file size too large. Maximum size is 100MB.");

            // Additional validation for video files could be added here
        }
    }
}