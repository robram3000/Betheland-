// AgentLayout.jsx
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Layout, theme, ConfigProvider, Tabs, Badge, Button, Space, Typography } from 'antd';
import {
    PlusCircleOutlined,
    CheckCircleOutlined,
    DashboardOutlined,
    ArrowLeftOutlined,
    TeamOutlined,
    EyeOutlined
} from '@ant-design/icons';
import GlobalAdminNavigation from '../Navigation/GlobalAdminNavigation';
import GlobalAdminTopbar from '../Navigation/GlobalAdminTopbar';
import AgentPage from './AgentPage';
import CreateAgent from './CreateAgent';
import EditAgent from './EditAgent';
import ViewAgent from './ViewAgent';
import PropAgentTable from './PropAgentTable';
import agentService from '../../AdminPortal/Creation_Agent/Services/AgentService';

const { Content, Sider } = Layout;
const { Title } = Typography;

const AgentLayoutadmn = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState('agents');
    const [pendingCount, setPendingCount] = useState(0);
    const [agentsCount, setAgentsCount] = useState(0);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isViewing, setIsViewing] = useState(false);

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const handleToggle = () => {
        setCollapsed(!collapsed);
    };

    const handleTabChange = (key) => {
        setActiveTab(key);
        setIsEditing(false);
        setIsViewing(false);
        setSelectedAgent(null);
    };

    const handleEditAgent = (agent) => {
        setSelectedAgent(agent);
        setIsEditing(true);
        setIsViewing(false);
        // Stay on the same tab but render EditAgent component
    };

    const handleViewAgent = (agent) => {
        setSelectedAgent(agent);
        setIsViewing(true);
        setIsEditing(false);
        // Stay on the same tab but render ViewAgent component
    };

    const handleCreateAgent = () => {
        setSelectedAgent(null);
        setIsEditing(false);
        setIsViewing(false);
        setActiveTab('create');
    };

    const handleBackToAgents = () => {
        setActiveTab('agents');
        setIsEditing(false);
        setIsViewing(false);
        setSelectedAgent(null);
    };

    const handleBackFromEdit = () => {
        setIsEditing(false);
        setSelectedAgent(null);
        // Stay on current tab but go back to agent list
    };

    const loadPendingCount = async () => {
        try {
            const data = await agentService.getPendingAgents();
            setPendingCount(data.length);
        } catch (error) {
            console.error('Error loading pending count:', error);
        }
    };

    const loadAgentsCount = async () => {
        try {
            const data = await agentService.getAllAgents();
            setAgentsCount(data.length);
        } catch (error) {
            console.error('Error loading agents count:', error);
        }
    };

    useEffect(() => {
        loadPendingCount();
        loadAgentsCount();
    }, []);

    const getSeoData = () => {
        const baseTitle = "Betheland Agent Management";
        const baseDescription = "Comprehensive agent management platform for real estate professionals";
        const baseUrl = window.location.origin;

        const tabConfig = {
            agents: {
                title: isViewing
                    ? `Agent Profile - ${selectedAgent?.firstName || ''} ${selectedAgent?.lastName || 'Agent'} | ${baseTitle}`
                    : isEditing
                        ? `Edit Agent - ${selectedAgent?.firstName || ''} ${selectedAgent?.lastName || 'Agent'} | ${baseTitle}`
                        : `All Agents (${agentsCount}) | ${baseTitle}`,
                description: isViewing
                    ? `View complete profile and professional details for ${selectedAgent?.firstName || ''} ${selectedAgent?.lastName || 'agent'} in Betheland real estate platform.`
                    : isEditing
                        ? `Edit agent profile for ${selectedAgent?.firstName || ''} ${selectedAgent?.lastName || 'agent'} in Betheland real estate management system. Update agent details, contact information, and assignments.`
                        : `Browse and manage ${agentsCount} agent profiles in Betheland real estate platform. Comprehensive agent management dashboard.`,
                keywords: isViewing
                    ? "agent profile, real estate agent, agent details, Betheland, agent information"
                    : isEditing
                        ? "edit agent, update profile, modify agent, Betheland, agent editing"
                        : "agent management, real estate agents, agent profiles, Betheland, agent dashboard, real estate management",
                canonical: `${baseUrl}/agents`,
                ogImage: `${baseUrl}/images/agents-og.jpg`
            },
            approval: {
                title: pendingCount > 0
                    ? `Approval Queue (${pendingCount} Pending) | ${baseTitle}`
                    : `Approval Queue - All Caught Up | ${baseTitle}`,
                description: pendingCount > 0
                    ? `Manage ${pendingCount} pending agent approvals in Betheland real estate platform. Review, approve, or reject agent profiles awaiting approval.`
                    : 'No agents pending approval in Betheland agent management system. All agent profiles have been reviewed and processed.',
                keywords: "agent approval, pending agents, real estate approval, agent queue, Betheland, agent review",
                canonical: `${baseUrl}/agents/approval`,
                ogImage: `${baseUrl}/images/approval-og.jpg`
            },
            create: {
                title: `Create New Agent | ${baseTitle}`,
                description: 'Create new agent profiles in Betheland real estate management system. Add agent details, contact information, and assign properties.',
                keywords: "create agent, add agent, new agent profile, real estate agent, Betheland, agent creation",
                canonical: `${baseUrl}/agents/create`,
                ogImage: `${baseUrl}/images/create-agent-og.jpg`
            },
            management: {
                title: `Agent Management Dashboard | ${baseTitle}`,
                description: 'Advanced agent management dashboard with statistics, performance tracking, and comprehensive agent analytics for real estate professionals.',
                keywords: "agent management, dashboard, statistics, performance tracking, agent analytics, Betheland, real estate tools",
                canonical: `${baseUrl}/agents/management`,
                ogImage: `${baseUrl}/images/management-og.jpg`
            }
        };

        return tabConfig[activeTab] || {
            title: `Agent Management | ${baseTitle}`,
            description: baseDescription,
            keywords: "agent management, real estate, Betheland, agent profiles",
            canonical: `${baseUrl}/agents`,
            ogImage: `${baseUrl}/images/agents-og.jpg`
        };
    };

    const handleAgentsUpdate = () => {
        loadPendingCount();
        loadAgentsCount();
        if (activeTab === 'create' || isViewing || isEditing) {
            handleBackToAgents();
        }
    };

    const seoData = getSeoData();

    const tabItems = [
        {
            key: 'agents',
            label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TeamOutlined />
                    All Accounts
                </span>
            ),
        },
        {
            key: 'approval',
            label: (
                <Badge count={pendingCount} size="small" offset={[10, -5]}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircleOutlined />
                        Approval Queue Role
                    </span>
                </Badge>
            ),
        },
        {
            key: 'create',
            label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <PlusCircleOutlined />
                    Create Admin/Agent
                </span>
            ),
        },
        {
            key: 'management',
            label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <DashboardOutlined />
                    Account Management
                </span>
            ),
        },
    ];

    const getHeaderTitle = () => {
        if (isViewing) return `Agent Profile - ${selectedAgent?.firstName || ''} ${selectedAgent?.lastName || 'Agent'}`;
        if (isEditing) return `Edit Agent - ${selectedAgent?.firstName || ''} ${selectedAgent?.lastName || 'Agent'}`;

        switch (activeTab) {
            case 'agents': return 'All Agents';
            case 'approval': return 'Approval Queue';
            case 'create': return 'Create New Agent';
            case 'management': return 'Agent Management Dashboard';
            default: return 'Agent Management';
        }
    };

    const getHeaderDescription = () => {
        if (isViewing) return 'View complete agent profile and professional information';
        if (isEditing) return 'Update agent information, contact details, and assignments';

        switch (activeTab) {
            case 'agents': return `Browse and manage ${agentsCount} agent profiles`;
            case 'approval': return pendingCount > 0 ? `${pendingCount} agents pending approval` : 'All agents are approved';
            case 'create': return 'Add new agent profiles with detailed information';
            case 'management': return 'Advanced agent management and analytics';
            default: return 'Manage real estate agents and their assignments';
        }
    };

    const showAddButton = activeTab === 'agents' && !isEditing && !isViewing;
    const showBackButton = isEditing || isViewing;

    return (
        <ConfigProvider
            theme={{
                token: {
                    borderRadius: 8,
                    colorPrimary: '#1a365d',
                    colorInfo: '#1a365d',
                    colorSuccess: '#1a365d',
                },
                components: {
                    Tabs: {
                        itemSelectedColor: '#1a365d',
                        itemActiveColor: '#1a365d',
                        horizontalItemPadding: '12px 16px',
                    },
                    Layout: {
                        siderBg: '#f8f9fa',
                    }
                },
            }}
        >
            <Helmet>
                <title>{seoData.title}</title>
                <meta name="description" content={seoData.description} />
                <meta name="keywords" content={seoData.keywords} />
                <meta property="og:title" content={seoData.title} />
                <meta property="og:description" content={seoData.description} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={seoData.canonical} />
                <meta property="og:image" content={seoData.ogImage} />
                <meta property="og:site_name" content="Betheland Agent Management" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={seoData.title} />
                <meta name="twitter:description" content={seoData.description} />
                <meta name="twitter:image" content={seoData.ogImage} />
                <meta name="robots" content="index, follow" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta name="theme-color" content="#1a365d" />
                <link rel="canonical" href={seoData.canonical} />

                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebApplication",
                        "name": "Betheland Agent Management",
                        "description": seoData.description,
                        "url": seoData.canonical,
                        "applicationCategory": "BusinessApplication",
                        "operatingSystem": "Web Browser",
                        "permissions": "microphone",
                        "author": {
                            "@type": "Organization",
                            "name": "Betheland"
                        },
                        "offers": {
                            "@type": "Offer",
                            "price": "0",
                            "priceCurrency": "USD"
                        }
                    })}
                </script>

                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "RealEstateAgent",
                        "name": "Betheland",
                        "description": "Professional real estate agent management platform",
                        "telephone": "+1-555-123-4567",
                        "address": {
                            "@type": "PostalAddress",
                            "streetAddress": "123 Agent Lane",
                            "addressLocality": "Real Estate City",
                            "addressRegion": "CA",
                            "postalCode": "12345",
                            "addressCountry": "US"
                        }
                    })}
                </script>
            </Helmet>

            <Layout style={{ minHeight: '100vh' }}>
                <GlobalAdminTopbar onToggle={handleToggle} collapsed={collapsed} />
                <Layout>
                    <GlobalAdminNavigation collapsed={collapsed} />
                    <Layout
                        style={{
                            marginLeft: collapsed ? 80 : 200,
                            marginTop: 52,
                            transition: 'all 0.2s',
                        }}
                    >
                        <Layout>
                            {/* Vertical Tabs Sidebar */}
                            <Sider
                                width={220}
                                style={{
                                    background: colorBgContainer,
                                    borderRadius: borderRadiusLG,
                                    boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)',
                                    borderRight: '1px solid #f0f0f0'
                                }}
                            >
                                <div style={{ padding: '20px 0' }}>
                                    {/* Agent Control Header */}
                                    <div style={{
                                        padding: '0 16px 16px 16px',
                                        borderBottom: '1px solid #f0f0f0',
                                        marginBottom: '8px'
                                    }}>
                                        <Title
                                            level={4}
                                            style={{
                                                margin: 0,
                                                color: '#1a365d',
                                                fontSize: '16px',
                                                fontWeight: 600
                                            }}
                                        >
                                            Account Control
                                        </Title>
                                        <p style={{
                                            margin: '4px 0 0 0',
                                            color: '#666',
                                            fontSize: '12px',
                                            lineHeight: 1.4
                                        }}>
                                            Manage agents, approvals, and profiles
                                        </p>
                                    </div>

                                    <Tabs
                                        activeKey={activeTab}
                                        onChange={handleTabChange}
                                        tabPosition="left"
                                        type="line"
                                        size="middle"
                                        style={{ width: '100%' }}
                                        tabBarStyle={{ border: 'none', width: '100%' }}
                                        items={tabItems}
                                    />
                                </div>
                            </Sider>

                            {/* Main Content Area */}
                            <Content
                                style={{
                                    background: colorBgContainer,
                                    margin: '16px 16px 16px 0',
                                    minHeight: 280,
                                    borderRadius: borderRadiusLG,
                                    overflow: 'hidden',
                                    padding: '24px'
                                }}
                            >
                                {/* Header Section */}
                                <div style={{ marginBottom: 24 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            {showBackButton && (
                                                <Button
                                                    icon={<ArrowLeftOutlined />}
                                                    onClick={isEditing ? handleBackFromEdit : handleBackToAgents}
                                                    style={{ border: 'none', boxShadow: 'none' }}
                                                >
                                                    Back to Agents
                                                </Button>
                                            )}
                                            <div>
                                                <h1 style={{
                                                    margin: 0,
                                                    color: '#1a365d',
                                                    fontSize: '24px',
                                                    fontWeight: 600
                                                }}>
                                                    {getHeaderTitle()}
                                                </h1>
                                                <p style={{
                                                    margin: '6px 0 0 0',
                                                    color: '#666',
                                                    fontSize: '14px'
                                                }}>
                                                    {getHeaderDescription()}
                                                </p>
                                            </div>
                                        </div>
                                        {showAddButton && (
                                            <Button
                                                type="primary"
                                                icon={<PlusCircleOutlined />}
                                                onClick={handleCreateAgent}
                                            >
                                                Add Agent
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* Conditional Content Rendering */}
                                {isViewing ? (
                                    // View Agent Full Page
                                    <ViewAgent
                                        agent={selectedAgent}
                                        onEdit={handleEditAgent}
                                        onBack={handleBackToAgents}
                                    />
                                ) : isEditing ? (
                                    // Edit Agent Full Page
                                    <EditAgent
                                        agent={selectedAgent}
                                        onSuccess={handleAgentsUpdate}
                                        onCancel={handleBackFromEdit}
                                    />
                                ) : (
                                    // Regular Tab Content
                                    <>
                                        {activeTab === 'agents' && (
                                            <AgentPage
                                                onAgentsUpdate={handleAgentsUpdate}
                                                onEditAgent={handleEditAgent}
                                                onCreateAgent={handleCreateAgent}
                                                onViewAgent={handleViewAgent}
                                            />
                                        )}
                                        {activeTab === 'approval' && (
                                            <div style={{
                                                textAlign: 'center',
                                                padding: '40px',
                                                color: '#666'
                                            }}>
                                                <CheckCircleOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                                                <Title level={4} type="secondary">
                                                    Approval Queue
                                                </Title>
                                                <p>Agent approval functionality will be implemented soon</p>
                                            </div>
                                        )}
                                        {activeTab === 'create' && (
                                            <CreateAgent
                                                agent={selectedAgent}
                                                onSuccess={handleAgentsUpdate}
                                                onBack={handleBackToAgents}
                                            />
                                        )}
                                        {activeTab === 'management' && (
                                            <PropAgentTable onUpdate={handleAgentsUpdate} />
                                        )}
                                    </>
                                )}
                            </Content>
                        </Layout>
                    </Layout>
                </Layout>
            </Layout>
        </ConfigProvider>
    );
};

export default AgentLayoutadmn;