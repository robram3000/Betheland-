// PropertyLayout.jsx - Enhanced Mobile Version with Archive
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Layout, theme, ConfigProvider, Tabs, Button, Space, Typography, Card, Grid, Badge } from 'antd';
import {
    HomeOutlined,
    PlusCircleOutlined,
    ArrowLeftOutlined,
    CheckCircleOutlined,
    DashboardOutlined,
    InboxOutlined
} from '@ant-design/icons';

import GlobalAdminTopbar from '../Navigation/GlobalAdminTopbar';
import PropertyPage from './PropertyPage';
import CreateProperty from './CreateProperty';
import ApprovalQueue from './ApprovalQueue';
import PropertyManagementTable from './PropertyManagementTable';
import ArchiveProperty from './ArchiveProperty'; // Add ArchiveProperty component
import propertyService from '../../AdminPortal/Creation_Property/services/propertyService';

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
    const [pendingCount, setPendingCount] = useState(0);
    const [archiveCount, setArchiveCount] = useState(0); // Add archive count
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
            setEditingProperty(null);
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
        loadPendingCount();
        loadPropertiesCount();
        loadArchiveCount(); // Load archive count on success
    };

    const handlePropertiesUpdate = (count) => {
        if (count !== undefined) {
            setPropertiesCount(count);
        }
        loadPendingCount();
        loadPropertiesCount();
        loadArchiveCount(); // Load archive count on update
    };

    const loadPendingCount = async () => {
        try {
            const data = await propertyService.getPropertiesByStatus('pending');
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

    const loadArchiveCount = async () => {
        try {
            const data = await propertyService.getPropertiesByStatus('draft');
            setArchiveCount(data.length);
        } catch (error) {
            console.error('Error loading archive count:', error);
        }
    };

    useEffect(() => {
        loadPendingCount();
        loadPropertiesCount();
        loadArchiveCount();
    }, []);

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
                            {(() => {
                                if (isEditing) return `Edit Property`;
                                switch (activeTab) {
                                    case 'properties': return 'All Properties';
                                    case 'approval': return 'Approval Queue';
                                    case 'create': return 'Create New Property';
                                    case 'management': return 'Property Management';
                                    case 'archive': return 'Archived Properties';
                                    default: return 'Property Management';
                                }
                            })()}
                        </Title>
                        <p style={{
                            margin: '4px 0 0 0',
                            color: '#666',
                            fontSize: isMobile ? '14px' : '16px'
                        }}>
                            {(() => {
                                if (isEditing) return 'Update property information, media, and details';
                                switch (activeTab) {
                                    case 'properties': return `Manage property listings in your portfolio ${propertiesCount > 0 ? `(${propertiesCount} properties)` : ''}`;
                                    case 'approval': return pendingCount > 0 ? `${pendingCount} properties pending approval` : 'All properties are approved';
                                    case 'create': return 'Add new property listings with detailed information';
                                    case 'management': return 'Advanced property management and analytics';
                                    case 'archive': return archiveCount > 0 ? `${archiveCount} archived properties` : 'No archived properties';
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
                        size={isMobile ? "middle" : "large"}
                    >
                        {isMobile ? 'Add' : 'Add New Property'}
                    </Button>
                )}
            </div>
        </div>
    );

    // Tab items configuration with Archive
    const tabItems = [
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
                    {isMobile ? 'Management' : 'Management'}
                </span>
            )
        },
        {
            key: 'archive',
            label: (
                <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: isMobile ? '14px' : '16px',
                    fontWeight: 500
                }}>
                    <InboxOutlined />
                    {isMobile ? 'Archive' : 'Archive'}
                    {archiveCount > 0 && (
                        <Badge
                            count={archiveCount}
                            size="small"
                            style={{
                                marginLeft: '4px',
                                backgroundColor: '#fa8c16'
                            }}
                        />
                    )}
                </span>
            )
        }
    ];

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
                                items={tabItems}
                            />
                        </Card>

                        {/* Main Content Area - NO SCROLL */}
                        <div style={{
                            width: '100%',
                            overflow: 'visible'
                        }}>
                            {activeTab === 'properties' && (
                                <PropertyPage
                                    onPropertiesUpdate={handlePropertiesUpdate}
                                    onEditProperty={handleEditProperty}
                                />
                            )}
                            {activeTab === 'approval' && (
                                <ApprovalQueue onUpdate={handlePropertiesUpdate} />
                            )}
                            {activeTab === 'create' && (
                                <CreateProperty
                                    property={editingProperty}
                                    onSuccess={handlePropertySuccess}
                                    onBack={handleBackToProperties}
                                />
                            )}
                            {activeTab === 'management' && (
                                <PropertyManagementTable onUpdate={handlePropertiesUpdate} />
                            )}
                            {activeTab === 'archive' && (
                                <ArchiveProperty
                                    onUpdate={handlePropertiesUpdate}
                                    onEditProperty={handleEditProperty}
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