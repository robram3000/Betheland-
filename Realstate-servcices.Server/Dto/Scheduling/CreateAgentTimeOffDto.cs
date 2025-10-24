namespace Realstate_servcices.Server.Dto.Scheduling
{
    public class CreateAgentTimeOffDto
    {
        public int AgentId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        public string Type { get; set; } = "Vacation";

        public string Reason { get; set; } = string.Empty;
        public bool IsAllDay { get; set; } = true;
    }
}
