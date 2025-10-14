using System.ComponentModel.DataAnnotations;

namespace Realstate_servcices.Server.Dto.Property
{
    public class UpdatePropertyRequest
    {
        public PropertyDto Property { get; set; } = new PropertyDto();
        public List<string> ImageUrls { get; set; } = new List<string>();
        public List<string> VideoUrls { get; set; } = new List<string>(); // Add this line
    }
}
