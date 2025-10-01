using Realstate_servcices.Server.Entity.member;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Realstate_servcices.Server.Entity.Property
{
    public class Property
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public Guid PropertyNo { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string? Type { get; set; }

        [Required]
        [Column(TypeName = "decimal(12,2)")]
        public decimal Price { get; set; }

        public int PropertyAge { get; set; }

        public int PropertyFloor { get; set; }

        public int Bedrooms { get; set; }

        [Column(TypeName = "decimal(3,1)")]
        public decimal Bathrooms { get; set; }

        public int AreaSqft { get; set; }

        [Required]
        [MaxLength(255)]
        public string Address { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string City { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string State { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string ZipCode { get; set; } = string.Empty;

        [Column(TypeName = "decimal(10,8)")]
        public decimal? Latitude { get; set; }

        [Column(TypeName = "decimal(11,8)")]
        public decimal? Longitude { get; set; }

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "available";

        [Required]
        public int OwnerId { get; set; }

        public int? AgentId { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public DateTime ListedDate { get; set; } = DateTime.UtcNow;

        public string Amenities { get; set; } = "[]";

        [ForeignKey("OwnerId")]
        public virtual Client Owner { get; set; } = null!;

        [ForeignKey("AgentId")]
        public virtual Agent? Agent { get; set; }

        public virtual ICollection<PropertyImage>? PropertyImages { get; set; }


        public virtual ICollection<ScheduleProperties>? ScheduleProperties { get; set; }

        public virtual ICollection<Wishlist>? Wishlists { get; set; }
    }
}