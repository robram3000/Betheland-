using System.ComponentModel.DataAnnotations;

namespace Realstate_servcices.Server.Dto.Chat
{
    public class CreateMessageDto
    {
        public int ChatId { get; set; }
        public string Content { get; set; }
        public string MessageType { get; set; } = "text";
        public int? RecipientId { get; set; } // Add this
        public List<MessageFileDto> Files { get; set; } = new List<MessageFileDto>();
    }
}
