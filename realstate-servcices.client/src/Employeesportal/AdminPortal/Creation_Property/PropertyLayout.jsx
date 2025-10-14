import React, { useState, useEffect } from 'react';
import { Layout, theme, ConfigProvider, Tabs, Badge } from 'antd';
import GlobalAdminNavigation from '../Navigation/GlobalAdminNavigation';
import GlobalAdminTopbar from '../Navigation/GlobalAdminTopbar';
import PropertyPage from './PropertyPage';
import CreateProperty from './CreateProperty';
import PropertyManagementTable from './PropertyManagementTable';
import ApprovalQueue from './ApprovalQueue';
import propertyService from './services/propertyService';

const { Content } = Layout;
const { TabPane } = Tabs;

const PropertyLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState('properties');
    const [pendingCount, setPendingCount] = useState(0);

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const handleToggle = () => {
        setCollapsed(!collapsed);
    };

    const handleTabChange = (key) => {
        setActiveTab(key);
    };

    const loadPendingCount = async () => {
        try {
            const data = await propertyService.getPendingProperties();
            setPendingCount(data.length);
        } catch (error) {
            console.error('Error loading pending count:', error);
        }
    };

    useEffect(() => {
        loadPendingCount();
    }, []);

    const tabItems = [
        {
            key: 'properties',
            label: 'All Properties',
            children: <PropertyPage />,
        },
        {
            key: 'approval',
            label: (
                <Badge count={pendingCount} size="small">
                    Approval Queue
                </Badge>
            ),
            children: <ApprovalQueue onUpdate={loadPendingCount} />,
        },
        {
            key: 'create',
            label: 'Create Property',
            children: <CreateProperty onSuccess={() => setActiveTab('properties')} />,
        },
        {
            key: 'management',
            label: 'Property Management',
            children: <PropertyManagementTable />,
        },
    ];

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
                                    Property Management
                                </h1>
                                <p style={{
                                    margin: '8px 0 0 0',
                                    color: '#666',
                                    fontSize: '14px'
                                }}>
                                    Manage real estate properties, approvals, and agent assignments
                                </p>
                            </div>

                            <Tabs
                                activeKey={activeTab}
                                onChange={handleTabChange}
                                type="card"
                                size="large"
                                items={tabItems}
                            />
                        </Content>
                    </Layout>
                </Layout>
            </Layout>
        </ConfigProvider>
    );
};

export default PropertyLayout;