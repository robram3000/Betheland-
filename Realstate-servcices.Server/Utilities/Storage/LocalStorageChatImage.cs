namespace Realstate_servcices.Server.Utilities.Storage
{
    public class LocalStorageChatImage : ILocalStorageChatImage
    {
        private readonly IWebHostEnvironment _environment;
        private readonly IConfiguration _configuration;

        public LocalStorageChatImage(IWebHostEnvironment environment, IConfiguration configuration)
        {
            _environment = environment;
            _configuration = configuration;
        }

        public async Task<string> SaveImageAsync(IFormFile imageFile, string folderPath = "chat/images")
        {
            if (imageFile == null || imageFile.Length == 0)
                throw new ArgumentException("Invalid image file");

            // Validate file type
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp" };
            var fileExtension = Path.GetExtension(imageFile.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(fileExtension))
                throw new InvalidOperationException("Invalid image file type");

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
                await imageFile.CopyToAsync(stream);
            }

            // Return relative path for URL access
            return $"/{folderPath}/{fileName}";
        }

        public async Task<string> SaveImageAsync(byte[] imageData, string fileName, string folderPath = "chat/images")
        {
            if (imageData == null || imageData.Length == 0)
                throw new ArgumentException("Invalid image data");

            // Create directory if it doesn't exist
            var uploadPath = Path.Combine(_environment.WebRootPath, folderPath);
            if (!Directory.Exists(uploadPath))
                Directory.CreateDirectory(uploadPath);

            // Generate unique filename if not provided
            var finalFileName = string.IsNullOrEmpty(fileName) ? $"{Guid.NewGuid()}.jpg" : fileName;
            var filePath = Path.Combine(uploadPath, finalFileName);

            // Save file
            await File.WriteAllBytesAsync(filePath, imageData);

            return $"/{folderPath}/{finalFileName}";
        }

        public async Task<bool> DeleteImageAsync(string imagePath)
        {
            if (string.IsNullOrEmpty(imagePath))
                return false;

            // Remove leading slash if present
            var relativePath = imagePath.TrimStart('/');
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

        public async Task<string> GenerateImageThumbnailAsync(string imagePath, int width = 200, int height = 200)
        {
            // Remove leading slash if present
            var relativePath = imagePath.TrimStart('/');
            var fullPath = Path.Combine(_environment.WebRootPath, relativePath);

            if (!File.Exists(fullPath))
                throw new FileNotFoundException("Image file not found");

            // For production, you might want to use ImageSharp or similar library
            // This is a simplified version - in real implementation, resize the image

            var thumbnailPath = Path.Combine(
                Path.GetDirectoryName(fullPath)!,
                $"{Path.GetFileNameWithoutExtension(fullPath)}_thumb{Path.GetExtension(fullPath)}"
            );

            // For now, just copy the original file as a placeholder
            // In real implementation, you would resize the image here
            File.Copy(fullPath, thumbnailPath, true);

            var relativeThumbnailPath = thumbnailPath.Replace(_environment.WebRootPath, "").Replace("\\", "/");
            return relativeThumbnailPath;
        }

        public async Task<Stream> GetImageAsync(string imagePath)
        {
            var relativePath = imagePath.TrimStart('/');
            var fullPath = Path.Combine(_environment.WebRootPath, relativePath);

            if (!File.Exists(fullPath))
                throw new FileNotFoundException("Image file not found");

            return new FileStream(fullPath, FileMode.Open, FileAccess.Read);
        }

        public async Task<bool> ImageExistsAsync(string imagePath)
        {
            var relativePath = imagePath.TrimStart('/');
            var fullPath = Path.Combine(_environment.WebRootPath, relativePath);
            return File.Exists(fullPath);
        }
    }
}
