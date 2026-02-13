// ScheduleLayout.jsx - Enhanced Mobile Version
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Layout, theme, ConfigProvider, Tabs, Badge, Button, Space, Typography, Card, Grid } from 'antd';
import {
    CalendarOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    SettingOutlined
} from '@ant-design/icons';
import GlobalAdminTopbar from '../Navigation/GlobalAdminTopbar';
import ScheduleAppointments from './ScheduleAppointments';
import AgentAvailability from './AgentAvailability';
import ScheduleConfig from './ScheduleConfig';
import AgentTimeOff from './AgentTimeOff';

// Import the services
import {
    agentTimeOffService,
    schedulePropertiesService
} from '../../AdminPortal/appointment/Services/index';

const { Content } = Layout;
const { Title } = Typography;
const { useBreakpoint } = Grid;

const ScheduleLayout = () => {
    const [activeTab, setActiveTab] = useState('appointments');
    const [pendingCount, setPendingCount] = useState(0);
    const [appointmentsCount, setAppointmentsCount] = useState(0);
    const screens = useBreakpoint();
    const isMobile = !screens.md;

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

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

    // Mobile header with better spacing
    const renderHeader = () => {
        const getHeaderTitle = () => {
            switch (activeTab) {
                case 'appointments': return 'All Appointments';
                case 'availability': return 'Agent Availability';
                case 'timeoff': return 'Time Off Management';
                case 'config': return 'Schedule Configuration';
                default: return 'Schedule Management';
            }
        };

        const getHeaderDescription = () => {
            switch (activeTab) {
                case 'appointments': return `Browse and manage ${appointmentsCount} appointments`;
                case 'availability': return 'Manage agent working hours and availability schedules';
                case 'timeoff': return pendingCount > 0 ? `${pendingCount} time off requests pending approval` : 'Manage agent time off requests and approvals';
                case 'config': return 'Configure agent scheduling preferences and constraints';
                default: return 'Manage appointments, agent availability, and scheduling configurations';
            }
        };

        return (
            <div style={{ marginBottom: isMobile ? 16 : 24 }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px'
                }}>
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
        );
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
                <meta property="og:site_name" content="Betheland Schedule Management" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={seoData.title} />
                <meta name="twitter:description" content={seoData.description} />
                <meta name="twitter:image" content={seoData.ogImage} />
                <meta name="robots" content="index, follow" />
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
                                        key: 'appointments',
                                        label: (
                                            <span style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                fontSize: isMobile ? '14px' : '16px',
                                                fontWeight: 500
                                            }}>
                                                <CalendarOutlined />
                                                {isMobile ? 'Appointments' : 'All Appointments'}
                                                {appointmentsCount > 0 && (
                                                    <Badge
                                                        count={appointmentsCount}
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
                                        key: 'availability',
                                        label: (
                                            <span style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                fontSize: isMobile ? '14px' : '16px',
                                                fontWeight: 500
                                            }}>
                                                <ClockCircleOutlined />
                                                {isMobile ? 'Availability' : 'Agent Availability'}
                                            </span>
                                        )
                                    },
                                    {
                                        key: 'timeoff',
                                        label: (
                                            <Badge count={pendingCount} size="small" offset={[10, -5]}>
                                                <span style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    fontSize: isMobile ? '14px' : '16px',
                                                    fontWeight: 500
                                                }}>
                                                    <CheckCircleOutlined />
                                                    {isMobile ? 'Time Off' : 'Time Off'}
                                                </span>
                                            </Badge>
                                        )
                                    },
                                    {
                                        key: 'config',
                                        label: (
                                            <span style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                fontSize: isMobile ? '14px' : '16px',
                                                fontWeight: 500
                                            }}>
                                                <SettingOutlined />
                                                {isMobile ? 'Config' : 'Configuration'}
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
                                    border: '1px solid #f0f0f0',
                                    borderRadius: '12px',
                                    padding: 0
                                }}
                                bodyStyle={{ padding: 0 }}
                            >
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
                            </Card>
                        </div>
                    </Content>
                </Layout>
            </Layout>
        </ConfigProvider>
    );
};

export default ScheduleLayout;