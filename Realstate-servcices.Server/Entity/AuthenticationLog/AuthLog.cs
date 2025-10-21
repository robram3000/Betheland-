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
 

        [Required]
        [MaxLength(45)]
        public string IpAddress { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? UserAgent { get; set; }

        [MaxLength(255)]
        public string? DeviceInfo { get; set; }
 

        [MaxLength(50)]
        public string? Location { get; set; }
        

        [MaxLength(1000)]
        public string? AdditionalInfo { get; set; }


        [Required]
        public DateTime LogTimestamp { get; set; } = DateTime.UtcNow;

        [Required]
        public bool IsSuccess { get; set; }

        [MaxLength(255)]
        public string? FailureReason { get; set; }
 

        public int? AttemptCount { get; set; }
  

        [MaxLength(100)]
        public string? SessionId { get; set; }

        public virtual BaseMember? BaseMember { get; set; }
    }
}
