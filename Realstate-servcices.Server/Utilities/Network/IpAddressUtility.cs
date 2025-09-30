//using System.Net;
//using System.Net.Sockets;

//namespace Realstate_servcices.Server.Utilities.Network
//{
//    public class IpAddressUtility
//    {
//        public bool IsValidIpAddress(string ipAddress)
//        {
//            return IPAddress.TryParse(ipAddress, out _);
//        }

//        public bool IsPrivateAddress(string ipAddress)
//        {
//            if (!IsValidIpAddress(ipAddress))
//                return false;

//            var address = IPAddress.Parse(ipAddress);

//            if (IPAddress.IsLoopback(address))
//                return true;

//            byte[] ipBytes = address.GetAddressBytes();

//            // IPv4 private ranges
//            if (address.AddressFamily == AddressFamily.InterNetwork)
//            {
//                // 10.0.0.0/8
//                if (ipBytes[0] == 10)
//                    return true;

//                // 172.16.0.0/12
//                if (ipBytes[0] == 172 && ipBytes[1] >= 16 && ipBytes[1] <= 31)
//                    return true;

//                // 192.168.0.0/16
//                if (ipBytes[0] == 192 && ipBytes[1] == 168)
//                    return true;

//                // 169.254.0.0/16 (link-local)
//                if (ipBytes[0] == 169 && ipBytes[1] == 254)
//                    return true;
//            }

//            // IPv6 private ranges
//            if (address.AddressFamily == AddressFamily.InterNetworkV6)
//            {
//                if (address.IsIPv6LinkLocal || address.IsIPv6SiteLocal)
//                    return true;

//                // Unique Local Address (fc00::/7)
//                if (ipBytes[0] >= 0xFC && ipBytes[0] <= 0xFD)
//                    return true;
//            }

//            return false;
//        }

//        public bool IsLoopbackAddress(string ipAddress)
//        {
//            if (!IsValidIpAddress(ipAddress))
//                return false;

//            return IPAddress.IsLoopback(IPAddress.Parse(ipAddress));
//        }

//        public string GetAddressFamily(string ipAddress)
//        {
//            if (!IsValidIpAddress(ipAddress))
//                return "Invalid";

//            var address = IPAddress.Parse(ipAddress);
//            return address.AddressFamily.ToString();
//        }

//        public IPAddress Parse(string ipAddress)
//        {
//            return IPAddress.Parse(ipAddress);
//        }
//    }
//}
