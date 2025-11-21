namespace Realstate_servcices.Server.Dto.Device
{
    public class EnvironmentInfoDto
    {
        public string CurrentUser { get; set; }
        public string UserDomain { get; set; }
        public string MachineName { get; set; }
        public string CurrentDirectory { get; set; }
        public string[] LogicalDrives { get; set; }
        public Dictionary<string, string> EnvironmentVariables { get; set; }
        public string ProcessorCount { get; set; }
        public string WorkingSet { get; set; }
        public bool IsUserInteractive { get; set; }
    }
}
