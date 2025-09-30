// OTPService.cs - Updated without AttemptCount
using Realstate_servcices.Server.Dto.OTP;
using Realstate_servcices.Server.Entity.OTP;
using Realstate_servcices.Server.Repository.OTP;
using Realstate_servcices.Server.Services.SMTP.interfaces;

namespace Realstate_servcices.Server.Services.SMTP.rollout
{
    public class OTPService : IOTPService
    {
        private readonly IOTPRepository _otpRepository;
        private readonly IEmailService _emailService;
        private readonly Random _random;

        // Configuration constants
        private readonly int _otpExpiryMinutes = 10;
        private readonly int _resendCooldownSeconds = 30;
        private readonly int _maxOTPAttemptsPerHour = 5;
        private readonly int _otpLength = 6;

        public OTPService(IOTPRepository otpRepository, IEmailService emailService)
        {
            _otpRepository = otpRepository;
            _emailService = emailService;
            _random = new Random();
        }

        public async Task<OTPResponse> GenerateAndSendOTPAsync(GenerateOTPRequest request)
        {
            try
            {
                // Validate email format
                if (!IsValidEmail(request.Email))
                {
                    return new OTPResponse
                    {
                        Success = false,
                        Message = "Invalid email format"
                    };
                }

                // Check OTP generation limits
                var recentAttempts = await _otpRepository.GetOTPCountLastHourAsync(request.Email);
                if (recentAttempts >= _maxOTPAttemptsPerHour)
                {
                    return new OTPResponse
                    {
                        Success = false,
                        Message = "Too many OTP requests. Please try again later."
                    };
                }

                // Invalidate previous OTPs for this email
                await _otpRepository.InvalidatePreviousOTPsAsync(request.Email);

                // Generate 6-digit OTP
                var otpCode = GenerateOTP(_otpLength);
                var expirationTime = DateTime.UtcNow.AddMinutes(_otpExpiryMinutes);

                // Create OTP record
                var otpRecord = new OTPRecord
                {
                    Email = request.Email.ToLower(),
                    OTPCode = otpCode,
                    ExpirationTime = expirationTime,
                    IsUsed = false,
                    CreatedAt = DateTime.UtcNow
                    // Removed AttemptCount
                };

                // Save to database
                var saveResult = await _otpRepository.SaveOTPRecordAsync(otpRecord);
                if (!saveResult)
                {
                    return new OTPResponse
                    {
                        Success = false,
                        Message = "Failed to generate OTP. Please try again."
                    };
                }

                // Send OTP via email
                var emailSent = await SendOTPEmailAsync(request.Email, otpCode);

                if (!emailSent)
                {
                    return new OTPResponse
                    {
                        Success = false,
                        Message = "Failed to send OTP email. Please try again."
                    };
                }

                return new OTPResponse
                {
                    Success = true,
                    Message = "OTP sent successfully",
                    ExpiresAt = expirationTime
                };
            }
            catch (Exception ex)
            {
                return new OTPResponse
                {
                    Success = false,
                    Message = $"Failed to send OTP: {ex.Message}"
                };
            }
        }

        public async Task<OTPResponse> VerifyOTPAsync(VerifyOTPRequest request, bool allowReuseForRegistration = false)
        {
            try
            {
                // Get the latest valid OTP record
                var otpRecord = await _otpRepository.GetLatestValidOTPRecordAsync(request.Email.ToLower());

                if (otpRecord == null)
                {
                    return new OTPResponse
                    {
                        Success = false,
                        Message = "OTP not found or expired. Please request a new OTP."
                    };
                }

                // Check if OTP is expired
                if (DateTime.UtcNow > otpRecord.ExpirationTime)
                {
                    // Mark as used
                    otpRecord.IsUsed = true;
                    await _otpRepository.UpdateOTPRecordAsync(otpRecord);

                    return new OTPResponse
                    {
                        Success = false,
                        Message = "OTP has expired. Please request a new OTP."
                    };
                }

                // Check if OTP matches
                if (otpRecord.OTPCode != request.OTPCode)
                {
                    return new OTPResponse
                    {
                        Success = false,
                        Message = "Invalid OTP code. Please check and try again."
                    };
                }

                // For registration flow, don't mark as used immediately if allowReuseForRegistration is true
                if (!allowReuseForRegistration)
                {
                    // OTP is valid - mark as used
                    otpRecord.IsUsed = true;
                    await _otpRepository.UpdateOTPRecordAsync(otpRecord);
                }

                return new OTPResponse
                {
                    Success = true,
                    Message = "OTP verified successfully"
                };
            }
            catch (Exception ex)
            {
                return new OTPResponse
                {
                    Success = false,
                    Message = $"OTP verification failed: {ex.Message}"
                };
            }
        }

        public async Task<OTPResponse> ResendOTPAsync(ResendOTPRequest request)
        {
            try
            {
                // Validate email format
                if (!IsValidEmail(request.Email))
                {
                    return new OTPResponse
                    {
                        Success = false,
                        Message = "Invalid email format"
                    };
                }

                // Check if there's an existing valid OTP that can be reused
                var existingOtp = await _otpRepository.GetLatestValidOTPRecordAsync(request.Email.ToLower());

                if (existingOtp != null && DateTime.UtcNow < existingOtp.ExpirationTime.AddMinutes(-5))
                {
                    // Resend the same OTP if it's still in the first 5 minutes
                    var emailSent = await SendOTPEmailAsync(request.Email, existingOtp.OTPCode);

                    if (emailSent)
                    {
                        return new OTPResponse
                        {
                            Success = true,
                            Message = "OTP resent successfully",
                            ExpiresAt = existingOtp.ExpirationTime
                        };
                    }
                }

                // Generate new OTP
                var generateRequest = new GenerateOTPRequest { Email = request.Email };
                return await GenerateAndSendOTPAsync(generateRequest);
            }
            catch (Exception ex)
            {
                return new OTPResponse
                {
                    Success = false,
                    Message = $"Failed to resend OTP: {ex.Message}"
                };
            }
        }

        private string GenerateOTP(int length)
        {
            var minValue = (int)Math.Pow(10, length - 1);
            var maxValue = (int)Math.Pow(10, length) - 1;
            return _random.Next(minValue, maxValue).ToString($"D{length}");
        }

        private bool IsValidEmail(string email)
        {
            try
            {
                var addr = new System.Net.Mail.MailAddress(email);
                return addr.Address == email;
            }
            catch
            {
                return false;
            }
        }

        private async Task<bool> SendOTPEmailAsync(string email, string otpCode)
        {
            var subject = "Your Verification Code - RealState Services";
            var body = GenerateEmailTemplate(otpCode);

            return await _emailService.SendEmailAsync(email, subject, body, true);
        }

        private string GenerateEmailTemplate(string otpCode)
        {
            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{ 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }}
        .header {{ 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }}
        .content {{ 
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
        }}
        .otp-container {{
            text-align: center;
            margin: 30px 0;
        }}
        .otp-code {{ 
            font-size: 42px;
            font-weight: bold;
            color: #2563eb;
            letter-spacing: 8px;
            background: #e0e7ff;
            padding: 20px;
            border-radius: 10px;
            display: inline-block;
            margin: 20px 0;
        }}
        .expiry-note {{
            color: #6b7280;
            font-size: 14px;
            text-align: center;
            margin: 20px 0;
        }}
        .footer {{
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 12px;
        }}
        .warning {{
            background: #fef3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }}
    </style>
</head>
<body>
    <div class='header'>
        <h1>RealState Services</h1>
        <p>Your Verification Code</p>
    </div>
    
    <div class='content'>
        <h2>Hello,</h2>
        <p>Use the following verification code to complete your action:</p>
        
        <div class='otp-container'>
            <div class='otp-code'>{otpCode}</div>
        </div>
        
        <p class='expiry-note'>This code will expire in {_otpExpiryMinutes} minutes.</p>
        
        <div class='warning'>
            <strong>Security Tip:</strong> Never share this code with anyone. Our team will never ask for your verification code.
        </div>
        
        <p>If you didn't request this code, please ignore this email or contact our support team if you have concerns.</p>
    </div>
    
    <div class='footer'>
        <p>&copy; {DateTime.Now.Year} RealState Services. All rights reserved.</p>
        <p>This is an automated message, please do not reply to this email.</p>
    </div>
</body>
</html>";
        }
    }
}