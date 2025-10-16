using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Realstate_servcices.Server.Entity.Properties
{
    public class PropertyVideo
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public int PropertyId { get; set; }

        [Required]
        [MaxLength(500)]
        public string VideoUrl { get; set; } = string.Empty;

        [MaxLength(500)]
        public string ThumbnailUrl { get; set; } = string.Empty;

        public long FileSize { get; set; }

        public long Size { get; set; }



        public string Duration { get; set; } = string.Empty;

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [MaxLength(100)]
        public string VideoName { get; set; } = string.Empty;

        [ForeignKey("PropertyId")]
        public virtual PropertyHouse Property { get; set; } = null!;
    }
}