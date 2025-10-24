using System.ComponentModel.DataAnnotations;

namespace Realstate_servcices.Server.Dto.Chat
{

    public class UploadFileDto
    {
        
        public IFormFile File { get; set; } = null!;

   
        [MaxLength(50)]
        public string FileType { get; set; } = "image";
    }
}
