using Realstate_servcices.Server.Entity.Member;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Realstate_servcices.Server.Entity.Chat
{
    public class MessageTemplate
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public Guid TemplateNo { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(255)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "text")]
        public string Content { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string TemplateType { get; set; } = "general"; // 'property_response', 'greeting', 'follow_up', 'scheduling'

        [Required]
        [MaxLength(20)]
        public string RoleRestriction { get; set; } = "all"; 

        [Required]
        public bool IsActive { get; set; } = true;

        [Required]
        [ForeignKey("BaseMember")]
        public int CreatedBy { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual BaseMember? Creator { get; set; }
    }
}
