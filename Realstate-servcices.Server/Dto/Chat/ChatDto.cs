namespace Realstate_servcices.Server.Dto.Chat
{
    public class ChatDto
    {
        public int Id { get; set; }
        public Guid ChatNo { get; set; }
        public string? Name { get; set; }
        public string ChatType { get; set; } = "direct";
        public string? PropertyId { get; set; }
        public string? LastMessage { get; set; }
        public DateTime? LastMessageAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public List<ChatParticipantDto> Participants { get; set; } = new();
        public List<MessageDto> Messages { get; set; } = new();


    }
}
