// OTPService.cs - Fixed version
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
                // Existing validation code remains the same...
                if (!IsValidEmail(request.Email))
                {
                    return new OTPResponse
                    {
                        Success = false,
                        Message = "Invalid email format"
                    };
                }

                var recentAttempts = await _otpRepository.GetOTPCountLastHourAsync(request.Email);
                if (recentAttempts >= _maxOTPAttemptsPerHour)
                {
                    return new OTPResponse
                    {
                        Success = false,
                        Message = "Too many OTP requests. Please try again later."
                    };
                }

                await _otpRepository.InvalidatePreviousOTPsAsync(request.Email);

                var otpCode = GenerateOTP(_otpLength);
                var expirationTime = DateTime.UtcNow.AddMinutes(_otpExpiryMinutes);

                var otpRecord = new OTPRecord
                {
                    Email = request.Email.ToLower(),
                    OTPCode = otpCode,
                    ExpirationTime = expirationTime,
                    IsUsed = false,
                    CreatedAt = DateTime.UtcNow
                };

                var saveResult = await _otpRepository.SaveOTPRecordAsync(otpRecord);
                if (!saveResult)
                {
                    return new OTPResponse
                    {
                        Success = false,
                        Message = "Failed to generate OTP. Please try again."
                    };
                }

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
                Console.WriteLine($"Verifying OTP for: {request.Email}, Code: {request.OTPCode}, AllowReuse: {allowReuseForRegistration}");

                // FIX: Use case-insensitive search and ensure we're getting the latest record
                var otpRecord = await _otpRepository.GetLatestValidOTPRecordAsync(request.Email.ToLower());

                if (otpRecord == null)
                {
                    Console.WriteLine($"No valid OTP record found for: {request.Email}");
                    return new OTPResponse
                    {
                        Success = false,
                        Message = "OTP not found or expired. Please request a new OTP."
                    };
                }

                Console.WriteLine($"Found OTP record: Code={otpRecord.OTPCode}, Expires={otpRecord.ExpirationTime}, Used={otpRecord.IsUsed}, Email={otpRecord.Email}");

                // Check if OTP is already used (only for non-reuse cases)
                if (otpRecord.IsUsed && !allowReuseForRegistration)
                {
                    return new OTPResponse
                    {
                        Success = false,
                        Message = "OTP has already been used. Please request a new OTP."
                    };
                }

                // Check if OTP is expired
                if (DateTime.UtcNow > otpRecord.ExpirationTime)
                {
                    // Mark as used when expired
                    otpRecord.IsUsed = true;
                    await _otpRepository.UpdateOTPRecordAsync(otpRecord);

                    Console.WriteLine($"OTP expired for: {request.Email}");
                    return new OTPResponse
                    {
                        Success = false,
                        Message = "OTP has expired. Please request a new OTP."
                    };
                }

                // Verify OTP code (case-sensitive comparison)
                if (otpRecord.OTPCode != request.OTPCode.Trim())
                {
                    Console.WriteLine($"OTP code mismatch for: {request.Email}. Expected: {otpRecord.OTPCode}, Received: {request.OTPCode}");
                    return new OTPResponse
                    {
                        Success = false,
                        Message = "Invalid OTP code. Please check and try again."
                    };
                }

                // FIX: For password reset flow (allowReuseForRegistration=true), we don't mark as used immediately
                // This allows the same OTP to be used for both verification and password reset
                if (!allowReuseForRegistration)
                {
                    // For registration flow, mark as used immediately
                    otpRecord.IsUsed = true;
                    await _otpRepository.UpdateOTPRecordAsync(otpRecord);
                    Console.WriteLine($"OTP marked as used for: {request.Email}");
                }
                else
                {
                    Console.WriteLine($"OTP verified but not marked as used (password reset flow) for: {request.Email}");
                }

                return new OTPResponse
                {
                    Success = true,
                    Message = "OTP verified successfully"
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception in VerifyOTPAsync for {request.Email}: {ex.Message}");
                return new OTPResponse
                {
                    Success = false,
                    Message = $"OTP verification failed: {ex.Message}"
                };
            }
        }

        // Add a specific method for password reset OTP verification
        public async Task<OTPResponse> VerifyPasswordResetOTPAsync(VerifyOTPRequest request)
        {
            // Use allowReuseForRegistration = true for password reset
            return await VerifyOTPAsync(request, allowReuseForRegistration: true);
        }

        // Add method to mark OTP as used (for password reset completion)
        public async Task<bool> MarkOTPAsUsedAsync(string email, string otpCode)
        {
            try
            {
                var otpRecord = await _otpRepository.GetLatestValidOTPRecordAsync(email.ToLower());

                if (otpRecord != null && otpRecord.OTPCode == otpCode && !otpRecord.IsUsed)
                {
                    otpRecord.IsUsed = true;
                    return await _otpRepository.UpdateOTPRecordAsync(otpRecord);
                }

                return false;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error marking OTP as used: {ex.Message}");
                return false;
            }
        }

        public async Task<OTPResponse> ResendOTPAsync(ResendOTPRequest request)
        {
            try
            {
                // Existing resend logic remains the same...
                if (!IsValidEmail(request.Email))
                {
                    return new OTPResponse
                    {
                        Success = false,
                        Message = "Invalid email format"
                    };
                }

                var existingOtp = await _otpRepository.GetLatestValidOTPRecordAsync(request.Email.ToLower());

                if (existingOtp != null && DateTime.UtcNow < existingOtp.ExpirationTime.AddMinutes(-5))
                {
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