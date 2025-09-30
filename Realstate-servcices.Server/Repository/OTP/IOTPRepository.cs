using Realstate_servcices.Server.Entity.OTP;


namespace Realstate_servcices.Server.Repository.OTP
{
    public interface IOTPRepository
    {
        Task<bool> SaveOTPRecordAsync(OTPRecord otpRecord);
        Task<OTPRecord> GetOTPRecordAsync(string email);
        Task<OTPRecord> GetLatestValidOTPRecordAsync(string email);
        Task<bool> UpdateOTPRecordAsync(OTPRecord otpRecord);
        Task<bool> DeleteOTPRecordAsync(string email); 
        Task<bool> InvalidatePreviousOTPsAsync(string email);
        Task<int> GetOTPCountLastHourAsync(string email);
    }
}