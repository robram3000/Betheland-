// ChatService.js - COMPLETE REAL-TIME NOTIFICATION VERSION
import webSocketService from './WebSocketService';

class ChatService {
    constructor() {
        this.baseUrl = window.location.hostname === 'localhost'
            ? 'https://localhost:7080/api'
            : 'https://betheland.runasp.net/api';

        // Initialize WebSocket connection for real-time features
        this.initializeWebSocket();
    }

    initializeWebSocket() {
        // Set up WebSocket connection when service is initialized
        if (this.isAuthenticated()) {
            setTimeout(() => {
                webSocketService.connect();
            }, 1000);
        }

        // Listen for authentication changes
        window.addEventListener('storage', (e) => {
            if (e.key === 'authToken' || e.key === 'sessionAuthToken') {
                if (this.isAuthenticated()) {
                    setTimeout(() => {
                        webSocketService.connect();
                    }, 500);
                } else {
                    webSocketService.disconnect();
                }
            }
        });
    }
    getWebSocketService() {
        return webSocketService;
    }
    getAuthToken() {
        return localStorage.getItem('authToken') ||
            sessionStorage.getItem('authToken') ||
            localStorage.getItem('sessionAuthToken');
    }
    isAuthenticated() {
        const token = this.getAuthToken();
        if (!token) return false;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp * 1000 > Date.now();
        } catch (error) {
            console.error('Invalid token:', error);
            return false;
        }
    }
    async makeAuthenticatedRequest(endpoint, options = {}) {
        const token = this.getAuthToken();

        if (!token || !this.isAuthenticated()) {
            throw new Error('Please log in to access this feature');
        }

        const defaultOptions = {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        };

        const config = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers,
            },
        };

        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, config);

            if (response.status === 401) {
                localStorage.removeItem('authToken');
                sessionStorage.removeItem('authToken');
                throw new Error('Session expired. Please log in again.');
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // REAL-TIME NOTIFICATION METHODS
    enableRealTimeNotifications() {
        if (!webSocketService.getConnectionStatus()) {
            webSocketService.connect();
        }

        // Subscribe to notification events
        webSocketService.subscribeToNotifications();

        console.log('✅ Real-time notifications enabled');
    }

    disableRealTimeNotifications() {
        webSocketService.unsubscribeFromNotifications();
        console.log('✅ Real-time notifications disabled');
    }

    // Listen for real-time notification events
    onNotificationReceived(callback) {
        webSocketService.on('new_notification', callback);

        // Also listen to global events
        const globalHandler = (event) => {
            callback(event.detail);
        };
        window.addEventListener('realtime-notification', globalHandler);

        return () => {
            webSocketService.off('new_notification', callback);
            window.removeEventListener('realtime-notification', globalHandler);
        };
    }

    onNotificationCountUpdated(callback) {
        webSocketService.on('notification_count_updated', callback);

        const globalHandler = (event) => {
            callback(event.detail);
        };
        window.addEventListener('notification-count-updated', globalHandler);

        return () => {
            webSocketService.off('notification_count_updated', callback);
            window.removeEventListener('notification-count-updated', globalHandler);
        };
    }

    // Enhanced sendMessage with WebSocket
    async sendMessage(chatId, messageData) {
        if (!this.isAuthenticated()) {
            throw new Error('Please log in to send messages');
        }

        try {
            // Try WebSocket first for real-time delivery
            const wsSuccess = webSocketService.sendChatMessage(chatId, messageData);

            // Always send via HTTP API for persistence
            const httpResponse = await this.makeAuthenticatedRequest('/Messages', {
                method: 'POST',
                body: JSON.stringify({
                    ...messageData,
                    chatId: chatId
                }),
            });

            if (wsSuccess) {
                console.log('✅ Message sent via WebSocket and HTTP API');
            } else {
                console.log('🔄 WebSocket not available, using HTTP API only');
            }

            return httpResponse.success ? httpResponse.data : null;
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    }

    joinChatRoom(chatId) {
        if (webSocketService.getConnectionStatus()) {
            return webSocketService.joinChat(chatId);
        }
        return false;
    }

    leaveChatRoom(chatId) {
        if (webSocketService.getConnectionStatus()) {
            return webSocketService.leaveChat(chatId);
        }
        return false;
    }

    sendTypingIndicator(chatId, isTyping) {
        if (webSocketService.getConnectionStatus()) {
            return webSocketService.sendTypingIndicator(chatId, isTyping);
        }
        return false;
    }

    markMessageAsRead(chatId, messageId) {
        if (webSocketService.getConnectionStatus()) {
            return webSocketService.markMessageAsRead(chatId, messageId);
        }
        return false;
    }

    // NOTIFICATION API METHODS
    async getUserNotifications(unreadOnly = false) {
        if (!this.isAuthenticated()) {
            return [];
        }

        try {
            const response = await this.makeAuthenticatedRequest(
                `/Notifications?unreadOnly=${unreadOnly}`
            );
            return response.success ? response.data : [];
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }
    }

    async getNotificationCount() {
        if (!this.isAuthenticated()) {
            return { success: true, totalCount: 0, unreadCount: 0 };
        }

        try {
            const response = await this.makeAuthenticatedRequest('/Notifications/count');
            return response.success ? response.data : { totalCount: 0, unreadCount: 0 };
        } catch (error) {
            console.error('Error fetching notification count:', error);
            return { success: false, totalCount: 0, unreadCount: 0 };
        }
    }

    async markNotificationAsRead(notificationId) {
        if (!this.isAuthenticated()) {
            return { success: false };
        }

        try {
            const response = await this.makeAuthenticatedRequest(
                `/Notifications/${notificationId}/read`,
                { method: 'POST' }
            );

            // Notify via WebSocket if connected
            if (webSocketService.getConnectionStatus()) {
                webSocketService.send({
                    type: 1,
                    target: 'MarkNotificationAsRead',
                    arguments: [notificationId.toString()]
                });
            }

            return { success: response.success };
        } catch (error) {
            console.error('Error marking notification as read:', error);
            return { success: false };
        }
    }

    async markAllNotificationsAsRead() {
        if (!this.isAuthenticated()) {
            return { success: false };
        }

        try {
            const response = await this.makeAuthenticatedRequest(
                '/Notifications/mark-all-read',
                { method: 'POST' }
            );

            // Notify via WebSocket if connected
            if (webSocketService.getConnectionStatus()) {
                webSocketService.send({
                    type: 1,
                    target: 'MarkAllNotificationsAsRead',
                    arguments: []
                });
            }

            return { success: response.success };
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            return { success: false };
        }
    }

    async deleteNotification(notificationId) {
        if (!this.isAuthenticated()) {
            return { success: false };
        }

        try {
            const response = await this.makeAuthenticatedRequest(
                `/Notifications/${notificationId}`,
                { method: 'DELETE' }
            );

            // Notify via WebSocket if connected
            if (webSocketService.getConnectionStatus()) {
                webSocketService.send({
                    type: 1,
                    target: 'DeleteNotification',
                    arguments: [notificationId.toString()]
                });
            }

            return { success: response.success };
        } catch (error) {
            console.error('Error deleting notification:', error);
            return { success: false };
        }
    }

    // CHAT API METHODS
    async getUserChats() {
        if (!this.isAuthenticated()) {
            throw new Error('Please log in to access chats');
        }

        try {
            const response = await this.makeAuthenticatedRequest('/Chats');
            return response.success ? response.data : [];
        } catch (error) {
            console.error('Error fetching user chats:', error);
            throw error;
        }
    }

    async getChatsByRecipient(recipientId) {
        if (!this.isAuthenticated()) {
            throw new Error('Please log in to access chats');
        }

        try {
            const response = await this.makeAuthenticatedRequest(`/Chats/recipient/${recipientId}`);
            return response.success ? response.data : [];
        } catch (error) {
            console.error('Error fetching recipient chats:', error);
            throw error;
        }
    }

    async getChat(chatId) {
        if (!this.isAuthenticated()) {
            throw new Error('Please log in to access chats');
        }

        try {
            const response = await this.makeAuthenticatedRequest(`/Chats/${chatId}`);
            return response.success ? response.data : null;
        } catch (error) {
            console.error('Error fetching chat:', error);
            throw error;
        }
    }

    async createChat(chatData) {
        if (!this.isAuthenticated()) {
            throw new Error('Please log in to create chats');
        }

        try {
            const response = await this.makeAuthenticatedRequest('/Chats', {
                method: 'POST',
                body: JSON.stringify(chatData),
            });
            return response.success ? response.data : null;
        } catch (error) {
            console.error('Error creating chat:', error);
            throw error;
        }
    }

    async getChatMessages(chatId, page = 1, pageSize = 50) {
        if (!this.isAuthenticated()) {
            throw new Error('Please log in to view messages');
        }

        try {
            const response = await this.makeAuthenticatedRequest(
                `/Chats/${chatId}/messages?page=${page}&pageSize=${pageSize}`
            );
            return response.success ? response.data : [];
        } catch (error) {
            console.error('Error fetching messages:', error);
            throw error;
        }
    }

    // Get WebSocket connection status
    getWebSocketStatus() {
        return {
            connected: webSocketService.getConnectionStatus(),
            notificationSubscribed: webSocketService.isNotificationSubscribed(),
            stats: webSocketService.getStats()
        };
    }
}

const chatService = new ChatService();
export default chatService;