using System.ComponentModel.DataAnnotations;

namespace Realstate_servcices.Server.Dto.Chat
{
    public class AddParticipantDto
    {
        [Required]
        public int BaseMemberId { get; set; }

        [Required]
        [MaxLength(20)]
        public string Role { get; set; } = "member";

        [Required]
        [MaxLength(20)]
        public string ParticipantType { get; set; } = "user";
    }
}
