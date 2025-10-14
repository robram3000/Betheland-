import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Menu, Button, Drawer, Grid, Badge, Dropdown, Avatar, Space, List, Typography, Row, Col, Tooltip, Skeleton } from 'antd';
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

const { Header } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;

const useSafeWishlistData = () => {
    try {
        const { useWishlistData } = require('../Property/Services/WishlistAdded');
        const wishlistData = useWishlistData();
        return wishlistData;
    } catch (error) {
        return {
            wishlistCount: 0,
            isAuthenticated: false,
            refreshWishlist: () => { },
            toggleWishlist: () => Promise.resolve(),
            isPropertyInWishlist: () => Promise.resolve(false),
            loading: false,
            wishlistPropertyIds: [],
            updateTrigger: 0
        };
    }
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

    // Use the safe wishlist data hook
    const {
        wishlistCount,
        isAuthenticated: isWishlistAuthenticated,
        refreshWishlist,
        wishlistPropertyIds,
        updateTrigger
    } = useSafeWishlistData();

    // Mock notification data
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            title: 'New Property Match',
            description: 'A new property matching your criteria is available',
            time: '5 min ago',
            read: false,
            type: 'property'
        },
        {
            id: 2,
            title: 'Schedule Reminder',
            description: 'Your property viewing is scheduled for tomorrow',
            time: '1 hour ago',
            read: false,
            type: 'schedule'
        },
        {
            id: 3,
            title: 'Message Received',
            description: 'You have a new message from the agent',
            time: '2 hours ago',
            read: true,
            type: 'message'
        },
        {
            id: 4,
            title: 'Price Drop',
            description: 'A property in your wishlist has reduced price',
            time: '1 day ago',
            read: true,
            type: 'price'
        }
    ]);

    // Use dynamic wishlist count from context
    const displayWishlistCount = wishlistCount || 0;
    const notificationCount = notifications.filter(notification => !notification.read).length;

    // Company contact information
    const companyContact = {
        phone: '0977-849-1888 / 0917-791-1981',
        email: 'allanlao@betheland.com.ph'
    };

    // Simple navigation items
    const menuItems = [
        { key: '/', label: 'Home' },
        { key: '/properties', label: 'Properties' },
        { key: '/about', label: 'About Us' },
        { key: '/contact-us', label: 'Contact Us' }
    ];

    // FIXED: Image URL processing - similar to PropertyCard.jsx
    const processImageUrl = (url) => {
        if (!url || typeof url !== 'string' || url.trim() === '') {
            console.log("GlobalNavigation - No image URL provided, using default");
            return '/default-avatar.jpg';
        }

        console.log("GlobalNavigation - Processing image URL:", url);

        // If it's already a full URL, return as is
        if (url.startsWith('http') || url.startsWith('//') || url.startsWith('blob:')) {
            return url;
        }

        // Handle different path formats
        if (url.startsWith('/uploads/')) {
            const fullUrl = `https://localhost:7075${url}`;
            console.log("GlobalNavigation - Built full URL from /uploads/:", fullUrl);
            return fullUrl;
        }

        if (url.includes('.') && !url.startsWith('/')) {
            const fullUrl = `https://localhost:7075/uploads/profile-pictures/${url}`;
            console.log("GlobalNavigation - Built full URL for filename:", fullUrl);
            return fullUrl;
        }

        if (url.startsWith('uploads/')) {
            const fullUrl = `https://localhost:7075/${url}`;
            console.log("GlobalNavigation - Built full URL from uploads/:", fullUrl);
            return fullUrl;
        }

        console.log("GlobalNavigation - Using default avatar");
        return '/default-avatar.jpg';
    };

    // Load user profile data
    const loadUserProfile = async () => {
        if (!isLoggedIn) return;

        setLoadingProfile(true);
        try {
            console.log('🔄 GlobalNavigation - Loading user profile...');
            const result = await profileService.getProfile();

            if (result.success && result.data) {
                console.log('✅ GlobalNavigation - Profile data loaded:', result.data);
                setProfileData(result.data);

                // Update currentUser with profile data
                setCurrentUser(prev => ({
                    ...prev,
                    profilePicture: result.data.profilePicture,
                    username: result.data.username || prev?.username,
                    email: result.data.email || prev?.email,
                    firstName: result.data.firstName,
                    lastName: result.data.lastName
                }));
            } else {
                console.warn('❌ GlobalNavigation - Failed to load profile:', result.message);
            }
        } catch (error) {
            console.error('💥 GlobalNavigation - Error loading profile:', error);
        } finally {
            setLoadingProfile(false);
        }
    };

    // UPDATED: Get profile picture URL from profileData first, then fallback to currentUser
    const getProfilePictureUrl = () => {
        // Try profileData first (from ProfileService)
        if (profileData?.profilePicture) {
            console.log("GlobalNavigation - Profile picture from profileData:", profileData.profilePicture);
            return processImageUrl(profileData.profilePicture);
        }

        // Fallback to currentUser data
        if (currentUser?.profilePicture) {
            console.log("GlobalNavigation - Profile picture from currentUser:", currentUser.profilePicture);
            return processImageUrl(currentUser.profilePicture);
        }

        console.log("GlobalNavigation - No profile picture found");
        return null;
    };

    // Check authentication status and load profile
    useEffect(() => {
        checkAuthStatus();
    }, [location]);

    // Load profile when user logs in
    useEffect(() => {
        if (isLoggedIn) {
            loadUserProfile();
        } else {
            setProfileData(null);
        }
    }, [isLoggedIn]);

    // Refresh wishlist when authentication status changes
    useEffect(() => {
        if (isLoggedIn) {
            refreshWishlist();
        }
    }, [isLoggedIn, updateTrigger, refreshWishlist]);

    // Add periodic refresh for real-time updates
    useEffect(() => {
        if (isLoggedIn) {
            const interval = setInterval(() => {
                refreshWishlist();
            }, 30000);

            return () => clearInterval(interval);
        }
    }, [isLoggedIn, refreshWishlist]);

    const checkAuthStatus = () => {
        const authenticated = authService.isAuthenticated();
        setIsLoggedIn(authenticated);
        if (authenticated) {
            const user = authService.getCurrentUser();
            console.log("GlobalNavigation - Current User from auth:", user);
            setCurrentUser(user);
            setProfileImageError(false);
        } else {
            setCurrentUser(null);
            setProfileData(null);
            setProfileImageError(false);
        }
    };

    const handleImageError = (e) => {
        console.error("GlobalNavigation - Profile image failed to load:", e);
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
    };

    const handleLogout = () => {
        authService.logout();
        setIsLoggedIn(false);
        setCurrentUser(null);
        setProfileData(null);
        setProfileImageError(false);
        navigate('/');
        setDrawerVisible(false);
    };

    const handleProfileClick = () => {
        navigate('/profile');
        setDrawerVisible(false);
    };

    const handleSettingsClick = () => {
        navigate('/settings');
        setDrawerVisible(false);
    };

    // Refresh profile data
    const refreshProfile = () => {
        if (isLoggedIn) {
            loadUserProfile();
        }
    };

    // Mark notification as read
    const markAsRead = (notificationId) => {
        setNotifications(prev =>
            prev.map(notif =>
                notif.id === notificationId ? { ...notif, read: true } : notif
            )
        );
    };

    // Mark all as read
    const markAllAsRead = () => {
        setNotifications(prev =>
            prev.map(notif => ({ ...notif, read: true }))
        );
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
                console.log("GlobalNavigation - Built full name from profileData:", fullName);
                return fullName;
            }
        }

        // Fallback to username if no name parts available
        if (profileData?.username && profileData.username.trim() !== '') {
            return profileData.username;
        }

        // Fallback to currentUser data
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
            </div>

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
                        onClick={() => markAsRead(notification.id)}
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

            <div style={{
                padding: '12px 16px',
                borderTop: '1px solid #f0f0f0',
                textAlign: 'center',
                background: 'white'
            }}>
                <Button
                    type="link"
                    onClick={handleNotificationsClick}
                    icon={<EyeOutlined />}
                    style={{ padding: 0 }}
                >
                    View All Notifications
                </Button>
            </div>
        </div>
    );
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
                    <Button
                        type="link"
                        size="small"
                        onClick={refreshProfile}
                        loading={loadingProfile}
                        icon={<ReloadOutlined />}
                        style={{ padding: 0, height: 'auto', fontSize: '11px', marginTop: '4px' }}
                    >
                        Refresh Profile
                    </Button>
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
            key: 'settings',
            icon: <SettingOutlined />,
            label: 'Settings',
            onClick: handleSettingsClick
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
    console.log("GlobalNavigation - Final profile picture URL for display:", profilePictureUrl);

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

                            {/* Enhanced Wishlist Icon with Real-time Updates - ALWAYS SHOW COUNT */}
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
                                            Wishlist ({displayWishlistCount})
                                        </span>
                                    </Button>
                                </Badge>
                            </Tooltip>

                            {/* Notification Icon with Label and Dropdown */}
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
                                    >
                                        <Badge count={notificationCount} size="small" offset={[-5, 5]}>
                                            <Button
                                                type="text"
                                                icon={<BellOutlined style={{
                                                    color: 'white',
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
                                                    marginLeft: '4px'
                                                }}>
                                                    Notifications ({notificationCount})
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
                                        Login
                                    </Button>
                                    <Button
                                        type="primary"
                                        onClick={() => navigate('/register/verify-email')}
                                        style={{
                                            background: '#001529',
                                            borderColor: '#001529',
                                            fontWeight: '500'
                                        }}
                                        aria-label="Register new account"
                                    >
                                        Register
                                    </Button>
                                </div>
                            )
                        ) : (
                            /* Mobile Menu Button */
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                {/* Mobile Contact Info - Email only */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    marginRight: '8px'
                                }}>
                                    <MailOutlined style={{ fontSize: '14px', color: '#001529' }} />
                                    <Text style={{ fontSize: '12px', color: '#001529' }}>
                                        {companyContact.email}
                                    </Text>
                                </div>

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
                                                justifyContent: 'center'
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
                                                    justifyContent: 'center'
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
                                                    justifyContent: 'center'
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
                                                    justifyContent: 'center'
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
                                        fontSize: '18px'
                                    }}
                                />

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
                                                    <Button
                                                        type="link"
                                                        size="small"
                                                        onClick={refreshProfile}
                                                        loading={loadingProfile}
                                                        icon={<ReloadOutlined />}
                                                        style={{ padding: 0, height: 'auto', fontSize: '11px', marginTop: '4px' }}
                                                    >
                                                        Refresh
                                                    </Button>
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
                                                icon={<SettingOutlined />}
                                                onClick={handleSettingsClick}
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
                                                Settings
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
                                                Login
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
                            </div>
                        )}
                    </div>
                </div>
            </Header>
        </>
    );
};

export default GlobalNavigation;