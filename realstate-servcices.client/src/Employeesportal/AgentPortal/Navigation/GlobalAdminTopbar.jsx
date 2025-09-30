// GlobalAdminTopbar.jsx
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

const { Header } = Layout;
const { Text } = Typography;
const { Search } = Input;

const GlobalAdminTopbar = ({ onToggle, collapsed }) => {
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const {
        token: { colorBgContainer },
    } = theme.useToken();

    const handleLogout = () => {
        // Add logout logic here
        console.log('Logout clicked');
        setDropdownVisible(false);
    };

    const handleProfile = () => {
        // Add profile logic here
        console.log('Profile clicked');
        setDropdownVisible(false);
    };

    const handleSettings = () => {
        // Add settings logic here
        console.log('Settings clicked');
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

    const profileMenuItems = [
        {
            key: '1',
            icon: <UserOutlined />,
            label: 'Profile',
            onClick: handleProfile,
        },
        {
            key: '2',
            icon: <SettingOutlined />,
            label: 'Settings',
            onClick: handleSettings,
        },
        {
            type: 'divider',
        },
        {
            key: '3',
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
                        backgroundColor: '#1a365d', // Dark blue color
                    }}
                >
                    <Button
                        type="text"
                        icon={<BellOutlined />}
                        style={{
                            width: 32,
                            height: 32,
                            color: '#1a365d', // Dark blue color
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
                        minWidth: 160,
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
                                A
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
                                    Admin User
                                </Text>
                                <Text type="secondary" style={{
                                    fontSize: '10px',
                                }}>
                                    Administrator
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