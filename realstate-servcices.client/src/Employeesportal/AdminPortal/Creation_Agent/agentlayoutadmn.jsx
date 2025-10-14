// AgentLayout.jsx
import React, { useState } from 'react';
import { Layout, theme, ConfigProvider, Tabs } from 'antd';
import GlobalAdminNavigation from '../Navigation/GlobalAdminNavigation';
import GlobalAdminTopbar from '../Navigation/GlobalAdminTopbar';
import AgentPage from './AgentPage';
import CreateAgent from './CreateAgent';
import PropAgentTable from './PropAgentTable';

const { Content } = Layout;
const { TabPane } = Tabs;

const AgentLayoutadmn = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState('agents');

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const handleToggle = () => {
        setCollapsed(!collapsed);
    };

    const handleTabChange = (key) => {
        setActiveTab(key);
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
                            padding: '0 24px',
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
                                padding: '24px',
                            }}
                        >
                            <div style={{ marginBottom: 24 }}>
                                <h1 style={{
                                    margin: 0,
                                    color: '#1a365d',
                                    fontSize: '28px',
                                    fontWeight: 600
                                }}>
                                    Agent Management
                                </h1>
                                <p style={{
                                    margin: '8px 0 0 0',
                                    color: '#666',
                                    fontSize: '14px'
                                }}>
                                    Manage real estate agents, their profiles and properties
                                </p>
                            </div>

                            <Tabs
                                activeKey={activeTab}
                                onChange={handleTabChange}
                                type="card"
                                size="large"
                                items={[
                                    {
                                        key: 'agents',
                                        label: 'All Agents',
                                        children: <AgentPage />,
                                    },
                                    {
                                        key: 'create',
                                        label: 'Create Agent',
                                        children: <CreateAgent onSuccess={() => setActiveTab('agents')} />,
                                    },
                                    {
                                        key: 'properties',
                                        label: 'Agent Properties',
                                        children: <PropAgentTable />,
                                    },
                                ]}
                            />
                        </Content>
                    </Layout>
                </Layout>
            </Layout>
        </ConfigProvider>
    );
};

export default AgentLayoutadmn;