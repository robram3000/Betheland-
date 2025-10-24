// AgentLayout.jsx
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Layout, theme, ConfigProvider, Tabs, Badge } from 'antd';
import GlobalAdminNavigation from '../Navigation/GlobalAdminNavigation';
import GlobalAdminTopbar from '../Navigation/GlobalAdminTopbar';
import AgentPage from './AgentPage';
import CreateAgent from './CreateAgent';
import PropAgentTable from './PropAgentTable';
import agentService from './services/agentService';

const { Content } = Layout;
const { TabPane } = Tabs;

const AgentLayoutadmn = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState('agents');
    const [pendingCount, setPendingCount] = useState(0);
    const [agentsCount, setAgentsCount] = useState(0);

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

    // Centralized SEO data management
    const getSeoData = () => {
        const baseTitle = "Betheland Agent Management";
        const baseDescription = "Comprehensive agent management platform for real estate professionals";
        const baseUrl = window.location.origin;

        const tabConfig = {
            agents: {
                title: `All Agents (${agentsCount}) | ${baseTitle}`,
                description: `Browse and manage ${agentsCount} agent profiles in Betheland real estate platform. Comprehensive agent management dashboard.`,
                keywords: "agent management, real estate agents, agent profiles, Betheland, agent dashboard, real estate management",
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

    // Handler for when agents are updated
    const handleAgentsUpdate = () => {
        loadPendingCount();
        loadAgentsCount();
    };

    const tabItems = [
        {
            key: 'agents',
            label: 'All Agents',
            children: <AgentPage onAgentsUpdate={handleAgentsUpdate} />,
        },
        {
            key: 'approval',
            label: (
                <Badge count={pendingCount} size="small">
                    Approval Queue
                </Badge>
            ),
            children: <div>Approval Queue Component</div>,
        },
        {
            key: 'create',
            label: 'Create Agent',
            children: <CreateAgent onSuccess={() => {
                setActiveTab('agents');
                handleAgentsUpdate();
            }} />,
        },
        {
            key: 'management',
            label: 'Agent Management',
            children: <PropAgentTable onUpdate={handleAgentsUpdate} />,
        },
    ];

    const seoData = getSeoData();

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
                        cardHeight: 30,
                    },
                },
            }}
        >
            {/* Centralized Helmet Management */}
            <Helmet>
                {/* Basic Meta Tags */}
                <title>{seoData.title}</title>
                <meta name="description" content={seoData.description} />
                <meta name="keywords" content={seoData.keywords} />

                {/* Open Graph Meta Tags */}
                <meta property="og:title" content={seoData.title} />
                <meta property="og:description" content={seoData.description} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={seoData.canonical} />
                <meta property="og:image" content={seoData.ogImage} />
                <meta property="og:site_name" content="Betheland Agent Management" />

                {/* Twitter Card Meta Tags */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={seoData.title} />
                <meta name="twitter:description" content={seoData.description} />
                <meta name="twitter:image" content={seoData.ogImage} />

                {/* Additional Meta Tags */}
                <meta name="robots" content="index, follow" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta name="theme-color" content="#1a365d" />
                <link rel="canonical" href={seoData.canonical} />

                {/* Structured Data for SEO */}
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

                {/* Additional Schema for Real Estate */}
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
                            marginLeft: collapsed ? 80 : 280,
                            marginTop: 52,
                            transition: 'all 0.2s',
                        }}
                    >
                        <Content
                            style={{
                                background: colorBgContainer,
                                margin: '16px 0',
                                minHeight: 280,
                                borderRadius: borderRadiusLG,
                                maxWidth: '100%',
                                overflow: 'hidden',
                                padding: '20px'
                            }}
                        >
                            <div style={{ marginBottom: 20 }}>
                                <h1 style={{
                                    margin: 0,
                                    color: '#1a365d',
                                    fontSize: '24px',
                                    fontWeight: 600
                                }}>
                                    Agent Management
                                </h1>
                                <p style={{
                                    margin: '6px 0 0 0',
                                    color: '#666',
                                    fontSize: '13px'
                                }}>
                                    Manage real estate agents, their profiles and properties
                                </p>
                            </div>

                            <Tabs
                                activeKey={activeTab}
                                onChange={handleTabChange}
                                type="card"
                                size="middle"
                                items={tabItems}
                                style={{
                                    '& .ant-tabs-tab': {
                                        padding: '8px 16px',
                                        margin: '0 4px',
                                    }
                                }}
                            />
                        </Content>
                    </Layout>
                </Layout>
            </Layout>
        </ConfigProvider>
    );
};

export default AgentLayoutadmn;