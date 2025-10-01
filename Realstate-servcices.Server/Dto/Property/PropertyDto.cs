using System.ComponentModel.DataAnnotations;

namespace Realstate_servcices.Server.Dto.Property
{
    public class PropertyDto
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string Type { get; set; } = "house";

        [Required]
        [Range(0, double.MaxValue)]
        public decimal Price { get; set; }

        public int PropertyAge { get; set; }

        public int PropertyFloor { get; set; } = 1;

        [Required]
        [Range(0, int.MaxValue)]
        public int Bedrooms { get; set; } = 1;

        [Required]
        [Range(0, double.MaxValue)]
        public decimal Bathrooms { get; set; } = 1;

        [Required]
        [Range(0, int.MaxValue)]
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

        public decimal? Latitude { get; set; }

        public decimal? Longitude { get; set; }

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "available";

        [Required]
        public int OwnerId { get; set; }

        public int? AgentId { get; set; }

        public string Amenities { get; set; } = "[]";

        public List<PropertyImageDto>? PropertyImages { get; set; }

        public string? MainImage { get; set; }
    }
}
