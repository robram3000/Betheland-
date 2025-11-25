import React, { useState, useEffect, useRef } from 'react';
import {
    Layout,
    Card,
    List,
    Avatar,
    Badge,
    Input,
    Button,
    Space,
    Typography,
    Divider,
    Dropdown,
    Menu,
    message,
    Tooltip,
    Spin,
    Alert,
    Tag,
    Image,
    Collapse,
    Empty
} from 'antd';
import {
    SearchOutlined,
    MoreOutlined,
    EyeOutlined,
    MessageOutlined,
    UserOutlined,
    ClockCircleOutlined,
    ReloadOutlined,
    CheckOutlined,
    ExclamationCircleOutlined,
    HomeOutlined,
    FileTextOutlined,
    PictureOutlined
} from '@ant-design/icons';
import chatService from '../../AdminPortal/Convo/chatService';
import GlobalAdminNavigation from '../Navigation/GlobalAdminNavigation';
import GlobalAdminTopbar from '../Navigation/GlobalAdminTopbar';

const { Content, Sider } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Panel } = Collapse;

const ChatMonitor = () => {
    const [chats, setChats] = useState([]);
    const [filteredChats, setFilteredChats] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedChat, setSelectedChat] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [collapsed, setCollapsed] = useState(false);
    const [error, setError] = useState(null);
    const refreshIntervalRef = useRef(null);

    // Load chats with comprehensive error handling
    const loadChats = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('🔄 Loading chats...');
            const chatData = await chatService.getUserChats();
            console.log('📦 Raw chat data from service:', chatData);

            if (chatData && Array.isArray(chatData)) {
                console.log('✅ Received array of chats, processing...');

                // Process chats with better validation
                const processedChats = chatData.map(chat => {
                    if (!chat) return null;

                    return {
                        id: chat.id || chat.chatId || `chat-${Math.random()}`,
                        chatNo: chat.chatNo || 'N/A',
                        name: chat.name || 'Unnamed Chat',
                        chatType: chat.chatType || 'direct',
                        propertyId: chat.propertyId,
                        property: chat.property || null,
                        lastMessage: chat.lastMessage,
                        lastMessageAt: chat.lastMessageAt,
                        createdAt: chat.createdAt,
                        updatedAt: chat.updatedAt,
                        participants: chat.participants || [],
                        messages: chat.messages || [],
                        unreadCount: chat.unreadCount || 0
                    };
                }).filter(chat => chat !== null);

                console.log('🎉 Processed chats:', processedChats);
                setChats(processedChats);
                setFilteredChats(processedChats);
            } else {
                console.warn('⚠️ chatData is not an array:', chatData);
                setError('Invalid response format: expected array of chats');
                setChats([]);
                setFilteredChats([]);
            }
        } catch (error) {
            console.error('💥 Error loading chats:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to load chats';
            setError(errorMessage);
            message.error(`Failed to load chats: ${errorMessage}`);
            setChats([]);
            setFilteredChats([]);
        } finally {
            setLoading(false);
        }
    };

    // Load messages for selected chat
    const loadChatMessages = async (chatId) => {
        if (!chatId) return;

        setMessagesLoading(true);
        try {
            console.log(`🔄 Loading messages for chat ${chatId}...`);
            const messages = await chatService.getChatMessages(chatId, 1, 1000); // Load all messages
            console.log(`📦 Loaded ${messages.length} messages for chat ${chatId}`);
            setChatMessages(messages);
        } catch (error) {
            console.error('💥 Error loading messages:', error);
            message.error('Failed to load messages');
            setChatMessages([]);
        } finally {
            setMessagesLoading(false);
        }
    };

    // Handle chat selection
    const handleChatSelect = async (chat) => {
        setSelectedChat(chat);
        await loadChatMessages(chat.id);
    };

    // Filter chats based on search term
    const filterChats = (term) => {
        if (!term.trim()) {
            setFilteredChats(chats);
            return;
        }

        const filtered = chats.filter(chat =>
            chat.name?.toLowerCase().includes(term.toLowerCase()) ||
            chat.participants?.some(participant =>
                participant.member?.fullName?.toLowerCase().includes(term.toLowerCase()) ||
                participant.member?.firstName?.toLowerCase().includes(term.toLowerCase()) ||
                participant.member?.lastName?.toLowerCase().includes(term.toLowerCase())
            ) ||
            chat.lastMessage?.toLowerCase().includes(term.toLowerCase()) ||
            chat.property?.title?.toLowerCase().includes(term.toLowerCase())
        );
        setFilteredChats(filtered);
    };

    // Handle search
    const handleSearch = (value) => {
        setSearchTerm(value);
        filterChats(value);
    };

    // Get participant names
    const getParticipantNames = (chat) => {
        if (!chat.participants || chat.participants.length === 0) return 'No participants';

        const names = chat.participants
            .slice(0, 3)
            .map(p => {
                const member = p.member;
                if (!member) return 'Unknown';
                return member.fullName || `${member.firstName || ''} ${member.lastName || ''}`.trim() || member.username || 'Unknown';
            })
            .filter(name => name !== 'Unknown');

        if (names.length === 0) return 'No participants';

        return names.join(', ') + (chat.participants.length > 3 ? '...' : '');
    };

    // Get unread count for chat
    const getUnreadCount = (chat) => {
        return chat.unreadCount || 0;
    };

    // Format last message time
    const formatLastMessageTime = (timestamp) => {
        if (!timestamp) return 'No messages';

        try {
            const now = new Date();
            const messageTime = new Date(timestamp);
            const diffMs = now - messageTime;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);

            if (diffMins < 1) return 'Just now';
            if (diffMins < 60) return `${diffMins}m ago`;
            if (diffHours < 24) return `${diffHours}h ago`;
            if (diffDays < 7) return `${diffDays}d ago`;

            return messageTime.toLocaleDateString();
        } catch (error) {
            return 'Invalid date';
        }
    };

    // Format message time for display
    const formatMessageTime = (timestamp) => {
        if (!timestamp) return '';
        try {
            return new Date(timestamp).toLocaleString();
        } catch (error) {
            return 'Invalid date';
        }
    };

    // Render message content based on type
    const renderMessageContent = (message) => {
        if (message.isDeleted) {
            return <Text type="secondary" italic>[This message was deleted]</Text>;
        }

        if (message.messageType === 'file' && message.files && message.files.length > 0) {
            return (
                <Space direction="vertical" size="small">
                    <Text>{message.content}</Text>
                    {message.files.map(file => (
                        <div key={file.id} style={{ marginTop: 4 }}>
                            {file.fileType?.startsWith('image/') ? (
                                <Space>
                                    <PictureOutlined />
                                    <Text strong>Image:</Text>
                                    <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                                        {file.fileName}
                                    </a>
                                </Space>
                            ) : (
                                <Space>
                                    <FileTextOutlined />
                                    <Text strong>File:</Text>
                                    <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                                        {file.fileName}
                                    </a>
                                    <Text type="secondary">({(file.fileSize / 1024).toFixed(1)} KB)</Text>
                                </Space>
                            )}
                        </div>
                    ))}
                </Space>
            );
        }

        return <Text>{message.content}</Text>;
    };

    // Render property information
    const renderPropertyInfo = (property) => {
        if (!property) return null;

        return (
            <Card size="small" style={{ marginTop: 16 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    {property.mainImage && (
                        <Image
                            width={80}
                            height={60}
                            src={property.mainImage}
                            alt={property.title}
                            fallback="/default-property.jpg"
                            style={{ borderRadius: 6, objectFit: 'cover' }}
                        />
                    )}
                    <div style={{ flex: 1 }}>
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                            <div>
                                <Text strong>{property.title}</Text>
                            </div>
                            <div>
                                <Text type="secondary">{property.type}</Text>
                            </div>
                            <div>
                                <Text strong>₱{property.price?.toLocaleString()}</Text>
                            </div>
                            <div>
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                    {property.address}, {property.city}, {property.state}
                                </Text>
                            </div>
                            <div>
                                <Tag color={property.status === 'available' ? 'green' : 'orange'}>
                                    {property.status}
                                </Tag>
                            </div>
                        </Space>
                    </div>
                </div>
            </Card>
        );
    };

    // Chat actions dropdown menu
    const getChatActionsMenu = (chat) => (
        <Menu
            items={[
                {
                    key: 'view',
                    icon: <EyeOutlined />,
                    label: 'View Details',
                    onClick: () => handleChatSelect(chat)
                },
                {
                    key: 'refresh',
                    icon: <ReloadOutlined />,
                    label: 'Refresh Chat',
                    onClick: () => handleRefreshChat(chat.id)
                }
            ]}
        />
    );

    // Refresh single chat
    const handleRefreshChat = async (chatId) => {
        try {
            const chat = await chatService.getChat(chatId);
            setChats(prev => prev.map(c => c.id === chatId ? chat : c));
            if (selectedChat?.id === chatId) {
                setSelectedChat(chat);
                await loadChatMessages(chatId);
            }
            message.success('Chat refreshed');
        } catch (error) {
            console.error('Error refreshing chat:', error);
            message.error('Failed to refresh chat');
        }
    };

    // Toggle auto-refresh
    const toggleAutoRefresh = () => {
        setAutoRefresh(!autoRefresh);
    };

    // Handle sidebar toggle
    const handleToggle = () => {
        setCollapsed(!collapsed);
    };

    // Set up auto-refresh
    useEffect(() => {
        if (autoRefresh) {
            refreshIntervalRef.current = setInterval(() => {
                loadChats();
            }, 30000); // Refresh every 30 seconds
        } else {
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
            }
        }

        return () => {
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
            }
        };
    }, [autoRefresh]);

    // Load chats on component mount
    useEffect(() => {
        loadChats();
    }, []);

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {/* Global Topbar */}
            <GlobalAdminTopbar onToggle={handleToggle} collapsed={collapsed} />

            <Layout>
                {/* Global Navigation Sidebar */}
                <GlobalAdminNavigation collapsed={collapsed} />

                {/* Main Content Area */}
                <Layout
                    style={{
                        marginLeft: collapsed ? 80 : 200,
                        marginTop: 52,
                        transition: 'all 0.2s',
                        background: 'transparent'
                    }}
                >
                    <Content style={{ padding: '16px', height: '100%', background: 'transparent' }}>
                        {/* Header */}
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <Title level={4} style={{ margin: 0 }}>
                                        Chat Monitor
                                    </Title>
                                    <Text type="secondary">
                                        Monitor and manage active conversations
                                    </Text>
                                </div>
                                <Space>
                                    <Button
                                        icon={<ReloadOutlined />}
                                        onClick={loadChats}
                                        loading={loading}
                                    >
                                        Refresh
                                    </Button>
                                </Space>
                            </div>
                        </div>

                        <Divider style={{ margin: '16px 0' }} />

                        {/* Error Alert */}
                        {error && (
                            <Alert
                                message="Error"
                                description={error}
                                type="error"
                                showIcon
                                closable
                                onClose={() => setError(null)}
                                style={{ marginBottom: 16 }}
                            />
                        )}

                        {/* Search and Controls */}
                        <div style={{ marginBottom: 16 }}>
                            <Search
                                placeholder="Search chats, participants, messages, or properties..."
                                allowClear
                                enterButton={<SearchOutlined />}
                                size="large"
                                onSearch={handleSearch}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    filterChats(e.target.value);
                                }}
                                value={searchTerm}
                                style={{ marginBottom: 12 }}
                            />

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text strong>
                                    {filteredChats.length} chat{filteredChats.length !== 1 ? 's' : ''} found
                                    {searchTerm && ` for "${searchTerm}"`}
                                </Text>
                                <Text type="secondary">
                                    Total unread: {chats.reduce((sum, chat) => sum + getUnreadCount(chat), 0)}
                                </Text>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 16, height: 'calc(100vh - 200px)' }}>
                            {/* Chats List */}
                            <Card
                                title="Chats"
                                style={{ flex: 1, overflow: 'hidden' }}
                                bodyStyle={{ padding: 0, height: 'calc(100% - 57px)', overflow: 'auto' }}
                            >
                                <Spin spinning={loading} tip="Loading chats...">
                                    <List
                                        dataSource={filteredChats}
                                        renderItem={(chat) => (
                                            <List.Item
                                                style={{
                                                    padding: '12px 16px',
                                                    borderBottom: '1px solid #f0f0f0',
                                                    cursor: 'pointer',
                                                    background: selectedChat?.id === chat.id ? '#f0f8ff' : 'transparent',
                                                    transition: 'background-color 0.2s'
                                                }}
                                                onClick={() => handleChatSelect(chat)}
                                                actions={[
                                                    <Dropdown
                                                        overlay={getChatActionsMenu(chat)}
                                                        trigger={['click']}
                                                        placement="bottomRight"
                                                        key="actions"
                                                    >
                                                        <Button
                                                            type="text"
                                                            icon={<MoreOutlined />}
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </Dropdown>
                                                ]}
                                            >
                                                <List.Item.Meta
                                                    avatar={
                                                        <Badge
                                                            count={getUnreadCount(chat)}
                                                            size="small"
                                                            offset={[-5, 5]}
                                                        >
                                                            <Avatar
                                                                icon={<MessageOutlined />}
                                                                style={{
                                                                    backgroundColor: getUnreadCount(chat) > 0 ? '#1890ff' : '#d9d9d9'
                                                                }}
                                                            />
                                                        </Badge>
                                                    }
                                                    title={
                                                        <Space>
                                                            <Text strong>{chat.name || 'Unnamed Chat'}</Text>
                                                            <Badge
                                                                status={
                                                                    chat.chatType === 'group' ? 'processing' :
                                                                        chat.chatType === 'direct' ? 'success' : 'default'
                                                                }
                                                                text={chat.chatType || 'direct'}
                                                            />
                                                        </Space>
                                                    }
                                                    description={
                                                        <div>
                                                            <div style={{ marginBottom: 4 }}>
                                                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                                                    Participants: {getParticipantNames(chat)}
                                                                </Text>
                                                            </div>
                                                            {chat.property && (
                                                                <div style={{ marginBottom: 4 }}>
                                                                    <Space size="small">
                                                                        <HomeOutlined style={{ fontSize: '12px', color: '#52c41a' }} />
                                                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                                                            {chat.property.title}
                                                                        </Text>
                                                                    </Space>
                                                                </div>
                                                            )}
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <Text
                                                                    ellipsis={{ tooltip: chat.lastMessage || 'No messages' }}
                                                                    style={{
                                                                        maxWidth: '200px',
                                                                        fontWeight: getUnreadCount(chat) > 0 ? '600' : '400',
                                                                        color: getUnreadCount(chat) > 0 ? '#1890ff' : 'inherit'
                                                                    }}
                                                                >
                                                                    {chat.lastMessage || 'No messages yet'}
                                                                </Text>
                                                                <Space size="small">
                                                                    <ClockCircleOutlined style={{ fontSize: '12px', color: '#999' }} />
                                                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                                                        {formatLastMessageTime(chat.lastMessageAt)}
                                                                    </Text>
                                                                </Space>
                                                            </div>
                                                        </div>
                                                    }
                                                />
                                            </List.Item>
                                        )}
                                        locale={{
                                            emptyText: loading ? 'Loading chats...' : 'No chats found'
                                        }}
                                    />
                                </Spin>
                            </Card>

                            {/* Selected Chat Details */}
                            {selectedChat ? (
                                <Card
                                    title={
                                        <Space>
                                            <Text>Chat Details: {selectedChat.name}</Text>
                                            {selectedChat.property && (
                                                <Tag icon={<HomeOutlined />} color="green">
                                                    Property Chat
                                                </Tag>
                                            )}
                                        </Space>
                                    }
                                    style={{ flex: 2, display: 'flex', flexDirection: 'column' }}
                                    bodyStyle={{ flex: 1, overflow: 'auto', padding: 0 }}
                                    extra={
                                        <Button
                                            type="text"
                                            onClick={() => {
                                                setSelectedChat(null);
                                                setChatMessages([]);
                                            }}
                                        >
                                            Close
                                        </Button>
                                    }
                                >
                                    <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
                                        <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                            <div>
                                                <Text strong>Chat ID:</Text>
                                                <br />
                                                <Text type="secondary" code style={{ fontSize: '12px', wordBreak: 'break-all' }}>
                                                    {selectedChat.id}
                                                </Text>
                                            </div>

                                            <div>
                                                <Text strong>Type:</Text>
                                                <br />
                                                <Badge
                                                    status={
                                                        selectedChat.chatType === 'group' ? 'processing' :
                                                            selectedChat.chatType === 'direct' ? 'success' : 'default'
                                                    }
                                                    text={selectedChat.chatType || 'direct'}
                                                />
                                            </div>

                                            {selectedChat.property && (
                                                <div>
                                                    <Text strong>Related Property:</Text>
                                                    {renderPropertyInfo(selectedChat.property)}
                                                </div>
                                            )}

                                            <div>
                                                <Text strong>Participants ({selectedChat.participants?.length || 0}):</Text>
                                                <List
                                                    size="small"
                                                    dataSource={selectedChat.participants || []}
                                                    renderItem={(participant) => (
                                                        <List.Item>
                                                            <List.Item.Meta
                                                                avatar={<Avatar icon={<UserOutlined />} size="small" />}
                                                                title={
                                                                    participant.member?.fullName ||
                                                                    `${participant.member?.firstName || ''} ${participant.member?.lastName || ''}`.trim() ||
                                                                    participant.member?.username ||
                                                                    'Unknown User'
                                                                }
                                                                description={participant.role}
                                                            />
                                                            <Badge
                                                                count={participant.unreadCount}
                                                                size="small"
                                                                style={{ backgroundColor: '#52c41a' }}
                                                            />
                                                        </List.Item>
                                                    )}
                                                    locale={{
                                                        emptyText: 'No participants'
                                                    }}
                                                />
                                            </div>
                                        </Space>
                                    </div>

                                    {/* Messages Section */}
                                    <div style={{ padding: '16px', flex: 1, overflow: 'auto' }}>
                                        <div style={{ marginBottom: 16 }}>
                                            <Text strong>Messages ({chatMessages.length}):</Text>
                                            <Button
                                                icon={<ReloadOutlined />}
                                                size="small"
                                                onClick={() => loadChatMessages(selectedChat.id)}
                                                loading={messagesLoading}
                                                style={{ marginLeft: 8 }}
                                            >
                                                Refresh
                                            </Button>
                                        </div>

                                        <Spin spinning={messagesLoading}>
                                            {chatMessages.length > 0 ? (
                                                <List
                                                    dataSource={chatMessages.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt))}
                                                    renderItem={(message) => (
                                                        <List.Item style={{ border: 'none', padding: '8px 0' }}>
                                                            <Card size="small" style={{ width: '100%' }}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                                    <div style={{ flex: 1 }}>
                                                                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                                <Space>
                                                                                    <Avatar
                                                                                        size="small"
                                                                                        src={message.sender?.profileImage}
                                                                                        icon={<UserOutlined />}
                                                                                    />
                                                                                    <Text strong>{message.sender?.fullName || 'Unknown User'}</Text>
                                                                                    {message.isEdited && (
                                                                                        <Text type="secondary" italic style={{ fontSize: '12px' }}>
                                                                                            (edited)
                                                                                        </Text>
                                                                                    )}
                                                                                </Space>
                                                                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                                                                    {formatMessageTime(message.sentAt)}
                                                                                </Text>
                                                                            </div>
                                                                            <div>
                                                                                {renderMessageContent(message)}
                                                                            </div>
                                                                            {message.reactions && message.reactions.length > 0 && (
                                                                                <div>
                                                                                    <Space size="small">
                                                                                        {message.reactions.map(reaction => (
                                                                                            <Tooltip key={reaction.id} title={reaction.member?.fullName}>
                                                                                                <span>{reaction.emoji}</span>
                                                                                            </Tooltip>
                                                                                        ))}
                                                                                    </Space>
                                                                                </div>
                                                                            )}
                                                                        </Space>
                                                                    </div>
                                                                </div>
                                                            </Card>
                                                        </List.Item>
                                                    )}
                                                    locale={{
                                                        emptyText: 'No messages'
                                                    }}
                                                />
                                            ) : (
                                                <Empty description="No messages in this chat" />
                                            )}
                                        </Spin>
                                    </div>
                                </Card>
                            ) : (
                                <Card
                                    style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    <Empty
                                        description="Select a chat to view details and messages"
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    />
                                </Card>
                            )}
                        </div>
                    </Content>
                </Layout>
            </Layout>
        </Layout>
    );
};

export default ChatMonitor;