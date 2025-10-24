using System.ComponentModel.DataAnnotations;

namespace Realstate_servcices.Server.Dto.Chat
{
    public class CreateChatDto
    {
        [Required]
        [MaxLength(255)]
        public string? Name { get; set; }

        [Required]
        [MaxLength(20)]
        public string ChatType { get; set; } = "direct";

        [MaxLength(50)]
        public string? PropertyId { get; set; }

        [Required]
        public List<int> ParticipantIds { get; set; } = new List<int>();
    }
}
