namespace Realstate_servcices.Server.Dto.Property
{
    public class PropertiesResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public List<PropertyDto> Properties { get; set; } = new();
        public int TotalCount { get; set; }
    }
}
