//using System.Net.NetworkInformation;

//namespace Realstate_servcices.Server.Utilities.Network
//{
//    public class NetworkInterfaceUtility
//    {
//        public List<string> GetAllLocalIpAddresses()
//        {
//            var ipAddresses = new List<string>();

//            foreach (var networkInterface in NetworkInterface.GetAllNetworkInterfaces())
//            {
//                if (networkInterface.OperationalStatus == OperationalStatus.Up)
//                {
//                    var ipProperties = networkInterface.GetIPProperties();

//                    foreach (var unicastAddress in ipProperties.UnicastAddresses)
//                    {
//                        if (unicastAddress.Address.AddressFamily == System.Net.Sockets.AddressFamily.InterNetwork ||
//                            unicastAddress.Address.AddressFamily == System.Net.Sockets.AddressFamily.InterNetworkV6)
//                        {
//                            ipAddresses.Add(unicastAddress.Address.ToString());
//                        }
//                    }
//                }
//            }

//            return ipAddresses.Distinct().ToList();
//        }

//        public List<NetworkInterface> GetActiveNetworkInterfaces()
//        {
//            return NetworkInterface.GetAllNetworkInterfaces()
//                .Where(ni => ni.OperationalStatus == OperationalStatus.Up)
//                .ToList();
//        }

//        public string GetMacAddress(string interfaceName)
//        {
//            var networkInterface = NetworkInterface.GetAllNetworkInterfaces()
//                .FirstOrDefault(ni => ni.Name == interfaceName);

//            return networkInterface?.GetPhysicalAddress().ToString() ?? string.Empty;
//        }

//        public bool IsNetworkAvailable()
//        {
//            return NetworkInterface.GetIsNetworkAvailable();
//        }
//    }
//}
