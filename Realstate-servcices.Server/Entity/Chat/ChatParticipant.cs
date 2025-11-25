using Realstate_servcices.Server.Entity.Member;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace Realstate_servcices.Server.Entity.Chat
{
    public class ChatParticipant
    {
        public int Id { get; set; }
        public int ChatId { get; set; }
        public int BaseMemberId { get; set; }
        public int? RecipientId { get; set; }
        public string Role { get; set; }
        public string ParticipantType { get; set; }
        public int UnreadCount { get; set; }
        public DateTime? LastReadAt { get; set; }
        public DateTime JoinedAt { get; set; }
        public bool IsActive { get; set; }

        // Navigation properties
        public virtual Chat Chat { get; set; }
        public virtual BaseMember BaseMember { get; set; }
        public virtual BaseMember Recipient { get; set; }
    }
}
