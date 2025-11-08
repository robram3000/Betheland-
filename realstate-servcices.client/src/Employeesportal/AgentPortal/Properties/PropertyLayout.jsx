import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Layout, theme, ConfigProvider, Tabs, Button, Space, Typography, Card } from 'antd';
import {
    HomeOutlined,
    PlusCircleOutlined,
    ArrowLeftOutlined
} from '@ant-design/icons';
import GlobalAdminNavigation from '../Navigation/GlobalAdminNavigation';
import GlobalAdminTopbar from '../Navigation/GlobalAdminTopbar';
import PropertyPage from './PropertyPage';
import CreateProperty from './CreateProperty';

const { Content } = Layout;
const { TabPane } = Tabs;
const { Title } = Typography;

const PropertyLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState('properties');
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    // NEW: Store the property data separately to preserve it during tab changes
    const [editingProperty, setEditingProperty] = useState(null);

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const handleToggle = () => {
        setCollapsed(!collapsed);
    };

    const handleTabChange = (key) => {
        setActiveTab(key);
        // Don't reset editing state and property data when switching tabs
        if (key === 'properties') {
            setIsEditing(false);
            setSelectedProperty(null);
        }
    };

    const handleEditProperty = (property) => {
        setSelectedProperty(property);
        setEditingProperty(property); // Store the property data
        setIsEditing(true);
        setActiveTab('create');
    };

    const handleCreateProperty = () => {
        setSelectedProperty(null);
        setEditingProperty(null); // Clear editing property
        setIsEditing(false);
        setActiveTab('create');
    };

    const handleBackToProperties = () => {
        setActiveTab('properties');
        setIsEditing(false);
        setSelectedProperty(null);
        setEditingProperty(null); // Clear editing property
    };

    // NEW: Handle success from CreateProperty to clear editing state
    const handlePropertySuccess = () => {
        setEditingProperty(null);
        setSelectedProperty(null);
        setIsEditing(false);
        if (onPropertiesUpdate) {
            onPropertiesUpdate();
        }
    };

    const getSeoData = () => {
        const baseTitle = "Betheland Property Management";
        const baseDescription = "Comprehensive property management platform for real estate professionals";
        const baseUrl = window.location.origin;

        const tabConfig = {
            properties: {
                title: `All Properties | ${baseTitle}`,
                description: `Browse and manage property listings in Betheland real estate platform. Comprehensive property management dashboard.`,
                keywords: "property management, real estate listings, property search, Betheland, property dashboard, real estate management",
                canonical: `${baseUrl}/properties`,
                ogImage: `${baseUrl}/images/properties-og.jpg`
            },
            create: {
                title: isEditing
                    ? `Edit Property - ${editingProperty?.title || 'Property'} | ${baseTitle}`
                    : `Create New Property | ${baseTitle}`,
                description: isEditing
                    ? `Edit property listing for ${editingProperty?.title || 'property'} in Betheland real estate management system. Update property details, images, videos, and agent assignments.`
                    : 'Create new property listings in Betheland real estate management system. Add property details, images, videos, and assign agents.',
                keywords: isEditing ? "edit property, update listing, modify property, Betheland, property editing" : "create property, add listing, new property, real estate listing, Betheland, property creation",
                canonical: `${baseUrl}/properties/${isEditing ? 'edit' : 'create'}`,
                ogImage: `${baseUrl}/images/${isEditing ? 'edit-property-og.jpg' : 'create-property-og.jpg'}`
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

    const handlePropertiesUpdate = () => {
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
                <meta property="og:site_name" content="Betheland Property Management" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={seoData.title} />
                <meta name="twitter:description" content={seoData.description} />
                <meta name="twitter:image" content={seoData.ogImage} />
                <meta name="robots" content="index, follow" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta name="theme-color" content="#1a365d" />
                <link rel="canonical" href={seoData.canonical} />
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
                        <Content
                            style={{
                                background: colorBgContainer,
                                margin: '16px',
                                minHeight: 280,
                                borderRadius: borderRadiusLG,
                                overflow: 'hidden',
                                padding: '24px'
                            }}
                        >
                            {/* Header Section */}
                            <div style={{ marginBottom: 24 }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
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
                                            <Title level={2} style={{
                                                margin: 0,
                                                color: '#1a365d',
                                                fontSize: '28px',
                                                fontWeight: 600
                                            }}>
                                                {isEditing
                                                    ? `Edit Property - ${editingProperty?.title || 'Property'}`
                                                    : activeTab === 'properties'
                                                        ? 'All Properties'
                                                        : 'Create New Property'
                                                }
                                            </Title>
                                            <p style={{
                                                margin: '8px 0 0 0',
                                                color: '#666',
                                                fontSize: '16px'
                                            }}>
                                                {isEditing
                                                    ? 'Update property information, media, and details'
                                                    : activeTab === 'properties'
                                                        ? 'Manage property listings in your portfolio'
                                                        : 'Add new property listings with detailed information'
                                                }
                                            </p>
                                        </div>
                                    </div>
                                    {activeTab === 'properties' && !isEditing && (
                                        <Button
                                            type="primary"
                                            icon={<PlusCircleOutlined />}
                                            onClick={handleCreateProperty}
                                            size="large"
                                        >
                                            Add New Property
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Horizontal Tabs for Navigation */}
                            <Card
                                bodyStyle={{ padding: '0' }}
                                style={{
                                    marginBottom: 24,
                                    border: 'none',
                                    boxShadow: 'none'
                                }}
                            >
                                <Tabs
                                    activeKey={activeTab}
                                    onChange={handleTabChange}
                                    type="line"
                                    size="large"
                                    style={{
                                        borderBottom: '1px solid #f0f0f0'
                                    }}
                                    items={[
                                        {
                                            key: 'properties',
                                            label: (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: 500 }}>
                                                    <HomeOutlined />
                                                    All Properties
                                                </span>
                                            )
                                        },
                                        {
                                            key: 'create',
                                            label: (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: 500 }}>
                                                    <PlusCircleOutlined />
                                                    {isEditing ? 'Edit Property' : 'Create Property'}
                                                </span>
                                            )
                                        }
                                    ]}
                                />
                            </Card>

                            {/* Main Content Area - Full Width */}
                            <div style={{ width: '100%' }}>
                                {activeTab === 'properties' && (
                                    <PropertyPage
                                        onPropertiesUpdate={handlePropertiesUpdate}
                                        onEditProperty={handleEditProperty}
                                    />
                                )}
                                {activeTab === 'create' && (
                                    <CreateProperty
                                        property={editingProperty} // Use the preserved property data
                                        onSuccess={handlePropertySuccess} // Use the new success handler
                                        onBack={handleBackToProperties}
                                    />
                                )}
                            </div>
                        </Content>
                    </Layout>
                </Layout>
            </Layout>
        </ConfigProvider>
    );
};

export default PropertyLayout;