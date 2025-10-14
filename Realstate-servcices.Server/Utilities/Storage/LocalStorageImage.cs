using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace Realstate_servcices.Server.Utilities.Storage
{
    public class LocalStorageImage : ILocalstorageImage
    {
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<LocalStorageImage> _logger;
        private const string BaseUploadPath = "uploads";

        public LocalStorageImage(IWebHostEnvironment environment, ILogger<LocalStorageImage> logger)
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
                var propertiesPath = Path.Combine(uploadsPath, "properties");
                var membersPath = Path.Combine(uploadsPath, "members");

                if (!Directory.Exists(uploadsPath))
                    Directory.CreateDirectory(uploadsPath);

                if (!Directory.Exists(propertiesPath))
                    Directory.CreateDirectory(propertiesPath);

                if (!Directory.Exists(membersPath))
                    Directory.CreateDirectory(membersPath);

                _logger.LogInformation("Upload directories created successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create upload directories");
                throw;
            }
        }

        public async Task<string> UploadImageAsync(IFormFile file, string folderPath = "properties")
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("File is empty");

            ValidateFile(file);

            try
            {
                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
                var relativePath = Path.Combine(BaseUploadPath, folderPath, fileName);
                var fullPath = Path.Combine(_environment.WebRootPath, relativePath);

                var directory = Path.GetDirectoryName(fullPath);
                if (!Directory.Exists(directory))
                    Directory.CreateDirectory(directory!);

                using (var stream = new FileStream(fullPath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                _logger.LogInformation($"Image uploaded successfully: {relativePath}");
                return $"/{relativePath.Replace('\\', '/')}";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error uploading image: {file.FileName}");
                throw new Exception($"Failed to upload image: {ex.Message}");
            }
        }

        public async Task<string> UploadMemberImageAsync(IFormFile file, string memberId, string folderPath = "members")
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("File is empty");

            if (string.IsNullOrEmpty(memberId))
                throw new ArgumentException("Member ID is required");

            ValidateFile(file);

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

                _logger.LogInformation($"Member image uploaded successfully: {relativePath}");
                return $"/{relativePath.Replace('\\', '/')}";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error uploading member image for member {memberId}: {file.FileName}");
                throw new Exception($"Failed to upload member image: {ex.Message}");
            }
        }

        public async Task<List<string>> UploadMultipleImagesAsync(List<IFormFile> files, string folderPath = "properties")
        {
            var uploadedUrls = new List<string>();
            var uploadTasks = new List<Task<string>>();

            foreach (var file in files)
            {
                if (file.Length > 0)
                {
                    uploadTasks.Add(UploadImageAsync(file, folderPath));
                }
            }

            var results = await Task.WhenAll(uploadTasks);
            uploadedUrls.AddRange(results);

            _logger.LogInformation($"Successfully uploaded {uploadedUrls.Count} images");
            return uploadedUrls;
        }

        public async Task<List<string>> UploadMultipleMemberImagesAsync(List<IFormFile> files, string memberId, string folderPath = "members")
        {
            var uploadedUrls = new List<string>();
            var uploadTasks = new List<Task<string>>();

            foreach (var file in files)
            {
                if (file.Length > 0)
                {
                    uploadTasks.Add(UploadMemberImageAsync(file, memberId, folderPath));
                }
            }

            var results = await Task.WhenAll(uploadTasks);
            uploadedUrls.AddRange(results);

            _logger.LogInformation($"Successfully uploaded {uploadedUrls.Count} images for member {memberId}");
            return uploadedUrls;
        }

        public async Task<bool> DeleteImageAsync(string imageUrl)
        {
            try
            {
                if (string.IsNullOrEmpty(imageUrl))
                    return false;

                var relativePath = imageUrl.TrimStart('/');
                var fullPath = Path.Combine(_environment.WebRootPath, relativePath);

                if (File.Exists(fullPath))
                {
                    File.Delete(fullPath);
                    _logger.LogInformation($"Image deleted successfully: {fullPath}");
                    return true;
                }

                _logger.LogWarning($"Image not found for deletion: {fullPath}");
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting image: {imageUrl}");
                return false;
            }
        }

        public async Task<bool> DeleteMemberImageAsync(string memberId, string imageName, string folderPath = "members")
        {
            try
            {
                if (string.IsNullOrEmpty(memberId) || string.IsNullOrEmpty(imageName))
                    return false;

                var memberFolder = Path.Combine(folderPath, memberId);
                var relativePath = Path.Combine(BaseUploadPath, memberFolder, imageName);
                var fullPath = Path.Combine(_environment.WebRootPath, relativePath);

                if (File.Exists(fullPath))
                {
                    File.Delete(fullPath);
                    _logger.LogInformation($"Member image deleted successfully: {fullPath}");
                    return true;
                }

                _logger.LogWarning($"Member image not found for deletion: {fullPath}");
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting member image for member {memberId}: {imageName}");
                return false;
            }
        }

        public string GetImagePath(string imageUrl)
        {
            if (string.IsNullOrEmpty(imageUrl))
                return string.Empty;

            var relativePath = imageUrl.TrimStart('/');
            return Path.Combine(_environment.WebRootPath, relativePath);
        }

        public List<string> GetImagesInFolder(string folderPath = "properties")
        {
            try
            {
                var folderFullPath = Path.Combine(_environment.WebRootPath, BaseUploadPath, folderPath);

                if (!Directory.Exists(folderFullPath))
                    return new List<string>();

                var files = Directory.GetFiles(folderFullPath)
                    .Where(f => IsImageFile(f))
                    .Select(f => {
                        var relativePath = Path.GetRelativePath(_environment.WebRootPath, f);
                        return $"/{relativePath.Replace('\\', '/')}";
                    })
                    .ToList();

                return files;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting images from folder: {folderPath}");
                return new List<string>();
            }
        }

        public List<string> GetMemberImages(string memberId, string folderPath = "members")
        {
            try
            {
                var memberFolderPath = Path.Combine(_environment.WebRootPath, BaseUploadPath, folderPath, memberId);

                if (!Directory.Exists(memberFolderPath))
                    return new List<string>();

                var files = Directory.GetFiles(memberFolderPath)
                    .Where(f => IsImageFile(f))
                    .Select(f => {
                        var relativePath = Path.GetRelativePath(_environment.WebRootPath, f);
                        return $"/{relativePath.Replace('\\', '/')}";
                    })
                    .ToList();

                return files;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting images for member {memberId}");
                return new List<string>();
            }
        }

        private bool IsImageFile(string filePath)
        {
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp" };
            var extension = Path.GetExtension(filePath).ToLowerInvariant();
            return allowedExtensions.Contains(extension);
        }

        private void ValidateFile(IFormFile file)
        {
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp" };
            var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();

            if (string.IsNullOrEmpty(fileExtension) || !allowedExtensions.Contains(fileExtension))
                throw new ArgumentException("Invalid file type. Allowed types: " + string.Join(", ", allowedExtensions));

            if (file.Length > 10 * 1024 * 1024)
                throw new ArgumentException("File size too large. Maximum size is 10MB.");
        }
    }
}