namespace Realstate_servcices.Server.Dto.Property
{
    public class PropertyHouseDto
    {

        public int Id { get; set; }
        public Guid PropertyNo { get; set; }

        public string Title { get; set; } = string.Empty;

        public string Address{ get; set; } = string.Empty;
        
    }
}
