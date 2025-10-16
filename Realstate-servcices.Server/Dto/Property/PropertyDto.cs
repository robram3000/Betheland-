using System.ComponentModel.DataAnnotations;

namespace Realstate_servcices.Server.Dto.Property
{
    public class PropertyDto
    {
        public int Id { get; set; }
        public Guid PropertyNo { get; set; } = Guid.NewGuid();
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int PropertyAge { get; set; }
        public int PropertyFloor { get; set; } = 1;
        public int Bedrooms { get; set; } = 1;
        public decimal Bathrooms { get; set; } = 1;
        public int AreaSqm { get; set; }
        public int Kitchen { get; set; }
        public int Garage { get; set; }

        public string Country { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public string ZipCode { get; set; } = string.Empty;
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public string Status { get; set; } = "available";
        public int? OwnerId { get; set; } = null;
        public int? AgentId { get; set; } = null;
        public string Amenities { get; set; } = "[]";
        public DateTime ListedDate { get; set; } = DateTime.UtcNow;
        public List<PropertyImageDto> PropertyImages { get; set; } = new List<PropertyImageDto>();
        public List<PropertyVideoDto> PropertyVideos { get; set; } = new List<PropertyVideoDto>();
        public string MainImage { get; set; } = string.Empty;
        public string MainVideo { get; set; } = string.Empty;
    }
}
