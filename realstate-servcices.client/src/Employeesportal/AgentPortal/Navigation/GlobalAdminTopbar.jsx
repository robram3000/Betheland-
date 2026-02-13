// GlobalAdminTopbar.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    Layout,
    Typography,
    Button,
    Dropdown,
    Space,
    Avatar,
    Badge,
    theme,
    message,
    Grid,
    Drawer,
    List,
    Skeleton,
    Menu
} from 'antd';
import {
    QuestionCircleOutlined,
    UserOutlined,
    LogoutOutlined,
    BellOutlined,
    SettingOutlined,
    CloseOutlined,
    EyeOutlined,
    ReloadOutlined,
    DeleteOutlined,
    MessageOutlined,
    CalendarOutlined,
    HomeOutlined,
    MenuOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation, Link } from 'react-router-dom';
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
    const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [notificationCount, setNotificationCount] = useState(0);
    const [loadingNotifications, setLoadingNotifications] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useUser();
    const screens = useBreakpoint();
    const [selectedNavKey, setSelectedNavKey] = useState('chat');
    const {
        token: { colorBgContainer },
    } = theme.useToken();

    const isMobile = !screens.md;

    // Navigation items for the sub-topbar
    const navigationItems = [
        {
            key: 'chat',
            icon: <MessageOutlined />,
            label: 'Chat',
            path: '/portal/agent/all-chats'
        },
        {
            key: 'appointments',
            icon: <CalendarOutlined />,
            label: 'Appointment',
            path: '/portal/agent/schedule'
        },
        {
            key: 'properties',
            icon: <HomeOutlined />,
            label: 'Property',
            path: '/portal/agent/all-properties'
        }
    ];

    // Set selected navigation key based on current path
    useEffect(() => {
        const currentPath = location.pathname;
        const currentItem = navigationItems.find(item =>
            currentPath.startsWith(item.path)
        );
        if (currentItem) {
            setSelectedNavKey(currentItem.key);
        }
    }, [location.pathname]);

    const handleNavClick = ({ key }) => {
        setSelectedNavKey(key);
        const navItem = navigationItems.find(item => item.key === key);
        if (navItem) {
            navigate(navItem.path);
        }
        setMobileDrawerVisible(false);
    };

    // Enhanced real-time notification loading
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
            // Fallback to empty array on error
            setNotifications([]);
            setNotificationCount(0);
        } finally {
            setLoadingNotifications(false);
        }
    }, [user]);

    // Enhanced real-time notification count
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
                    console.log('yehey')
                } else {
                    console.log('yehey')
                }
                break;
            case 'schedule':
                console.log('yehey')
                break;
            case 'message':
                console.log('yehey')
                break;
            case 'system':
                console.log('yehey')
                break;
            default:
                console.log('yehey')
        }
        setNotificationDrawerVisible(false);
    };

    const refreshNotifications = () => {
        if (user) {
            loadNotifications();
            loadNotificationCount();
        }
    };

    // Enhanced real-time notification polling
    useEffect(() => {
        if (user) {
            // Initial load
            loadNotifications();
            loadNotificationCount();

            // Set up interval for real-time updates (every 30 seconds)
            const interval = setInterval(() => {
                loadNotificationCount(); // Lightweight count check

                // Full refresh every 2 minutes
                if (Math.floor(Date.now() / 1000) % 120 === 0) {
                    loadNotifications();
                }
            }, 30000);

            return () => clearInterval(interval);
        } else {
            // Clean up when user logs out
            setNotifications([]);
            setNotificationCount(0);
        }
    }, [user, loadNotifications, loadNotificationCount]);

    // Listen for global notification events (if implemented elsewhere)
    useEffect(() => {
        const handleGlobalNotificationUpdate = () => {
            refreshNotifications();
        };

        // Listen for custom events or global state changes
        window.addEventListener('notificationUpdate', handleGlobalNotificationUpdate);

        return () => {
            window.removeEventListener('notificationUpdate', handleGlobalNotificationUpdate);
        };
    }, []);

    const handleLogout = () => {
        logout();
        message.success('Logged out successfully');
        window.location.href = '/login';
        setDropdownVisible(false);
        setMobileDrawerVisible(false);
    };

    const handleProfile = () => {
        navigate('/portal/agent/profile');
        setDropdownVisible(false);
        setMobileDrawerVisible(false);
    };

    const handleSettings = () => {
        navigate('/settings');
        setDropdownVisible(false);
        setMobileDrawerVisible(false);
    };

    const handleHelp = () => {
        console.log('Help clicked');
    };

    const handleNotifications = () => {
        setNotificationDrawerVisible(true);
        refreshNotifications();
    };

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
            width: isMobile ? '100%' : 320,
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
            width={isMobile ? '100%' : 400}
        >
            <NotificationContent />
        </Drawer>
    );

    const MobileDrawer = () => (
        <Drawer
            title={
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingRight: '8px'
                }}>
                    <span style={{
                        fontWeight: 'bold',
                        fontSize: '18px',
                        color: '#001529'
                    }}>
                        Menu
                    </span>
                    <Button
                        type="text"
                        icon={<CloseOutlined />}
                        onClick={() => setMobileDrawerVisible(false)}
                        aria-label="Close menu"
                        style={{
                            color: '#001529'
                        }}
                    />
                </div>
            }
            placement="right"
            onClose={() => setMobileDrawerVisible(false)}
            open={mobileDrawerVisible}
            closable={false}
            width={280}
            bodyStyle={{
                padding: '16px 0'
            }}
        >
            {/* Navigation Menu for Mobile */}
            <Menu
                mode="vertical"
                selectedKeys={[selectedNavKey]}
                onClick={handleNavClick}
                style={{
                    border: 'none',
                    marginBottom: '16px'
                }}
                items={navigationItems.map(item => ({
                    key: item.key,
                    icon: item.icon,
                    label: item.label,
                    style: {
                        padding: '12px 20px',
                        fontSize: '16px',
                        fontWeight: '500',
                        margin: '0',
                        height: 'auto',
                        lineHeight: '1.5',
                        border: 'none'
                    }
                }))}
            />

            {/* User Info Section */}
            <div style={{
                marginTop: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                padding: '0 20px',
                borderTop: '1px solid #f0f0f0',
                paddingTop: '20px'
            }}>
                {/* User Info */}
                <div style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #f0f0f0',
                    background: 'rgba(0,0,0,0.02)'
                }}>
                    <div style={{
                        fontWeight: '600',
                        fontSize: '16px',
                        color: '#001529',
                        marginBottom: '4px'
                    }}>
                        {getDisplayName()}
                    </div>
                    <div style={{
                        fontSize: '14px',
                        color: '#666',
                        marginBottom: '6px'
                    }}>
                        {user?.email || 'No email'}
                    </div>
                    <div style={{
                        fontSize: '12px',
                        color: '#888',
                        fontWeight: '500',
                        background: 'rgba(0, 21, 41, 0.1)',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        display: 'inline-block'
                    }}>
                        {getRoleDisplayName()}
                    </div>
                </div>

                <Button
                    size="large"
                    icon={<UserOutlined />}
                    onClick={handleProfile}
                    style={{
                        color: '#001529',
                        borderColor: '#001529',
                        fontWeight: '500',
                        height: '44px',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start'
                    }}
                >
                    My Profile
                </Button>
              
                <Button
                    size="large"
                    icon={<LogoutOutlined />}
                    danger
                    onClick={handleLogout}
                    style={{
                        fontWeight: '500',
                        height: '44px',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        marginTop: '8px'
                    }}
                >
                    Logout
                </Button>
            </div>
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
                        fontSize: '13px',
                        color: '#001529',
                        marginBottom: '4px'
                    }}>
                        {getDisplayName()}
                    </div>
                    <div style={{
                        fontSize: '12px',
                        color: '#666',
                        marginBottom: '6px'
                    }}>
                        {user?.email || 'No email'}
                    </div>
                    <div style={{
                        fontSize: '11px',
                        color: '#888',
                        fontWeight: '500',
                        background: 'rgba(0, 21, 41, 0.1)',
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
            {/* Main Topbar */}
            <Header
                style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    borderBottom: '0.5px solid rgba(0, 0, 0, 0.1)',
                    padding: isMobile ? '0 16px' : '0 24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                    height: 64,
                    width: '100%',
                }}
            >
                {/* Left Side */}
                <Space size="middle">
                    {/* Logo */}
                    <div
                        style={{
                            cursor: 'pointer',
                            flexShrink: 0,
                            userSelect: 'none',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            flexDirection: 'column',
                            justifyContent: 'center'
                        }}
                        onClick={() => navigate()}
                        role="button"
                        tabIndex={0}
                        onKeyPress={(e) => e.key === 'Enter'}
                        aria-label="Betheland Home"
                    >
                        <div style={{
                            color: '#001529',
                            fontSize: '20px',
                            fontWeight: 'bold',
                            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                            lineHeight: '1.2'
                        }}>
                            BETHELAND
                        </div>
                        <div style={{
                            color: '#666',
                            fontSize: '10px',
                            fontWeight: 'normal',
                            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                            lineHeight: '1.2',
                            marginTop: '2px',
                            letterSpacing: '0.5px'
                        }}>
                            Real Estate Services
                        </div>
                    </div>
                </Space>

                {/* Right Side - Only show on desktop */}
                {!isMobile && (
                    <Space size="middle">
                        {/* Notifications */}
                        <Dropdown
                            overlay={<NotificationContent />}
                            trigger={['click']}
                            placement="bottomRight"
                            overlayStyle={{
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                                borderRadius: '8px',
                                background: 'white'
                            }}
                            onOpenChange={(open) => {
                                if (open) {
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
                                    style={{
                                        width: 40,
                                        height: 40,
                                        color: '#001529',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                />
                            </Badge>
                        </Dropdown>

                      
                        {/* Mobile Menu Button - Moved to be next to Help button */}
                        <Button
                            type="text"
                            icon={<MenuOutlined />}
                            onClick={() => setMobileDrawerVisible(true)}
                            style={{
                                color: '#001529',
                                width: 40,
                                height: 40,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        />

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
                                    padding: '4px 12px',
                                    height: 'auto',
                                    borderRadius: '8px',
                                    border: '1px solid transparent',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = '#001529';
                                    e.currentTarget.style.backgroundColor = 'rgba(0, 21, 41, 0.04)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'transparent';
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                            >
                                <Space size="small">
                                    <Avatar
                                        size="small"
                                        style={{
                                            backgroundColor: '#001529',
                                            verticalAlign: 'middle',
                                            fontWeight: 600,
                                        }}
                                    >
                                        {getUserInitials()}
                                    </Avatar>
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'flex-start',
                                        lineHeight: 1.2,
                                    }}>
                                        <Text strong style={{
                                            fontSize: '13px',
                                            color: '#001529',
                                        }}>
                                            {getDisplayName()}
                                        </Text>
                                        <Text type="secondary" style={{
                                            fontSize: '11px',
                                        }}>
                                            {getRoleDisplayName()}
                                        </Text>
                                    </div>
                                </Space>
                            </Button>
                        </Dropdown>
                    </Space>
                )}

                {/* Right Side - Mobile only icons */}
                {isMobile && (
                    <Space size="small">
                        {/* Notifications Button for Mobile */}
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
                                onClick={handleNotifications}
                                style={{
                                    width: 40,
                                    height: 40,
                                    color: '#001529',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            />
                        </Badge>

                        {/* Help Button for Mobile */}
                        <Button
                            type="text"
                            icon={<QuestionCircleOutlined />}
                            onClick={handleHelp}
                            style={{
                                width: 40,
                                height: 40,
                                color: '#001529',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        />

                        {/* Mobile Menu Button */}
                        <Button
                            type="text"
                            icon={<MenuOutlined />}
                            onClick={() => setMobileDrawerVisible(true)}
                            style={{
                                color: '#001529',
                                width: 40,
                                height: 40,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        />
                    </Space>
                )}
            </Header>

            {/* Sub Navigation Bar - Only show on desktop */}
            {!isMobile && (
                <Header
                    style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        padding: '0 24px',
                        borderBottom: '0.5px solid rgba(0, 0, 0, 0.1)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        position: 'fixed',
                        top: 64,
                        left: 0,
                        right: 0,
                        zIndex: 1000,
                        height: 45,
                        width: '100%',
                    }}
                >
                    <Menu
                        mode="horizontal"
                        selectedKeys={[selectedNavKey]}
                        onClick={handleNavClick}
                        style={{
                            flex: 1,
                            border: 'none',
                            background: 'transparent',
                            lineHeight: '44px',
                        }}
                        items={navigationItems.map(item => ({
                            key: item.key,
                            icon: item.icon,
                            label: item.label,
                            style: {
                                fontWeight: selectedNavKey === item.key ? 600 : 400,
                                color: selectedNavKey === item.key ? '#001529' : '#666',
                                borderBottom: selectedNavKey === item.key ? '2px solid #001529' : '2px solid transparent',
                                marginBottom: '-2px',
                            }
                        }))}
                    />
                </Header>
            )}

            {/* Notification Drawer */}
            <NotificationDrawer />

            {/* Mobile Navigation Drawer */}
            <MobileDrawer />
        </>
    );
};

export default GlobalAdminTopbar;