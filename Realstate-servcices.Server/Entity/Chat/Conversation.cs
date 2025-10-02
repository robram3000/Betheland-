using Realstate_servcices.Server.Entity.Member;
using Realstate_servcices.Server.Entity.Properties;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Realstate_servcices.Server.Entity.Chat
{
    public class Conversation
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public Guid ConversationNo { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(255)]
        public string Subject { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string ConversationType { get; set; } = "general"; 

        [ForeignKey("PropertyHouse")]
        public int? PropertyId { get; set; }

        [Required]
        [ForeignKey("BaseMember")]
        public int CreatedBy { get; set; }

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "active"; 
        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual BaseMember? Creator { get; set; }
        public virtual PropertyHouse? Property { get; set; }
        public virtual ICollection<ConversationParticipant>? Participants { get; set; }
        public virtual ICollection<Message>? Messages { get; set; }
    }
}
