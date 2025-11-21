using System.ComponentModel.DataAnnotations;

namespace Realstate_servcices.Server.Entity.AuthenticationLog
{
    public class DeviceInfo
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string DeviceId { get; set; } = string.Empty; // Unique device identifier

        [Required]
        [MaxLength(100)]
        public string DeviceName { get; set; } = string.Empty;

        [MaxLength(100)]
        public string Manufacturer { get; set; } = string.Empty;

        [MaxLength(100)]
        public string Model { get; set; } = string.Empty;

        [MaxLength(50)]
        public string DeviceType { get; set; } = string.Empty; // Desktop, Mobile, Server, etc.

        [MaxLength(100)]
        public string SerialNumber { get; set; } = string.Empty;

        [MaxLength(100)]
        public string BiosVersion { get; set; } = string.Empty;

        public DateTime? BiosReleaseDate { get; set; }

        [MaxLength(100)]
        public string SystemFamily { get; set; } = string.Empty;

        [MaxLength(50)]
        public string MacAddress { get; set; } = string.Empty;

        // Operating System Information
        [MaxLength(100)]
        public string OperatingSystem { get; set; } = string.Empty;

        [MaxLength(50)]
        public string OSVersion { get; set; } = string.Empty;

        [MaxLength(50)]
        public string SystemArchitecture { get; set; } = string.Empty;

        // Hardware Information
        [MaxLength(200)]
        public string Processor { get; set; } = string.Empty;

        [MaxLength(50)]
        public string Memory { get; set; } = string.Empty;

        [MaxLength(200)]
        public string GraphicsCard { get; set; } = string.Empty;

        [MaxLength(200)]
        public string Motherboard { get; set; } = string.Empty;

        // Network Information
        [MaxLength(50)]
        public string LocalIpAddress { get; set; } = string.Empty;

        [MaxLength(50)]
        public string PublicIpAddress { get; set; } = string.Empty;

        // Status
        public bool IsActive { get; set; } = true;

        public DateTime LastSeen { get; set; } = DateTime.UtcNow;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        public virtual ICollection<DeviceSession> Sessions { get; set; } = new List<DeviceSession>();
        public virtual ICollection<DevicePerformanceLog> PerformanceLogs { get; set; } = new List<DevicePerformanceLog>();
    }
}