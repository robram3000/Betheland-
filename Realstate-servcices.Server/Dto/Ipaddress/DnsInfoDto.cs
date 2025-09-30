namespace Realstate_servcices.Server.Dto.Ipaddress
{
    public class DnsInfoDto
    {
        public string HostName { get; set; }
        public List<string> IpAddresses { get; set; } = new List<string>();
        public List<string> Aliases { get; set; } = new List<string>();
    }
}
