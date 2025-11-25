import React, { useState, useEffect, useCallback } from 'react';
import {
    Layout,
    Typography,
    Button,
    Dropdown,
    Space,
    Avatar,
    Badge,
    Input,
    theme,
    Switch,
    message,
    Grid,
    Drawer,
    List,
    Skeleton
} from 'antd';
import {
    QuestionCircleOutlined,
    UserOutlined,
    LogoutOutlined,
    BellOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    SettingOutlined,
    CloseOutlined,
    EyeOutlined,
    ReloadOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import authService from '../../../Authpage/Services/LoginAuth';
import { useUser } from '../../../Authpage/Services/UserContextService';
import chatService from '../../AdminPortal/Convo/chatService'; 

const { Header } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;

// Helper functions for notifications
const formatNotificationTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString();
};

const mapNotificationType = (notificationType) => {
    const typeMap = {
        'property_match': 'property',
        'property_update': 'property',
        'schedule_reminder': 'schedule',
        'schedule_update': 'schedule',
        'message_received': 'message',
        'price_drop': 'price',
        'new_message': 'message',
        'chat_invitation': 'message',
        'system_alert': 'system',
        'admin_alert': 'system'
    };
    return typeMap[notificationType] || 'system';
};

const getNotificationColor = (type) => {
    const colors = {
        property: '#1890ff',
        schedule: '#52c41a',
        message: '#722ed1',
        price: '#fa541c',
        system: '#fa8c16'
    };
    return colors[type] || '#1890ff';
};

const getNotificationIcon = (type) => {
    const icons = {
        property: '🏠',
        schedule: '📅',
        message: '💬',
        price: '💰',
        system: '⚡'
    };
    return icons[type] || '🔔';
};

const GlobalAdminTopbar = ({ onToggle, collapsed, mobileView }) => {
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [notificationDrawerVisible, setNotificationDrawerVisible] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [notificationCount, setNotificationCount] = useState(0);
    const [loadingNotifications, setLoadingNotifications] = useState(false);
    const navigate = useNavigate();
    const { user, logout } = useUser();
    const screens = useBreakpoint();
    const {
        token: { colorBgContainer },
    } = theme.useToken();

    // Load real notifications
    const loadNotifications = useCallback(async () => {
        if (!user) {
            setNotifications([]);
            setNotificationCount(0);
            return;
        }

        setLoadingNotifications(true);
        try {
            const userNotifications = await chatService.getUserNotifications(true); // unreadOnly = true
            const mappedNotifications = userNotifications.map(notification => ({
                id: notification.id,
                title: notification.title,
                description: notification.content,
                time: formatNotificationTime(notification.createdAt),
                read: notification.isRead,
                type: mapNotificationType(notification.notificationType),
                rawNotification: notification
            }));

            setNotifications(mappedNotifications);
            setNotificationCount(mappedNotifications.filter(n => !n.read).length);
        } catch (error) {
            console.error('💥 Error loading notifications:', error);
            setNotifications([]);
            setNotificationCount(0);
        } finally {
            setLoadingNotifications(false);
        }
    }, [user]);

    // Load notification count separately for performance
    const loadNotificationCount = useCallback(async () => {
        if (!user) {
            setNotificationCount(0);
            return;
        }

        try {
            const countData = await chatService.getNotificationCount();
            if (countData.success) {
                setNotificationCount(countData.unreadCount);
            }
        } catch (error) {
            console.error('💥 Error loading notification count:', error);
        }
    }, [user]);

    // Real notification actions
    const markAsRead = async (notificationId) => {
        try {
            await chatService.markNotificationAsRead(notificationId);
            setNotifications(prev =>
                prev.map(notif =>
                    notif.id === notificationId ? { ...notif, read: true } : notif
                )
            );
            setNotificationCount(prev => Math.max(0, prev - 1));
            message.success('Notification marked as read');
        } catch (error) {
            console.error('💥 Error marking notification as read:', error);
            message.error('Failed to mark notification as read');
        }
    };

    const markAllAsRead = async () => {
        try {
            await chatService.markAllNotificationsAsRead();
            setNotifications(prev =>
                prev.map(notif => ({ ...notif, read: true }))
            );
            setNotificationCount(0);
            message.success('All notifications marked as read');
        } catch (error) {
            console.error('💥 Error marking all notifications as read:', error);
            message.error('Failed to mark all notifications as read');
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            await chatService.deleteNotification(notificationId);
            setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
            setNotificationCount(prev => {
                const notification = notifications.find(n => n.id === notificationId);
                return notification && !notification.read ? Math.max(0, prev - 1) : prev;
            });
            message.success('Notification deleted');
        } catch (error) {
            console.error('💥 Error deleting notification:', error);
            message.error('Failed to delete notification');
        }
    };

    const handleNotificationClick = (notification) => {
        // Mark as read when clicked
        if (!notification.read) {
            markAsRead(notification.id);
        }

        // Navigate based on notification type for admin
        const navData = notification.rawNotification?.data;
        switch (notification.type) {
            case 'property':
                if (navData?.propertyId) {
                    navigate(`/portal/admin/properties/${navData.propertyId}`);
                } else {
                    navigate('/portal/admin/properties');
                }
                break;
            case 'schedule':
                navigate('/portal/admin/schedule');
                break;
            case 'message':
                if (navData?.chatId) {
                    navigate(`/portal/admin/messages?chat=${navData.chatId}`);
                } else {
                    navigate('/portal/admin/messages');
                }
                break;
            case 'system':
                navigate('/portal/admin/system-alerts');
                break;
            default:
                navigate('/portal/admin/notifications');
        }
        setNotificationDrawerVisible(false);
    };

    const handleLogout = () => {
        logout();
        message.success('Logged out successfully');
        window.location.href = '/';
        setDropdownVisible(false);
    };

    const handleProfile = () => {
        navigate('/portal/agent/profile');
        setDropdownVisible(false);
    };

    const handleSettings = () => {
        navigate('/settings');
        setDropdownVisible(false);
    };

    const handleHelp = () => {
        console.log('Help clicked');
    };

    const handleNotifications = () => {
        if (mobileView) {
            setNotificationDrawerVisible(true);
        } else {
            // For desktop, show dropdown
            console.log('Notifications clicked - desktop view');
        }
    };

    const refreshNotifications = () => {
        loadNotifications();
        loadNotificationCount();
    };

    // Load notifications on component mount and user change
    useEffect(() => {
        if (user) {
            loadNotifications();
            loadNotificationCount();
        }
    }, [user, loadNotifications, loadNotificationCount]);

    // Auto-refresh notifications every 30 seconds
    useEffect(() => {
        if (user) {
            const interval = setInterval(() => {
                loadNotificationCount(); // Lightweight count check
            }, 30000);

            return () => clearInterval(interval);
        }
    }, [user, loadNotificationCount]);

    const getDisplayName = () => {
        if (!user) return 'Admin';
        if (user.username && user.username.trim() !== '') {
            return user.username;
        }
        if (user.email) {
            return user.email.split('@')[0];
        }
        const userRole = user?.role || user?.userType;
        switch (userRole?.toLowerCase()) {
            case 'superadmin':
                return 'Super Admin';
            case 'admin':
                return 'Administrator';
            case 'agent':
                return 'Agent';
            default:
                return 'User';
        }
    };

    const getUserInitials = () => {
        const displayName = getDisplayName();
        if (displayName === 'Admin' || displayName === 'User') {
            const role = user?.role || user?.userType;
            if (role?.toLowerCase() === 'superadmin') return 'SA';
            if (role?.toLowerCase() === 'admin') return 'A';
            if (role?.toLowerCase() === 'agent') return 'AG';
            return 'U';
        }

        return displayName
            .split(' ')
            .map(name => name[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getRoleDisplayName = () => {
        const role = user?.role || user?.userType;
        switch (role?.toLowerCase()) {
            case 'superadmin':
                return 'Super Administrator';
            case 'admin':
                return 'Administrator';
            case 'agent':
                return 'Real Estate Agent';
            case 'client':
                return 'Client';
            default:
                return role || 'User';
        }
    };

    const NotificationContent = () => (
        <div style={{
            width: 320,
            maxHeight: 400,
            overflow: 'auto',
            background: 'white',
            borderRadius: '8px'
        }}>
            <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid #f0f0f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'white'
            }}>
                <Text strong>Notifications</Text>
                <Space>
                    <Button
                        type="link"
                        size="small"
                        onClick={refreshNotifications}
                        loading={loadingNotifications}
                        icon={<ReloadOutlined />}
                        style={{ padding: 0, height: 'auto' }}
                    >
                        Refresh
                    </Button>
                    {notificationCount > 0 && (
                        <Button
                            type="link"
                            size="small"
                            onClick={markAllAsRead}
                            style={{ padding: 0, height: 'auto' }}
                        >
                            Mark all as read
                        </Button>
                    )}
                </Space>
            </div>

            {loadingNotifications ? (
                <div style={{ padding: '16px' }}>
                    <Skeleton active paragraph={{ rows: 3 }} />
                </div>
            ) : (
                <List
                    dataSource={notifications}
                    locale={{ emptyText: 'No notifications' }}
                    renderItem={(notification) => (
                        <List.Item
                            style={{
                                padding: '12px 16px',
                                cursor: 'pointer',
                                backgroundColor: notification.read ? 'white' : '#f6ffed',
                                borderBottom: '1px solid #f0f0f0',
                                transition: 'background-color 0.3s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = notification.read ? '#fafafa' : '#f0f9ff';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = notification.read ? 'white' : '#f6ffed';
                            }}
                            onClick={() => handleNotificationClick(notification)}
                            actions={[
                                <Button
                                    type="text"
                                    size="small"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteNotification(notification.id);
                                    }}
                                />
                            ]}
                        >
                            <List.Item.Meta
                                avatar={
                                    <Badge dot={!notification.read}>
                                        <div style={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: '50%',
                                            backgroundColor: getNotificationColor(notification.type),
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontSize: '14px',
                                            fontWeight: 'bold'
                                        }}>
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                    </Badge>
                                }
                                title={
                                    <Text
                                        strong={!notification.read}
                                        style={{ fontSize: '14px' }}
                                    >
                                        {notification.title}
                                    </Text>
                                }
                                description={
                                    <div>
                                        <Text
                                            type="secondary"
                                            style={{ fontSize: '12px', display: 'block' }}
                                        >
                                            {notification.description}
                                        </Text>
                                        <Text
                                            type="secondary"
                                            style={{ fontSize: '11px', display: 'block', marginTop: 2 }}
                                        >
                                            {notification.time}
                                        </Text>
                                    </div>
                                }
                            />
                        </List.Item>
                    )}
                />
            )}

            <div style={{
                padding: '12px 16px',
                borderTop: '1px solid #f0f0f0',
                textAlign: 'center',
                background: 'white'
            }}>
                <Button
                    type="link"
                    onClick={() => {
                        navigate('/portal/admin/notifications');
                        setNotificationDrawerVisible(false);
                    }}
                    icon={<EyeOutlined />}
                    style={{ padding: 0 }}
                >
                    View All Notifications
                </Button>
            </div>
        </div>
    );

    const NotificationDrawer = () => (
        <Drawer
            title={
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0'
                }}>
                    <span style={{ fontSize: '18px', fontWeight: 600 }}>Notifications</span>
                    <Space>
                        <Button
                            type="text"
                            icon={<ReloadOutlined />}
                            loading={loadingNotifications}
                            onClick={refreshNotifications}
                            size="small"
                        />
                        <Button
                            type="text"
                            icon={<CloseOutlined />}
                            onClick={() => setNotificationDrawerVisible(false)}
                        />
                    </Space>
                </div>
            }
            placement="right"
            onClose={() => setNotificationDrawerVisible(false)}
            open={notificationDrawerVisible}
            width={mobileView ? '100%' : 400}
        >
            <NotificationContent />
        </Drawer>
    );

    const profileMenuItems = [
        {
            key: 'user-info',
            label: (
                <div style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #f0f0f0',
                    minWidth: '200px',
                    background: 'rgba(0,0,0,0.02)'
                }}>
                    <div style={{
                        fontWeight: '600',
                        fontSize: mobileView ? '14px' : '13px',
                        color: '#1a365d',
                        marginBottom: '4px'
                    }}>
                        {getDisplayName()}
                    </div>
                    <div style={{
                        fontSize: mobileView ? '13px' : '12px',
                        color: '#666',
                        marginBottom: '6px'
                    }}>
                        {user?.email || 'No email'}
                    </div>
                    <div style={{
                        fontSize: mobileView ? '12px' : '11px',
                        color: '#888',
                        fontWeight: '500',
                        background: 'rgba(26, 54, 93, 0.1)',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        display: 'inline-block'
                    }}>
                        {getRoleDisplayName()}
                    </div>
                </div>
            ),
            disabled: true,
        },
        {
            type: 'divider',
        },
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'My Profile',
            onClick: handleProfile,
        },
        {
            key: 'settings',
            icon: <SettingOutlined />,
            label: 'Settings',
            onClick: handleSettings,
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Logout',
            danger: true,
            onClick: handleLogout,
        },
    ];

    return (
        <>
            <Header
                style={{
                    background: colorBgContainer,
                    padding: mobileView ? '0 16px' : '0 24px',
                    boxShadow: '0 1px 4px rgba(0,21,41,.08)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                    height: 64,
                    borderBottom: '1px solid #f0f0f0',
                    width: '100%',
                }}
            >
                {/* Left Side */}
                <Space size="middle">
                    {/* Collapse Toggle */}
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={onToggle}
                        style={{
                            fontSize: '18px',
                            width: 40,
                            height: 40,
                            color: '#1a365d',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    />

                    {/* Logo */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Text
                            strong
                            style={{
                                fontSize: mobileView ? '18px' : '20px',
                                color: '#1a365d',
                                fontWeight: 800,
                                lineHeight: 1.2,
                            }}
                        >
                            BETHELAND
                        </Text>
                        <Text
                            style={{
                                fontSize: mobileView ? '10px' : '11px',
                                color: '#666',
                                fontWeight: 400,
                                lineHeight: 1.2,
                                marginTop: '2px',
                            }}
                        >
                            Real Estate Services
                        </Text>
                    </div>
                </Space>

                {/* Right Side */}
                <Space size="middle">
                    {/* Notifications */}
                    <Dropdown
                        overlay={<NotificationContent />}
                        trigger={['click']}
                        placement="bottomRight"
                        disabled={mobileView}
                        overlayStyle={{
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                            borderRadius: '8px',
                            background: 'white'
                        }}
                        onOpenChange={(open) => {
                            if (open && !mobileView) {
                                refreshNotifications();
                            }
                        }}
                    >
                        <Badge
                            count={notificationCount}
                            size="small"
                            style={{
                                backgroundColor: '#ff4d4f',
                            }}
                        >
                            <Button
                                type="text"
                                icon={<BellOutlined />}
                                onClick={mobileView ? handleNotifications : undefined}
                                style={{
                                    width: 40,
                                    height: 40,
                                    color: '#1a365d',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            />
                        </Badge>
                    </Dropdown>

                    {/* Help Button */}
                    {mobileView ? (
                        <Button
                            type="text"
                            icon={<QuestionCircleOutlined />}
                            onClick={handleHelp}
                            style={{
                                color: '#1a365d',
                                width: 40,
                                height: 40,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        />
                    ) : (
                        <Button
                            type="text"
                            icon={<QuestionCircleOutlined />}
                            onClick={handleHelp}
                            style={{
                                color: '#1a365d',
                            }}
                        >
                            Help
                        </Button>
                    )}

                    {/* Profile Dropdown */}
                    <Dropdown
                        menu={{ items: profileMenuItems }}
                        trigger={['click']}
                        open={dropdownVisible}
                        onOpenChange={setDropdownVisible}
                        placement="bottomRight"
                        overlayStyle={{
                            minWidth: 220,
                        }}
                    >
                        <Button
                            type="text"
                            style={{
                                padding: mobileView ? '4px' : '4px 12px',
                                height: 'auto',
                                borderRadius: '8px',
                                border: '1px solid transparent',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#1a365d';
                                e.currentTarget.style.backgroundColor = 'rgba(26, 54, 93, 0.04)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'transparent';
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                        >
                            <Space size="small">
                                <Avatar
                                    size={mobileView ? "default" : "small"}
                                    style={{
                                        backgroundColor: '#1a365d',
                                        verticalAlign: 'middle',
                                        fontWeight: 600,
                                    }}
                                >
                                    {getUserInitials()}
                                </Avatar>
                                {!mobileView && (
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'flex-start',
                                        lineHeight: 1.2,
                                    }}>
                                        <Text strong style={{
                                            fontSize: '13px',
                                            color: '#1a365d',
                                        }}>
                                            {getDisplayName()}
                                        </Text>
                                        <Text type="secondary" style={{
                                            fontSize: '11px',
                                        }}>
                                            {getRoleDisplayName()}
                                        </Text>
                                    </div>
                                )}
                            </Space>
                        </Button>
                    </Dropdown>
                </Space>
            </Header>

            {/* Notification Drawer for Mobile */}
            <NotificationDrawer />
        </>
    );
};

export default GlobalAdminTopbar;