using Realstate_servcices.Server.Dto.Register;

namespace Realstate_servcices.Server.Services.ProfileCreation
{
    public interface IProfilePictureService
    {
        Task<ProfilePictureResponse> UploadProfilePictureAsync(int baseMemberId, IFormFile file);
        Task<ProfilePictureResponse> DeleteProfilePictureAsync(int baseMemberId);
        Task<string?> GetProfilePictureAsync(int baseMemberId);
    }
}
