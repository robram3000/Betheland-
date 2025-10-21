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
        public int BaseMemberId { get; set; } 

        [Required]
        [MaxLength(50)]
        public string NotificationType { get; set; } = "message";

        [Required]
        [MaxLength(255)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? Content { get; set; } 

        [MaxLength(500)]
        public string? Data { get; set; } 

        public int? ChatId { get; set; }

        public int? MessageId { get; set; }

        public int? PropertyId { get; set; }

        [Required]
        public bool IsRead { get; set; } = false;

        [Required]
        public bool IsPushed { get; set; } = false;

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? ReadAt { get; set; }

        public DateTime? PushedAt { get; set; }

        [Required]
        [MaxLength(20)]
        public string Priority { get; set; } = "normal"; 

        [ForeignKey("BaseMemberId")]
        public virtual BaseMember BaseMember { get; set; } = null!;

        [ForeignKey("ChatId")]
        public virtual Chat? Chat { get; set; }

        [ForeignKey("MessageId")]
        public virtual Message? Message { get; set; } 
    }
}