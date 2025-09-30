namespace Realstate_servcices.Server.Services.SMTP.interfaces
{
    public interface IEmailService
    {
        Task<bool> SendEmailAsync(string toEmail, string subject, string body);
        Task<bool> SendEmailAsync(string toEmail, string subject, string body, bool isHtml);
        Task<bool> SendEmailWithAttachmentAsync(string toEmail, string subject, string body, byte[] attachment, string attachmentName);
    }
}
