using Realstate_servcices.Server.Dto.Register;
using Realstate_servcices.Server.Repository.UserDAO;
using Realstate_servcices.Server.Services.ProfileCreation.Interfaces;
using Realstate_servcices.Server.Utilities.Storage.Interfaces;
namespace Realstate_servcices.Server.Services.ProfileCreation
{
    /// <summary>
    /// Service implementation for managing profile pictures for members
    /// </summary>
    public class ProfilePictureService : IProfilePictureService
    {
        private readonly IBaseMemberRepository _baseMemberRepository;
        private readonly ILocalstorageImage _localStorageImage;
        private readonly ILogger<ProfilePictureService> _logger;
        /// <summary>
        /// Initializes a new instance of the ProfilePictureService class
        /// </summary>
        /// <param name="baseMemberRepository">Repository for base member data operations</param>
        /// <param name="localStorageImage">Service for local image storage operations</param>
        /// <param name="logger">Logger for tracking service operations and errors</param>
        public ProfilePictureService(
            IBaseMemberRepository baseMemberRepository,
            ILocalstorageImage localStorageImage,
            ILogger<ProfilePictureService> logger)
        {
            _baseMemberRepository = baseMemberRepository;
            _localStorageImage = localStorageImage;
            _logger = logger;
        }
        /// <summary>
        /// Uploads and validates a profile picture for a member
        /// </summary>
        /// <param name="baseMemberId">The unique identifier of the member</param>
        /// <param name="file">The image file to upload as profile picture (JPEG, PNG, GIF, WebP, BMP, max 10MB)</param>
        /// <returns>Profile picture response with upload result and URL</returns>
        public async Task<ProfilePictureResponse> UploadProfilePictureAsync(int baseMemberId, IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return new ProfilePictureResponse
                    {
                        Success = false,
                        Message = "No file provided"
                    };
                }
                if (!IsValidImageFile(file))
                {
                    return new ProfilePictureResponse
                    {
                        Success = false,
                        Message = "Invalid file type. Only JPEG, PNG, GIF, and WebP files are allowed (max 10MB)."
                    };
                }

      
                var imageUrl = await _localStorageImage.UploadMemberImageAsync(file, baseMemberId.ToString(), "profile-pictures");
                var success = await _baseMemberRepository.UpdateProfilePictureAsync(baseMemberId, imageUrl);

                if (!success)
                {
                    
                    await _localStorageImage.DeleteImageAsync(imageUrl);
                    return new ProfilePictureResponse
                    {
                        Success = false,
                        Message = "Failed to update profile picture"
                    };
                }

                _logger.LogInformation("Profile picture uploaded successfully for BaseMemberId: {BaseMemberId}", baseMemberId);

                return new ProfilePictureResponse
                {
                    Success = true,
                    Message = "Profile picture uploaded successfully",
                    ProfilePictureUrl = imageUrl
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading profile picture for BaseMemberId: {BaseMemberId}", baseMemberId);
                return new ProfilePictureResponse
                {
                    Success = false,
                    Message = $"Error uploading profile picture: {ex.Message}"
                };
            }
        }
        /// <summary>
        /// Deletes the profile picture of a member from both storage and database
        /// </summary>
        /// <param name="baseMemberId">The unique identifier of the member</param>
        /// <returns>Profile picture response indicating success or failure</returns>
        public async Task<ProfilePictureResponse> DeleteProfilePictureAsync(int baseMemberId)
        {
            try
            {
               
                var baseMember = await _baseMemberRepository.GetBaseMemberByIdAsync(baseMemberId);

                if (baseMember?.ProfilePictureUrl == null)
                {
                    return new ProfilePictureResponse
                    {
                        Success = false,
                        Message = "No profile picture found"
                    };
                }

                // Delete from storage
                var deleteSuccess = await _localStorageImage.DeleteImageAsync(baseMember.ProfilePictureUrl);

                if (!deleteSuccess)
                {
                    _logger.LogWarning("Failed to delete profile picture from storage for BaseMemberId: {BaseMemberId}", baseMemberId);
                }

                // Update database to remove profile picture URL
                var updateSuccess = await _baseMemberRepository.UpdateProfilePictureAsync(baseMemberId, null);

                if (!updateSuccess)
                {
                    return new ProfilePictureResponse
                    {
                        Success = false,
                        Message = "Failed to update database"
                    };
                }

                _logger.LogInformation("Profile picture deleted successfully for BaseMemberId: {BaseMemberId}", baseMemberId);

                return new ProfilePictureResponse
                {
                    Success = true,
                    Message = "Profile picture deleted successfully"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting profile picture for BaseMemberId: {BaseMemberId}", baseMemberId);
                return new ProfilePictureResponse
                {
                    Success = false,
                    Message = $"Error deleting profile picture: {ex.Message}"
                };
            }
        }
        /// <summary>
        /// Retrieves the profile picture URL of a member from the database
        /// </summary>
        /// <param name="baseMemberId">The unique identifier of the member</param>
        /// <returns>Profile picture URL string or null if not found</returns>
        public async Task<string?> GetProfilePictureAsync(int baseMemberId)
        {
            try
            {
                var baseMember = await _baseMemberRepository.GetBaseMemberByIdAsync(baseMemberId);
                return baseMember?.ProfilePictureUrl;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting profile picture for BaseMemberId: {BaseMemberId}", baseMemberId);
                return null;
            }
        }
        /// <summary>
        /// Validates if the provided file is a supported image type and within size limits
        /// </summary>
        /// <param name="file">The image file to validate</param>
        /// <returns>True if the file is valid, false otherwise</returns>
        private bool IsValidImageFile(IFormFile file)
        {
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp" };
            var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();

            if (string.IsNullOrEmpty(fileExtension) || !allowedExtensions.Contains(fileExtension))
                return false;

            if (file.Length > 10 * 1024 * 1024) // 10MB
                return false;

            return true;
        }
    }
}
