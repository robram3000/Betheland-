using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Realstate_servcices.Server.Entity.AuthenticationLog
{
    public class DeviceSession
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int DeviceInfoId { get; set; }

        [Required]
        [MaxLength(100)]
        public string SessionId { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string UserId { get; set; } = string.Empty;

        [MaxLength(100)]
        public string UserName { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string IpAddress { get; set; } = string.Empty;

        [MaxLength(500)]
        public string UserAgent { get; set; } = string.Empty;

        public DateTime LoginTime { get; set; } = DateTime.UtcNow;

        public DateTime? LogoutTime { get; set; }

        public bool IsActive { get; set; } = true;

        [MaxLength(20)]
        public string Status { get; set; } = string.Empty; // Active, Expired, Terminated

        // Navigation Property
        [ForeignKey("DeviceInfoId")]
        public virtual DeviceInfo DeviceInfo { get; set; } = null!;
    }
}
