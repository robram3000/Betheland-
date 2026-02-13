// globalNavigation.jsx - COMPLETE FIXED VERSION with Real-time Updates
import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Menu, Button, Drawer, Grid, Badge, Dropdown, Avatar, Space, List, Typography, Row, Col, Tooltip, Skeleton, message } from 'antd';
import {
    MenuOutlined,
    CloseOutlined,
    HeartOutlined,
    MessageOutlined,
    UserOutlined,
    LogoutOutlined,
    SettingOutlined,
    DownOutlined,
    CalendarOutlined,
    BellOutlined,
    EyeOutlined,
    PhoneOutlined,
    MailOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../Authpage/Services/LoginAuth';
import profileService from '../Accounts/Services/ProfileService';
import { processImageUrl } from '../Employeesportal/AdminPortal/Creation_Property/processImageUrl';
import chatService from '../Employeesportal/AdminPortal/Convo/chatService';

const { Header } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;

// SIMPLE DIRECT HOOK - Use this if the provider isn't working
const useSafeWishlistData = () => {
    const [wishlistData, setWishlistData] = useState({
        wishlistCount: 0,
        isAuthenticated: false,
        refreshWishlist: () => {
            // Direct API call to refresh wishlist
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            if (token) {
                // You'll need to implement this based on your auth system
                console.log('🔄 Manual wishlist refresh');
            }
        },
        toggleWishlist: () => Promise.resolve(),
        isPropertyInWishlist: () => Promise.resolve(false),
        loading: false,
        wishlistPropertyIds: [],
        updateTrigger: 0,
        wishlistItems: []
    });

    // Direct API integration for wishlist count
    const loadWishlistCount = useCallback(async () => {
        try {
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            if (!token) {
                setWishlistData(prev => ({ ...prev, wishlistCount: 0, isAuthenticated: false }));
                return;
            }

            // Get client ID first
            const clientResponse = await api.get('/wishlist/my-client-id');
            const clientId = clientResponse.data;
            
            if (clientId) {
                const countResponse = await api.get(`/wishlist/client/${clientId}/count`);
                const count = countResponse.data;
                
                setWishlistData(prev => ({ 
                    ...prev, 
                    wishlistCount: count, 
                    isAuthenticated: true 
                }));
            }
        } catch (error) {
            console.error('Error loading wishlist count:', error);
            setWishlistData(prev => ({ ...prev, wishlistCount: 0, isAuthenticated: false }));
        }
    }, []);

    useEffect(() => {
        loadWishlistCount();
        
        // Poll for updates
        const interval = setInterval(loadWishlistCount, 10000);
        
        return () => clearInterval(interval);
    }, [loadWishlistCount]);

    return wishlistData;
};

// Helper functions for notifications
const formatNotificationTime = (dateString) => {
    if (!dateString) return 'Just now';

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
        'chat_invitation': 'message'
    };
    return typeMap[notificationType] || 'property';
};

const getNotificationColor = (type) => {
    const colors = {
        property: '#1890ff',
        schedule: '#52c41a',
        message: '#722ed1',
        price: '#fa541c'
    };
    return colors[type] || '#1890ff';
};

const getNotificationIcon = (type) => {
    const icons = {
        property: '🏠',
        schedule: '📅',
        message: '💬',
        price: '💰'
    };
    return icons[type] || '🔔';
};

// ENHANCED: Real-time notification hook with WebSocket integration
const useNotifications = (isLoggedIn) => {
    const [notifications, setNotifications] = useState([]);
    const [notificationCount, setNotificationCount] = useState(0);
    const [loadingNotifications, setLoadingNotifications] = useState(false);

    // Load notifications with better error handling
    const loadNotifications = useCallback(async () => {
        if (!isLoggedIn) {
            setNotifications([]);
            setNotificationCount(0);
            return;
        }

        setLoadingNotifications(true);
        try {
            console.log('📢 Loading notifications...');
            const userNotifications = await chatService.getUserNotifications(true);

            const mappedNotifications = (userNotifications || []).map(notification => ({
                id: notification.id || notification.notificationId,
                title: notification.title || 'Notification',
                description: notification.content || notification.message || 'No content',
                time: formatNotificationTime(notification.createdAt || notification.timestamp),
                read: notification.isRead || false,
                type: mapNotificationType(notification.notificationType || notification.type),
                rawNotification: notification
            }));

            setNotifications(mappedNotifications);

            // Update count based on unread status
            const unreadCount = mappedNotifications.filter(n => !n.read).length;
            setNotificationCount(unreadCount);

            console.log(`📢 Loaded ${mappedNotifications.length} notifications, ${unreadCount} unread`);
        } catch (error) {
            console.error('💥 Error loading notifications:', error);
            setNotifications([]);
            setNotificationCount(0);
        } finally {
            setLoadingNotifications(false);
        }
    }, [isLoggedIn]);

    // Load notification count separately for better performance
    const loadNotificationCount = useCallback(async () => {
        if (!isLoggedIn) {
            setNotificationCount(0);
            return;
        }

        try {
            const countData = await chatService.getNotificationCount();
            if (countData && (countData.success || countData.unreadCount !== undefined)) {
                setNotificationCount(countData.unreadCount || 0);
            }
        } catch (error) {
            console.error('💥 Error loading notification count:', error);
            const unreadCount = notifications.filter(n => !n.read).length;
            setNotificationCount(unreadCount);
        }
    }, [isLoggedIn, notifications]);

    // REAL-TIME: WebSocket notification updates
    useEffect(() => {
        if (!isLoggedIn) return;

        // Enable real-time notifications
        chatService.enableRealTimeNotifications();

        // Set up WebSocket listeners for real-time updates
        const unsubscribeNewNotification = chatService.onNotificationReceived((notification) => {
            console.log('🔔 Real-time notification received:', notification);

            setNotifications(prev => {
                const newNotification = {
                    id: notification.id || notification.notificationId,
                    title: notification.title || 'New Notification',
                    description: notification.content || notification.message || 'No content',
                    time: formatNotificationTime(notification.createdAt || notification.timestamp),
                    read: notification.isRead || false,
                    type: mapNotificationType(notification.notificationType || notification.type),
                    rawNotification: notification
                };

                // Add to beginning of list
                const updatedNotifications = [newNotification, ...prev];

                // Update count if unread
                if (!newNotification.read) {
                    setNotificationCount(prevCount => prevCount + 1);
                }

                return updatedNotifications;
            });
        });

        const unsubscribeCountUpdate = chatService.onNotificationCountUpdated((countData) => {
            console.log('🔢 Real-time notification count update:', countData);
            if (countData && countData.unreadCount !== undefined) {
                setNotificationCount(countData.unreadCount);
            }
        });

        // Set up polling as fallback
        const pollInterval = setInterval(() => {
            loadNotificationCount();
        }, 30000);

        return () => {
            unsubscribeNewNotification();
            unsubscribeCountUpdate();
            clearInterval(pollInterval);
        };
    }, [isLoggedIn, loadNotificationCount]);

    return {
        notifications,
        notificationCount,
        loadingNotifications,
        loadNotifications,
        loadNotificationCount,
        refreshNotifications: () => {
            loadNotifications();
            loadNotificationCount();
        }
    };
};

const GlobalNavigation = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [profileData, setProfileData] = useState(null);
    const [profileImageError, setProfileImageError] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState(false);
    const screens = useBreakpoint();

    // FIXED: Use the enhanced wishlist hook
    const {
        wishlistCount,
        isAuthenticated: isWishlistAuthenticated,
        refreshWishlist
    } = useSafeWishlistData();

    // ENHANCED: Real-time notifications
    const {
        notifications,
        notificationCount,
        loadingNotifications,
        loadNotifications,
        loadNotificationCount,
        refreshNotifications
    } = useNotifications(isLoggedIn);

    // FIXED: Always show wishlist count, even when 0
    const displayWishlistCount = wishlistCount || 0;

    const companyContact = {
        phone: '0977-849-1888 / 0917-791-1981',
        email: 'allanlao@betheland.com.ph'
    };

    const menuItems = [
        { key: '/', label: 'Home' },
        { key: '/properties', label: 'Properties' },
        { key: '/about', label: 'About Us' },
        { key: '/contact-us', label: 'Contact Us' }
    ];

    // Enhanced notification actions
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
            const notificationToDelete = notifications.find(n => n.id === notificationId);
            setNotifications(prev => prev.filter(notif => notif.id !== notificationId));

            if (notificationToDelete && !notificationToDelete.read) {
                setNotificationCount(prev => Math.max(0, prev - 1));
            }
            message.success('Notification deleted');
        } catch (error) {
            console.error('💥 Error deleting notification:', error);
            message.error('Failed to delete notification');
        }
    };

    const handleNotificationClick = (notification) => {
        if (!notification.read) {
            markAsRead(notification.id);
        }

        const navData = notification.rawNotification?.data;
        switch (notification.type) {
            case 'property':
                if (navData?.propertyId) {
                    navigate(`/properties/${navData.propertyId}`);
                } else {
                    navigate('/properties');
                }
                break;
            case 'schedule':
                navigate('/schedule');
                break;
            case 'message':
                navigate('/messages'); // ← Just navigate to /messages
                break;
            default:
                navigate('/notifications');
        }
        setDrawerVisible(false);
    };

    const loadUserProfile = async () => {
        if (!isLoggedIn) return;

        setLoadingProfile(true);
        try {
            const result = await profileService.getProfile();

            if (result.success && result.data) {
                setProfileData(result.data)
                setCurrentUser(prev => ({
                    ...prev,
                    profilePicture: result.data.profilePicture,
                    username: result.data.username || prev?.username,
                    email: result.data.email || prev?.email,
                    firstName: result.data.firstName,
                    lastName: result.data.lastName
                }));
            } else {
                // Handle no data case
            }
        } catch (error) {
            console.error('💥 GlobalNavigation - Error loading profile:', error);
        } finally {
            setLoadingProfile(false);
        }
    };

    const getProfilePictureUrl = () => {
        if (profileData?.profilePicture) {
            return processImageUrl(profileData.profilePicture);
        }

        // Fallback to currentUser data
        if (currentUser?.profilePicture) {
            return processImageUrl(currentUser.profilePicture);
        }

        return null;
    };

    // Enhanced authentication check
    const checkAuthStatus = () => {
        const authenticated = authService.isAuthenticated();

        // Additional safety check - if token exists but user data is corrupted
        if (authenticated) {
            const user = authService.getCurrentUser();
            if (!user || !user.userId) {
                console.warn('💥 Invalid user data detected, forcing logout');
                authService.logout();
                setIsLoggedIn(false);
                setCurrentUser(null);
                setProfileData(null);
                return;
            }
            setCurrentUser(user);
            setProfileImageError(false);

            // Force wishlist refresh when auth is confirmed
            setTimeout(() => {
                if (window.wishlistContextRef) {
                    window.wishlistContextRef.refreshAuth?.();
                    window.wishlistContextRef.loadWishlist?.();
                }
            }, 100);
        } else {
            // Ensure clean state when not authenticated
            setCurrentUser(null);
            setProfileData(null);
            setProfileImageError(false);
        }

        setIsLoggedIn(authenticated);
    };

    useEffect(() => {
        checkAuthStatus();
    }, [location]);

    useEffect(() => {
        if (isLoggedIn) {
            loadUserProfile();
            loadNotifications();
            loadNotificationCount();
        } else {
            setProfileData(null);
        }
    }, [isLoggedIn]);

    // Add session termination detection
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (!authService.isAuthenticated()) {
                authService.logout();
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    const handleImageError = () => {
        setProfileImageError(true);
    };

    const handleMenuClick = (key) => {
        navigate(key);
        setDrawerVisible(false);
    };

    const handleLogoClick = () => {
        navigate('/');
    };

    const handleWishlistClick = () => {
        if (!isLoggedIn) {
            const returnUrl = window.location.pathname + window.location.search;
            navigate(`/login?returnUrl=${encodeURIComponent(returnUrl)}&action=${encodeURIComponent('view wishlist')}`);
            return;
        }
        navigate('/wishlist');
        setDrawerVisible(false);
    };

    const handleChatClick = () => {
        navigate('/messages');
        setDrawerVisible(false);
    };

    const handleScheduleClick = () => {
        navigate('/schedule');
        setDrawerVisible(false);
    };

    const handleNotificationsClick = () => {
        navigate('/notifications');
        setDrawerVisible(false);
    };

    const handleLogout = () => {
        authService.logout();
        setIsLoggedIn(false);
        setCurrentUser(null);
        setProfileData(null);
        setProfileImageError(false);
        window.location.href = '/login';
        setDrawerVisible(false);
    };

    const handleProfileClick = () => {
        navigate('/profile');
        setDrawerVisible(false);
    };

 

    const refreshProfile = () => {
        if (isLoggedIn) {
            loadUserProfile();
        }
    };

    const getDisplayName = () => {
        if (profileData) {
            const { firstName, middleName, lastName, suffix } = profileData;
            const nameParts = [];
            if (firstName && firstName.trim() !== '') nameParts.push(firstName.trim());
            if (middleName && middleName.trim() !== '') nameParts.push(middleName.trim());
            if (lastName && lastName.trim() !== '') nameParts.push(lastName.trim());
            if (suffix && suffix.trim() !== '') nameParts.push(suffix.trim());
            if (nameParts.length > 0) {
                const fullName = nameParts.join(' ');
                return fullName;
            }
        }

        if (profileData?.username && profileData.username.trim() !== '') {
            return profileData.username;
        }

        if (currentUser?.username && currentUser.username.trim() !== '') {
            return currentUser.username;
        }
        if (currentUser?.email) {
            return currentUser.email.split('@')[0];
        }

        return 'User';
    };

    const getUserInitials = () => {
        const displayName = getDisplayName();
        if (displayName === 'User') return 'U';
        if (profileData?.firstName) {
            const first = profileData.firstName[0] || '';
            const last = profileData.lastName?.[0] || '';
            return `${first}${last}`.toUpperCase();
        }
        return displayName
            .split(' ')
            .map(name => name[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getUserEmail = () => {
        return profileData?.email || currentUser?.email || 'No email';
    };

    const notificationContent = (
        <div style={{
            width: 350,
            maxHeight: 400,
            overflow: 'auto',
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }}>
            <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid #f0f0f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'white',
                position: 'sticky',
                top: 0,
                zIndex: 1
            }}>
                <Text strong style={{ fontSize: '16px' }}>Notifications</Text>
            
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
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteNotification(notification.id);
                                    }}
                                >
                                    Delete
                                </Button>
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
               
            </div>
        </div>
    );

    const userMenuItems = [
        {
            key: 'user-info',
            label: (
                <div style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0', background: 'white' }}>
                    <div style={{ fontWeight: '600', fontSize: '14px' }}>
                        {getDisplayName()}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                        {getUserEmail()}
                    </div>
                </div>
            ),
            disabled: true,
        },
        {
            type: 'divider'
        },
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'My Profile',
            onClick: handleProfileClick
        },


        {
            type: 'divider'
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Logout',
            onClick: handleLogout,
            danger: true
        }
    ];

    const isDesktop = screens.md;
    const profilePictureUrl = getProfilePictureUrl();

    return (
        <>
            {/* First Top Bar - Contact Information & Notification/Wishlist */}
            <div style={{
                background: '#001529',
                color: 'white',
                padding: '8px 24px',
                fontSize: '14px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    maxWidth: '1200px',
                    margin: '0 auto'
                }}>
                    {/* Left Side - Contact Information */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '24px'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <PhoneOutlined style={{ fontSize: '12px' }} />
                            <Text style={{ color: 'white', fontSize: '13px' }}>
                                {companyContact.phone}
                            </Text>
                        </div>
                    </div>

                    {/* Right Side - Email & Notification & Wishlist (Desktop only) */}
                    {isDesktop && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '24px'
                        }}>
                            {/* Email */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <MailOutlined style={{ fontSize: '12px' }} />
                                <Text style={{ color: 'white', fontSize: '13px' }}>
                                    {companyContact.email}
                                </Text>
                            </div>

                            {/* FIXED: Wishlist Icon with Real-time Count */}
                            <Tooltip title={isLoggedIn ? "Wishlist" : "Login to view wishlist"} placement="bottom">
                                <Badge
                                    count={displayWishlistCount}
                                    size="small"
                                    offset={[-5, 5]}
                                    style={{
                                        backgroundColor: '#ff4d4f',
                                        boxShadow: '0 0 0 1px #fff'
                                    }}
                                >
                                    <Button
                                        type="text"
                                        icon={<HeartOutlined style={{
                                            color: displayWishlistCount > 0 ? '#ff4d4f' : 'white',
                                            fontSize: '16px',
                                            transition: 'all 0.3s ease'
                                        }} />}
                                        onClick={handleWishlistClick}
                                        aria-label={`Wishlist with ${displayWishlistCount} items`}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: 'auto',
                                            height: '32px',
                                            padding: '0 8px',
                                            gap: '4px',
                                            position: 'relative'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                                            e.currentTarget.style.transform = 'scale(1.05)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                            e.currentTarget.style.transform = 'scale(1)';
                                        }}
                                    >
                                        <span style={{
                                            fontSize: '13px',
                                            color: 'white',
                                            marginLeft: '4px',
                                            fontWeight: displayWishlistCount > 0 ? '600' : 'normal'
                                        }}>
                                            Wishlist 
                                        </span>
                                    </Button>
                                </Badge>
                            </Tooltip>

                            {/* ENHANCED: Notification Icon with Real-time Updates */}
                            {isLoggedIn && (
                                <Tooltip title="Notifications" placement="bottom">
                                    <Dropdown
                                        overlay={notificationContent}
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
                                        <Badge count={notificationCount} size="small" offset={[-5, 5]}>
                                            <Button
                                                type="text"
                                                icon={<BellOutlined style={{
                                                    color: notificationCount > 0 ? '#ff4d4f' : 'white',
                                                    fontSize: '16px',
                                                    transition: 'color 0.3s'
                                                }} />}
                                                aria-label={`Notifications with ${notificationCount} new items`}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: 'auto',
                                                    height: '32px',
                                                    padding: '0 8px',
                                                    gap: '4px'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                }}
                                            >
                                                <span style={{
                                                    fontSize: '13px',
                                                    color: 'white',
                                                    marginLeft: '4px',
                                                    fontWeight: notificationCount > 0 ? '600' : 'normal'
                                                }}>
                                                    Notifications 
                                                </span>
                                            </Button>
                                        </Badge>
                                    </Dropdown>
                                </Tooltip>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Navigation Header */}
            <Header style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderBottom: '0.5px solid rgba(0, 0, 0, 0.1)',
                padding: '0 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'sticky',
                top: 0,
                zIndex: 1000,
                height: '64px'
            }}>
                {/* Centered Container */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    maxWidth: '1200px'
                }}>
                    {/* Logo - Left Side */}
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
                        onClick={handleLogoClick}
                        role="button"
                        tabIndex={0}
                        onKeyPress={(e) => e.key === 'Enter' && handleLogoClick()}
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

                    {/* Desktop Menu - Centered */}
                    {isDesktop && (
                        <div style={{
                            position: 'absolute',
                            left: '50%',
                            transform: 'translateX(-50%)'
                        }}>
                            <Menu
                                mode="horizontal"
                                selectedKeys={[location.pathname]}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#001529'
                                }}
                                items={menuItems.map(item => ({
                                    ...item,
                                    style: {
                                        color: '#001529',
                                        fontWeight: '500',
                                        transition: 'color 0.3s',
                                        padding: '0 16px'
                                    },
                                    onClick: () => handleMenuClick(item.key)
                                }))}
                            />
                        </div>
                    )}

                    {/* Right Section - User Menu & Auth Buttons */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        flexShrink: 0
                    }}>
                        {/* Schedule Icon */}
                        {isDesktop && isLoggedIn && (
                            <Tooltip title="Schedule" placement="bottom">
                                <Badge count={0} size="small" offset={[-5, 5]}>
                                    <Button
                                        type="text"
                                        icon={<CalendarOutlined style={{
                                            color: '#001529',
                                            fontSize: '18px',
                                            transition: 'color 0.3s'
                                        }} />}
                                        onClick={handleScheduleClick}
                                        aria-label="Schedule"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '40px',
                                            height: '40px'
                                        }}
                                    />
                                </Badge>
                            </Tooltip>
                        )}

                        {/* Chat Icon */}
                        {isDesktop && isLoggedIn && (
                            <Tooltip title="Chat" placement="bottom">
                                <Badge count={0} size="small" offset={[-5, 5]}>
                                    <Button
                                        type="text"
                                        icon={<MessageOutlined style={{
                                            color: '#001529',
                                            fontSize: '18px',
                                            transition: 'color 0.3s'
                                        }} />}
                                        onClick={handleChatClick}
                                        aria-label="Chat"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '40px',
                                            height: '40px'
                                        }}
                                    />
                                </Badge>
                            </Tooltip>
                        )}

                        {/* User Menu (when logged in) OR Auth Buttons (when not logged in) */}
                        {isDesktop ? (
                            isLoggedIn ? (
                                <Dropdown
                                    menu={{ items: userMenuItems }}
                                    placement="bottomRight"
                                    trigger={['click']}
                                    overlayStyle={{
                                        background: 'white'
                                    }}
                                >
                                    <Button
                                        type="text"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            color: '#001529',
                                            fontWeight: '500',
                                            height: '40px',
                                            padding: '0 12px',
                                            borderRadius: '6px',
                                            transition: 'all 0.3s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(0, 21, 41, 0.04)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                        }}
                                    >
                                        <Space>
                                            <Avatar
                                                size="small"
                                                style={{
                                                    backgroundColor: (profilePictureUrl && !profileImageError) ? 'transparent' : '#001529',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    border: (profilePictureUrl && !profileImageError) ? '2px solid #001529' : 'none'
                                                }}
                                                src={profilePictureUrl && !profileImageError ? profilePictureUrl : null}
                                                onError={handleImageError}
                                                icon={(!profilePictureUrl || profileImageError) && <UserOutlined />}
                                            >
                                                {(!profilePictureUrl || profileImageError) && getUserInitials()}
                                            </Avatar>
                                            <span style={{
                                                fontSize: '14px',
                                                maxWidth: '120px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {getDisplayName()}
                                            </span>
                                            <DownOutlined style={{ fontSize: '12px', color: '#666' }} />
                                        </Space>
                                    </Button>
                                </Dropdown>
                            ) : (
                                /* Auth Buttons - Desktop */
                                <div style={{
                                    display: 'flex',
                                    gap: '12px'
                                }}>
                                    <Button
                                        onClick={() => navigate('/login')}
                                        style={{
                                            color: '#001529',
                                            borderColor: '#001529',
                                            fontWeight: '500'
                                        }}
                                        aria-label="Login to your account"
                                    >
                                        LogIn
                                    </Button>
                                    <Button
                                        type="primary"
                                        onClick={() => navigate('/register/verify-email')}
                                        style={{
                                            background: '#001529',
                                            borderColor: '#001529',
                                            fontWeight: '500',
                                            height: '44px'
                                        }}
                                        aria-label="Register new account"
                                    >
                                        Join
                                    </Button>
                                </div>
                            )
                        ) : (
                            /* Mobile Menu Button and Icons */
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}>
                                {/* Wishlist Icon - Mobile (outside drawer) - ALWAYS SHOW COUNT */}
                                <Tooltip title={isLoggedIn ? "Wishlist" : "Login to view wishlist"} placement="bottom">
                                    <Badge count={displayWishlistCount} size="small" offset={[-5, 5]}>
                                        <Button
                                            type="text"
                                            icon={<HeartOutlined style={{
                                                color: '#001529',
                                                fontSize: '18px'
                                            }} />}
                                            onClick={handleWishlistClick}
                                            aria-label={`Wishlist with ${displayWishlistCount} items`}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: '32px',
                                                height: '32px',
                                                minWidth: '32px',
                                                padding: '4px'
                                            }}
                                        />
                                    </Badge>
                                </Tooltip>

                                {/* Schedule Icon - Mobile (when logged in) */}
                                {isLoggedIn && (
                                    <Tooltip title="Schedule" placement="bottom">
                                        <Badge count={0} size="small" offset={[-5, 5]}>
                                            <Button
                                                type="text"
                                                icon={<CalendarOutlined style={{
                                                    color: '#001529',
                                                    fontSize: '18px'
                                                }} />}
                                                onClick={handleScheduleClick}
                                                aria-label="Schedule"
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: '32px',
                                                    height: '32px',
                                                    minWidth: '32px',
                                                    padding: '4px'
                                                }}
                                            />
                                        </Badge>
                                    </Tooltip>
                                )}

                                {/* Notification Icon - Mobile (when logged in) */}
                                {isLoggedIn && (
                                    <Tooltip title="Notifications" placement="bottom">
                                        <Badge count={notificationCount} size="small" offset={[-5, 5]}>
                                            <Button
                                                type="text"
                                                icon={<BellOutlined style={{
                                                    color: '#001529',
                                                    fontSize: '18px'
                                                }} />}
                                                onClick={handleNotificationsClick}
                                                aria-label={`Notifications with ${notificationCount} new items`}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: '32px',
                                                    height: '32px',
                                                    minWidth: '32px',
                                                    padding: '4px'
                                                }}
                                            />
                                        </Badge>
                                    </Tooltip>
                                )}

                                {/* Chat Icon - Mobile (when logged in) */}
                                {isLoggedIn && (
                                    <Tooltip title="Chat" placement="bottom">
                                        <Badge count={0} size="small" offset={[-5, 5]}>
                                            <Button
                                                type="text"
                                                icon={<MessageOutlined style={{
                                                    color: '#001529',
                                                    fontSize: '18px'
                                                }} />}
                                                onClick={handleChatClick}
                                                aria-label="Chat"
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: '32px',
                                                    height: '32px',
                                                    minWidth: '32px',
                                                    padding: '4px'
                                                }}
                                            />
                                        </Badge>
                                    </Tooltip>
                                )}

                                <Button
                                    type="text"
                                    icon={drawerVisible ? <CloseOutlined /> : <MenuOutlined />}
                                    onClick={() => setDrawerVisible(!drawerVisible)}
                                    aria-label={drawerVisible ? "Close menu" : "Open menu"}
                                    style={{
                                        color: '#001529',
                                        fontSize: '18px',
                                        width: '32px',
                                        height: '32px',
                                        minWidth: '32px',
                                        padding: '4px'
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </Header>

            {/* Mobile Drawer */}
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
                            onClick={() => setDrawerVisible(false)}
                            aria-label="Close menu"
                            style={{
                                color: '#001529'
                            }}
                        />
                    </div>
                }
                placement="right"
                onClose={() => setDrawerVisible(false)}
                open={drawerVisible}
                closable={false}
                width={280}
                bodyStyle={{
                    padding: '16px 0'
                }}
            >
                {/* Mobile Contact Info in Drawer */}
                <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #f0f0f0',
                    marginBottom: '16px'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '8px'
                    }}>
                        <PhoneOutlined style={{ fontSize: '14px', color: '#001529' }} />
                        <Text style={{ fontSize: '14px', color: '#001529' }}>
                            {companyContact.phone}
                        </Text>
                    </div>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <MailOutlined style={{ fontSize: '14px', color: '#001529' }} />
                        <Text style={{ fontSize: '14px', color: '#001529' }}>
                            {companyContact.email}
                        </Text>
                    </div>
                </div>

                <Menu
                    mode="vertical"
                    selectedKeys={[location.pathname]}
                    style={{
                        border: 'none',
                        marginBottom: '16px'
                    }}
                    items={[
                        ...menuItems,
                        {
                            key: '/wishlist',
                            label: (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    width: '100%'
                                }}>
                                    <span>Wishlist</span>
                                    <Badge count={displayWishlistCount} size="small" />
                                </div>
                            ),
                            icon: <HeartOutlined />
                        },
                        ...(isLoggedIn ? [
                            {
                                key: '/schedule',
                                label: 'Schedule',
                                icon: <CalendarOutlined />
                            },
                            {
                                key: '/notifications',
                                label: (
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        width: '100%'
                                    }}>
                                        <span>Notifications</span>
                                        <Badge count={notificationCount} size="small" />
                                    </div>
                                ),
                                icon: <BellOutlined />
                            },
                            {
                                key: '/messages',
                                label: 'Chat',
                                icon: <MessageOutlined />
                            }
                        ] : [])
                    ].map(item => ({
                        ...item,
                        style: {
                            padding: '12px 20px',
                            fontSize: '16px',
                            fontWeight: '500',
                            margin: '0',
                            height: 'auto',
                            lineHeight: '1.5',
                            border: 'none'
                        },
                        onClick: () => handleMenuClick(item.key)
                    }))}
                />

                {/* User Section or Auth Buttons */}
                {isLoggedIn ? (
                    <div style={{
                        marginTop: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        padding: '0 20px',
                        borderTop: '1px solid #f0f0f0',
                        paddingTop: '20px'
                    }}>
                        {/* User Info Section */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '16px 0',
                            borderBottom: '1px solid #f0f0f0',
                            marginBottom: '8px'
                        }}>
                            <Avatar
                                size="large"
                                style={{
                                    backgroundColor: (profilePictureUrl && !profileImageError) ? 'transparent' : '#001529',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    border: (profilePictureUrl && !profileImageError) ? '2px solid #001529' : 'none'
                                }}
                                src={profilePictureUrl && !profileImageError ? profilePictureUrl : null}
                                onError={handleImageError}
                                icon={(!profilePictureUrl || profileImageError) && <UserOutlined />}
                            >
                                {(!profilePictureUrl || profileImageError) && getUserInitials()}
                            </Avatar>
                            <div style={{ flex: 1 }}>
                                <div style={{
                                    fontWeight: '600',
                                    fontSize: '16px',
                                    color: '#001529'
                                }}>
                                    {getDisplayName()}
                                </div>
                                <div style={{
                                    fontSize: '14px',
                                    color: '#666',
                                    marginTop: '2px'
                                }}>
                                    {getUserEmail()}
                                </div>
                            </div>
                        </div>

                        <Button
                            size="large"
                            icon={<UserOutlined />}
                            onClick={handleProfileClick}
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
                ) : (
                    <div style={{
                        marginTop: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        padding: '0 20px',
                        borderTop: '1px solid #f0f0f0',
                        paddingTop: '20px'
                    }}>
                        <Button
                            size="large"
                            onClick={() => {
                                navigate('/login');
                                setDrawerVisible(false);
                            }}
                            style={{
                                color: '#001529',
                                borderColor: '#001529',
                                fontWeight: '500',
                                height: '44px'
                            }}
                            aria-label="Login to your account"
                        >
                            LogIn
                        </Button>
                        <Button
                            size="large"
                            type="primary"
                            onClick={() => {
                                navigate('/register/verify-email');
                                setDrawerVisible(false);
                            }}
                            style={{
                                background: '#001529',
                                borderColor: '#001529',
                                fontWeight: '500',
                                height: '44px'
                            }}
                            aria-label="Register new account"
                        >
                            Register
                        </Button>
                    </div>
                )}
            </Drawer>
        </>
    );
};

export default GlobalNavigation;