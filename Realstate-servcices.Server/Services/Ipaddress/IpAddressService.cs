//using Realstate_servcices.Server.Utilities.Network;

//namespace Realstate_servcices.Server.Services.Ipaddress
//{
//    public class IpAddressService : IIpAddressService
//    {
//        private readonly IpAddressUtility _ipAddressUtility;
//        private readonly NetworkInterfaceUtility _networkInterfaceUtility;
//        private readonly DnsUtility _dnsUtility;

//        public IpAddressService()
//        {
//            _ipAddressUtility = new IpAddressUtility();
//            _networkInterfaceUtility = new NetworkInterfaceUtility();
//            _dnsUtility = new DnsUtility();
//        }

//        public async Task<IpAddressInfoDto> GetIpAddressInfoAsync(string ipAddress)
//        {
//            if (!await ValidateIpAddressAsync(ipAddress))
//                throw new ArgumentException("Invalid IP address format");

//            return new IpAddressInfoDto
//            {
//                IpAddress = ipAddress,
//                IsPrivate = _ipAddressUtility.IsPrivateAddress(ipAddress),
//                AddressFamily = _ipAddressUtility.GetAddressFamily(ipAddress),
//                IsLoopback = _ipAddressUtility.IsLoopbackAddress(ipAddress)
//            };
//        }

//        public async Task<bool> ValidateIpAddressAsync(string ipAddress)
//        {
//            return await Task.Run(() => _ipAddressUtility.IsValidIpAddress(ipAddress));
//        }

//        public async Task<List<string>> GetLocalIpAddressesAsync()
//        {
//            return await Task.Run(() => _networkInterfaceUtility.GetAllLocalIpAddresses());
//        }

//        public async Task<string> GetPublicIpAddressAsync()
//        {
//            return await _dnsUtility.GetPublicIpAddressAsync();
//        }

//        public async Task<bool> IsPrivateIpAddressAsync(string ipAddress)
//        {
//            return await Task.Run(() => _ipAddressUtility.IsPrivateAddress(ipAddress));
//        }
//    }
//}
