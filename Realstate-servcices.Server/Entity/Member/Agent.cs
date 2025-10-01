
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Realstate_servcices.Server.Entity.Member;
using Realstate_servcices.Server.Entity.Properties;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace Realstate_servcices.Server.Entity.member
{
    public class Agent
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public int BaseMemberId { get; set; }

        [Required]
        public Guid AgentNo { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? MiddleName { get; set; }

        [Required]
        [MaxLength(100)]
        public string LastName { get; set; } = string.Empty;

        [MaxLength(10)]
        public string? Suffix { get; set; }

        [Required]
        [MaxLength(20)]
        public string CellPhoneNo { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string LicenseNumber { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Bio { get; set; }

        public DateTime? LicenseExpiry { get; set; }

        [Required]
        public DateTime DateRegistered { get; set; } = DateTime.UtcNow;


        [ForeignKey("BaseMemberId")]
        public virtual BaseMember BaseMember { get; set; } = null!;
        public virtual ICollection<PropertyHouse>? Properties { get; set; }
        public virtual ICollection<ScheduleProperties>? ScheduleProperties { get; set; }
    }
}
