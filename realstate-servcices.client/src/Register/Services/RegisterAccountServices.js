import { clientService } from './clientService';
import { otpService } from './otpService';

class RegisterAccountServices {

    // Step 1: Generate OTP for email verification
    async generateOTP(email) {
        try {
            const response = await otpService.generateOTP(email);

            // Handle different response structures
            if (response.success !== undefined) {
                return {
                    success: response.success,
                    message: response.message,
                    data: response
                };
            } else {
                // Fallback for different response structure
                return {
                    success: true,
                    message: 'OTP sent successfully',
                    data: response
                };
            }
        } catch (error) {
            console.error('Generate OTP Error:', error);

            // Extract meaningful error message
            const errorMessage = error.message ||
                error.response?.data?.message ||
                'Failed to generate OTP. Please try again.';

            return {
                success: false,
                message: errorMessage,
                error: error
            };
        }
    }

    // Step 2: Verify OTP
    async verifyOTP(email, otpCode) {
        try {
            const response = await otpService.verifyOTP(email, otpCode);

            // Handle different response structures
            if (response.success !== undefined) {
                return {
                    success: response.success,
                    message: response.message,
                    data: response
                };
            } else {
                // Fallback for different response structure
                return {
                    success: true,
                    message: 'OTP verified successfully',
                    data: response
                };
            }
        } catch (error) {
            console.error('Verify OTP Error:', error);

            // Extract meaningful error message
            const errorMessage = error.message ||
                error.response?.data?.message ||
                'OTP verification failed. Please try again.';

            return {
                success: false,
                message: errorMessage,
                error: error
            };
        }
    }

    // Step 3: Resend OTP
    async resendOTP(email) {
        try {
            const response = await otpService.resendOTP(email);

            // Handle different response structures
            if (response.success !== undefined) {
                return {
                    success: response.success,
                    message: response.message,
                    data: response
                };
            } else {
                // Fallback for different response structure
                return {
                    success: true,
                    message: 'OTP resent successfully',
                    data: response
                };
            }
        } catch (error) {
            console.error('Resend OTP Error:', error);

            // Extract meaningful error message
            const errorMessage = error.message ||
                error.response?.data?.message ||
                'Failed to resend OTP. Please try again.';

            return {
                success: false,
                message: errorMessage,
                error: error
            };
        }
    }

    // Step 4: Complete client registration
    async registerClient(clientData) {
        try {
            const response = await clientService.register(clientData);

            return {
                success: response.success || true, // Adjust based on your API response
                message: response.message || 'Registration successful',
                userId: response.userId,
                data: response
            };
        } catch (error) {
            console.error('Register Client Error:', error);

            const errorMessage = error.message ||
                error.response?.data?.message ||
                'Registration failed. Please try again.';

            return {
                success: false,
                message: errorMessage,
                error: error
            };
        }
    }
}

export default new RegisterAccountServices();