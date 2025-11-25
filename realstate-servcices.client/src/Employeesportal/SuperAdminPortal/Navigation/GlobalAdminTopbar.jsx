import React, { useState } from 'react';
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
    Drawer
} from 'antd';
import {
    QuestionCircleOutlined,
    UserOutlined,
    LogoutOutlined,
    BellOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    SettingOutlined,
    CloseOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import authService from '../../../Authpage/Services/LoginAuth';
import { useUser } from '../../../Authpage/Services/UserContextService';
import './GlobalAdminTopbar.scss';

const { Header } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;

const GlobalAdminTopbar = ({ onToggle, collapsed, mobileView }) => {
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [notificationDrawerVisible, setNotificationDrawerVisible] = useState(false);
    const navigate = useNavigate();
    const { user, logout } = useUser();
    const screens = useBreakpoint();
    const {
        token: { colorBgContainer },
    } = theme.useToken();

    const handleLogout = () => {
        logout();
        window.location.href = '/';
        setDropdownVisible(false);
    };

    const handleProfile = () => {
        navigate('/portal/super-admin/profile');
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
            console.log('Notifications clicked');
        }
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
                        fontSize: '14px',
                        color: '#1a365d',
                        marginBottom: '4px'
                    }}>
                        {getDisplayName()}
                    </div>
                    <div style={{
                        fontSize: '13px',
                        color: '#666',
                        marginBottom: '6px'
                    }}>
                        {user?.email || 'No email'}
                    </div>
                    <div style={{
                        fontSize: '12px',
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
                    <Button
                        type="text"
                        icon={<CloseOutlined />}
                        onClick={() => setNotificationDrawerVisible(false)}
                    />
                </div>
            }
            placement="right"
            onClose={() => setNotificationDrawerVisible(false)}
            open={notificationDrawerVisible}
            width={320}
        >
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <BellOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
                <Text type="secondary">No new notifications</Text>
            </div>
        </Drawer>
    );

    return (
        <>
            <Header
                className="global-admin-topbar"
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
                {/* Left Side - Menu Toggle (Desktop only) */}
                {!mobileView && (
                    <Space size="middle" className="topbar-left">
                        <Button
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={onToggle}
                            className="menu-toggle-btn"
                        />
                        <div className="logo-container">
                            <Text strong className="logo-main">
                                BETHELAND
                            </Text>
                            <Text className="logo-subtitle">
                                Real Estate Services
                            </Text>
                        </div>
                    </Space>
                )}

                {/* Mobile View - Centered Logo with smaller font */}
                {mobileView && (
                    <div className="mobile-logo-center">
                        <div className="logo-container">
                            <Text strong className="logo-main-mobile">
                                BETHELAND
                            </Text>
                            <Text className="logo-subtitle-mobile">
                                Real Estate Services
                            </Text>
                        </div>
                    </div>
                )}

                {/* Right Side Actions */}
                <Space size="middle" className="topbar-right">
                    {/* Desktop Only - Notifications and Help */}
                    {!mobileView && (
                        <>
                          
                            <Button
                                type="text"
                                icon={<QuestionCircleOutlined />}
                                onClick={handleHelp}
                                className="help-btn"
                            >
                                Help
                            </Button>
                        </>
                    )}

                    {/* Profile Dropdown - Icon only on mobile */}
                    {mobileView ? (
                        <Dropdown
                            menu={{ items: profileMenuItems }}
                            trigger={['click']}
                            open={dropdownVisible}
                            onOpenChange={setDropdownVisible}
                            placement="bottomRight"
                            overlayStyle={{ minWidth: 220 }}
                        >
                            <Button
                                type="text"
                                className="profile-icon-btn"
                            >
                                <Avatar
                                    size="small"
                                    className="profile-avatar-mobile"
                                >
                                    {getUserInitials()}
                                </Avatar>
                            </Button>
                        </Dropdown>
                    ) : (
                        <Dropdown
                            menu={{ items: profileMenuItems }}
                            trigger={['click']}
                            open={dropdownVisible}
                            onOpenChange={setDropdownVisible}
                            placement="bottomRight"
                            overlayStyle={{ minWidth: 220 }}
                        >
                            <Button
                                type="text"
                                className="profile-dropdown-btn"
                            >
                                <Space size="small">
                                    <Avatar
                                        size="small"
                                        className="profile-avatar"
                                    >
                                        {getUserInitials()}
                                    </Avatar>
                                    <div className="profile-info">
                                        <Text strong className="profile-name">
                                            {getDisplayName()}
                                        </Text>
                                        <Text type="secondary" className="profile-role">
                                            {getRoleDisplayName()}
                                        </Text>
                                    </div>
                                </Space>
                            </Button>
                        </Dropdown>
                    )}

                    {/* Mobile Only - Menu Toggle */}
                    {mobileView && (
                        <Button
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={onToggle}
                            className="mobile-menu-toggle"
                        />
                    )}
                </Space>
            </Header>

            {/* Notification Drawer for Mobile */}
            <NotificationDrawer />
        </>
    );
};

export default GlobalAdminTopbar;