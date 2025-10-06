using Realstate_servcices.Server.Entity.Member;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Realstate_servcices.Server.Entity.Chat
{
    public class Notification
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public Guid NotificationNo { get; set; } = Guid.NewGuid();

        [Required]
        [ForeignKey("BaseMember")]
        public int RecipientId { get; set; }

        [Required]
        [MaxLength(255)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "text")]
        public string Message { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string NotificationType { get; set; } = "new_message"; // 'new_message', 'schedule_reminder', 'property_update'

        [Required]
        [MaxLength(50)]
        public string RelatedEntityType { get; set; } = "conversation"; // 'conversation', 'property', 'schedule'

        public int? RelatedEntityId { get; set; }

        [Required]
        public bool IsRead { get; set; } = false;

        [Required]
        public DateTime SentAt { get; set; } = DateTime.UtcNow;

        public DateTime? ReadAt { get; set; }

        public DateTime? ExpiryAt { get; set; }
        public virtual BaseMember? Recipient { get; set; }
    }
}
