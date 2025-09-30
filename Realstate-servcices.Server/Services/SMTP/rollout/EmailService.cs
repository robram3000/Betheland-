using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using Realstate_servcices.Server.Services.SMTP.interfaces;

namespace Realstate_servcices.Server.Services.SMTP.rollout
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly string _smtpServer;
        private readonly int _smtpPort;
        private readonly string _smtpUsername;
        private readonly string _smtpPassword;
        private readonly bool _enableSsl;
        private readonly string _fromEmail;
        private readonly string _fromName;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;

            // Use the correct configuration path
            _smtpServer = _configuration["SmtpSettings:Host"] ?? throw new ArgumentNullException("SmtpSettings:Host is missing in configuration");
            _smtpPort = _configuration.GetValue<int>("SmtpSettings:Port", 587);
            _smtpUsername = _configuration["SmtpSettings:Email"] ?? throw new ArgumentNullException("SmtpSettings:Email is missing in configuration");
            _smtpPassword = _configuration["SmtpSettings:Password"] ?? throw new ArgumentNullException("SmtpSettings:Password is missing in configuration");
            _enableSsl = _configuration.GetValue<bool>("SmtpSettings:EnableSsl", true);
            _fromEmail = _configuration["SmtpSettings:FromEmail"] ?? _smtpUsername; // Fixed: Use FromEmail instead of Email
            _fromName = _configuration["SmtpSettings:FromName"] ?? "RealState Services";
        }

        public async Task<bool> SendEmailAsync(string toEmail, string subject, string body)
        {
            return await SendEmailAsync(toEmail, subject, body, false);
        }

        public async Task<bool> SendEmailAsync(string toEmail, string subject, string body, bool isHtml)
        {
            try
            {
                using (var client = new SmtpClient(_smtpServer, _smtpPort))
                {
                    client.Credentials = new NetworkCredential(_smtpUsername, _smtpPassword);
                    client.EnableSsl = _enableSsl;
                    client.Timeout = 30000;

                    using (var message = new MailMessage())
                    {
                        message.From = new MailAddress(_fromEmail, _fromName);
                        message.To.Add(toEmail);
                        message.Subject = subject;
                        message.Body = body;
                        message.IsBodyHtml = isHtml;

                        await client.SendMailAsync(message);
                    }
                }

                return true;
            }
            catch (Exception ex)
            {
                // Log the exception
                Console.WriteLine($"Error sending email: {ex.Message}");
                return false;
            }
        }

        public async Task<bool> SendEmailWithAttachmentAsync(string toEmail, string subject, string body, byte[] attachment, string attachmentName)
        {
            try
            {
                using (var client = new SmtpClient(_smtpServer, _smtpPort))
                {
                    client.Credentials = new NetworkCredential(_smtpUsername, _smtpPassword);
                    client.EnableSsl = _enableSsl;
                    client.Timeout = 30000;

                    using (var message = new MailMessage())
                    {
                        message.From = new MailAddress(_fromEmail, _fromName);
                        message.To.Add(toEmail);
                        message.Subject = subject;
                        message.Body = body;
                        message.IsBodyHtml = false;

                        // Add attachment
                        using (var stream = new MemoryStream(attachment))
                        {
                            var attachmentItem = new Attachment(stream, attachmentName);
                            message.Attachments.Add(attachmentItem);

                            await client.SendMailAsync(message);
                            attachmentItem.Dispose();
                        }
                    }
                }

                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error sending email with attachment: {ex.Message}");
                return false;
            }
        }
    }
}