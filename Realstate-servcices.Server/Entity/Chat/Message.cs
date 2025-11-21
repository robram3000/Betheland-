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
        public int ChatId { get; set; }

        [Required]
        public int SenderId { get; set; }

        [Required]
        public int RecipientId { get; set; }

        [MaxLength(2000)]
        public string? Content { get; set; }

        [Required]
        [MaxLength(20)]
        public string MessageType { get; set; } = "text";

        public bool IsEdited { get; set; } = false;

        public bool IsDeleted { get; set; } = false;

        [Required]
        public DateTime SentAt { get; set; } = DateTime.UtcNow;

        public DateTime? ReadAt { get; set; }

        public DateTime? EditedAt { get; set; }

        [ForeignKey("ChatId")]
        public virtual Chat Chat { get; set; } = null!;

        [ForeignKey("SenderId")]
        public virtual BaseMember Sender { get; set; } = null!;


        public virtual ICollection<MessageFile> MessageFiles { get; set; } = new List<MessageFile>();
        public virtual ICollection<MessageReaction> Reactions { get; set; } = new List<MessageReaction>();
        public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    }
}