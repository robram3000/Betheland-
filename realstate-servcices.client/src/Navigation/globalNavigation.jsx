import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Drawer, Grid, Badge, Dropdown, Avatar, Space } from 'antd';
import {
    MenuOutlined,
    CloseOutlined,
    HeartOutlined,
    MessageOutlined,
    UserOutlined,
    LogoutOutlined,
    SettingOutlined,
    DownOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../Authpage/Services/LoginAuth';

const { Header } = Layout;
const { useBreakpoint } = Grid;

const GlobalNavigation = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const screens = useBreakpoint();

    // Mock wishlist count - you can replace this with actual state management
    const [wishlistCount] = useState(3);

    // Simple navigation items - no dropdowns needed
    const menuItems = [
        { key: '/', label: 'Home' },
        { key: '/properties', label: 'Properties' },
        { key: '/about', label: 'About Us' },
        { key: '/contact-us', label: 'Contact Us' }
    ];

    // Check authentication status on component mount and when location changes
    useEffect(() => {
        checkAuthStatus();
    }, [location]);

    const checkAuthStatus = () => {
        const authenticated = authService.isAuthenticated();
        setIsLoggedIn(authenticated);
        if (authenticated) {
            const user = authService.getCurrentUser();
            setCurrentUser(user);
            console.log('Current User:', user); // Debug log
        } else {
            setCurrentUser(null);
        }
    };

    const handleMenuClick = (key) => {
        navigate(key);
        setDrawerVisible(false);
    };

    const handleLogoClick = () => {
        navigate('/');
    };

    const handleWishlistClick = () => {
        navigate('/wishlist');
        setDrawerVisible(false);
    };

    const handleChatClick = () => {
        navigate('/messages');
        setDrawerVisible(false);
    };

    const handleLogout = () => {
        authService.logout();
        setIsLoggedIn(false);
        setCurrentUser(null);
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

    // Get display name - prioritize username, then email, then fallback
    const getDisplayName = () => {
        if (!currentUser) return 'User';

        // Try username first
        if (currentUser.username && currentUser.username.trim() !== '') {
            return currentUser.username;
        }

        // Then try email (without domain)
        if (currentUser.email) {
            return currentUser.email.split('@')[0];
        }

        // Fallback
        return 'User';
    };

    // Get user initials for avatar
    const getUserInitials = () => {
        const displayName = getDisplayName();
        if (displayName === 'User') return 'U';

        return displayName
            .split(' ')
            .map(name => name[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // User dropdown menu items - ONLY for user profile
    const userMenuItems = [
        {
            key: 'user-info',
            label: (
                <div style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ fontWeight: '600', fontSize: '14px' }}>
                        {getDisplayName()}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                        {currentUser?.email || 'No email'}
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

    return (
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
                {/* Logo */}
                <div
                    style={{
                        cursor: 'pointer',
                        flexShrink: 0,
                        userSelect: 'none',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center'
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
                        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                    }}>
                        Betheland
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

                {/* Right Section - Icons & User Menu */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    flexShrink: 0
                }}>
                    {/* Wishlist Icon */}
                    {isDesktop && (
                        <Badge count={wishlistCount} size="small" offset={[-5, 5]}>
                            <Button
                                type="text"
                                icon={<HeartOutlined style={{
                                    color: '#001529',
                                    fontSize: '18px',
                                    transition: 'color 0.3s'
                                }} />}
                                onClick={handleWishlistClick}
                                aria-label={`Wishlist with ${wishlistCount} items`}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            />
                        </Badge>
                    )}

                    {/* Chat Icon */}
                    {isDesktop && isLoggedIn && (
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
                                    justifyContent: 'center'
                                }}
                            />
                        </Badge>
                    )}

                    {/* User Menu (when logged in) OR Auth Buttons (when not logged in) */}
                    {isDesktop ? (
                        isLoggedIn ? (
                            <Dropdown
                                menu={{ items: userMenuItems }}
                                placement="bottomRight"
                                trigger={['click']}
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
                                                backgroundColor: '#001529',
                                                fontSize: '12px',
                                                fontWeight: '600'
                                            }}
                                        >
                                            {getUserInitials()}
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
                            {/* Wishlist Icon - Mobile (outside drawer) */}
                            <Badge count={wishlistCount} size="small" offset={[-5, 5]}>
                                <Button
                                    type="text"
                                    icon={<HeartOutlined style={{
                                        color: '#001529',
                                        fontSize: '18px'
                                    }} />}
                                    onClick={handleWishlistClick}
                                    aria-label={`Wishlist with ${wishlistCount} items`}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                />
                            </Badge>

                            {/* Chat Icon - Mobile (when logged in) */}
                            {isLoggedIn && (
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
                                {/* Simple menu items - no dropdowns for About Us and Contact Us */}
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
                                                    <Badge count={wishlistCount} size="small" />
                                                </div>
                                            ),
                                            icon: <HeartOutlined />
                                        },
                                        ...(isLoggedIn ? [{
                                            key: '/messages',
                                            label: 'Chat',
                                            icon: <MessageOutlined />
                                        }] : [])
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
                                                    backgroundColor: '#001529',
                                                    fontSize: '16px',
                                                    fontWeight: '600'
                                                }}
                                            >
                                                {getUserInitials()}
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
                                                    {currentUser?.email || 'No email'}
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
    );
};

export default GlobalNavigation;