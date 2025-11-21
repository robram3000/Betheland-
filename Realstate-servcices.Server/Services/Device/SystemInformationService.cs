using Realstate_servcices.Server.Dto.Device;
using Realstate_servcices.Server.Repository.DeviceInfoRepository;
using Realstate_servcices.Server.Services.Ipaddress;

namespace Realstate_servcices.Server.Services.Device
{
    public interface ISystemInformationService
    {
        Task<Dictionary<string, object>> GetAllSystemInformationAsync();
        Task<DeviceInfoDto> GetDeviceInfoAsync();
        Task<SystemInfoDto> GetSystemInfoAsync();
        Task<HardwareInfoDto> GetHardwareInfoAsync();
        Task<EnvironmentInfoDto> GetEnvironmentInfoAsync();
        Task<Dictionary<string, object>> GetNetworkInfoAsync();
        Task<string> GetSystemSummaryAsync();
    }
    public class SystemInformationService : ISystemInformationService
    {
        private readonly IDeviceInfoRepository _deviceInfoRepository;
        private readonly IIPAddressService _ipAddressService;

        public SystemInformationService(
            IDeviceInfoRepository deviceInfoRepository,
            IIPAddressService ipAddressService)
        {
            _deviceInfoRepository = deviceInfoRepository;
            _ipAddressService = ipAddressService;
        }

        public async Task<Dictionary<string, object>> GetAllSystemInformationAsync()
        {
            var deviceInfo = await _deviceInfoRepository.GetDeviceInfoAsync();
            var systemInfo = await _deviceInfoRepository.GetSystemInfoAsync();
            var hardwareInfo = await _deviceInfoRepository.GetHardwareInfoAsync();
            var environmentInfo = await _deviceInfoRepository.GetEnvironmentInfoAsync();
            var networkInfo = await _ipAddressService.GetNetworkInfoAsync();

            return new Dictionary<string, object>
            {
                ["DeviceInfo"] = deviceInfo,
                ["SystemInfo"] = systemInfo,
                ["HardwareInfo"] = hardwareInfo,
                ["EnvironmentInfo"] = environmentInfo,
                ["NetworkInfo"] = networkInfo,
                ["Timestamp"] = DateTime.UtcNow
            };
        }

        public async Task<DeviceInfoDto> GetDeviceInfoAsync()
        {
            return await _deviceInfoRepository.GetDeviceInfoAsync();
        }

        public async Task<SystemInfoDto> GetSystemInfoAsync()
        {
            return await _deviceInfoRepository.GetSystemInfoAsync();
        }

        public async Task<HardwareInfoDto> GetHardwareInfoAsync()
        {
            return await _deviceInfoRepository.GetHardwareInfoAsync();
        }

        public async Task<EnvironmentInfoDto> GetEnvironmentInfoAsync()
        {
            return await _deviceInfoRepository.GetEnvironmentInfoAsync();
        }

        public async Task<Dictionary<string, object>> GetNetworkInfoAsync()
        {
            return await _ipAddressService.GetNetworkInfoAsync();
        }

        public async Task<string> GetSystemSummaryAsync()
        {
            return await _deviceInfoRepository.GetSystemSummaryAsync();
        }
    }
}
