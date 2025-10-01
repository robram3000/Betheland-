// OTPRepository.cs
using Microsoft.EntityFrameworkCore;
using Realstate_servcices.Server.Data;
using Realstate_servcices.Server.Entity.OTP;

namespace Realstate_servcices.Server.Repository.OTP
{
    public class OTPRepository : IOTPRepository
    {
        private readonly ApplicationDbContext _context;

        public OTPRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> SaveOTPRecordAsync(OTPRecord otpRecord)
        {
            try
            {
                _context.OTPRecords.Add(otpRecord);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
           
                Console.WriteLine($"Error saving OTP record: {ex.Message}");
                return false;
            }
        }

        public async Task<OTPRecord> GetOTPRecordAsync(string email)
        {
            try
            {
                return await _context.OTPRecords
                    .Where(o => o.Email == email)
                    .OrderByDescending(o => o.CreatedAt)
                    .FirstOrDefaultAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting OTP record: {ex.Message}");
                return null;
            }
        }

        public async Task<OTPRecord> GetLatestValidOTPRecordAsync(string email)
        {
            try
            {
                return await _context.OTPRecords
                    .Where(o => o.Email == email &&
                               !o.IsUsed &&
                               o.ExpirationTime > DateTime.UtcNow)
                    .OrderByDescending(o => o.CreatedAt)
                    .FirstOrDefaultAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting valid OTP record: {ex.Message}");
                return null;
            }
        }

        public async Task<bool> UpdateOTPRecordAsync(OTPRecord otpRecord)
        {
            try
            {
                _context.OTPRecords.Update(otpRecord);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating OTP record: {ex.Message}");
                return false;
            }
        }

        public async Task<bool> DeleteOTPRecordAsync(string email)
        {
            try
            {
                var otpRecords = await _context.OTPRecords
                    .Where(o => o.Email == email)
                    .ToListAsync();

                if (otpRecords.Any())
                {
                    _context.OTPRecords.RemoveRange(otpRecords);
                    await _context.SaveChangesAsync();
                }
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting OTP records: {ex.Message}");
                return false;
            }
        }

        public async Task<bool> InvalidatePreviousOTPsAsync(string email)
        {
            try
            {
                var previousOtps = await _context.OTPRecords
                    .Where(o => o.Email == email && !o.IsUsed && o.ExpirationTime > DateTime.UtcNow)
                    .ToListAsync();

                foreach (var otp in previousOtps)
                {
                    otp.IsUsed = true;
                }

                if (previousOtps.Any())
                {
                    await _context.SaveChangesAsync();
                }
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error invalidating previous OTPs: {ex.Message}");
                return false;
            }
        }

        public async Task<int> GetOTPCountLastHourAsync(string email)
        {
            try
            {
                var oneHourAgo = DateTime.UtcNow.AddHours(-1);
                return await _context.OTPRecords
                    .Where(o => o.Email == email && o.CreatedAt >= oneHourAgo)
                    .CountAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting OTP count: {ex.Message}");
                return 0;
            }
        }
    }
}