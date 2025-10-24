import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Layout, theme, ConfigProvider, Tabs, Badge } from 'antd';
import GlobalAdminNavigation from '../Navigation/GlobalAdminNavigation';
import GlobalAdminTopbar from '../Navigation/GlobalAdminTopbar';
import ScheduleAppointments from './ScheduleAppointments';
import AgentAvailability from './AgentAvailability';
import ScheduleConfig from './ScheduleConfig';
import AgentTimeOff from './AgentTimeOff';
import ScheduleProperties from './ScheduleProperties';
import apiClient from './Services/ApiClient'
import SchedulingServices from './SchedulePropertiesService';

const { Content } = Layout;
const { TabPane } = Tabs;


const apiClient = new ApiClient(process.env.REACT_APP_API_BASE_URL);
const schedulingService = new SchedulingServices(apiClient);

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
            const result = await schedulingService.getAllTimeOffs();
            if (result.success) {
                const pendingTimeOffs = result.data.filter(to => to.status === 'Pending');
                setPendingCount(pendingTimeOffs.length);
            }
        } catch (error) {
            console.error('Error loading pending count:', error);
        }
    };

    const loadAppointmentsCount = async () => {
        try {
            const result = await schedulingService.getAllSchedules();
            if (result.success) {
                setAppointmentsCount(result.data.length);
            }
        } catch (error) {
            console.error('Error loading appointments count:', error);
        }
    };

    useEffect(() => {
        loadPendingCount();
        loadAppointmentsCount();
    }, []);

    // Centralized SEO data management
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

    // Handler for when schedules are updated
    const handleScheduleUpdate = () => {
        loadPendingCount();
        loadAppointmentsCount();
    };

    const tabItems = [
        {
            key: 'appointments',
            label: 'All Appointments',
            children: <ScheduleAppointments onScheduleUpdate={handleScheduleUpdate} />,
        },
        {
            key: 'availability',
            label: 'Agent Availability',
            children: <AgentAvailability onScheduleUpdate={handleScheduleUpdate} />,
        },
        {
            key: 'timeoff',
            label: (
                <Badge count={pendingCount} size="small">
                    Time Off
                </Badge>
            ),
            children: <AgentTimeOff onScheduleUpdate={handleScheduleUpdate} />,
        },
        {
            key: 'config',
            label: 'Configuration',
            children: <ScheduleConfig onScheduleUpdate={handleScheduleUpdate} />,
        },
        {
            key: 'properties',
            label: 'Properties',
            children: <ScheduleProperties onScheduleUpdate={handleScheduleUpdate} />,
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
                <meta property="og:site_name" content="Betheland Schedule Management" />

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
                        "name": "Betheland Schedule Management",
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

                {/* Additional Schema for Real Estate */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "RealEstateAgent",
                        "name": "Betheland",
                        "description": "Professional real estate scheduling management platform",
                        "url": baseUrl
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
                                    Schedule Management
                                </h1>
                                <p style={{
                                    margin: '6px 0 0 0',
                                    color: '#666',
                                    fontSize: '13px'
                                }}>
                                    Manage appointments, agent availability, and scheduling configurations
                                </p>
                            </div>

                            <Tabs
                                activeKey={activeTab}
                                onChange={handleTabChange}
                                type="card"
                                size="middle"
                                items={tabItems}
                            />
                        </Content>
                    </Layout>
                </Layout>
            </Layout>
        </ConfigProvider>
    );
};

export default ScheduleLayout;