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
    TeamOutlined, MessageOutlined, ReloadOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import chatService from '../Employeesportal/AdminPortal/Convo/chatService';
import authService from '../Authpage/Services/LoginAuth';
import propertyService from '../Employeesportal/AdminPortal/Creation_Property/services/propertyService';

const { Search } = Input;
const { TextArea } = Input;
const { Title, Text } = Typography;

const ChatPage = ({ propertyChatData }) => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeChat, setActiveChat] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [chatType, setChatType] = useState('all');
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

    // FIXED: Proper user authentication
    const getCurrentUserInfo = () => {
        try {
            // Try localStorage first
            const userData = localStorage.getItem('user');
            if (userData) {
                const user = JSON.parse(userData);
                console.log('📱 User from localStorage:', user);
                return user;
            }

            // Try auth service
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

    // Helper function to generate unique chat key
    const generateChatKey = (chat, clientId) => {
        if (!chat) return `chat-${Date.now()}`;

        // For direct chats, use participant IDs
        if (chat.chatType === 'direct' && chat.participants) {
            const participantIds = chat.participants
                .map(p => p.baseMemberId)
                .filter(id => id !== parseInt(clientId))
                .sort((a, b) => a - b);
            return `direct-${participantIds.join('-')}`;
        }

        // For property chats
        if (chat.chatType === 'property_chat' && chat.propertyId) {
            return `property-${chat.propertyId}`;
        }

        // Fallback
        return `chat-${chat.id || Date.now()}`;
    };

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

    // Get property data
    const getPropertyData = async (propertyId) => {
        if (!propertyId) return null;
        try {
            console.log('🏠 Fetching property data for ID:', propertyId);
            let property;

            // Try different service methods
            try {
                property = await propertyService.getProperty(parseInt(propertyId));
            } catch (error) {
                console.log('Trying alternative property method...');
                property = await propertyService.getPropertyById(parseInt(propertyId));
            }

            if (property) {
                const processedProperty = {
                    id: property.id || propertyId,
                    title: property.title || property.name || 'Property',
                    address: property.fullAddress || property.address ||
                        `${property.street || ''} ${property.city || ''}`.trim() || 'Address not available',
                    mainImage: property.mainImage || property.imageUrl ||
                        (property.propertyImages && property.propertyImages[0]?.imageUrl) ||
                        '/default-property.jpg',
                    price: property.price || property.listPrice || 0,
                    propertyType: property.propertyType || property.type || 'residential',
                    bedrooms: property.bedrooms || 0,
                    bathrooms: property.bathrooms || 0,
                    areaSqm: property.areaSqm || property.squareFeet || 0,
                    areaSqft: property.areaSqft || (property.areaSqm ? `${property.areaSqm} sqm` : 'N/A')
                };
                console.log('✅ Processed property:', processedProperty);
                return processedProperty;
            }
            return null;
        } catch (error) {
            console.error('❌ Error fetching property data:', error);
            return null;
        }
    };

    // Enhanced agent data validation and processing
    const validateAndProcessAgentData = (agentData) => {
        if (!agentData) {
            console.error('❌ Agent data is null or undefined');
            return null;
        }

        // Check for agent ID in various possible fields
        const agentId = agentData.id || agentData.agentId || agentData.userId || agentData.baseMemberId;

        if (!agentId) {
            console.error('❌ No valid agent ID found in agent data:', agentData);
            return null;
        }

        console.log('👨‍💼 Validated Agent ID:', agentId);

        return {
            id: agentId,
            name: agentData.name || agentData.fullName || agentData.username || 'Unknown Agent',
            profilePicture: agentData.profilePicture || agentData.profileImage || agentData.avatar || '/default-avatar.png',
            email: agentData.email || '',
            phone: agentData.phone || agentData.phoneNumber || '',
            agency: agentData.agency || agentData.company || '',
            licenseNumber: agentData.licenseNumber || '',
            specialization: agentData.specialization || agentData.expertise || 'Real Estate'
        };
    };

    // Load existing chats
    const loadExistingChats = async (type = 'all') => {
        if (!ClientID || ClientID === 0) {
            console.error('❌ ClientID not available');
            message.error('Please log in to access chats');
            return;
        }

        try {
            setLoadingChats(true);
            console.log(`🔍 Loading ${type} chats for ClientID:`, ClientID);

            let existingChats = [];
            const role = getUserRole();

            // Try different chat loading methods
            try {
                if (role === 'client' || role === 'Client') {
                    existingChats = await chatService.getClientChats(ClientID);
                } else if (role === 'agent' || role === 'Agent') {
                    existingChats = await chatService.getAgentChats(ClientID);
                } else {
                    existingChats = await chatService.getUserChats();
                }
            } catch (error) {
                console.log('🔄 Fallback to user chats:', error);
                existingChats = await chatService.getUserChats();
            }

            if (existingChats && existingChats.length > 0) {
                console.log(`✅ Found ${existingChats.length} chats`);

                // Process chats with property data
                const processedChats = await Promise.all(
                    existingChats.map(async (chat) => {
                        // Fetch property data if needed
                        if (chat.propertyId) {
                            chat.propertyData = await getPropertyData(chat.propertyId);
                        }
                        return chat;
                    })
                );

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

                    // Determine chat type badge
                    let chatTypeBadge = 'Direct';
                    if (chat.chatType === 'property_chat') chatTypeBadge = 'Property';
                    if (chat.chatType === 'group') chatTypeBadge = 'Group';

                    return {
                        id: chat.id.toString(),
                        backendChatId: chat.id,
                        name: chat.name || (otherParticipant?.member?.fullName || 'Unknown Chat'),
                        lastMessage: lastMessage?.content || 'No messages yet',
                        time: lastMessage ? formatMessageTime(new Date(lastMessage.sentAt)) : 'Just now',
                        unread: chat.participants?.find(p => p.baseMemberId === parseInt(ClientID))?.unreadCount || 0,
                        type: chat.chatType || 'direct',
                        chatTypeBadge: chatTypeBadge,
                        avatar: otherParticipant?.member?.profileImage || '/default-avatar.png',
                        online: true,
                        isAgentChat: chat.chatType === 'property_chat',
                        agentData: otherParticipant?.member || null,
                        propertyData: chat.propertyData || null,
                        messages: transformedMessages,
                        participants: chat.participants || [],
                        chatKey: generateChatKey(chat, ClientID)
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
        }
    };

    // Load messages for specific chat
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

    // Initialize on component mount
    useEffect(() => {
        console.log('🚀 ChatPage mounted');
        console.log('👤 Current User:', currentUser);
        console.log('🆔 ClientID:', ClientID);

        if (ClientID && ClientID !== 0) {
            loadExistingChats(chatType);
        } else {
            console.error('❌ User not authenticated');
            message.warning('Please log in to access chats');
        }
    }, []);

    // Reload when chat type changes
    useEffect(() => {
        if (ClientID && ClientID !== 0) {
            loadExistingChats(chatType);
        }
    }, [chatType]);

    // Handle property chat data with enhanced agent validation
    useEffect(() => {
        if (propertyChatData) {
            console.log('🎯 Property chat data received:', propertyChatData);
            handlePropertyChat(propertyChatData);
        }
    }, [propertyChatData]);

    const handlePropertyChat = async (propertyChatData) => {
        // Enhanced agent ID validation
        const validatedAgentData = validateAndProcessAgentData(propertyChatData.agent);
        if (!validatedAgentData) {
            console.error('❌ Invalid agent data in propertyChatData:', propertyChatData);
            message.error('Unable to start chat: Agent information is invalid');
            return;
        }

        const agentId = validatedAgentData.id;
        const propertyId = propertyChatData.property?.id;

        if (!agentId || !propertyId) {
            console.error('❌ Missing agentId or propertyId');
            console.log('Agent ID:', agentId);
            console.log('Property ID:', propertyId);
            message.error('Unable to start chat: Missing required information');
            return;
        }

        console.log('👨‍💼 Starting chat with Agent ID:', agentId);
        console.log('🏠 For Property ID:', propertyId);

        const agentChatKey = `property-${propertyId}-${agentId}`;
        const existingChatIndex = chats.findIndex(chat => chat.chatKey === agentChatKey);

        const processedPropertyData = propertyChatData.property ? {
            id: propertyChatData.property.id,
            title: propertyChatData.property.title || 'Property',
            address: propertyChatData.property.fullAddress || propertyChatData.property.address || 'Address not available',
            mainImage: propertyChatData.property.mainImage || '/default-property.jpg',
            price: propertyChatData.property.price || 0,
            propertyType: propertyChatData.property.type || 'residential',
            bedrooms: propertyChatData.property.bedrooms || 0,
            bathrooms: propertyChatData.property.bathrooms || 0,
            areaSqm: propertyChatData.property.areaSqm || 0,
            areaSqft: propertyChatData.property.areaSqm ? `${propertyChatData.property.areaSqm} sqm` : 'N/A'
        } : null;

        const newAgentChat = {
            id: `agent-${agentId}-${Date.now()}`,
            backendChatId: null,
            name: validatedAgentData.name || 'Contact Agent',
            lastMessage: 'Property enquiry',
            time: 'Now',
            unread: 0,
            type: 'property_chat',
            chatTypeBadge: 'Property',
            avatar: validatedAgentData.profilePicture || '/default-avatar.png',
            online: true,
            isAgentChat: true,
            agentData: validatedAgentData,
            propertyData: processedPropertyData,
            messages: [{
                id: Date.now(),
                text: `Hi! I'm interested in the property at ${propertyChatData.property?.address || 'your property'}`,
                sender: 'me',
                time: 'Just now',
                senderId: parseInt(ClientID),
                isCurrentUser: true
            }],
            chatKey: agentChatKey,
            participants: [
                {
                    baseMemberId: parseInt(ClientID),
                    role: 'client'
                },
                {
                    baseMemberId: parseInt(agentId),
                    role: 'agent',
                    member: validatedAgentData
                }
            ]
        };

        if (existingChatIndex === -1) {
            console.log('🆕 Creating new agent chat:', newAgentChat);
            setChats(prev => [newAgentChat, ...prev]);
        } else {
            console.log('📝 Updating existing agent chat');
            const updatedChats = [...chats];
            updatedChats[existingChatIndex] = {
                ...updatedChats[existingChatIndex],
                ...newAgentChat,
                backendChatId: updatedChats[existingChatIndex].backendChatId,
                messages: [
                    ...updatedChats[existingChatIndex].messages,
                    ...newAgentChat.messages.filter(newMsg =>
                        !updatedChats[existingChatIndex].messages.some(existingMsg =>
                            existingMsg.id === newMsg.id
                        )
                    )
                ]
            };
            setChats(updatedChats);
        }

        setActiveChat(newAgentChat.id);
        message.success(`Chat started with ${validatedAgentData.name} 🎉`);
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
        console.log('📤 Sending message as user:', ClientID);
        console.log('👨‍💼 Active chat agent data:', activeChatData.agentData);

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

            // Create backend chat if doesn't exist
            if (!backendChatId && activeChatData.isAgentChat && activeChatData.agentData) {
                try {
                    const agentId = activeChatData.agentData.id;

                    if (!agentId) {
                        console.error('❌ No agent ID found for backend chat creation');
                        throw new Error('Agent ID is required to create chat');
                    }

                    const chatData = {
                        name: `Chat with ${activeChatData.agentData.name || 'Agent'}`,
                        chatType: 'direct',
                        propertyId: activeChatData.propertyData?.id?.toString(),
                        participantIds: [parseInt(agentId)] // Ensure agent ID is included
                    };

                    console.log('🆕 Creating backend chat with data:', chatData);
                    const createdChat = await chatService.createChat(chatData);

                    if (createdChat && createdChat.id) {
                        backendChatId = createdChat.id;
                        console.log('✅ Backend chat created with ID:', backendChatId);

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

            // Send message to backend if we have a chat ID
            if (backendChatId) {
                try {
                    const messagePayload = {
                        chatId: backendChatId,
                        content: newMessage.trim(),
                        messageType: uploadedFiles.length > 0 ? 'file' : 'text',
                        files: uploadedFiles.length > 0 ? uploadedFiles : undefined
                    };

                    console.log('📨 Sending message payload:', messagePayload);
                    await chatService.sendMessage(messagePayload);
                } catch (error) {
                    console.error('❌ Failed to send message to backend:', error);
                    // Continue to update UI anyway
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
                        messages: [...chat.messages, newMessageObj],
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
                                <span>📏 {property.areaSqft}</span>
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
                            {agent.agency && (
                                <div style={{
                                    color: '#64748b',
                                    fontSize: '10px',
                                    marginBottom: '4px'
                                }}>
                                    🏢 {agent.agency}
                                </div>
                            )}
                            {agent.licenseNumber && (
                                <div style={{
                                    color: '#64748b',
                                    fontSize: '10px',
                                    marginBottom: '6px'
                                }}>
                                    📋 License: {agent.licenseNumber}
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

    const chatTypeOptions = [
        {
            label: 'All Chats',
            value: 'all',
            icon: <MessageOutlined />
        },
        {
            label: 'Client Chats',
            value: 'client',
            icon: <UserOutlined />
        },
        {
            label: 'Agent Chats',
            value: 'agent',
            icon: <TeamOutlined />
        }
    ];

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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <Title level={4} style={{
                        color: '#1B3C53',
                        fontSize: '16px',
                        margin: 0
                    }}>
                        Messages
                    </Title>
                    <Button
                        type="text"
                        icon={<ReloadOutlined />}
                        onClick={() => loadExistingChats(chatType)}
                        loading={loadingChats}
                        size="small"
                    />
                </div>
                <Search
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                        borderRadius: 0,
                        width: '100%',
                        marginBottom: '12px'
                    }}
                />
                <Segmented
                    options={chatTypeOptions}
                    value={chatType}
                    onChange={setChatType}
                    block
                    size="small"
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
                        { key: 'all', label: 'All' },
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
                                            <Badge
                                                count={chat.chatTypeBadge}
                                                size="small"
                                                style={{
                                                    backgroundColor: '#f0f0f0',
                                                    color: '#666',
                                                    fontSize: '10px',
                                                    marginLeft: '8px'
                                                }}
                                            />
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
                                            <Text type="secondary" style={{
                                                fontSize: '11px',
                                                flexShrink: 0,
                                                marginLeft: '8px'
                                            }}>
                                                {chat.time}
                                            </Text>
                                        </div>
                                    </div>
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
                            {searchQuery ? 'No chats match your search' :
                                chatType === 'all' ? 'No chats available' :
                                    `No ${chatType} chats available`}
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
                                                    {activeChatData.isAgentChat && ' • Real Estate Agent'}
                                                    {activeChatData.chatTypeBadge && ` • ${activeChatData.chatTypeBadge}`}
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