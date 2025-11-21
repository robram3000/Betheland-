using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Realstate_servcices.Server.Entity.AuthenticationLog
{
    public class AuditLog
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string UserId { get; set; } = string.Empty;

        [MaxLength(100)]
        public string UserName { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Action { get; set; } = string.Empty; // Login, Logout, Create, Update, Delete

        [Required]
        [MaxLength(100)]
        public string EntityType { get; set; } = string.Empty; // User, Device, System, etc.

        [MaxLength(100)]
        public string EntityId { get; set; } = string.Empty;

        [Column(TypeName = "nvarchar(max)")]
        public string OldValues { get; set; } = string.Empty; // JSON serialized

        [Column(TypeName = "nvarchar(max)")]
        public string NewValues { get; set; } = string.Empty; // JSON serialized

        [Required]
        [MaxLength(50)]
        public string IpAddress { get; set; } = string.Empty;

        [MaxLength(500)]
        public string UserAgent { get; set; } = string.Empty;

        [MaxLength(100)]
        public string DeviceInfo { get; set; } = string.Empty;

        [Required]
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        [MaxLength(20)]
        public string Status { get; set; } = string.Empty; // Success, Failed

        [MaxLength(500)]
        public string ErrorMessage { get; set; } = string.Empty;

        public TimeSpan Duration { get; set; } // For performance tracking

        [MaxLength(100)]
        public string SessionId { get; set; } = string.Empty;
    }
}
