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

                if (!Directory.Exists(uploadsPath))
                    Directory.CreateDirectory(uploadsPath);

                if (!Directory.Exists(propertiesPath))
                    Directory.CreateDirectory(propertiesPath);

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

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp" };
            var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();

            if (string.IsNullOrEmpty(fileExtension) || !allowedExtensions.Contains(fileExtension))
                throw new ArgumentException("Invalid file type. Allowed types: " + string.Join(", ", allowedExtensions));

            if (file.Length > 10 * 1024 * 1024)
                throw new ArgumentException("File size too large. Maximum size is 10MB.");

            try
            {
                var fileName = $"{Guid.NewGuid()}{fileExtension}";
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

        private bool IsImageFile(string filePath)
        {
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp" };
            var extension = Path.GetExtension(filePath).ToLowerInvariant();
            return allowedExtensions.Contains(extension);
        }
    }
}