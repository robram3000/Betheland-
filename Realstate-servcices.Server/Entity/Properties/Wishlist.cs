using Realstate_servcices.Server.Entity.member;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Realstate_servcices.Server.Entity.Properties
{
    public class WishlistProperties
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


        [ForeignKey("ClientId")]
        public virtual Client Client { get; set; } = null!;

        [ForeignKey("PropertyId")]
        public virtual PropertyHouse Property { get; set; } = null!;
    }
}
