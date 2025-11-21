import api from '../../../Authpage/Services/Api';
import { ApiMapper } from './apiMapper.js';

const baseChatService = {
    async getUserChats() {
        console.log('🔍 Fetching user chats...');
        try {
            const response = await api.get('/chats');
            console.log('📦 Raw API response:', response);

            if (!response.data) {
                console.warn('❌ No data in response');
                return [];
            }

            let data;
            const responseData = response.data;

            // Handle different response formats
            if (responseData.success && Array.isArray(responseData.data)) {
                data = responseData.data;
            } else if (Array.isArray(responseData)) {
                data = responseData;
            } else if (responseData.data && Array.isArray(responseData.data)) {
                data = responseData.data;
            } else if (responseData.success && responseData.data && typeof responseData.data === 'object') {
                if (Array.isArray(responseData.data.chats)) {
                    data = responseData.data.chats;
                } else if (Array.isArray(responseData.data.items)) {
                    data = responseData.data.items;
                }
            }

            if (data && Array.isArray(data)) {
                console.log(`✅ Processing ${data.length} chats`);
                const mappedChats = data.map(chat => {
                    try {
                        return ApiMapper.mapChat(chat);
                    } catch (error) {
                        console.error('❌ Error mapping chat:', error, chat);
                        return null;
                    }
                }).filter(chat => chat !== null);

                console.log('🎉 Successfully mapped chats:', mappedChats);
                return mappedChats;
            }

            console.warn('⚠️ Unexpected response format');
            return [];

        } catch (error) {
            console.error('💥 Error fetching user chats:', error);
            console.error('Error details:', error.response?.data || error.message);
            throw error;
        }
    },

    async getClientChats(clientId) {
        console.log('🔍 Fetching client chats:', clientId);
        try {
            const response = await api.get(`/chats/client/${clientId}`);
            console.log('📦 Client chats response:', response);

            if (response.data) {
                let data;
                if (response.data.success && Array.isArray(response.data.data)) {
                    data = response.data.data;
                } else if (Array.isArray(response.data)) {
                    data = response.data;
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    data = response.data.data;
                }

                if (data && Array.isArray(data)) {
                    const mappedChats = data.map(chat => ApiMapper.mapChat(chat)).filter(chat => chat !== null);
                    console.log('✅ Mapped client chats:', mappedChats);
                    return mappedChats;
                }
            }

            console.warn('⚠️ Unexpected response format for client chats');
            return [];
        } catch (error) {
            console.error('💥 Error fetching client chats:', error);
            throw error;
        }
    },

    async getAgentChats(agentId) {
        console.log('🔍 Fetching agent chats:', agentId);
        try {
            const response = await api.get(`/chats/agent/${agentId}`);
            console.log('📦 Agent chats response:', response);

            if (response.data) {
                let data;
                if (response.data.success && Array.isArray(response.data.data)) {
                    data = response.data.data;
                } else if (Array.isArray(response.data)) {
                    data = response.data;
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    data = response.data.data;
                }

                if (data && Array.isArray(data)) {
                    return data.map(chat => ApiMapper.mapChat(chat)).filter(chat => chat !== null);
                }
            }

            console.warn('⚠️ Unexpected response format for agent chats');
            return [];
        } catch (error) {
            console.error('💥 Error fetching agent chats:', error);
            throw error;
        }
    },

    async getChat(id) {
        console.log('🔍 Fetching chat:', id);
        try {
            const response = await api.get(`/chats/${id}`);
            console.log('📦 Chat response:', response);

            if (response.data) {
                const data = response.data.success ? response.data.data : response.data;
                if (data) {
                    const mappedChat = ApiMapper.mapChat(data);
                    if (!mappedChat.participants) mappedChat.participants = [];
                    if (!mappedChat.messages) mappedChat.messages = [];
                    return mappedChat;
                }
            }

            throw new Error('Chat not found or invalid response format');
        } catch (error) {
            console.error('💥 Error fetching chat:', error);
            throw error;
        }
    },

    async createChat(chatData) {
        console.log('🔍 Creating chat:', chatData);
        const createRequest = {
            name: chatData.name || `Chat with ${chatData.participantIds?.join(', ')}`,
            chatType: chatData.chatType || 'direct',
            propertyId: chatData.propertyId || null,
            participantIds: chatData.participantIds || []
        };

        console.log('📦 Create request:', createRequest);

        try {
            const response = await api.post('/chats', createRequest);
            console.log('📦 Create response:', response);

            if (response.data) {
                if (response.data.success) {
                    const data = response.data.data || response.data;
                    return ApiMapper.mapChat(data);
                } else if (response.data.id || response.data.chatNo) {
                    return ApiMapper.mapChat(response.data);
                }
            }

            console.warn('⚠️ Unexpected response format for create chat');
            return response.data ? ApiMapper.mapChat(response.data) : null;
        } catch (error) {
            console.error('💥 Error creating chat:', error);
            throw error;
        }
    },

    async sendMessage(messageData) {
        console.log('🔍 Sending message:', messageData);
        const createRequest = {
            chatId: messageData.chatId,
            content: messageData.content || '',
            messageType: messageData.messageType || 'text',
            files: messageData.files || null
        };
        console.log('📦 Send message request:', createRequest);

        try {
            const response = await api.post('/messages', createRequest);
            console.log('📦 Send message response:', response);

            if (response.data) {
                if (response.data.success === true) {
                    const data = response.data.data || response.data;
                    return ApiMapper.mapMessage(data);
                } else if (response.data.id || response.data.messageNo) {
                    return ApiMapper.mapMessage(response.data);
                } else if (response.data.data && (response.data.data.id || response.data.data.messageNo)) {
                    return ApiMapper.mapMessage(response.data.data);
                }
            }

            console.warn('⚠️ Unexpected response format for send message');
            return ApiMapper.mapMessage(response.data);
        } catch (error) {
            console.error('💥 Error sending message:', error);
            throw error;
        }
    },

    async getChatMessages(chatId, page = 1, pageSize = 50) {
        console.log('🔍 Fetching chat messages:', { chatId, page, pageSize });
        const params = { page, pageSize };

        try {
            const response = await api.get(`/chats/${chatId}/messages`, { params });
            console.log('📦 Messages response:', response);

            if (response.data) {
                let data;
                if (response.data.success && Array.isArray(response.data.data)) {
                    data = response.data.data;
                } else if (Array.isArray(response.data)) {
                    data = response.data;
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    data = response.data.data;
                }

                if (data && Array.isArray(data)) {
                    return data.map(message => ApiMapper.mapMessage(message)).filter(msg => msg !== null);
                }
            }

            console.warn('⚠️ Unexpected messages response format');
            return [];
        } catch (error) {
            console.error('💥 Error fetching messages:', error);
            throw error;
        }
    },

    async uploadFile(file, fileType = 'image', onProgress = null) {
        console.log('🔍 Uploading file:', file.name, fileType);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileType', fileType);

        const config = {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: onProgress
        };

        try {
            const response = await api.post('/messages/upload', formData, config);
            console.log('📦 Upload response:', response);

            if (response.data && response.data.success) {
                return {
                    success: true,
                    fileUrl: response.data.fileUrl,
                    ...response.data
                };
            }

            console.error('❌ Unexpected upload response structure:', response);
            throw new Error('Failed to upload file - unexpected response format');
        } catch (error) {
            console.error('💥 Upload error:', error);
            throw error;
        }
    },

    getCurrentUser() {
        try {
            const userData = localStorage.getItem('user');
            if (userData) {
                return JSON.parse(userData);
            }
            return null;
        } catch (error) {
            console.warn('⚠️ Could not get current user:', error);
            return null;
        }
    },

    getCurrentUserId() {
        try {
            const userData = localStorage.getItem('user');
            if (userData) {
                const user = JSON.parse(userData);
                console.log('User data from localStorage:', user);
                return user.userId || user.id || user.baseMemberId || user.clientId || 0;
            }
        } catch (error) {
            console.warn('⚠️ Could not get current user ID:', error);
        }
        return 0;
    },

    getUserRole() {
        try {
            const userData = localStorage.getItem('user');
            if (userData) {
                const user = JSON.parse(userData);
                return user.userType || user.role || 'client';
            }
        } catch (error) {
            console.warn('⚠️ Could not get user role:', error);
        }
        return 'client';
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
                        console.error(`💥 Error in ChatService.${prop}:`, error);
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