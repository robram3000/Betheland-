// AgentLayout.jsx - Enhanced Mobile Version
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Layout, theme, ConfigProvider, Tabs, Button, Space, Typography, Card, Grid, Badge } from 'antd';
import {
    PlusCircleOutlined,
    CheckCircleOutlined,
    DashboardOutlined,
    ArrowLeftOutlined,
    TeamOutlined,
    EyeOutlined
} from '@ant-design/icons';

import GlobalAdminTopbar from '../Navigation/GlobalAdminTopbar';
import AgentPage from './AgentPage';
import CreateAgent from './CreateAgent';
import EditAgent from './EditAgent';
import ViewAgent from './ViewAgent';
import PropAgentTable from './PropAgentTable';
import agentService from '../../AdminPortal/Creation_Agent/Services/AgentService';

const { Content } = Layout;
const { TabPane } = Tabs;
const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const AgentLayoutadmn = () => {
    const [activeTab, setActiveTab] = useState('agents');
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isViewing, setIsViewing] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);
    const [agentsCount, setAgentsCount] = useState(0);
    const screens = useBreakpoint();
    const isMobile = !screens.md;

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const handleTabChange = (key) => {
        setActiveTab(key);
        if (key === 'agents') {
            setIsEditing(false);
            setIsViewing(false);
            setSelectedAgent(null);
        }
    };

    const handleEditAgent = (agent) => {
        setSelectedAgent(agent);
        setIsEditing(true);
        setIsViewing(false);
        setActiveTab('create');
    };

    const handleViewAgent = (agent) => {
        setSelectedAgent(agent);
        setIsViewing(true);
        setIsEditing(false);
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
        setActiveTab('agents');
    };

    const handleAgentSuccess = () => {
        setSelectedAgent(null);
        setIsEditing(false);
        setIsViewing(false);
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

    const handleAgentsUpdate = () => {
        loadPendingCount();
        loadAgentsCount();
        if (activeTab === 'create' || isViewing || isEditing) {
            handleBackToAgents();
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

    const seoData = getSeoData();

    // Mobile header with better spacing
    const renderHeader = () => {
        const getHeaderTitle = () => {
            if (isViewing) return `Agent Profile - ${selectedAgent?.firstName || ''} ${selectedAgent?.lastName || 'Agent'}`;
            if (isEditing) return `Edit Agent - ${selectedAgent?.firstName || ''} ${selectedAgent?.lastName || 'Agent'}`;

            switch (activeTab) {
                case 'agents': return 'All Agents';
                case 'approval': return 'Approval Queue';
                case 'create': return isEditing ? 'Edit Agent' : 'Create New Agent';
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

        const showBackButton = isEditing || isViewing;
        const showAddButton = activeTab === 'agents' && !isEditing && !isViewing;

        return (
            <div style={{ marginBottom: isMobile ? 16 : 24 }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {showBackButton && (
                            <Button
                                icon={<ArrowLeftOutlined />}
                                onClick={isEditing ? handleBackFromEdit : handleBackToAgents}
                                style={{ border: 'none' }}
                                size={isMobile ? "small" : "middle"}
                            >
                                {isMobile ? 'Back' : 'Back to Agents'}
                            </Button>
                        )}
                        <div>
                            <Title level={isMobile ? 3 : 2} style={{
                                margin: 0,
                                color: '#1a365d',
                                fontSize: isMobile ? '20px' : '28px',
                                fontWeight: 600
                            }}>
                                {getHeaderTitle()}
                            </Title>
                            <p style={{
                                margin: '4px 0 0 0',
                                color: '#666',
                                fontSize: isMobile ? '14px' : '16px'
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
                            size={isMobile ? "middle" : "large"}
                        >
                            {isMobile ? 'Add' : 'Add Agent'}
                        </Button>
                    )}
                </div>
            </div>
        );
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
            </Helmet>

            <Layout style={{
                minHeight: '100vh',
                overflow: 'hidden'
            }}>
                <GlobalAdminTopbar />
                <Layout style={{
                    marginTop: isMobile ? 64 : 112,
                    marginLeft: 0,
                    height: `calc(100vh - ${isMobile ? 64 : 112}px)`,
                    overflow: 'auto'
                }}>
                    <Content
                        style={{
                            background: colorBgContainer,
                            minHeight: 'fit-content',
                            overflow: 'visible',
                            padding: isMobile ? '16px' : '30px'
                        }}
                    >
                        {/* Header Section */}
                        {renderHeader()}

                        {/* Horizontal Tabs */}
                        <Card
                            bodyStyle={{ padding: '0' }}
                            style={{
                                marginBottom: isMobile ? 16 : 24,
                                border: 'none',
                                boxShadow: 'none'
                            }}
                        >
                            <Tabs
                                activeKey={activeTab}
                                onChange={handleTabChange}
                                type="line"
                                size={isMobile ? "middle" : "large"}
                                style={{
                                    borderBottom: '1px solid #f0f0f0'
                                }}
                                items={[
                                    {
                                        key: 'agents',
                                        label: (
                                            <span style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                fontSize: isMobile ? '14px' : '16px',
                                                fontWeight: 500
                                            }}>
                                                <TeamOutlined />
                                                {isMobile ? 'Agents' : 'All Agents'}
                                                {agentsCount > 0 && (
                                                    <Badge
                                                        count={agentsCount}
                                                        size="small"
                                                        style={{
                                                            marginLeft: '4px',
                                                            backgroundColor: '#1a365d'
                                                        }}
                                                    />
                                                )}
                                            </span>
                                        )
                                    },
                                    {
                                        key: 'approval',
                                        label: (
                                            <span style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                fontSize: isMobile ? '14px' : '16px',
                                                fontWeight: 500
                                            }}>
                                                <CheckCircleOutlined />
                                                {isMobile ? 'Approval' : 'Approval Queue'}
                                                {pendingCount > 0 && (
                                                    <Badge
                                                        count={pendingCount}
                                                        size="small"
                                                        style={{
                                                            marginLeft: '4px',
                                                            backgroundColor: '#ff4d4f'
                                                        }}
                                                    />
                                                )}
                                            </span>
                                        )
                                    },
                                    {
                                        key: 'create',
                                        label: (
                                            <span style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                fontSize: isMobile ? '14px' : '16px',
                                                fontWeight: 500
                                            }}>
                                                <PlusCircleOutlined />
                                                {isEditing ? 'Edit' : 'Create'}
                                            </span>
                                        )
                                    },
                                    {
                                        key: 'management',
                                        label: (
                                            <span style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                fontSize: isMobile ? '14px' : '16px',
                                                fontWeight: 500
                                            }}>
                                                <DashboardOutlined />
                                                {isMobile ? 'Management' : 'Account Management'}
                                            </span>
                                        )
                                    }
                                ]}
                            />
                        </Card>

                        {/* Main Content Area - NO SCROLL */}
                        <div style={{
                            width: '100%',
                            overflow: 'visible'
                        }}>
                            {isViewing ? (
                                <ViewAgent
                                    agent={selectedAgent}
                                    onEdit={handleEditAgent}
                                    onBack={handleBackToAgents}
                                />
                            ) : isEditing ? (
                                <EditAgent
                                    agent={selectedAgent}
                                    onSuccess={handleAgentsUpdate}
                                    onCancel={handleBackFromEdit}
                                />
                            ) : (
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
                        </div>
                    </Content>
                </Layout>
            </Layout>
        </ConfigProvider>
    );
};

export default AgentLayoutadmn;