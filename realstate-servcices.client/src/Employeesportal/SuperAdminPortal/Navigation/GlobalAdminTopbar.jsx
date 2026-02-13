// GlobalAdminTopbar.jsx
import React, { useState, useEffect } from 'react';
import {
    Layout,
    Typography,
    Button,
    Dropdown,
    Space,
    Avatar,
    theme,
    Grid,
    Drawer,
    Menu
} from 'antd';
import {
    QuestionCircleOutlined,
    UserOutlined,
    LogoutOutlined,
    SettingOutlined,
    CloseOutlined,
    BarChartOutlined,
    HomeOutlined,
    UserOutlined as AgentOutlined,
    UsergroupAddOutlined,
    CalendarOutlined,
    GlobalOutlined,
    SafetyCertificateOutlined,
    MenuOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../../../Authpage/Services/UserContextService';

const { Header } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;

const GlobalAdminTopbar = () => {
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useUser();
    const screens = useBreakpoint();
    const [selectedNavKey, setSelectedNavKey] = useState('dashboard');

    const isMobile = !screens.md;

    // Navigation items for super admin - matching GlobalAdminNavigation
    const navigationItems = [
        {
            key: 'dashboard',
            icon: <BarChartOutlined />,
            label: 'Dashboard',
            path: '/portal/super-admin/dashboard'
        },
        {
            key: 'properties-management',
            icon: <HomeOutlined />,
            label: 'Properties',
            path: '/portal/super-admin/property'
        },
        {
            key: 'agents',
            icon: <AgentOutlined />,
            label: 'Accounts',
            path: '/portal/super-admin/agent'
        },
        {
            key: 'clients',
            icon: <UsergroupAddOutlined />,
            label: 'Clients',
            path: '/portal/super-admin/client'
        },
        {
            key: 'schedule-management',
            icon: <CalendarOutlined />,
            label: 'Schedule',
            path: '/portal/super-admin/schedules'
        },
        {
            key: 'landing-page-config',
            icon: <GlobalOutlined />,
            label: 'Landing Page Config',
            path: '/portal/super-admin/config-landing-page'
        },
        {
            key: 'auth-log',
            icon: <SafetyCertificateOutlined />,
            label: 'Auth Log',
            path: '/portal/super-admin/authlog'
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

    const handleLogout = () => {
        logout();
     
        window.location.href = '/login';
        setDropdownVisible(false);
        setMobileDrawerVisible(false);
    };

    const handleProfile = () => {
        navigate('/portal/super-admin/profile');
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

    const getDisplayName = () => {
        if (!user) return 'Super Admin';
        if (user.username && user.username.trim() !== '') {
            return user.username;
        }
        if (user.email) {
            return user.email.split('@')[0];
        }
        return 'Super Admin';
    };

    const getUserInitials = () => {
        const displayName = getDisplayName();
        if (displayName === 'Super Admin') return 'SA';

        return displayName
            .split(' ')
            .map(name => name[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getRoleDisplayName = () => {
        return 'Super Administrator';
    };

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
                        Admin Menu
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
                        onClick={() => navigate('/portal/super-admin/dashboard')}
                        role="button"
                        tabIndex={0}
                        onKeyPress={(e) => e.key === 'Enter' && navigate('/portal/super-admin/dashboard')}
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
                            Admin Portal
                        </div>
                    </div>
                </Space>

                {/* Right Side - Only show on desktop */}
                {!isMobile && (
                    <Space size="middle">
                     
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

            {/* Mobile Navigation Drawer */}
            <MobileDrawer />
        </>
    );
};

export default GlobalAdminTopbar;