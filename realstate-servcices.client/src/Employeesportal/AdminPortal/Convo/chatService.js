import api from '../../../Authpage/Services/Api';
import { ApiMapper } from './apiMapper.js';

const baseChatService = {
    async getUserChats() {
        console.log('Fetching user chats...');
        try {
            const response = await api.get('/chats');
            console.log('Chats response:', response);

            if (response.data && response.data.success) {
                const data = response.data.data || response.data;
                if (Array.isArray(data)) {
                    return data.map(chat => ApiMapper.mapChat(chat));
                }
            }

            console.error('Unexpected response format:', response);
            throw new Error('Invalid response format from server');
        } catch (error) {
            console.error('Error fetching user chats:', error);
            throw error;
        }
    },

    async getClientChats(clientId) {
        console.log('Fetching client chats:', clientId);
        try {
            const response = await api.get(`/chats/client/${clientId}`);
            console.log('Client chats response:', response);

            if (response.data && response.data.success) {
                const data = response.data.data || response.data;
                if (Array.isArray(data)) {
                    return data.map(chat => ApiMapper.mapChat(chat));
                }
            }

            console.error('Unexpected response format:', response);
            throw new Error('Invalid response format from server');
        } catch (error) {
            console.error('Error fetching client chats:', error);
            throw error;
        }
    },

    async getAgentChats(agentId) {
        console.log('Fetching agent chats:', agentId);
        try {
            const response = await api.get(`/chats/agent/${agentId}`);
            console.log('Agent chats response:', response);

            if (response.data && response.data.success) {
                const data = response.data.data || response.data;
                if (Array.isArray(data)) {
                    return data.map(chat => ApiMapper.mapChat(chat));
                }
            }

            console.error('Unexpected response format:', response);
            throw new Error('Invalid response format from server');
        } catch (error) {
            console.error('Error fetching agent chats:', error);
            throw error;
        }
    },

    async getChat(id) {
        console.log('Fetching chat:', id);
        try {
            const response = await api.get(`/chats/${id}`);
            console.log('Chat response:', response);

            if (response.data) {
                // Handle both success flag and direct data
                const data = response.data.success ? response.data.data : response.data;
                if (data) {
                    const mappedChat = ApiMapper.mapChat(data);

                    // Ensure participants and messages are properly set
                    if (!mappedChat.participants) mappedChat.participants = [];
                    if (!mappedChat.messages) mappedChat.messages = [];

                    console.log('Mapped chat with participants:', mappedChat.participants.length);
                    console.log('Mapped chat with messages:', mappedChat.messages.length);

                    return mappedChat;
                }
            }

            throw new Error('Chat not found or invalid response format');
        } catch (error) {
            console.error('Error fetching chat:', error);
            throw error;
        }
    },

    async createChat(chatData) {
        console.log('Creating chat:', chatData);

        const createRequest = {
            name: chatData.name || `Chat with ${chatData.participantIds?.join(', ')}`,
            chatType: chatData.chatType || 'direct',
            propertyId: chatData.propertyId || null,
            participantIds: chatData.participantIds || []
        };

        console.log('Create request:', createRequest);

        try {
            const response = await api.post('/chats', createRequest);
            console.log('Create response:', response);

            // FIX: Better response handling
            if (response.data) {
                // Check if response has success flag
                if (response.data.success) {
                    const data = response.data.data || response.data;
                    return ApiMapper.mapChat(data);
                }
                // If no success flag but has data, assume success
                else if (response.data.id || response.data.chatNo) {
                    return ApiMapper.mapChat(response.data);
                }
            }

            console.warn('Unexpected response format, but proceeding:', response);
            // Instead of throwing error, return the response data
            return response.data ? ApiMapper.mapChat(response.data) : null;

        } catch (error) {
            console.error('Error creating chat:', error);
            throw error;
        }
    },

    async updateChat(id, chatData) {
        console.log('Updating chat:', id, chatData);
        const updateRequest = {
            name: chatData.name,
            propertyId: chatData.propertyId
        };
        console.log('Update request:', updateRequest);

        try {
            const response = await api.put(`/chats/${id}`, updateRequest);
            console.log('Update response:', response);

            if (response.data && response.data.success) {
                const data = response.data.data || response.data;
                return ApiMapper.mapChat(data);
            }

            throw new Error(response.data?.message || 'Failed to update chat');
        } catch (error) {
            console.error('Update chat error:', error);
            throw error;
        }
    },

    async deleteChat(id) {
        console.log('Deleting chat:', id);
        try {
            const response = await api.delete(`/chats/${id}`);
            console.log('Delete response:', response);

            if (response.data && response.data.success) {
                return response.data;
            }
            throw new Error(response.data?.message || 'Failed to delete chat');
        } catch (error) {
            console.error('Error deleting chat:', error);
            throw error;
        }
    },

    async addParticipant(chatId, participantData) {
        console.log('Adding participant to chat:', chatId, participantData);

        const addRequest = {
            baseMemberId: participantData.baseMemberId,
            role: participantData.role || 'member',
            participantType: participantData.participantType || 'user'
        };
        console.log('Add participant request:', addRequest);

        try {
            const response = await api.post(`/chats/${chatId}/participants`, addRequest);
            console.log('Add participant response:', response);

            if (response.data && response.data.success) {
                const data = response.data.data || response.data;
                return ApiMapper.mapChatParticipant(data);
            }

            throw new Error(response.data?.message || 'Failed to add participant');
        } catch (error) {
            console.error('Error adding participant:', error);
            throw error;
        }
    },

    async removeParticipant(chatId, participantId) {
        console.log('Removing participant:', chatId, participantId);
        try {
            const response = await api.delete(`/chats/${chatId}/participants/${participantId}`);
            console.log('Remove participant response:', response);

            if (response.data && response.data.success) {
                return response.data;
            }
            throw new Error(response.data?.message || 'Failed to remove participant');
        } catch (error) {
            console.error('Error removing participant:', error);
            throw error;
        }
    },

    async getChatMessages(chatId, page = 1, pageSize = 50) {
        console.log('Fetching chat messages:', { chatId, page, pageSize });

        const params = {
            page,
            pageSize
        };

        try {
            const response = await api.get(`/chats/${chatId}/messages`, { params });
            console.log('Messages response:', response);

            if (response.data && response.data.success) {
                const data = response.data.data || response.data;
                if (Array.isArray(data)) {
                    return data.map(message => ApiMapper.mapMessage(message));
                }
            }

            console.error('Unexpected messages response format:', response);
            throw new Error('Invalid response format from server');
        } catch (error) {
            console.error('Error fetching messages:', error);
            throw error;
        }
    },

    async sendMessage(messageData) {
        console.log('Sending message:', messageData);

        const createRequest = {
            chatId: messageData.chatId,
            content: messageData.content || '',
            messageType: messageData.messageType || 'text',
            files: messageData.files || null
        };
        console.log('Send message request:', createRequest);

        try {
            const response = await api.post('/messages', createRequest);
            console.log('Send message response:', response);

            // FIX: Better response handling for different response structures
            if (response.data) {
                // Case 1: Standard success response {success: true, data: {...}}
                if (response.data.success === true) {
                    const data = response.data.data || response.data;
                    return ApiMapper.mapMessage(data);
                }
                // Case 2: Direct data response (already the message object)
                else if (response.data.id || response.data.messageNo) {
                    return ApiMapper.mapMessage(response.data);
                }
                // Case 3: Response with data property but no success flag
                else if (response.data.data && (response.data.data.id || response.data.data.messageNo)) {
                    return ApiMapper.mapMessage(response.data.data);
                }
            }

            console.warn('Unexpected response format, but proceeding with raw data:', response);
            // If we get here, try to map whatever data we have
            return ApiMapper.mapMessage(response.data);

        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    },

    async updateMessage(id, messageData) {
        console.log('Updating message:', id, messageData);
        const updateRequest = {
            content: messageData.content
        };
        console.log('Update message request:', updateRequest);

        try {
            const response = await api.put(`/messages/${id}`, updateRequest);
            console.log('Update message response:', response);

            if (response.data && response.data.success) {
                const data = response.data.data || response.data;
                return ApiMapper.mapMessage(data);
            }

            throw new Error(response.data?.message || 'Failed to update message');
        } catch (error) {
            console.error('Error updating message:', error);
            throw error;
        }
    },

    async deleteMessage(id) {
        console.log('Deleting message:', id);
        try {
            const response = await api.delete(`/messages/${id}`);
            console.log('Delete message response:', response);

            if (response.data && response.data.success) {
                return response.data;
            }
            throw new Error(response.data?.message || 'Failed to delete message');
        } catch (error) {
            console.error('Error deleting message:', error);
            throw error;
        }
    },

    async addReaction(messageId, emoji) {
        console.log('Adding reaction:', messageId, emoji);
        try {
            const response = await api.post(`/messages/${messageId}/reactions`, { emoji });
            console.log('Add reaction response:', response);

            if (response.data && response.data.success) {
                const data = response.data.data || response.data;
                return ApiMapper.mapMessage(data);
            }

            throw new Error(response.data?.message || 'Failed to add reaction');
        } catch (error) {
            console.error('Error adding reaction:', error);
            throw error;
        }
    },

    async removeReaction(messageId) {
        console.log('Removing reaction:', messageId);
        try {
            const response = await api.delete(`/messages/${messageId}/reactions`);
            console.log('Remove reaction response:', response);

            if (response.data && response.data.success) {
                return response.data;
            }
            throw new Error(response.data?.message || 'Failed to remove reaction');
        } catch (error) {
            console.error('Error removing reaction:', error);
            throw error;
        }
    },

    async uploadFile(file, fileType = 'image', onProgress = null) {
        console.log('Uploading file:', file.name, fileType);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileType', fileType);

        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: onProgress
        };

        try {
            const response = await api.post('/messages/upload', formData, config);
            console.log('Upload response:', response);

            if (response.data && response.data.success) {
                return {
                    success: true,
                    fileUrl: response.data.fileUrl,
                    ...response.data
                };
            }

            console.error('Unexpected upload response structure:', response);
            throw new Error('Failed to upload file - unexpected response format');
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    },

    async getNotifications(unreadOnly = false) {
        console.log('Fetching notifications, unreadOnly:', unreadOnly);

        const params = {
            unreadOnly
        };

        try {
            const response = await api.get('/notifications', { params });
            console.log('Notifications response:', response);

            if (response.data && response.data.success) {
                const data = response.data.data || response.data;
                if (Array.isArray(data)) {
                    return data.map(notification => ApiMapper.mapNotification(notification));
                }
            }

            console.error('Unexpected notifications response format:', response);
            throw new Error('Invalid response format from server');
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }
    },

    async markNotificationAsRead(notificationId) {
        console.log('Marking notification as read:', notificationId);
        try {
            const response = await api.post(`/notifications/${notificationId}/read`);
            console.log('Mark as read response:', response);

            if (response.data && response.data.success) {
                return response.data;
            }
            throw new Error(response.data?.message || 'Failed to mark notification as read');
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    },

    async markAllNotificationsAsRead() {
        console.log('Marking all notifications as read');
        try {
            const response = await api.post('/notifications/read-all');
            console.log('Mark all as read response:', response);

            if (response.data && response.data.success) {
                return response.data;
            }
            throw new Error(response.data?.message || 'Failed to mark all notifications as read');
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    },

    async getChatWithFallback(chatId) {
        try {
            console.log('Fetching chat with fallback:', chatId);
            if (!chatId) {
                return this.getFallbackChat();
            }

            const chat = await this.getChat(chatId);
            return chat;
        } catch (error) {
            console.warn('Failed to fetch chat, returning fallback:', error);
            return this.getFallbackChat(chatId);
        }
    },

    getFallbackChat(chatId = null) {
        return {
            id: chatId,
            chatNo: '00000000-0000-0000-0000-000000000000',
            name: 'Unknown Chat',
            chatType: 'direct',
            propertyId: null,
            lastMessage: null,
            lastMessageAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            participants: [],
            messages: []
        };
    },

    async getUnreadMessageCount(chatId) {
        try {
            console.log('Getting unread message count for chat:', chatId);
            const chat = await this.getChat(chatId);

            if (chat && chat.participants) {
                const currentUserParticipant = chat.participants.find(p =>
                    p.baseMemberId === this.getCurrentUserId()
                );

                return currentUserParticipant?.unreadCount || 0;
            }

            return 0;
        } catch (error) {
            console.error('Error getting unread message count:', error);
            return 0;
        }
    },

    async getRecentChats(limit = 10) {
        try {
            console.log('Getting recent chats, limit:', limit);
            const allChats = await this.getUserChats();

            const recentChats = allChats
                .filter(chat => chat.lastMessageAt)
                .sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
                .slice(0, limit);

            console.log('Recent chats:', recentChats);
            return recentChats;
        } catch (error) {
            console.error('Error getting recent chats:', error);
            return [];
        }
    },

    async searchChats(searchTerm) {
        try {
            console.log('Searching chats for:', searchTerm);
            const allChats = await this.getUserChats();

            const filteredChats = allChats.filter(chat => {
                if (chat.name && chat.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                    return true;
                }

                const participantMatch = chat.participants.some(participant =>
                    participant.member &&
                    participant.member.fullName.toLowerCase().includes(searchTerm.toLowerCase())
                );

                return participantMatch;
            });

            console.log('Search results:', filteredChats);
            return filteredChats;
        } catch (error) {
            console.error('Error searching chats:', error);
            return [];
        }
    },

    getCurrentUserId() {
        try {
            const userData = localStorage.getItem('user');
            if (userData) {
                const user = JSON.parse(userData);
                return user.id || user.baseMemberId || 0;
            }
        } catch (error) {
            console.warn('Could not get current user ID:', error);
        }
        return 0;
    }
};

// Error handling wrapper
const createChatServiceWithErrorHandling = (service) => {
    const handler = {
        get(target, prop) {
            const original = target[prop];
            if (typeof original === 'function') {
                return async function (...args) {
                    try {
                        return await original.apply(target, args);
                    } catch (error) {
                        console.error(`Error in ChatService.${prop}:`, error);
                        throw error;
                    }
                };
            }
            return original;
        }
    };

    return new Proxy(service, handler);
};

const chatService = createChatServiceWithErrorHandling(baseChatService);

export default chatService;