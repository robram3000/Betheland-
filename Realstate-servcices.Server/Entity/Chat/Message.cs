using Realstate_servcices.Server.Entity.Member;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Realstate_servcices.Server.Entity.Chat
{
    public class Message
    {
        public int Id { get; set; }
        public Guid MessageNo { get; set; }
        public int ChatId { get; set; }
        public int SenderId { get; set; }
        public int? RecipientId { get; set; }
        public string Content { get; set; }
        public string MessageType { get; set; }
        public bool IsEdited { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime SentAt { get; set; }
        public DateTime? ReadAt { get; set; }
        public DateTime? EditedAt { get; set; }

        // Navigation properties
        public virtual Chat Chat { get; set; }
        public virtual BaseMember Sender { get; set; }
        public virtual BaseMember Recipient { get; set; }
        public virtual ICollection<MessageFile> MessageFiles { get; set; } = new List<MessageFile>();
        public virtual ICollection<MessageReaction> Reactions { get; set; } = new List<MessageReaction>();
    }
}