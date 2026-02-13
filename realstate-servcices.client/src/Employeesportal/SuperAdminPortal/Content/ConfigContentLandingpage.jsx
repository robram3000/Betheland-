// ConfigContentLandingpage.jsx - Enhanced Mobile Version
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Layout, theme, ConfigProvider, Tabs, Card, Typography, Button, Space, message, Spin, Grid } from 'antd';
import {
    EditOutlined,
    EyeOutlined,
    SettingOutlined,
    GlobalOutlined,
    ArrowLeftOutlined,
    NotificationOutlined
} from '@ant-design/icons';
import GlobalAdminTopbar from '../Navigation/GlobalAdminTopbar';
import PartnerEditor from './PartnerEditor';
import ThirdContentEditor from './ThirdContentEditor';
import AnnouncementEditor from './AnnouncementEditor';

const { Content } = Layout;
const { Title } = Typography;
const { useBreakpoint } = Grid;

const ConfigContentLandingpage = () => {
    const [activeTab, setActiveTab] = useState('partner');
    const [isEditing, setIsEditing] = useState(false);
    const [isViewing, setIsViewing] = useState(false);
    const [selectedContent, setSelectedContent] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [contentLoading, setContentLoading] = useState(false);
    const screens = useBreakpoint();
    const isMobile = !screens.md;

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const handleContentUpdated = () => {
        setRefreshTrigger(prev => prev + 1);
        message.success('Content updated successfully');
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

    // Mobile header with better spacing
    const renderHeader = () => {
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
                                onClick={handleBackToMain}
                                style={{ border: 'none' }}
                                size={isMobile ? "small" : "middle"}
                            >
                                {isMobile ? 'Back' : 'Back to Editor'}
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
                    colorSuccess: '#10b981',
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
                                items={[
                                    {
                                        key: 'partner',
                                        label: (
                                            <span style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                fontSize: isMobile ? '14px' : '16px',
                                                fontWeight: 500
                                            }}>
                                                <EditOutlined />
                                                {isMobile ? 'Partners' : 'Partner Editor'}
                                            </span>
                                        )
                                    },
                                    {
                                        key: 'announcements',
                                        label: (
                                            <span style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                fontSize: isMobile ? '14px' : '16px',
                                                fontWeight: 500
                                            }}>
                                                <NotificationOutlined />
                                                {isMobile ? 'Announcements' : 'Announcement Editor'}
                                            </span>
                                        )
                                    },
                                    {
                                        key: 'third',
                                        label: (
                                            <span style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                fontSize: isMobile ? '14px' : '16px',
                                                fontWeight: 500
                                            }}>
                                                <GlobalOutlined />
                                                {isMobile ? 'Third Party' : 'Third Content Editor'}
                                            </span>
                                        )
                                    }
                                ]}
                            />
                        </Card>

                        {/* Main Content Area - NO SCROLL */}
                        <div style={{
                            width: '100%',
                            overflow: 'visible'
                        }}>
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
                                    {isViewing ? (
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
                                    ) : isEditing ? (
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
                                    ) : (
                                        <>
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
                                        </>
                                    )}
                                </Spin>
                            </Card>
                        </div>
                    </Content>
                </Layout>
            </Layout>
        </ConfigProvider>
    );
};

export default ConfigContentLandingpage;