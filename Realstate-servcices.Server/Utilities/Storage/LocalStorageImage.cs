// LocalStorageImage.cs
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Realstate_servcices.Server.Utilities.Storage.Interfaces;

namespace Realstate_servcices.Server.Utilities.Storage
{
    public class LocalStorageImage : ILocalstorageImage, ILogoStorage
    {
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<LocalStorageImage> _logger;
        private const string BaseUploadPath = "uploads";
        private const string PartnersFolder = "partners";

        public LocalStorageImage(IWebHostEnvironment environment, ILogger<LocalStorageImage> logger)
        {
            _environment = environment;
            _logger = logger;
            EnsureDirectoriesExist();
            EnsurePartnersDirectoryExists();
        }

        private void EnsureDirectoriesExist()
        {
            try
            {
                var uploadsPath = Path.Combine(_environment.WebRootPath, BaseUploadPath);
                var propertiesPath = Path.Combine(uploadsPath, "properties");
                var membersPath = Path.Combine(uploadsPath, "members");
                var partnersPath = Path.Combine(uploadsPath, PartnersFolder);

                if (!Directory.Exists(uploadsPath))
                    Directory.CreateDirectory(uploadsPath);

                if (!Directory.Exists(propertiesPath))
                    Directory.CreateDirectory(propertiesPath);

                if (!Directory.Exists(membersPath))
                    Directory.CreateDirectory(membersPath);

                if (!Directory.Exists(partnersPath))
                    Directory.CreateDirectory(partnersPath);

                _logger.LogInformation("Upload directories created successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create upload directories");
                throw;
            }
        }

        private void EnsurePartnersDirectoryExists()
        {
            try
            {
                var partnersPath = Path.Combine(_environment.WebRootPath, BaseUploadPath, PartnersFolder);
                if (!Directory.Exists(partnersPath))
                    Directory.CreateDirectory(partnersPath);

                _logger.LogInformation("Partners directory created successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create partners directory");
                throw;
            }
        }

        // Logo Storage Implementation
        public async Task<string> UploadPartnerLogoAsync(IFormFile logoFile, string partnerName = "")
        {
            if (logoFile == null || logoFile.Length == 0)
                throw new ArgumentException("Logo file is empty");

            ValidateFile(logoFile);

            try
            {
                // Create safe file name
                var originalFileName = Path.GetFileNameWithoutExtension(logoFile.FileName);
                var fileExtension = Path.GetExtension(logoFile.FileName);
                var safePartnerName = string.IsNullOrEmpty(partnerName)
                    ? "partner"
                    : SanitizeFileName(partnerName);

                var fileName = $"{safePartnerName}_{Guid.NewGuid():N}{fileExtension}";
                var relativePath = Path.Combine(BaseUploadPath, PartnersFolder, fileName);
                var fullPath = Path.Combine(_environment.WebRootPath, relativePath);

                // Ensure directory exists
                var directory = Path.GetDirectoryName(fullPath);
                if (!Directory.Exists(directory))
                    Directory.CreateDirectory(directory!);

                // Save the file
                using (var stream = new FileStream(fullPath, FileMode.Create))
                {
                    await logoFile.CopyToAsync(stream);
                }

                _logger.LogInformation($"Partner logo uploaded successfully: {relativePath}");
                return $"/{relativePath.Replace('\\', '/')}";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error uploading partner logo: {logoFile.FileName}");
                throw new Exception($"Failed to upload partner logo: {ex.Message}");
            }
        }

        public async Task<bool> DeletePartnerLogoAsync(string logoUrl)
        {
            try
            {
                if (string.IsNullOrEmpty(logoUrl))
                    return true; // Nothing to delete

                // Handle both full URLs and relative paths
                var relativePath = logoUrl.StartsWith("http")
                    ? new Uri(logoUrl).AbsolutePath.TrimStart('/')
                    : logoUrl.TrimStart('/');

                var fullPath = Path.Combine(_environment.WebRootPath, relativePath);

                if (File.Exists(fullPath))
                {
                    File.Delete(fullPath);
                    _logger.LogInformation($"Partner logo deleted successfully: {fullPath}");
                    return true;
                }

                _logger.LogWarning($"Partner logo not found for deletion: {fullPath}");
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting partner logo: {logoUrl}");
                return false;
            }
        }

        public async Task<string> UpdatePartnerLogoAsync(IFormFile newLogoFile, string existingLogoUrl, string partnerName = "")
        {
            try
            {
                // Delete existing logo if it exists
                if (!string.IsNullOrEmpty(existingLogoUrl))
                {
                    await DeletePartnerLogoAsync(existingLogoUrl);
                }

                // Upload new logo
                return await UploadPartnerLogoAsync(newLogoFile, partnerName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating partner logo");
                throw;
            }
        }

        public string GetLogoUrl(string storedFileName)
        {
            if (string.IsNullOrEmpty(storedFileName))
                return string.Empty;

            var relativePath = Path.Combine(BaseUploadPath, PartnersFolder, storedFileName);
            return $"/{relativePath.Replace('\\', '/')}";
        }

        private string SanitizeFileName(string fileName)
        {
            var invalidChars = Path.GetInvalidFileNameChars();
            var sanitized = new string(fileName
                .Where(ch => !invalidChars.Contains(ch))
                .ToArray())
                .Replace(" ", "_")
                .ToLowerInvariant();

            return sanitized.Length > 50 ? sanitized.Substring(0, 50) : sanitized;
        }

        // Existing ILocalstorageImage implementation (keep all existing methods)
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