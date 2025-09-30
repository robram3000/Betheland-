namespace Realstate_servcices.Server.Dto.Device
{
    public class SystemInfoDto
    {
        public string OperatingSystem { get; set; }
        public string OSVersion { get; set; }
        public string WindowsVersion { get; set; }
        public string SystemArchitecture { get; set; }
        public string FrameworkVersion { get; set; }
        public DateTime SystemInstallDate { get; set; }
        public string SystemUpTime { get; set; }
        public string SystemLocale { get; set; }
        public string TimeZone { get; set; }
        public bool Is64BitOperatingSystem { get; set; }
        public bool Is64BitProcess { get; set; }
    }
}
