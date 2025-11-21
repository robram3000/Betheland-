using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Realstate_servcices.Server.Entity.AuthenticationLog
{
    public class AuditTrail
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string TableName { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Action { get; set; } = string.Empty; // INSERT, UPDATE, DELETE

        [Required]
        public string PrimaryKey { get; set; } = string.Empty;

        [Column(TypeName = "nvarchar(max)")]
        public string OldValues { get; set; } = string.Empty; // JSON serialized

        [Column(TypeName = "nvarchar(max)")]
        public string NewValues { get; set; } = string.Empty; // JSON serialized

        [Required]
        public DateTime ChangeDate { get; set; } = DateTime.UtcNow;

        [MaxLength(100)]
        public string ChangedBy { get; set; } = string.Empty;

        [MaxLength(50)]
        public string IpAddress { get; set; } = string.Empty;

        [MaxLength(500)]
        public string Reason { get; set; } = string.Empty; // Reason for change
    }
}
