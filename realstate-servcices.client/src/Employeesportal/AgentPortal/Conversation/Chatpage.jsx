// ChatPage.jsx - Updated with mock data
import React, { useState, useRef, useEffect } from 'react';
import {
    Row, Col, Card, Input, Avatar, Typography, List, Badge, Button, Space,
    Tabs, message, Drawer, Popover, Upload, Modal
} from 'antd';
import {
    SearchOutlined, MoreOutlined, WechatOutlined,
    SendOutlined, InfoCircleOutlined,
    LeftOutlined, SmileOutlined, EyeOutlined,
    PaperClipOutlined, FileImageOutlined, FileOutlined,
    PlayCircleOutlined, DeleteOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Search } = Input;
const { TextArea } = Input;
const { Title, Text } = Typography;

const ChatPage = ({ propertyChatData }) => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeChat, setActiveChat] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
    const [fileList, setFileList] = useState([]);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const textAreaRef = useRef(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    // Common emojis for the picker
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

    // Mock chat data
    const mockChats = [
        {
            id: 'chat-1',
            name: 'Maria Santos',
            lastMessage: 'Hi! I saw your property listing',
            time: '2 min ago',
            unread: 2,
            type: 'direct',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
            online: true,
            isAgentChat: true,
            agentData: {
                id: 1,
                name: 'Maria Santos',
                profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
                phone: '+63 912 345 6789',
                email: 'maria.santos@realestate.com'
            },
            propertyData: {
                id: 101,
                title: 'Modern Condo in BGC',
                address: 'Bonifacio Global City, Taguig',
                price: 8500000,
                propertyType: 'Condominium',
                bedrooms: 2,
                bathrooms: 2,
                areaSqft: '65 sqm',
                mainImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=300&h=200&fit=crop'
            },
            messages: [
                {
                    id: 1,
                    text: 'Hi! I saw your property listing in BGC and I\'m very interested.',
                    sender: 'me',
                    time: '10:30 AM'
                },
                {
                    id: 2,
                    text: 'Hello! Thank you for your interest in our BGC property. It\'s a great unit with amazing city views.',
                    sender: 'them',
                    time: '10:32 AM'
                },
                {
                    id: 3,
                    text: 'Can I schedule a viewing this weekend?',
                    sender: 'me',
                    time: '10:33 AM'
                }
            ]
        },
        {
            id: 'chat-2',
            name: 'John Reyes',
            lastMessage: 'About the Makati property...',
            time: '1 hour ago',
            unread: 0,
            type: 'direct',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            online: true,
            isAgentChat: true,
            agentData: {
                id: 2,
                name: 'John Reyes',
                profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
                phone: '+63 917 654 3210',
                email: 'john.reyes@realestate.com'
            },
            propertyData: {
                id: 102,
                title: 'Luxury House in Alabang',
                address: 'Ayala Alabang Village, Muntinlupa',
                price: 25000000,
                propertyType: 'House',
                bedrooms: 4,
                bathrooms: 3,
                areaSqft: '250 sqm',
                mainImage: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=300&h=200&fit=crop'
            },
            messages: [
                {
                    id: 1,
                    text: 'Good morning! I have some questions about the Alabang property.',
                    sender: 'me',
                    time: '9:15 AM'
                },
                {
                    id: 2,
                    text: 'Good morning! I\'d be happy to answer any questions you have about the house.',
                    sender: 'them',
                    time: '9:20 AM'
                }
            ]
        },
        {
            id: 'chat-3',
            name: 'Sarah Lim',
            lastMessage: 'Payment details received',
            time: '3 hours ago',
            unread: 0,
            type: 'direct',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
            online: false,
            isAgentChat: true,
            agentData: {
                id: 3,
                name: 'Sarah Lim',
                profilePicture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
                phone: '+63 918 765 4321',
                email: 'sarah.lim@realestate.com'
            },
            propertyData: {
                id: 103,
                title: 'Beachfront Condo in Boracay',
                address: 'Station 1, Boracay Island',
                price: 12000000,
                propertyType: 'Beach Condo',
                bedrooms: 3,
                bathrooms: 2,
                areaSqft: '85 sqm',
                mainImage: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=300&h=200&fit=crop'
            },
            messages: [
                {
                    id: 1,
                    text: 'The beachfront condo looks amazing!',
                    sender: 'me',
                    time: 'Yesterday'
                },
                {
                    id: 2,
                    text: 'Yes, it has direct beach access and stunning sunset views!',
                    sender: 'them',
                    time: 'Yesterday'
                }
            ]
        },
        {
            id: 'chat-4',
            name: 'Carlos Garcia',
            lastMessage: 'I will send the documents tomorrow',
            time: '5 hours ago',
            unread: 1,
            type: 'direct',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            online: true,
            isAgentChat: true,
            agentData: {
                id: 4,
                name: 'Carlos Garcia',
                profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
                phone: '+63 919 876 5432',
                email: 'carlos.garcia@realestate.com'
            },
            propertyData: {
                id: 104,
                title: 'Townhouse in Quezon City',
                address: 'Tomas Morato, Quezon City',
                price: 6500000,
                propertyType: 'Townhouse',
                bedrooms: 3,
                bathrooms: 2,
                areaSqft: '120 sqm',
                mainImage: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=300&h=200&fit=crop'
            },
            messages: [
                {
                    id: 1,
                    text: 'Hi, is the townhouse still available?',
                    sender: 'me',
                    time: '4 hours ago'
                }
            ]
        }
    ];

    // Initialize with mock chats
    const [chats, setChats] = useState(mockChats);

    // Set first chat as active by default
    useEffect(() => {
        if (chats.length > 0 && !activeChat) {
            setActiveChat(chats[0].id);
        }
    }, [chats, activeChat]);

    // Use property chat data if available
    useEffect(() => {
        if (propertyChatData) {
            console.log('Property chat data received:', propertyChatData);

            // Create a new chat entry for the agent
            const agentChatId = `agent-${propertyChatData.agent?.id || Date.now()}`;

            const newAgentChat = {
                id: agentChatId,
                name: propertyChatData.agent?.name || 'Contact Agent',
                lastMessage: 'Property enquiry',
                time: 'Now',
                unread: 1,
                type: 'direct',
                avatar: propertyChatData.agent?.profilePicture || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
                online: true,
                isAgentChat: true,
                agentData: propertyChatData.agent,
                propertyData: propertyChatData.property,
                messages: [
                    {
                        id: 1,
                        text: `Hi! I'm interested in the property at ${propertyChatData.property?.address}`,
                        sender: 'me',
                        time: 'Just now'
                    }
                ]
            };

            // Check if this agent chat already exists
            const existingAgentChatIndex = chats.findIndex(chat =>
                chat.id === agentChatId || chat.isAgentChat
            );

            if (existingAgentChatIndex === -1) {
                // Add new agent chat to the beginning of the list
                setChats(prev => [newAgentChat, ...prev]);
            } else {
                // Update existing agent chat
                const updatedChats = [...chats];
                updatedChats[existingAgentChatIndex] = {
                    ...updatedChats[existingAgentChatIndex],
                    ...newAgentChat,
                    unread: updatedChats[existingAgentChatIndex].unread + 1
                };
                setChats(updatedChats);
            }

            // Set this as active chat
            setActiveChat(agentChatId);
        }
    }, [propertyChatData]);

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

    const handleSendMessage = () => {
        if (newMessage.trim() === '' && fileList.length === 0) return;

        // Create message with files
        const messageData = {
            text: newMessage,
            files: fileList.map(file => ({
                name: file.name,
                type: file.type,
                url: file.url || URL.createObjectURL(file),
                size: file.size
            }))
        };

        // Add message to active chat
        if (activeChatData) {
            const newMessageObj = {
                id: Date.now(),
                text: newMessage,
                sender: 'me',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                files: fileList.length > 0 ? fileList.map(file => ({
                    name: file.name,
                    type: file.type,
                    url: file.url || URL.createObjectURL(file),
                    size: file.size
                })) : undefined
            };

            // Simulate agent reply after 1-2 seconds
            setTimeout(() => {
                const agentReply = {
                    id: Date.now() + 1,
                    text: 'Thank you for your message! I\'ll get back to you shortly with more information.',
                    sender: 'them',
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };

                setChats(prev => prev.map(chat =>
                    chat.id === activeChat
                        ? {
                            ...chat,
                            messages: [...chat.messages, agentReply],
                            lastMessage: agentReply.text,
                            time: 'Now',
                            unread: 0
                        }
                        : chat
                ));
            }, 1000 + Math.random() * 1000);

            setChats(prev => prev.map(chat =>
                chat.id === activeChat
                    ? {
                        ...chat,
                        messages: [...chat.messages, newMessageObj],
                        lastMessage: newMessage,
                        time: 'Now',
                        unread: 0
                    }
                    : chat
            ));
        }

        message.success('Message sent! 🎉');
        setNewMessage('');
        setFileList([]);
        setEmojiPickerVisible(false);
    };

    const handleEmojiClick = (emoji) => {
        const textArea = textAreaRef.current?.resizableTextArea?.textArea;
        if (textArea) {
            const start = textArea.selectionStart;
            const end = textArea.selectionEnd;
            const text = newMessage;
            const newText = text.substring(0, start) + emoji + text.substring(end);
            setNewMessage(newText);

            setTimeout(() => {
                textArea.focus();
                textArea.setSelectionRange(start + emoji.length, start + emoji.length);
            }, 0);
        } else {
            setNewMessage(prev => prev + emoji);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [activeChatData?.messages]);

    // File handling functions
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

        // Add file to fileList
        setFileList(prev => [...prev, file]);
        return false; // Prevent automatic upload
    };

    const handleFileRemove = (file) => {
        setFileList(prev => prev.filter(f => f.uid !== file.uid));
    };

    const handlePreview = (file) => {
        if (file.type.startsWith('image/')) {
            setPreviewImage(file.url || URL.createObjectURL(file));
            setPreviewVisible(true);
        } else if (file.type.startsWith('video/')) {
            // For videos, we'll open in a new tab or use a video player
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

    // Format price in Philippine Pesos
    const formatPrice = (price) => {
        if (typeof price === 'number') {
            return `₱${price.toLocaleString('en-PH')}`;
        }
        return price || '₱0';
    };

    // Property Card Component (inside chat messages)
    const PropertyCard = () => {
        if (!activeChatData?.propertyData) return null;

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
                        {/* Property Image */}
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

                        {/* Property Details */}
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

                            {/* Property Features */}
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

                            {/* Price and View Button */}
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
                                    onClick={() => navigate('/property', { state: { propertyId: property.id } })}
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

    // File attachment preview component
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

    // Simple emoji picker component
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
            {/* Search Header */}
            <div style={{
                padding: '16px',
                borderBottom: '1px solid #f1f5f9',
                flexShrink: 0
            }}>
                <Title level={4} style={{
                    color: '#1B3C53',
                    marginBottom: '12px',
                    fontSize: '16px',
                    margin: 0
                }}>
                    Search Messenger
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

            {/* Tabs - Only All and Unread */}
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

            {/* Chat List */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                minHeight: 0
            }}>
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
                                        alignItems: 'center',
                                        width: '100%'
                                    }}>
                                        <Text strong style={{
                                            color: '#1B3C53',
                                            fontSize: '13px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
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
                                    <div style={{ marginTop: '2px' }}>
                                        <Text
                                            style={{
                                                color: '#64748b',
                                                fontSize: '12px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                display: 'block',
                                                width: '100%'
                                            }}
                                        >
                                            {chat.lastMessage}
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
                {/* Chat List Sidebar - Always on left */}
                <Col xs={0} md={6} lg={5} style={{
                    padding: 0,
                    margin: 0,
                    height: '100%',
                    borderRight: '1px solid #e2e8f0'
                }}>
                    {chatListContent}
                </Col>

                {/* Chat Area - Takes remaining space */}
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
                                            {/* Mobile Back Button - Only visible on mobile */}
                                            <Button
                                                type="text"
                                                icon={<LeftOutlined />}
                                                onClick={() => setSidebarVisible(true)}
                                                style={{
                                                    color: '#1B3C53',
                                                    padding: '4px 8px',
                                                    display: { xs: 'block', md: 'none' }
                                                }}
                                                className="mobile-back-button"
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
                                        {/* Property Card - Inside messages area */}
                                        {activeChatData.isAgentChat && <PropertyCard />}

                                        {/* Regular Messages */}
                                        {activeChatData.messages && activeChatData.messages.length > 0 ? (
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

                                {/* File Attachments Preview */}
                                <FileAttachments />

                                {/* Message Input - Fixed at bottom */}
                                <div style={{
                                    padding: '12px 16px',
                                    borderTop: '1px solid #f1f5f9',
                                    background: 'white',
                                    flexShrink: 0
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'flex-end',
                                        gap: '8px'
                                    }}>
                                        {/* File Upload Button */}
                                        <Upload
                                            beforeUpload={beforeUpload}
                                            showUploadList={false}
                                            multiple
                                            accept="image/*,video/*"
                                        >
                                            <Button
                                                type="text"
                                                icon={<PaperClipOutlined style={{ color: '#64748b' }} />}
                                                style={{
                                                    padding: '4px 8px',
                                                    height: 'auto'
                                                }}
                                            />
                                        </Upload>

                                        {/* Emoji Picker */}
                                        <Popover
                                            content={<EmojiPickerContent />}
                                            trigger="click"
                                            open={emojiPickerVisible}
                                            onOpenChange={setEmojiPickerVisible}
                                            placement="topLeft"
                                        >
                                            <Button
                                                type="text"
                                                icon={<SmileOutlined style={{ color: '#64748b' }} />}
                                                style={{
                                                    padding: '4px 8px',
                                                    height: 'auto'
                                                }}
                                            />
                                        </Popover>

                                        {/* Message Input */}
                                        <TextArea
                                            ref={textAreaRef}
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            placeholder="Type a message..."
                                            autoSize={{ minRows: 1, maxRows: 4 }}
                                            style={{
                                                flex: 1,
                                                borderRadius: '20px',
                                                padding: '8px 12px',
                                                fontSize: '13px',
                                                resize: 'none'
                                            }}
                                        />

                                        {/* Send Button */}
                                        <Button
                                            type="primary"
                                            icon={<SendOutlined />}
                                            onClick={handleSendMessage}
                                            disabled={!newMessage.trim() && fileList.length === 0}
                                            style={{
                                                background: '#1B3C53',
                                                borderColor: '#1B3C53',
                                                borderRadius: '50%',
                                                width: '36px',
                                                height: '36px',
                                                padding: 0,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: '100%',
                                color: '#64748b',
                                textAlign: 'center'
                            }}>
                                <WechatOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                                <Title level={4} style={{ color: '#64748b', marginBottom: '8px' }}>
                                    Welcome to Messenger
                                </Title>
                                <Text style={{ fontSize: '13px' }}>
                                    Select a conversation to start messaging
                                </Text>
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>

            {/* Mobile Drawer for Chat List */}
            <Drawer
                title="Chats"
                placement="left"
                onClose={() => setSidebarVisible(false)}
                open={sidebarVisible}
                width={280}
                bodyStyle={{ padding: 0 }}
            >
                {chatListContent}
            </Drawer>

            {/* Image Preview Modal */}
            <Modal
                open={previewVisible}
                footer={null}
                onCancel={() => setPreviewVisible(false)}
                width="auto"
                style={{ maxWidth: '90vw' }}
            >
                <img alt="Preview" style={{ width: '100%' }} src={previewImage} />
            </Modal>
        </div>
    );
};

export default ChatPage;