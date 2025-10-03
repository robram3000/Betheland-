using System.ComponentModel.DataAnnotations;

namespace Realstate_servcices.Server.Dto.Property
{
    public class PropertyImageDto
    {
        public int Id { get; set; }
        public int PropertyId { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
    }
}
