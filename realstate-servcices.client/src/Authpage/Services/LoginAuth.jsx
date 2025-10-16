// Services/LoginAuth.jsx (Enhanced)
import api from './Api';

class AuthService {
    constructor() {
        this.setupTokenRefresh();
    }

    setupTokenRefresh() {
        const checkTokenExpiry = () => {
            const token = this.getToken();
            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    const expiresIn = payload.exp * 1000 - Date.now();
                    if (expiresIn < 5 * 60 * 1000 && expiresIn > 0) {
                        this.refreshToken().catch(error => {
                            console.warn('Token refresh failed:', error);
                        });
                    }
                } catch (error) {
                    console.error('Token expiry check failed:', error);
                }
            }
        };
        this.tokenCheckInterval = setInterval(checkTokenExpiry, 12 * 60 * 60 * 1000);
    }

    async login(usernameOrEmail, password, rememberMe = false) {
        try {
            const response = await api.post('/Login/login', {
                usernameOrEmail,
                password,
                rememberMe
            });

            if (!response) {
                return {
                    success: false,
                    message: 'No response from server'
                };
            }

            if (response.success && response.accessToken) {
                try {
                    const payload = JSON.parse(atob(response.accessToken.split('.')[1]));
                    if (!payload.exp) {
                        console.warn('Token missing expiration');
                    }
                } catch (tokenError) {
                    console.error('Invalid token format:', tokenError);
                    return {
                        success: false,
                        message: 'Invalid authentication token'
                    };
                }
                this.setTokens(response, rememberMe);

                return {
                    success: true,
                    data: response,
                    message: response.message || 'Login successful'
                };
            }

            // Handle specific error cases
            if (response.message?.toLowerCase().includes('email') ||
                response.message?.toLowerCase().includes('verify')) {
                return {
                    success: false,
                    message: 'Email not verified. Please check your email.',
                    requiresVerification: true
                };
            }

            if (response.message?.toLowerCase().includes('locked')) {
                return {
                    success: false,
                    message: 'Account temporarily locked. Please try again later.',
                    accountLocked: true
                };
            }

            return {
                success: false,
                message: response.message || 'Login failed'
            };

        } catch (error) {
            console.error('Login error:', error);

            // Network errors
            if (error.message?.includes('Network Error') || error.message?.includes('timeout')) {
                return {
                    success: false,
                    message: 'Network error. Please check your connection.'
                };
            }

            // Server errors
            if (error.status >= 500) {
                return {
                    success: false,
                    message: 'Server error. Please try again later.'
                };
            }

            const errorMessage = error?.message || 'Login failed. Please try again.';
            return {
                success: false,
                message: errorMessage
            };
        }
    }

    // Store tokens with remember me option
    setTokens(authData, rememberMe = false) {
        const storage = rememberMe ? localStorage : sessionStorage;

        storage.setItem('authToken', authData.accessToken);
        storage.setItem('refreshToken', authData.refreshToken || '');

        // ✅ Use consistent property name - store as profilePicture
        storage.setItem('userData', JSON.stringify({
            userId: authData.userId,
            email: authData.email,
            userType: authData.userType,
            username: authData.username || '',
            profilePicture: authData.ImageProfile || '' // Map ImageProfile to profilePicture
        }));

        if (!rememberMe) {
            localStorage.setItem('sessionAuthToken', authData.accessToken);
        }
    }
    // Get token from appropriate storage
    getToken() {
        return localStorage.getItem('authToken') ||
            sessionStorage.getItem('authToken') ||
            localStorage.getItem('sessionAuthToken');
    }

    // Logout user
    logout() {
        // Clear all storage
        localStorage.clear();
        sessionStorage.clear();

        // Clear intervals
        if (this.tokenCheckInterval) {
            clearInterval(this.tokenCheckInterval);
        }

        // Optional: Call backend logout endpoint
        // await api.post('/Login/logout').catch(() => {}); // Silent fail
    }

    // Check if user is authenticated
    isAuthenticated() {
        const token = this.getToken();
        if (!token) return false;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const isExpired = payload.exp * 1000 < Date.now();

            if (isExpired) {
                this.logout(); // Auto cleanup expired tokens
                return false;
            }

            return true;
        } catch {
            this.logout(); // Auto cleanup invalid tokens
            return false;
        }
    }

    // Get current user info
    getCurrentUser() {
        const userData = localStorage.getItem('userData') ||
            sessionStorage.getItem('userData');
        const token = this.getToken();

        if (!userData || !token) return null;

        try {
            const user = JSON.parse(userData);
            const payload = JSON.parse(atob(token.split('.')[1]));

            // ✅ Debug logging to see what's actually stored
            console.log("Stored user data:", user);
            console.log("Profile picture from storage:", user.profilePicture);

            return {
                userId: user.userId,
                email: user.email,
                userType: user.userType,
                username: payload.unique_name || payload.sub || user.username,
                role: payload.role || user.userType,
                profilePicture: user.profilePicture, // ✅ Use the stored property name
                expiresAt: new Date(payload.exp * 1000),
                rememberMe: !!localStorage.getItem('authToken')
            };
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    }

    // Refresh token
    async refreshToken() {
        try {
            const refreshToken = localStorage.getItem('refreshToken') ||
                sessionStorage.getItem('refreshToken');

            if (!refreshToken) {
                throw new Error('No refresh token available');
            }

            const response = await api.post('/Login/refresh-token', {
                refreshToken: refreshToken
            });

            if (response && response.success && response.accessToken) {
                // Determine which storage to use
                const rememberMe = !!localStorage.getItem('authToken');
                this.setTokens(response, rememberMe);

                return {
                    success: true,
                    message: response.message || 'Token refreshed successfully'
                };
            }

            throw new Error(response?.message || 'Invalid response from refresh token endpoint');
        } catch (error) {
            console.error('Token refresh failed:', error);
            this.logout(); // Full logout on refresh failure

            const errorMessage = error?.response?.data?.message ||
                error?.message ||
                'Token refresh failed';

            return {
                success: false,
                message: errorMessage
            };
        }
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

    // Check if email exists
    async checkEmailExists(email) {
        try {
            const response = await api.post('/Login/check-email', { email });
            return {
                exists: response?.exists || false,
                message: response?.message || ''
            };
        } catch (error) {
            return {
                exists: false,
                message: error?.response?.data?.message || 'Error checking email'
            };
        }
    }

    // Check if username exists
    async checkUsernameExists(username) {
        try {
            const response = await api.post('/Login/check-username', { username });
            return {
                exists: response?.exists || false,
                message: response?.message || ''
            };
        } catch (error) {
            return {
                exists: false,
                message: error?.response?.data?.message || 'Error checking username'
            };
        }
    }
}

// Create singleton instance
const authService = new AuthService();
export default authService;