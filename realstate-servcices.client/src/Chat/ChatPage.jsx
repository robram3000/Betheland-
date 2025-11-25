// ChatPage.jsx - UPDATED CODE (Removed automated chat)
import React, { useState, useRef, useEffect } from 'react';
import {
    Row, Col, Card, Input, Avatar, Typography, List, Badge, Button, Space,
    Tabs, message, Drawer, Popover, Upload, Modal, Segmented, Spin
} from 'antd';
import {
    SearchOutlined, MoreOutlined, WechatOutlined,
    SendOutlined, InfoCircleOutlined,
    LeftOutlined, SmileOutlined, EyeOutlined,
    PaperClipOutlined, FileImageOutlined, FileOutlined,
    PlayCircleOutlined, DeleteOutlined, UserOutlined,
    TeamOutlined, MessageOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import chatService from '../Employeesportal/AdminPortal/Convo/chatService';
import authService from '../Authpage/Services/LoginAuth';
import propertyService from '../Employeesportal/AdminPortal/Creation_Property/services/propertyService';

const { Search } = Input;
const { TextArea } = Input;
const { Title, Text } = Typography;

const ChatPage = ({ propertyChatData }) => {
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
    const [userRole, setUserRole] = useState('client');
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

    const [chats, setChats] = useState([]);
    const [hasInitialized, setHasInitialized] = useState(false);

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
        '😾'
    ];

    // Get user role
    const getUserRole = () => {
        try {
            const role = currentUser?.userType || currentUser?.role || 'client';
            setUserRole(role);
            return role;
        } catch (error) {
            console.warn('Could not get user role:', error);
            return 'client';
        }
    };

    // Format message time
    const formatMessageTime = (date) => {
        if (!date) return 'Just now';
        const messageDate = new Date(date);
        const now = new Date();
        const diffMs = now - messageDate;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return messageDate.toLocaleDateString();
    };

    // FIXED: Enhanced getPropertyData function
    const getPropertyData = async (propertyId) => {
        if (!propertyId) {
            console.log('❌ No propertyId provided');
            return null;
        }

        try {
            console.log('🏠 Fetching property data for ID:', propertyId);

            // Convert to number if it's a string
            const id = parseInt(propertyId);
            if (isNaN(id)) {
                console.error('❌ Invalid property ID:', propertyId);
                return null;
            }

            let property;

            // Try different service methods
            try {
                property = await propertyService.getProperty(id);
                console.log('✅ Property data from getProperty:', property);
            } catch (error) {
                console.log('🔄 Trying getPropertyById...');
                try {
                    property = await propertyService.getPropertyById(id);
                    console.log('✅ Property data from getPropertyById:', property);
                } catch (secondError) {
                    console.log('🔄 Trying getAllProperties as fallback...');
                    try {
                        const allProperties = await propertyService.getAllProperties();
                        property = allProperties.find(p => p.id === id);
                        console.log('✅ Property data from getAllProperties:', property);
                    } catch (thirdError) {
                        console.error('❌ All property fetch methods failed:', thirdError);
                        return null;
                    }
                }
            }

            if (property) {
                // Process property data with multiple fallbacks
                const processedProperty = {
                    id: property.id || propertyId,
                    title: property.title || property.name || 'Property',
                    description: property.description || '',
                    type: property.type || property.propertyType || 'residential',
                    price: property.price || property.listPrice || 0,
                    bedrooms: property.bedrooms || 0,
                    bathrooms: property.bathrooms || 0,
                    areaSqm: property.areaSqm || property.squareFeet || 0,
                    address: property.address || property.street || '',
                    city: property.city || '',
                    state: property.state || '',
                    zipCode: property.zipCode || '',
                    country: property.country || '',
                    barangay: property.barangay || '',
                    status: property.status || 'available',
                    mainImage: property.mainImage ||
                        property.imageUrl ||
                        (property.propertyImages && property.propertyImages[0]?.imageUrl) ||
                        (property.imageUrls && property.imageUrls[0]) ||
                        '/default-property.jpg',
                    fullAddress: property.fullAddress ||
                        `${property.address || ''} ${property.city || ''} ${property.state || ''}`.trim(),
                    listedDate: property.listedDate || property.createdAt,
                    ownerId: property.ownerId,
                    agentId: property.agentId
                };

                console.log('✅ Processed property data:', processedProperty);
                return processedProperty;
            }

            console.warn('⚠️ No property data found for ID:', propertyId);
            return null;
        } catch (error) {
            console.error('❌ Error fetching property data:', error);
            return null;
        }
    };

    // FIXED: Enhanced loadExistingChats with proper property data handling
    const loadExistingChats = async () => {
        if (!ClientID || ClientID === 0) {
            console.error('❌ ClientID not available');
            message.error('Please log in to access chats');
            return;
        }

        try {
            setLoadingChats(true);
            console.log(`🔍 Loading chats for ClientID:`, ClientID);

            let existingChats = [];
            const role = getUserRole();

            // Load chats based on user role
            try {
                existingChats = await chatService.getUserChats();
            } catch (error) {
                console.log('🔄 Fallback to user chats:', error);
                existingChats = await chatService.getUserChats();
            }

            if (existingChats && existingChats.length > 0) {
                console.log(`✅ Found ${existingChats.length} chats`);

                // Process chats with property data
                const processedChats = await Promise.all(
                    existingChats.map(async (chat) => {
                        console.log('🔍 Processing chat:', chat);

                        // Check if chat already has property data from backend
                        if (chat.property) {
                            console.log('✅ Chat already has property data from backend:', chat.property);
                            return chat;
                        }

                        // If chat has propertyId but no property data, fetch it
                        if (chat.propertyId && !chat.property) {
                            try {
                                console.log('🏠 Fetching property data for chat propertyId:', chat.propertyId);
                                const propertyData = await getPropertyData(chat.propertyId);
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

                // Transform to frontend format
                const transformedChats = processedChats.map(chat => {
                    const otherParticipant = chat.participants?.find(p =>
                        p.baseMemberId !== parseInt(ClientID)
                    );

                    const lastMessage = chat.messages && chat.messages.length > 0
                        ? chat.messages[chat.messages.length - 1]
                        : null;

                    // Transform messages
                    const transformedMessages = (chat.messages || []).map(msg => ({
                        id: msg.id,
                        text: msg.content,
                        sender: msg.senderId === parseInt(ClientID) ? 'me' : 'other',
                        time: formatMessageTime(new Date(msg.sentAt)),
                        files: msg.files || [],
                        senderId: msg.senderId,
                        isCurrentUser: msg.senderId === parseInt(ClientID)
                    }));

                    // Determine chat display name with property title
                    let displayName = chat.name;
                    if (chat.property?.title && !displayName?.includes(chat.property.title)) {
                        displayName = `${otherParticipant?.member?.fullName || 'Unknown'} - ${chat.property.title}`;
                    } else if (!displayName) {
                        displayName = otherParticipant?.member?.fullName || 'Unknown Chat';
                    }

                    return {
                        id: chat.id.toString(),
                        backendChatId: chat.id,
                        name: displayName,
                        lastMessage: lastMessage?.content || 'No messages yet',
                        time: lastMessage ? formatMessageTime(new Date(lastMessage.sentAt)) : 'Just now',
                        unread: chat.participants?.find(p => p.baseMemberId === parseInt(ClientID))?.unreadCount || 0,
                        type: chat.chatType || 'direct',
                        avatar: otherParticipant?.member?.profileImage || '/default-avatar.png',
                        online: true,
                        isAgentChat: chat.chatType === 'property_chat',
                        agentData: otherParticipant?.member || null,
                        propertyData: chat.property,
                        propertyId: chat.propertyId,
                        messages: transformedMessages,
                        participants: chat.participants || []
                    };
                });

                console.log('🎉 Transformed chats:', transformedChats);
                setChats(transformedChats);
            } else {
                console.log('📭 No chats found');
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
            const chat = chats.find(c => c.id === chatId);
            if (!chat?.backendChatId) {
                console.log('📝 No backend chat ID, using local messages');
                return;
            }

            const messages = await chatService.getChatMessages(chat.backendChatId);
            if (messages && messages.length > 0) {
                const transformedMessages = messages.map(msg => ({
                    id: msg.id,
                    text: msg.content,
                    sender: msg.senderId === parseInt(ClientID) ? 'me' : 'other',
                    time: formatMessageTime(new Date(msg.sentAt)),
                    files: msg.files || [],
                    senderId: msg.senderId,
                    isCurrentUser: msg.senderId === parseInt(ClientID)
                }));

                setChats(prev => prev.map(chat =>
                    chat.id === chatId
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

    // Initialize on mount
    useEffect(() => {
        console.log('🚀 ChatPage mounted');
        console.log('👤 Current User:', currentUser);
        console.log('🆔 ClientID:', ClientID);

        if (ClientID && ClientID !== 0) {
            loadExistingChats();
        } else {
            console.error('❌ User not authenticated');
            message.warning('Please log in to access chats');
        }
    }, []);

    // Handle property chat data
    useEffect(() => {
        if (propertyChatData && hasInitialized) {
            console.log('🎯 Property chat data received:', propertyChatData);
            handlePropertyChat(propertyChatData);
        }
    }, [propertyChatData, hasInitialized]);

    // FIX 2: IMPROVED CHAT HANDLING - FIND EXISTING CHATS FIRST
    const handlePropertyChat = async (propertyChatData) => {
        console.log('🔍 Starting property chat handling...');

        if (!propertyChatData?.agent || !propertyChatData?.property) {
            console.error('❌ Invalid property chat data:', propertyChatData);
            message.error('Unable to start chat: Missing agent or property information');
            return;
        }

        const agent = propertyChatData.agent;
        const property = propertyChatData.property;

        const agentId = agent.id || agent.agentId || agent.userId || agent.baseMemberId;
        const propertyId = property.id;

        if (!agentId || !propertyId) {
            console.error('❌ Missing agentId or propertyId');
            message.error('Unable to start chat: Missing required information');
            return;
        }

        console.log('👨‍💼 Looking for chat with Agent ID:', agentId);
        console.log('🏠 For Property ID:', propertyId);

        // FIX 2: CHECK FOR EXISTING CHATS MORE THOROUGHLY
        const existingChat = chats.find(chat => {
            // Check if chat has the same agent and property
            const hasSameAgent = chat.agentData?.id === agentId ||
                chat.agentData?.baseMemberId === agentId;
            const hasSameProperty = chat.propertyData?.id === propertyId ||
                chat.propertyId === propertyId;

            return hasSameAgent && hasSameProperty;
        });

        if (existingChat) {
            console.log('✅ Found existing chat:', existingChat);
            setActiveChat(existingChat.id);
            message.info('Continuing existing conversation');
            return;
        }

        // Check if we have backend chats that match
        const checkBackendChats = async () => {
            try {
                // Try to find existing backend chat
                const userChats = await chatService.getUserChats();
                const existingBackendChat = userChats.find(chat => {
                    const hasAgent = chat.participants?.some(p =>
                        p.baseMemberId === parseInt(agentId) ||
                        p.member?.id === parseInt(agentId)
                    );
                    const hasProperty = chat.propertyId === propertyId;
                    return hasAgent && hasProperty;
                });

                if (existingBackendChat) {
                    console.log('✅ Found existing backend chat:', existingBackendChat);
                    // Reload chats to include this one
                    await loadExistingChats();

                    // Find the chat in the updated list and set as active
                    setTimeout(() => {
                        const updatedChat = chats.find(c => c.backendChatId === existingBackendChat.id);
                        if (updatedChat) {
                            setActiveChat(updatedChat.id);
                            message.info('Continuing existing conversation');
                        }
                    }, 500);
                    return;
                }
            } catch (error) {
                console.error('Error checking backend chats:', error);
            }

            // Only create new chat if no existing one found
            console.log('🆕 Creating new agent chat');
            createNewChat(agent, property, agentId, propertyId);
        };

        checkBackendChats();
    };

    const createNewChat = async (agent, property, agentId, propertyId) => {
        // Process property data
        const processedPropertyData = {
            id: property.id,
            title: property.title || 'Property',
            address: property.fullAddress || property.address || 'Address not available',
            mainImage: property.mainImage || '/default-property.jpg',
            price: property.price || 0,
            propertyType: property.propertyType || property.type || 'residential',
            bedrooms: property.bedrooms || 0,
            bathrooms: property.bathrooms || 0,
            areaSqm: property.areaSqm || 0,
            areaSqft: property.areaSqm ? `${property.areaSqm} sqm` : 'N/A'
        };

        // Process agent data
        const processedAgentData = {
            id: agentId,
            baseMemberId: agent.baseMemberId || agentId,
            name: agent.name || agent.fullName ||
                (agent.firstName && agent.lastName ? `${agent.firstName} ${agent.lastName}` : 'Unknown Agent'),
            firstName: agent.firstName || 'Agent',
            lastName: agent.lastName || '',
            profilePicture: agent.profilePicture || agent.profileImage || agent.avatar || '/default-avatar.png',
            email: agent.email || '',
            phone: agent.phone || agent.phoneNumber || agent.cellPhoneNo || '',
            agency: agent.agency || agent.company || agent.brokerageName || '',
            licenseNumber: agent.licenseNumber || '',
            specialization: agent.specialization || agent.expertise || agent.title || 'Real Estate Agent'
        };

        // REMOVED: Automated chat message
        const newAgentChat = {
            id: `temp-${agentId}-${propertyId}-${Date.now()}`,
            backendChatId: null,
            name: `${processedAgentData.name} - ${processedPropertyData.title}`,
            lastMessage: 'No messages yet', // Changed from 'Property enquiry'
            time: 'Now',
            unread: 0,
            type: 'property_chat',
            avatar: processedAgentData.profilePicture || '/default-avatar.png',
            online: true,
            isAgentChat: true,
            agentData: processedAgentData,
            propertyData: processedPropertyData,
            propertyId: propertyId,
            messages: [], // REMOVED: Automated initial message
            participants: [
                {
                    baseMemberId: parseInt(ClientID),
                    role: 'client'
                },
                {
                    baseMemberId: parseInt(processedAgentData.baseMemberId),
                    role: 'agent',
                    member: processedAgentData
                }
            ]
        };

        setChats(prev => [newAgentChat, ...prev]);
        setActiveChat(newAgentChat.id);
        message.success(`Chat started with ${processedAgentData.name} 🎉`);
    };

    // Load messages when active chat changes
    useEffect(() => {
        if (activeChat) {
            loadChatMessages(activeChat);
        }
    }, [activeChat]);

    // Scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [activeChat, chats.find(chat => chat.id === activeChat)?.messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // FIX 4: SIMPLIFIED CHAT FILTERING - REMOVED UNNECESSARY TABS
    const filteredChats = chats.filter(chat => {
        if (searchQuery && !chat.name.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }
        if (activeTab === 'unread' && chat.unread === 0) {
            return false;
        }
        return true;
    });

    const activeChatData = chats.find(chat => chat.id === activeChat);

    // Helper function to get recipient ID
    const getRecipientId = (chatData) => {
        if (!chatData || !chatData.participants) return null;
        const otherParticipant = chatData.participants.find(p =>
            p.baseMemberId !== parseInt(ClientID)
        );
        return otherParticipant?.baseMemberId || null;
    };

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
                        const uploadResult = await chatService.uploadFile(file);
                        if (uploadResult.success && uploadResult.fileUrl) {
                            uploadedFiles.push({
                                fileName: file.name,
                                fileUrl: uploadResult.fileUrl,
                                fileType: file.type.startsWith('image/') ? 'image' : 'file',
                                fileSize: file.size,
                                mimeType: file.type
                            });
                        }
                    } catch (error) {
                        console.error('❌ File upload failed:', error);
                        message.error(`Failed to upload ${file.name}`);
                    }
                }
            }

            let backendChatId = activeChatData.backendChatId;

            // Create backend chat if doesn't exist (for new property chats)
            if (!backendChatId && activeChatData.isAgentChat && activeChatData.agentData) {
                try {
                    const agentId = activeChatData.agentData.baseMemberId || activeChatData.agentData.id;

                    if (!agentId) {
                        throw new Error('Agent ID is required to create chat');
                    }

                    const chatData = {
                        name: `${activeChatData.agentData.name} - ${activeChatData.propertyData?.title || 'Property'}`,
                        chatType: 'direct',
                        propertyId: activeChatData.propertyData?.id?.toString() || activeChatData.propertyId?.toString(),
                        participantIds: [parseInt(agentId)]
                    };

                    const createdChat = await chatService.createChat(chatData);

                    if (createdChat && createdChat.id) {
                        backendChatId = createdChat.id;
                        // Update the chat with backend ID
                        setChats(prev => prev.map(chat =>
                            chat.id === activeChatData.id
                                ? { ...chat, backendChatId: createdChat.id }
                                : chat
                        ));
                    }
                } catch (error) {
                    console.error('❌ Failed to create backend chat:', error);
                    message.error('Failed to create chat session. Please try again.');
                }
            }

            // Get recipient ID
            const recipientId = getRecipientId(activeChatData);

            // Send message to backend if we have a chat ID
            if (backendChatId) {
                try {
                    const messagePayload = {
                        chatId: backendChatId,
                        content: newMessage.trim(),
                        messageType: uploadedFiles.length > 0 ? 'file' : 'text',
                        files: uploadedFiles.length > 0 ? uploadedFiles : undefined,
                        recipientId: recipientId
                    };

                    await chatService.sendMessage(messagePayload);
                } catch (error) {
                    console.error('❌ Failed to send message to backend:', error);
                }
            }

            // Update UI immediately
            const newMessageObj = {
                id: Date.now(),
                text: newMessage.trim(),
                sender: 'me',
                time: 'Just now',
                files: uploadedFiles,
                senderId: parseInt(ClientID),
                isCurrentUser: true
            };

            setChats(prev => prev.map(chat =>
                chat.id === activeChat
                    ? {
                        ...chat,
                        messages: [...(chat.messages || []), newMessageObj],
                        lastMessage: newMessage.trim(),
                        time: 'Now',
                        unread: 0
                    }
                    : chat
            ));

            message.success('Message sent! 🎉');
            setNewMessage('');
            setFileList([]);
            setEmojiPickerVisible(false);

        } catch (error) {
            console.error('💥 Error sending message:', error);
            message.error('Failed to send message: ' + (error.message || 'Unknown error'));
        } finally {
            setSendingMessage(false);
        }
    };

    const handleEmojiClick = (emoji) => {
        setNewMessage(prev => prev + emoji);
        setEmojiPickerVisible(false);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const beforeUpload = (file) => {
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');

        if (!isImage && !isVideo) {
            message.error('You can only upload image or video files!');
            return false;
        }

        const isLt10M = file.size / 1024 / 1024 < 10;
        if (!isLt10M) {
            message.error('File must be smaller than 10MB!');
            return false;
        }

        setFileList(prev => [...prev, { ...file, uid: file.uid || Date.now() }]);
        return false;
    };

    const handleFileRemove = (file) => {
        setFileList(prev => prev.filter(f => f.uid !== file.uid));
    };

    const handlePreview = (file) => {
        if (file.type.startsWith('image/')) {
            setPreviewImage(file.url || URL.createObjectURL(file));
            setPreviewVisible(true);
        } else if (file.type.startsWith('video/')) {
            const videoUrl = file.url || URL.createObjectURL(file);
            window.open(videoUrl, '_blank');
        }
    };

    const getFileIcon = (file) => {
        if (file.type.startsWith('image/')) {
            return <FileImageOutlined style={{ color: '#52c41a' }} />;
        } else if (file.type.startsWith('video/')) {
            return <PlayCircleOutlined style={{ color: '#1890ff' }} />;
        }
        return <FileOutlined />;
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

    // FIX 3: PROPERTY CARD WITH PROPER DATA DISPLAY
    const PropertyCard = () => {
        if (!activeChatData?.propertyData) {
            return null;
        }

        const property = activeChatData.propertyData;

        return (
            <div style={{
                display: 'flex',
                justifyContent: 'flex-start',
                marginBottom: '16px',
                padding: '0 8px'
            }}>
                <div style={{
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '12px',
                    maxWidth: '100%',
                    width: '100%',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <div style={{
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'flex-start'
                    }}>
                        <img
                            src={property.mainImage}
                            alt={property.title}
                            style={{
                                width: '70px',
                                height: '70px',
                                objectFit: 'cover',
                                borderRadius: '6px',
                                border: '1px solid #e2e8f0',
                                flexShrink: 0
                            }}
                            onError={(e) => {
                                e.target.src = '/default-property.jpg';
                            }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <Text strong style={{
                                color: '#1B3C53',
                                fontSize: '14px',
                                display: 'block',
                                marginBottom: '4px',
                                lineHeight: '1.2'
                            }}>
                                {property.title}
                            </Text>
                            <div style={{
                                color: '#64748b',
                                fontSize: '11px',
                                marginBottom: '6px',
                                lineHeight: '1.2'
                            }}>
                                {property.address}
                            </div>
                            <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '6px',
                                alignItems: 'center',
                                fontSize: '10px',
                                color: '#64748b',
                                marginBottom: '6px'
                            }}>
                                <span>🏠 {property.propertyType}</span>
                                <span>🛏️ {property.bedrooms}</span>
                                <span>🚿 {property.bathrooms}</span>
                                <span>📏 {property.areaSqm} sqm</span>
                            </div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <Text strong style={{
                                    color: '#1B3C53',
                                    fontSize: '13px'
                                }}>
                                    {formatPrice(property.price)}
                                </Text>
                                <Button
                                    type="primary"
                                    size="small"
                                    icon={<EyeOutlined />}
                                    onClick={() => {
                                        navigate('/property', { state: { propertyId: property.id } });
                                    }}
                                    style={{
                                        background: '#1B3C53',
                                        borderColor: '#1B3C53',
                                        borderRadius: '4px',
                                        fontSize: '10px',
                                        padding: '2px 6px',
                                        height: '22px'
                                    }}
                                >
                                    View
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const AgentInfoCard = () => {
        if (!activeChatData?.isAgentChat || !activeChatData?.agentData) {
            return null;
        }

        const agent = activeChatData.agentData;

        return (
            <div style={{
                display: 'flex',
                justifyContent: 'flex-start',
                marginBottom: '16px',
                padding: '0 8px'
            }}>
                <div style={{
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '12px',
                    maxWidth: '100%',
                    width: '100%',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <div style={{
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'flex-start'
                    }}>
                        <Avatar
                            size={50}
                            src={agent.profilePicture}
                            style={{
                                border: '2px solid #e2e8f0',
                                flexShrink: 0
                            }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <Text strong style={{
                                color: '#1B3C53',
                                fontSize: '14px',
                                display: 'block',
                                marginBottom: '4px',
                                lineHeight: '1.2'
                            }}>
                                {agent.name}
                            </Text>
                            <div style={{
                                color: '#64748b',
                                fontSize: '11px',
                                marginBottom: '6px',
                                lineHeight: '1.2'
                            }}>
                                {agent.specialization || 'Real Estate Agent'}
                            </div>
                            {activeChatData.propertyData?.title && (
                                <div style={{
                                    color: '#1B3C53',
                                    fontSize: '12px',
                                    fontStyle: 'italic',
                                    marginBottom: '6px'
                                }}>
                                    {activeChatData.propertyData.title}
                                </div>
                            )}
                            {agent.agency && (
                                <div style={{
                                    color: '#64748b',
                                    fontSize: '10px',
                                    marginBottom: '4px'
                                }}>
                                    🏢 {agent.agency}
                                </div>
                            )}
                            <div style={{
                                display: 'flex',
                                gap: '8px',
                                fontSize: '10px',
                                color: '#64748b'
                            }}>
                                {agent.email && <span>📧 {agent.email}</span>}
                                {agent.phone && <span>📞 {agent.phone}</span>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const FileAttachments = () => {
        if (fileList.length === 0) return null;

        return (
            <div style={{
                padding: '8px 16px',
                borderBottom: '1px solid #f1f5f9',
                background: '#fafafa'
            }}>
                <Text strong style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '8px' }}>
                    Attachments ({fileList.length})
                </Text>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {fileList.map((file, index) => (
                        <div
                            key={file.uid || index}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                background: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                padding: '6px 8px',
                                maxWidth: '200px'
                            }}
                        >
                            <div style={{ marginRight: '8px', fontSize: '16px' }}>
                                {getFileIcon(file)}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <Text style={{
                                    fontSize: '11px',
                                    display: 'block',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {file.name}
                                </Text>
                                <Text type="secondary" style={{ fontSize: '10px' }}>
                                    {formatFileSize(file.size)}
                                </Text>
                            </div>
                            <Button
                                type="text"
                                size="small"
                                icon={<DeleteOutlined style={{ fontSize: '12px', color: '#ff4d4f' }} />}
                                onClick={() => handleFileRemove(file)}
                                style={{ marginLeft: '4px', padding: '2px', height: 'auto' }}
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const EmojiPickerContent = () => (
        <div style={{
            width: 280,
            height: 180,
            overflowY: 'auto',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            padding: 6
        }}>
            {commonEmojis.map((emoji, index) => (
                <Button
                    key={index}
                    type="text"
                    onClick={() => handleEmojiClick(emoji)}
                    style={{
                        fontSize: '16px',
                        padding: '2px 4px',
                        minWidth: 'auto',
                        height: 'auto'
                    }}
                >
                    {emoji}
                </Button>
            ))}
        </div>
    );

    // FIX 4: SIMPLIFIED CHAT LIST - REMOVED UNNECESSARY CONTROLS
    const chatListContent = (
        <Card
            style={{
                border: '1px solid #e2e8f0',
                height: '100%',
                background: '#ffffff',
                borderRadius: 0,
                margin: 0
            }}
            bodyStyle={{
                padding: 0,
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <div style={{
                padding: '16px',
                borderBottom: '1px solid #f1f5f9',
                flexShrink: 0
            }}>
                <Title level={4} style={{
                    color: '#1B3C53',
                    fontSize: '16px',
                    margin: 0,
                    marginBottom: '12px'
                }}>
                    Messages
                </Title>
                <Search
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                        borderRadius: 0,
                        width: '100%'
                    }}
                />
            </div>

            <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid #f1f5f9',
                flexShrink: 0
            }}>
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    size="small"
                    items={[
                        { key: 'all', label: 'All Chats' },
                        { key: 'unread', label: 'Unread' },
                    ]}
                    style={{ width: '100%' }}
                />
            </div>

            <div style={{
                flex: 1,
                overflowY: 'auto',
                minHeight: 0
            }}>
                {loadingChats ? (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100px'
                    }}>
                        <Spin size="small" />
                        <Text type="secondary" style={{ marginLeft: 8 }}>Loading chats...</Text>
                    </div>
                ) : filteredChats.length > 0 ? (
                    <List
                        dataSource={filteredChats}
                        renderItem={(chat) => (
                            <List.Item
                                style={{
                                    padding: '12px 16px',
                                    cursor: 'pointer',
                                    background: activeChat === chat.id ? '#f0f9ff' : 'transparent',
                                    borderBottom: '1px solid #f8fafc',
                                    transition: 'background-color 0.2s',
                                    margin: 0,
                                    borderRadius: 0
                                }}
                                onClick={() => {
                                    setActiveChat(chat.id);
                                    setSidebarVisible(false);
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    width: '100%'
                                }}>
                                    <Badge
                                        dot={chat.online}
                                        color="#52c41a"
                                        offset={[-4, 28]}
                                    >
                                        <Avatar
                                            src={chat.avatar}
                                            size="default"
                                            style={{ flexShrink: 0 }}
                                        />
                                    </Badge>
                                    <div style={{
                                        flex: 1,
                                        marginLeft: '10px',
                                        minWidth: 0,
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                            width: '100%',
                                            marginBottom: '4px'
                                        }}>
                                            <Text strong style={{
                                                color: '#1B3C53',
                                                fontSize: '13px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                flex: 1
                                            }}>
                                                {chat.name}
                                            </Text>
                                            <Text type="secondary" style={{
                                                fontSize: '11px',
                                                flexShrink: 0,
                                                marginLeft: '8px'
                                            }}>
                                                {chat.time}
                                            </Text>
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            width: '100%'
                                        }}>
                                            <Text
                                                style={{
                                                    color: '#64748b',
                                                    fontSize: '12px',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    display: 'block',
                                                    width: '70%'
                                                }}
                                            >
                                                {chat.lastMessage}
                                            </Text>
                                            {chat.unread > 0 && (
                                                <Badge
                                                    count={chat.unread}
                                                    style={{
                                                        marginLeft: '6px',
                                                        background: '#1B3C53',
                                                        fontSize: '10px',
                                                        flexShrink: 0
                                                    }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </List.Item>
                        )}
                    />
                ) : (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100px',
                        flexDirection: 'column',
                        padding: '20px',
                        textAlign: 'center'
                    }}>
                        <WechatOutlined style={{ fontSize: '24px', color: '#ccc', marginBottom: '8px' }} />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            {searchQuery ? 'No chats match your search' : 'No chats available'}
                        </Text>
                    </div>
                )}
            </div>
        </Card>
    );

    return (
        <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: 0,
            margin: 0,
            overflow: 'hidden'
        }}>
            <Row gutter={0} style={{
                flex: 1,
                margin: 0,
                height: '100%',
                width: '100%'
            }}>
                {/* Sidebar - Hidden on mobile */}
                <Col xs={0} md={6} lg={5} style={{
                    padding: 0,
                    margin: 0,
                    height: '100%',
                    borderRight: '1px solid #e2e8f0'
                }}>
                    {chatListContent}
                </Col>

                {/* Main Chat Area */}
                <Col xs={24} md={18} lg={19} style={{
                    padding: 0,
                    margin: 0,
                    height: '100%'
                }}>
                    <Card
                        style={{
                            border: 'none',
                            height: '100%',
                            margin: 0,
                            borderRadius: 0,
                            width: '100%'
                        }}
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
                                {/* Chat Header */}
                                <div style={{
                                    padding: '12px 16px',
                                    borderBottom: '1px solid #f1f5f9',
                                    background: 'white',
                                    flexShrink: 0,
                                    borderRadius: 0
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        width: '100%'
                                    }}>
                                        <Space size="small" style={{ flex: 1 }}>
                                            <Button
                                                type="text"
                                                icon={<LeftOutlined />}
                                                onClick={() => setSidebarVisible(true)}
                                                style={{
                                                    color: '#1B3C53',
                                                    padding: '4px 8px',
                                                    display: window.innerWidth < 768 ? 'block' : 'none'
                                                }}
                                            />
                                            <Badge
                                                dot={activeChatData.online}
                                                color="#52c41a"
                                                offset={[-2, 28]}
                                            >
                                                <Avatar
                                                    size={36}
                                                    src={activeChatData.avatar}
                                                    style={{
                                                        border: '1px solid #e2e8f0',
                                                        flexShrink: 0
                                                    }}
                                                />
                                            </Badge>
                                            <div style={{ minWidth: 0, flex: 1 }}>
                                                <Title level={4} style={{
                                                    margin: 0,
                                                    color: '#1B3C53',
                                                    fontSize: '15px',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {activeChatData.name}
                                                </Title>
                                                <Text type="secondary" style={{
                                                    fontSize: '11px',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    display: 'block'
                                                }}>
                                                    {activeChatData.online ? 'Online 🟢' : 'Last seen recently'}
                                                    {activeChatData.propertyData?.title && ` • ${activeChatData.propertyData.title}`}
                                                </Text>
                                            </div>
                                        </Space>
                                        <Space size="small" style={{ flexShrink: 0 }}>
                                            <Button
                                                type="text"
                                                icon={<InfoCircleOutlined />}
                                                style={{
                                                    color: '#1B3C53',
                                                    padding: '4px 8px'
                                                }}
                                            />
                                            <Button
                                                type="text"
                                                icon={<MoreOutlined />}
                                                style={{
                                                    color: '#1B3C53',
                                                    padding: '4px 8px'
                                                }}
                                            />
                                        </Space>
                                    </div>
                                </div>

                                {/* Messages Area */}
                                <div style={{
                                    flex: 1,
                                    padding: '12px 8px',
                                    overflowY: 'auto',
                                    background: '#fafafa',
                                    minHeight: 0,
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}>
                                    <Space direction="vertical" style={{
                                        width: '100%',
                                        flex: 1
                                    }} size="small">
                                        {activeChatData.isAgentChat && <AgentInfoCard />}
                                        {activeChatData.isAgentChat && <PropertyCard />}

                                        {loadingMessages ? (
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                height: '100px'
                                            }}>
                                                <Spin size="small" />
                                                <Text type="secondary" style={{ marginLeft: 8 }}>Loading messages...</Text>
                                            </div>
                                        ) : activeChatData.messages && activeChatData.messages.length > 0 ? (
                                            activeChatData.messages.map(message => (
                                                <div
                                                    key={message.id}
                                                    style={{
                                                        display: 'flex',
                                                        justifyContent: message.sender === 'me' ? 'flex-end' : 'flex-start',
                                                        marginBottom: '8px',
                                                        width: '100%'
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            background: message.sender === 'me' ? '#1B3C53' : 'white',
                                                            color: message.sender === 'me' ? 'white' : '#1B3C53',
                                                            padding: '8px 12px',
                                                            borderRadius: '8px',
                                                            border: message.sender === 'me' ? 'none' : '1px solid #e2e8f0',
                                                            maxWidth: '85%',
                                                            wordBreak: 'break-word'
                                                        }}
                                                    >
                                                        {message.text}
                                                        <div style={{
                                                            fontSize: '10px',
                                                            color: message.sender === 'me' ? 'rgba(255,255,255,0.7)' : '#64748b',
                                                            marginTop: '2px',
                                                            textAlign: message.sender === 'me' ? 'right' : 'left'
                                                        }}>
                                                            {message.time}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div style={{
                                                textAlign: 'center',
                                                color: '#64748b',
                                                padding: '20px',
                                                flex: 1,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'center',
                                                alignItems: 'center'
                                            }}>
                                                <WechatOutlined style={{ fontSize: '32px', marginBottom: '8px' }} />
                                                <Text style={{ fontSize: '13px' }}>No messages yet. Start a conversation! 💬</Text>
                                            </div>
                                        )}
                                        <div ref={messagesEndRef} />
                                    </Space>
                                </div>

                                <FileAttachments />

                                {/* Message Input */}
                                <div style={{
                                    padding: '12px 16px',
                                    borderTop: '1px solid #f1f5f9',
                                    background: 'white',
                                    flexShrink: 0,
                                    borderRadius: 0,
                                    position: 'sticky',
                                    bottom: 0,
                                    width: '100%'
                                }}>
                                    <Space.Compact style={{
                                        width: '100%',
                                        display: 'flex'
                                    }}>
                                        <Upload
                                            beforeUpload={beforeUpload}
                                            fileList={fileList}
                                            multiple
                                            showUploadList={false}
                                            accept="image/*,video/*"
                                        >
                                            <Button
                                                type="text"
                                                icon={<PaperClipOutlined />}
                                                style={{
                                                    borderRadius: '8px 0 0 8px',
                                                    color: '#64748b',
                                                    borderRight: 'none',
                                                    height: 'auto',
                                                    padding: '8px 12px',
                                                    flexShrink: 0
                                                }}
                                            />
                                        </Upload>
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
                                                style={{
                                                    borderRadius: 0,
                                                    color: '#64748b',
                                                    borderRight: 'none',
                                                    borderLeft: 'none',
                                                    height: 'auto',
                                                    padding: '8px 12px',
                                                    flexShrink: 0
                                                }}
                                            />
                                        </Popover>
                                        <TextArea
                                            ref={textAreaRef}
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            placeholder="Type a message... 😊"
                                            autoSize={{ minRows: 1, maxRows: 3 }}
                                            style={{
                                                borderRadius: 0,
                                                resize: 'none',
                                                borderLeft: 'none',
                                                borderRight: 'none',
                                                fontSize: '14px',
                                                flex: 1
                                            }}
                                            disabled={sendingMessage}
                                        />
                                        <Button
                                            type="primary"
                                            icon={<SendOutlined />}
                                            onClick={handleSendMessage}
                                            disabled={(!newMessage.trim() && fileList.length === 0) || sendingMessage}
                                            loading={sendingMessage}
                                            style={{
                                                borderRadius: '0 8px 8px 0',
                                                background: '#1B3C53',
                                                borderColor: '#1B3C53',
                                                height: 'auto',
                                                padding: '8px 12px',
                                                flexShrink: 0
                                            }}
                                        >
                                            Send
                                        </Button>
                                    </Space.Compact>
                                </div>
                            </>
                        ) : (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '100%',
                                flexDirection: 'column',
                                color: '#64748b',
                                padding: '20px'
                            }}>
                                <WechatOutlined style={{ fontSize: '40px', marginBottom: '12px' }} />
                                <Title level={3} style={{
                                    color: '#64748b',
                                    textAlign: 'center',
                                    fontSize: '16px',
                                    marginBottom: '8px'
                                }}>
                                    {chats.length === 0 ? 'No chats yet 💭' : 'Select a chat to start messaging 💭'}
                                </Title>
                                <Text style={{
                                    textAlign: 'center',
                                    fontSize: '13px'
                                }}>
                                    {chats.length === 0
                                        ? 'Start a conversation from a property page to begin chatting with agents'
                                        : 'Choose a conversation from the list to begin'}
                                </Text>
                                {chats.length === 0 && (
                                    <Button
                                        type="primary"
                                        style={{ marginTop: '16px', background: '#1B3C53' }}
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

            {/* Modals and Drawers */}
            <Modal
                open={previewVisible}
                footer={null}
                onCancel={() => setPreviewVisible(false)}
                width="auto"
                style={{ maxWidth: '90vw' }}
            >
                <img alt="Preview" style={{ width: '100%' }} src={previewImage} />
            </Modal>

            <Drawer
                title="Chats"
                placement="left"
                onClose={() => setSidebarVisible(false)}
                open={sidebarVisible}
                width="100%"
                styles={{ body: { padding: 0 } }}
            >
                {chatListContent}
            </Drawer>
        </div>
    );
};

export default ChatPage;