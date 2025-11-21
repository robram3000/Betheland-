namespace Realstate_servcices.Server.Dto.Device
{
    public class HardwareInfoDto
    {
        public string Processor { get; set; }
        public string Memory { get; set; }
        public string Graphics { get; set; }
        public string Storage { get; set; }
        public string NetworkAdapters { get; set; }
        public string Motherboard { get; set; }
        public double CpuUsage { get; set; }
        public ulong AvailableMemory { get; set; }
    }
}
