// AdminPortal/AgentTimeOff.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    Table,
    Card,
    Button,
    Space,
    Tag,
    Modal,
    Form,
    Select,
    DatePicker,
    Input,
    message,
    Tooltip,
    Avatar,
    Row,
    Col,
    Statistic,
    Popconfirm,
    Alert,
    Dropdown,
    Menu,
    Grid
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    UserOutlined,
    ClockCircleOutlined,
    MailOutlined,
    PhoneOutlined,
    SearchOutlined,
    EyeOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ReloadOutlined,
    MoreOutlined,
    FilterOutlined,
    CalendarOutlined
} from '@ant-design/icons';
import BaseTable from './BaseTable';
import moment from 'moment';

// Import the service
import { AgentTimeOffService } from '../../AdminPortal/appointment/Services/index';
import agentService from '../../AdminPortal/Creation_Agent/Services/AgentService';

// Destructure necessary components
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;
const { useBreakpoint } = Grid;

// Initialize service
const agentTimeOffService = new AgentTimeOffService();

const AgentTimeOff = ({ onScheduleUpdate }) => {
    const [timeOffs, setTimeOffs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [selectedTimeOff, setSelectedTimeOff] = useState(null);
    const [form] = Form.useForm();
    const [agents, setAgents] = useState([]);
    const [agentsCache, setAgentsCache] = useState({});
    const [agentLoading, setAgentLoading] = useState({});
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [error, setError] = useState(null);
    const [filtersVisible, setFiltersVisible] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const screens = useBreakpoint();
    const isMobile = !screens.md;

    const timeOffTypes = [
        'Vacation',
        'Sick Leave',
        'Personal Day',
        'Holiday',
        'Training',
        'Other'
    ];

    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        await Promise.all([
            loadTimeOffs(),
            loadAgents()
        ]);
    };

    const loadAgentData = useCallback(async (agentId) => {
        if (!agentId) {
            return null;
        }

        // Check cache first
        if (agentsCache[agentId]) {
            return agentsCache[agentId];
        }

        // Set loading state for this agent
        setAgentLoading(prev => ({ ...prev, [agentId]: true }));

        try {
            const agentData = await agentService.getAgent(agentId);
            const processedAgent = {
                id: agentData.id,
                firstName: agentData.firstName || 'Unknown',
                lastName: agentData.lastName || 'Agent',
                email: agentData.email || '',
                cellPhoneNo: agentData.cellPhoneNo || '',
                profilePictureUrl: agentData.profilePictureUrl || '',
                licenseNumber: agentData.licenseNumber || ''
            };

            // Update cache
            setAgentsCache(prev => ({
                ...prev,
                [agentId]: processedAgent
            }));

            return processedAgent;
        } catch (error) {
            console.error(`Error loading agent ${agentId}:`, error);

            // Create fallback agent data
            const fallbackAgent = {
                id: agentId,
                firstName: 'Unknown',
                lastName: 'Agent',
                email: '',
                cellPhoneNo: '',
                profilePictureUrl: '',
                licenseNumber: ''
            };

            // Cache the fallback to prevent repeated failed requests
            setAgentsCache(prev => ({
                ...prev,
                [agentId]: fallbackAgent
            }));

            return fallbackAgent;
        } finally {
            // Clear loading state
            setAgentLoading(prev => ({ ...prev, [agentId]: false }));
        }
    }, [agentsCache]);

    const loadTimeOffs = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await agentTimeOffService.getAllTimeOffs();

            if (result && result.length > 0) {
                // Load agent data for all time offs
                const timeOffsWithAgents = await Promise.all(
                    result.map(async (timeOff) => {
                        let agentData = timeOff.agent;

                        // If no agent data but we have agentId, load it
                        if (!agentData && timeOff.agentId) {
                            agentData = await loadAgentData(timeOff.agentId);
                        }

                        return {
                            ...timeOff,
                            agent: agentData
                        };
                    })
                );

                setTimeOffs(timeOffsWithAgents);
            } else {
                setTimeOffs([]);
            }
        } catch (error) {
            console.error('Error loading time offs:', error);
            const errorMessage = error.message || 'Failed to load time off requests';
            setError(errorMessage);
            message.error(errorMessage);
            setTimeOffs([]);
        } finally {
            setLoading(false);
        }
    };

    const loadAgents = async () => {
        try {
            const allAgents = await agentService.getAgents();
            const processedAgents = allAgents.map(agent => ({
                id: agent.id,
                firstName: agent.firstName || 'Unknown',
                lastName: agent.lastName || 'Agent',
                email: agent.email || '',
                cellPhoneNo: agent.cellPhoneNo || '',
                profilePictureUrl: agent.profilePictureUrl || '',
                licenseNumber: agent.licenseNumber || ''
            })).filter(agent => agent.id > 0);

            setAgents(processedAgents);

            if (processedAgents.length === 0) {
                message.warning('No agents available. Please create agents first.');
            }
        } catch (error) {
            console.error('Error loading agents:', error);
            let errorMessage = 'Failed to load agents';
            if (error.message?.includes('Network Error')) {
                errorMessage = 'Network error: Unable to connect to server';
            }
            message.error(errorMessage);
            setAgents([]);
        }
    };

    // Helper functions
    const getAgentDisplayName = (agent) => {
        if (!agent) return 'No Agent Assigned';
        if (agent.firstName && agent.lastName && agent.firstName !== 'Unknown' && agent.lastName !== 'Agent') {
            return `${agent.firstName} ${agent.lastName}`;
        }
        if (agent.firstName && agent.firstName !== 'Unknown') return agent.firstName;
        if (agent.lastName && agent.lastName !== 'Agent') return agent.lastName;
        return 'Unknown Agent';
    };

    const getAgentContactInfo = (agent) => {
        if (!agent) return '';
        const contactInfo = [];
        if (agent.email) contactInfo.push(agent.email);
        if (agent.cellPhoneNo) contactInfo.push(agent.cellPhoneNo);
        return contactInfo.join(' • ');
    };

    const getAgentAvatar = (agent) => {
        if (agent?.profilePictureUrl) {
            return <Avatar size="small" src={agent.profilePictureUrl} />;
        }
        return <Avatar size="small" icon={<UserOutlined />} />;
    };

    const isAgentLoading = (agentId) => {
        return agentLoading[agentId] || false;
    };

    const getStatusColor = (status) => {
        const colors = {
            'Pending': 'orange',
            'Approved': 'green',
            'Rejected': 'red'
        };
        return colors[status] || 'default';
    };

    const getStatusIcon = (status) => {
        const icons = {
            'Pending': <ClockCircleOutlined />,
            'Approved': <CheckCircleOutlined />,
            'Rejected': <CloseCircleOutlined />
        };
        return icons[status] || <ClockCircleOutlined />;
    };

    const getTypeColor = (type) => {
        const colors = {
            'Vacation': 'blue',
            'Sick Leave': 'red',
            'Personal Day': 'purple',
            'Holiday': 'gold',
            'Training': 'green',
            'Other': 'gray'
        };
        return colors[type] || 'default';
    };

    // Event Handlers
    const handleCreate = () => {
        setSelectedTimeOff(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (timeOff) => {
        setSelectedTimeOff(timeOff);
        form.setFieldsValue({
            agentId: timeOff.agentId,
            type: timeOff.type,
            dateRange: [moment(timeOff.startDate), moment(timeOff.endDate)],
            reason: timeOff.reason,
            status: timeOff.status || 'Pending'
        });
        setModalVisible(true);
    };

    const handleView = (timeOff) => {
        setSelectedTimeOff(timeOff);
        setViewModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            await agentTimeOffService.deleteTimeOff(id);
            message.success('Time off deleted successfully');
            loadTimeOffs();
            if (onScheduleUpdate) onScheduleUpdate();
        } catch (error) {
            console.error('Error deleting time off:', error);
            message.error(error.message || 'Failed to delete time off');
        }
    };

    const handleSubmit = async (values) => {
        setSubmitting(true);
        try {
            const timeOffData = {
                agentId: values.agentId,
                type: values.type,
                startDate: values.dateRange[0].format('YYYY-MM-DD'),
                endDate: values.dateRange[1].format('YYYY-MM-DD'),
                reason: values.reason,
                isAllDay: true,
                status: values.status || 'Pending', // Ensure status is always set
                id: selectedTimeOff?.id
            };

            console.log('Submitting time off data:', timeOffData);

            if (selectedTimeOff) {
                await agentTimeOffService.updateTimeOff(selectedTimeOff.id, timeOffData);
                message.success('Time off updated successfully');
            } else {
                await agentTimeOffService.requestTimeOff(timeOffData);
                message.success('Time off created successfully');
            }

            setModalVisible(false);
            loadTimeOffs();
            if (onScheduleUpdate) onScheduleUpdate();
        } catch (error) {
            console.error('Error saving time off:', error);
            message.error(error.message || 'Failed to save time off');
        } finally {
            setSubmitting(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            console.log(`Changing status to: ${newStatus} for time off ID: ${id}`);

            // Update the time off with new status
            const timeOff = timeOffs.find(to => to.id === id);
            if (timeOff) {
                const updatedData = {
                    ...timeOff,
                    status: newStatus,
                    isApproved: newStatus === 'Approved'
                };

                if (newStatus === 'Approved') {
                    await agentTimeOffService.approveTimeOff(id);
                } else if (newStatus === 'Rejected') {
                    await agentTimeOffService.rejectTimeOff(id);
                } else {
                    await agentTimeOffService.updateTimeOff(id, updatedData);
                }
            }

            message.success(`Time off ${newStatus.toLowerCase()} successfully`);
            loadTimeOffs();
            if (onScheduleUpdate) onScheduleUpdate();
        } catch (error) {
            console.error('Error updating time off status:', error);
            message.error(error.message || 'Failed to update time off status');
        }
    };

    const renderErrorAlert = () => {
        if (!error) return null;
        return (
            <Alert
                message="Loading Error"
                description={error}
                type="error"
                showIcon
                action={
                    <Button size="small" onClick={loadAllData} icon={<ReloadOutlined />}>
                        Retry
                    </Button>
                }
                style={{ marginBottom: 16, borderRadius: 8 }}
            />
        );
    };

    const getAvailableActions = (timeOff) => {
        const actions = [];
        const status = timeOff.status;

        actions.push(
            {
                key: 'view',
                label: 'View Details',
                icon: <EyeOutlined />,
                onClick: () => handleView(timeOff)
            },
            {
                key: 'edit',
                label: 'Edit',
                icon: <EditOutlined />,
                onClick: () => handleEdit(timeOff)
            }
        );

        // Status-specific actions
        if (status === 'Pending') {
            actions.push(
                {
                    key: 'approve',
                    label: 'Approve',
                    icon: <CheckCircleOutlined />,
                    onClick: () => handleStatusChange(timeOff.id, 'Approved'),
                    color: 'green'
                },
                {
                    key: 'reject',
                    label: 'Reject',
                    icon: <CloseCircleOutlined />,
                    onClick: () => handleStatusChange(timeOff.id, 'Rejected'),
                    color: 'red'
                }
            );
        }

        actions.push({
            key: 'delete',
            label: 'Delete',
            icon: <DeleteOutlined />,
            onClick: () => handleDelete(timeOff.id),
            color: 'red',
            danger: true
        });

        return actions;
    };

    // Columns definition
    const columns = [
        {
            title: 'Agent',
            dataIndex: 'agentId',
            key: 'agent',
            width: 200,
            render: (agentId, record) => {
                const agent = record.agent;
                const isLoading = record.agentId && isAgentLoading(record.agentId);

                return (
                    <Space direction="vertical" size={2}>
                        <Space>
                            {getAgentAvatar(agent)}
                            <div>
                                <div style={{ fontWeight: 500 }}>
                                    {isLoading ? 'Loading...' : getAgentDisplayName(agent)}
                                </div>
                                {agent?.licenseNumber && agent.licenseNumber !== '' && (
                                    <div style={{ fontSize: '10px', color: '#666' }}>
                                        License: {agent.licenseNumber}
                                    </div>
                                )}
                            </div>
                        </Space>
                        {getAgentContactInfo(agent) && (
                            <div style={{ fontSize: '11px', color: '#888' }}>
                                <Space direction="vertical" size={2}>
                                    {agent?.email && (
                                        <Space size={4}>
                                            <MailOutlined style={{ fontSize: '10px', color: '#1e3a8a' }} />
                                            <span>{agent.email}</span>
                                        </Space>
                                    )}
                                    {agent?.cellPhoneNo && (
                                        <Space size={4}>
                                            <PhoneOutlined style={{ fontSize: '10px', color: '#1e3a8a' }} />
                                            <span>{agent.cellPhoneNo}</span>
                                        </Space>
                                    )}
                                </Space>
                            </div>
                        )}
                        {agentId && !agent && (
                            <Tooltip title={`Agent ID: ${agentId}`}>
                                <Tag color="orange" size="small">ID: {agentId}</Tag>
                            </Tooltip>
                        )}
                        {isLoading && (
                            <Tag color="blue" size="small">Loading...</Tag>
                        )}
                    </Space>
                );
            }
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            width: 120,
            render: (type) => (
                <Tag color={getTypeColor(type)}>
                    {type}
                </Tag>
            )
        },
        {
            title: 'Date Range',
            key: 'dateRange',
            width: 200,
            render: (_, record) => {
                const duration = moment(record.endDate).diff(moment(record.startDate), 'days') + 1;
                return (
                    <Space direction="vertical" size={0}>
                        <div>{moment(record.startDate).format('MMM DD, YYYY')}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                            to {moment(record.endDate).format('MMM DD, YYYY')}
                        </div>
                        <div style={{ fontSize: '11px', color: '#888' }}>
                            {duration} day{duration > 1 ? 's' : ''}
                        </div>
                    </Space>
                );
            }
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            render: (status) => (
                <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
                    {status}
                </Tag>
            )
        },
        {
            title: 'Reason',
            dataIndex: 'reason',
            key: 'reason',
            ellipsis: true,
            render: (reason) => reason || '-'
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 150,
            render: (_, record) => {
                const availableActions = getAvailableActions(record);

                const actionMenu = (
                    <Menu>
                        {availableActions.map(action => (
                            <Menu.Item
                                key={action.key}
                                icon={action.icon}
                                onClick={action.onClick}
                                style={{ color: action.color }}
                                danger={action.danger}
                            >
                                {action.label}
                            </Menu.Item>
                        ))}
                    </Menu>
                );

                return (
                    <Space size="small">
                        <Tooltip title="View Details">
                            <Button
                                icon={<EyeOutlined />}
                                size="small"
                                onClick={() => handleView(record)}
                            />
                        </Tooltip>

                        <Dropdown overlay={actionMenu} trigger={['click']}>
                            <Button
                                icon={<MoreOutlined />}
                                size="small"
                            />
                        </Dropdown>
                    </Space>
                );
            }
        }
    ];

    const filteredTimeOffs = timeOffs.filter(timeOff => {
        const matchesSearch = searchText === '' ||
            getAgentDisplayName(timeOff.agent).toLowerCase().includes(searchText.toLowerCase()) ||
            (timeOff.type || '').toLowerCase().includes(searchText.toLowerCase()) ||
            (timeOff.reason || '').toLowerCase().includes(searchText.toLowerCase());

        const matchesStatus = statusFilter === 'all' || timeOff.status === statusFilter;
        const matchesType = typeFilter === 'all' || timeOff.type === typeFilter;

        return matchesSearch && matchesStatus && matchesType;
    });

    const stats = {
        total: timeOffs.length,
        pending: timeOffs.filter(t => t.status === 'Pending').length,
        approved: timeOffs.filter(t => t.status === 'Approved').length,
        rejected: timeOffs.filter(t => t.status === 'Rejected').length
    };

    return (
        <div>
            {/* Statistics Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={12} sm={6}>
                    <Card size="small">
                        <Statistic
                            title="Total"
                            value={stats.total}
                            prefix={<CalendarOutlined />}
                            valueStyle={{ color: '#1a365d' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small">
                        <Statistic
                            title="Pending"
                            value={stats.pending}
                            prefix={<ClockCircleOutlined />}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small">
                        <Statistic
                            title="Approved"
                            value={stats.approved}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small">
                        <Statistic
                            title="Rejected"
                            value={stats.rejected}
                            prefix={<CloseCircleOutlined />}
                            valueStyle={{ color: '#ff4d4f' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card>
                {/* Header with Filters and Add Button */}
                <div style={{
                    marginBottom: 16,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 16
                }}>
                    <Space>
                        <Input
                            placeholder="Search time off requests..."
                            prefix={<SearchOutlined />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            style={{ width: 300 }}
                        />
                        <Select
                            value={statusFilter}
                            onChange={setStatusFilter}
                            style={{ width: 150 }}
                            placeholder="Filter by status"
                        >
                            <Option value="all">All Status</Option>
                            <Option value="Pending">Pending</Option>
                            <Option value="Approved">Approved</Option>
                            <Option value="Rejected">Rejected</Option>
                        </Select>
                        <Select
                            value={typeFilter}
                            onChange={setTypeFilter}
                            style={{ width: 150 }}
                            placeholder="Filter by type"
                        >
                            <Option value="all">All Types</Option>
                            {timeOffTypes.map(type => (
                                <Option key={type} value={type}>{type}</Option>
                            ))}
                        </Select>
                    </Space>

                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleCreate}
                        disabled={agents.length === 0}
                    >
                        Add Time Off
                    </Button>
                </div>

                {agents.length === 0 && (
                    <Card style={{ marginBottom: 16, background: '#fffbe6', border: '1px solid #ffe58f' }}>
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <UserOutlined style={{ fontSize: '24px', color: '#faad14', marginBottom: '8px' }} />
                            <div style={{ fontWeight: 500, marginBottom: '8px' }}>No Agents Available</div>
                            <div style={{ color: '#666' }}>Please create agents first before adding time off requests.</div>
                        </div>
                    </Card>
                )}

                {renderErrorAlert()}

                <BaseTable
                    data={filteredTimeOffs}
                    columns={columns}
                    loading={loading}
                    rowKey="id"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                    }}
                />
            </Card>

            {/* Create/Edit Modal */}
            <Modal
                title={selectedTimeOff ? 'Edit Time Off' : 'Add Time Off'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                width={500}
                confirmLoading={submitting}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        name="agentId"
                        label="Agent"
                        rules={[{ required: true, message: 'Please select an agent' }]}
                    >
                        <Select
                            placeholder={agents.length === 0 ? "No agents available" : "Select agent"}
                            showSearch
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            disabled={agents.length === 0}
                        >
                            {agents.map(agent => (
                                <Option key={agent.id} value={agent.id}>
                                    {getAgentDisplayName(agent)}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="type"
                        label="Type"
                        rules={[{ required: true, message: 'Please select type' }]}
                    >
                        <Select placeholder="Select type">
                            {timeOffTypes.map(type => (
                                <Option key={type} value={type}>
                                    {type}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="dateRange"
                        label="Date Range"
                        rules={[{ required: true, message: 'Please select date range' }]}
                    >
                        <RangePicker
                            style={{ width: '100%' }}
                            format="YYYY-MM-DD"
                        />
                    </Form.Item>

                    <Form.Item
                        name="reason"
                        label="Reason"
                        rules={[{ required: true, message: 'Please enter reason' }]}
                    >
                        <TextArea
                            rows={3}
                            placeholder="Enter reason for time off..."
                        />
                    </Form.Item>

                    {selectedTimeOff && (
                        <Form.Item
                            name="status"
                            label="Status"
                            rules={[{ required: true, message: 'Please select status' }]}
                        >
                            <Select>
                                <Option value="Pending">Pending</Option>
                                <Option value="Approved">Approved</Option>
                                <Option value="Rejected">Rejected</Option>
                            </Select>
                        </Form.Item>
                    )}

                    <Form.Item style={{ textAlign: 'right' }}>
                        <Space>
                            <Button
                                onClick={() => setModalVisible(false)}
                                disabled={submitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={submitting}
                                disabled={agents.length === 0}
                            >
                                {selectedTimeOff ? 'Update' : 'Create'} Time Off
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* View Details Modal */}
            <Modal
                title="Time Off Details"
                open={viewModalVisible}
                onCancel={() => setViewModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setViewModalVisible(false)}>
                        Close
                    </Button>
                ]}
                width={600}
            >
                {selectedTimeOff && (
                    <div>
                        <Row gutter={16} style={{ marginBottom: 16 }}>
                            <Col span={12}>
                                <strong>Agent:</strong>
                                <div style={{ marginTop: 8 }}>
                                    <Space>
                                        {getAgentAvatar(selectedTimeOff.agent)}
                                        <span>{getAgentDisplayName(selectedTimeOff.agent)}</span>
                                    </Space>
                                </div>
                                {getAgentContactInfo(selectedTimeOff.agent) && (
                                    <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                                        {getAgentContactInfo(selectedTimeOff.agent)}
                                    </div>
                                )}
                            </Col>
                            <Col span={12}>
                                <strong>Status:</strong>
                                <div style={{ marginTop: 8 }}>
                                    <Tag color={getStatusColor(selectedTimeOff.status)}>
                                        {selectedTimeOff.status}
                                    </Tag>
                                </div>
                            </Col>
                        </Row>
                        <Row gutter={16} style={{ marginBottom: 16 }}>
                            <Col span={12}>
                                <strong>Type:</strong>
                                <div style={{ marginTop: 8 }}>
                                    <Tag color={getTypeColor(selectedTimeOff.type)}>
                                        {selectedTimeOff.type}
                                    </Tag>
                                </div>
                            </Col>
                            <Col span={12}>
                                <strong>Duration:</strong>
                                <div style={{ marginTop: 8 }}>
                                    {moment(selectedTimeOff.endDate).diff(moment(selectedTimeOff.startDate), 'days') + 1} days
                                </div>
                            </Col>
                        </Row>
                        <Row gutter={16} style={{ marginBottom: 16 }}>
                            <Col span={24}>
                                <strong>Date Range:</strong>
                                <div style={{ marginTop: 8 }}>
                                    {moment(selectedTimeOff.startDate).format('MMM DD, YYYY')} to {moment(selectedTimeOff.endDate).format('MMM DD, YYYY')}
                                </div>
                            </Col>
                        </Row>
                        {selectedTimeOff.reason && (
                            <Row gutter={16}>
                                <Col span={24}>
                                    <strong>Reason:</strong>
                                    <div style={{
                                        background: '#f5f5f5',
                                        padding: '12px',
                                        borderRadius: '6px',
                                        marginTop: '8px'
                                    }}>
                                        {selectedTimeOff.reason}
                                    </div>
                                </Col>
                            </Row>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AgentTimeOff;