using System.ComponentModel.DataAnnotations;

namespace Realstate_servcices.Server.Dto.Property
{
    public class CreatePropertyRequest
    {
        [Required]
        public PropertyDto Property { get; set; } = new();

        public List<string>? ImageUrls { get; set; }

        public string? MainImageUrl { get; set; }
    }
}
