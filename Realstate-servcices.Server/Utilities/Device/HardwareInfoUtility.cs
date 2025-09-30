using System;
using System.Linq;
using System.Management;
using System.Text;

namespace Realstate_servcices.Server.Utilities.Device
{
    public class HardwareInfoUtility
    {
        public string GetProcessorInfo()
        {
            try
            {
                using var searcher = new ManagementObjectSearcher("SELECT Name, NumberOfCores, NumberOfLogicalProcessors FROM Win32_Processor");
                using var collection = searcher.Get();
                var sb = new StringBuilder();

                foreach (ManagementObject obj in collection)
                {
                    sb.AppendLine($"Processor: {obj["Name"]}");
                    sb.AppendLine($"Cores: {obj["NumberOfCores"]}, Logical Processors: {obj["NumberOfLogicalProcessors"]}");
                }
                return sb.ToString().Trim();
            }
            catch
            {
                return "Unknown Processor";
            }
        }

        public string GetMemoryInfo()
        {
            try
            {
                using var searcher = new ManagementObjectSearcher("SELECT TotalPhysicalMemory FROM Win32_ComputerSystem");
                using var collection = searcher.Get();
                foreach (ManagementObject obj in collection)
                {
                    if (ulong.TryParse(obj["TotalPhysicalMemory"]?.ToString(), out var totalMemory))
                    {
                        var memoryInGB = Math.Round(totalMemory / (1024.0 * 1024 * 1024), 2);
                        return $"{memoryInGB} GB";
                    }
                }
            }
            catch
            {
                // Fallback if WMI is not available
            }
            return "Unknown";
        }

        public string GetGraphicsCardInfo()
        {
            try
            {
                using var searcher = new ManagementObjectSearcher("SELECT Name, AdapterRAM FROM Win32_VideoController");
                using var collection = searcher.Get();
                var sb = new StringBuilder();

                foreach (ManagementObject obj in collection)
                {
                    if (obj["Name"] != null)
                    {
                        var vram = "Unknown";
                        if (obj["AdapterRAM"] != null && ulong.TryParse(obj["AdapterRAM"].ToString(), out var ram))
                        {
                            vram = $"{Math.Round(ram / (1024.0 * 1024 * 1024), 2)} GB";
                        }
                        sb.AppendLine($"{obj["Name"]} ({vram} VRAM)");
                    }
                }
                return sb.ToString().Trim();
            }
            catch
            {
                return "Unknown Graphics Card";
            }
        }

        public string GetStorageInfo()
        {
            try
            {
                using var searcher = new ManagementObjectSearcher("SELECT Size, Model FROM Win32_DiskDrive");
                using var collection = searcher.Get();
                var sb = new StringBuilder();

                foreach (ManagementObject obj in collection)
                {
                    if (obj["Size"] != null && ulong.TryParse(obj["Size"].ToString(), out var size))
                    {
                        var sizeInGB = Math.Round(size / (1024.0 * 1024 * 1024), 2);
                        sb.AppendLine($"{obj["Model"]} - {sizeInGB} GB");
                    }
                }
                return sb.ToString().Trim();
            }
            catch
            {
                return "Unknown Storage";
            }
        }

        public string GetNetworkAdaptersInfo()
        {
            try
            {
                using var searcher = new ManagementObjectSearcher("SELECT Name, ProductName FROM Win32_NetworkAdapter WHERE PhysicalAdapter = TRUE");
                using var collection = searcher.Get();
                var sb = new StringBuilder();

                foreach (ManagementObject obj in collection)
                {
                    sb.AppendLine($"{obj["Name"]} ({obj["ProductName"]})");
                }
                return sb.ToString().Trim();
            }
            catch
            {
                return "Unknown Network Adapters";
            }
        }

        public string GetMotherboardInfo()
        {
            try
            {
                using var searcher = new ManagementObjectSearcher("SELECT Product, Manufacturer FROM Win32_BaseBoard");
                using var collection = searcher.Get();
                foreach (ManagementObject obj in collection)
                {
                    return $"{obj["Manufacturer"]} {obj["Product"]}";
                }
            }
            catch
            {
                // Fallback if WMI is not available
            }
            return "Unknown Motherboard";
        }

        public double GetCpuUsage()
        {
            try
            {
                using var searcher = new ManagementObjectSearcher("SELECT LoadPercentage FROM Win32_Processor");
                using var collection = searcher.Get();
                foreach (ManagementObject obj in collection)
                {
                    if (ushort.TryParse(obj["LoadPercentage"]?.ToString(), out var usage))
                    {
                        return usage;
                    }
                }
            }
            catch
            {
                // Fallback if WMI is not available
            }
            return 0;
        }

        public ulong GetAvailableMemory()
        {
            try
            {
                using var searcher = new ManagementObjectSearcher("SELECT AvailablePhysicalMemory FROM Win32_OperatingSystem");
                using var collection = searcher.Get();
                foreach (ManagementObject obj in collection)
                {
                    if (ulong.TryParse(obj["AvailablePhysicalMemory"]?.ToString(), out var availableMemory))
                    {
                        return availableMemory / 1024; // Convert to MB
                    }
                }
            }
            catch
            {
                // Fallback if WMI is not available
            }
            return 0;
        }
    }
}