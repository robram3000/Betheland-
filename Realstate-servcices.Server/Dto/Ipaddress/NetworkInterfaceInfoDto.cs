using System.Collections.Generic;

namespace Realstate_servcices.Server.Dto.Ipaddress
{
    public class NetworkInterfaceInfoDto
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public string Type { get; set; }
        public string Status { get; set; }
        public List<string> IpAddresses { get; set; } = new List<string>();
        public string MacAddress { get; set; }
        public long Speed { get; set; }
    }
}
