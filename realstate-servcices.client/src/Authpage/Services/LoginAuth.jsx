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

            if (response && response.accessToken) {
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
                    message: 'Login successful'
                };
            }

            return {
                success: false,
                message: 'Login failed: Invalid response from server'
            };

        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: error.message || 'Login failed. Please try again.'
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
            await api.post('/Login/forgot-password', { email });
            return {
                success: true,
                message: 'Password reset instructions sent to your email'
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to send reset instructions'
            };
        }
    }

    // Reset password
    async resetPassword(token, newPassword, confirmPassword) {
        try {
            await api.post('/Login/reset-password', {
                token,
                newPassword,
                confirmPassword
            });

            return {
                success: true,
                message: 'Password reset successfully'
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to reset password'
            };
        }
    }

    // Change password (for authenticated users)
    async changePassword(currentPassword, newPassword) {
        try {
            await api.post('/Login/change-password', {
                currentPassword,
                newPassword
            });

            return {
                success: true,
                message: 'Password changed successfully'
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to change password'
            };
        }
    }

    // Verify email
    async verifyEmail(token) {
        try {
            await api.post('/Login/verify-email', { token });
            return {
                success: true,
                message: 'Email verified successfully'
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to verify email'
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

            const response = await api.post('/Login/refresh-token', {
                refreshToken
            });

            if (response.accessToken) {
                localStorage.setItem('authToken', response.accessToken);
                return {
                    success: true,
                    message: 'Token refreshed successfully'
                };
            }

            throw new Error('Invalid response from refresh token endpoint');
        } catch (error) {
            this.logout();
            return {
                success: false,
                message: error.message || 'Token refresh failed'
            };
        }
    }
}

// Create singleton instance
const authService = new AuthService();
export default authService;