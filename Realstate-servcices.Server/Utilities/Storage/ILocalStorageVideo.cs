namespace Realstate_servcices.Server.Utilities.Storage
{
    public interface ILocalStorageVideo
    {
        Task<string> UploadVideoAsync(IFormFile file, string folderPath = "videos");
        Task<string> UploadMemberVideoAsync(IFormFile file, string memberId, string folderPath = "member-videos");
        Task<bool> DeleteVideoAsync(string videoUrl);
        Task<List<string>> UploadMultipleVideosAsync(List<IFormFile> files, string folderPath = "videos");
        Task<List<string>> UploadMultipleMemberVideosAsync(List<IFormFile> files, string memberId, string folderPath = "member-videos");
        string GetVideoPath(string videoUrl);
        List<string> GetMemberVideos(string memberId, string folderPath = "member-videos");
        Task<bool> DeleteMemberVideoAsync(string memberId, string videoName, string folderPath = "member-videos");
        Task<string> GetVideoDurationAsync(string videoUrl);
        Task<long> GetVideoSizeAsync(string videoUrl);
    }
}
          