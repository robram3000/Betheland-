using System.ComponentModel.DataAnnotations;

namespace Realstate_servcices.Server.Dto.Chat
{
    public class CreateMessageDto
    {
        [Required]
        public int ChatId { get; set; }

        [MaxLength(2000)]
        public string? Content { get; set; }

        [Required]
        [MaxLength(20)]
        public string MessageType { get; set; } = "text";

        public List<MessageFileDto>? Files { get; set; }
    }
}
