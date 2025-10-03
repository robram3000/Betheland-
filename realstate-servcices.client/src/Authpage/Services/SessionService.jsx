// Services/SessionService.jsx
import authService from './LoginAuth';

class SessionService {
    constructor() {
        this.inactivityTimer = null;
        this.sessionCheckInterval = null;
    }

    setupActivityListeners() {
        // Reset inactivity timer on user activity
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

        const resetTimer = () => {
            this.resetInactivityTimer();
        };

        events.forEach(event => {
            document.addEventListener(event, resetTimer, { passive: true });
        });

        // Also handle visibility change
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.resetInactivityTimer();
            }
        });

        // Start session checking
        this.startSessionChecking();
    }

    resetInactivityTimer() {
        clearTimeout(this.inactivityTimer);

        // Logout after 30 minutes of inactivity (configurable)
        const inactivityTimeout = 30 * 60 * 1000; // 30 minutes

        this.inactivityTimer = setTimeout(() => {
            if (authService.isAuthenticated()) {
                authService.logout();
                // Redirect to login with reason
                const returnUrl = window.location.pathname + window.location.search;
                window.location.href = `/login?reason=inactivity&returnUrl=${encodeURIComponent(returnUrl)}`;
            }
        }, inactivityTimeout);
    }

    startSessionChecking() {
        // Check session every 5 minutes
        this.sessionCheckInterval = setInterval(async () => {
            if (authService.isAuthenticated()) {
                try {
                    const isValid = await this.validateSession();
                    if (!isValid) {
                        authService.logout();
                        window.location.href = '/login?reason=session_expired';
                    }
                } catch (error) {
                    console.warn('Session validation failed:', error);
                }
            }
        }, 5 * 60 * 1000); // 5 minutes
    }

    // Check session validity with backend
    async validateSession() {
        const token = authService.getToken();
        if (!token) return false;

        try {
            // You might want to create a simple endpoint that just validates the token
            const response = await fetch('/api/Login/validate-session', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            return response.ok;
        } catch (error) {
            console.error('Session validation error:', error);
            return false;
        }
    }

    // Cleanup
    cleanup() {
        clearTimeout(this.inactivityTimer);
        clearInterval(this.sessionCheckInterval);

        // Remove event listeners
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        events.forEach(event => {
            document.removeEventListener(event, this.resetInactivityTimer);
        });
    }

    // Get session time remaining
    getTimeRemaining() {
        const token = authService.getToken();
        if (!token) return 0;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return Math.max(0, payload.exp * 1000 - Date.now());
        } catch {
            return 0;
        }
    }

    // Extend session (if your backend supports it)
    async extendSession() {
        try {
            const result = await authService.refreshToken();
            return result.success;
        } catch (error) {
            console.error('Session extension failed:', error);
            return false;
        }
    }
}

// Create singleton instance
const sessionService = new SessionService();
export default sessionService;