// ChatPage.jsx - FIXED VERSION - Continuous typing + Property images
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Row, Col, Card, Input, Avatar, Typography, List, Badge, Button, Space,
    Tabs, message, Drawer, Popover, Upload, Modal, Tag,
    Tooltip, Alert, Dropdown, Descriptions, Rate, Divider, Spin
} from 'antd';
import {
    SearchOutlined, MoreOutlined, WechatOutlined,
    SendOutlined, InfoCircleOutlined,
    LeftOutlined, SmileOutlined, EyeOutlined,
    PaperClipOutlined, FileImageOutlined, FileOutlined,
    PlayCircleOutlined, DeleteOutlined, UserOutlined,
    TeamOutlined, MessageOutlined, VideoCameraOutlined,
    PhoneOutlined, EllipsisOutlined, LikeOutlined,
    HomeOutlined, StarOutlined, MailOutlined,
    CalendarOutlined, EnvironmentOutlined, LoadingOutlined,
    PlusOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import chatService from '../Employeesportal/AdminPortal/Convo/chatService';
import authService from '../Authpage/Services/LoginAuth';
import propertyService from '../Employeesportal/AdminPortal/Creation_Property/services/propertyService';
import agentService from '../Employeesportal/AdminPortal/Creation_Agent/Services/AgentService';
import ratingScheduleService from '../Employeesportal/AdminPortal/Ratings/RatingScheduleServices';
import './ChatPage.scss'; // Import SCSS file

const { Search } = Input;
const { TextArea } = Input;
const { Title, Text } = Typography;

const ChatPage = ({ propertyChatData }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // State management
    const [typingUsers, setTypingUsers] = useState({});
    const [isOnline, setIsOnline] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');

    // Chat states
    const [searchQuery, setSearchQuery] = useState('');
    const [activeChat, setActiveChat] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
    const [fileList, setFileList] = useState([]);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(Date.now());
    const [refreshInterval, setRefreshInterval] = useState(15000);
    const [isSending, setIsSending] = useState(false);
    const [currentAgent, setCurrentAgent] = useState(null);
    const [propertyInfo, setPropertyInfo] = useState(null);
    const [loadingAgent, setLoadingAgent] = useState(false);
    const [agentRatingSummary, setAgentRatingSummary] = useState(null);
    const [chats, setChats] = useState([]);
    const [hasInitialized, setHasInitialized] = useState(false);
    const [isCreatingChat, setIsCreatingChat] = useState(false);

    // NEW: Track pending chat creation
    const [isPendingChat, setIsPendingChat] = useState(false);

    // FIXED: Use a simple ref for the textarea instead of state for typing
    const textAreaRef = useRef(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    // Get current user info
    const getCurrentUserInfo = () => {
        try {
            const userData = localStorage.getItem('user');
            if (userData) {
                const user = JSON.parse(userData);
                console.log('📱 User from localStorage:', user);
                return user;
            }

            if (authService.getCurrentUser && typeof authService.getCurrentUser === 'function') {
                const authUser = authService.getCurrentUser();
                console.log('🔐 User from authService:', authUser);
                return authUser;
            }

            console.warn('❌ No user found in localStorage or authService');
            return null;
        } catch (error) {
            console.error('💥 Error getting user info:', error);
            return null;
        }
    };

    const currentUser = getCurrentUserInfo();
    const ClientID = currentUser?.userId || currentUser?.id || currentUser?.baseMemberId || currentUser?.clientId;

    console.log('👤 Current User:', currentUser);
    console.log('🆔 ClientID:', ClientID);

    // FIXED: Enhanced time formatting
    const formatMessageTime = (date) => {
        if (!date) return 'Just now';
        try {
            const messageDate = new Date(date);
            const now = new Date();
            if (isNaN(messageDate.getTime())) return 'Just now';

            const diffMs = now - messageDate;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);

            if (diffMins < 1) return 'Just now';
            if (diffMins < 60) return `${diffMins}m ago`;
            if (diffHours < 24) return `${diffHours}h ago`;
            if (diffDays === 1) return 'Yesterday';
            if (diffDays < 7) return `${diffDays}d ago`;

            return messageDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: diffDays > 365 ? 'numeric' : undefined
            });
        } catch (error) {
            console.error('Error formatting time:', error);
            return 'Just now';
        }
    };

    // FIXED: Chat time formatting
    const formatChatTime = (date) => {
        if (!date) return 'Now';
        try {
            const messageDate = new Date(date);
            const now = new Date();
            if (isNaN(messageDate.getTime())) return 'Now';

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
            console.error('Error formatting chat time:', error);
            return 'Now';
        }
    };

    // FIXED: Enhanced loadExistingChats with property image handling
    const loadExistingChats = async () => {
        if (!ClientID || ClientID === 0) {
            console.error('❌ ClientID not available');
            message.error('Please log in to access chats');
            return;
        }

        try {
            console.log(`🔍 Loading chats for ClientID:`, ClientID);
            setIsLoading(true);

            let existingChats = [];

            try {
                const response = await chatService.getUserChats();
                if (Array.isArray(response)) {
                    existingChats = response;
                    console.log(`✅ Found ${existingChats.length} chats via API`);
                } else if (response?.data && Array.isArray(response.data)) {
                    existingChats = response.data;
                    console.log(`✅ Found ${existingChats.length} chats via API response.data`);
                } else {
                    console.warn('⚠️ Unexpected response format from service:', response);
                    existingChats = [];
                }
            } catch (error) {
                console.error('❌ Error loading chats from API:', error);
                existingChats = [];
            }

            // Process chats with enhanced property image handling
            const processedChats = await Promise.all(
                existingChats.map(async (chat) => {
                    try {
                        const lastMessage = chat.lastMessage ||
                            (chat.messages && chat.messages.length > 0
                                ? chat.messages[chat.messages.length - 1]?.content
                                : 'No messages yet');

                        const lastMessageTime = chat.lastMessageAt ||
                            (chat.messages && chat.messages.length > 0
                                ? chat.messages[chat.messages.length - 1]?.sentAt
                                : chat.updatedAt || chat.createdAt);

                        // If chat already has property data from backend, use it
                        let propertyData = chat.property || null;

                        // If propertyId exists but no property data, fetch it
                        if (chat.propertyId && !propertyData) {
                            try {
                                propertyData = await fetchPropertyData(chat.propertyId);
                            } catch (propertyError) {
                                console.error('❌ Error fetching property data:', propertyError);
                            }
                        }

                        return {
                            ...chat,
                            lastMessage: lastMessage,
                            lastMessageTime: lastMessageTime,
                            property: propertyData
                        };
                    } catch (chatError) {
                        console.error('❌ Error processing individual chat:', chatError);
                        return chat;
                    }
                })
            );

            // Transform chats for UI
            const transformedChats = processedChats.map(chat => {
                try {
                    // Find other participant (not current user)
                    const otherParticipant = chat.participants?.find(p => {
                        const participantId = p.baseMemberId || p.userId || p.id;
                        return participantId && parseInt(participantId) !== parseInt(ClientID);
                    });

                    const lastMessage = chat.lastMessage || 'No messages yet';
                    const lastMessageTime = chat.lastMessageTime || chat.updatedAt || chat.createdAt;

                    // Sort messages chronologically - OLDEST FIRST
                    const rawMessages = chat.messages || [];
                    const sortedMessages = [...rawMessages].sort((a, b) => {
                        const timeA = new Date(a.sentAt || a.createdAt || a.time);
                        const timeB = new Date(b.sentAt || b.createdAt || b.time);
                        return timeA - timeB; // Ascending order (oldest first)
                    });

                    // Transform messages for UI
                    const transformedMessages = sortedMessages.map(msg => ({
                        id: msg.id || msg.messageId || Date.now(),
                        text: msg.content || msg.text || '',
                        sender: (msg.senderId === parseInt(ClientID) || msg.sender === 'me') ? 'me' : 'other',
                        time: formatMessageTime(new Date(msg.sentAt || msg.createdAt || msg.time)),
                        files: msg.files || [],
                        senderId: msg.senderId || parseInt(ClientID),
                        isCurrentUser: msg.senderId === parseInt(ClientID) || msg.sender === 'me',
                        sentAt: msg.sentAt || msg.createdAt || new Date().toISOString(),
                        timestamp: new Date(msg.sentAt || msg.createdAt || msg.time).getTime()
                    }));

                    // Create display name
                    let displayName = chat.name;
                    if (!displayName) {
                        displayName = otherParticipant?.member?.fullName ||
                            otherParticipant?.name ||
                            otherParticipant?.userName ||
                            'Unknown Chat';
                    }

                    // Add property title to display name if available
                    if (chat.property?.title && !displayName?.includes(chat.property.title)) {
                        displayName = `${displayName} - ${chat.property.title}`;
                    }

                    // Get property image - prioritize property image over agent avatar
                    const propertyImage = chat.property?.mainImage ||
                        chat.property?.imageUrl ||
                        '/default-property.jpg';

                    // Agent avatar as fallback
                    const agentAvatar = otherParticipant?.member?.profileImage ||
                        otherParticipant?.profileImage ||
                        otherParticipant?.avatar ||
                        '/default-avatar.png';

                    // Calculate unread count
                    const unreadCount = chat.participants?.find(p => {
                        const participantId = p.baseMemberId || p.userId || p.id;
                        return participantId && parseInt(participantId) === parseInt(ClientID);
                    })?.unreadCount || 0;

                    return {
                        id: chat.id?.toString() || `chat-${Date.now()}`,
                        backendChatId: chat.id,
                        name: displayName,
                        lastMessage: lastMessage,
                        time: formatChatTime(new Date(lastMessageTime)),
                        unread: unreadCount,
                        type: chat.chatType || 'direct',
                        avatar: agentAvatar,
                        propertyImage: propertyImage, // Store property image separately
                        isAgentChat: chat.chatType === 'property_chat' || chat.isAgentChat || false,
                        agentData: otherParticipant?.member || otherParticipant || null,
                        propertyData: chat.property || null,
                        propertyId: chat.propertyId,
                        messages: transformedMessages,
                        participants: chat.participants || [],
                        otherParticipant: otherParticipant,
                        createdAt: chat.createdAt,
                        updatedAt: chat.updatedAt,
                        lastMessageAt: lastMessageTime,
                        isPending: false
                    };
                } catch (transformError) {
                    console.error('❌ Error transforming chat:', transformError, chat);
                    return {
                        id: chat.id?.toString() || `error-chat-${Date.now()}`,
                        backendChatId: chat.id,
                        name: 'Error Loading Chat',
                        lastMessage: 'Unable to load messages',
                        time: 'Now',
                        unread: 0,
                        type: 'direct',
                        avatar: '/default-avatar.png',
                        propertyImage: '/default-property.jpg',
                        isAgentChat: false,
                        propertyData: null,
                        messages: [],
                        participants: [],
                        isPending: false
                    };
                }
            });

            console.log('🎉 Successfully transformed chats:', transformedChats.length);
            setChats(transformedChats);
            return transformedChats;

        } catch (error) {
            console.error('💥 Critical error in loadExistingChats:', error);
            message.error('Failed to load chats. Please try refreshing the page.');
            setChats([]);
            return [];
        } finally {
            setIsLoading(false);
            setHasInitialized(true);
        }
    };

    // FIXED: Handle chat selection
    const handleChatSelect = async (chatId) => {

        setActiveChat(chatId);

        const selectedChat = chats.find(chat => chat.id === chatId);
        if (!selectedChat) return;

        // Reset current data
        setCurrentAgent(null);
        setPropertyInfo(null);
        setAgentRatingSummary(null);
        setIsPendingChat(selectedChat.isPending || false);

        if (selectedChat.isPending) {
            // For pending chats, use the pending data
            if (selectedChat.propertyData) {
                setPropertyInfo(selectedChat.propertyData);
            }
            if (selectedChat.agentData) {
                setCurrentAgent(selectedChat.agentData);

                // Try to fetch agent rating
                try {
                    const ratingSummary = await ratingScheduleService.getRatingSummary(selectedChat.agentData.baseMemberId);
                    setAgentRatingSummary(ratingSummary);
                } catch (ratingError) {
                    console.error('Error fetching agent rating:', ratingError);
                }
            }
        } else {
            // For existing chats, fetch data as before
            if (selectedChat.participants) {
                await fetchAgentData(selectedChat.participants, ClientID);
            }

            // Fetch property data
            if (selectedChat.propertyId) {
                await fetchPropertyData(selectedChat.propertyId);
            } else if (selectedChat.propertyData) {
                setPropertyInfo(selectedChat.propertyData);
            }
        }

        setSidebarVisible(false);

        // Scroll to bottom after chat selection
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);

        // Focus the input after selecting chat
        setTimeout(() => {
            if (textAreaRef.current) {
                textAreaRef.current.focus();
            }
        }, 200);
    };

    // FIXED: Enhanced agent data fetching
    const fetchAgentData = async (participants, currentUserId) => {
        if (!participants || !Array.isArray(participants)) {
            console.warn('❌ No participants provided');
            return null;
        }

        // Find agent participant (not current user)
        const agentParticipant = participants.find(p => {
            const participantId = p.baseMemberId || p.userId || p.id;
            return participantId && parseInt(participantId) !== parseInt(currentUserId);
        });

        if (!agentParticipant) {
            console.warn('❌ No agent participant found');
            return null;
        }

        const agentId = agentParticipant.baseMemberId || agentParticipant.userId || agentParticipant.id;

        if (!agentId) {
            console.warn('❌ No agent ID found in participant');
            return null;
        }

        try {
            setLoadingAgent(true);
            console.log('🔍 Fetching agent data for ID:', agentId);

            let agentData;

            // Try multiple methods to get agent data
            try {
                agentData = await agentService.getAgent(agentId);
            } catch (error) {
                console.warn('🔄 First method failed, trying getAgentByBaseMemberId:', error);
                try {
                    agentData = await agentService.getAgentByBaseMemberId(agentId);
                } catch (secondError) {
                    console.warn('🔄 Second method failed, trying fallback:', secondError);
                    agentData = await agentService.getAgentWithFallback(agentId);
                }
            }

            if (agentData) {
                const processedAgent = {
                    id: agentData.id || agentId,
                    baseMemberId: agentData.baseMemberId || agentData.id,
                    firstName: agentData.firstName || 'Unknown',
                    lastName: agentData.lastName || 'Agent',
                    fullName: agentData.firstName && agentData.lastName
                        ? `${agentData.firstName} ${agentData.lastName}`
                        : agentData.fullName || 'Unknown Agent',
                    email: agentData.email || '',
                    profilePictureUrl: agentData.profilePictureUrl || agentData.profileImage || agentParticipant.member?.profileImage || agentParticipant.profileImage || '',
                    cellPhoneNo: agentData.cellPhoneNo || agentData.phone || '',
                    licenseNumber: agentData.licenseNumber || '',
                    isVerified: agentData.isVerified || false,
                    brokerageName: agentData.brokerageName || agentData.company || 'Real Estate Company',
                    specialization: agentData.specialization || [],
                    yearsOfExperience: agentData.yearsOfExperience || 0,
                    languages: agentData.languages || ['English'],
                    rating: agentData.rating || 4.5,
                    reviewCount: agentData.reviewCount || 24
                };

                console.log('✅ Processed agent data:', processedAgent);
                setCurrentAgent(processedAgent);

                // Fetch agent rating summary
                try {
                    const ratingSummary = await ratingScheduleService.getRatingSummary(agentId);
                    setAgentRatingSummary(ratingSummary);
                    console.log('✅ Agent rating summary:', ratingSummary);
                } catch (ratingError) {
                    console.error('❌ Error fetching agent rating summary:', ratingError);
                    setAgentRatingSummary({
                        averageRating: processedAgent.rating || 4.5,
                        totalRatings: processedAgent.reviewCount || 24
                    });
                }

                return processedAgent;
            }

            return null;
        } catch (error) {
            console.error('❌ Error fetching agent data:', error);
            // Create fallback agent from participant data
            const fallbackAgent = {
                id: agentId,
                baseMemberId: agentId,
                firstName: agentParticipant.member?.firstName || 'Unknown',
                lastName: agentParticipant.member?.lastName || 'Agent',
                fullName: agentParticipant.member?.fullName || 'Unknown Agent',
                email: agentParticipant.member?.email || '',
                profilePictureUrl: agentParticipant.member?.profileImage || agentParticipant.member?.profilePicture || agentParticipant.profileImage || agentParticipant.avatar || '/default-avatar.png',
                cellPhoneNo: agentParticipant.member?.cellPhoneNo || '',
                licenseNumber: agentParticipant.member?.licenseNumber || '',
                isVerified: agentParticipant.member?.isVerified || false,
                brokerageName: agentParticipant.member?.brokerageName || 'Real Estate Company',
                specialization: agentParticipant.member?.specialization || [],
                yearsOfExperience: agentParticipant.member?.yearsOfExperience || 0,
                languages: agentParticipant.member?.languages || ['English'],
                rating: 4.5,
                reviewCount: 24
            };
            setCurrentAgent(fallbackAgent);
            setAgentRatingSummary({
                averageRating: 4.5,
                totalRatings: 24
            });
            return fallbackAgent;
        } finally {
            setLoadingAgent(false);
        }
    };

    // FIXED: Enhanced property data fetching
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

    // Create chat on first message only
    const createNewChat = async (propertyChatData) => {
        if (!propertyChatData || !ClientID) {
            console.error('❌ Missing data for chat creation');
            return null;
        }

        try {
            setIsCreatingChat(true);
            console.log('🆕 Creating new property chat:', propertyChatData);

            const { property, agent } = propertyChatData;

            // Prepare chat creation data
            const chatCreationData = {
                name: `${property.title} - ${agent.firstName} ${agent.lastName}`,
                chatType: 'property_chat',
                propertyId: property.id,
                participantIds: [
                    parseInt(ClientID), // Current user
                    parseInt(agent.baseMemberId) // Agent
                ]
            };

            console.log('📤 Creating chat with data:', chatCreationData);

            // Create the chat via API
            const newChat = await chatService.createChat(chatCreationData);
            console.log('✅ New chat created:', newChat);

            return newChat;
        } catch (error) {
            console.error('❌ Error creating new chat:', error);
            throw error;
        } finally {
            setIsCreatingChat(false);
        }
    };

    // FIXED: Enhanced send message function with chat creation on first message only
    const handleSendMessage = async () => {
        if ((!newMessage || newMessage.trim() === '') && fileList.length === 0) {
            message.warning('Please enter a message or attach a file');
            return;
        }

        const activeChatData = chats.find(chat => chat.id === activeChat);
        if (!activeChatData) {
            message.error('No active chat selected');
            return;
        }

        try {
            setIsSending(true);

            // Check if this is a pending chat (needs to be created)
            if (activeChatData.isPending) {
                console.log('💬 First message in pending chat - creating chat first');

                try {
                    // Create the chat first
                    const newChat = await createNewChat({
                        property: activeChatData.propertyData,
                        agent: activeChatData.agentData
                    });

                    if (!newChat) {
                        throw new Error('Failed to create chat');
                    }

                    console.log('✅ Chat created successfully:', newChat);

                    // Update the pending chat with the real backend ID
                    const updatedChats = chats.map(chat =>
                        chat.id === activeChat
                            ? {
                                ...chat,
                                backendChatId: newChat.id,
                                id: newChat.id.toString(),
                                isPending: false,
                                name: newChat.name || chat.name
                            }
                            : chat
                    );

                    setChats(updatedChats);

                    // Update active chat ID
                    setActiveChat(newChat.id.toString());

                    // Now send the message
                    await sendMessageToChat(newChat.id);

                } catch (createError) {
                    console.error('❌ Failed to create chat:', createError);
                    message.error('Failed to create chat. Please try again.');
                    return;
                }
            } else {
                // For existing chats, just send the message
                await sendMessageToChat(activeChatData.backendChatId);
            }

            // After sending, focus back on the input
            setTimeout(() => {
                if (textAreaRef.current) {
                    textAreaRef.current.focus();
                }
            }, 100);

        } catch (error) {
            console.error('💥 Error sending message:', error);
            message.error('Failed to send message: ' + (error.message || 'Unknown error'));
        } finally {
            setIsSending(false);
        }
    };

    // Helper function to send message to an existing chat
    const sendMessageToChat = async (backendChatId) => {
        let uploadedFiles = [];

        // Upload files if any
        if (fileList.length > 0) {
            message.info(`Uploading ${fileList.length} file(s)...`);
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

        // Get recipient ID from participants
        const activeChatData = chats.find(chat => chat.id === activeChat);
        const recipientId = activeChatData.participants?.find(p =>
            p.baseMemberId !== parseInt(ClientID)
        )?.baseMemberId;

        // Use the correct payload structure
        const messagePayload = {
            content: newMessage.trim(),
            messageType: uploadedFiles.length > 0 ? 'file' : 'text',
            recipientId: recipientId || null,
            files: uploadedFiles
        };

        console.log('📤 Sending message payload:', messagePayload);

        // Call sendMessage with correct parameters
        await chatService.sendMessage(backendChatId, messagePayload);

        // Update UI immediately for better UX
        const newMessageObj = {
            id: Date.now(),
            text: newMessage.trim(),
            sender: 'me',
            time: 'Just now',
            files: uploadedFiles,
            senderId: parseInt(ClientID),
            isCurrentUser: true,
            sentAt: new Date().toISOString(),
            timestamp: Date.now()
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

        // Scroll to bottom
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    // Create a pending chat (not saved to backend yet)
    const createPendingChat = (propertyChatData) => {
        console.log('🔄 Creating pending chat for display');

        const pendingChatId = `pending-chat-${Date.now()}`;

        // Create pending chat object
        const pendingChat = {
            id: pendingChatId,
            backendChatId: null,
            name: `${propertyChatData.property.title} - ${propertyChatData.agent.firstName} ${propertyChatData.agent.lastName}`,
            lastMessage: 'Start a conversation about this property...',
            time: 'Now',
            unread: 0,
            type: 'property_chat',
            avatar: propertyChatData.agent.profileImage || '/default-avatar.png',
            propertyImage: propertyChatData.property.mainImage || '/default-property.jpg',
            isAgentChat: true,
            agentData: propertyChatData.agent,
            propertyData: propertyChatData.property,
            propertyId: propertyChatData.property.id,
            messages: [], // Empty messages for new chat
            participants: [
                {
                    baseMemberId: parseInt(ClientID),
                    member: {
                        id: parseInt(ClientID),
                        fullName: currentUser?.fullName || 'You',
                        profileImage: currentUser?.profileImage
                    }
                },
                {
                    baseMemberId: parseInt(propertyChatData.agent.baseMemberId),
                    member: propertyChatData.agent
                }
            ],
            isPending: true,
            pendingChatData: propertyChatData
        };

        return pendingChat;
    };

    // Handle incoming chat data from PropertyLocation
    const handleIncomingChatData = async (propertyChatData) => {
        if (!propertyChatData) return;

        console.log('📍 Handling incoming chat data:', propertyChatData);

        // Set property and agent info immediately for display
        if (propertyChatData.property) {
            setPropertyInfo(propertyChatData.property);
        }
        if (propertyChatData.agent) {
            setCurrentAgent(propertyChatData.agent);

            // Fetch agent rating
            try {
                const ratingSummary = await ratingScheduleService.getRatingSummary(propertyChatData.agent.baseMemberId);
                setAgentRatingSummary(ratingSummary);
            } catch (ratingError) {
                console.error('Error fetching agent rating:', ratingError);
            }
        }

        // Wait for chats to load first
        if (!hasInitialized) {
            console.log('🔄 Initializing chats first...');
            await loadExistingChats();
        }

        // Check if a chat already exists for this property and agent
        const existingChat = chats.find(chat =>
            chat.propertyId === propertyChatData.property.id &&
            chat.participants?.some(p =>
                p.baseMemberId === parseInt(propertyChatData.agent.baseMemberId)
            ) &&
            !chat.isPending
        );

        if (existingChat) {
            console.log('✅ Found existing chat:', existingChat.id);
            await handleChatSelect(existingChat.id);
        } else {
            console.log('🆕 No existing chat found, creating pending chat');

            // Create a pending chat (not saved to backend yet)
            const pendingChat = createPendingChat(propertyChatData);

            // Add to chats list
            setChats(prev => [...prev, pendingChat]);

            // Select the pending chat
            setActiveChat(pendingChat.id);
            setIsPendingChat(true);

            // Show info message
            message.info('New chat started. Send your first message to save this conversation!');

            // Focus the input for new chat
            setTimeout(() => {
                if (textAreaRef.current) {
                    textAreaRef.current.focus();
                }
            }, 300);
        }
    };

    const handleInputChange = useCallback((e) => {
        setNewMessage(e.target.value);
    }, []);

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Handle property chat data from navigation
    useEffect(() => {
        if (location.state?.propertyChat) {
            console.log('📍 Property chat data from navigation:', location.state.propertyChat);
            handleIncomingChatData(location.state.propertyChat);
        }
    }, [location.state]);

    // Initial load
    useEffect(() => {
        if (ClientID && !hasInitialized) {
            loadExistingChats();
        }
    }, [ClientID]);

    // Auto-select first chat when chats are loaded
    useEffect(() => {
        if (chats.length > 0 && !activeChat && hasInitialized && !location.state?.propertyChat) {
            console.log('🔄 Auto-selecting first chat:', chats[0].id);
            handleChatSelect(chats[0].id);
        }
    }, [chats, activeChat, hasInitialized, location.state]);

    // Focus the input when active chat changes
    useEffect(() => {
        if (activeChat && textAreaRef.current) {
            setTimeout(() => {
                textAreaRef.current?.focus();
            }, 200);
        }
    }, [activeChat]);

    // Auto-reload for new messages
    useEffect(() => {
        if (!ClientID) return;

        const intervalId = setInterval(() => {
            if (!isSending && !isCreatingChat && !isPendingChat) {
                loadExistingChats();
            }
        }, refreshInterval);

        return () => {
            clearInterval(intervalId);
        };
    }, [ClientID, refreshInterval, isSending, isCreatingChat, isPendingChat]);

    // WebSocket initialization
    useEffect(() => {
        const webSocketService = chatService.getWebSocketService();

        // Set up WebSocket event handlers
        const handleNewMessage = (messageData) => {
            console.log('🆕 Real-time message received:', messageData);
            // Handle new messages via WebSocket
            loadExistingChats(); // Reload chats to get updated messages
        };

        const handleConnectionStatus = (data) => {
            console.log('WebSocket connection status:', data.status);
            setIsOnline(data.status === 'connected');
            setConnectionStatus(data.status);
        };

        // Register event handlers
        webSocketService.on('new_message', handleNewMessage);
        webSocketService.on('connection', handleConnectionStatus);

        // Connect to WebSocket if authenticated
        if (ClientID && chatService.isAuthenticated()) {
            console.log('🔌 Initializing WebSocket connection...');
            setTimeout(() => {
                webSocketService.connect();
            }, 2000);
        }

        // Cleanup
        return () => {
            webSocketService.off('new_message', handleNewMessage);
            webSocketService.off('connection', handleConnectionStatus);
        };
    }, [ClientID]);

    // Get active chat data
    const activeChatData = chats.find(chat => chat.id === activeChat);

    // Filter chats based on search and tab
    const filteredChats = chats.filter(chat => {
        if (searchQuery && !chat.name.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }
        if (activeTab === 'unread' && chat.unread === 0) {
            return false;
        }
        return true;
    });

    // FIXED: Chat list item with PROPERTY IMAGE display
    const ChatListItem = ({ chat }) => {
        const propertyImage = chat.propertyImage || '/default-property.jpg';
        const isPending = chat.isPending;

        return (
            <List.Item
                className={`chat-page-list-item ${activeChat === chat.id ? 'chat-page-list-item-active' : ''} ${isPending ? 'chat-page-list-item-pending' : ''}`}
                onClick={() => handleChatSelect(chat.id)}
            >
                <div className="chat-page-list-item-content">
                    {/* Property Image - Always show property image for property chats */}
                    <div className="chat-page-list-item-image-container">
                        <div className="chat-page-list-item-image-wrapper">
                            <img
                                src={propertyImage}
                                alt={chat.propertyData?.title || 'Property'}
                                className="chat-page-list-item-property-image"
                                onError={(e) => {
                                    e.target.src = '/default-property.jpg';
                                }}
                            />
                            {/* Agent avatar overlay for property chats */}
                            {chat.isAgentChat && (
                                <div className="chat-page-list-item-agent-avatar-overlay">
                                    <img
                                        src={chat.avatar}
                                        alt="Agent"
                                        className="chat-page-list-item-agent-avatar"
                                        onError={(e) => {
                                            e.target.src = '/default-avatar.png';
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Pending indicator */}
                        {isPending && (
                            <div className="chat-page-list-item-pending-indicator">
                                +
                            </div>
                        )}
                    </div>

                    <div className="chat-page-list-item-text-container">
                        <div className="chat-page-list-item-header">
                            {/* Property Title */}
                            <Text strong className="chat-page-list-item-property-title">
                                {chat.propertyData?.title || 'Property Chat'}
                                {isPending && (
                                    <Tag color="orange" size="small" className="chat-page-list-item-new-tag">
                                        New
                                    </Tag>
                                )}
                            </Text>

                            {/* Time */}
                            <Text type="secondary" className="chat-page-list-item-time">
                                {chat.time}
                            </Text>
                        </div>

                        {/* Property Address */}
                        {chat.propertyData?.address && (
                            <Text className="chat-page-list-item-property-address">
                                {chat.propertyData.address}
                            </Text>
                        )}

                        {/* Agent Name */}
                        {chat.agentData?.fullName && (
                            <Text className="chat-page-list-item-agent-name">
                                with {chat.agentData.fullName}
                            </Text>
                        )}

                        {/* Last Message Preview */}
                        <Text className="chat-page-list-item-last-message">
                            {isPending ? 'Start conversation...' : chat.lastMessage}
                        </Text>
                    </div>
                </div>
            </List.Item>
        );
    };

    // FIXED: Message bubble component
    const MessageBubble = ({ message }) => {
        const hasFiles = message.files && message.files.length > 0;

        return (
            <div className={`chat-page-message-bubble-container ${message.sender === 'me' ? 'chat-page-message-bubble-container-me' : 'chat-page-message-bubble-container-other'}`}>
                <div className={`chat-page-message-bubble ${message.sender === 'me' ? 'chat-page-message-bubble-me' : 'chat-page-message-bubble-other'}`}>
                    {/* File attachments */}
                    {hasFiles && (
                        <div className="chat-page-message-files-container">
                            {message.files.map((file, index) => (
                                <div key={index} className="chat-page-message-file-item">
                                    <div className="chat-page-message-file-header">
                                        {file.fileType === 'image' ? (
                                            <FileImageOutlined className="chat-page-message-file-icon chat-page-message-file-icon-image" />
                                        ) : file.fileType === 'video' ? (
                                            <PlayCircleOutlined className="chat-page-message-file-icon chat-page-message-file-icon-video" />
                                        ) : (
                                            <FileOutlined className="chat-page-message-file-icon chat-page-message-file-icon-document" />
                                        )}
                                        <div className="chat-page-message-file-info">
                                            <div className="chat-page-message-file-name">
                                                {file.fileName}
                                            </div>
                                            <div className="chat-page-message-file-size">
                                                {file.fileSize ? formatFileSize(file.fileSize) : 'Unknown size'}
                                            </div>
                                        </div>
                                        <Button
                                            type="text"
                                            size="small"
                                            icon={<EyeOutlined />}
                                            onClick={() => window.open(file.fileUrl, '_blank')}
                                            className="chat-page-message-file-view-button"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Message text */}
                    {message.text && (
                        <div className="chat-page-message-text">
                            {message.text}
                        </div>
                    )}

                    {/* Message time */}
                    <div className="chat-page-message-time">
                        {message.time}
                    </div>
                </div>
            </div>
        );
    };

    // Helper function to format file size
    const formatFileSize = (bytes) => {
        if (!bytes) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Property Info Display Component
    const PropertyInfoCard = () => {
        if (!propertyInfo) return null;

        return (
            <div className="chat-page-property-info-container">
                <Card className="chat-page-property-info-card">
                    <div className="chat-page-property-info-content">
                        <img
                            src={propertyInfo.mainImage}
                            alt={propertyInfo.title}
                            className="chat-page-property-info-image"
                            onError={(e) => {
                                e.target.src = '/default-property.jpg';
                            }}
                        />
                        <div className="chat-page-property-info-details">
                            <Text strong className="chat-page-property-info-title">
                                {propertyInfo.title}
                            </Text>
                            <div className="chat-page-property-info-address">
                                <EnvironmentOutlined className="chat-page-property-info-address-icon" />
                                <Text type="secondary" className="chat-page-property-info-address-text">
                                    {propertyInfo.address}
                                </Text>
                            </div>
                            <div className="chat-page-property-info-features">
                                {propertyInfo.bedrooms > 0 && (
                                    <div className="chat-page-property-info-feature">
                                        <HomeOutlined className="chat-page-property-info-feature-icon" />
                                        <Text className="chat-page-property-info-feature-text">{propertyInfo.bedrooms} bed</Text>
                                    </div>
                                )}
                                {propertyInfo.bathrooms > 0 && (
                                    <div className="chat-page-property-info-feature">
                                        <UserOutlined className="chat-page-property-info-feature-icon" />
                                        <Text className="chat-page-property-info-feature-text">{propertyInfo.bathrooms} bath</Text>
                                    </div>
                                )}
                            </div>
                            <div className="chat-page-property-info-price-container">
                                <Text strong className="chat-page-property-info-price">
                                    {propertyInfo.price ? `₱${propertyInfo.price.toLocaleString()}` : 'Price not set'}
                                </Text>
                                <Tag color={propertyInfo.status === 'available' ? 'green' : 'orange'} className="chat-page-property-info-status-tag">
                                    {propertyInfo.status || 'Available'}
                                </Tag>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        );
    };

    // Chat header component
    const ChatHeader = () => {
        if (!activeChatData) return null;

        return (
            <div className="chat-page-header">
                <div className="chat-page-header-content">
                    <Space size="small" className="chat-page-header-left">
                        <Button
                            type="text"
                            icon={<LeftOutlined />}
                            onClick={() => setSidebarVisible(true)}
                            className="chat-page-header-back-button"
                        />
                        <Avatar
                            src={currentAgent?.profilePictureUrl || activeChatData?.avatar}
                            size={48}
                            className="chat-page-header-avatar"
                        >
                            {currentAgent?.firstName?.charAt(0) || 'U'}
                        </Avatar>
                        <div className="chat-page-header-info">
                            <Title level={4} className="chat-page-header-title">
                                {currentAgent?.fullName || activeChatData?.name}
                                {isPendingChat && (
                                    <Tag color="orange" size="small" className="chat-page-header-new-tag">
                                        New Chat
                                    </Tag>
                                )}
                            </Title>

                            {propertyInfo && (
                                <Text className="chat-page-header-property-info">
                                    {propertyInfo.title} • {propertyInfo.address}
                                </Text>
                            )}

                            {currentAgent && (
                                <div className="chat-page-header-rating">
                                    <Rate
                                        disabled
                                        value={agentRatingSummary?.averageRating || currentAgent.rating}
                                        className="chat-page-header-rating-stars"
                                    />
                                    <Text type="secondary" className="chat-page-header-rating-text">
                                        {(agentRatingSummary?.averageRating || currentAgent.rating)?.toFixed(1) || '5.0'}
                                        ({agentRatingSummary?.totalRatings || currentAgent.reviewCount || 0} reviews)
                                    </Text>
                                </div>
                            )}
                        </div>
                    </Space>

                    <Space>
                        {isPendingChat && (
                            <Tooltip title="This chat will be saved when you send your first message">
                                <Tag color="orange" icon={<InfoCircleOutlined />} className="chat-page-header-unsaved-tag">
                                    Unsaved Chat
                                </Tag>
                            </Tooltip>
                        )}
                    </Space>
                </div>
            </div>
        );
    };

    // Common emojis
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

    const EmojiPickerContent = () => (
        <div className="chat-page-emoji-picker">
            {commonEmojis.map((emoji, index) => (
                <Button
                    key={index}
                    type="text"
                    onClick={() => {
                        setNewMessage(prev => prev + emoji);
                        setEmojiPickerVisible(false);
                        // Focus back on textarea after adding emoji
                        setTimeout(() => {
                            if (textAreaRef.current) {
                                textAreaRef.current.focus();
                            }
                        }, 100);
                    }}
                    className="chat-page-emoji-button"
                >
                    {emoji}
                </Button>
            ))}
        </div>
    );

    // File upload handling
    const beforeUpload = (file) => {
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

        const isLt20M = file.size / 1024 / 1024 < 20;
        if (!isLt20M) {
            message.error('File must be smaller than 20MB!');
            return false;
        }

        setFileList(prev => [...prev, {
            ...file,
            uid: file.uid || Date.now(),
            type: isImage ? 'image' : isVideo ? 'video' : 'document'
        }]);

        message.success(`${file.name} added to attachments`);

        // Focus back on textarea after file selection
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

    // FIXED: Message Input Area with proper focus handling
    const MessageInputArea = () => {
        return (
            <div className="chat-page-message-input-container">
                {isPendingChat && (
                    <Alert
                        message="New Chat"
                        description="Send your first message to save this conversation"
                        type="info"
                        showIcon
                        className="chat-page-new-chat-alert"
                    />
                )}

                {/* Simplified layout without Space.Compact */}
                <div className="chat-page-message-input-wrapper">
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
                            className="chat-page-emoji-toggle-button"
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                            }}
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
                            className="chat-page-file-upload-button"
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                            }}
                        />
                    </Upload>
                    <TextArea
                        ref={textAreaRef}
                        value={newMessage}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyPress}
                        placeholder={`Message ${currentAgent?.firstName || activeChatData?.name || '...'}...`}
                        autoSize={{ minRows: 1, maxRows: 4 }}
                        bordered={false}
                        className="chat-page-message-textarea"
                        disabled={isSending}
                        onFocus={(e) => {
                       
                            e.target.focus();
                        }}
                        onClick={(e) => {
                       
                            e.stopPropagation();
                        }}
                        autoFocus={!!activeChatData}
                    />

                    {/* Send Button */}
                    <Button
                        type="primary"
                        icon={isSending ? <LoadingOutlined /> : <SendOutlined />}
                        onClick={handleSendMessage}
                        disabled={
                            (!newMessage.trim() && fileList.length === 0) ||
                            !activeChatData ||
                            isSending
                        }
                        loading={isSending}
                        className="chat-page-send-button"
                    />
                </div>
            </div>
        );
    };

    // File attachments component
    const FileAttachments = () => {
        if (fileList.length === 0) return null;

        return (
            <div className="chat-page-file-attachments-container">
                <div className="chat-page-file-attachments-header">
                    <Text strong className="chat-page-file-attachments-title">
                        Attachments ({fileList.length})
                    </Text>
                    <Button
                        type="text"
                        size="small"
                        onClick={() => setFileList([])}
                        className="chat-page-file-attachments-clear-button"
                    >
                        Clear all
                    </Button>
                </div>
                <div className="chat-page-file-attachments-list">
                    {fileList.map((file, index) => (
                        <div
                            key={file.uid || index}
                            className="chat-page-file-attachment-item"
                        >
                            <div className="chat-page-file-attachment-icon">
                                {file.type === 'image' ? (
                                    <FileImageOutlined className="chat-page-file-attachment-icon-image" />
                                ) : file.type === 'video' ? (
                                    <PlayCircleOutlined className="chat-page-file-attachment-icon-video" />
                                ) : (
                                    <FileOutlined className="chat-page-file-attachment-icon-document" />
                                )}
                            </div>
                            <div className="chat-page-file-attachment-details">
                                <Text className="chat-page-file-attachment-name">
                                    {file.name}
                                </Text>
                                <Text type="secondary" className="chat-page-file-attachment-size">
                                    {formatFileSize(file.size)}
                                </Text>
                            </div>
                            <Button
                                type="text"
                                size="small"
                                icon={<DeleteOutlined className="chat-page-file-attachment-delete-icon" />}
                                onClick={() => handleFileRemove(file)}
                                className="chat-page-file-attachment-delete-button"
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Chat list content
    const chatListContent = (
        <Card
            className="chat-page-sidebar-card"
            bodyStyle={{
                padding: 0,
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            {/* Header */}
            <div className="chat-page-sidebar-header">
                <div className="chat-page-sidebar-title-container">
                    <Title level={4} className="chat-page-sidebar-title">
                        Chats
                    </Title>
                    <Button
                        type="text"
                        icon={<MoreOutlined />}
                        className="chat-page-sidebar-menu-button"
                    />
                </div>
                <Search
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="chat-page-sidebar-search"
                />
            </div>

            {/* Tabs */}
            <div className="chat-page-sidebar-tabs-container">
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    size="small"
                    items={[
                        { key: 'all', label: 'All Chats' },
                        { key: 'unread', label: 'Unread' },
                    ]}
                    className="chat-page-sidebar-tabs"
                />
            </div>

            {/* Chat List */}
            <div className="chat-page-sidebar-chat-list">
                {filteredChats.length > 0 ? (
                    <List
                        dataSource={filteredChats}
                        renderItem={(chat) => <ChatListItem chat={chat} />}
                        className="chat-page-sidebar-list"
                    />
                ) : (
                    <div className="chat-page-sidebar-empty">
                        <WechatOutlined className="chat-page-sidebar-empty-icon" />
                        <Text type="secondary" className="chat-page-sidebar-empty-text">
                            {searchQuery ? 'No chats match your search' : 'No chats available'}
                        </Text>
                    </div>
                )}
            </div>
        </Card>
    );

    return (
        <div className="chat-page-container">
            <Row gutter={0} className="chat-page-row">
                {/* Sidebar - Hidden on mobile */}
                <Col xs={0} md={6} lg={5} className="chat-page-sidebar-col">
                    {chatListContent}
                </Col>

                {/* Main Chat Area */}
                <Col xs={24} md={18} lg={19} className="chat-page-main-col">
                    <Card
                        className="chat-page-main-card"
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
                                <ChatHeader />

                                {/* Property Information Card */}
                                {propertyInfo && <PropertyInfoCard />}

                                {/* Messages Area */}
                                <div className="chat-page-messages-area">
                                    {activeChatData.messages && activeChatData.messages.length > 0 ? (
                                        <>
                                            {activeChatData.messages.map(message => (
                                                <MessageBubble key={message.id} message={message} />
                                            ))}
                                            <div ref={messagesEndRef} />
                                        </>
                                    ) : (
                                        <div className="chat-page-no-messages">
                                            <WechatOutlined className="chat-page-no-messages-icon" />
                                            <Text className="chat-page-no-messages-title">
                                                {isPendingChat
                                                    ? 'Start a new conversation about this property! 💬'
                                                    : 'No messages yet. Start a conversation! 💬'}
                                            </Text>
                                            {currentAgent && (
                                                <Text className="chat-page-no-messages-subtitle">
                                                    {isPendingChat
                                                        ? `You're about to chat with ${currentAgent.fullName}, the designated agent for this property.`
                                                        : `You're chatting with ${currentAgent.fullName}, your designated agent for this property.`}
                                                </Text>
                                            )}
                                            {isPendingChat && (
                                                <Text className="chat-page-no-messages-warning">
                                                    ⓘ This chat will be saved when you send your first message
                                                </Text>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <FileAttachments />
                                <MessageInputArea />
                            </>
                        ) : (
                            <div className="chat-page-no-active-chat">
                                <WechatOutlined className="chat-page-no-active-chat-icon" />
                                <Title level={3} className="chat-page-no-active-chat-title">
                                    {chats.length === 0 ? 'No chats yet 💭' : 'Select a chat to start messaging 💭'}
                                </Title>
                                <Text className="chat-page-no-active-chat-text">
                                    {chats.length === 0
                                        ? 'Start a conversation from a property page to begin chatting with agents'
                                        : 'Choose a conversation from the list to begin'}
                                </Text>
                                {chats.length === 0 && (
                                    <Button
                                        type="primary"
                                        className="chat-page-no-active-chat-button"
                                        onClick={() => navigate('/properties')}
                                    >
                                        Browse Properties
                                    </Button>
                                )}
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>

            {/* Mobile Drawer */}
            <Drawer
                title="Chats"
                placement="left"
                onClose={() => setSidebarVisible(false)}
                open={sidebarVisible}
                width="100%"
                styles={{
                    body: { padding: 0 },
                    header: { background: '#ffffff', borderBottom: '1px solid #e4e6eb' }
                }}
            >
                {chatListContent}
            </Drawer>

            {/* Image Preview Modal */}
            <Modal
                open={previewVisible}
                footer={null}
                onCancel={() => setPreviewVisible(false)}
                width="auto"
                className="chat-page-image-preview-modal"
                style={{ maxWidth: '90vw' }}
            >
                <img alt="Preview" className="chat-page-image-preview" src={previewImage} />
            </Modal>
        </div>
    );
};

export default ChatPage;