// GlobalAdminNavigation.jsx
import React, { useState } from 'react';
import {
    Layout,
    Menu,
    Divider,
    Typography,
    Tooltip,
    Badge,
    Avatar,
    theme,
} from 'antd';
import {
    SecurityScanOutlined,
    DashboardOutlined,
    SettingOutlined,
    UserOutlined,
    TeamOutlined,
    BarChartOutlined,
    FileTextOutlined,
    ShoppingOutlined,
    MessageOutlined,
    BellOutlined,
    AppstoreOutlined,
    SafetyCertificateOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;
const { Title, Text } = Typography;

const GlobalAdminNavigation = ({ collapsed, onMenuClick }) => {
    const [selectedKey, setSelectedKey] = useState('dashboard');
    const {
        token: { colorPrimary, colorBgContainer },
    } = theme.useToken();

    const navigationItems = [
   
        {
            key: 'authentication',
            icon: <SafetyCertificateOutlined />,
            label: 'Authentication Logs',
            badge: 3,
        },
        {
            key: 'users',
            icon: <UserOutlined />,
            label: 'User Management',
        },
      
        {
            key: 'content',
            icon: <FileTextOutlined />,
            label: 'Content Management',
        },
        {
            key: 'landing',
            icon: <AppstoreOutlined />,
            label: 'Landing Page',
        },
    
    ];

  
   

    const handleMenuClick = ({ key }) => {
        setSelectedKey(key);
        if (onMenuClick) {
            onMenuClick(key);
        }
    };

    const renderMenuItem = (item) => {
        const menuItem = {
            key: item.key,
            icon: item.badge ? (
                <Badge count={item.badge} size="small" offset={[6, -2]} style={{ boxShadow: '0 0 0 2px #fff' }}>
                    {item.icon}
                </Badge>
            ) : item.icon,
            label: collapsed ? (
                <Tooltip title={item.label} placement="right">
                    {item.label}
                </Tooltip>
            ) : (
                item.label
            ),
            style: {
                borderRadius: '8px',
                margin: '4px 8px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
            },
        };

        return menuItem;
    };

    return (
        <Sider
            trigger={null}
            collapsible
            collapsed={collapsed}
            width={280}
            collapsedWidth={80}
            style={{
                background: colorBgContainer,
                height: '100vh',
                borderRight: '1px solid rgba(0,0,0,0.06)',
                position: 'fixed',
                left: 0,
                top: 68,
                bottom: 0,
                zIndex: 999,
                boxShadow: '2px 0 8px rgba(0,0,0,0.04)',
            }}
        >
            {/* Header Section */}
            <div style={{
                padding: collapsed ? '20px 8px' : '20px 16px',
                borderBottom: '1px solid rgba(0,0,0,0.06)',
                textAlign: collapsed ? 'center' : 'left',
                background: 'rgba(0,0,0,0.02)',
            }}>
                {!collapsed ? (
                    <div>
                        <Title level={4} style={{ margin: 0, color: colorPrimary, fontSize: '16px', fontWeight: 600 }}>
                            Control Center
                        </Title>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            Manage your platform
                        </Text>
                    </div>
                ) : (
                    <div style={{
                        width: 32,
                        height: 32,
                        background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto',
                    }}>
                        <AppstoreOutlined style={{ color: 'white', fontSize: '16px' }} />
                    </div>
                )}
            </div>

            {/* Main Navigation */}
            <div style={{ padding: '16px 0' }}>
                <Text strong style={{
                    padding: '0 16px 12px',
                    fontSize: '12px',
                    color: '#8c8c8c',
                    letterSpacing: '0.5px',
                    display: collapsed ? 'none' : 'block'
                }}>
                    MAIN NAVIGATION
                </Text>
                <Menu
                    mode="inline"
                    selectedKeys={[selectedKey]}
                    onClick={handleMenuClick}
                    style={{
                        border: 'none',
                        background: 'transparent',
                    }}
                    items={navigationItems.map(renderMenuItem)}
                />
            </div>

            <Divider style={{ margin: '8px 16px', background: 'rgba(0,0,0,0.06)' }} />

          
        </Sider>
    );
};

export default GlobalAdminNavigation;