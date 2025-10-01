
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Realstate_servcices.Server.Entity.member;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Realstate_servcices.Server.Entity.Properties;

namespace Realstate_servcices.Server.Entity.Member
{
    public class BaseMember
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public Guid BaseMemberNo { get; set; } = Guid.NewGuid();

        [Required]
        [EmailAddress]
        [MaxLength(255)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Username { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        public string PasswordHash { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? ProfilePictureUrl { get; set; }

        [Required]
        [MaxLength(20)]
        public string? Role { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        [MaxLength(20)]
        public string status { get; set; } = "Active"; 


        public virtual Client? Client { get; set; }
        public virtual Agent? Agent { get; set; }
        public virtual ICollection<PropertyHouse>? Properties { get; set; }
    }
}
