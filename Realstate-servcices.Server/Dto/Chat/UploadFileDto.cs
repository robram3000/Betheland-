namespace Realstate_servcices.Server.Dto.Chat
{

    public class UploadFileDto
    {
        public IFormFile File { get; set; } = null!;
        public string FileType { get; set; } = "image";
    }
}
