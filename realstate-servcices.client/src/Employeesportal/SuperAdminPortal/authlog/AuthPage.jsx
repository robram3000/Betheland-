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
    Timeline
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
    ClockCircleOutlined
} from '@ant-design/icons';
import BaseTable from './BaseTable';
import authService from './services/authService';

const { Search } = Input;
const { Option } = Select;

const AuthPage = ({ onFilterUpdate, onAuthUpdate, onEditUser, onCreateUser }) => {
    const [authEvents, setAuthEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [lockModalVisible, setLockModalVisible] = useState(false);

    useEffect(() => {
        if (onFilterUpdate) {
            onFilterUpdate(searchText, statusFilter);
        }
    }, [searchText, statusFilter, onFilterUpdate]);

    const loadAuthEvents = useCallback(async () => {
        setLoading(true);
        try {
            const data = await authService.getAuthEvents();
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
            event.ipAddress?.toLowerCase().includes(searchText.toLowerCase()) ||
            event.userAgent?.toLowerCase().includes(searchText.toLowerCase());

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
                    await authService.lockUser(username);
                    message.success(`User ${username} locked successfully`);
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
            await authService.unlockUser(username);
            message.success(`User ${username} unlocked successfully`);
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
                    await authService.deleteAuthEvent(eventId);
                    message.success('Auth event deleted successfully');
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
            case 'suspicious': return <WarningOutlined />;
            default: return <InfoCircleOutlined />;
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'login': return 'blue';
            case 'logout': return 'purple';
            case 'password_change': return 'cyan';
            case 'permission_change': return 'gold';
            default: return 'default';
        }
    };

    const renderIpInfo = (ip, location) => (
        <Space direction="vertical" size={0}>
            <div style={{ fontFamily: 'monospace', fontSize: '12px' }}>{ip}</div>
            {location && (
                <div style={{ fontSize: '11px', color: '#00d4aa' }}>{location}</div>
            )}
        </Space>
    );

    const renderUserAgent = (userAgent) => {
        const shortAgent = userAgent?.length > 50 ? userAgent.substring(0, 50) + '...' : userAgent;
        return (
            <Tooltip title={userAgent}>
                <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#00d4aa' }}>
                    {shortAgent}
                </div>
            </Tooltip>
        );
    };

    const actionMenu = (record) => (
        <Menu>
            <Menu.Item key="view" icon={<EyeOutlined />} onClick={() => handleView(record)}>
                View Details
            </Menu.Item>
            <Menu.Item key="lock" icon={<LockOutlined />} onClick={() => handleLockUser(record.username)}>
                Lock User
            </Menu.Item>
            <Menu.Item key="unlock" icon={<UnlockOutlined />} onClick={() => handleUnlockUser(record.username)}>
                Unlock User
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={() => handleDeleteEvent(record.id)}>
                Delete Event
            </Menu.Item>
        </Menu>
    );

    const columns = [
        {
            title: 'User',
            dataIndex: 'username',
            key: 'user',
            render: (username, record) => (
                <Space>
                    <Avatar
                        size="small"
                        style={{
                            backgroundColor: record.status === 'success' ? '#00d4aa' : '#ff4d4f',
                            fontFamily: 'monospace'
                        }}
                    >
                        {username?.[0]?.toUpperCase()}
                    </Avatar>
                    <div>
                        <div style={{ fontWeight: 500, fontFamily: 'monospace' }}>{username}</div>
                        <div style={{ fontSize: '11px', color: '#00d4aa' }}>
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
            render: (ip, record) => renderIpInfo(ip, record.location),
        },
        {
            title: 'User Agent',
            dataIndex: 'userAgent',
            key: 'userAgent',
            render: renderUserAgent,
        },
        {
            title: 'Timestamp',
            dataIndex: 'timestamp',
            key: 'timestamp',
            render: (timestamp) => (
                <div style={{ fontFamily: 'monospace', fontSize: '11px' }}>
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
                            style={{ borderColor: '#00d4aa', color: '#00d4aa' }}
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
                                type="primary"
                                ghost
                                onClick={() => handleUnlockUser(record.username)}
                            />
                        </Tooltip>
                    )}
                    <Dropdown overlay={actionMenu(record)} trigger={['click']}>
                        <Button
                            icon={<MoreOutlined />}
                            size="small"
                        />
                    </Dropdown>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Card
                style={{
                    background: '#1a1a1a',
                    border: '1px solid #00d4aa',
                    fontFamily: 'monospace'
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
                            placeholder="search users, ip, events..."
                            allowClear
                            onSearch={handleSearch}
                            style={{ width: 300 }}
                            className="cli-input"
                        />
                        <Select
                            defaultValue="all"
                            style={{ width: 180 }}
                            onChange={handleStatusFilter}
                            className="cli-select"
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
                            className="cli-select"
                        >
                            <Option value="all">All Types</Option>
                            <Option value="login">Login</Option>
                            <Option value="logout">Logout</Option>
                            <Option value="password_change">Password Change</Option>
                            <Option value="permission_change">Permission Change</Option>
                        </Select>
                    </Space>

                    <Space>
                        <Button
                            icon={<SecurityScanOutlined />}
                            onClick={loadAuthEvents}
                            style={{
                                borderColor: '#00d4aa',
                                color: '#00d4aa',
                                fontFamily: 'monospace'
                            }}
                        >
                            $ refresh
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
                    style={{
                        background: 'transparent',
                        fontFamily: 'monospace'
                    }}
                />
            </Card>

            {/* View Event Modal */}
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
                style={{ fontFamily: 'monospace' }}
            >
                {selectedEvent && (
                    <div>
                        <Row gutter={16}>
                            <Col span={12}>
                                <h3 style={{ color: '#00ff00' }}>User Information</h3>
                                <p><strong>Username:</strong> {selectedEvent.username}</p>
                                <p><strong>Status:</strong> <Tag color={getStatusColor(selectedEvent.status)}>{selectedEvent.status.toUpperCase()}</Tag></p>
                                <p><strong>Event Type:</strong> <Tag color={getTypeColor(selectedEvent.type)}>{selectedEvent.type.replace('_', ' ').toUpperCase()}</Tag></p>
                            </Col>
                            <Col span={12}>
                                <h3 style={{ color: '#00ff00' }}>Network Information</h3>
                                <p><strong>IP Address:</strong> {selectedEvent.ipAddress}</p>
                                <p><strong>Location:</strong> {selectedEvent.location || 'Unknown'}</p>
                                <p><strong>Timestamp:</strong> {new Date(selectedEvent.timestamp).toLocaleString()}</p>
                            </Col>
                        </Row>
                        <Divider />
                        <h3 style={{ color: '#00ff00' }}>User Agent</h3>
                        <div style={{
                            background: '#1a1a1a',
                            padding: '12px',
                            borderRadius: '4px',
                            fontFamily: 'monospace',
                            fontSize: '12px',
                            color: '#00d4aa'
                        }}>
                            {selectedEvent.userAgent}
                        </div>
                        {selectedEvent.additionalInfo && (
                            <>
                                <Divider />
                                <h3 style={{ color: '#00ff00' }}>Additional Information</h3>
                                <div style={{
                                    background: '#1a1a1a',
                                    padding: '12px',
                                    borderRadius: '4px',
                                    fontFamily: 'monospace',
                                    fontSize: '12px',
                                    color: '#00d4aa'
                                }}>
                                    {JSON.stringify(selectedEvent.additionalInfo, null, 2)}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AuthPage;