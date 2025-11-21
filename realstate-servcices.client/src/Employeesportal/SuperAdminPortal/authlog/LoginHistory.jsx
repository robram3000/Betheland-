// LoginHistory.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    Table,
    Button,
    Space,
    Tag,
    Card,
    Input,
    Select,
    Modal,
    message,
    Tooltip,
    Avatar,
    Badge,
    Dropdown,
    Menu,
    Row,
    Col,
    Divider,
    Timeline,
    Statistic,
    Progress,
    DatePicker,
    List
} from 'antd';
import {
    SearchOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    CheckOutlined,
    CloseOutlined,
    LockOutlined,
    UnlockOutlined,
    MoreOutlined,
    UserOutlined,
    SecurityScanOutlined,
    WarningOutlined,
    InfoCircleOutlined,
    ClockCircleOutlined,
    HistoryOutlined,
    CalendarOutlined,
    ExportOutlined,
    FilterOutlined,
    ReloadOutlined,
    BarChartOutlined
} from '@ant-design/icons';
import BaseTable from './BaseTable';
import dayjs from 'dayjs';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

// Mock data service for login history (same as before)
const mockHistoryService = {
    getLoginHistory: () => Promise.resolve([
        {
            id: 1,
            username: 'admin',
            status: 'success',
            type: 'login',
            ipAddress: '192.168.1.100',
            location: 'New York, US',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            timestamp: new Date().toISOString(),
            sessionDuration: 3540,
            deviceType: 'Desktop',
            browser: 'Chrome 91',
            os: 'Windows 10',
            additionalInfo: { method: 'password', twoFactor: true, trustedDevice: true }
        },
        // ... other mock data remains the same
    ]),
    getLoginStats: () => Promise.resolve({
        totalLogins: 1247,
        successfulLogins: 1189,
        failedLogins: 58,
        uniqueUsers: 45,
        averageSessionDuration: 2840,
        suspiciousActivities: 12,
        currentActiveSessions: 23
    }),
    exportHistory: (filters) => {
        console.log('Exporting history with filters:', filters);
        message.success('Login history exported successfully');
        return Promise.resolve({ success: true });
    }
};

const LoginHistory = ({ onUpdate }) => {
    const [loginHistory, setLoginHistory] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [dateRange, setDateRange] = useState([]);
    const [deviceFilter, setDeviceFilter] = useState('all');
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [viewModalVisible, setViewModalVisible] = useState(false);

    const loadLoginHistory = useCallback(async () => {
        setLoading(true);
        try {
            const [historyData, statsData] = await Promise.all([
                mockHistoryService.getLoginHistory(),
                mockHistoryService.getLoginStats()
            ]);
            setLoginHistory(historyData);
            setStats(statsData);
        } catch (error) {
            console.error('Error loading login history:', error);
            message.error('Failed to load login history');
            // Fallback to static mock data
            setLoginHistory([
                {
                    id: 1,
                    username: 'admin',
                    status: 'success',
                    type: 'login',
                    ipAddress: '192.168.1.100',
                    location: 'New York, US',
                    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    timestamp: new Date().toISOString(),
                    sessionDuration: 3540,
                    deviceType: 'Desktop'
                }
            ]);
            setStats({
                totalLogins: 100,
                successfulLogins: 95,
                failedLogins: 5,
                uniqueUsers: 10
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadLoginHistory();
    }, []);

    const handleSearch = (value) => {
        setSearchText(value);
    };

    const handleStatusFilter = (value) => {
        setStatusFilter(value);
    };

    const handleTypeFilter = (value) => {
        setTypeFilter(value);
    };

    const handleDateRangeChange = (dates) => {
        setDateRange(dates);
    };

    const handleDeviceFilter = (value) => {
        setDeviceFilter(value);
    };

    const handleExport = () => {
        const filters = {
            searchText,
            statusFilter,
            typeFilter,
            dateRange,
            deviceFilter
        };
        mockHistoryService.exportHistory(filters);
    };

    const handleViewDetails = (record) => {
        setSelectedRecord(record);
        setViewModalVisible(true);
    };

    const filteredHistory = loginHistory.filter(record => {
        const matchesSearch = record.username?.toLowerCase().includes(searchText.toLowerCase()) ||
            record.ipAddress?.toLowerCase().includes(searchText.toLowerCase()) ||
            record.location?.toLowerCase().includes(searchText.toLowerCase());

        const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
        const matchesType = typeFilter === 'all' || record.type === typeFilter;
        const matchesDevice = deviceFilter === 'all' || record.deviceType === deviceFilter;

        // Date range filter
        let matchesDate = true;
        if (dateRange && dateRange.length === 2) {
            const recordDate = dayjs(record.timestamp);
            matchesDate = recordDate.isAfter(dateRange[0]) && recordDate.isBefore(dateRange[1]);
        }

        return matchesSearch && matchesStatus && matchesType && matchesDevice && matchesDate;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'success': return 'green';
            case 'failed': return 'red';
            case 'locked': return 'orange';
            case 'suspicious': return 'volcano';
            default: return 'default';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'success': return <CheckOutlined />;
            case 'failed': return <CloseOutlined />;
            case 'locked': return <LockOutlined />;
            case 'suspicious': return <WarningOutlined />;
            default: return <InfoCircleOutlined />;
        }
    };

    const getDeviceIcon = (deviceType) => {
        switch (deviceType) {
            case 'Desktop': return '💻';
            case 'Mobile': return '📱';
            case 'Tablet': return '📟';
            default: return '🖥️';
        }
    };

    const formatDuration = (seconds) => {
        if (!seconds) return '0s';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    };

    const columns = [
        {
            title: 'User & Device',
            dataIndex: 'username',
            key: 'user',
            render: (username, record) => (
                <Space>
                    <Avatar
                        size="small"
                        style={{
                            backgroundColor: record.status === 'success' ? '#52c41a' : '#ff4d4f',
                        }}
                    >
                        {username?.[0]?.toUpperCase()}
                    </Avatar>
                    <div>
                        <div style={{ fontWeight: 500 }}>{username}</div>
                        <div style={{ fontSize: '11px', color: '#666' }}>
                            {getDeviceIcon(record.deviceType)} {record.deviceType} • {record.browser}
                        </div>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Event',
            key: 'event',
            render: (_, record) => (
                <Space direction="vertical" size={2}>
                    <Tag icon={getStatusIcon(record.status)} color={getStatusColor(record.status)}>
                        {record.status.toUpperCase()}
                    </Tag>
                    <Tag color="blue">
                        {record.type.replace('_', ' ').toUpperCase()}
                    </Tag>
                </Space>
            ),
        },
        {
            title: 'Location & IP',
            dataIndex: 'ipAddress',
            key: 'location',
            render: (ip, record) => (
                <Space direction="vertical" size={0}>
                    <div style={{ fontSize: '12px' }}>{ip}</div>
                    <div style={{ fontSize: '11px', color: '#666' }}>{record.location}</div>
                </Space>
            ),
        },
        {
            title: 'Session Duration',
            dataIndex: 'sessionDuration',
            key: 'duration',
            render: (duration, record) => (
                <div style={{ fontSize: '11px' }}>
                    {record.status === 'success' ? formatDuration(duration) : 'N/A'}
                </div>
            ),
        },
        {
            title: 'Timestamp',
            dataIndex: 'timestamp',
            key: 'timestamp',
            render: (timestamp) => (
                <Space direction="vertical" size={0}>
                    <div style={{ fontSize: '11px' }}>
                        {dayjs(timestamp).format('MMM D, YYYY')}
                    </div>
                    <div style={{ fontSize: '10px', color: '#666' }}>
                        {dayjs(timestamp).format('HH:mm:ss')}
                    </div>
                </Space>
            ),
            sorter: (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="View Details">
                        <Button
                            icon={<EyeOutlined />}
                            size="small"
                            onClick={() => handleViewDetails(record)}
                            style={{ borderColor: '#1890ff', color: '#1890ff' }}
                        />
                    </Tooltip>
                    <Tooltip title="Export Entry">
                        <Button
                            icon={<ExportOutlined />}
                            size="small"
                            onClick={() => message.info('Export feature coming soon')}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div>
            {/* Statistics Cards */}
            <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={6}>
                    <Card
                        size="small"
                        style={{
                            background: '#ffffff',
                            border: '1px solid #d9d9d9',
                        }}
                    >
                        <Statistic
                            title="Total Logins"
                            value={stats.totalLogins}
                            prefix={<HistoryOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card
                        size="small"
                        style={{
                            background: '#ffffff',
                            border: '1px solid #d9d9d9',
                        }}
                    >
                        <Statistic
                            title="Success Rate"
                            value={stats.totalLogins ? ((stats.successfulLogins / stats.totalLogins) * 100).toFixed(1) : 0}
                            suffix="%"
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card
                        size="small"
                        style={{
                            background: '#ffffff',
                            border: '1px solid #d9d9d9',
                        }}
                    >
                        <Statistic
                            title="Active Sessions"
                            value={stats.currentActiveSessions}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card
                        size="small"
                        style={{
                            background: '#ffffff',
                            border: '1px solid #d9d9d9',
                        }}
                    >
                        <Statistic
                            title="Suspicious Activities"
                            value={stats.suspiciousActivities}
                            prefix={<WarningOutlined />}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card
                style={{
                    background: '#ffffff',
                    border: '1px solid #d9d9d9',
                }}
            >
                <div style={{
                    marginBottom: 16,
                    display: 'flex',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px'
                }}>
                    <Space wrap>
                        <Search
                            placeholder="search users, ip, location..."
                            allowClear
                            onSearch={handleSearch}
                            style={{ width: 250 }}
                        />
                        <Select
                            defaultValue="all"
                            style={{ width: 150 }}
                            onChange={handleStatusFilter}
                        >
                            <Option value="all">All Status</Option>
                            <Option value="success">Success</Option>
                            <Option value="failed">Failed</Option>
                            <Option value="locked">Locked</Option>
                            <Option value="suspicious">Suspicious</Option>
                        </Select>
                        <Select
                            defaultValue="all"
                            style={{ width: 180 }}
                            onChange={handleTypeFilter}
                        >
                            <Option value="all">All Types</Option>
                            <Option value="login">Login</Option>
                            <Option value="logout">Logout</Option>
                            <Option value="session_renewal">Session Renewal</Option>
                            <Option value="password_change">Password Change</Option>
                        </Select>
                        <Select
                            defaultValue="all"
                            style={{ width: 120 }}
                            onChange={handleDeviceFilter}
                        >
                            <Option value="all">All Devices</Option>
                            <Option value="Desktop">Desktop</Option>
                            <Option value="Mobile">Mobile</Option>
                            <Option value="Tablet">Tablet</Option>
                        </Select>
                        <RangePicker
                            onChange={handleDateRangeChange}
                            style={{ width: 250 }}
                            placeholder={['Start Date', 'End Date']}
                        />
                    </Space>

                    <Space>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={loadLoginHistory}
                            style={{
                                borderColor: '#1890ff',
                                color: '#1890ff',
                            }}
                        >
                            Refresh
                        </Button>
                        <Button
                            icon={<ExportOutlined />}
                            onClick={handleExport}
                            style={{
                                borderColor: '#1890ff',
                                color: '#1890ff',
                            }}
                        >
                            Export Log
                        </Button>
                    </Space>
                </div>

                <BaseTable
                    data={filteredHistory}
                    columns={columns}
                    loading={loading}
                    rowKey="id"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} of ${total} historical events`,
                    }}
                    style={{
                        background: 'transparent',
                    }}
                />
            </Card>

            {/* View Details Modal */}
            <Modal
                title="Login History Details"
                open={viewModalVisible}
                onCancel={() => setViewModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setViewModalVisible(false)}>
                        Close
                    </Button>,
                ]}
                width={800}
            >
                {selectedRecord && (
                    <div>
                        <Row gutter={16}>
                            <Col span={12}>
                                <h3 style={{ color: '#1890ff' }}>User & Session Info</h3>
                                <p><strong>Username:</strong> {selectedRecord.username}</p>
                                <p><strong>Status:</strong> <Tag color={getStatusColor(selectedRecord.status)}>{selectedRecord.status.toUpperCase()}</Tag></p>
                                <p><strong>Event Type:</strong> <Tag color="blue">{selectedRecord.type.replace('_', ' ').toUpperCase()}</Tag></p>
                                <p><strong>Session Duration:</strong> {formatDuration(selectedRecord.sessionDuration)}</p>
                                <p><strong>Timestamp:</strong> {dayjs(selectedRecord.timestamp).format('YYYY-MM-DD HH:mm:ss')}</p>
                            </Col>
                            <Col span={12}>
                                <h3 style={{ color: '#1890ff' }}>Device & Network</h3>
                                <p><strong>Device Type:</strong> {getDeviceIcon(selectedRecord.deviceType)} {selectedRecord.deviceType}</p>
                                <p><strong>Browser:</strong> {selectedRecord.browser}</p>
                                <p><strong>Operating System:</strong> {selectedRecord.os}</p>
                                <p><strong>IP Address:</strong> {selectedRecord.ipAddress}</p>
                                <p><strong>Location:</strong> {selectedRecord.location}</p>
                            </Col>
                        </Row>
                        <Divider />
                        <h3 style={{ color: '#1890ff' }}>User Agent</h3>
                        <div style={{
                            background: '#f5f5f5',
                            padding: '12px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            color: '#333'
                        }}>
                            {selectedRecord.userAgent}
                        </div>
                        {selectedRecord.additionalInfo && (
                            <>
                                <Divider />
                                <h3 style={{ color: '#1890ff' }}>Additional Information</h3>
                                <div style={{
                                    background: '#f5f5f5',  
                                    padding: '12px',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    color: '#333'
                                }}>
                                    <pre>{JSON.stringify(selectedRecord.additionalInfo, null, 2)}</pre>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default LoginHistory;