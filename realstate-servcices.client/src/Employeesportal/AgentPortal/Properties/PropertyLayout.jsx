// PropertyLayout.jsx - Simplified for agents
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Layout, theme, ConfigProvider, Tabs } from 'antd';
import GlobalAdminNavigation from '../Navigation/GlobalAdminNavigation';
import GlobalAdminTopbar from '../Navigation/GlobalAdminTopbar';
import PropertyPage from './PropertyPage';
import CreateProperty from './CreateProperty';
import propertyService from './services/propertyService';
import authService from '../Services/LoginAuth';

const { Content } = Layout;
const { TabPane } = Tabs;

const PropertyLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState('properties');
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [propertiesCount, setPropertiesCount] = useState(0);
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState('');

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    useEffect(() => {
        const user = authService.getCurrentUser();
        setCurrentUser(user);
        setUserRole(user?.userType || '');
        loadPropertiesCount();
    }, []);

    const handleToggle = () => {
        setCollapsed(!collapsed);
    };

    const handleTabChange = (key) => {
        setActiveTab(key);
    };

    const loadPropertiesCount = async () => {
        try {
            const data = await propertyService.getAllProperties();
            setPropertiesCount(data.length);
        } catch (error) {
            console.error('Error loading properties count:', error);
        }
    };

    // Centralized SEO data management
    const getSeoData = () => {
        const baseTitle = "Betheland Property Management";
        const baseDescription = "Manage your property listings with Betheland real estate platform";
        const baseUrl = window.location.origin;

        const tabConfig = {
            properties: {
                title: searchText
                    ? `Search: "${searchText}" - My Properties | ${baseTitle}`
                    : statusFilter !== 'all'
                        ? `${getStatusDisplayName(statusFilter)} Properties | ${baseTitle}`
                        : typeFilter !== 'all'
                            ? `${typeFilter} Properties | ${baseTitle}`
                            : `My Properties (${propertiesCount}) | ${baseTitle}`,
                description: searchText
                    ? `Search results for "${searchText}" in your property listings.`
                    : `Manage your ${propertiesCount} property listings in Betheland real estate platform.`,
                keywords: "property management, my listings, real estate, Betheland, property dashboard",
                canonical: `${baseUrl}/properties`,
                ogImage: `${baseUrl}/images/properties-og.jpg`
            },
            create: {
                title: `Create New Property | ${baseTitle}`,
                description: 'Create new property listings in Betheland real estate management system. Add property details, images, videos, and location information.',
                keywords: "create property, add listing, new property, real estate listing, Betheland, property creation",
                canonical: `${baseUrl}/properties/create`,
                ogImage: `${baseUrl}/images/create-property-og.jpg`
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
        loadPropertiesCount();
    };

    const tabItems = [
        {
            key: 'properties',
            label: 'My Properties',
            children: (
                <PropertyPage
                    onFilterUpdate={updateFilters}
                    onPropertiesUpdate={handlePropertiesUpdate}
                    userRole={userRole}
                    currentUser={currentUser}
                />
            ),
        },
        {
            key: 'create',
            label: 'Create Property',
            children: (
                <CreateProperty
                    onSuccess={() => {
                        setActiveTab('properties');
                        handlePropertiesUpdate();
                    }}
                    userRole={userRole}
                    currentUser={currentUser}
                />
            ),
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
                        "author": {
                            "@type": "Organization",
                            "name": "Betheland"
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
                                    Manage your property listings and create new ones
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