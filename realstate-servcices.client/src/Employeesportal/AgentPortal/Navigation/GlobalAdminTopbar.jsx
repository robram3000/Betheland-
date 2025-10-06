// GlobalAdminTopbar.jsx (Updated)
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
    message
} from 'antd';
import {
    QuestionCircleOutlined,
    UserOutlined,
    LogoutOutlined,
    BellOutlined,
    SearchOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    SettingOutlined,
    MoonOutlined,
    SunOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import authService from '../../../Authpage/Services/LoginAuth';
import { useUser } from '../../../Authpage/Services/UserContextService';

const { Header } = Layout;
const { Text } = Typography;
const { Search } = Input;

const GlobalAdminTopbar = ({ onToggle, collapsed }) => {
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const navigate = useNavigate();
    const { user, logout } = useUser();

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
        // Add help logic here
        console.log('Help clicked');
    };

    const handleSearch = (value) => {
        console.log('Search:', value);
    };

    const toggleDarkMode = (checked) => {
        setDarkMode(checked);
        // Add dark mode toggle logic here
        console.log('Dark mode:', checked);
    };

    // Get display name from user context
    const getDisplayName = () => {
        if (!user) return 'Admin';

        // Try username first
        if (user.username && user.username.trim() !== '') {
            return user.username;
        }

        // Then try email (without domain)
        if (user.email) {
            return user.email.split('@')[0];
        }

        // Fallback based on role
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

    // Get user initials for avatar
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

    // Get role display name
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
                    padding: '8px 12px',
                    borderBottom: '1px solid #f0f0f0',
                    minWidth: '200px',
                    background: 'rgba(0,0,0,0.02)'
                }}>
                    <div style={{
                        fontWeight: '600',
                        fontSize: '14px',
                        color: '#1a365d',
                        marginBottom: '2px'
                    }}>
                        {getDisplayName()}
                    </div>
                    <div style={{
                        fontSize: '12px',
                        color: '#666',
                        marginBottom: '2px'
                    }}>
                        {user?.email || 'No email'}
                    </div>
                    <div style={{
                        fontSize: '11px',
                        color: '#888',
                        fontWeight: '500',
                        background: 'rgba(26, 54, 93, 0.1)',
                        padding: '2px 6px',
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
        <Header
            style={{
                background: colorBgContainer,
                padding: '0 24px',
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
                        fontSize: '16px',
                        width: 32,
                        height: 32,
                        color: '#1a365d', // Dark blue color
                    }}
                />

                {/* Logo */}
                <Text
                    strong
                    style={{
                        fontSize: '20px',
                        color: '#1a365d', // Dark blue color
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
                        backgroundColor: '#1a365d', 
                    }}
                >
                    <Button
                        type="text"
                        icon={<BellOutlined />}
                        style={{
                            width: 32,
                            height: 32,
                            color: '#1a365d', 
                        }}
                    />
                </Badge>

                {/* Help Button */}
                <Button
                    type="text"
                    icon={<QuestionCircleOutlined />}
                    onClick={handleHelp}
                    style={{
                        color: '#1a365d', // Dark blue color
                    }}
                >
                    Help
                </Button>

               

                {/* Profile Dropdown */}
                <Dropdown
                    menu={{ items: profileMenuItems }}
                    trigger={['click']}
                    open={dropdownVisible}
                    onOpenChange={setDropdownVisible}
                    placement="bottomRight"
                    overlayStyle={{
                        minWidth: 200,
                    }}
                >
                    <Button
                        type="text"
                        style={{
                            padding: '4px 8px',
                            height: 'auto',
                            borderRadius: '6px',
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
                                size="small"
                                style={{
                                    backgroundColor: '#1a365d', // Dark blue color
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
                                    fontSize: '12px',
                                    color: '#1a365d', // Dark blue color
                                }}>
                                    {getDisplayName()}
                                </Text>
                                <Text type="secondary" style={{
                                    fontSize: '10px',
                                }}>
                                    {getRoleDisplayName()}
                                </Text>
                            </div>
                        </Space>
                    </Button>
                </Dropdown>
            </Space>
        </Header>
    );
};

export default GlobalAdminTopbar;