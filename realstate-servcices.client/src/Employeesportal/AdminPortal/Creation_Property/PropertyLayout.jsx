// Enhanced PropertyLayout.jsx with vertical tabs and icons
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Layout, theme, ConfigProvider, Tabs, Badge, Button, Space, Typography } from 'antd';
import {
    HomeOutlined,
    PlusCircleOutlined,
    CheckCircleOutlined,
    DashboardOutlined,
    ArrowLeftOutlined,
    InboxOutlined
} from '@ant-design/icons';
import GlobalAdminNavigation from '../Navigation/GlobalAdminNavigation';
import GlobalAdminTopbar from '../Navigation/GlobalAdminTopbar';
import PropertyPage from './PropertyPage';
import CreateProperty from './CreateProperty';
import PropertyManagementTable from './PropertyManagementTable';
import ApprovalQueue from './ApprovalQueue';
import propertyService from './services/propertyService';

const { Content, Sider } = Layout;
const { TabPane } = Tabs;
const { Title } = Typography;

const PropertyLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState('properties');
    const [pendingCount, setPendingCount] = useState(0);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [propertiesCount, setPropertiesCount] = useState(0);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const handleToggle = () => {
        setCollapsed(!collapsed);
    };

    const handleTabChange = (key) => {
        setActiveTab(key);
        setIsEditing(false);
        setSelectedProperty(null);
    };

    const handleEditProperty = (property) => {
        setSelectedProperty(property);
        setIsEditing(true);
        setActiveTab('create'); // Use create tab for editing
    };

    const handleCreateProperty = () => {
        setSelectedProperty(null);
        setIsEditing(false);
        setActiveTab('create');
    };

    const handleBackToProperties = () => {
        setActiveTab('properties');
        setIsEditing(false);
        setSelectedProperty(null);
    };

    const loadPendingCount = async () => {
        try {
            const data = await propertyService.getPendingProperties();
            setPendingCount(data.length);
        } catch (error) {
            console.error('Error loading pending count:', error);
        }
    };

    const loadPropertiesCount = async () => {
        try {
            const data = await propertyService.getAllProperties();
            setPropertiesCount(data.length);
        } catch (error) {
            console.error('Error loading properties count:', error);
        }
    };

    useEffect(() => {
        loadPendingCount();
        loadPropertiesCount();
    }, []);

    // Centralized SEO data management
    const getSeoData = () => {
        const baseTitle = "Betheland Property Management";
        const baseDescription = "Comprehensive property management platform for real estate professionals";
        const baseUrl = window.location.origin;

        const tabConfig = {
            properties: {
                title: searchText
                    ? `Search: "${searchText}" - All Properties | ${baseTitle}`
                    : statusFilter !== 'all'
                        ? `${getStatusDisplayName(statusFilter)} Properties | ${baseTitle}`
                        : typeFilter !== 'all'
                            ? `${typeFilter} Properties | ${baseTitle}`
                            : `All Properties (${propertiesCount}) | ${baseTitle}`,
                description: searchText
                    ? `Search results for "${searchText}" in Betheland property management system. Find ${propertiesCount} properties, agents, and real estate listings.`
                    : `Browse and manage ${propertiesCount} property listings in Betheland real estate platform. Comprehensive property management dashboard.`,
                keywords: "property management, real estate listings, property search, Betheland, property dashboard, real estate management",
                canonical: `${baseUrl}/properties`,
                ogImage: `${baseUrl}/images/properties-og.jpg`
            },
            approval: {
                title: pendingCount > 0
                    ? `Approval Queue (${pendingCount} Pending) | ${baseTitle}`
                    : `Approval Queue - All Caught Up | ${baseTitle}`,
                description: pendingCount > 0
                    ? `Manage ${pendingCount} pending property approvals in Betheland real estate platform. Review, approve, or reject property listings awaiting approval.`
                    : 'No properties pending approval in Betheland property management system. All property listings have been reviewed and processed.',
                keywords: "property approval, pending properties, real estate approval, property queue, Betheland, property review",
                canonical: `${baseUrl}/properties/approval`,
                ogImage: `${baseUrl}/images/approval-og.jpg`
            },
            create: {
                title: isEditing
                    ? `Edit Property - ${selectedProperty?.title || 'Property'} | ${baseTitle}`
                    : `Create New Property | ${baseTitle}`,
                description: isEditing
                    ? `Edit property listing for ${selectedProperty?.title || 'property'} in Betheland real estate management system. Update property details, images, videos, and agent assignments.`
                    : 'Create new property listings in Betheland real estate management system. Add property details, images, videos, and assign agents.',
                keywords: isEditing ? "edit property, update listing, modify property, Betheland, property editing" : "create property, add listing, new property, real estate listing, Betheland, property creation",
                canonical: `${baseUrl}/properties/${isEditing ? 'edit' : 'create'}`,
                ogImage: `${baseUrl}/images/${isEditing ? 'edit-property-og.jpg' : 'create-property-og.jpg'}`
            },
            management: {
                title: `Property Management Dashboard | ${baseTitle}`,
                description: 'Advanced property management dashboard with statistics, media management, and comprehensive property analytics for real estate professionals.',
                keywords: "property management, dashboard, statistics, media management, property analytics, Betheland, real estate tools",
                canonical: `${baseUrl}/properties/management`,
                ogImage: `${baseUrl}/images/management-og.jpg`
            },
            archive: {
                title: `Archived Properties | ${baseTitle}`,
                description: 'View and manage archived property listings in Betheland real estate management system.',
                keywords: "archived properties, property archive, historical listings, Betheland",
                canonical: `${baseUrl}/properties/archive`,
                ogImage: `${baseUrl}/images/archive-og.jpg`
            }
        };

        return tabConfig[activeTab] || {
            title: `Property Management | ${baseTitle}`,
            description: baseDescription,
            keywords: "property management, real estate, Betheland, property listings",
            canonical: `${baseUrl}/properties`,
            ogImage: `${baseUrl}/images/properties-og.jpg`
        };
    };

    const getStatusDisplayName = (status) => {
        const statusMap = {
            'available': 'Available',
            'pending': 'Pending Approval',
            'approved': 'Approved',
            'sold': 'Sold',
            'rented': 'Rented',
            'rejected': 'Rejected',
            'draft': 'Draft'
        };
        return statusMap[status] || status;
    };

    // Handler to update filters from child components
    const updateFilters = (search, status, type) => {
        setSearchText(search || '');
        setStatusFilter(status || 'all');
        setTypeFilter(type || 'all');
    };

    // Handler for when properties are updated
    const handlePropertiesUpdate = () => {
        loadPendingCount();
        loadPropertiesCount();
        if (activeTab === 'create') {
            handleBackToProperties();
        }
    };

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
                        horizontalItemPadding: '12px 16px',
                    },
                    Layout: {
                        siderBg: '#f8f9fa',
                    }
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
                <meta property="og:site_name" content="Betheland Property Management" />

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
                        "name": "Betheland Property Management",
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
                        "description": "Professional real estate property management platform",
                        "telephone": "+1-555-123-4567",
                        "address": {
                            "@type": "PostalAddress",
                            "streetAddress": "123 Property Lane",
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
                            {/* Vertical Tabs Sidebar with Shadow */}
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
                                    {/* Property Control Header */}
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
                                            Property Control
                                        </Title>
                                        <p style={{
                                            margin: '4px 0 0 0',
                                            color: '#666',
                                            fontSize: '12px',
                                            lineHeight: 1.4
                                        }}>
                                            Manage properties, approvals, and listings
                                        </p>
                                    </div>

                                    <Tabs
                                        activeKey={activeTab}
                                        onChange={handleTabChange}
                                        tabPosition="left"
                                        type="line"
                                        size="middle"
                                        style={{
                                            width: '100%',
                                        }}
                                        tabBarStyle={{
                                            border: 'none',
                                            width: '100%',
                                        }}
                                    >
                                        <TabPane
                                            key="properties"
                                            tab={
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <HomeOutlined />
                                                    All Properties
                                                </span>
                                            }
                                        />
                                        <TabPane
                                            key="approval"
                                            tab={
                                                <Badge count={pendingCount} size="small" offset={[10, -5]}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <CheckCircleOutlined />
                                                        Approval Queue
                                                    </span>
                                                </Badge>
                                            }
                                        />
                                        <TabPane
                                            key="create"
                                            tab={
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <PlusCircleOutlined />
                                                    {isEditing ? 'Edit Property' : 'Create Property'}
                                                </span>
                                            }
                                        />
                                        <TabPane
                                            key="management"
                                            tab={
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <DashboardOutlined />
                                                    Property Management
                                                </span>
                                            }
                                        />
                                        <TabPane
                                            key="archive"
                                            tab={
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <InboxOutlined />
                                                    Archive
                                                </span>
                                            }
                                        />
                                    </Tabs>
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
                                {/* Header with Back Button for Edit Mode */}
                                <div style={{ marginBottom: 24 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            {isEditing && (
                                                <Button
                                                    icon={<ArrowLeftOutlined />}
                                                    onClick={handleBackToProperties}
                                                    style={{ border: 'none' }}
                                                >
                                                    Back to Properties
                                                </Button>
                                            )}
                                            <div>
                                                <h1 style={{
                                                    margin: 0,
                                                    color: '#1a365d',
                                                    fontSize: '24px',
                                                    fontWeight: 600
                                                }}>
                                                    {(() => {
                                                        if (isEditing) return `Edit Property - ${selectedProperty?.title || 'Property'}`;
                                                        switch (activeTab) {
                                                            case 'properties': return 'All Properties';
                                                            case 'approval': return 'Approval Queue';
                                                            case 'create': return 'Create New Property';
                                                            case 'management': return 'Property Management Dashboard';
                                                            case 'archive': return 'Archived Properties';
                                                            default: return 'Property Management';
                                                        }
                                                    })()}
                                                </h1>
                                                <p style={{
                                                    margin: '6px 0 0 0',
                                                    color: '#666',
                                                    fontSize: '14px'
                                                }}>
                                                    {(() => {
                                                        if (isEditing) return 'Update property information, media, and agent assignments';
                                                        switch (activeTab) {
                                                            case 'properties': return `Browse and manage ${propertiesCount} property listings`;
                                                            case 'approval': return pendingCount > 0 ? `${pendingCount} properties pending approval` : 'All properties are approved';
                                                            case 'create': return 'Add new property listings with detailed information';
                                                            case 'management': return 'Advanced property management and analytics';
                                                            case 'archive': return 'View and manage archived property listings';
                                                            default: return 'Manage real estate properties and agent assignments';
                                                        }
                                                    })()}
                                                </p>
                                            </div>
                                        </div>
                                        {activeTab === 'properties' && !isEditing && (
                                            <Button
                                                type="primary"
                                                icon={<PlusCircleOutlined />}
                                                onClick={handleCreateProperty}
                                            >
                                                Add Property
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* Render active tab content */}
                                {activeTab === 'properties' && (
                                    <PropertyPage
                                        onFilterUpdate={updateFilters}
                                        onPropertiesUpdate={handlePropertiesUpdate}
                                        onEditProperty={handleEditProperty}
                                        onCreateProperty={handleCreateProperty}
                                    />
                                )}
                                {activeTab === 'approval' && (
                                    <ApprovalQueue onUpdate={handlePropertiesUpdate} />
                                )}
                                {activeTab === 'create' && (
                                    <CreateProperty
                                        property={selectedProperty}
                                        onSuccess={handlePropertiesUpdate}
                                        onBack={handleBackToProperties}
                                    />
                                )}
                                {activeTab === 'management' && (
                                    <PropertyManagementTable onUpdate={handlePropertiesUpdate} />
                                )}
                                {activeTab === 'archive' && (
                                    <div style={{ textAlign: 'center', padding: '40px' }}>
                                        <InboxOutlined style={{ fontSize: 48, color: '#ccc', marginBottom: 16 }} />
                                        <h3 style={{ color: '#666' }}>Archive Feature Coming Soon</h3>
                                        <p style={{ color: '#999' }}>The archive functionality is currently under development.</p>
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

export default PropertyLayout;