// AgentScheduleLayout.jsx
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Layout, theme, ConfigProvider, Tabs, Badge, Card, Row, Col, Statistic, Typography, Spin, Alert } from 'antd';
import {
    CalendarOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    UserOutlined,
    SettingOutlined
} from '@ant-design/icons';
import AgentScheduleAppointments from './AgentScheduleAppointments';
import AgentAvailability from './AgentAvailability';
import AgentTimeOff from './AgentTimeOff';
import AgentScheduleConfig from './AgentScheduleConfig';
import { SchedulePropertiesService } from '../../AdminPortal/appointment/Services/index.js';
import authService from '../../../Authpage/Services/LoginAuth';

const { Content, Sider } = Layout;
const { Title } = Typography;

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

    const scheduleService = new SchedulePropertiesService();

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const handleTabChange = (key) => {
        setActiveTab(key);
    };

    const loadAgentStats = async () => {
        setLoading(true);
        setError(null);
        try {
            const currentUser = authService.getCurrentUser();
            const agentId = currentUser?.userId;

            if (!agentId) {
                throw new Error('Unable to determine agent ID. Please log in again.');
            }

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

    const tabItems = [
        {
            key: 'appointments',
            label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CalendarOutlined />
                    My Appointments
                </span>
            ),
        },
        {
            key: 'availability',
            label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ClockCircleOutlined />
                    My Availability
                </span>
            ),
        },
        {
            key: 'timeoff',
            label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircleOutlined />
                    Time Off
                </span>
            ),
        },
        {
            key: 'config',
            label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <SettingOutlined />
                    Schedule Settings
                </span>
            ),
        },
    ];

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
                <link rel="canonical" href={seoData.canonical} />
            </Helmet>

            <Layout style={{ minHeight: '100vh', background: colorBgContainer }}>
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
                                My Schedule
                            </Title>
                            <p style={{
                                margin: '4px 0 0 0',
                                color: '#666',
                                fontSize: '12px',
                                lineHeight: 1.4
                            }}>
                                Manage your appointments and availability
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
                        padding: '24px',
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    {/* Header Section */}
                    <div style={{ marginBottom: 24 }}>
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
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <Spin size="large" />
                            <div style={{ marginTop: 16 }}>Loading statistics...</div>
                        </div>
                    ) : (
                        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                            <Col xs={12} sm={6}>
                                <Card size="small">
                                    <Statistic
                                        title="Total Appointments"
                                        value={agentStats.total}
                                        prefix={<CalendarOutlined />}
                                        valueStyle={{ color: '#1a365d' }}
                                    />
                                </Card>
                            </Col>
                            <Col xs={12} sm={6}>
                                <Card size="small">
                                    <Statistic
                                        title="Scheduled"
                                        value={agentStats.scheduled}
                                        prefix={<ClockCircleOutlined />}
                                        valueStyle={{ color: '#1890ff' }}
                                    />
                                </Card>
                            </Col>
                            <Col xs={12} sm={6}>
                                <Card size="small">
                                    <Statistic
                                        title="Completed"
                                        value={agentStats.completed}
                                        prefix={<CheckCircleOutlined />}
                                        valueStyle={{ color: '#52c41a' }}
                                    />
                                </Card>
                            </Col>
                            <Col xs={12} sm={6}>
                                <Card size="small">
                                    <Statistic
                                        title="Upcoming Today"
                                        value={agentStats.upcoming}
                                        prefix={<UserOutlined />}
                                        valueStyle={{ color: '#faad14' }}
                                    />
                                </Card>
                            </Col>
                        </Row>
                    )}

                    {/* Conditional Content Rendering */}
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
                </Content>
            </Layout>
        </ConfigProvider>
    );
};

export default AgentScheduleLayout;