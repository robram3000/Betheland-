using System;
using System.Linq;
using System.Management;
using System.Net.NetworkInformation;

namespace Realstate_servcices.Server.Utilities.Device
{
    public class DeviceInfoUtility
    {
        public string GetDeviceName()
        {
            return Environment.MachineName;
        }

        public string GetManufacturer()
        {
            try
            {
                using var searcher = new ManagementObjectSearcher("SELECT Manufacturer FROM Win32_ComputerSystem");
                using var collection = searcher.Get();
                foreach (ManagementObject obj in collection)
                {
                    return obj["Manufacturer"]?.ToString() ?? "Unknown";
                }
            }
            catch
            {
            
            }
            return "Unknown";
        }

        public string GetModel()
        {
            try
            {
                using var searcher = new ManagementObjectSearcher("SELECT Model FROM Win32_ComputerSystem");
                using var collection = searcher.Get();
                foreach (ManagementObject obj in collection)
                {
                    return obj["Model"]?.ToString() ?? "Unknown";
                }
            }
            catch
            {
               
            }
            return "Unknown";
        }

        public string GetDeviceType()
        {
            try
            {
                using var searcher = new ManagementObjectSearcher("SELECT PCSystemType FROM Win32_ComputerSystem");
                using var collection = searcher.Get();
                foreach (ManagementObject obj in collection)
                {
                    var systemType = obj["PCSystemType"]?.ToString();
                    return systemType switch
                    {
                        "0" => "Unspecified",
                        "1" => "Desktop",
                        "2" => "Mobile",
                        "3" => "Workstation",
                        "4" => "Enterprise Server",
                        "5" => "SOHO Server",
                        "6" => "Appliance PC",
                        "7" => "Performance Server",
                        "8" => "Maximum",
                        _ => "Unknown"
                    };
                }
            }
            catch
            {
                // Fallback if WMI is not available
            }
            return "Desktop"; // Reasonable default
        }

        public string GetSerialNumber()
        {
            try
            {
                using var searcher = new ManagementObjectSearcher("SELECT SerialNumber FROM Win32_BIOS");
                using var collection = searcher.Get();
                foreach (ManagementObject obj in collection)
                {
                    return obj["SerialNumber"]?.ToString() ?? "Unknown";
                }
            }
            catch
            {
               
            }
            return "Unknown";
        }

        public string GetBiosVersion()
        {
            try
            {
                using var searcher = new ManagementObjectSearcher("SELECT SMBIOSBIOSVersion FROM Win32_BIOS");
                using var collection = searcher.Get();
                foreach (ManagementObject obj in collection)
                {
                    return obj["SMBIOSBIOSVersion"]?.ToString() ?? "Unknown";
                }
            }
            catch
            {
             
            }
            return "Unknown";
        }

        public DateTime GetBiosReleaseDate()
        {
            try
            {
                using var searcher = new ManagementObjectSearcher("SELECT ReleaseDate FROM Win32_BIOS");
                using var collection = searcher.Get();
                foreach (ManagementObject obj in collection)
                {
                    if (obj["ReleaseDate"] != null)
                    {
                        var releaseDate = obj["ReleaseDate"].ToString();
                        if (DateTime.TryParse(releaseDate, out var date))
                            return date;
                    }
                }
            }
            catch
            {
              
            }
            return DateTime.MinValue;
        }

        public string GetMacAddress()
        {
            try
            {
                var networkInterface = NetworkInterface.GetAllNetworkInterfaces()
                    .FirstOrDefault(ni => ni.OperationalStatus == OperationalStatus.Up &&
                                         ni.NetworkInterfaceType != NetworkInterfaceType.Loopback);

                return networkInterface?.GetPhysicalAddress().ToString() ?? "Unknown";
            }
            catch
            {
                return "Unknown";
            }
        }

        public string GetSystemFamily()
        {
            try
            {
                using var searcher = new ManagementObjectSearcher("SELECT SystemFamily FROM Win32_ComputerSystem");
                using var collection = searcher.Get();
                foreach (ManagementObject obj in collection)
                {
                    return obj["SystemFamily"]?.ToString() ?? "Unknown";
                }
            }
            catch
            {
               
            }
            return "Unknown";
        }
    }
}