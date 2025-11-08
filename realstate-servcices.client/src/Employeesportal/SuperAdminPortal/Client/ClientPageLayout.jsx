// ClientPageLayout.jsx
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Layout, theme, ConfigProvider, Button, Space, Typography, Card } from 'antd';
import {
    ArrowLeftOutlined,
    TeamOutlined,
    UserOutlined
} from '@ant-design/icons';
import GlobalAdminNavigation from '../Navigation/GlobalAdminNavigation';
import GlobalAdminTopbar from '../Navigation/GlobalAdminTopbar';
import ClientPage from './ClientPage';
import clientService from '../../AdminPortal/Creation_Agent/Services/ClientService';

const { Content, Sider } = Layout;
const { Title } = Typography;

const ClientPageLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [clientsCount, setClientsCount] = useState(0);
    const [selectedClient, setSelectedClient] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isViewing, setIsViewing] = useState(false);

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const handleToggle = () => {
        setCollapsed(!collapsed);
    };

    const handleEditClient = (client) => {
        setSelectedClient(client);
        setIsEditing(true);
        setIsViewing(false);
    };

    const handleViewClient = (client) => {
        setSelectedClient(client);
        setIsViewing(true);
        setIsEditing(false);
    };

    const handleAddClient = () => {
        setSelectedClient(null);
        setIsEditing(false);
        setIsViewing(false);
        // For now, we'll handle add client through the ClientPage component
        // You can implement a separate CreateClient component if needed
    };

    const handleBackToClients = () => {
        setIsEditing(false);
        setIsViewing(false);
        setSelectedClient(null);
    };

    const loadClientsCount = async () => {
        try {
            const data = await clientService.getClients();
            setClientsCount(data.length);
        } catch (error) {
            console.error('Error loading clients count:', error);
        }
    };

    useEffect(() => {
        loadClientsCount();
    }, []);

    const getSeoData = () => {
        const baseTitle = "Betheland Client Management";
        const baseDescription = "Comprehensive client management platform for real estate professionals";
        const baseUrl = window.location.origin;

        if (isViewing) {
            return {
                title: `Client Profile - ${selectedClient?.firstName || ''} ${selectedClient?.lastName || 'Client'} | ${baseTitle}`,
                description: `View complete profile and contact details for ${selectedClient?.firstName || ''} ${selectedClient?.lastName || 'client'} in Betheland real estate platform.`,
                keywords: "client profile, real estate client, client details, Betheland, client information",
                canonical: `${baseUrl}/clients`,
                ogImage: `${baseUrl}/images/clients-og.jpg`
            };
        }

        if (isEditing) {
            return {
                title: `Edit Client - ${selectedClient?.firstName || ''} ${selectedClient?.lastName || 'Client'} | ${baseTitle}`,
                description: `Edit client profile for ${selectedClient?.firstName || ''} ${selectedClient?.lastName || 'client'} in Betheland real estate management system. Update client details, contact information, and preferences.`,
                keywords: "edit client, update profile, modify client, Betheland, client editing",
                canonical: `${baseUrl}/clients`,
                ogImage: `${baseUrl}/images/clients-og.jpg`
            };
        }

        return {
            title: `All Clients (${clientsCount}) | ${baseTitle}`,
            description: `Browse and manage ${clientsCount} client profiles in Betheland real estate platform. Comprehensive client management dashboard.`,
            keywords: "client management, real estate clients, client profiles, Betheland, client dashboard, real estate management",
            canonical: `${baseUrl}/clients`,
            ogImage: `${baseUrl}/images/clients-og.jpg`
        };
    };

    const handleClientsUpdate = () => {
        loadClientsCount();
        if (isViewing || isEditing) {
            handleBackToClients();
        }
    };

    const seoData = getSeoData();

    const getHeaderTitle = () => {
        if (isViewing) return `Client Profile - ${selectedClient?.firstName || ''} ${selectedClient?.lastName || 'Client'}`;
        if (isEditing) return `Edit Client - ${selectedClient?.firstName || ''} ${selectedClient?.lastName || 'Client'}`;
        return 'All Clients';
    };

    const getHeaderDescription = () => {
        if (isViewing) return 'View complete client profile and contact information';
        if (isEditing) return 'Update client information, contact details, and preferences';
        return `Browse and manage ${clientsCount} client profiles`;
    };

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
                <meta property="og:site_name" content="Betheland Client Management" />
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
                        "name": "Betheland Client Management",
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
                        "description": "Professional real estate client management platform",
                        "telephone": "+1-555-123-4567",
                        "address": {
                            "@type": "PostalAddress",
                            "streetAddress": "123 Client Lane",
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
                            {/* Client Control Sidebar */}
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
                                    {/* Client Control Header */}
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
                                            Client Control
                                        </Title>
                                        <p style={{
                                            margin: '4px 0 0 0',
                                            color: '#666',
                                            fontSize: '12px',
                                            lineHeight: 1.4
                                        }}>
                                            Manage clients, profiles, and information
                                        </p>
                                    </div>

                                    {/* Simple Client Menu */}
                                    <div style={{ padding: '8px 16px' }}>
                                        <Card
                                            size="small"
                                            style={{
                                                backgroundColor: '#f8f9fa',
                                                border: '1px solid #e8e8e8',
                                                cursor: 'pointer'
                                            }}
                                            bodyStyle={{ padding: '12px' }}
                                        >
                                            <Space>
                                                <TeamOutlined style={{ color: '#1a365d' }} />
                                                <span style={{ fontWeight: 500, color: '#1a365d' }}>
                                                    All Clients ({clientsCount})
                                                </span>
                                            </Space>
                                        </Card>
                                    </div>
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
                                                    onClick={handleBackToClients}
                                                    style={{ border: 'none', boxShadow: 'none' }}
                                                >
                                                    Back to Clients
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
                                        {/* Add Client button removed from here */}
                                    </div>
                                </div>

                                {/* Main Client Page Content */}
                                {!isEditing && !isViewing ? (
                                    <ClientPage
                                        onFilterUpdate={() => { }}
                                        onClientsUpdate={handleClientsUpdate}
                                        onEditClient={handleEditClient}
                                        onViewClient={handleViewClient}
                                        onAddClient={handleAddClient}
                                    />
                                ) : (
                                    <div style={{
                                        textAlign: 'center',
                                        padding: '40px',
                                        color: '#666'
                                    }}>
                                        <UserOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                                        <Title level={4} type="secondary">
                                            {isEditing ? 'Edit Client' : 'View Client'}
                                        </Title>
                                        <p>Client {isEditing ? 'editing' : 'viewing'} functionality will be implemented soon</p>
                                        <Button type="primary" onClick={handleBackToClients}>
                                            Back to Clients
                                        </Button>
                                    </div>
                                )}
                            </Content>
                        </Layout>
                    </Layout>
                </Layout>
            </Layout>
        </ConfigProvider>
    );
};

export default ClientPageLayout;