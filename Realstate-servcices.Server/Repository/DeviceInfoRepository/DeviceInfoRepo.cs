using Realstate_servcices.Server.Dto.Device;
using Realstate_servcices.Server.Utilities.Device;

namespace Realstate_servcices.Server.Repository.DeviceInfoRepository
{
    public interface IDeviceInfoRepository
    {
        Task<DeviceInfoDto> GetDeviceInfoAsync();
        Task<SystemInfoDto> GetSystemInfoAsync();
        Task<HardwareInfoDto> GetHardwareInfoAsync();
        Task<EnvironmentInfoDto> GetEnvironmentInfoAsync();
        Task<string> GetSystemSummaryAsync();
        Task<Dictionary<string, object>> GetCompleteSystemInfoAsync();

        public class DeviceInfoRepository : IDeviceInfoRepository
        {
            private readonly DeviceInfoUtility _deviceInfoUtility;
            private readonly SystemInfoUtility _systemInfoUtility;
            private readonly HardwareInfoUtility _hardwareInfoUtility;
            private readonly EnvironmentUtility _environmentUtility;

            public DeviceInfoRepository()
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
                    BiosReleaseDate = _deviceInfoUtility.GetBiosReleaseDate(),
                    MacAddress = _deviceInfoUtility.GetMacAddress(),
                    SystemFamily = _deviceInfoUtility.GetSystemFamily()
                });
            }

            public async Task<SystemInfoDto> GetSystemInfoAsync()
            {
                return await Task.Run(() => new SystemInfoDto
                {
                    OperatingSystem = _systemInfoUtility.GetOperatingSystem(),
                    OSVersion = _systemInfoUtility.GetOSVersion(),
                    SystemDirectory = _systemInfoUtility.GetSystemDirectory(),
                    WindowsVersion = _systemInfoUtility.GetWindowsVersion(),
                    SystemInstallDate = _systemInfoUtility.GetSystemInstallDate(),
                    SystemArchitecture = _systemInfoUtility.GetSystemArchitecture(),
                    ProcessArchitecture = _systemInfoUtility.GetProcessArchitecture(),
                    FrameworkVersion = _systemInfoUtility.GetFrameworkVersion(),
                    ClrVersion = _systemInfoUtility.GetClrVersion(),
                    SystemUpTime = _systemInfoUtility.GetSystemUpTime(),
                    SystemLocale = _systemInfoUtility.GetSystemLocale(),
                    TimeZone = _systemInfoUtility.GetTimeZone(),
                    Is64BitOperatingSystem = _systemInfoUtility.Is64BitOperatingSystem(),
                    Is64BitProcess = _systemInfoUtility.Is64BitProcess(),
                    SystemManufacturer = _systemInfoUtility.GetSystemManufacturer()
                });
            }

            public async Task<HardwareInfoDto> GetHardwareInfoAsync()
            {
                return await Task.Run(() => new HardwareInfoDto
                {
                    Processor = _hardwareInfoUtility.GetProcessorInfo(),
                    Memory = _hardwareInfoUtility.GetMemoryInfo(),
                    Graphics = _hardwareInfoUtility.GetGraphicsCardInfo(),
                    Storage = _hardwareInfoUtility.GetStorageInfo(),
                    NetworkAdapters = _hardwareInfoUtility.GetNetworkAdaptersInfo(),
                    Motherboard = _hardwareInfoUtility.GetMotherboardInfo(),
                    CpuUsage = _hardwareInfoUtility.GetCpuUsage(),
                    AvailableMemory = _hardwareInfoUtility.GetAvailableMemory()
                });
            }

            public async Task<EnvironmentInfoDto> GetEnvironmentInfoAsync()
            {
                return await Task.Run(() => new EnvironmentInfoDto
                {
                    CurrentUser = _environmentUtility.GetCurrentUser(),
                    UserDomain = _environmentUtility.GetUserDomain(),
                    MachineName = _environmentUtility.GetMachineName(),
                    CurrentDirectory = _environmentUtility.GetCurrentDirectory(),
                    LogicalDrives = System.Environment.GetLogicalDrives(),
                    EnvironmentVariables = _environmentUtility.GetEnvironmentVariables(),
                    ProcessorCount = _environmentUtility.GetProcessorCount(),
                    WorkingSet = _environmentUtility.GetWorkingSet(),
                    IsUserInteractive = _environmentUtility.IsUserInteractive()
                });
            }

            public async Task<string> GetSystemSummaryAsync()
            {
                return await Task.Run(() =>
                {
                    var deviceInfo = GetDeviceInfoAsync().GetAwaiter().GetResult();
                    var systemInfo = GetSystemInfoAsync().GetAwaiter().GetResult();
                    var hardwareInfo = GetHardwareInfoAsync().GetAwaiter().GetResult();

                    return $"System Summary:\n" +
                           $"Device: {deviceInfo.DeviceName} ({deviceInfo.Model})\n" +
                           $"OS: {systemInfo.OperatingSystem}\n" +
                           $"Processor: {hardwareInfo.Processor.Split('\n')[0]}\n" +
                           $"Memory: {hardwareInfo.Memory}\n" +
                           $"Architecture: {systemInfo.SystemArchitecture}";
                });
            }

            public async Task<Dictionary<string, object>> GetCompleteSystemInfoAsync()
            {
                return await Task.Run(async () =>
                {
                    var deviceInfo = await GetDeviceInfoAsync();
                    var systemInfo = await GetSystemInfoAsync();
                    var hardwareInfo = await GetHardwareInfoAsync();
                    var environmentInfo = await GetEnvironmentInfoAsync();

                    return new Dictionary<string, object>
                    {
                        ["DeviceInfo"] = deviceInfo,
                        ["SystemInfo"] = systemInfo,
                        ["HardwareInfo"] = hardwareInfo,
                        ["EnvironmentInfo"] = environmentInfo
                    };
                });
            }
        }
    }
    }
