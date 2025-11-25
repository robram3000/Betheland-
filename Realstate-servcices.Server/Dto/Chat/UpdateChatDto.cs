using System.ComponentModel.DataAnnotations;

namespace Realstate_servcices.Server.Dto.Chat
{
    public class UpdateChatDto
    {
        public string? Name { get; set; }
        public int? PropertyId { get; set; }
    }

}
