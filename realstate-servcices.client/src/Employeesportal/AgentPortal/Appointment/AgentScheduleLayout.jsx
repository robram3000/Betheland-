// AgentScheduleLayout.jsx
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Layout, theme, ConfigProvider, Tabs, Badge, Card, Row, Col, Statistic, Typography, Spin, Alert, Button, Grid } from 'antd';
import {
    CalendarOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    UserOutlined,
    SettingOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import GlobalAdminTopbar from '../Navigation/GlobalAdminTopbar';
import AgentScheduleAppointments from './AgentScheduleAppointments';
import AgentAvailability from './AgentAvailability';
import AgentTimeOff from './AgentTimeOff';
import AgentScheduleConfig from './AgentScheduleConfig';
import { SchedulePropertiesService } from '../../AdminPortal/appointment/Services/index.js';
import authService from '../../../Authpage/Services/LoginAuth';
import agentService from '../../AdminPortal/Creation_Agent/Services/AgentService';

const { Content } = Layout;
const { Title } = Typography;
const { useBreakpoint } = Grid;

const AgentScheduleLayout = () => {
    const [activeTab, setActiveTab] = useState('appointments');
    const [agentStats, setAgentStats] = useState({
        total: 0,
        scheduled: 0,
        completed: 0,
        upcoming: 0
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentAgentId, setCurrentAgentId] = useState(null);
    const screens = useBreakpoint();
    const isMobile = !screens.md;

    const scheduleService = new SchedulePropertiesService();

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    // Helper function to get the actual agent ID from base member ID
    const getCurrentAgentId = async () => {
        try {
            const currentUser = authService.getCurrentUser();
            const baseMemberId = currentUser?.userId;

            if (!baseMemberId) {
                throw new Error('Unable to determine user ID. Please log in again.');
            }

            // Get the agent by base member ID to get the actual agent ID
            const agent = await agentService.getAgentByBaseMemberId(baseMemberId);

            if (!agent || !agent.id) {
                throw new Error('Agent profile not found. Please complete your agent profile first.');
            }

            return agent.id;
        } catch (error) {
            console.error('Error getting current agent ID:', error);
            throw new Error('Failed to retrieve agent information: ' + error.message);
        }
    };

    const handleTabChange = (key) => {
        setActiveTab(key);
    };

    const loadAgentStats = async () => {
        setLoading(true);
        setError(null);
        try {
            const agentId = await getCurrentAgentId();
            setCurrentAgentId(agentId);

            console.log('Loading schedules for agent ID:', agentId);

            // Use the service correctly
            const appointments = await scheduleService.getSchedulesByAgent(parseInt(agentId));

            console.log('API Response:', appointments);

            if (!appointments || !Array.isArray(appointments)) {
                console.warn('No appointments found or invalid response format');
                setAgentStats({
                    total: 0,
                    scheduled: 0,
                    completed: 0,
                    upcoming: 0
                });
                return;
            }

            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            const stats = {
                total: appointments.length,
                scheduled: appointments.filter(a => a.status === 'Scheduled').length,
                completed: appointments.filter(a => a.status === 'Completed').length,
                upcoming: appointments.filter(a => {
                    if (!a.scheduleTime) return false;
                    const appointmentDate = new Date(a.scheduleTime);
                    return a.status === 'Scheduled' &&
                        appointmentDate.toDateString() === today.toDateString();
                }).length
            };

            setAgentStats(stats);
        } catch (error) {
            console.error('Error loading agent stats:', error);
            setError(error.message || 'Failed to load schedule statistics');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAgentStats();
    }, []);

    const seoData = {
        title: "My Schedule - Betheland Agent Portal",
        description: "Manage your appointments, availability, time off requests and schedule settings",
        keywords: "agent schedule, appointments, availability, time off, schedule settings, real estate agent",
        canonical: `${window.location.origin}/agent/schedule`,
        ogImage: `${window.location.origin}/images/agent-schedule-og.jpg`
    };

    const getHeaderTitle = () => {
        switch (activeTab) {
            case 'appointments': return 'My Appointments';
            case 'availability': return 'My Availability';
            case 'timeoff': return 'Time Off';
            case 'config': return 'Schedule Settings';
            default: return 'My Schedule';
        }
    };

    const getHeaderDescription = () => {
        switch (activeTab) {
            case 'appointments': return 'Manage and view all your scheduled appointments';
            case 'availability': return 'Set your working hours and availability for appointments';
            case 'timeoff': return 'Request and manage your time off periods';
            case 'config': return 'Configure your scheduling preferences and settings';
            default: return 'Manage your appointments, availability, and schedule settings';
        }
    };

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
                <link rel="canonical" href={seoData.canonical} />
            </Helmet>

            <Layout style={{
                minHeight: '100vh',
                overflow: 'hidden' // Keep the main layout non-scrollable
            }}>
                <GlobalAdminTopbar />
                <Layout style={{
                    marginTop: isMobile ? 64 : 112,
                    marginLeft: 0,
                    height: `calc(100vh - ${isMobile ? 64 : 112}px)`,
                    overflow: 'auto' // Make only this layout scrollable
                }}>
                    <Content
                        style={{
                            background: colorBgContainer,
                            padding: isMobile ? '16px' : '30px',
                            overflow: 'visible', // Content should flow naturally
                            minHeight: 'fit-content' // Allow content to determine height
                        }}
                    >
                        {/* Header Section */}
                        <div style={{ marginBottom: isMobile ? 16 : 24 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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

                        {/* Error Alert */}
                        {error && (
                            <Alert
                                message="Error Loading Statistics"
                                description={error}
                                type="error"
                                showIcon
                                style={{ marginBottom: 16 }}
                                action={
                                    <Button
                                        size="small"
                                        type="primary"
                                        ghost
                                        onClick={loadAgentStats}
                                        icon={<ReloadOutlined />}
                                        loading={loading}
                                    >
                                        Retry
                                    </Button>
                                }
                            />
                        )}

                        {/* Agent Statistics */}
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '20px', marginBottom: isMobile ? 16 : 24 }}>
                                <Spin size="large" />
                                <div style={{ marginTop: 16 }}>Loading statistics...</div>
                            </div>
                        ) : (
                            <Row gutter={[8, 8]} style={{ marginBottom: isMobile ? 16 : 24 }}>
                                <Col xs={12} sm={6}>
                                    <Card size="small">
                                        <Statistic
                                            title={isMobile ? "Total" : "Total Appointments"}
                                            value={agentStats.total}
                                            prefix={<CalendarOutlined />}
                                            valueStyle={{ color: '#1a365d' }}
                                        />
                                    </Card>
                                </Col>
                                <Col xs={12} sm={6}>
                                    <Card size="small">
                                        <Statistic
                                            title={isMobile ? "Scheduled" : "Scheduled"}
                                            value={agentStats.scheduled}
                                            prefix={<ClockCircleOutlined />}
                                            valueStyle={{ color: '#1890ff' }}
                                        />
                                    </Card>
                                </Col>
                                <Col xs={12} sm={6}>
                                    <Card size="small">
                                        <Statistic
                                            title={isMobile ? "Completed" : "Completed"}
                                            value={agentStats.completed}
                                            prefix={<CheckCircleOutlined />}
                                            valueStyle={{ color: '#52c41a' }}
                                        />
                                    </Card>
                                </Col>
                                <Col xs={12} sm={6}>
                                    <Card size="small">
                                        <Statistic
                                            title={isMobile ? "Today" : "Upcoming Today"}
                                            value={agentStats.upcoming}
                                            prefix={<UserOutlined />}
                                            valueStyle={{ color: '#faad14' }}
                                        />
                                    </Card>
                                </Col>
                            </Row>
                        )}

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
                                                {isMobile ? 'Appointments' : 'My Appointments'}
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
                                                {isMobile ? 'Availability' : 'My Availability'}
                                            </span>
                                        )
                                    },
                                    {
                                        key: 'timeoff',
                                        label: (
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
                                                {isMobile ? 'Settings' : 'Schedule Settings'}
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
                            {activeTab === 'appointments' && (
                                <AgentScheduleAppointments onScheduleUpdate={loadAgentStats} />
                            )}
                            {activeTab === 'availability' && (
                                <AgentAvailability />
                            )}
                            {activeTab === 'timeoff' && (
                                <AgentTimeOff />
                            )}
                            {activeTab === 'config' && (
                                <AgentScheduleConfig />
                            )}
                        </div>
                    </Content>
                </Layout>
            </Layout>
        </ConfigProvider>
    );
};

export default AgentScheduleLayout;