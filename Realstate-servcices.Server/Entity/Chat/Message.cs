using Realstate_servcices.Server.Entity.Member;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Realstate_servcices.Server.Entity.Chat
{
    public class Message
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public Guid MessageNo { get; set; } = Guid.NewGuid();

        [Required]
        [ForeignKey("Conversation")]
        public int ConversationId { get; set; }

        [Required]
        [ForeignKey("BaseMember")]
        public int SenderId { get; set; }

        [ForeignKey("Message")]
        public int? ParentMessageId { get; set; }

        [Required]
        [MaxLength(20)]
        public string MessageType { get; set; } = "text"; 

        [Required]
        [Column(TypeName = "text")]
        public string Content { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? AttachmentUrl { get; set; }

        [Required]
        public bool IsRead { get; set; } = false;

        [Required]
        public bool IsDelivered { get; set; } = false;

        [Required]
        public DateTime SentAt { get; set; } = DateTime.UtcNow;

        public DateTime? DeliveredAt { get; set; }

        public DateTime? ReadAt { get; set; }

        // Navigation properties
        public virtual Conversation? Conversation { get; set; }
        public virtual BaseMember? Sender { get; set; }
        public virtual Message? ParentMessage { get; set; }
        public virtual ICollection<Message>? Replies { get; set; }
    }
}
