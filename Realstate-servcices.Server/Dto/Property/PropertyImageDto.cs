using System.ComponentModel.DataAnnotations;

namespace Realstate_servcices.Server.Dto.Property
{
    public class PropertyImageDto
    {
        public int Id { get; set; }

        [Required]
        public int PropertyId { get; set; }

        [Required]
        [MaxLength(500)]
        public string ImageUrl { get; set; } = string.Empty;
    }
}
