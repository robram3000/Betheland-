using Realstate_servcices.Server.Entity.member;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Realstate_servcices.Server.Entity.Member
{
    public class Rating
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public int AgentId { get; set; }

        [Required]
        public int ClientId { get; set; }

        [Required]
        [Range(1, 5)]
        public int Score { get; set; }

        [MaxLength(1000)]
        public string? Comment { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        [ForeignKey("AgentId")]
        public virtual Agent Agent { get; set; } = null!;

        [ForeignKey("ClientId")]
        public virtual Client Client { get; set; } = null!;
    }
}
