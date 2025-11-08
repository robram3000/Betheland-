import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Layout, theme, ConfigProvider, Tabs, Badge, Button, Space, Typography } from 'antd';
import {
    PlusCircleOutlined,
    CheckCircleOutlined,
    DashboardOutlined,
    ArrowLeftOutlined,
    TeamOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    HomeOutlined,
    SettingOutlined
} from '@ant-design/icons';
import GlobalAdminNavigation from '../Navigation/GlobalAdminNavigation';
import GlobalAdminTopbar from '../Navigation/GlobalAdminTopbar';
import ScheduleAppointments from './ScheduleAppointments';
import AgentAvailability from './AgentAvailability';
import ScheduleConfig from './ScheduleConfig';
import AgentTimeOff from './AgentTimeOff';
import ScheduleProperties from './ScheduleProperties';

// Import the services
import {
    agentTimeOffService,
    schedulePropertiesService
} from '../appointment/Services/index.js';

const { Content, Sider } = Layout;
const { Title } = Typography;

const ScheduleLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState('appointments');
    const [pendingCount, setPendingCount] = useState(0);
    const [appointmentsCount, setAppointmentsCount] = useState(0);

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
            const result = await agentTimeOffService.getAllTimeOffs();
            const pendingTimeOffs = result.filter(to => to.status === 'Pending');
            setPendingCount(pendingTimeOffs.length);
        } catch (error) {
            console.error('Error loading pending count:', error);
        }
    };

    const loadAppointmentsCount = async () => {
        try {
            const result = await schedulePropertiesService.getAllSchedules();
            setAppointmentsCount(result.length);
        } catch (error) {
            console.error('Error loading appointments count:', error);
        }
    };

    useEffect(() => {
        loadPendingCount();
        loadAppointmentsCount();
    }, []);

    // Handler for when schedules are updated
    const handleScheduleUpdate = () => {
        loadPendingCount();
        loadAppointmentsCount();
    };

    const getSeoData = () => {
        const baseTitle = "Betheland Schedule Management";
        const baseDescription = "Comprehensive scheduling management platform for real estate professionals";
        const baseUrl = window.location.origin;

        const tabConfig = {
            appointments: {
                title: `All Appointments (${appointmentsCount}) | ${baseTitle}`,
                description: `Browse and manage ${appointmentsCount} appointments in Betheland real estate platform. Comprehensive scheduling management dashboard.`,
                keywords: "appointment management, real estate scheduling, appointment tracking, Betheland, schedule dashboard, real estate management",
                canonical: `${baseUrl}/schedule`,
                ogImage: `${baseUrl}/images/appointments-og.jpg`
            },
            availability: {
                title: `Agent Availability | ${baseTitle}`,
                description: 'Manage agent working hours and availability schedules in Betheland real estate platform.',
                keywords: "agent availability, working hours, schedule management, real estate agents, Betheland",
                canonical: `${baseUrl}/schedule/availability`,
                ogImage: `${baseUrl}/images/availability-og.jpg`
            },
            timeoff: {
                title: pendingCount > 0
                    ? `Time Off Requests (${pendingCount} Pending) | ${baseTitle}`
                    : `Time Off Management | ${baseTitle}`,
                description: pendingCount > 0
                    ? `Manage ${pendingCount} pending time off requests in Betheland real estate platform. Review, approve, or reject agent time off requests.`
                    : 'Manage agent time off requests and approvals in Betheland schedule management system.',
                keywords: "time off management, agent leave, vacation requests, schedule approval, Betheland",
                canonical: `${baseUrl}/schedule/timeoff`,
                ogImage: `${baseUrl}/images/timeoff-og.jpg`
            },
            config: {
                title: `Schedule Configuration | ${baseTitle}`,
                description: 'Configure agent scheduling preferences, constraints, and working parameters in Betheland real estate management system.',
                keywords: "schedule configuration, agent settings, scheduling constraints, real estate tools, Betheland",
                canonical: `${baseUrl}/schedule/config`,
                ogImage: `${baseUrl}/images/config-og.jpg`
            },
            properties: {
                title: `Schedule Properties | ${baseTitle}`,
                description: 'Manage properties available for scheduling appointments and configure property-specific scheduling parameters.',
                keywords: "property management, schedule properties, real estate listings, appointment scheduling, Betheland",
                canonical: `${baseUrl}/schedule/properties`,
                ogImage: `${baseUrl}/images/properties-og.jpg`
            }
        };

        return tabConfig[activeTab] || {
            title: `Schedule Management | ${baseTitle}`,
            description: baseDescription,
            keywords: "schedule management, real estate, Betheland, appointment scheduling",
            canonical: `${baseUrl}/schedule`,
            ogImage: `${baseUrl}/images/schedule-og.jpg`
        };
    };

    const tabItems = [
        {
            key: 'appointments',
            label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CalendarOutlined />
                    All Appointments
                </span>
            ),
        },
        {
            key: 'availability',
            label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ClockCircleOutlined />
                    Agent Availability
                </span>
            ),
        },
        {
            key: 'timeoff',
            label: (
                <Badge count={pendingCount} size="small" offset={[10, -5]}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircleOutlined />
                        Time Off
                    </span>
                </Badge>
            ),
        },
        {
            key: 'config',
            label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <SettingOutlined />
                    Configuration
                </span>
            ),
        },
        {
            key: 'properties',
            label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <HomeOutlined />
                    Properties
                </span>
            ),
        },
    ];

    const getHeaderTitle = () => {
        switch (activeTab) {
            case 'appointments': return 'All Appointments';
            case 'availability': return 'Agent Availability';
            case 'timeoff': return 'Time Off Management';
            case 'config': return 'Schedule Configuration';
            case 'properties': return 'Schedule Properties';
            default: return 'Schedule Management';
        }
    };

    const getHeaderDescription = () => {
        switch (activeTab) {
            case 'appointments': return `Browse and manage ${appointmentsCount} appointments`;
            case 'availability': return 'Manage agent working hours and availability schedules';
            case 'timeoff': return pendingCount > 0 ? `${pendingCount} time off requests pending approval` : 'Manage agent time off requests and approvals';
            case 'config': return 'Configure agent scheduling preferences and constraints';
            case 'properties': return 'Manage properties available for scheduling appointments';
            default: return 'Manage appointments, agent availability, and scheduling configurations';
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
            <Helmet>
                <title>{seoData.title}</title>
                <meta name="description" content={seoData.description} />
                <meta name="keywords" content={seoData.keywords} />
                <meta property="og:title" content={seoData.title} />
                <meta property="og:description" content={seoData.description} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={seoData.canonical} />
                <meta property="og:image" content={seoData.ogImage} />
                <meta property="og:site_name" content="Betheland Schedule Management" />
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
                        "name": "Betheland Schedule Management",
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
                        "description": "Professional real estate scheduling management platform",
                        "telephone": "+1-555-123-4567",
                        "address": {
                            "@type": "PostalAddress",
                            "streetAddress": "123 Schedule Lane",
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
                            {/* Vertical Tabs Sidebar */}
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
                                    {/* Schedule Control Header */}
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
                                            Schedule Control
                                        </Title>
                                        <p style={{
                                            margin: '4px 0 0 0',
                                            color: '#666',
                                            fontSize: '12px',
                                            lineHeight: 1.4
                                        }}>
                                            Manage appointments, availability, and schedules
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

                                {/* Conditional Content Rendering */}
                                {activeTab === 'appointments' && (
                                    <ScheduleAppointments onScheduleUpdate={handleScheduleUpdate} />
                                )}
                                {activeTab === 'availability' && (
                                    <AgentAvailability onScheduleUpdate={handleScheduleUpdate} />
                                )}
                                {activeTab === 'timeoff' && (
                                    <AgentTimeOff onScheduleUpdate={handleScheduleUpdate} />
                                )}
                                {activeTab === 'config' && (
                                    <ScheduleConfig onScheduleUpdate={handleScheduleUpdate} />
                                )}
                                {activeTab === 'properties' && (
                                    <ScheduleProperties onScheduleUpdate={handleScheduleUpdate} />
                                )}
                            </Content>
                        </Layout>
                    </Layout>
                </Layout>
            </Layout>
        </ConfigProvider>
    );
};

export default ScheduleLayout;