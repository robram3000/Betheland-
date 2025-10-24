// Enhanced PropertyLayout.jsx with centralized Helmet management
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
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
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [propertiesCount, setPropertiesCount] = useState(0);

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
                title: `Create New Property | ${baseTitle}`,
                description: 'Create new property listings in Betheland real estate management system. Add property details, images, videos, and assign agents.',
                keywords: "create property, add listing, new property, real estate listing, Betheland, property creation",
                canonical: `${baseUrl}/properties/create`,
                ogImage: `${baseUrl}/images/create-property-og.jpg`
            },
            management: {
                title: `Property Management Dashboard | ${baseTitle}`,
                description: 'Advanced property management dashboard with statistics, media management, and comprehensive property analytics for real estate professionals.',
                keywords: "property management, dashboard, statistics, media management, property analytics, Betheland, real estate tools",
                canonical: `${baseUrl}/properties/management`,
                ogImage: `${baseUrl}/images/management-og.jpg`
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

    const getTabTitle = () => {
        const tabTitles = {
            properties: 'All Properties',
            approval: 'Approval Queue',
            create: 'Create Property',
            management: 'Property Management'
        };
        return tabTitles[activeTab] || 'Property Management';
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
    };

    const tabItems = [
        {
            key: 'properties',
            label: 'All Properties',
            children: <PropertyPage onFilterUpdate={updateFilters} onPropertiesUpdate={handlePropertiesUpdate} />,
        },
        {
            key: 'approval',
            label: (
                <Badge count={pendingCount} size="small">
                    Approval Queue
                </Badge>
            ),
            children: <ApprovalQueue onUpdate={handlePropertiesUpdate} />,
        },
        {
            key: 'create',
            label: 'Create Property',
            children: <CreateProperty onSuccess={() => {
                setActiveTab('properties');
                handlePropertiesUpdate();
            }} />,
        },
        {
            key: 'management',
            label: 'Property Management',
            children: <PropertyManagementTable onUpdate={handlePropertiesUpdate} />,
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
                                    Property Management
                                </h1>
                                <p style={{
                                    margin: '6px 0 0 0',
                                    color: '#666',
                                    fontSize: '13px'
                                }}>
                                    Manage real estate properties, approvals, and agent assignments
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

export default PropertyLayout;