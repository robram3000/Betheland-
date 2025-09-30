import React, { useState } from 'react';
import { Layout, Menu, Button } from 'antd';
import {
    GlobalOutlined,
    ContactsOutlined,
    SafetyCertificateOutlined,
    TeamOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined
} from '@ant-design/icons';
import { GlobalNavigation, Footer } from '../Navigation/index';
import { useNavigate, useLocation } from 'react-router-dom';

const { Content, Sider } = Layout;

const BaseView = ({ children, background = 'white' }) => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        {
            key: '/about',
            icon: <TeamOutlined />,
            label: 'About Us',
        },
        {
            key: '/contact',
            icon: <ContactsOutlined />,
            label: 'Contact Us',
        },
        {
            key: '/privacy-policy',
            icon: <SafetyCertificateOutlined />,
            label: 'Privacy Policy',
        },
        {
            key: '/',
            icon: <GlobalOutlined />,
            label: 'Back to Home',
        },
    ];

    const handleMenuClick = ({ key }) => {
        navigate(key);
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <GlobalNavigation />
            <Layout>
                {/* Sidebar Navigation */}
                <Sider
                    width={250}
                    collapsed={collapsed}
                    style={{
                        background: '#fff',
                        boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
                    }}
                    breakpoint="lg"
                    collapsedWidth="0"
                    onCollapse={(collapsed) => setCollapsed(collapsed)}
                >
                    <div style={{
                        padding: '16px',
                        borderBottom: '1px solid #f0f0f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <span style={{
                            fontWeight: 'bold',
                            color: '#1890ff',
                            opacity: collapsed ? 0 : 1,
                            transition: 'opacity 0.2s'
                        }}>
                            Documentation
                        </span>
                        <Button
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={() => setCollapsed(!collapsed)}
                            style={{ fontSize: '16px' }}
                        />
                    </div>

                    <Menu
                        mode="inline"
                        selectedKeys={[location.pathname]}
                        items={menuItems}
                        onClick={handleMenuClick}
                        style={{
                            borderRight: 0,
                            padding: '8px 0'
                        }}
                    />
                </Sider>

                {/* Main Content */}
                <Layout style={{ padding: '0' }}>
                    <Content style={{
                        background,
                        padding: '24px',
                        margin: 0,
                        minHeight: 280,
                    }}>
                        {children}
                    </Content>
                </Layout>
            </Layout>
            <Footer />
        </Layout>
    );
};

export default BaseView;