
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.NetworkInformation;
using System.Net.Sockets;
using System.Threading.Tasks;

namespace Realstate_servcices.Server.Services.Ipaddress
{
    public interface IIPAddressService
    {
        Task<string> GetLocalIPAddressAsync();
        Task<string> GetPublicIPAddressAsync();
        Task<List<string>> GetDNSServersAsync();
        Task<Dictionary<string, object>> GetNetworkInfoAsync();
    }
    public class IPAddressService : IIPAddressService
    {
        public async Task<string> GetLocalIPAddressAsync()
        {
            return await Task.Run(() =>
            {
                try
                {
                    using var socket = new Socket(AddressFamily.InterNetwork, SocketType.Dgram, 0);
                    socket.Connect("8.8.8.8", 65530);
                    var endPoint = socket.LocalEndPoint as IPEndPoint;
                    return endPoint?.Address.ToString() ?? "Unknown";
                }
                catch
                {
                    return GetLocalIPAddressFallback();
                }
            });
        }

        public async Task<string> GetPublicIPAddressAsync()
        {
            return await Task.Run(async () =>
            {
                try
                {
                    using var client = new WebClient();
                    return await client.DownloadStringTaskAsync("https://api.ipify.org");
                }
                catch
                {
                    return "Unknown";
                }
            });
        }

        public async Task<List<string>> GetDNSServersAsync()
        {
            return await Task.Run(() =>
            {
                try
                {
                    var networkInterfaces = NetworkInterface.GetAllNetworkInterfaces()
                        .Where(ni => ni.OperationalStatus == OperationalStatus.Up)
                        .ToList();

                    var dnsServers = new List<string>();

                    foreach (var ni in networkInterfaces)
                    {
                        var properties = ni.GetIPProperties();
                        dnsServers.AddRange(properties.DnsAddresses.Select(dns => dns.ToString()));
                    }

                    return dnsServers.Distinct().ToList();
                }
                catch
                {
                    return new List<string> { "Unknown" };
                }
            });
        }

        public async Task<Dictionary<string, object>> GetNetworkInfoAsync()
        {
            return await Task.Run(async () =>
            {
                var localIP = await GetLocalIPAddressAsync();
                var publicIP = await GetPublicIPAddressAsync();
                var dnsServers = await GetDNSServersAsync();

                return new Dictionary<string, object>
                {
                    ["LocalIP"] = localIP,
                    ["PublicIP"] = publicIP,
                    ["DNSServers"] = dnsServers,
                    ["HostName"] = Dns.GetHostName(),
                    ["NetworkInterfaces"] = GetNetworkInterfacesInfo()
                };
            });
        }

        private string GetLocalIPAddressFallback()
        {
            try
            {
                var host = Dns.GetHostEntry(Dns.GetHostName());
                foreach (var ip in host.AddressList)
                {
                    if (ip.AddressFamily == AddressFamily.InterNetwork)
                    {
                        return ip.ToString();
                    }
                }
            }
            catch { }

            return "Unknown";
        }

        private List<Dictionary<string, object>> GetNetworkInterfacesInfo()
        {
            var interfaces = new List<Dictionary<string, object>>();

            try
            {
                foreach (var ni in NetworkInterface.GetAllNetworkInterfaces())
                {
                    var properties = ni.GetIPProperties();
                    var interfaceInfo = new Dictionary<string, object>
                    {
                        ["Name"] = ni.Name,
                        ["Description"] = ni.Description,
                        ["Type"] = ni.NetworkInterfaceType.ToString(),
                        ["Status"] = ni.OperationalStatus.ToString(),
                        ["Speed"] = ni.Speed,
                        ["MAC"] = ni.GetPhysicalAddress().ToString(),
                        ["UnicastAddresses"] = properties.UnicastAddresses
                            .Select(addr => new
                            {
                                Address = addr.Address.ToString(),
                                PrefixLength = addr.PrefixLength
                            })
                            .ToList()
                    };

                    interfaces.Add(interfaceInfo);
                }
            }
            catch { }

            return interfaces;
        }
    }
}
