import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Layout, theme, ConfigProvider, Tabs, Badge, Card, Row, Col, Statistic } from 'antd';
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

const { Content } = Layout;
const { TabPane } = Tabs;

const AgentScheduleLayout = () => {
    const [activeTab, setActiveTab] = useState('appointments');
    const [pendingCount, setPendingCount] = useState(0);
    const [appointmentsCount, setAppointmentsCount] = useState(0);
    const [agentStats, setAgentStats] = useState({
        total: 0,
        scheduled: 0,
        completed: 0,
        upcoming: 0
    });

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const handleTabChange = (key) => {
        setActiveTab(key);
    };

    const loadAgentStats = async () => {
        try {
            // Mock agent stats - replace with actual API call
            const mockStats = {
                total: 15,
                scheduled: 8,
                completed: 5,
                upcoming: 3
            };
            setAgentStats(mockStats);
        } catch (error) {
            console.error('Error loading agent stats:', error);
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
                <span>
                  
                    My Appointments
                </span>
            ),
            children: <AgentScheduleAppointments onScheduleUpdate={loadAgentStats} />,
        },
        {
            key: 'availability',
            label: (
                <span>
                   
                    My Availability
                </span>
            ),
            children: <AgentAvailability />,
        },
        {
            key: 'timeoff',
            label: (
                <span>
                   
                    Time Off
                </span>
            ),
            children: <AgentTimeOff />,
        },
        {
            key: 'config',
            label: (
                <span>
                    
                    Schedule Settings
                </span>
            ),
            children: <AgentScheduleConfig />,
        },
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
                <meta name="keywords" content={seoData.keywords} />
                <meta property="og:title" content={seoData.title} />
                <meta property="og:description" content={seoData.description} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={seoData.canonical} />
                <meta property="og:image" content={seoData.ogImage} />
                <link rel="canonical" href={seoData.canonical} />
            </Helmet>

            <Layout style={{ minHeight: '100vh', background: colorBgContainer }}>
                <Content
                    style={{
                        padding: '24px',
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    <div style={{ marginBottom: 24 }}>
                        <h1 style={{
                            margin: 0,
                            color: '#1a365d',
                            fontSize: '24px',
                            fontWeight: 600
                        }}>
                            My Schedule
                        </h1>
                        <p style={{
                            margin: '6px 0 0 0',
                            color: '#666',
                            fontSize: '13px'
                        }}>
                            Manage your appointments, availability, time off requests and schedule settings
                        </p>
                    </div>

                    {/* Agent Statistics */}
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

                    <Tabs
                        activeKey={activeTab}
                        onChange={handleTabChange}
                        type="card"
                        size="middle"
                        items={tabItems}
                    />
                </Content>
            </Layout>
        </ConfigProvider>
    );
};

export default AgentScheduleLayout;