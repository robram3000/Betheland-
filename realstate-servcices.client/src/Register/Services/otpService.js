import api from './api';

export const otpService = {
    generateOTP: async (email) => {
        try {
            const response = await api.post('/OTP/generate', { email });
            return response;
        } catch (error) {
            console.error('Generate OTP API Error:', error);
            throw error;
        }
    },

    verifyOTP: async (email, otpCode) => {
        try {
            const response = await api.post('/OTP/verify', {
                email: email,
                otpCode: otpCode
            });
            return response;
        } catch (error) {
            console.error('Verify OTP API Error:', error);
            throw error;
        }
    },

    resendOTP: async (email) => {
        try {
            const response = await api.post('/OTP/resend', { email });
            return response;
        } catch (error) {
            console.error('Resend OTP API Error:', error);
            throw error;
        }
    },
};