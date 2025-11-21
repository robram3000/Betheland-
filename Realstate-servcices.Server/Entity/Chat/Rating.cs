using Realstate_servcices.Server.Entity.member;
using Realstate_servcices.Server.Entity.Member;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Realstate_servcices.Server.Entity.Chat
{
    public class Rating
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public Guid RatingNo { get; set; } = Guid.NewGuid();

        [Required]
        public int RaterId { get; set; }

        [Required]
        public int RatedId { get; set; }

        [Required]
        [Range(1, 5)]
        public int Stars { get; set; }

        [MaxLength(1000)]
        public string? Comment { get; set; }

        [Required]
        [MaxLength(50)]
        public string RatingType { get; set; } = "agent";

        [MaxLength(50)]
        public string? PropertyId { get; set; }

        public int? ChatId { get; set; }


        public int? AgentId { get; set; }
        public int? ClientId { get; set; }

        [Required]
        public bool IsVisible { get; set; } = true;

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        [ForeignKey("RaterId")]
        public virtual BaseMember Rater { get; set; } = null!;

        [ForeignKey("RatedId")]
        public virtual BaseMember Rated { get; set; } = null!;

        [ForeignKey("AgentId")]
        public virtual Agent? Agent { get; set; }

        [ForeignKey("ClientId")]
        public virtual Client? Client { get; set; }

        [ForeignKey("ChatId")]
        public virtual Chat? Chat { get; set; }

        
    }
}