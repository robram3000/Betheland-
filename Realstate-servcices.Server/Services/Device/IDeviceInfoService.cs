using Realstate_servcices.Server.Dto.Device;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Realstate_servcices.Server.Services.Device
{
    public interface IDeviceInfoService
    {
        Task<DeviceInfoDto> GetDeviceInfoAsync();
        Task<SystemInfoDto> GetSystemInfoAsync();
        Task<Dictionary<string, object>> GetHardwareInfoAsync();
        Task<Dictionary<string, object>> GetEnvironmentInfoAsync();
        Task<string> GetSystemSummaryAsync();
    }
}
