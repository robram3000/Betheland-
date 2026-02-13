// ClientPageLayout.jsx - Enhanced Mobile Version
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Layout, theme, ConfigProvider, Button, Space, Typography, Card, Grid, Badge } from 'antd';
import {
    ArrowLeftOutlined,
    TeamOutlined,
    UserOutlined,
    PlusCircleOutlined
} from '@ant-design/icons';
import GlobalAdminTopbar from '../Navigation/GlobalAdminTopbar';
import ClientPage from './ClientPage';
import clientService from '../../AdminPortal/Creation_Agent/Services/ClientService';

const { Content } = Layout;
const { Title } = Typography;
const { useBreakpoint } = Grid;

const ClientPageLayout = () => {
    const [clientsCount, setClientsCount] = useState(0);
    const [selectedClient, setSelectedClient] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isViewing, setIsViewing] = useState(false);
    const screens = useBreakpoint();
    const isMobile = !screens.md;

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

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

    // Mobile header with better spacing
    const renderHeader = () => {
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
                                onClick={handleBackToClients}
                                style={{ border: 'none' }}
                                size={isMobile ? "small" : "middle"}
                            >
                                {isMobile ? 'Back' : 'Back to Clients'}
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
                    {!isEditing && !isViewing && (
                        <Button
                            type="primary"
                            icon={<PlusCircleOutlined />}
                            onClick={handleAddClient}
                            size={isMobile ? "middle" : "large"}
                        >
                            {isMobile ? 'Add' : 'Add Client'}
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
                <meta property="og:site_name" content="Betheland Client Management" />
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

                        {/* Main Client Page Content */}
                        <Card
                            style={{
                                border: '1px solid #f0f0f0',
                                borderRadius: '12px',
                                padding: 0
                            }}
                            bodyStyle={{ padding: 0 }}
                        >
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
                        </Card>
                    </Content>
                </Layout>
            </Layout>
        </ConfigProvider>
    );
};

export default ClientPageLayout;