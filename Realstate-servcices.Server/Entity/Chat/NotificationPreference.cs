using Realstate_servcices.Server.Entity.Member;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Realstate_servcices.Server.Entity.Chat
{
    public class NotificationPreference
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public int BaseMemberId { get; set; }

        [Required]
        public bool EmailNotifications { get; set; } = true;

        [Required]
        public bool PushNotifications { get; set; } = true;

        [Required]
        public bool SMSNotifications { get; set; } = false;

        [Required]
        public bool NewMessageNotifications { get; set; } = true;

        [Required]
        public bool PropertyUpdateNotifications { get; set; } = true;

        [Required]
        public bool AppointmentNotifications { get; set; } = true;

        [Required]
        public bool SystemNotifications { get; set; } = true;

        public string? DeviceTokens { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("BaseMemberId")]
        public virtual BaseMember BaseMember { get; set; } = null!;
    }
}
