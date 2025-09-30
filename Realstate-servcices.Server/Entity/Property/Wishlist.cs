using Realstate_servcices.Server.Entity.member;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Realstate_servcices.Server.Entity.Property
{
    public class Wishlist
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public Guid WishlistNo { get; set; } = Guid.NewGuid();

        [Required]
        public int ClientId { get; set; }

        [Required]
        public int PropertyId { get; set; }

        [Required]
        public DateTime AddedDate { get; set; } = DateTime.UtcNow;

        [MaxLength(500)]
        public string? Notes { get; set; }

        // Navigation properties
        [ForeignKey("ClientId")]
        public virtual Client Client { get; set; } = null!;

        [ForeignKey("PropertyId")]
        public virtual Property Property { get; set; } = null!;
    }
}
