namespace Realstate_servcices.Server.Dto.Scheduling
{
    public class CreateAgentTimeOffDto
    {
        public int Id { get; set; } // Add this for updates
        public int AgentId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Type { get; set; } = "Vacation";
        public string Reason { get; set; } = string.Empty;
        public bool IsAllDay { get; set; } = true;
        public bool IsApproved { get; set; } = false; // Add this
    }
}
