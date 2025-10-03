namespace Realstate_servcices.Server.Dto.Property
{
    public class PropertiesResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public List<PropertyDto> Properties { get; set; } = new List<PropertyDto>();
        public int TotalCount { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
    }
}
