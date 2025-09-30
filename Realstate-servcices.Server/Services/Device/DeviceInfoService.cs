using Realstate_servcices.Server.Dto.Device;
using Realstate_servcices.Server.Utilities.Device;

namespace Realstate_servcices.Server.Services.Device
{
    public class DeviceInfoService : IDeviceInfoService
    {
        private readonly DeviceInfoUtility _deviceInfoUtility;
        private readonly SystemInfoUtility _systemInfoUtility;
        private readonly HardwareInfoUtility _hardwareInfoUtility;
        private readonly EnvironmentUtility _environmentUtility;

        public DeviceInfoService()
        {
            _deviceInfoUtility = new DeviceInfoUtility();
            _systemInfoUtility = new SystemInfoUtility();
            _hardwareInfoUtility = new HardwareInfoUtility();
            _environmentUtility = new EnvironmentUtility();
        }

        public async Task<DeviceInfoDto> GetDeviceInfoAsync()
        {
            return await Task.Run(() => new DeviceInfoDto
            {
                DeviceName = _deviceInfoUtility.GetDeviceName(),
                Manufacturer = _deviceInfoUtility.GetManufacturer(),
                Model = _deviceInfoUtility.GetModel(),
                DeviceType = _deviceInfoUtility.GetDeviceType(),
                SerialNumber = _deviceInfoUtility.GetSerialNumber(),
                BiosVersion = _deviceInfoUtility.GetBiosVersion(),
                SystemFamily = _deviceInfoUtility.GetSystemFamily(),
                MacAddress = _deviceInfoUtility.GetMacAddress()
            });
        }

        public async Task<SystemInfoDto> GetSystemInfoAsync()
        {
            return await Task.Run(() => new SystemInfoDto
            {
                OperatingSystem = _systemInfoUtility.GetOperatingSystem(),
                OSVersion = _systemInfoUtility.GetOSVersion(),
                WindowsVersion = _systemInfoUtility.GetWindowsVersion(),
                SystemArchitecture = _systemInfoUtility.GetSystemArchitecture(),
                FrameworkVersion = _systemInfoUtility.GetFrameworkVersion(),
                SystemInstallDate = _systemInfoUtility.GetSystemInstallDate(),
                SystemUpTime = _systemInfoUtility.GetSystemUpTime(),
                SystemLocale = _systemInfoUtility.GetSystemLocale(),
                TimeZone = _systemInfoUtility.GetTimeZone(),
                Is64BitOperatingSystem = _systemInfoUtility.Is64BitOperatingSystem(),
                Is64BitProcess = _systemInfoUtility.Is64BitProcess()
            });
        }

        public async Task<Dictionary<string, object>> GetHardwareInfoAsync()
        {
            return await Task.Run(() => new Dictionary<string, object>
            {
                ["Processor"] = _hardwareInfoUtility.GetProcessorInfo(),
                ["Memory"] = _hardwareInfoUtility.GetMemoryInfo(),
                ["Graphics"] = _hardwareInfoUtility.GetGraphicsCardInfo(),
                ["Storage"] = _hardwareInfoUtility.GetStorageInfo(),
                ["NetworkAdapters"] = _hardwareInfoUtility.GetNetworkAdaptersInfo(),
                ["Motherboard"] = _hardwareInfoUtility.GetMotherboardInfo(),
                ["CpuUsage"] = _hardwareInfoUtility.GetCpuUsage(),
                ["AvailableMemory"] = _hardwareInfoUtility.GetAvailableMemory()
            });
        }

        public async Task<Dictionary<string, object>> GetEnvironmentInfoAsync()
        {
            return await Task.Run(() => new Dictionary<string, object>
            {
                ["CurrentUser"] = _environmentUtility.GetCurrentUser(),
                ["UserDomain"] = _environmentUtility.GetUserDomain(),
                ["MachineName"] = _environmentUtility.GetMachineName(),
                ["CurrentDirectory"] = _environmentUtility.GetCurrentDirectory(),
                ["LogicalDrives"] = _environmentUtility.GetLogicalDrives(),
                ["EnvironmentVariables"] = _environmentUtility.GetEnvironmentVariables(),
                ["ProcessorCount"] = _environmentUtility.GetProcessorCount(),
                ["WorkingSet"] = _environmentUtility.GetWorkingSet(),
                ["IsUserInteractive"] = _environmentUtility.IsUserInteractive()
            });
        }

        public async Task<string> GetSystemSummaryAsync()
        {
            return await Task.Run(() =>
            {
                var deviceInfo = _deviceInfoUtility;
                var systemInfo = _systemInfoUtility;

                return $@"
System Summary:
- Device: {deviceInfo.GetDeviceName()} ({deviceInfo.GetModel()})
- Manufacturer: {deviceInfo.GetManufacturer()}
- OS: {systemInfo.GetOperatingSystem()}
- Architecture: {systemInfo.GetSystemArchitecture()}
- Uptime: {systemInfo.GetSystemUpTime()}
- User: {_environmentUtility.GetCurrentUser()}@{_environmentUtility.GetUserDomain()}
";
            });
        }
    }
}
