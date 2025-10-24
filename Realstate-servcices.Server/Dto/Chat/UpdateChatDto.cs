using System.ComponentModel.DataAnnotations;

namespace Realstate_servcices.Server.Dto.Chat
{
    public class UpdateChatDto
    {
        [MaxLength(255)]
        public string? Name { get; set; }

        [MaxLength(50)]
        public string? PropertyId { get; set; }
    }

}
