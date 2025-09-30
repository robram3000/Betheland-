// ChatPage.jsx
import React, { useState, useRef, useEffect } from 'react';
import {
    Row, Col, Card, Input, Avatar, Typography, List, Badge, Button, Space,
    Tabs, message, Drawer, Popover
} from 'antd';
import {
    SearchOutlined, MoreOutlined, WechatOutlined, TeamOutlined,
    SendOutlined, PhoneOutlined, VideoCameraOutlined, InfoCircleOutlined,
    MenuOutlined, SmileOutlined
} from '@ant-design/icons';

const { Search } = Input;
const { TextArea } = Input;
const { Title, Text } = Typography;

const ChatPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeChat, setActiveChat] = useState(1);
    const [newMessage, setNewMessage] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
    const textAreaRef = useRef(null);
    const messagesEndRef = useRef(null);

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

    // Mock chat data matching your image structure
    const chats = [
        {
            id: 1,
            name: 'Account Sandoval',
            lastMessage: 'Ranked 5% by your message >7%',
            time: '2m',
            unread: 3,
            type: 'direct',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            online: true,
            messages: [
                { id: 1, text: 'Hello! 👋 I need help with my account', sender: 'them', time: '2:30 PM' },
                { id: 2, text: 'Sure, what seems to be the problem? 😊', sender: 'me', time: '2:31 PM' },
                { id: 3, text: 'Ranked 5% by your message >7% 📈', sender: 'them', time: '2:32 PM' }
            ]
        },
        {
            id: 2,
            name: 'Data Engineering Pilipvax',
            lastMessage: 'ATL, SCA, DAT, GET type A+',
            time: '5m',
            unread: 0,
            type: 'group',
            avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&h=150&fit=crop',
            online: false,
            members: 24,
            messages: [
                { id: 1, text: 'Welcome to the Data Engineering group!', sender: 'them', time: '1:30 PM' }
            ]
        },
        {
            id: 3,
            name: 'Data Engineering Software',
            lastMessage: 'Display Cloud Allowance B+',
            time: '2h',
            unread: 1,
            type: 'group',
            avatar: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=150&h=150&fit=crop',
            online: false,
            members: 15,
            messages: [
                { id: 1, text: 'Cloud allowance updated for this month', sender: 'them', time: '12:30 PM' }
            ]
        },
        {
            id: 4,
            name: 'Dolphin',
            lastMessage: 'Yes, Yes Are... Its...',
            time: '3h',
            unread: 0,
            type: 'direct',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
            online: true,
            messages: [
                { id: 1, text: 'Hi there!', sender: 'them', time: '11:30 AM' }
            ]
        },
        {
            id: 5,
            name: 'FIZZS XP25-26',
            lastMessage: 'Android, IT, IT Graph Millions C... Ah',
            time: '4h',
            unread: 0,
            type: 'group',
            avatar: 'https://images.unsplash.com/photo-1568992688065-536aad8a12f6?w=150&h=150&fit=crop',
            online: false,
            members: 8,
            messages: [
                { id: 1, text: 'Meeting scheduled for tomorrow', sender: 'them', time: '10:30 AM' }
            ]
        },
        {
            id: 6,
            name: 'MASSIVAX RECOMMENDATION',
            lastMessage: 'Private https://youtu.be.com/Yn... St',
            time: '5h',
            unread: 12,
            type: 'community',
            avatar: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=150&h=150&fit=crop',
            online: false,
            members: 156,
            messages: [
                { id: 1, text: 'Check out this new recommendation!', sender: 'them', time: '9:30 AM' }
            ]
        },
        {
            id: 7,
            name: 'MD',
            lastMessage: 'Jobs (Sounds ring top) - 1.5 long... >3h',
            time: '3h',
            unread: 0,
            type: 'direct',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            online: false,
            messages: [
                { id: 1, text: 'Hello!', sender: 'them', time: '9:00 AM' }
            ]
        },
        {
            id: 8,
            name: 'Data Engineering Job Opportunities',
            lastMessage: 'Titan Agent started a solution... So...',
            time: '8h',
            unread: 0,
            type: 'group',
            avatar: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=150&h=150&fit=crop',
            online: false,
            members: 42,
            messages: [
                { id: 1, text: 'New job posting available', sender: 'them', time: '8:30 AM' }
            ]
        }
    ];

    const filteredChats = chats.filter(chat => {
        if (searchQuery && !chat.name.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }
        if (activeTab === 'unread' && chat.unread === 0) {
            return false;
        }
        if (activeTab === 'groups' && chat.type === 'direct') {
            return false;
        }
        return true;
    });

    const activeChatData = chats.find(chat => chat.id === activeChat);

    const handleSendMessage = () => {
        if (newMessage.trim() === '') return;

        // In a real app, you would add this message to the chat
        message.success('Message sent! 🎉');
        setNewMessage('');
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

            // Focus back to textarea and set cursor position
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

    const getChatIcon = (type) => {
        switch (type) {
            case 'group':
                return <TeamOutlined style={{ color: '#1B3C53', marginRight: 4 }} />;
            case 'community':
                return <WechatOutlined style={{ color: '#1B3C53', marginRight: 4 }} />;
            default:
                return null;
        }
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
                boxShadow: '0 2px 8px rgba(27, 60, 83, 0.08)',
                border: '1px solid #e2e8f0',
                height: '100%',
                background: '#ffffff',
                borderRadius: 0 // Remove border radius from card
            }}
            bodyStyle={{ padding: 0 }}
        >
            {/* Search Header */}
            <div style={{ padding: '16px', borderBottom: '1px solid #f1f5f9' }}>
                <Title level={4} style={{ color: '#1B3C53', marginBottom: '12px', fontSize: '16px' }}>
                    Search Messenger
                </Title>
                <Search
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ borderRadius: 0 }} // Remove border radius from search
                />
            </div>

            {/* Tabs */}
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    size="small"
                    items={[
                        { key: 'all', label: 'All' },
                        { key: 'unread', label: 'Unread' },
                        { key: 'groups', label: 'Groups' },
                    ]}
                />
            </div>

            {/* Chat List */}
            <div style={{ height: 'calc(100vh - 200px)', overflowY: 'auto' }}>
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
                                borderRadius: 0 // Remove border radius from list items
                            }}
                            onClick={() => {
                                setActiveChat(chat.id);
                                setSidebarVisible(false);
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                <Badge
                                    dot={chat.online}
                                    color="#52c41a"
                                    offset={[-4, 28]}
                                    style={{
                                        display: chat.type === 'direct' ? 'block' : 'none'
                                    }}
                                >
                                    <Avatar src={chat.avatar} size="default" />
                                </Badge>
                                <div style={{ flex: 1, marginLeft: '10px', minWidth: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Text strong style={{ color: '#1B3C53', fontSize: '13px' }}>
                                            {chat.name}
                                        </Text>
                                        <Text type="secondary" style={{ fontSize: '11px' }}>
                                            {chat.time}
                                        </Text>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', marginTop: '2px' }}>
                                        {getChatIcon(chat.type)}
                                        <Text
                                            style={{
                                                color: '#64748b',
                                                fontSize: '12px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                flex: 1
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
                                            fontSize: '10px'
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
            minHeight: 'calc(100vh - 64px)', // Adjusted for removed footer
            display: 'flex',
            flexDirection: 'column',
            padding: 0,
            margin: 0
        }}>
            <Row gutter={[16, 0]} style={{ flex: 1, minHeight: 0, margin: 0, height: '100%' }}>
                {/* Chat List Sidebar - Hidden on mobile */}
                <Col xs={0} md={8} lg={6} style={{ padding: 0 }}>
                    {chatListContent}
                </Col>

                {/* Chat Area */}
                <Col xs={24} md={16} lg={18} style={{ padding: 0 }}>
                    <Card
                        style={{
                            border: '1px solid #e2e8f0',
                            height: '100%',
                            minHeight: '500px',
                            margin: 0,
                            borderRadius: 0 // Remove border radius from main card
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
                                    padding: '16px 20px',
                                    borderBottom: '1px solid #f1f5f9',
                                    background: 'white',
                                    flexShrink: 0,
                                    borderRadius: 0 // Remove border radius
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Space size="small">
                                            <Badge
                                                dot={activeChatData.online && activeChatData.type === 'direct'}
                                                color="#52c41a"
                                                offset={[-2, 28]}
                                            >
                                                <Avatar
                                                    size={40}
                                                    src={activeChatData.avatar}
                                                    style={{ border: '1px solid #e2e8f0' }}
                                                />
                                            </Badge>
                                            <div>
                                                <Title level={4} style={{ margin: 0, color: '#1B3C53', fontSize: '16px' }}>
                                                    {activeChatData.name}
                                                </Title>
                                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                                    {activeChatData.type === 'direct' ?
                                                        (activeChatData.online ? 'Online 🟢' : 'Last seen recently') :
                                                        `${activeChatData.members} members 👥`
                                                    }
                                                </Text>
                                            </div>
                                        </Space>
                                        <Space size="small">
                                            <Button
                                                type="text"
                                                icon={<PhoneOutlined />}
                                                style={{ color: '#1B3C53', padding: '4px 8px' }}
                                            />
                                            <Button
                                                type="text"
                                                icon={<VideoCameraOutlined />}
                                                style={{ color: '#1B3C53', padding: '4px 8px' }}
                                            />
                                            <Button
                                                type="text"
                                                icon={<InfoCircleOutlined />}
                                                style={{ color: '#1B3C53', padding: '4px 8px' }}
                                            />
                                            <Button
                                                type="text"
                                                icon={<MoreOutlined />}
                                                style={{ color: '#1B3C53', padding: '4px 8px' }}
                                            />
                                        </Space>
                                    </div>
                                </div>

                                {/* Messages Area */}
                                <div style={{
                                    flex: 1,
                                    padding: '16px 20px',
                                    overflowY: 'auto',
                                    background: '#fafafa',
                                    minHeight: 0
                                }}>
                                    {activeChatData.messages && activeChatData.messages.length > 0 ? (
                                        <Space direction="vertical" style={{ width: '100%' }} size="small">
                                            {activeChatData.messages.map(message => (
                                                <div
                                                    key={message.id}
                                                    style={{
                                                        display: 'flex',
                                                        justifyContent: message.sender === 'me' ? 'flex-end' : 'flex-start',
                                                        marginBottom: '8px'
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            background: message.sender === 'me' ? '#1B3C53' : 'white',
                                                            color: message.sender === 'me' ? 'white' : '#1B3C53',
                                                            padding: '8px 12px',
                                                            borderRadius: 0, // Remove border radius from messages
                                                            border: message.sender === 'me' ? 'none' : '1px solid #e2e8f0',
                                                            maxWidth: '75%',
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
                                            ))}
                                            <div ref={messagesEndRef} />
                                        </Space>
                                    ) : (
                                        <div style={{
                                            textAlign: 'center',
                                            color: '#64748b',
                                            padding: '30px',
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}>
                                            <WechatOutlined style={{ fontSize: '40px', marginBottom: '12px' }} />
                                            <Text style={{ fontSize: '14px' }}>No messages yet. Start a conversation! 💬</Text>
                                        </div>
                                    )}
                                </div>

                                {/* Message Input */}
                                <div style={{
                                    padding: '16px 20px',
                                    borderTop: '1px solid #f1f5f9',
                                    background: 'white',
                                    flexShrink: 0,
                                    borderRadius: 0 // Remove border radius
                                }}>
                                    <Space.Compact style={{ width: '100%' }}>
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
                                                    borderRadius: 0, // Remove border radius
                                                    color: '#64748b',
                                                    borderRight: 'none',
                                                    height: 'auto',
                                                    padding: '8px 12px'
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
                                                borderRadius: 0, // Remove border radius
                                                resize: 'none',
                                                borderLeft: 'none',
                                                borderRight: 'none',
                                                fontSize: '14px'
                                            }}
                                        />
                                        <Button
                                            type="primary"
                                            icon={<SendOutlined />}
                                            onClick={handleSendMessage}
                                            disabled={!newMessage.trim()}
                                            style={{
                                                borderRadius: 0, // Remove border radius
                                                background: '#1B3C53',
                                                borderColor: '#1B3C53',
                                                height: 'auto',
                                                padding: '8px 12px'
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
                                padding: '30px'
                            }}>
                                <WechatOutlined style={{ fontSize: '48px', marginBottom: '12px' }} />
                                <Title level={3} style={{ color: '#64748b', textAlign: 'center', fontSize: '18px', marginBottom: '8px' }}>
                                    Select a chat to start messaging 💭
                                </Title>
                                <Text style={{ textAlign: 'center', fontSize: '14px' }}>Choose a conversation from the list to begin</Text>
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
                width={300}
                styles={{ body: { padding: 0 } }}
            >
                {chatListContent}
            </Drawer>
        </div>
    );
};

export default ChatPage;