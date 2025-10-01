// Services/LoginAuth.jsx
import api from './Api';

class AuthService {
    // Login user
    async login(usernameOrEmail, password) {
        try {
            const response = await api.post('/Login/login', {
                usernameOrEmail,
                password
            });

            // Check if response has success flag and accessToken
            if (response && response.success && response.accessToken) {
                // Store tokens
                localStorage.setItem('authToken', response.accessToken);
                localStorage.setItem('refreshToken', response.refreshToken);
                localStorage.setItem('userData', JSON.stringify({
                    userId: response.userId,
                    email: response.email,
                    userType: response.userType
                }));

                return {
                    success: true,
                    data: response,
                    message: response.message || 'Login successful'
                };
            }

            // If response has success: false
            if (response && response.success === false) {
                return {
                    success: false,
                    message: response.message || 'Login failed'
                };
            }

            return {
                success: false,
                message: 'Login failed: Invalid response from server'
            };

        } catch (error) {
            console.error('Login error:', error);

            // Handle axios error response structure
            const errorMessage = error?.response?.data?.message ||
                error?.message ||
                'Login failed. Please try again.';

            return {
                success: false,
                message: errorMessage
            };
        }
    }

    // Logout user
    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userData');
        // Optional: Call backend logout endpoint if needed
        // await api.post('/Login/logout');
    }

    // Check if user is authenticated
    isAuthenticated() {
        const token = localStorage.getItem('authToken');
        if (!token) return false;

        // Check token expiration
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const isExpired = payload.exp * 1000 < Date.now();
            return !isExpired;
        } catch {
            return false;
        }
    }

    // Get current user info
    getCurrentUser() {
        const userData = localStorage.getItem('userData');
        const token = localStorage.getItem('authToken');

        if (!userData || !token) return null;

        try {
            const user = JSON.parse(userData);
            const payload = JSON.parse(atob(token.split('.')[1]));

            return {
                userId: user.userId,
                email: user.email,
                userType: user.userType,
                username: payload.unique_name || payload.sub,
                role: payload.role || user.userType,
                expiresAt: new Date(payload.exp * 1000)
            };
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    }

    // Get auth token
    getToken() {
        return localStorage.getItem('authToken');
    }

    // Forgot password
    async forgotPassword(email) {
        try {
            const response = await api.post('/Login/forgot-password', { email });

            if (response && response.success) {
                return {
                    success: true,
                    message: response.message || 'Password reset instructions sent to your email'
                };
            }

            return {
                success: false,
                message: response?.message || 'Failed to send reset instructions'
            };
        } catch (error) {
            const errorMessage = error?.response?.data?.message ||
                error?.message ||
                'Failed to send reset instructions';
            return {
                success: false,
                message: errorMessage
            };
        }
    }

    // Reset password
    async resetPassword(token, newPassword, confirmPassword) {
        try {
            const response = await api.post('/Login/reset-password', {
                token,
                newPassword,
                confirmPassword
            });

            if (response && response.success) {
                return {
                    success: true,
                    message: response.message || 'Password reset successfully'
                };
            }

            return {
                success: false,
                message: response?.message || 'Failed to reset password'
            };
        } catch (error) {
            const errorMessage = error?.response?.data?.message ||
                error?.message ||
                'Failed to reset password';
            return {
                success: false,
                message: errorMessage
            };
        }
    }

    // Change password (for authenticated users)
    async changePassword(currentPassword, newPassword) {
        try {
            const response = await api.post('/Login/change-password', {
                currentPassword,
                newPassword
            });

            if (response && response.success) {
                return {
                    success: true,
                    message: response.message || 'Password changed successfully'
                };
            }

            return {
                success: false,
                message: response?.message || 'Failed to change password'
            };
        } catch (error) {
            const errorMessage = error?.response?.data?.message ||
                error?.message ||
                'Failed to change password';
            return {
                success: false,
                message: errorMessage
            };
        }
    }

    // Verify email
    async verifyEmail(token) {
        try {
            const response = await api.post('/Login/verify-email', { token });

            if (response && response.success) {
                return {
                    success: true,
                    message: response.message || 'Email verified successfully'
                };
            }

            return {
                success: false,
                message: response?.message || 'Failed to verify email'
            };
        } catch (error) {
            const errorMessage = error?.response?.data?.message ||
                error?.message ||
                'Failed to verify email';
            return {
                success: false,
                message: errorMessage
            };
        }
    }

    // Refresh token (if you implement refresh token endpoint)
    async refreshToken() {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
                throw new Error('No refresh token available');
            }

            const currentToken = localStorage.getItem('authToken');
            const response = await api.post('/Login/refresh-token', {
                accessToken: currentToken,
                refreshToken: refreshToken
            });

            if (response && response.success && response.accessToken) {
                localStorage.setItem('authToken', response.accessToken);
                if (response.refreshToken) {
                    localStorage.setItem('refreshToken', response.refreshToken);
                }
                return {
                    success: true,
                    message: response.message || 'Token refreshed successfully'
                };
            }

            throw new Error(response?.message || 'Invalid response from refresh token endpoint');
        } catch (error) {
            this.logout();
            const errorMessage = error?.response?.data?.message ||
                error?.message ||
                'Token refresh failed';
            return {
                success: false,
                message: errorMessage
            };
        }
    }
}

// Create singleton instance
const authService = new AuthService();
export default authService;