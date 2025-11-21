using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Realstate_servcices.Server.Entity.AuthenticationLog
{
    public class SystemConfiguration
    {
        [Key]
        [MaxLength(100)]
        public string Key { get; set; } = string.Empty;

        [Column(TypeName = "nvarchar(max)")]
        public string Value { get; set; } = string.Empty;

        [MaxLength(50)]
        public string DataType { get; set; } = string.Empty; 

        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;

        [MaxLength(100)]
        public string Category { get; set; } = string.Empty; 

        public bool IsEncrypted { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [MaxLength(100)]
        public string UpdatedBy { get; set; } = string.Empty;
    }
}
