// Services/SessionService.jsx (Updated)
import authService from './LoginAuth';

class SessionService {
    constructor() {
        this.inactivityTimer = null;
        // REMOVED: sessionCheckInterval
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

        // REMOVED: Start session checking
    }

    resetInactivityTimer() {
        clearTimeout(this.inactivityTimer);

        
        const inactivityTimeout = 30 * 60 * 1000; 

        this.inactivityTimer = setTimeout(() => {
            if (authService.isAuthenticated()) {
                authService.logout();
          
                const returnUrl = window.location.pathname + window.location.search;
                window.location.href = `/login?reason=inactivity&returnUrl=${encodeURIComponent(returnUrl)}`;
            }
        }, inactivityTimeout);
    }

    cleanup() {
        clearTimeout(this.inactivityTimer);
   
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

    // REMOVED: extendSession method
}

// Create singleton instance
const sessionService = new SessionService();
export default sessionService;