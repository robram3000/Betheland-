using Realstate_servcices.Server.Entity.Member;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Realstate_servcices.Server.Entity.Chat
{
    public class ConversationParticipant
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [ForeignKey("Conversation")]
        public int ConversationId { get; set; }

        [Required]
        [ForeignKey("BaseMember")]
        public int ParticipantId { get; set; }

        [Required]
        [MaxLength(20)]
        public string ParticipantRole { get; set; } = "sender"; // 'sender', 'recipient', 'cc'

        [Required]
        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;

        public DateTime? LeftAt { get; set; }

        [Required]
        public bool IsActive { get; set; } = true;

        // Navigation properties
        public virtual Conversation? Conversation { get; set; }
        public virtual BaseMember? Participant { get; set; }
    }
}
