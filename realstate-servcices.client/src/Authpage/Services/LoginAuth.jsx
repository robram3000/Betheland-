// Services/LoginAuth.jsx (Updated)
import api from './Api';

class AuthService {
    constructor() {
        // REMOVED: setupTokenRefresh();
    }

    // REMOVED: setupTokenRefresh method

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

    // Logout user - FIXED VERSION
    logout = () => {
        // Clear tokens from localStorage/sessionStorage
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userData'); // Fixed: was 'currentUser'
        localStorage.removeItem('sessionAuthToken');

        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('refreshToken');
        sessionStorage.removeItem('userData'); // Fixed: was 'currentUser'

        document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

    };

    // Enhanced authentication check with auto-cleanup
    isAuthenticated() {
        const token = this.getToken();
        if (!token) return false;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const isExpired = payload.exp * 1000 < Date.now();

            if (isExpired) {
                // Auto-cleanup expired tokens
                this.logout();
                return false;
            }

            // Additional check: verify we have user data
            const userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
            if (!userData) {
                this.logout();
                return false;
            }

            return true;
        } catch (error) {
            // Auto-cleanup invalid tokens
            this.logout();
            return false;
        }
    }

    getCurrentUser() {
        const userData = localStorage.getItem('userData') ||
            sessionStorage.getItem('userData');
        const token = this.getToken();

        if (!userData || !token) return null;

        try {
            const user = JSON.parse(userData);
            const payload = JSON.parse(atob(token.split('.')[1]));

            return {
                userId: user.userId,
                email: user.email,
                userType: user.userType,
                username: payload.unique_name || payload.sub || user.username,
                role: payload.role || user.userType,
                profilePicture: user.profilePicture,
                expiresAt: new Date(payload.exp * 1000),
                rememberMe: !!localStorage.getItem('authToken')
            };
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    }

    // REMOVED: refreshToken method

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

const authService = new AuthService();
export default authService;