using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Realstate_servcices.Server.Entity.AuthenticationLog
{
    public class DevicePerformanceLog
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int DeviceInfoId { get; set; }

        public double CpuUsage { get; set; }

        public double MemoryUsage { get; set; }

        public ulong AvailableMemory { get; set; }

        public double DiskUsage { get; set; }

        public ulong AvailableDiskSpace { get; set; }

        public int NetworkUsage { get; set; } // in Mbps

        public double Temperature { get; set; } // CPU temperature if available

        public DateTime LogDate { get; set; } = DateTime.UtcNow;

        [MaxLength(20)]
        public string Status { get; set; } = string.Empty; // Normal, Warning, Critical

        // Navigation Property
        [ForeignKey("DeviceInfoId")]
        public virtual DeviceInfo DeviceInfo { get; set; } = null!;
    }
}
