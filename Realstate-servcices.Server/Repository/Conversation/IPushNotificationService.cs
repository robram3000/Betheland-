namespace Realstate_servcices.Server.Repository.Conversation
{

    public interface IPushNotificationService
    {
        Task<bool> SendPushAsync(string deviceToken, string title, string message, string? data = null);
        Task<bool> SendPushToMultipleAsync(List<string> deviceTokens, string title, string message, string? data = null);
    }
}
