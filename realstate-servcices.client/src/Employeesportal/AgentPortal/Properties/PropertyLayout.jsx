// PropertyLayout.jsx - Enhanced Mobile Version
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Layout, theme, ConfigProvider, Tabs, Button, Space, Typography, Card, Grid, Badge } from 'antd';
import {
    HomeOutlined,
    PlusCircleOutlined,
    ArrowLeftOutlined
} from '@ant-design/icons';

import GlobalAdminTopbar from '../Navigation/GlobalAdminTopbar';
import PropertyPage from './PropertyPage';
import CreateProperty from './CreateProperty';

const { Content } = Layout;
const { TabPane } = Tabs;
const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const PropertyLayout = () => {
    const [activeTab, setActiveTab] = useState('properties');
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editingProperty, setEditingProperty] = useState(null);
    const [propertiesCount, setPropertiesCount] = useState(0);
    const screens = useBreakpoint();
    const isMobile = !screens.md;

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const handleTabChange = (key) => {
        setActiveTab(key);
        if (key === 'properties') {
            setIsEditing(false);
            setSelectedProperty(null);
        }
    };

    const handleEditProperty = (property) => {
        setSelectedProperty(property);
        setEditingProperty(property);
        setIsEditing(true);
        setActiveTab('create');
    };

    const handleCreateProperty = () => {
        setSelectedProperty(null);
        setEditingProperty(null);
        setIsEditing(false);
        setActiveTab('create');
    };

    const handleBackToProperties = () => {
        setActiveTab('properties');
        setIsEditing(false);
        setSelectedProperty(null);
        setEditingProperty(null);
    };

    const handlePropertySuccess = () => {
        setEditingProperty(null);
        setSelectedProperty(null);
        setIsEditing(false);
    };

    const handlePropertiesUpdate = (count) => {
        if (count !== undefined) {
            setPropertiesCount(count);
        }
        if (activeTab === 'create') {
            handleBackToProperties();
        }
    };

    const seoData = {
        title: "Betheland Property Management",
        description: "Comprehensive property management platform",
        keywords: "property management, real estate, Betheland",
        canonical: `${window.location.origin}/properties`,
        ogImage: `${window.location.origin}/images/properties-og.jpg`
    };

    // Mobile header with better spacing
    const renderHeader = () => (
        <div style={{ marginBottom: isMobile ? 16 : 24 }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isEditing && (
                        <Button
                            icon={<ArrowLeftOutlined />}
                            onClick={handleBackToProperties}
                            style={{ border: 'none' }}
                            size={isMobile ? "small" : "middle"}
                        >
                            {isMobile ? 'Back' : 'Back to Properties'}
                        </Button>
                    )}
                    <div>
                        <Title level={isMobile ? 3 : 2} style={{
                            margin: 0,
                            color: '#1a365d',
                            fontSize: isMobile ? '20px' : '28px',
                            fontWeight: 600
                        }}>
                            {isEditing
                                ? `Edit Property`
                                : activeTab === 'properties'
                                    ? 'All Properties'
                                    : 'Create New Property'
                            }
                        </Title>
                        <p style={{
                            margin: '4px 0 0 0',
                            color: '#666',
                            fontSize: isMobile ? '14px' : '16px'
                        }}>
                            {isEditing
                                ? 'Update property information, media, and details'
                                : activeTab === 'properties'
                                    ? `Manage property listings in your portfolio ${propertiesCount > 0 ? `(${propertiesCount} properties)` : ''}`
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
                        size={isMobile ? "middle" : "large"}
                    >
                        {isMobile ? 'Add' : 'Add New Property'}
                    </Button>
                )}
            </div>
        </div>
    );

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
            </Helmet>

            <Layout style={{
                minHeight: '100vh',
                overflow: 'hidden' // Main layout non-scrollable
            }}>
                <GlobalAdminTopbar />
                <Layout style={{
                    marginTop: isMobile ? 64 : 112,
                    marginLeft: 0,
                    height: `calc(100vh - ${isMobile ? 64 : 112}px)`,
                    overflow: 'auto' // Only this layout scrollable
                }}>
                    <Content
                        style={{
                            background: colorBgContainer,
                            minHeight: 'fit-content', // Allow content to determine height
                            overflow: 'visible', // Content flows naturally
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
                                        key: 'properties',
                                        label: (
                                            <span style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                fontSize: isMobile ? '14px' : '16px',
                                                fontWeight: 500
                                            }}>
                                                <HomeOutlined />
                                                {isMobile ? 'Properties' : 'All Properties'}
                                                {propertiesCount > 0 && (
                                                    <Badge
                                                        count={propertiesCount}
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
                                    }
                                ]}
                            />
                        </Card>

                        {/* Main Content Area - NO SCROLL */}
                        <div style={{
                            width: '100%',
                            overflow: 'visible' // No scrolling here
                        }}>
                            {activeTab === 'properties' && (
                                <PropertyPage
                                    onPropertiesUpdate={handlePropertiesUpdate}
                                    onEditProperty={handleEditProperty}
                                />
                            )}
                            {activeTab === 'create' && (
                                <CreateProperty
                                    property={editingProperty}
                                    onSuccess={handlePropertySuccess}
                                    onBack={handleBackToProperties}
                                />
                            )}
                        </div>
                    </Content>
                </Layout>
            </Layout>
        </ConfigProvider>
    );
};

export default PropertyLayout;