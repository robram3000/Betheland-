using Realstate_servcices.Server.Entity.Member;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Realstate_servcices.Server.Entity.AuthenticationLog
{
    public class AuthLog
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public Guid AuthLogNo { get; set; } = Guid.NewGuid();

        [Required]
        [ForeignKey("BaseMember")]
        public int BaseMemberId { get; set; }

        [Required]
        [MaxLength(50)]
        public string ActionType { get; set; } = string.Empty;
        // 'login_success', 'login_failed', 'logout', 'password_change', 
        // 'password_reset_request', 'password_reset_success', 'account_lockout', 
        // 'account_unlock', 'two_factor_success', 'two_factor_failed'

        [Required]
        [MaxLength(45)]
        public string IpAddress { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? UserAgent { get; set; }

        [MaxLength(255)]
        public string? DeviceInfo { get; set; }
        // 'Windows Chrome', 'iOS Safari', 'Android App', etc.

        [MaxLength(50)]
        public string? Location { get; set; }
        // Could be city/country derived from IP

        [MaxLength(1000)]
        public string? AdditionalInfo { get; set; }
        // JSON or text field for extra details like failure reasons

        [Required]
        public DateTime LogTimestamp { get; set; } = DateTime.UtcNow;

        [Required]
        public bool IsSuccess { get; set; }

        [MaxLength(255)]
        public string? FailureReason { get; set; }
        // 'invalid_password', 'account_locked', 'expired_token', etc.

        public int? AttemptCount { get; set; }
        // Track sequential failed attempts

        [MaxLength(100)]
        public string? SessionId { get; set; }

        // Navigation property
        public virtual BaseMember? BaseMember { get; set; }
    }
}
