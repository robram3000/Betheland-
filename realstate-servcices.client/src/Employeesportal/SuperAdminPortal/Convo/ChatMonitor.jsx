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
    Alert
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
    ExclamationCircleOutlined
} from '@ant-design/icons';
import chatService from '../../AdminPortal/Convo/chatService';
import GlobalAdminNavigation from '../Navigation/GlobalAdminNavigation';
import GlobalAdminTopbar from '../Navigation/GlobalAdminTopbar';

const { Content, Sider } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;

const ChatMonitor = () => {
    const [chats, setChats] = useState([]);
    const [filteredChats, setFilteredChats] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedChat, setSelectedChat] = useState(null);
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
            console.log('📊 Data type:', typeof chatData);
            console.log('🔢 Is array:', Array.isArray(chatData));
            console.log('📏 Data length:', chatData?.length);

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
                        lastMessage: chat.lastMessage,
                        lastMessageAt: chat.lastMessageAt,
                        createdAt: chat.createdAt,
                        updatedAt: chat.updatedAt,
                        participants: chat.participants || [],
                        messages: chat.messages || []
                    };
                }).filter(chat => chat !== null);

                console.log('🎉 Processed chats:', processedChats);
                console.log('📊 Processed chats count:', processedChats.length);

                if (processedChats.length === 0) {
                    console.warn('⚠️ No chats found after processing');
                    setError('No chats found. The API returned an empty array.');
                }

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
            chat.lastMessage?.toLowerCase().includes(term.toLowerCase())
        );
        setFilteredChats(filtered);
    };

    // Handle search
    const handleSearch = (value) => {
        setSearchTerm(value);
        filterChats(value);
    };

    // Handle chat selection
    const handleChatSelect = (chat) => {
        setSelectedChat(chat);
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
        const currentUserId = chatService.getCurrentUserId();
        const participant = chat.participants?.find(p => p.baseMemberId === currentUserId);
        return participant?.unreadCount || 0;
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
                    key: 'mark-read',
                    icon: <CheckOutlined />,
                    label: 'Mark as Read',
                    onClick: () => handleMarkAsRead(chat.id)
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

    // Mark chat as read
    const handleMarkAsRead = async (chatId) => {
        try {
            // Implementation depends on your API
            message.success('Chat marked as read');
            loadChats(); // Refresh the list
        } catch (error) {
            console.error('Error marking chat as read:', error);
            message.error('Failed to mark chat as read');
        }
    };

    // Refresh single chat
    const handleRefreshChat = async (chatId) => {
        try {
            const chat = await chatService.getChat(chatId);
            setChats(prev => prev.map(c => c.id === chatId ? chat : c));
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
                              
                            </div>
                        </div>

                        <Divider style={{ margin: '16px 0' }} />

                      

                        {/* Search and Controls */}
                        <div style={{ marginBottom: 16 }}>
                            <Search
                                placeholder="Search chats, participants, or messages..."
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

                        {/* Chats List */}
                        <Card
                            bodyStyle={{ padding: 0 }}
                            style={{ height: 'calc(100vh - 200px)', overflow: 'hidden' }}
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

                        {/* Selected Chat Details Panel */}
                        {selectedChat && (
                            <Card
                                title={`Chat Details: ${selectedChat.name}`}
                                style={{
                                    position: 'fixed',
                                    right: 20,
                                    top: 100,
                                    width: 400,
                                    height: 'calc(100vh - 140px)',
                                    zIndex: 1000
                                }}
                                extra={
                                    <Button
                                        type="text"
                                        onClick={() => setSelectedChat(null)}
                                    >
                                        Close
                                    </Button>
                                }
                            >
                                <div style={{ overflowY: 'auto', height: 'calc(100% - 60px)' }}>
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

                                        <div>
                                            <Text strong>Last Activity:</Text>
                                            <br />
                                            <Text type="secondary">
                                                {formatLastMessageTime(selectedChat.lastMessageAt)}
                                            </Text>
                                        </div>

                                        <div>
                                            <Text strong>Created:</Text>
                                            <br />
                                            <Text type="secondary">
                                                {selectedChat.createdAt ? new Date(selectedChat.createdAt).toLocaleString() : 'Unknown'}
                                            </Text>
                                        </div>

                                        {selectedChat.lastMessage && (
                                            <div>
                                                <Text strong>Last Message:</Text>
                                                <Card size="small" style={{ marginTop: 8 }}>
                                                    <Text>{selectedChat.lastMessage}</Text>
                                                </Card>
                                            </div>
                                        )}
                                    </Space>
                                </div>
                            </Card>
                        )}
                    </Content>
                </Layout>
            </Layout>
        </Layout>
    );
};

export default ChatMonitor;