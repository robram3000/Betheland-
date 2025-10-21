using Realstate_servcices.Server.Entity.Member;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace Realstate_servcices.Server.Entity.Chat
{
    public class MessageReaction
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public int MessageId { get; set; }

        [Required]
        public int BaseMemberId { get; set; }

        [Required]
        [MaxLength(10)]
        public string Emoji { get; set; } = string.Empty;

        [Required]
        public DateTime ReactedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("MessageId")]
        public virtual Message Message { get; set; } = null!;

        [ForeignKey("BaseMemberId")]
        public virtual BaseMember BaseMember { get; set; } = null!;
    }
}
