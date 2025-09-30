using System.ComponentModel.DataAnnotations;

namespace Realstate_servcices.Server.Entity.OTP
{
    public class OTPRecord
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [StringLength(6)]
        public string OTPCode { get; set; }

        public DateTime ExpirationTime { get; set; }

        public bool IsUsed { get; set; }

        public int AttemptCount { get; set; } = 0; 
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}