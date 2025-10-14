using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Realstate_servcices.Server.Entity.Member;
using Realstate_servcices.Server.Entity.Properties;

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Realstate_servcices.Server.Entity.member
{
    public class Client
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public int BaseMemberId { get; set; }

        [Required]
        public Guid ClientNo { get; set; } = Guid.NewGuid();

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
        [MaxLength(11)]
        public string CellPhoneNo { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string Gender { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Country { get; set; }

        [MaxLength(100)]
        public string? City { get; set; }

        [MaxLength(255)]
        public string? Street { get; set; }

        [MaxLength(20)]
        public string? ZipCode { get; set; }


        [MaxLength(255)]
        public string? Address { get; set; }

        [Required]
        public DateTime DateRegistered { get; set; } = DateTime.UtcNow;


        [ForeignKey("BaseMemberId")]
        public virtual BaseMember BaseMember { get; set; } = null!;
        public virtual ICollection<PropertyHouse>? Properties { get; set; }

        public virtual ICollection<ScheduleProperties>? ScheduleProperties { get; set; }

        public virtual ICollection<WishlistProperties>? Wishlists { get; set; }
        public virtual ICollection<Rating>? Ratings { get; set; }

    }
}