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
        }

        public async Task<string> UploadImageAsync(IFormFile file, string folderPath = "properties")
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("File is empty");

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();

            if (!allowedExtensions.Contains(fileExtension))
                throw new ArgumentException("Invalid file type");

            if (file.Length > 10 * 1024 * 1024)
                throw new ArgumentException("File size too large. Maximum size is 10MB.");


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

        public async Task<List<string>> UploadMultipleImagesAsync(List<IFormFile> files, string folderPath = "properties")
        {
            var uploadedUrls = new List<string>();

            foreach (var file in files)
            {
                if (file.Length > 0)
                {
                    try
                    {
                        var url = await UploadImageAsync(file, folderPath);
                        uploadedUrls.Add(url);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, $"Failed to upload image: {file.FileName}");
                        throw;
                    }
                }
            }

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
    }
}