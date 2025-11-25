using System.ComponentModel.DataAnnotations;

namespace Realstate_servcices.Server.Dto.Chat
{
    public class AddParticipantDto
    {
        public int BaseMemberId { get; set; }
        public int? RecipientId { get; set; } 
        public string Role { get; set; } = "member";
        public string ParticipantType { get; set; } = "user";
    }
}
