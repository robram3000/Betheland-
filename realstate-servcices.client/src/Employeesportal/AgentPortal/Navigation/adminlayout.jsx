// AdminLayout.jsx
import React, { useState } from 'react';
import { Layout, theme, ConfigProvider } from 'antd';
import GlobalAdminNavigation from './GlobalAdminNavigation';
import GlobalAdminTopbar from './GlobalAdminTopbar';

const { Content } = Layout;

const AgentLayout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const handleToggle = () => {
        setCollapsed(!collapsed);
    };

    return (
        <ConfigProvider
            theme={{
                token: {
                    borderRadius: 8,
                    colorPrimary: '#1a365d',
                    colorInfo: '#1a365d',
                    colorSuccess: '#1a365d',
                },
            }}
        >
            <Layout style={{ minHeight: '100vh' }}>
                <GlobalAdminTopbar onToggle={handleToggle} collapsed={collapsed} />
                <Layout>
                    <GlobalAdminNavigation collapsed={collapsed} />
                    <Layout
                        style={{
                            marginLeft: collapsed ? 80 : 280,
                            marginTop: 68,
                            transition: 'all 0.2s',
                            background: '#f5f5f5',
                            padding: '0 24px', // Add horizontal padding
                        }}
                    >
                        <Content
                            style={{
                                background: colorBgContainer,
                                margin: '24px 0', 
                                minHeight: 280,
                                borderRadius: borderRadiusLG,
                                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                                border: '1px solid #f0f0f0',
                                maxWidth: '100%', 
                                overflow: 'hidden', 
                            }}
                        >
                            {children}
                        </Content>
                    </Layout>
                </Layout>
            </Layout>
        </ConfigProvider>
    );
};

export default AgentLayout;