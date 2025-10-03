namespace Realstate_servcices.Server.Dto.Property
{
    public class PropertyResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public PropertyDto Property { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
    }
}
