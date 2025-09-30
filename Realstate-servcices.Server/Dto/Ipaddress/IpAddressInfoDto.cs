namespace Realstate_servcices.Server.Dto.Ipaddress
{
    public class IpAddressInfoDto
    {
        public string IpAddress { get; set; }
        public bool IsPrivate { get; set; }
        public string AddressFamily { get; set; }
        public bool IsLoopback { get; set; }
    }
}
