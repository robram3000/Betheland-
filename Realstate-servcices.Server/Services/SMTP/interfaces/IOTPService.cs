using Realstate_servcices.Server.Dto.OTP;

namespace Realstate_servcices.Server.Services.SMTP.interfaces
{
    public interface IOTPService
    {
        Task<OTPResponse> GenerateAndSendOTPAsync(GenerateOTPRequest request);
        Task<OTPResponse> VerifyOTPAsync(VerifyOTPRequest request , bool allowReuseForRegistration = false);
        Task<OTPResponse> ResendOTPAsync(ResendOTPRequest request); 
    }
}