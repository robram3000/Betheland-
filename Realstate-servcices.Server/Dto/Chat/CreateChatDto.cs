using System.ComponentModel.DataAnnotations;

namespace Realstate_servcices.Server.Dto.Chat
{
    public class CreateChatDto
    {
        public string? Name { get; set; }
        public string ChatType { get; set; } = "direct";
        public int? PropertyId { get; set; }
        public List<int> ParticipantIds { get; set; } = new List<int>();
    }

}
