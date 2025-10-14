namespace Realstate_servcices.Server.Dto.Register
{
    public class ProfilePictureDto
    {
        public string ProfilePictureUrl { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }

    public class ProfilePictureResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string ProfilePictureUrl { get; set; } = string.Empty;
    }

}
