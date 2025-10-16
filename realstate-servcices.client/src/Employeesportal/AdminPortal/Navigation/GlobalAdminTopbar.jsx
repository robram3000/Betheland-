
import React, { useState } from 'react';
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
const { Header } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;
const GlobalAdminTopbar = ({ onToggle, collapsed, mobileView }) => {
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [notificationDrawerVisible, setNotificationDrawerVisible] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const navigate = useNavigate();
    const { user, logout } = useUser();
    const screens = useBreakpoint();
    const {
        token: { colorBgContainer },
    } = theme.useToken();
    const handleLogout = () => {
        logout();
        message.success('Logged out successfully');
        navigate('/login');
        setDropdownVisible(false);
    };
    const handleProfile = () => {
        navigate('/profile');
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
                    <Text
                        strong
                        style={{
                            fontSize: mobileView ? '18px' : '20px',
                            color: '#1a365d',
                            fontWeight: 600,
                        }}
                    >
                        Betheland
                    </Text>
                </Space>

                {/* Right Side */}
                <Space size="middle">
              

                    {/* Notifications */}
                    <Badge
                        count={5}
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
                                color: '#1a365d',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        />
                    </Badge>

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