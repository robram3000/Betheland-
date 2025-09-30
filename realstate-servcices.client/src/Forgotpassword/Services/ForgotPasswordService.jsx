// ForgotPasswordService.jsx
import api from '../../Register/Services/api';
import { otpService } from '../../Register/Services/otpService';

export const forgotPasswordService = {
    /**
     * Step 1: Verify if email exists in database and is verified
     */
    verifyEmail: async (email) => {
        try {
            const response = await api.post('/Auth/verify-email-for-password-reset', { email });
            return {
                success: true,
                data: response.data,
                message: 'Email verified successfully'
            };
        } catch (error) {
            console.error('Email verification error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to verify email';
            throw {
                success: false,
                message: errorMessage,
                status: error.response?.status,
                data: error.response?.data
            };
        }
    },

    /**
     * Step 2: Generate OTP for password reset
     */
    generatePasswordResetOTP: async (email) => {
        try {
            const response = await otpService.generateOTP(email);
            return {
                success: true,
                data: response.data,
                message: 'OTP sent successfully'
            };
        } catch (error) {
            console.error('Generate OTP error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to send OTP';
            throw {
                success: false,
                message: errorMessage,
                status: error.response?.status,
                data: error.response?.data
            };
        }
    },

    /**
     * Step 3: Verify OTP for password reset
     */
    verifyPasswordResetOTP: async (email, otpCode) => {
        try {
            const response = await otpService.verifyOTP(email, otpCode);
            return {
                success: true,
                data: response.data,
                message: 'OTP verified successfully'
            };
        } catch (error) {
            console.error('Verify OTP error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Invalid OTP code';
            throw {
                success: false,
                message: errorMessage,
                status: error.response?.status,
                data: error.response?.data
            };
        }
    },

    /**
     * Step 4: Reset password with new password
     */
    resetPassword: async (email, newPassword, confirmPassword, otpCode) => {
        try {
            // First verify the OTP again for security
            await otpService.verifyOTP(email, otpCode);

            // If OTP is valid, proceed with password reset
            const response = await api.post('/Auth/reset-password', {
                email,
                newPassword,
                confirmPassword,
                otpCode
            });

            return {
                success: true,
                data: response.data,
                message: 'Password reset successfully'
            };
        } catch (error) {
            console.error('Password reset error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to reset password';
            throw {
                success: false,
                message: errorMessage,
                status: error.response?.status,
                data: error.response?.data
            };
        }
    },

    /**
     * Resend OTP for password reset
     */
    resendPasswordResetOTP: async (email) => {
        try {
            const response = await otpService.resendOTP(email);
            return {
                success: true,
                data: response.data,
                message: 'OTP resent successfully'
            };
        } catch (error) {
            console.error('Resend OTP error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to resend OTP';
            throw {
                success: false,
                message: errorMessage,
                status: error.response?.status,
                data: error.response?.data
            };
        }
    },

    /**
     * Complete password reset flow in one function
     */
    completePasswordReset: async (email, otpCode, newPassword, confirmPassword) => {
        try {
            // Step 1: Verify OTP
            await forgotPasswordService.verifyPasswordResetOTP(email, otpCode);

            // Step 2: Reset password
            const result = await forgotPasswordService.resetPassword(
                email,
                newPassword,
                confirmPassword,
                otpCode
            );

            return result;
        } catch (error) {
            console.error('Complete password reset error:', error);
            throw error;
        }
    }
};

export default forgotPasswordService;