// ChatPageAgent.jsx - Updated with SCSS class names
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Row, Col, Card, Input, Avatar, Typography, List, Badge, Button, Space,
    Tabs, message, Drawer, Popover, Upload, Modal, Spin, Tag,
    Tooltip, Alert, Dropdown, Descriptions, Rate, Divider
} from 'antd';
import {
    SearchOutlined, MoreOutlined, WechatOutlined,
    SendOutlined, InfoCircleOutlined,
    LeftOutlined, SmileOutlined, EyeOutlined,
    PaperClipOutlined, FileImageOutlined, FileOutlined,
    PlayCircleOutlined, DeleteOutlined, UserOutlined,
    TeamOutlined, MessageOutlined,
    VideoCameraOutlined, PhoneOutlined, LikeOutlined,
    HomeOutlined, StarOutlined, MailOutlined,
    CalendarOutlined, EnvironmentOutlined, LoadingOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import chatService from '../../AdminPortal/Convo/chatService';
import authService from '../../../Authpage/Services/LoginAuth';
import propertyService from '../../AdminPortal/Creation_Property/services/propertyService';
import clientService from '../../AdminPortal/Creation_Agent/Services/ClientService';
import profileService from '../../../Accounts/Services/ProfileService';
import { processImageUrl } from '../../AdminPortal/Creation_Property/processImageUrl';
import './ChatPageAgent.scss'; // Import SCSS file

const { Search } = Input;
const { TextArea } = Input;
const { Title, Text } = Typography;

const ChatPageAgent = ({ propertyChatData }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeChat, setActiveChat] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
    const [fileList, setFileList] = useState([]);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [loadingChats, setLoadingChats] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sendingMessage, setSendingMessage] = useState(false);
    const [isOnline, setIsOnline] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');

    // Reduced auto-reload states
    const [isLoading, setIsLoading] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(Date.now());
    const [refreshInterval] = useState(30000); // Keep as fallback

    // Client and Property states
    const [currentClient, setCurrentClient] = useState(null);
    const [propertyInfo, setPropertyInfo] = useState(null);
    const [loadingClient, setLoadingClient] = useState(false);

    const textAreaRef = useRef(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    // Get current user info (Agent)
    const getCurrentUserInfo = () => {
        try {
            const userData = localStorage.getItem('user');
            if (userData) {
                const user = JSON.parse(userData);
                console.log('📱 Agent from localStorage:', user);
                return user;
            }

            if (authService.getCurrentUser && typeof authService.getCurrentUser === 'function') {
                const authUser = authService.getCurrentUser();
                console.log('🔐 Agent from authService:', authUser);
                return authUser;
            }

            console.warn('❌ No agent found in localStorage or authService');
            return null;
        } catch (error) {
            console.error('💥 Error getting agent info:', error);
            return null;
        }
    };

    const currentUser = getCurrentUserInfo();
    const AgentID = currentUser?.userId || currentUser?.id || currentUser?.baseMemberId || currentUser?.agentId;

    console.log('👤 Current Agent:', currentUser);
    console.log('🆔 AgentID:', AgentID);

    const [chats, setChats] = useState([]);
    const [hasInitialized, setHasInitialized] = useState(false);

    // WebSocket initialization for real-time messaging
    useEffect(() => {
        const webSocketService = chatService.getWebSocketService();

        // Set up WebSocket event handlers
        const handleNewMessage = (messageData) => {
            console.log('🆕 Real-time message received in agent chat:', messageData);

            // Check if we have message data with chatId
            if (!messageData || !messageData.chatId) {
                console.log('⚠️ No chatId in message data, checking structure:', messageData);

                // Try alternative message formats
                if (messageData.message) {
                    messageData = messageData.message;
                }

                if (!messageData || !messageData.chatId) {
                    console.warn('❌ Invalid message data format for real-time update');
                    return;
                }
            }

            // Update the active chat if the message belongs to it
            const activeChatData = chats.find(chat => chat.id === activeChat);
            if (activeChatData && messageData.chatId === activeChatData.backendChatId) {

                // Transform and add the new message
                const transformedMessage = {
                    id: messageData.id || Date.now(),
                    text: messageData.content || '',
                    sender: messageData.senderId === parseInt(AgentID) ? 'me' : 'other',
                    time: formatMessageTime(new Date(messageData.sentAt || new Date())),
                    files: messageData.files || [],
                    senderId: messageData.senderId,
                    isCurrentUser: messageData.senderId === parseInt(AgentID),
                    sentAt: messageData.sentAt || new Date().toISOString()
                };

                console.log('✅ Adding real-time message to active chat:', transformedMessage);

                // Update the chat with new message
                setChats(prev => prev.map(chat =>
                    chat.backendChatId === messageData.chatId
                        ? {
                            ...chat,
                            messages: [...(chat.messages || []), transformedMessage],
                            lastMessage: messageData.content || 'New message',
                            time: 'Now',
                            unread: messageData.senderId !== parseInt(AgentID)
                                ? (chat.unread || 0) + 1
                                : 0
                        }
                        : chat
                ));

                // Scroll to bottom
                setTimeout(() => {
                    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }

            // Also reload chats list to update unread counts and timestamps
            loadExistingChats();
        };

        const handleTypingIndicator = (data) => {
            console.log('✍️ Typing indicator:', data);
            // Handle typing indicators if needed
        };

        const handleConnectionStatus = (data) => {
            console.log('Agent WebSocket connection status:', data.status);
            setIsOnline(data.status === 'connected');
            setConnectionStatus(data.status);

            if (data.status === 'connected') {
                // Subscribe to notifications
                setTimeout(() => {
                    chatService.enableRealTimeNotifications();
                }, 1000);
            }
        };

        // Register event handlers
        webSocketService.on('new_message', handleNewMessage);
        webSocketService.on('typing_indicator', handleTypingIndicator);
        webSocketService.on('connection', handleConnectionStatus);

        // Connect to WebSocket if authenticated
        if (AgentID && chatService.isAuthenticated()) {
            console.log('🔌 Initializing WebSocket connection for agent...');
            setTimeout(() => {
                webSocketService.connect();
            }, 2000);
        }

        // Cleanup
        return () => {
            webSocketService.off('new_message', handleNewMessage);
            webSocketService.off('typing_indicator', handleTypingIndicator);
            webSocketService.off('connection', handleConnectionStatus);
        };
    }, [AgentID, activeChat, chats]);

    // NEW: Auto-select first chat when chats are loaded
    useEffect(() => {
        // Auto-select first chat when chats are loaded and no active chat is selected
        if (chats.length > 0 && !activeChat && hasInitialized) {
            console.log('🔄 Auto-selecting first chat:', chats[0].id);
            handleChatSelect(chats[0].id);
        }
    }, [chats, activeChat, hasInitialized]);

    const commonEmojis = [
        '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
        '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
        '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
        '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
        '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
        '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
        '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯',
        '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐',
        '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈',
        '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾',
        '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿',
        '😾', '❤️', '👍', '👎', '🔥', '⭐', '🎉'
    ];

    // Format message time
    const formatMessageTime = (date) => {
        if (!date) return 'Just now';

        try {
            const messageDate = new Date(date);
            const now = new Date();

            if (isNaN(messageDate.getTime())) {
                return 'Just now';
            }

            const diffMs = now - messageDate;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);

            if (diffMins < 1) return 'Just now';
            if (diffMins < 60) return `${diffMins}m ago`;
            if (diffHours < 24) return `${diffHours}h ago`;
            if (diffDays < 7) return `${diffDays}d ago`;

            return messageDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Error formatting time:', error);
            return 'Just now';
        }
    };

    // Format time for chat list (shorter version)
    const formatChatTime = (date) => {
        if (!date) return 'Now';

        try {
            const messageDate = new Date(date);
            const now = new Date();

            if (isNaN(messageDate.getTime())) {
                return 'Now';
            }

            const diffMs = now - messageDate;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);

            if (diffMins < 1) return 'Now';
            if (diffMins < 60) return `${diffMins}m`;
            if (diffHours < 24) return `${diffHours}h`;
            if (diffDays < 7) return `${diffDays}d`;

            return messageDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return 'Now';
        }
    };

    // Get active chat data
    const activeChatData = chats.find(chat => chat.id === activeChat);

    // Fetch client profile picture using ProfileService
    const fetchClientProfilePicture = async (clientId) => {
        if (!clientId) return null;

        try {
            console.log('🖼️ Fetching client profile picture for ID:', clientId);

            // Use ProfileService to get client profile data
            const profileResult = await profileService.getprofiledisplaywithid(clientId);

            if (profileResult.success && profileResult.data) {
                const profileData = profileResult.data;
                console.log('✅ Client profile data:', profileData);

                // Return the profile picture URL
                return profileData.profilePicture || profileData.profilePictureUrl || null;
            } else {
                console.warn('❌ No profile data found for client:', clientId);
                return null;
            }
        } catch (error) {
            console.error('💥 Error fetching client profile picture:', error);
            return null;
        }
    };

    // FIXED: Enhanced fetch client data with proper profile picture handling
    const fetchClientData = async (participants, currentUserId) => {
        if (!participants || !Array.isArray(participants)) {
            console.warn('❌ No participants provided');
            return null;
        }

        console.log('🔍 All participants:', participants);
        console.log('👤 Current Agent ID:', currentUserId);

        // Find client participant (not current user)
        const clientParticipant = participants.find(p => {
            const participantBaseMemberId = p.baseMemberId;
            const participantRecipientId = p.recipientId;

            console.log('🔍 Checking participant:', {
                participantBaseMemberId,
                participantRecipientId,
                currentUserId
            });

            // The client is the participant who is NOT the current agent
            if (participantBaseMemberId && parseInt(participantBaseMemberId) !== parseInt(currentUserId)) {
                return true;
            }

            // Also check recipientId as alternative
            if (participantRecipientId && parseInt(participantRecipientId) !== parseInt(currentUserId)) {
                return true;
            }

            return false;
        });

        if (!clientParticipant) {
            console.warn('❌ No client participant found. All participants:', participants);
            return null;
        }

        console.log('✅ Found client participant:', clientParticipant);

        // Get client ID - use baseMemberId of the client participant
        let clientId = clientParticipant.baseMemberId;

        // If baseMemberId is the agent, use recipientId instead
        if (clientId && parseInt(clientId) === parseInt(currentUserId)) {
            clientId = clientParticipant.recipientId;
        }

        if (!clientId) {
            console.warn('❌ No client ID found in participant:', clientParticipant);
            return null;
        }

        console.log('🔍 Client ID to fetch:', clientId);
        console.log('🔍 Client ID type:', typeof clientId);

        try {
            setLoadingClient(true);

            let clientData;
            let profilePictureUrl = null;

            // METHOD 1: Direct API call to get client data
            try {
                console.log('🔄 DIRECT METHOD: Fetching client data directly for ID:', clientId);
                const api = (await import('../../../Authpage/Services/Api')).default;
                const response = await api.get(`/client/${clientId}`);

                console.log('✅ DIRECT METHOD Success - Raw API response:', response);

                if (response && response.id) {
                    // Map the response directly to client data
                    clientData = {
                        id: response.id,
                        baseMemberId: response.baseMemberId,
                        firstName: response.firstName || 'Unknown',
                        lastName: response.lastName || 'Client',
                        middleName: response.middleName || '',
                        email: response.email || '',
                        profilePictureUrl: response.profilePictureUrl || '/default-avatar.png',
                        cellPhoneNo: response.cellPhoneNo || '',
                        status: response.status || 'Active',
                        country: response.country || '',
                        city: response.city || '',
                        street: response.street || '',
                        zipCode: response.zipCode || '',
                        address: response.address || '',
                        dateRegistered: response.dateRegistered || response.createdAt,
                        fullName: `${response.firstName || 'Unknown'} ${response.lastName || 'Client'}`
                    };
                    console.log('✅ Mapped client data from direct API:', clientData);
                } else {
                    throw new Error('No client data in response');
                }
            } catch (directError) {
                console.warn('❌ DIRECT METHOD Failed, trying ClientService:', directError);

                // METHOD 2: Try ClientService as fallback
                try {
                    console.log('🔄 METHOD 2: Trying ClientService for client:', clientId);
                    clientData = await clientService.getClientByBaseMemberId(clientId);
                    console.log('✅ METHOD 2 Success - Client data:', clientData);
                } catch (serviceError) {
                    console.warn('❌ METHOD 2 Failed, trying getClient:', serviceError);

                    try {
                        console.log('🔄 METHOD 3: Trying getClient:', clientId);
                        clientData = await clientService.getClient(clientId);
                        console.log('✅ METHOD 3 Success - Client data:', clientData);
                    } catch (finalError) {
                        console.warn('❌ All methods failed, using participant data:', finalError);

                        // Ultimate fallback - use participant data
                        clientData = {
                            id: clientId,
                            baseMemberId: clientId,
                            firstName: clientParticipant.member?.firstName || 'Client',
                            lastName: clientParticipant.member?.lastName || `#${clientId}`,
                            fullName: clientParticipant.member?.fullName || `Client #${clientId}`,
                            email: clientParticipant.member?.email || '',
                            profilePictureUrl: '/default-avatar.png',
                            cellPhoneNo: clientParticipant.member?.phone || '',
                            status: 'Active'
                        };
                    }
                }
            }

            // FIXED: Properly await the profile picture fetch
            try {
                console.log('🔄 Fetching profile picture for client:', clientId);
                const profilePictureResult = await fetchClientProfilePicture(clientId);

                if (profilePictureResult) {
                    console.log('✅ Profile picture URL found:', profilePictureResult);
                    const processedUrl = processImageUrl(profilePictureResult);
                    console.log('✅ Processed profile picture URL:', processedUrl);

                    // Update client data with the processed URL
                    if (clientData) {
                        clientData.profilePictureUrl = processedUrl;
                    }
                } else {
                    console.warn('❌ No profile picture found, using default');
                    if (clientData) {
                        clientData.profilePictureUrl = processImageUrl('/default-avatar.png');
                    }
                }
            } catch (profileError) {
                console.warn('❌ Error fetching profile picture:', profileError);
                // Ensure we have a default profile picture
                if (clientData) {
                    clientData.profilePictureUrl = processImageUrl('/default-avatar.png');
                }
            }

            console.log('🎯 Final client data to set:', clientData);
            setCurrentClient(clientData);
            return clientData;

        } catch (error) {
            console.error('❌ Final error fetching client data:', error);

            // Ultimate fallback
            const fallbackClient = {
                id: clientId,
                baseMemberId: clientId,
                firstName: 'Client',
                lastName: `#${clientId}`,
                fullName: `Client #${clientId}`,
                email: '',
                profilePictureUrl: processImageUrl('/default-avatar.png'),
                cellPhoneNo: '',
                status: 'Active'
            };

            console.log('✅ Using ultimate fallback client data:', fallbackClient);
            setCurrentClient(fallbackClient);
            return fallbackClient;
        } finally {
            setLoadingClient(false);
        }
    };

    // Enhanced property data fetching
    const fetchPropertyData = async (propertyId) => {
        if (!propertyId) {
            console.warn('❌ No property ID provided');
            return null;
        }

        try {
            console.log('🔍 Fetching property data for ID:', propertyId);

            let propertyData;

            try {
                propertyData = await propertyService.getProperty(propertyId);
            } catch (error) {
                console.warn('🔄 First method failed, trying getAllProperties fallback:', error);
                const allProperties = await propertyService.getAllProperties();
                propertyData = allProperties.find(p => p.id === parseInt(propertyId));
            }

            if (propertyData) {
                const processedProperty = {
                    id: propertyData.id || propertyId,
                    title: propertyData.title || propertyData.propertyName || 'Untitled Property',
                    description: propertyData.description || '',
                    type: propertyData.type || propertyData.propertyType || 'residential',
                    price: parseFloat(propertyData.price) || 0,
                    bedrooms: parseInt(propertyData.bedrooms) || 0,
                    bathrooms: parseFloat(propertyData.bathrooms) || 0,
                    areaSqm: parseInt(propertyData.areaSqm) || 0,
                    areaSqft: propertyData.areaSqft || propertyData.squareFeet || 0,
                    address: propertyData.address || '',
                    city: propertyData.city || '',
                    state: propertyData.state || '',
                    zipCode: propertyData.zipCode || '',
                    mainImage: propertyData.mainImage || propertyData.imageUrl || '/default-property.jpg',
                    status: propertyData.status || 'available',
                    amenities: propertyData.amenities || []
                };

                console.log('✅ Processed property data:', processedProperty);
                setPropertyInfo(processedProperty);
                return processedProperty;
            }

            return null;
        } catch (error) {
            console.error('❌ Error fetching property data:', error);
            return null;
        }
    };

    // FIXED: Optimized auto-reload - Only update active chat, no full reload
    const pollForNewMessages = useCallback(async () => {
        if (!AgentID || isLoading || sendingMessage) return;

        try {
            setIsLoading(true);
            console.log('🔄 Polling for new messages...');

            // Only update the active chat messages, don't reload all chats
            if (activeChatData?.backendChatId) {
                try {
                    const updatedMessages = await chatService.getChatMessages(activeChatData.backendChatId);

                    if (updatedMessages && updatedMessages.length > 0) {
                        const transformedMessages = updatedMessages.map(msg => ({
                            id: msg.id,
                            text: msg.content,
                            sender: msg.senderId === parseInt(AgentID) ? 'me' : 'other',
                            time: formatMessageTime(new Date(msg.sentAt)),
                            files: msg.files || [],
                            senderId: msg.senderId,
                            isCurrentUser: msg.senderId === parseInt(AgentID),
                            sentAt: msg.sentAt
                        }));

                        setChats(prev => prev.map(chat =>
                            chat.backendChatId === activeChatData.backendChatId
                                ? { ...chat, messages: transformedMessages }
                                : chat
                        ));
                    }
                } catch (error) {
                    console.error('❌ Error updating messages:', error);
                }
            }

            setLastUpdate(Date.now());
        } catch (error) {
            console.error('❌ Error in pollForNewMessages:', error);
        } finally {
            setIsLoading(false);
        }
    }, [AgentID, activeChatData, isLoading, sendingMessage]);

    // Set up auto-reload interval (increased to 30s to reduce blinking, but WebSocket will handle real-time)
    useEffect(() => {
        if (!AgentID) return;

        const intervalId = setInterval(pollForNewMessages, refreshInterval);

        return () => {
            clearInterval(intervalId);
        };
    }, [pollForNewMessages, refreshInterval, AgentID]);

    // Enhanced loadExistingChats for agent with proper client identification
    const loadExistingChats = async () => {
        if (!AgentID || AgentID === 0) {
            console.error('❌ AgentID not available');
            message.error('Please log in to access chats');
            return;
        }

        try {
            setLoadingChats(true);
            console.log(`🔍 Loading chats for AgentID:`, AgentID);

            let existingChats = [];

            try {
                existingChats = await chatService.getUserChats();
            } catch (error) {
                console.log('🔄 Fallback to user chats:', error);
                existingChats = await chatService.getUserChats();
            }

            if (existingChats && existingChats.length > 0) {
                console.log(`✅ Found ${existingChats.length} chats for agent`);

                const processedChats = await Promise.all(
                    existingChats.map(async (chat) => {
                        console.log('🔍 Processing chat:', chat);

                        if (chat.property) {
                            console.log('✅ Chat already has property data from backend:', chat.property);
                            return chat;
                        }

                        if (chat.propertyId && !chat.property) {
                            try {
                                console.log('🏠 Fetching property data for chat propertyId:', chat.propertyId);
                                const propertyData = await fetchPropertyData(chat.propertyId);
                                if (propertyData) {
                                    console.log('✅ Property data fetched successfully');
                                    return {
                                        ...chat,
                                        property: propertyData
                                    };
                                }
                            } catch (error) {
                                console.error('❌ Error fetching property data:', error);
                            }
                        }

                        return chat;
                    })
                );

                console.log('✅ All chats processed with property data');

                const transformedChats = processedChats.map(chat => {
                    // For agents, find the client participant
                    const clientParticipant = chat.participants?.find(p =>
                        p.baseMemberId !== parseInt(AgentID) &&
                        (p.role === 'client' || p.participantType === 'client' || !p.role)
                    );

                    const lastMessage = chat.messages && chat.messages.length > 0
                        ? chat.messages[chat.messages.length - 1]
                        : null;

                    const transformedMessages = (chat.messages || []).map(msg => ({
                        id: msg.id,
                        text: msg.content,
                        sender: msg.senderId === parseInt(AgentID) ? 'me' : 'other',
                        time: formatMessageTime(new Date(msg.sentAt)),
                        files: msg.files || [],
                        senderId: msg.senderId,
                        isCurrentUser: msg.senderId === parseInt(AgentID),
                        sentAt: msg.sentAt
                    }));

                    let displayName = chat.name;
                    if (chat.property?.title && !displayName?.includes(chat.property.title)) {
                        displayName = `${clientParticipant?.member?.fullName || 'Client'} - ${chat.property.title}`;
                    } else if (!displayName) {
                        displayName = clientParticipant?.member?.fullName || 'Client Chat';
                    }

                    // Use the client participant's profile picture
                    const avatarUrl = clientParticipant?.member?.profileImage ||
                        clientParticipant?.member?.profilePicture ||
                        '/default-avatar.png';

                    return {
                        id: chat.id.toString(),
                        backendChatId: chat.id,
                        name: displayName,
                        lastMessage: lastMessage?.content || 'No messages yet',
                        time: lastMessage ? formatChatTime(new Date(lastMessage.sentAt)) : 'Just now',
                        unread: chat.participants?.find(p => p.baseMemberId === parseInt(AgentID))?.unreadCount || 0,
                        type: chat.chatType || 'direct',
                        avatar: avatarUrl,
                        isAgentChat: true,
                        clientData: clientParticipant?.member || null,
                        propertyData: chat.property,
                        propertyId: chat.propertyId,
                        messages: transformedMessages,
                        participants: chat.participants || [],
                        clientParticipant: clientParticipant
                    };
                });

                console.log('🎉 Transformed chats for agent:', transformedChats);
                setChats(transformedChats);
            } else {
                console.log('📭 No chats found for agent');
                setChats([]);
            }
        } catch (error) {
            console.error('💥 Error loading chats:', error);
            message.error('Failed to load chats: ' + (error.message || 'Unknown error'));
        } finally {
            setLoadingChats(false);
            setHasInitialized(true);
        }
    };

    const loadChatMessages = async (chatId) => {
        if (!chatId) return;
        try {
            setLoadingMessages(true);
            const messages = await chatService.getChatMessages(chatId);
            if (messages && messages.length > 0) {
                const transformedMessages = messages.map(msg => ({
                    id: msg.id,
                    text: msg.content,
                    sender: msg.senderId === parseInt(AgentID) ? 'me' : 'other',
                    time: formatMessageTime(new Date(msg.sentAt)),
                    files: msg.files || [],
                    senderId: msg.senderId,
                    isCurrentUser: msg.senderId === parseInt(AgentID),
                    sentAt: msg.sentAt
                }));

                setChats(prev => prev.map(chat =>
                    chat.backendChatId === chatId
                        ? { ...chat, messages: transformedMessages }
                        : chat
                ));
            }
        } catch (error) {
            console.error('❌ Error loading messages:', error);
        } finally {
            setLoadingMessages(false);
        }
    };

    // Handle chat selection - properly update client and property data
    const handleChatSelect = async (chatId) => {
        console.log('💬 Selecting chat:', chatId);
        setActiveChat(chatId);

        const selectedChat = chats.find(chat => chat.id === chatId);
        if (!selectedChat) return;

        // Reset current data
        setCurrentClient(null);
        setPropertyInfo(null);

        // Join chat room via WebSocket for real-time updates
        if (selectedChat.backendChatId) {
            chatService.joinChatRoom(selectedChat.backendChatId);
        }

        // Fetch client data from participants (this will now include profile picture)
        if (selectedChat.participants) {
            await fetchClientData(selectedChat.participants, AgentID);
        }

        // Fetch property data
        if (selectedChat.propertyId) {
            await fetchPropertyData(selectedChat.propertyId);
        } else if (selectedChat.propertyData) {
            setPropertyInfo(selectedChat.propertyData);
        }

        setSidebarVisible(false);
    };

    // Initial load
    useEffect(() => {
        if (AgentID && !hasInitialized) {
            loadExistingChats();

            // Enable real-time notifications
            setTimeout(() => {
                chatService.enableRealTimeNotifications();
            }, 3000);
        }
    }, [AgentID]);

    // Load messages when active chat changes
    useEffect(() => {
        if (activeChatData?.backendChatId) {
            loadChatMessages(activeChatData.backendChatId);
        }
    }, [activeChat]);

    // Scroll to bottom when messages change
    useEffect(() => {
        if (activeChat) {
            const currentChat = chats.find(chat => chat.id === activeChat);
            if (currentChat && currentChat.messages && currentChat.messages.length > 0) {
                scrollToBottom();
            }
        }
    }, [activeChat, chats.find(chat => chat.id === activeChat)?.messages?.length]);

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    // CHAT FILTERING
    const filteredChats = chats.filter(chat => {
        if (searchQuery && !chat.name.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }
        if (activeTab === 'unread' && chat.unread === 0) {
            return false;
        }
        return true;
    });

    // Enhanced send message function for agents with WebSocket
    const handleSendMessage = async () => {
        if ((!newMessage || newMessage.trim() === '') && fileList.length === 0) {
            message.warning('Please enter a message or attach a file');
            return;
        }

        if (!activeChatData) {
            message.error('No active chat selected');
            return;
        }

        setSendingMessage(true);

        try {
            let uploadedFiles = [];

            // Upload files if any
            if (fileList.length > 0) {
                for (const file of fileList) {
                    try {
                        // Simulate file upload
                        const mockUploadResult = {
                            success: true,
                            fileUrl: URL.createObjectURL(file),
                            fileName: file.name,
                            fileType: file.type.startsWith('image/') ? 'image' :
                                file.type.startsWith('video/') ? 'video' : 'file',
                            fileSize: file.size,
                            mimeType: file.type
                        };

                        if (mockUploadResult.success && mockUploadResult.fileUrl) {
                            uploadedFiles.push({
                                fileName: mockUploadResult.fileName,
                                fileUrl: mockUploadResult.fileUrl,
                                fileType: mockUploadResult.fileType,
                                fileSize: mockUploadResult.fileSize,
                                mimeType: mockUploadResult.mimeType
                            });
                        }
                    } catch (error) {
                        console.error('❌ File upload failed:', error);
                        message.error(`Failed to upload ${file.name}`);
                    }
                }
            }

            const backendChatId = activeChatData.backendChatId;

            if (!backendChatId) {
                message.error('Cannot send message: Chat not properly initialized');
                setSendingMessage(false);
                return;
            }

            // Get recipient ID (client ID)
            const recipientId = activeChatData.clientParticipant?.baseMemberId;

            // Send message via HTTP
            const messagePayload = {
                content: newMessage.trim(),
                messageType: uploadedFiles.length > 0 ? 'file' : 'text',
                recipientId: recipientId || null,
                files: uploadedFiles.length > 0 ? uploadedFiles : []
            };

            console.log('📤 Sending message payload:', messagePayload);

            await chatService.sendMessage(backendChatId, messagePayload);

            // Update UI immediately for better UX
            const newMessageObj = {
                id: Date.now(),
                text: newMessage.trim(),
                sender: 'me',
                time: 'Just now',
                files: uploadedFiles,
                senderId: parseInt(AgentID),
                isCurrentUser: true,
                sentAt: new Date().toISOString()
            };

            setChats(prev => prev.map(chat =>
                chat.id === activeChat
                    ? {
                        ...chat,
                        messages: [...(chat.messages || []), newMessageObj],
                        lastMessage: newMessage.trim() || `${uploadedFiles.length} file(s)`,
                        time: 'Now',
                        unread: 0
                    }
                    : chat
            ));

            message.success('Message sent! 🎉');
            setNewMessage('');
            setFileList([]);
            setEmojiPickerVisible(false);

            // Scroll to bottom after sending
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);

        } catch (error) {
            console.error('💥 Error sending message:', error);
            message.error('Failed to send message: ' + (error.message || 'Unknown error'));
        } finally {
            setSendingMessage(false);
        }
    };

    // Handle like reaction
    const handleLikeMessage = async () => {
        if (!activeChatData) {
            message.error('No active chat selected');
            return;
        }

        try {
            // Send a like message (heart emoji)
            const likePayload = {
                content: '❤️',
                messageType: 'text',
                recipientId: activeChatData.clientParticipant?.baseMemberId
            };

            await chatService.sendMessage(activeChatData.backendChatId, likePayload);

            // Update UI immediately
            const likeMessageObj = {
                id: Date.now(),
                text: '❤️',
                sender: 'me',
                time: 'Just now',
                files: [],
                senderId: parseInt(AgentID),
                isCurrentUser: true,
                sentAt: new Date().toISOString()
            };

            setChats(prev => prev.map(chat =>
                chat.id === activeChat
                    ? {
                        ...chat,
                        messages: [...(chat.messages || []), likeMessageObj],
                        lastMessage: '❤️',
                        time: 'Now',
                        unread: 0
                    }
                    : chat
            ));

            message.success('Liked! ❤️');

        } catch (error) {
            console.error('❌ Error sending like:', error);
            message.error('Failed to send like');
        }
    };

    const handleEmojiClick = (emoji) => {
        setNewMessage(prev => prev + emoji);
        setEmojiPickerVisible(false);
        // Focus back on textarea
        setTimeout(() => {
            if (textAreaRef.current) {
                textAreaRef.current.focus();
            }
        }, 100);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Enhanced file upload handling
    const beforeUpload = (file) => {
        // Check file type
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        const isDocument = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain'
        ].includes(file.type);

        if (!isImage && !isVideo && !isDocument) {
            message.error('You can only upload image, video, or document files!');
            return false;
        }

        // Check file size (20MB limit)
        const isLt20M = file.size / 1024 / 1024 < 20;
        if (!isLt20M) {
            message.error('File must be smaller than 20MB!');
            return false;
        }

        // Add file to list
        setFileList(prev => [...prev, {
            ...file,
            uid: file.uid || Date.now(),
            type: isImage ? 'image' : isVideo ? 'video' : 'document'
        }]);

        message.success(`${file.name} added to attachments`);

        // Focus back on textarea
        setTimeout(() => {
            if (textAreaRef.current) {
                textAreaRef.current.focus();
            }
        }, 100);

        return false;
    };

    const handleFileRemove = (file) => {
        setFileList(prev => prev.filter(f => f.uid !== file.uid));
        message.info(`${file.name} removed`);
    };

    const handlePreview = (file) => {
        if (file.type.startsWith('image/')) {
            setPreviewImage(file.url || URL.createObjectURL(file));
            setPreviewVisible(true);
        } else if (file.type.startsWith('video/')) {
            const videoUrl = file.url || URL.createObjectURL(file);
            window.open(videoUrl, '_blank');
        } else {
            // For documents, show download or open in new tab
            const docUrl = file.url || URL.createObjectURL(file);
            window.open(docUrl, '_blank');
        }
    };

    const getFileIcon = (file) => {
        if (file.type.startsWith('image/')) {
            return <FileImageOutlined className="chat-agent-message-file-icon chat-agent-message-file-icon-image" />;
        } else if (file.type.startsWith('video/')) {
            return <PlayCircleOutlined className="chat-agent-message-file-icon chat-agent-message-file-icon-video" />;
        } else if (file.type.includes('pdf')) {
            return <FileOutlined className="chat-agent-message-file-icon chat-agent-message-file-icon-pdf" />;
        } else if (file.type.includes('word') || file.type.includes('document')) {
            return <FileOutlined className="chat-agent-message-file-icon chat-agent-message-file-icon-document" />;
        } else if (file.type.includes('excel') || file.type.includes('sheet')) {
            return <FileOutlined className="chat-agent-message-file-icon chat-agent-message-file-icon-spreadsheet" />;
        }
        return <FileOutlined className="chat-agent-message-file-icon" />;
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatPrice = (price) => {
        if (typeof price === 'number') {
            return `₱${price.toLocaleString('en-PH')}`;
        }
        return price || '₱0';
    };

    // UPDATED: Property Information Card Component
    const PropertyInfoCard = ({ property }) => {
        if (!property) return null;

        return (
            <div className="chat-agent-property-info-container">
                <Card className="chat-agent-property-info-card">
                    <div className="chat-agent-property-info-content">
                        <img
                            src={property.mainImage}
                            alt={property.title}
                            className="chat-agent-property-info-image"
                            onError={(e) => {
                                e.target.src = '/default-property.jpg';
                            }}
                        />
                        <div className="chat-agent-property-info-details">
                            <Text strong className="chat-agent-property-info-title">
                                {property.title}
                            </Text>
                            <div className="chat-agent-property-info-address">
                                <EnvironmentOutlined className="chat-agent-property-info-address-icon" />
                                <Text type="secondary" className="chat-agent-property-info-address-text">
                                    {property.address}
                                </Text>
                            </div>
                            <div className="chat-agent-property-info-features">
                                {property.bedrooms > 0 && (
                                    <div className="chat-agent-property-info-feature">
                                        <HomeOutlined className="chat-agent-property-info-feature-icon" />
                                        <Text className="chat-agent-property-info-feature-text">{property.bedrooms} bed</Text>
                                    </div>
                                )}
                                {property.bathrooms > 0 && (
                                    <div className="chat-agent-property-info-feature">
                                        <UserOutlined className="chat-agent-property-info-feature-icon" />
                                        <Text className="chat-agent-property-info-feature-text">{property.bathrooms} bath</Text>
                                    </div>
                                )}
                                {property.areaSqm > 0 && (
                                    <div className="chat-agent-property-info-feature">
                                        <svg className="chat-agent-property-info-feature-icon" width="12" height="12" viewBox="0 0 24 24" fill="#666">
                                            <path d="M3 3v18h18V3H3zm16 16H5V5h14v14z" />
                                            <path d="M7 7h10v10H7z" />
                                        </svg>
                                        <Text className="chat-agent-property-info-feature-text">{property.areaSqm} sqm</Text>
                                    </div>
                                )}
                            </div>
                            <div className="chat-agent-property-info-price-container">
                                <Text strong className="chat-agent-property-info-price">
                                    {formatPrice(property.price)}
                                </Text>
                                <Tag color={property.status === 'available' ? 'green' : 'orange'} className="chat-agent-property-info-status-tag">
                                    {property.status || 'Available'}
                                </Tag>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        );
    };

    // FIXED: Message bubble with file support
    const MessageBubble = ({ message }) => {
        const hasFiles = message.files && message.files.length > 0;

        return (
            <div className={`chat-agent-message-bubble-container ${message.sender === 'me' ? 'chat-agent-message-bubble-container-me' : 'chat-agent-message-bubble-container-other'}`}>
                <div className={`chat-agent-message-bubble ${message.sender === 'me' ? 'chat-agent-message-bubble-me' : 'chat-agent-message-bubble-other'}`}>
                    {/* File attachments */}
                    {hasFiles && (
                        <div className="chat-agent-message-files-container">
                            {message.files.map((file, index) => (
                                <div key={index} className="chat-agent-message-file-item">
                                    <div className="chat-agent-message-file-header">
                                        {getFileIcon(file)}
                                        <div className="chat-agent-message-file-info">
                                            <div className="chat-agent-message-file-name">
                                                {file.fileName}
                                            </div>
                                            <div className="chat-agent-message-file-size">
                                                {formatFileSize(file.fileSize)}
                                            </div>
                                        </div>
                                        <Button
                                            type="text"
                                            size="small"
                                            icon={<EyeOutlined className="chat-agent-message-file-view-icon" />}
                                            onClick={() => handlePreview(file)}
                                            className="chat-agent-message-file-view-button"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Message text */}
                    {message.text && (
                        <div className="chat-agent-message-text">
                            {message.text}
                        </div>
                    )}

                    {/* Message time */}
                    <div className="chat-agent-message-time">
                        {message.time}
                    </div>
                </div>
            </div>
        );
    };

    // FIXED: Chat list item with proper client name display
    const ChatListItem = ({ chat }) => {
        // Get client name from chat data
        const clientFullName = currentClient?.fullName;

        // Get property title if available
        const propertyTitle = chat.propertyData?.title || '';

        return (
            <List.Item
                className={`chat-agent-list-item ${activeChat === chat.id ? 'chat-agent-list-item-active' : ''}`}
                onClick={() => handleChatSelect(chat.id)}
            >
                <div className="chat-agent-list-item-content">
                    <div className="chat-agent-list-item-avatar-container">
                        <Avatar
                            src={chat.avatar}
                            size={48}
                            className="chat-agent-list-item-avatar"
                        >
                            {chat.name?.charAt(0) || 'C'}
                        </Avatar>
                        {chat.unread > 0 && (
                            <Badge
                                count={chat.unread}
                                className="chat-agent-list-item-badge"
                            />
                        )}
                    </div>
                    <div className="chat-agent-list-item-text-container">
                        <div className="chat-agent-list-item-header">
                            <Text strong className="chat-agent-list-item-title">
                                {propertyTitle}
                            </Text>
                            <Text type="secondary" className="chat-agent-list-item-time">
                                {chat.time}
                            </Text>
                        </div>
                        <div className="chat-agent-list-item-footer">
                            <Text className="chat-agent-list-item-last-message">
                                {chat.lastMessage}
                            </Text>
                            {chat.unread > 0 && (
                                <div className="chat-agent-list-item-unread-indicator">
                                    {chat.unread}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </List.Item>
        );
    };

    // FIXED: File attachments component
    const FileAttachments = () => {
        if (fileList.length === 0) return null;

        return (
            <div className="chat-agent-file-attachments-container">
                <div className="chat-agent-file-attachments-header">
                    <Text strong className="chat-agent-file-attachments-title">
                        Attachments ({fileList.length})
                    </Text>
                    <Button
                        type="text"
                        size="small"
                        onClick={() => setFileList([])}
                        className="chat-agent-file-attachments-clear-button"
                    >
                        Clear all
                    </Button>
                </div>
                <div className="chat-agent-file-attachments-list">
                    {fileList.map((file, index) => (
                        <div
                            key={file.uid || index}
                            className="chat-agent-file-attachment-item"
                        >
                            <div className="chat-agent-file-attachment-icon">
                                {getFileIcon(file)}
                            </div>
                            <div className="chat-agent-file-attachment-details">
                                <Text className="chat-agent-file-attachment-name">
                                    {file.name}
                                </Text>
                                <Text type="secondary" className="chat-agent-file-attachment-size">
                                    {formatFileSize(file.size)}
                                </Text>
                            </div>
                            <Button
                                type="text"
                                size="small"
                                icon={<DeleteOutlined className="chat-agent-file-attachment-delete-icon" />}
                                onClick={() => handleFileRemove(file)}
                                className="chat-agent-file-attachment-delete-button"
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const EmojiPickerContent = () => (
        <div className="chat-agent-emoji-picker">
            {commonEmojis.map((emoji, index) => (
                <Button
                    key={index}
                    type="text"
                    onClick={() => handleEmojiClick(emoji)}
                    className="chat-agent-emoji-button"
                >
                    {emoji}
                </Button>
            ))}
        </div>
    );

    // FIXED: Simple Message Input Area for Agent - Left-to-right typing
    const MessageInputArea = () => {
        return (
            <div className="chat-agent-message-input-container">
                <div className="chat-agent-message-input-wrapper">
                    {/* Emoji Button */}
                    <Popover
                        content={<EmojiPickerContent />}
                        trigger="click"
                        open={emojiPickerVisible}
                        onOpenChange={setEmojiPickerVisible}
                        placement="topLeft"
                    >
                        <Button
                            type="text"
                            icon={<SmileOutlined />}
                            className="chat-agent-emoji-toggle-button"
                        />
                    </Popover>

                    {/* File Upload Button */}
                    <Upload
                        beforeUpload={beforeUpload}
                        fileList={fileList}
                        multiple
                        showUploadList={false}
                        accept="image/*,video/*,.pdf,.doc,.docx,.txt,.xls,.xlsx"
                    >
                        <Button
                            type="text"
                            icon={<PaperClipOutlined />}
                            className="chat-agent-file-upload-button"
                        />
                    </Upload>

                    {/* FIXED: TextArea with explicit left-to-right */}
                    <Input.TextArea
                        ref={textAreaRef}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onPressEnter={(e) => {
                            if (!e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                        placeholder={`Message ${currentClient?.firstName || activeChatData?.name || 'Client'}...`}
                        disabled={sendingMessage}
                        autoSize={{ minRows: 1, maxRows: 4 }}
                        className="chat-agent-message-textarea"
                        dir="ltr" // HTML attribute for direction
                        autoFocus={!!activeChatData}
                    />

                    {/* Like Button */}
                    <Button
                        type="text"
                        icon={<LikeOutlined />}
                        onClick={handleLikeMessage}
                        disabled={!activeChatData || sendingMessage}
                        className="chat-agent-like-button"
                    />

                    {/* Send Button */}
                    <Button
                        type="primary"
                        icon={sendingMessage ? <LoadingOutlined /> : <SendOutlined />}
                        onClick={handleSendMessage}
                        disabled={
                            (!newMessage.trim() && fileList.length === 0) ||
                            !activeChatData ||
                            sendingMessage
                        }
                        loading={sendingMessage}
                        className="chat-agent-send-button"
                    />
                </div>
            </div>
        );
    };

    // UPDATED: CHAT HEADER with Client Info and Property Details
    const ChatHeader = () => {
        if (!activeChatData) return null;

        return (
            <div className="chat-agent-header">
                <div className="chat-agent-header-content">
                    <Space size="small" className="chat-agent-header-left">
                        <Button
                            type="text"
                            icon={<LeftOutlined />}
                            onClick={() => setSidebarVisible(true)}
                            className="chat-agent-header-back-button"
                        />
                        {/* FIXED: Use client's profile picture in avatar */}
                        <Avatar
                            size={48}
                            src={currentClient?.profilePictureUrl}
                            className="chat-agent-header-avatar"
                            onError={(e) => {
                                e.target.src = '/default-avatar.png';
                            }}
                        >
                            {currentClient?.firstName?.charAt(0) || activeChatData?.name?.charAt(0) || 'C'}
                        </Avatar>
                        <div className="chat-agent-header-info">
                            {/* Client Name */}
                            <Title level={4} className="chat-agent-header-title">
                                {currentClient?.fullName || activeChatData?.name}
                            </Title>

                            {/* WebSocket Connection Status */}
                            <div className="chat-agent-header-connection-status">
                                <div className={`chat-agent-header-connection-dot ${isOnline ? 'chat-agent-header-connection-dot-online' : 'chat-agent-header-connection-dot-offline'}`} />
                                <Text type="secondary" className="chat-agent-header-connection-text">
                                    {isOnline ? 'Real-time connected' : 'Connecting...'}
                                </Text>
                            </div>

                            {/* Property Title and Address */}
                            {propertyInfo && (
                                <Text className="chat-agent-header-property-info">
                                    {propertyInfo.title} • {propertyInfo.address}
                                </Text>
                            )}

                            {/* Client Contact Info */}
                            {currentClient && (
                                <div className="chat-agent-header-contact-info">
                                    {currentClient.email && (
                                        <div className="chat-agent-header-contact-item">
                                            <MailOutlined className="chat-agent-header-contact-icon" />
                                            <Text type="secondary" className="chat-agent-header-contact-text">
                                                {currentClient.email}
                                            </Text>
                                        </div>
                                    )}
                                    {currentClient.cellPhoneNo && (
                                        <div className="chat-agent-header-contact-item">
                                            <PhoneOutlined className="chat-agent-header-contact-icon" />
                                            <Text type="secondary" className="chat-agent-header-contact-text">
                                                {currentClient.cellPhoneNo}
                                            </Text>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </Space>
                </div>
            </div>
        );
    };

    // Auto-reload indicator (optional - can remove to reduce blinking)
    const AutoReloadIndicator = () => (
        <div className="chat-agent-auto-reload-indicator">
            <Text type="secondary" className="chat-agent-auto-reload-text">
                Auto-updates every 30s • Last: {formatChatTime(new Date(lastUpdate))}
            </Text>
        </div>
    );

    // FACEBOOK-STYLE CHAT LIST
    const chatListContent = (
        <Card
            className="chat-agent-sidebar-card"
            bodyStyle={{
                padding: 0,
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            {/* Header */}
            <div className="chat-agent-sidebar-header">
                <div className="chat-agent-sidebar-title-container">
                    <Title level={4} className="chat-agent-sidebar-title">
                        Client Chats
                    </Title>
                    <Button
                        type="text"
                        icon={<MoreOutlined />}
                        className="chat-agent-sidebar-menu-button"
                    />
                </div>
                <Search
                    placeholder="Search client messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="chat-agent-sidebar-search"
                />
            </div>

            {/* Tabs */}
            <div className="chat-agent-sidebar-tabs-container">
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    size="small"
                    items={[
                        { key: 'all', label: 'All Chats' },
                        { key: 'unread', label: 'Unread' },
                    ]}
                    className="chat-agent-sidebar-tabs"
                />
            </div>

            {/* Chat List */}
            <div className="chat-agent-sidebar-chat-list">
                {loadingChats ? (
                    <div className="chat-agent-sidebar-loading">
                        <Spin size="small" />
                        <Text type="secondary" className="chat-agent-sidebar-loading-text">
                            Loading client chats...
                        </Text>
                    </div>
                ) : filteredChats.length > 0 ? (
                    <List
                        dataSource={filteredChats}
                        renderItem={(chat) => <ChatListItem chat={chat} />}
                        className="chat-agent-sidebar-list"
                    />
                ) : (
                    <div className="chat-agent-sidebar-empty">
                        <WechatOutlined className="chat-agent-sidebar-empty-icon" />
                        <Text type="secondary" className="chat-agent-sidebar-empty-text">
                            {searchQuery ? 'No client chats match your search' : 'No client chats available'}
                        </Text>
                    </div>
                )}
            </div>
        </Card>
    );

    return (
        <div className="chat-agent-container">
            <Row gutter={0} className="chat-agent-row">
                {/* Sidebar - Hidden on mobile */}
                <Col xs={0} md={6} lg={5} className="chat-agent-sidebar-col">
                    {chatListContent}
                </Col>

                {/* Main Chat Area */}
                <Col xs={24} md={18} lg={19} className="chat-agent-main-col">
                    <Card
                        className="chat-agent-main-card"
                        bodyStyle={{
                            padding: 0,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            margin: 0
                        }}
                    >
                        {activeChatData ? (
                            <>
                                {/* UPDATED CHAT HEADER with Client and Property Info */}
                                <ChatHeader />

                                {/* Property Information Card */}
                                {propertyInfo && <PropertyInfoCard property={propertyInfo} />}

                                {/* Messages Area - Facebook Style */}
                                <div className="chat-agent-messages-area">
                                    {loadingMessages ? (
                                        <div className="chat-agent-messages-loading">
                                            <Spin size="small" />
                                            <Text type="secondary" className="chat-agent-messages-loading-text">
                                                Loading messages...
                                            </Text>
                                        </div>
                                    ) : activeChatData.messages && activeChatData.messages.length > 0 ? (
                                        <>
                                            {activeChatData.messages.map(message => (
                                                <MessageBubble key={message.id} message={message} />
                                            ))}
                                            <div ref={messagesEndRef} />
                                        </>
                                    ) : (
                                        <div className="chat-agent-no-messages">
                                            <WechatOutlined className="chat-agent-no-messages-icon" />
                                            <Text className="chat-agent-no-messages-title">
                                                No messages yet. Start a conversation! 💬
                                            </Text>
                                            {currentClient && (
                                                <Text className="chat-agent-no-messages-subtitle">
                                                    You're chatting with {currentClient.fullName}, your client for this property.
                                                </Text>
                                            )}
                                            <Text className="chat-agent-no-messages-warning">
                                                {isOnline ? '✅ Real-time messaging active' : '🔄 Connecting to real-time service...'}
                                            </Text>
                                        </div>
                                    )}
                                </div>

                                <FileAttachments />

                                {/* FIXED: Message Input Area with LTR typing */}
                                <MessageInputArea />
                            </>
                        ) : (
                            <div className="chat-agent-no-active-chat">
                                <WechatOutlined className="chat-agent-no-active-chat-icon" />
                                <Title level={3} className="chat-agent-no-active-chat-title">
                                    {chats.length === 0 ? 'No client chats yet 💭' : 'Select a client chat to start messaging 💭'}
                                </Title>
                                <Text className="chat-agent-no-active-chat-text">
                                    {chats.length === 0
                                        ? 'Clients will appear here when they start conversations about your properties'
                                        : 'Choose a client conversation from the list to begin'}
                                </Text>
                                {isOnline && (
                                    <Text className="chat-agent-no-active-chat-connection">
                                        ✅ Real-time messaging ready
                                    </Text>
                                )}
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>

            {/* Modals and Drawers */}
            <Modal
                open={previewVisible}
                footer={null}
                onCancel={() => setPreviewVisible(false)}
                width="auto"
                className="chat-agent-image-preview-modal"
                style={{ maxWidth: '90vw' }}
            >
                <img alt="Preview" className="chat-agent-image-preview" src={previewImage} />
            </Modal>

            <Drawer
                title="Client Chats"
                placement="left"
                onClose={() => setSidebarVisible(false)}
                open={sidebarVisible}
                width="100%"
                className="chat-agent-mobile-drawer"
                styles={{
                    body: { padding: 0 },
                    header: { background: '#ffffff', borderBottom: '1px solid #e4e6eb' }
                }}
            >
                {chatListContent}
            </Drawer>
        </div>
    );
};

export default ChatPageAgent;