// AuthPage.jsx
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
    Divider
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
    SecurityScanOutlined
} from '@ant-design/icons';
import BaseTable from './BaseTable';

const { Search } = Input;
const { Option } = Select;

const mockAuthService = {
    getAuthEvents: () => Promise.resolve([
        {
            id: 1,
            username: 'admin',
            status: 'success',
            type: 'login',
            ipAddress: '192.168.1.100',
            location: 'New York, US',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            timestamp: new Date().toISOString(),
            additionalInfo: { method: 'password', twoFactor: true }
        },
        {
            id: 2,
            username: 'john_doe',
            status: 'failed',
            type: 'login',
            ipAddress: '192.168.1.101',
            location: 'London, UK',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            timestamp: new Date(Date.now() - 300000).toISOString(),
            additionalInfo: { reason: 'Invalid password', attempts: 3 }
        }
    ]),
    lockUser: (username) => {
        console.log(`Locking user: ${username}`);
        message.success(`User ${username} locked successfully`);
        return Promise.resolve({ success: true });
    },
    unlockUser: (username) => {
        console.log(`Unlocking user: ${username}`);
        message.success(`User ${username} unlocked successfully`);
        return Promise.resolve({ success: true });
    },
    deleteAuthEvent: (eventId) => {
        console.log(`Deleting auth event: ${eventId}`);
        message.success('Auth event deleted successfully');
        return Promise.resolve({ success: true });
    }
};

const AuthPage = ({ onFilterUpdate, onAuthUpdate, onEditUser, onCreateUser }) => {
    const [authEvents, setAuthEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [viewModalVisible, setViewModalVisible] = useState(false);

    useEffect(() => {
        if (onFilterUpdate) {
            onFilterUpdate(searchText, statusFilter);
        }
    }, [searchText, statusFilter, onFilterUpdate]);

    const loadAuthEvents = useCallback(async () => {
        setLoading(true);
        try {
            const data = await mockAuthService.getAuthEvents();
            setAuthEvents(data);
        } catch (error) {
            console.error('Error loading auth events:', error);
            message.error('Failed to load authentication events');
            setAuthEvents([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAuthEvents();
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

    const filteredEvents = authEvents.filter(event => {
        const matchesSearch = event.username?.toLowerCase().includes(searchText.toLowerCase()) ||
            event.ipAddress?.toLowerCase().includes(searchText.toLowerCase());

        const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
        const matchesType = typeFilter === 'all' || event.type === typeFilter;

        return matchesSearch && matchesStatus && matchesType;
    });

    const handleView = (event) => {
        setSelectedEvent(event);
        setViewModalVisible(true);
    };

    const handleLockUser = async (username) => {
        Modal.confirm({
            title: 'Confirm User Lock',
            content: `Are you sure you want to lock user ${username}?`,
            okText: 'Lock User',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    await mockAuthService.lockUser(username);
                    loadAuthEvents();
                    if (onAuthUpdate) {
                        onAuthUpdate();
                    }
                } catch (error) {
                    console.error('Lock error:', error);
                    message.error(error.message || 'Failed to lock user');
                }
            },
        });
    };

    const handleUnlockUser = async (username) => {
        try {
            await mockAuthService.unlockUser(username);
            loadAuthEvents();
            if (onAuthUpdate) {
                onAuthUpdate();
            }
        } catch (error) {
            console.error('Unlock error:', error);
            message.error(error.message || 'Failed to unlock user');
        }
    };

    const handleDeleteEvent = async (eventId) => {
        Modal.confirm({
            title: 'Delete Auth Event',
            content: 'Are you sure you want to delete this authentication event?',
            okText: 'Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    await mockAuthService.deleteAuthEvent(eventId);
                    setAuthEvents(prev => prev.filter(event => event.id !== eventId));
                } catch (error) {
                    console.error('Delete error:', error);
                    message.error(error.message || 'Failed to delete auth event');
                }
            },
        });
    };

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
            default: return null;
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'login': return 'blue';
            case 'logout': return 'purple';
            case 'password_change': return 'cyan';
            default: return 'default';
        }
    };

    const columns = [
        {
            title: 'User',
            dataIndex: 'username',
            key: 'user',
            render: (username, record) => (
                <Space>
                    <Avatar size="small">
                        {username?.[0]?.toUpperCase()}
                    </Avatar>
                    <div>
                        <div style={{ fontWeight: 500 }}>{username}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                            {new Date(record.timestamp).toLocaleTimeString()}
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
                    <Tag color={getTypeColor(record.type)}>
                        {record.type.replace('_', ' ').toUpperCase()}
                    </Tag>
                </Space>
            ),
        },
        {
            title: 'IP Address',
            dataIndex: 'ipAddress',
            key: 'ip',
            render: (ip, record) => (
                <Space direction="vertical" size={0}>
                    <div>{ip}</div>
                    {record.location && (
                        <div style={{ fontSize: '12px', color: '#666' }}>{record.location}</div>
                    )}
                </Space>
            ),
        },
        {
            title: 'Timestamp',
            dataIndex: 'timestamp',
            key: 'timestamp',
            render: (timestamp) => (
                <div>
                    {new Date(timestamp).toLocaleString()}
                </div>
            ),
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
                            onClick={() => handleView(record)}
                        />
                    </Tooltip>
                    {record.status === 'failed' && (
                        <Tooltip title="Lock User">
                            <Button
                                icon={<LockOutlined />}
                                size="small"
                                danger
                                onClick={() => handleLockUser(record.username)}
                            />
                        </Tooltip>
                    )}
                    {record.status === 'locked' && (
                        <Tooltip title="Unlock User">
                            <Button
                                icon={<UnlockOutlined />}
                                size="small"
                                onClick={() => handleUnlockUser(record.username)}
                            />
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Card style={{ background: '#ffffff', border: '1px solid #d9d9d9' }}>
                <div style={{
                    marginBottom: 16,
                    display: 'flex',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px'
                }}>
                    <Space wrap>
                        <Search
                            placeholder="Search users, IP, events..."
                            allowClear
                            onSearch={handleSearch}
                            style={{ width: 300 }}
                        />
                        <Select
                            defaultValue="all"
                            style={{ width: 180 }}
                            onChange={handleStatusFilter}
                        >
                            <Option value="all">All Status</Option>
                            <Option value="success">Success</Option>
                            <Option value="failed">Failed</Option>
                            <Option value="locked">Locked</Option>
                        </Select>
                        <Select
                            defaultValue="all"
                            style={{ width: 180 }}
                            onChange={handleTypeFilter}
                        >
                            <Option value="all">All Types</Option>
                            <Option value="login">Login</Option>
                            <Option value="logout">Logout</Option>
                            <Option value="password_change">Password Change</Option>
                        </Select>
                    </Space>

                    <Space>
                        <Button
                            icon={<SecurityScanOutlined />}
                            onClick={loadAuthEvents}
                        >
                            Refresh
                        </Button>
                    </Space>
                </div>

                <BaseTable
                    data={filteredEvents}
                    columns={columns}
                    loading={loading}
                    rowKey="id"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} of ${total} events`,
                    }}
                />
            </Card>

            <Modal
                title="Authentication Event Details"
                open={viewModalVisible}
                onCancel={() => setViewModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setViewModalVisible(false)}>
                        Close
                    </Button>,
                ]}
                width={700}
            >
                {selectedEvent && (
                    <div>
                        <Row gutter={16}>
                            <Col span={12}>
                                <h3>User Information</h3>
                                <p><strong>Username:</strong> {selectedEvent.username}</p>
                                <p><strong>Status:</strong> <Tag color={getStatusColor(selectedEvent.status)}>{selectedEvent.status.toUpperCase()}</Tag></p>
                                <p><strong>Event Type:</strong> <Tag color={getTypeColor(selectedEvent.type)}>{selectedEvent.type.replace('_', ' ').toUpperCase()}</Tag></p>
                            </Col>
                            <Col span={12}>
                                <h3>Network Information</h3>
                                <p><strong>IP Address:</strong> {selectedEvent.ipAddress}</p>
                                <p><strong>Location:</strong> {selectedEvent.location || 'Unknown'}</p>
                                <p><strong>Timestamp:</strong> {new Date(selectedEvent.timestamp).toLocaleString()}</p>
                            </Col>
                        </Row>
                        <Divider />
                        <h3>User Agent</h3>
                        <div style={{
                            background: '#f5f5f5',
                            padding: '12px',
                            borderRadius: '4px',
                            fontSize: '12px'
                        }}>
                            {selectedEvent.userAgent}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AuthPage;