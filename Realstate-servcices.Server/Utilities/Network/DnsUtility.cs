//using System.Net;

//namespace Realstate_servcices.Server.Utilities.Network
//{
//    public class DnsUtility
//    {
//        private readonly HttpClient _httpClient;

//        public DnsUtility()
//        {
//            _httpClient = new HttpClient();
//        }

//        public async Task<string> GetPublicIpAddressAsync()
//        {
//            try
//            {
//                // Using a reliable IP detection service
//                var response = await _httpClient.GetStringAsync("https://api.ipify.org");
//                return response.Trim();
//            }
//            catch
//            {
//                // Fallback service
//                try
//                {
//                    var response = await _httpClient.GetStringAsync("https://icanhazip.com");
//                    return response.Trim();
//                }
//                catch
//                {
//                    return "Unable to determine public IP";
//                }
//            }
//        }

//        public IPAddress[] GetHostAddresses(string hostName)
//        {
//            return Dns.GetHostAddresses(hostName);
//        }

//        public string GetHostName()
//        {
//            return Dns.GetHostName();
//        }

//        public async Task<IPHostEntry> GetHostEntryAsync(string hostNameOrAddress)
//        {
//            return await Dns.GetHostEntryAsync(hostNameOrAddress);
//        }

//        public bool IsValidHostName(string hostName)
//        {
//            try
//            {
//                Dns.GetHostEntry(hostName);
//                return true;
//            }
//            catch
//            {
//                return false;
//            }
//        }
//    }
//}
