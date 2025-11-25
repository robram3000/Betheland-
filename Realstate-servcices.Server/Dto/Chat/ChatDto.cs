using Realstate_servcices.Server.Dto.Chat;
using Realstate_servcices.Server.Dto.Property;

public class ChatDto
{
    public int Id { get; set; }
    public Guid ChatNo { get; set; }
    public string? Name { get; set; }
    public string ChatType { get; set; } = "direct";
    public int? PropertyId { get; set; }
    public PropertyDto? Property { get; set; }
    public string? LastMessage { get; set; }
    public DateTime? LastMessageAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<ChatParticipantDto> Participants { get; set; } = new List<ChatParticipantDto>();
    public List<MessageDto> Messages { get; set; } = new List<MessageDto>();
    public int UnreadCount { get; set; }
}