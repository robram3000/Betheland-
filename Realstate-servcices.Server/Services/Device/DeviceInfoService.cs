using Realstate_servcices.Server.Dto.Device;
using Realstate_servcices.Server.Repository.DeviceInfoRepository;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Realstate_servcices.Server.Services.Device
{
    public class DeviceInfoService : IDeviceInfoService
    {
        private readonly IDeviceInfoRepository _deviceInfoRepository;

        public DeviceInfoService(IDeviceInfoRepository deviceInfoRepository)
        {
            _deviceInfoRepository = deviceInfoRepository;
        }

        public async Task<DeviceInfoDto> GetDeviceInfoAsync()
        {
            return await _deviceInfoRepository.GetDeviceInfoAsync();
        }

        public async Task<SystemInfoDto> GetSystemInfoAsync()
        {
            return await _deviceInfoRepository.GetSystemInfoAsync();
        }

        public async Task<Dictionary<string, object>> GetHardwareInfoAsync()
        {
            var hardwareInfo = await _deviceInfoRepository.GetHardwareInfoAsync();
            return new Dictionary<string, object>
            {
                ["Processor"] = hardwareInfo.Processor,
                ["Memory"] = hardwareInfo.Memory,
                ["Graphics"] = hardwareInfo.Graphics,
                ["Storage"] = hardwareInfo.Storage,
                ["NetworkAdapters"] = hardwareInfo.NetworkAdapters,
                ["Motherboard"] = hardwareInfo.Motherboard,
                ["CpuUsage"] = hardwareInfo.CpuUsage,
                ["AvailableMemory"] = hardwareInfo.AvailableMemory
            };
        }

        public async Task<Dictionary<string, object>> GetEnvironmentInfoAsync()
        {
            var environmentInfo = await _deviceInfoRepository.GetEnvironmentInfoAsync();
            return new Dictionary<string, object>
            {
                ["CurrentUser"] = environmentInfo.CurrentUser,
                ["UserDomain"] = environmentInfo.UserDomain,
                ["MachineName"] = environmentInfo.MachineName,
                ["CurrentDirectory"] = environmentInfo.CurrentDirectory,
                ["LogicalDrives"] = environmentInfo.LogicalDrives,
                ["EnvironmentVariables"] = environmentInfo.EnvironmentVariables,
                ["ProcessorCount"] = environmentInfo.ProcessorCount,
                ["WorkingSet"] = environmentInfo.WorkingSet,
                ["IsUserInteractive"] = environmentInfo.IsUserInteractive
            };
        }

        public async Task<string> GetSystemSummaryAsync()
        {
            return await _deviceInfoRepository.GetSystemSummaryAsync();
        }

        public async Task<Dictionary<string, object>> GetCompleteSystemInfoAsync()
        {
            return await _deviceInfoRepository.GetCompleteSystemInfoAsync();
        }
    }
}