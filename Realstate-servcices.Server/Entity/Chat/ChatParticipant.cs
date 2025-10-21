using Realstate_servcices.Server.Entity.Member;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace Realstate_servcices.Server.Entity.Chat
{
    public class ChatParticipant
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public int ChatId { get; set; }

        [Required]
        public int BaseMemberId { get; set; }

        [Required]
        [MaxLength(20)]
        public string Role { get; set; } = "member";

        [Required]
        [MaxLength(20)]
        public string ParticipantType { get; set; } 

        public int UnreadCount { get; set; } = 0;

        public DateTime? LastReadAt { get; set; }

        [Required]
        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;

        public bool IsActive { get; set; } = true;

        // Navigation properties
        [ForeignKey("ChatId")]
        public virtual Chat Chat { get; set; } = null!;

        [ForeignKey("BaseMemberId")]
        public virtual BaseMember BaseMember { get; set; } = null!;
    }
}
