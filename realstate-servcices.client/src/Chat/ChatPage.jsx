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
import chatService from '../Employeesportal/AdminPortal/Convo/chatService';

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

    const [chats, setChats] = useState([]);

    useEffect(() => {
        if (propertyChatData) {
            console.log('Property chat data received:', propertyChatData);

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

            const existingAgentChatIndex = chats.findIndex(chat =>
                chat.id === agentChatId || chat.isAgentChat
            );

            if (existingAgentChatIndex === -1) {
                setChats(prev => [newAgentChat, ...prev]);
            } else {
                const updatedChats = [...chats];
                updatedChats[existingAgentChatIndex] = {
                    ...updatedChats[existingAgentChatIndex],
                    ...newAgentChat,
                    unread: updatedChats[existingAgentChatIndex].unread + 1
                };
                setChats(updatedChats);
            }

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

    const handleSendMessage = async () => {
        if (newMessage.trim() === '' && fileList.length === 0) return;

        try {
            if (activeChatData?.isAgentChat) {
                await handleSendToAgent();
            } else {
                handleSendRegularMessage();
            }
        } catch (error) {
            console.error('Error sending message:', error);
            message.error('Failed to send message');
        }
    };

    const handleSendToAgent = async () => {
        try {
            let uploadedFiles = [];
            if (fileList.length > 0) {
                for (const file of fileList) {
                    try {
                        const uploadResult = await chatService.uploadFile(file);
                        if (uploadResult.success) {
                            uploadedFiles.push({
                                name: file.name,
                                type: file.type,
                                url: uploadResult.fileUrl,
                                size: file.size
                            });
                        }
                    } catch (error) {
                        console.error('File upload failed:', error);
                        message.error('File upload failed');
                        return;
                    }
                }
            }

            let backendChatId = activeChatData.backendChatId;

            if (!backendChatId) {
                try {
                    const chatData = {
                        name: `Chat with ${activeChatData.agentData?.name || 'Agent'}`,
                        chatType: 'direct',
                        propertyId: activeChatData.propertyData?.id?.toString(),
                        participantIds: [activeChatData.agentData?.id].filter(Boolean)
                    };

                    console.log('Creating backend chat with data:', chatData);
                    const createdChat = await chatService.createChat(chatData);

                    // FIX: Check if createdChat is valid
                    if (!createdChat || !createdChat.id) {
                        console.warn('Chat creation returned invalid data:', createdChat);
                        // Fallback: Use local chat only
                        handleSendRegularMessage();
                        return;
                    }

                    backendChatId = createdChat.id;

                    setChats(prev => prev.map(chat =>
                        chat.id === activeChatData.id
                            ? { ...chat, backendChatId: createdChat.id }
                            : chat
                    ));

                } catch (error) {
                    console.error('Failed to create backend chat:', error);
                    // FIX: Fallback to regular message instead of showing error
                    console.log('Falling back to local chat mode');
                    handleSendRegularMessage();
                    return;
                }
            }

            if (backendChatId) {
                try {
                    const messagePayload = {
                        chatId: backendChatId,
                        content: newMessage,
                        messageType: uploadedFiles.length > 0 ? 'file' : 'text',
                        files: uploadedFiles.length > 0 ? uploadedFiles : undefined
                    };

                    console.log('Sending message with payload:', messagePayload);
                    await chatService.sendMessage(messagePayload);

                    // Also update local state for immediate UI feedback
                    handleSendRegularMessage();

                } catch (error) {
                    console.error('Failed to send message via service:', error);
                    // Fallback to local message
                    handleSendRegularMessage();
                }
            }
        } catch (error) {
            console.error('Error in handleSendToAgent:', error);
            // Final fallback
            handleSendRegularMessage();
        }
    };

    const handleSendRegularMessage = () => {
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

        setFileList(prev => [...prev, file]);
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
                <Col xs={0} md={6} lg={5} style={{
                    padding: 0,
                    margin: 0,
                    height: '100%',
                    borderRight: '1px solid #e2e8f0'
                }}>
                    {chatListContent}
                </Col>

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
                                        {activeChatData.isAgentChat && <PropertyCard />}

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

                                <FileAttachments />

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
                                        />
                                        <Button
                                            type="primary"
                                            icon={<SendOutlined />}
                                            onClick={handleSendMessage}
                                            disabled={!newMessage.trim() && fileList.length === 0}
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
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>

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