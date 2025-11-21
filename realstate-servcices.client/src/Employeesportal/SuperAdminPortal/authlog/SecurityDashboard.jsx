// SecurityDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    Card,
    Row,
    Col,
    Statistic,
    Progress,
    Table,
    Tag,
    Timeline,
    Alert,
    Button,
    Space,
    List,
    Avatar,
    Badge,
    Typography,
    Divider,
    Tooltip,
    Modal,
    Select
} from 'antd';
import {
    SecurityScanOutlined,
    UserOutlined,
    WarningOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    EyeOutlined,
    ReloadOutlined,
    ExportOutlined,
    BarChartOutlined,
    LockOutlined,
    UnlockOutlined,
    GlobalOutlined,
    DesktopOutlined,
    MobileOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';
import BaseTable from './BaseTable';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { Option } = Select;

// Mock data service for security dashboard (same as before)
const mockSecurityService = {
    getSecurityStats: () => Promise.resolve({
        totalUsers: 156,
        activeSessions: 23,
        failedAttempts: 12,
        securityAlerts: 3,
        threatLevel: 'low',
        systemHealth: 95,
        complianceScore: 88,
        lastBreach: '2024-01-15T00:00:00Z'
    }),
    // ... other mock data remains the same
};

const SecurityDashboard = ({ onUpdate }) => {
    const [securityStats, setSecurityStats] = useState({});
    const [threatIntelligence, setThreatIntelligence] = useState([]);
    const [activeSessions, setActiveSessions] = useState([]);
    const [securityEvents, setSecurityEvents] = useState([]);
    const [complianceData, setComplianceData] = useState({});
    const [loading, setLoading] = useState(false);
    const [timeRange, setTimeRange] = useState('24h');

    const loadDashboardData = useCallback(async () => {
        setLoading(true);
        try {
            const [stats, threats, sessions, events, compliance] = await Promise.all([
                mockSecurityService.getSecurityStats(),
                mockSecurityService.getThreatIntelligence(),
                mockSecurityService.getActiveSessions(),
                mockSecurityService.getSecurityEvents(),
                mockSecurityService.getComplianceData()
            ]);

            setSecurityStats(stats);
            setThreatIntelligence(threats);
            setActiveSessions(sessions);
            setSecurityEvents(events);
            setComplianceData(compliance);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            // Fallback to default data
            setSecurityStats({
                totalUsers: 100,
                activeSessions: 15,
                failedAttempts: 8,
                securityAlerts: 2,
                threatLevel: 'medium',
                systemHealth: 90
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDashboardData();
        // Set up auto-refresh every 30 seconds
        const interval = setInterval(loadDashboardData, 30000);
        return () => clearInterval(interval);
    }, [loadDashboardData]);

    const getThreatLevelColor = (level) => {
        switch (level) {
            case 'low': return '#52c41a';
            case 'medium': return '#faad14';
            case 'high': return '#ff4d4f';
            case 'critical': return '#cf1322';
            default: return '#d9d9d9';
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical': return '#cf1322';
            case 'high': return '#ff4d4f';
            case 'medium': return '#faad14';
            case 'low': return '#52c41a';
            case 'info': return '#1890ff';
            default: return '#d9d9d9';
        }
    };

    const getSeverityIcon = (severity) => {
        switch (severity) {
            case 'critical': return <WarningOutlined />;
            case 'high': return <WarningOutlined />;
            case 'medium': return <WarningOutlined />;
            case 'low': return <InfoCircleOutlined />;
            case 'info': return <InfoCircleOutlined />;
            default: return <InfoCircleOutlined />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return '#52c41a';
            case 'idle': return '#faad14';
            case 'expired': return '#ff4d4f';
            case 'suspended': return '#cf1322';
            default: return '#d9d9d9';
        }
    };

    const formatDuration = (seconds) => {
        if (!seconds) return '0s';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    };

    const threatColumns = [
        {
            title: 'Threat',
            dataIndex: 'type',
            key: 'type',
            render: (type, record) => (
                <Space>
                    <Avatar
                        size="small"
                        style={{
                            backgroundColor: getSeverityColor(record.severity)
                        }}
                        icon={getSeverityIcon(record.severity)}
                    />
                    <div>
                        <div style={{ fontWeight: 500 }}>
                            {type.replace('_', ' ').toUpperCase()}
                        </div>
                        <div style={{ fontSize: '11px', color: '#666' }}>
                            Target: {record.target}
                        </div>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Severity',
            dataIndex: 'severity',
            key: 'severity',
            render: (severity) => (
                <Tag color={getSeverityColor(severity)}>
                    {severity.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Source',
            dataIndex: 'source',
            key: 'source',
            render: (source) => (
                <div style={{ fontSize: '12px' }}>
                    {source}
                </div>
            ),
        },
        {
            title: 'Time',
            dataIndex: 'timestamp',
            key: 'timestamp',
            render: (timestamp) => (
                <div style={{ fontSize: '11px' }}>
                    {dayjs(timestamp).fromNow()}
                </div>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag
                    color={status === 'contained' ? 'green' : status === 'investigating' ? 'orange' : 'red'}
                >
                    {status.toUpperCase()}
                </Tag>
            ),
        },
    ];

    const sessionColumns = [
        {
            title: 'User',
            dataIndex: 'username',
            key: 'user',
            render: (username, record) => (
                <Space>
                    <Avatar
                        size="small"
                        style={{
                            backgroundColor: record.status === 'active' ? '#52c41a' : '#faad14'
                        }}
                    >
                        {username?.[0]?.toUpperCase()}
                    </Avatar>
                    <div>{username}</div>
                </Space>
            ),
        },
        {
            title: 'Location',
            dataIndex: 'location',
            key: 'location',
            render: (location) => (
                <div style={{ fontSize: '11px' }}>
                    {location}
                </div>
            ),
        },
        {
            title: 'Device',
            dataIndex: 'device',
            key: 'device',
            render: (device) => (
                <div style={{ fontSize: '11px', color: '#666' }}>
                    {device}
                </div>
            ),
        },
        {
            title: 'Duration',
            dataIndex: 'sessionDuration',
            key: 'duration',
            render: (duration) => (
                <div style={{ fontSize: '11px' }}>
                    {formatDuration(duration)}
                </div>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={getStatusColor(status)}>
                    {status.toUpperCase()}
                </Tag>
            ),
        },
    ];

    return (
        <div>
            {/* Dashboard Header */}
            <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <Title level={3} style={{ color: '#1890ff', margin: 0 }}>
                            Security Dashboard
                        </Title>
                        <Text style={{ color: '#666' }}>
                            Real-time security monitoring and threat intelligence
                        </Text>
                    </div>
                    <Space>
                        <Select
                            value={timeRange}
                            onChange={setTimeRange}
                            style={{ width: 120 }}
                        >
                            <Option value="1h">Last 1 Hour</Option>
                            <Option value="24h">Last 24 Hours</Option>
                            <Option value="7d">Last 7 Days</Option>
                            <Option value="30d">Last 30 Days</Option>
                        </Select>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={loadDashboardData}
                            loading={loading}
                            style={{
                                borderColor: '#1890ff',
                                color: '#1890ff',
                            }}
                        >
                            Refresh
                        </Button>
                        <Button
                            icon={<ExportOutlined />}
                            onClick={() => mockSecurityService.exportReport()}
                            style={{
                                borderColor: '#1890ff',
                                color: '#1890ff',
                            }}
                        >
                            Export Report
                        </Button>
                    </Space>
                </div>
            </div>

            {/* Key Metrics Row */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={6}>
                    <Card
                        style={{
                            background: '#ffffff',
                            border: '1px solid #d9d9d9',
                        }}
                    >
                        <Statistic
                            title="Active Sessions"
                            value={securityStats.activeSessions}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                            suffix={
                                <Tag color={securityStats.activeSessions > 20 ? 'green' : 'blue'}>
                                    {securityStats.activeSessions > 20 ? 'High' : 'Normal'}
                                </Tag>
                            }
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card
                        style={{
                            background: '#ffffff',
                            border: '1px solid #d9d9d9',
                        }}
                    >
                        <Statistic
                            title="Failed Attempts"
                            value={securityStats.failedAttempts}
                            prefix={<LockOutlined />}
                            valueStyle={{ color: securityStats.failedAttempts > 10 ? '#ff4d4f' : '#faad14' }}
                        />
                        <Progress
                            percent={Math.min((securityStats.failedAttempts / 20) * 100, 100)}
                            size="small"
                            status={securityStats.failedAttempts > 15 ? 'exception' : 'normal'}
                            style={{ marginTop: 8 }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card
                        style={{
                            background: '#ffffff',
                            border: '1px solid #d9d9d9',
                        }}
                    >
                        <Statistic
                            title="Security Alerts"
                            value={securityStats.securityAlerts}
                            prefix={<WarningOutlined />}
                            valueStyle={{ color: securityStats.securityAlerts > 2 ? '#ff4d4f' : '#faad14' }}
                        />
                        <div style={{ marginTop: 8 }}>
                            <Tag color={getThreatLevelColor(securityStats.threatLevel)}>
                                THREAT: {securityStats.threatLevel?.toUpperCase() || 'LOW'}
                            </Tag>
                        </div>
                    </Card>
                </Col>
                <Col span={6}>
                    <Card
                        style={{
                            background: '#ffffff',
                            border: '1px solid #d9d9d9',
                        }}
                    >
                        <Statistic
                            title="System Health"
                            value={securityStats.systemHealth}
                            suffix="%"
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{
                                color: securityStats.systemHealth > 90 ? '#52c41a' :
                                    securityStats.systemHealth > 75 ? '#faad14' : '#ff4d4f'
                            }}
                        />
                        <Progress
                            percent={securityStats.systemHealth}
                            size="small"
                            status={
                                securityStats.systemHealth > 90 ? 'success' :
                                    securityStats.systemHealth > 75 ? 'active' : 'exception'
                            }
                            style={{ marginTop: 8 }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Main Content Row */}
            <Row gutter={16}>
                {/* Threat Intelligence */}
                <Col span={12}>
                    <Card
                        title={
                            <Space>
                                <SecurityScanOutlined />
                                <span>THREAT_INTELLIGENCE</span>
                                <Badge count={threatIntelligence.length} style={{ backgroundColor: '#ff4d4f' }} />
                            </Space>
                        }
                        style={{
                            background: '#ffffff',
                            border: '1px solid #d9d9d9',
                            height: '100%'
                        }}
                        extra={
                            <Button
                                type="text"
                                icon={<EyeOutlined />}
                                style={{ color: '#1890ff' }}
                            >
                                View All
                            </Button>
                        }
                    >
                        <BaseTable
                            data={threatIntelligence}
                            columns={threatColumns}
                            loading={loading}
                            rowKey="id"
                            pagination={false}
                            size="small"
                            style={{
                                background: 'transparent',
                            }}
                        />
                    </Card>
                </Col>

                {/* Active Sessions */}
                <Col span={12}>
                    <Card
                        title={
                            <Space>
                                <GlobalOutlined />
                                <span>ACTIVE_SESSIONS</span>
                                <Badge count={activeSessions.length} style={{ backgroundColor: '#1890ff' }} />
                            </Space>
                        }
                        style={{
                            background: '#ffffff',
                            border: '1px solid #d9d9d9',
                            height: '100%'
                        }}
                        extra={
                            <Button
                                type="text"
                                icon={<EyeOutlined />}
                                style={{ color: '#1890ff' }}
                            >
                                Manage
                            </Button>
                        }
                    >
                        <BaseTable
                            data={activeSessions}
                            columns={sessionColumns}
                            loading={loading}
                            rowKey="id"
                            pagination={false}
                            size="small"
                            style={{
                                background: 'transparent',
                            }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Bottom Row */}
            <Row gutter={16} style={{ marginTop: 16 }}>
                {/* Security Events Timeline */}
                <Col span={12}>
                    <Card
                        title={
                            <Space>
                                <ClockCircleOutlined />
                                <span>SECURITY_EVENTS_TIMELINE</span>
                            </Space>
                        }
                        style={{
                            background: '#ffffff',
                            border: '1px solid #d9d9d9',
                        }}
                    >
                        <Timeline>
                            {securityEvents.map(event => (
                                <Timeline.Item
                                    key={event.id}
                                    color={getSeverityColor(event.severity)}
                                    dot={getSeverityIcon(event.severity)}
                                >
                                    <div>
                                        <div style={{ color: '#1890ff', fontSize: '12px' }}>
                                            {event.type.replace('_', ' ').toUpperCase()}
                                        </div>
                                        <div style={{ color: '#666', fontSize: '11px' }}>
                                            {event.description}
                                        </div>
                                        <div style={{ color: '#999', fontSize: '10px' }}>
                                            {dayjs(event.timestamp).format('MMM D, YYYY HH:mm')} • {event.user}
                                        </div>
                                    </div>
                                </Timeline.Item>
                            ))}
                        </Timeline>
                    </Card>
                </Col>

                {/* Compliance & System Status */}
                <Col span={12}>
                    <Card
                        title={
                            <Space>
                                <BarChartOutlined />
                                <span>COMPLIANCE_STATUS</span>
                            </Space>
                        }
                        style={{
                            background: '#ffffff',
                            border: '1px solid #d9d9d9',
                        }}
                    >
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <div>
                                <Text style={{ color: '#666' }}>GDPR Compliance</Text>
                                <Progress
                                    percent={complianceData.gdpr}
                                    status={complianceData.gdpr >= 90 ? 'success' : 'active'}
                                    style={{ marginTop: 4 }}
                                />
                            </div>
                            <div>
                                <Text style={{ color: '#666' }}>HIPAA Compliance</Text>
                                <Progress
                                    percent={complianceData.hipaa}
                                    status={complianceData.hipaa >= 85 ? 'success' : 'active'}
                                    style={{ marginTop: 4 }}
                                />
                            </div>
                            <div>
                                <Text style={{ color: '#666' }}>PCI DSS Compliance</Text>
                                <Progress
                                    percent={complianceData.pci}
                                    status={complianceData.pci >= 95 ? 'success' : 'active'}
                                    style={{ marginTop: 4 }}
                                />
                            </div>
                            <div>
                                <Text style={{ color: '#666' }}>SOC2 Compliance</Text>
                                <Progress
                                    percent={complianceData.soc2}
                                    status={complianceData.soc2 >= 85 ? 'success' : 'active'}
                                    style={{ marginTop: 4 }}
                                />
                            </div>
                        </Space>

                        <Divider style={{ borderColor: '#d9d9d9' }} />

                        {/* System Status */}
                        <div>
                            <Text strong style={{ color: '#1890ff' }}>
                                SYSTEM_STATUS
                            </Text>
                            <div style={{ marginTop: 8 }}>
                                <Space wrap>
                                    <Tag icon={<CheckCircleOutlined />} color="green">AUTH_SERVICE</Tag>
                                    <Tag icon={<CheckCircleOutlined />} color="green">DB_SERVICE</Tag>
                                    <Tag icon={<CheckCircleOutlined />} color="green">API_GATEWAY</Tag>
                                    <Tag icon={<WarningOutlined />} color="orange">LOG_SERVICE</Tag>
                                </Space>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Critical Alerts */}
            {threatIntelligence.some(threat => threat.severity === 'critical') && (
                <Alert
                    message="CRITICAL SECURITY ALERT"
                    description="Critical threats detected in the system. Immediate action required."
                    type="error"
                    showIcon
                    icon={<WarningOutlined />}
                    style={{
                        marginTop: 16,
                        border: '1px solid #cf1322'
                    }}
                    action={
                        <Button size="small" type="primary" danger>
                            Investigate
                        </Button>
                    }
                />
            )}
        </div>
    );
};

export default SecurityDashboard;