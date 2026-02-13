class WebSocketService {
    constructor() {
        this.socket = null;
        this.messageHandlers = new Map();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectInterval = 3000;
        this.isConnected = false;

        this.baseUrl = window.location.hostname === 'localhost'
            ? 'wss://localhost:7080/chatHub'
            : 'wss://betheland.runasp.net/chatHub';

        this.pingInterval = null;
        this.connectionTimeout = null;
        this.heartbeatInterval = null;
        this.notificationSubscribed = false;
    }

    // Connect to WebSocket with notification subscription
    connect() {
        try {
            const token = this.getAuthToken();
            if (!token) {
                console.warn('🚫 No auth token available for WebSocket connection');
                this.notifyHandlers('connection', {
                    status: 'error',
                    message: 'No authentication token available'
                });
                return;
            }
            if (this.socket) {
                this.socket.close(1000, 'Reconnecting');
            }
            const wsUrl = `${this.baseUrl}?access_token=${encodeURIComponent(token)}`;
            console.log('🔌 Connecting to WebSocket:', wsUrl);

            this.socket = new WebSocket(wsUrl);

            this.connectionTimeout = setTimeout(() => {
                if (!this.isConnected && this.socket) {
                    console.warn('⏰ WebSocket connection timeout');
                    this.socket.close();
                    this.handleDisconnect({ code: 1006, reason: 'Connection timeout' });
                }
            }, 10000);

            this.socket.onopen = (event) => {
                console.log('✅ WebSocket connected successfully');
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.notificationSubscribed = false;
                clearTimeout(this.connectionTimeout);

                // Subscribe to notifications after a short delay
                setTimeout(() => {
                    this.subscribeToNotifications();
                }, 500);

                this.notifyHandlers('connection', {
                    status: 'connected',
                    event: event
                });
                this.startHeartbeat();
                this.startPing();
            };

            this.socket.onmessage = (event) => {
                try {
                    console.log('📨 Raw WebSocket message:', event.data);
                    const message = JSON.parse(event.data);
                    console.log('📨 Parsed WebSocket message:', message);
                    this.handleMessage(message);
                } catch (error) {
                    console.error('❌ Error parsing WebSocket message:', error, event.data);
                    if (typeof event.data === 'string') {
                        this.handleTextMessage(event.data);
                    }
                }
            };

            this.socket.onclose = (event) => {
                console.log('🔌 WebSocket disconnected:', {
                    code: event.code,
                    reason: event.reason,
                    wasClean: event.wasClean
                });
                this.handleDisconnect(event);
            };

            this.socket.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
                this.handleDisconnect({
                    code: 1006,
                    reason: 'WebSocket error',
                    error: error
                });
            };

        } catch (error) {
            console.error('💥 Error connecting to WebSocket:', error);
            this.handleDisconnect({
                code: 1006,
                reason: 'Connection error: ' + error.message
            });
        }
    }

    handleTextMessage(text) {
        if (text.includes('{"type":') || text.includes('"method":')) {
            try {
                const message = JSON.parse(text);
                this.handleMessage(message);
            } catch (e) {
                console.log('📝 Plain text message:', text);
            }
        }
    }

    handleDisconnect(event = null) {
        if (this.isConnected) {
            this.isConnected = false;
            this.notificationSubscribed = false;
            this.stopHeartbeat();
            this.stopPing();
            clearTimeout(this.connectionTimeout);

            const status = event?.code === 1000 ? 'disconnected' : 'error';
            this.notifyHandlers('connection', {
                status,
                code: event?.code,
                reason: event?.reason,
                event: event
            });

            if (!event || event.code !== 1000) {
                this.attemptReconnect();
            }
        }
    }

    attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log('🚫 Max reconnection attempts reached');
            this.notifyHandlers('connection', {
                status: 'failed',
                attempts: this.reconnectAttempts
            });
            return;
        }

        this.reconnectAttempts++;
        const delay = Math.min(this.reconnectInterval * Math.pow(1.5, this.reconnectAttempts - 1), 30000);

        console.log(`🔄 Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

        setTimeout(() => {
            if (!this.isConnected) {
                this.connect();
            }
        }, delay);
    }

    disconnect() {
        console.log('👋 Disconnecting WebSocket...');
        this.stopHeartbeat();
        this.stopPing();
        clearTimeout(this.connectionTimeout);

        if (this.socket) {
            this.socket.close(1000, 'User initiated disconnect');
            this.socket = null;
        }

        this.isConnected = false;
        this.notificationSubscribed = false;
        this.reconnectAttempts = 0;
        this.notifyHandlers('connection', { status: 'disconnected' });
    }

    send(message) {
        if (!this.isConnected || !this.socket || this.socket.readyState !== WebSocket.OPEN) {
            console.warn('⚠️ WebSocket not connected, cannot send message');
            return false;
        }

        try {
            const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
            this.socket.send(messageStr);
            console.log('📤 WebSocket message sent:', message);
            return true;
        } catch (error) {
            console.error('❌ Error sending WebSocket message:', error);
            return false;
        }
    }

    // NOTIFICATION METHODS
    subscribeToNotifications() {
        if (!this.isConnected) {
            console.warn('⚠️ WebSocket not connected, cannot subscribe to notifications');
            return false;
        }

        const message = {
            "type": 1,
            "target": "SubscribeToNotifications",
            "arguments": []
        };

        const success = this.send(message);
        if (success) {
            this.notificationSubscribed = true;
            console.log('✅ Subscribed to real-time notifications');
        }
        return success;
    }

    unsubscribeFromNotifications() {
        if (!this.isConnected) {
            return false;
        }

        const message = {
            "type": 1,
            "target": "UnsubscribeFromNotifications",
            "arguments": []
        };

        const success = this.send(message);
        if (success) {
            this.notificationSubscribed = false;
            console.log('✅ Unsubscribed from notifications');
        }
        return success;
    }

    // CHAT METHODS
    sendChatMessage(chatId, messageData) {
        const message = {
            "type": 1,
            "target": "SendMessage",
            "arguments": [
                chatId.toString(),
                messageData.content,
                messageData.messageType || 'text',
                messageData.files || []
            ]
        };
        return this.send(message);
    }

    joinChat(chatId) {
        const message = {
            "type": 1,
            "target": "JoinChat",
            "arguments": [chatId.toString()]
        };
        return this.send(message);
    }

    leaveChat(chatId) {
        const message = {
            "type": 1,
            "target": "LeaveChat",
            "arguments": [chatId.toString()]
        };
        return this.send(message);
    }

    sendTypingIndicator(chatId, isTyping) {
        const message = {
            "type": 1,
            "target": "SendTypingIndicator",
            "arguments": [chatId.toString(), isTyping]
        };
        return this.send(message);
    }

    markMessageAsRead(chatId, messageId) {
        const message = {
            "type": 1,
            "target": "MarkMessageAsRead",
            "arguments": [chatId.toString(), messageId.toString()]
        };
        return this.send(message);
    }

    // Handle incoming messages with notification support
    handleMessage(message) {
        console.log('🔄 Handling message:', message);

        if (message.type === 1 && message.target) {
            this.notifyHandlers(message.target, message.arguments ? message.arguments[0] : {});
        } else if (message.type === 6) {
            console.log('✅ SignalR operation completed');
        } else {
            const messageType = message.type || message.method;
            const data = message.arguments?.[0] || message.data || message;

            switch (messageType) {
                case 'NewMessage':
                case 'new_message':
                    this.notifyHandlers('new_message', data);
                    break;
                case 'TypingIndicator':
                case 'typing_indicator':
                    this.notifyHandlers('typing_indicator', data);
                    break;
                case 'MessageRead':
                case 'message_read':
                    this.notifyHandlers('message_read', data);
                    break;
                // NOTIFICATION HANDLERS
                case 'NewNotification':
                case 'new_notification':
                case 'NotificationReceived':
                    console.log('🔔 Real-time notification received:', data);
                    this.notifyHandlers('new_notification', data);
                    // Also trigger global event for components
                    window.dispatchEvent(new CustomEvent('realtime-notification', { detail: data }));
                    break;
                case 'NotificationRead':
                case 'notification_read':
                    this.notifyHandlers('notification_read', data);
                    break;
                case 'NotificationDeleted':
                case 'notification_deleted':
                    this.notifyHandlers('notification_deleted', data);
                    break;
                case 'NotificationCountUpdated':
                    console.log('🔢 Notification count updated:', data);
                    this.notifyHandlers('notification_count_updated', data);
                    window.dispatchEvent(new CustomEvent('notification-count-updated', { detail: data }));
                    break;
                case 'UserJoined':
                case 'user_joined':
                    this.notifyHandlers('user_joined', data);
                    break;
                case 'UserLeft':
                case 'user_left':
                    this.notifyHandlers('user_left', data);
                    break;
                case 'UserOnlineStatus':
                case 'user_online_status':
                    this.notifyHandlers('user_online_status', data);
                    break;
                case 'ConnectionStatus':
                case 'connection_status':
                    this.notifyHandlers('connection', data);
                    break;
                case 'Pong':
                case 'pong':
                    console.log('🏓 Pong received');
                    break;
                case 'error':
                    console.error('❌ WebSocket error from server:', data);
                    this.notifyHandlers('error', data);
                    break;
                default:
                    console.warn('❓ Unknown WebSocket message type:', messageType, message);
                    this.notifyHandlers('unknown', message);
            }
        }
    }

    on(event, handler) {
        if (!this.messageHandlers.has(event)) {
            this.messageHandlers.set(event, []);
        }
        this.messageHandlers.get(event).push(handler);
        console.log(`✅ Registered handler for event: ${event}`);
    }

    off(event, handler) {
        if (this.messageHandlers.has(event)) {
            const handlers = this.messageHandlers.get(event);
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
                console.log(`✅ Removed handler for event: ${event}`);
            }
        }
    }

    notifyHandlers(event, data) {
        if (this.messageHandlers.has(event)) {
            this.messageHandlers.get(event).forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`❌ Error in WebSocket handler for ${event}:`, error);
                }
            });
        }
    }

    getAuthToken() {
        return localStorage.getItem('authToken') ||
            sessionStorage.getItem('authToken') ||
            localStorage.getItem('sessionAuthToken');
    }

    getConnectionStatus() {
        return this.isConnected && this.socket && this.socket.readyState === WebSocket.OPEN;
    }

    isNotificationSubscribed() {
        return this.notificationSubscribed;
    }

    startHeartbeat() {
        this.stopHeartbeat();
        this.heartbeatInterval = setInterval(() => {
            if (this.isConnected) {
                this.send(JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() }));
            }
        }, 25000);
    }

    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    startPing() {
        this.stopPing();
        this.pingInterval = setInterval(() => {
            if (this.isConnected) {
                const pingMessage = {
                    "type": 1,
                    "target": "Ping",
                    "arguments": []
                };
                this.send(pingMessage);
            }
        }, 30000);
    }

    stopPing() {
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
        }
    }

    getStats() {
        return {
            isConnected: this.isConnected,
            notificationSubscribed: this.notificationSubscribed,
            reconnectAttempts: this.reconnectAttempts,
            maxReconnectAttempts: this.maxReconnectAttempts,
            socketState: this.socket ? this.socket.readyState : 'No socket'
        };
    }
}

const webSocketService = new WebSocketService();
export { WebSocketService };
export default webSocketService;