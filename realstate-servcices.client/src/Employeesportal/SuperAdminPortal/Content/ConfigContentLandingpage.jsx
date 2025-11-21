// ConfigContentLandingpage.jsx
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Layout, theme, ConfigProvider, Tabs, Card, Typography, Button, Space, message, Spin } from 'antd';
import {
    EditOutlined,
    EyeOutlined,
    SettingOutlined,
    GlobalOutlined,
    ArrowLeftOutlined,
    NotificationOutlined
} from '@ant-design/icons';
import GlobalAdminNavigation from '../Navigation/GlobalAdminNavigation';
import GlobalAdminTopbar from '../Navigation/GlobalAdminTopbar';
import PartnerEditor from './PartnerEditor';
import ThirdContentEditor from './ThirdContentEditor';
import AnnouncementEditor from './AnnouncementEditor';

const { Content, Sider } = Layout;
const { Title } = Typography;

const ConfigContentLandingpage = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState('partner');
    const [isEditing, setIsEditing] = useState(false);
    const [isViewing, setIsViewing] = useState(false);
    const [selectedContent, setSelectedContent] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [contentLoading, setContentLoading] = useState(false);

    const handleContentUpdated = () => {
        setRefreshTrigger(prev => prev + 1);
        message.success('Content updated successfully');
    };

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const handleToggle = () => {
        setCollapsed(!collapsed);
    };

    const handleTabChange = (key) => {
        console.log('Tab changed to:', key);
        setActiveTab(key);
        setIsEditing(false);
        setIsViewing(false);
        setSelectedContent(null);
    };

    const handleEditContent = (content) => {
        console.log('Edit content:', content);
        setSelectedContent(content);
        setIsEditing(true);
        setIsViewing(false);
    };

    const handleViewContent = (content) => {
        console.log('View content:', content);
        setSelectedContent(content);
        setIsViewing(true);
        setIsEditing(false);
    };

    const handleBackToMain = () => {
        setIsEditing(false);
        setIsViewing(false);
        setSelectedContent(null);
    };

    const getSeoData = () => {
        const baseTitle = "Landing Page Configuration - Betheland Admin";
        const baseDescription = "Configure and manage your landing page content, partners, announcements, and third-party integrations";
        const baseUrl = window.location.origin;

        const tabConfig = {
            partner: {
                title: isViewing
                    ? `Partner Content - ${selectedContent?.name || 'View'} | ${baseTitle}`
                    : isEditing
                        ? `Edit Partner - ${selectedContent?.name || 'Content'} | ${baseTitle}`
                        : `Partner Editor | ${baseTitle}`,
                description: isViewing
                    ? `View partner content details and configuration for ${selectedContent?.name || 'selected partner'} in Betheland landing page management.`
                    : isEditing
                        ? `Edit partner content and configuration for ${selectedContent?.name || 'selected partner'} in Betheland landing page management system.`
                        : 'Manage and edit partner content sections on your Betheland landing page. Configure partner logos, descriptions, and visibility settings.',
                keywords: isViewing
                    ? "partner content, view configuration, Betheland, landing page"
                    : isEditing
                        ? "edit partner, update content, modify configuration, Betheland"
                        : "partner editor, landing page configuration, content management, Betheland, partner management",
                canonical: `${baseUrl}/admin/landing-page/partner`,
                ogImage: `${baseUrl}/images/partner-editor-og.jpg`
            },
            announcements: {
                title: isViewing
                    ? `Announcement - ${selectedContent?.content?.substring(0, 30) || 'View'} | ${baseTitle}`
                    : isEditing
                        ? `Edit Announcement - ${selectedContent?.content?.substring(0, 30) || 'Content'} | ${baseTitle}`
                        : `Announcement Editor | ${baseTitle}`,
                description: isViewing
                    ? `View announcement details and configuration for ${selectedContent?.content?.substring(0, 50) || 'selected announcement'} in Betheland landing page management.`
                    : isEditing
                        ? `Edit announcement content and configuration for ${selectedContent?.content?.substring(0, 50) || 'selected announcement'} in Betheland landing page management system.`
                        : 'Manage and edit running letter announcements on your Betheland landing page. Configure announcement content, categories, display order, and activation status.',
                keywords: "announcements, running letter, news ticker, content editor, Betheland, landing page configuration",
                canonical: `${baseUrl}/admin/landing-page/announcements`,
                ogImage: `${baseUrl}/images/announcement-editor-og.jpg`
            },
            third: {
                title: isViewing
                    ? `Third Party Content - ${selectedContent?.name || 'View'} | ${baseTitle}`
                    : isEditing
                        ? `Edit Third Party - ${selectedContent?.name || 'Content'} | ${baseTitle}`
                        : `Third Content Editor | ${baseTitle}`,
                description: isViewing
                    ? `View third-party content details and configuration for ${selectedContent?.name || 'selected content'} in Betheland landing page management.`
                    : isEditing
                        ? `Edit third-party content and configuration for ${selectedContent?.name || 'selected content'} in Betheland landing page management system.`
                        : 'Manage and edit third-party content sections on your Betheland landing page. Configure external integrations, widgets, and custom content blocks.',
                keywords: "third party content, integrations, content editor, Betheland, landing page configuration",
                canonical: `${baseUrl}/admin/landing-page/third`,
                ogImage: `${baseUrl}/images/third-content-og.jpg`
            }
        };

        return tabConfig[activeTab] || {
            title: baseTitle,
            description: baseDescription,
            keywords: "landing page, configuration, content editor, Betheland, admin panel",
            canonical: `${baseUrl}/admin/landing-page/config`,
            ogImage: `${baseUrl}/images/landing-page-config-og.jpg`
        };
    };

    const seoData = getSeoData();

    const tabItems = [
        {
            key: 'partner',
            label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <EditOutlined />
                    Partner Editor
                </span>
            ),
        },
        {
            key: 'announcements',
            label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <NotificationOutlined />
                    Announcement Editor
                </span>
            ),
        },
        {
            key: 'third',
            label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <GlobalOutlined />
                    Third Content Editor
                </span>
            ),
        },
    ];

    const getHeaderTitle = () => {
        if (isViewing) return `Content View - ${selectedContent?.name || selectedContent?.content?.substring(0, 30) || 'Selected Content'}`;
        if (isEditing) return `Edit Content - ${selectedContent?.name || selectedContent?.content?.substring(0, 30) || 'Selected Content'}`;

        switch (activeTab) {
            case 'partner': return 'Partner Editor';
            case 'announcements': return 'Announcement Editor';
            case 'third': return 'Third Content Editor';
            default: return 'Landing Page Configuration';
        }
    };

    const getHeaderDescription = () => {
        if (isViewing) return 'View detailed content information and configuration';
        if (isEditing) return 'Modify content settings and configuration';

        switch (activeTab) {
            case 'partner': return 'Manage partner content sections and configurations';
            case 'announcements': return 'Configure running letter announcements and display settings';
            case 'third': return 'Configure third-party content and integrations';
            default: return 'Manage your landing page configuration and content';
        }
    };

    const showBackButton = isEditing || isViewing;

    return (
        <ConfigProvider
            theme={{
                token: {
                    borderRadius: 8,
                    colorPrimary: '#1a365d',
                    colorInfo: '#1a365d',
                    colorSuccess: '#10b981',
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
            <Helmet>
                <title>{seoData.title}</title>
                <meta name="description" content={seoData.description} />
                <meta name="keywords" content={seoData.keywords} />
                <meta property="og:title" content={seoData.title} />
                <meta property="og:description" content={seoData.description} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={seoData.canonical} />
                <meta property="og:image" content={seoData.ogImage} />
                <meta property="og:site_name" content="Betheland Admin" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={seoData.title} />
                <meta name="twitter:description" content={seoData.description} />
                <meta name="twitter:image" content={seoData.ogImage} />
                <meta name="robots" content="noindex, nofollow" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta name="theme-color" content="#1a365d" />
                <link rel="canonical" href={seoData.canonical} />

                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebApplication",
                        "name": "Betheland Landing Page Configuration",
                        "description": seoData.description,
                        "url": seoData.canonical,
                        "applicationCategory": "BusinessApplication",
                        "operatingSystem": "Web Browser",
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
                            {/* Vertical Tabs Sidebar */}
                            <Sider
                                width={240}
                                style={{
                                    background: colorBgContainer,
                                    borderRadius: borderRadiusLG,
                                    boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)',
                                    borderRight: '1px solid #f0f0f0'
                                }}
                            >
                                <div style={{ padding: '20px 0' }}>
                                    {/* Configuration Header */}
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
                                            Landing Page Config
                                        </Title>
                                        <p style={{
                                            margin: '4px 0 0 0',
                                            color: '#666',
                                            fontSize: '12px',
                                            lineHeight: 1.4
                                        }}>
                                            Manage content and settings
                                        </p>
                                    </div>

                                    <Tabs
                                        activeKey={activeTab}
                                        onChange={handleTabChange}
                                        tabPosition="left"
                                        type="line"
                                        size="middle"
                                        style={{ width: '100%' }}
                                        tabBarStyle={{ border: 'none', width: '100%' }}
                                        items={tabItems}
                                    />
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
                                                    onClick={handleBackToMain}
                                                    style={{ border: 'none', boxShadow: 'none' }}
                                                >
                                                    Back to Editor
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
                                    </div>
                                </div>

                                {/* Conditional Content Rendering */}
                                {isViewing ? (
                                    <Card
                                        style={{
                                            minHeight: '500px',
                                            border: '1px solid #f0f0f0',
                                            borderRadius: '12px'
                                        }}
                                    >
                                        <div style={{ textAlign: 'center', padding: '40px' }}>
                                            <EyeOutlined style={{ fontSize: '48px', color: '#1a365d', marginBottom: '16px' }} />
                                            <Title level={3}>Content View</Title>
                                            <p>View functionality for {selectedContent?.name || selectedContent?.content?.substring(0, 50) || 'selected content'}</p>
                                            {selectedContent && (
                                                <div style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto', marginTop: '20px' }}>
                                                    <pre style={{
                                                        background: '#f5f5f5',
                                                        padding: '16px',
                                                        borderRadius: '8px',
                                                        whiteSpace: 'pre-wrap',
                                                        fontSize: '14px'
                                                    }}>
                                                        {JSON.stringify(selectedContent, null, 2)}
                                                    </pre>
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                ) : isEditing ? (
                                    <Card
                                        style={{
                                            minHeight: '500px',
                                            border: '1px solid #f0f0f0',
                                            borderRadius: '12px'
                                        }}
                                    >
                                        <div style={{ textAlign: 'center', padding: '40px' }}>
                                            <EditOutlined style={{ fontSize: '48px', color: '#1a365d', marginBottom: '16px' }} />
                                            <Title level={3}>Edit Content</Title>
                                            <p>Edit functionality for {selectedContent?.name || selectedContent?.content?.substring(0, 50) || 'selected content'}</p>
                                            <div style={{ marginTop: '20px' }}>
                                                <Button type="primary" onClick={handleBackToMain}>
                                                    Back to Editor
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                ) : (
                                    // Regular Tab Content
                                    <Card
                                        style={{
                                            minHeight: '500px',
                                            border: '1px solid #f0f0f0',
                                            borderRadius: '12px',
                                            padding: 0
                                        }}
                                        bodyStyle={{ padding: 0 }}
                                    >
                                        <Spin spinning={contentLoading} tip="Loading content...">
                                            {activeTab === 'partner' && (
                                                <PartnerEditor
                                                    onEditContent={handleEditContent}
                                                    onViewContent={handleViewContent}
                                                    onContentUpdated={handleContentUpdated}
                                                    refreshTrigger={refreshTrigger}
                                                />
                                            )}
                                            {activeTab === 'announcements' && (
                                                <AnnouncementEditor
                                                    onEditContent={handleEditContent}
                                                    onViewContent={handleViewContent}
                                                    onContentUpdated={handleContentUpdated}
                                                    refreshTrigger={refreshTrigger}
                                                />
                                            )}
                                            {activeTab === 'third' && (
                                                <ThirdContentEditor
                                                    onEditContent={handleEditContent}
                                                    onViewContent={handleViewContent}
                                                    onContentUpdated={handleContentUpdated}
                                                    refreshTrigger={refreshTrigger}
                                                />
                                            )}
                                        </Spin>
                                    </Card>
                                )}
                            </Content>
                        </Layout>
                    </Layout>
                </Layout>
            </Layout>
        </ConfigProvider>
    );
};

export default ConfigContentLandingpage;