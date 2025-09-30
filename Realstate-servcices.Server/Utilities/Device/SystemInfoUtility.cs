using System;
using System.Linq;
using System.Management;
using System.Runtime.InteropServices;

namespace Realstate_servcices.Server.Utilities.Device
{
    public class SystemInfoUtility
    {
        public string GetOperatingSystem()
        {
            return RuntimeInformation.OSDescription;
        }

        public string GetOSVersion()
        {
            return Environment.OSVersion.VersionString;
        }

        public string GetSystemDirectory()
        {
            return Environment.SystemDirectory;
        }

        public string GetWindowsVersion()
        {
            try
            {
                using var searcher = new ManagementObjectSearcher("SELECT Caption, Version FROM Win32_OperatingSystem");
                using var collection = searcher.Get();
                foreach (ManagementObject obj in collection)
                {
                    return $"{obj["Caption"]} ({obj["Version"]})";
                }
            }
            catch
            {
                // Fallback if WMI is not available
            }
            return "Unknown Windows Version";
        }

        public DateTime GetSystemInstallDate()
        {
            try
            {
                using var searcher = new ManagementObjectSearcher("SELECT InstallDate FROM Win32_OperatingSystem");
                using var collection = searcher.Get();
                foreach (ManagementObject obj in collection)
                {
                    if (obj["InstallDate"] != null)
                    {
                        var installDate = ManagementDateTimeConverter.ToDateTime(obj["InstallDate"].ToString());
                        return installDate;
                    }
                }
            }
            catch
            {
                // Fallback if WMI is not available
            }
            return DateTime.MinValue;
        }

        public string GetSystemArchitecture()
        {
            return RuntimeInformation.OSArchitecture.ToString();
        }

        public string GetProcessArchitecture()
        {
            return RuntimeInformation.ProcessArchitecture.ToString();
        }

        public string GetFrameworkVersion()
        {
            return RuntimeInformation.FrameworkDescription;
        }

        public string GetClrVersion()
        {
            return Environment.Version.ToString();
        }

        public string GetSystemUpTime()
        {
            try
            {
                using var searcher = new ManagementObjectSearcher("SELECT LastBootUpTime FROM Win32_OperatingSystem");
                using var collection = searcher.Get();
                foreach (ManagementObject obj in collection)
                {
                    if (obj["LastBootUpTime"] != null)
                    {
                        var bootTime = ManagementDateTimeConverter.ToDateTime(obj["LastBootUpTime"].ToString());
                        var uptime = DateTime.Now - bootTime;
                        return $"{uptime.Days}d {uptime.Hours}h {uptime.Minutes}m";
                    }
                }
            }
            catch
            {
                // Fallback if WMI is not available
            }
            return "Unknown";
        }

        public string GetSystemLocale()
        {
            return System.Globalization.CultureInfo.CurrentCulture.Name;
        }

        public string GetTimeZone()
        {
            return TimeZoneInfo.Local.DisplayName;
        }

        public bool Is64BitOperatingSystem()
        {
            return Environment.Is64BitOperatingSystem;
        }

        public bool Is64BitProcess()
        {
            return Environment.Is64BitProcess;
        }

        public string GetSystemManufacturer()
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
                // Fallback if WMI is not available
            }
            return "Unknown";
        }
    }
}