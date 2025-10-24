using Realstate_servcices.Server.Dto.Register;
namespace Realstate_servcices.Server.Services.ProfileCreation
{
    public interface IProfilePictureService
    {
        /// <summary>
        /// Uploads a profile picture for a member
        /// </summary>
        /// <param name="baseMemberId">The unique identifier of the member</param>
        /// <param name="file">The image file to upload as profile picture</param>
        /// <returns>Profile picture response with upload result and URL</returns>
        Task<ProfilePictureResponse> UploadProfilePictureAsync(int baseMemberId, IFormFile file);
        /// <summary>
        /// Deletes the profile picture of a member
        /// </summary>
        /// <param name="baseMemberId">The unique identifier of the member</param>
        /// <returns>Profile picture response indicating success or failure</returns>
        Task<ProfilePictureResponse> DeleteProfilePictureAsync(int baseMemberId);
        /// <summary>
        /// Retrieves the profile picture URL of a member
        /// </summary>
        /// <param name="baseMemberId">The unique identifier of the member</param>
        /// <returns>Profile picture URL string or null if not found</returns>
        Task<string?> GetProfilePictureAsync(int baseMemberId);
    }
}
