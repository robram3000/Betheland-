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
    Popconfirm
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    UserOutlined,
    ClockCircleOutlined,
    MailOutlined,
    PhoneOutlined
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

// Initialize service
const agentTimeOffService = new AgentTimeOffService();

const AgentTimeOff = ({ onScheduleUpdate }) => {
    const [timeOffs, setTimeOffs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedTimeOff, setSelectedTimeOff] = useState(null);
    const [form] = Form.useForm();
    const [agents, setAgents] = useState([]);
    const [agentsCache, setAgentsCache] = useState({});
    const [agentLoading, setAgentLoading] = useState({});

    const timeOffTypes = [
        'Vacation',
        'Sick Leave',
        'Personal Day',
        'Holiday',
        'Training',
        'Other'
    ];

    useEffect(() => {
        loadTimeOffs();
        loadAgents();
    }, []);

    // Copy the agent data loader algorithm from PropertyPage
    const loadAgentData = useCallback(async (agentId) => {
        if (!agentId) {
            return null;
        }

        // Check cache first
        if (agentsCache[agentId]) {
            console.log(`Using cached agent data for ID: ${agentId}`, agentsCache[agentId]);
            return agentsCache[agentId];
        }

        // Set loading state for this agent
        setAgentLoading(prev => ({ ...prev, [agentId]: true }));

        try {
            console.log(`Fetching agent data for ID: ${agentId}`);
            const agentData = await agentService.getAgent(agentId);
            console.log(`Raw agent data received:`, agentData);

            const processedAgent = {
                id: agentData.id,
                firstName: agentData.firstName || 'Unknown',
                lastName: agentData.lastName || 'Agent',
                email: agentData.email || '',
                cellPhoneNo: agentData.cellPhoneNo || '',
                profilePictureUrl: agentData.profilePictureUrl || '',
                licenseNumber: agentData.licenseNumber || ''
            };

            console.log(`Processed agent data:`, processedAgent);

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
        try {
            const result = await agentTimeOffService.getAllTimeOffs();

            // Enhanced time offs loader with agent data (similar to PropertyPage)
            if (result && result.length > 0) {
                // First, set time offs with basic data
                const initialTimeOffs = result.map(timeOff => ({
                    ...timeOff,
                    agent: timeOff.agent || null // Keep existing agent data if any
                }));

                setTimeOffs(initialTimeOffs);

                // Then load agent data for time offs that need it
                const timeOffsWithAgents = await Promise.all(
                    initialTimeOffs.map(async (timeOff) => {
                        let agentData = timeOff.agent;

                        // If no agent data but we have agentId, load it
                        if (!agentData && timeOff.agentId) {
                            console.log(`Loading agent for time off ${timeOff.id}, agentId: ${timeOff.agentId}`);
                            agentData = await loadAgentData(timeOff.agentId);
                        }

                        // If we have embedded agent data but it's incomplete, enhance it
                        if (agentData && agentData.id && (!agentData.firstName || agentData.firstName === 'Unknown')) {
                            console.log(`Enhancing incomplete agent data for time off ${timeOff.id}`);
                            const enhancedAgent = await loadAgentData(agentData.id);
                            agentData = enhancedAgent || agentData;
                        }

                        return {
                            ...timeOff,
                            agent: agentData
                        };
                    })
                );

                console.log('Final processed time offs with agent data:', timeOffsWithAgents);
                setTimeOffs(timeOffsWithAgents);
            } else {
                console.log('No time offs found');
                setTimeOffs([]);
            }
        } catch (error) {
            console.error('Error loading time offs:', error);
            message.error(error.message || 'Failed to load time off requests');
        } finally {
            setLoading(false);
        }
    };

    const loadAgents = async () => {
        try {
            // Load all agents for the dropdown
            const allAgents = await agentService.getAllAgents();
            const processedAgents = allAgents.map(agent => ({
                id: agent.id,
                firstName: agent.firstName || 'Unknown',
                lastName: agent.lastName || 'Agent',
                email: agent.email || '',
                cellPhoneNo: agent.cellPhoneNo || '',
                profilePictureUrl: agent.profilePictureUrl || '',
                licenseNumber: agent.licenseNumber || ''
            }));
            setAgents(processedAgents);
        } catch (error) {
            console.error('Error loading agents:', error);
            message.error('Failed to load agents');
            // Fallback to empty array
            setAgents([]);
        }
    };

    // Helper functions copied from PropertyPage
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
        try {
            const timeOffData = {
                agentId: values.agentId,
                type: values.type,
                startDate: values.dateRange[0].format('YYYY-MM-DD'),
                endDate: values.dateRange[1].format('YYYY-MM-DD'),
                reason: values.reason,
                isAllDay: true,
                status: values.status || 'Pending',
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
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            console.log(`Changing status to: ${newStatus} for time off ID: ${id}`);

            if (newStatus === 'Approved') {
                await agentTimeOffService.approveTimeOff(id);
            } else if (newStatus === 'Rejected') {
                // Try multiple approaches
                try {
                    await agentTimeOffService.rejectTimeOff(id);
                } catch (rejectError) {
                    console.log('rejectTimeOff failed, trying update method...');
                    // Fallback to update method
                    await agentTimeOffService.updateTimeOff(id, {
                        status: 'Rejected',
                        isApproved: false
                    });
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

    const getStatusColor = (status) => {
        const colors = {
            'Pending': 'orange',
            'Approved': 'green',
            'Rejected': 'red'
        };
        return colors[status] || 'default';
    };

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
            width: 120
        },
        {
            title: 'Date Range',
            key: 'dateRange',
            width: 200,
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <div>{moment(record.startDate).format('MMM DD, YYYY')}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                        to {moment(record.endDate).format('MMM DD, YYYY')}
                    </div>
                </Space>
            )
        },
        {
            title: 'Duration',
            key: 'duration',
            width: 100,
            render: (_, record) => {
                const start = moment(record.startDate);
                const end = moment(record.endDate);
                const duration = end.diff(start, 'days') + 1;
                return `${duration} day${duration > 1 ? 's' : ''}`;
            }
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            render: (status) => (
                <Tag color={getStatusColor(status)}>
                    {status}
                </Tag>
            )
        },
        {
            title: 'Reason',
            dataIndex: 'reason',
            key: 'reason',
            ellipsis: true
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 200,
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Edit">
                        <Button
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Are you sure to delete this time off?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Tooltip title="Delete">
                            <Button
                                icon={<DeleteOutlined />}
                                size="small"
                                danger
                            />
                        </Tooltip>
                    </Popconfirm>
                    {record.status === 'Pending' && (
                        <>
                            <Tooltip title="Approve">
                                <Button
                                    size="small"
                                    type="primary"
                                    onClick={() => handleStatusChange(record.id, 'Approved')}
                                >
                                    Approve
                                </Button>
                            </Tooltip>
                            <Tooltip title="Reject">
                                <Button
                                    size="small"
                                    danger
                                    onClick={() => handleStatusChange(record.id, 'Rejected')}
                                >
                                    Reject
                                </Button>
                            </Tooltip>
                        </>
                    )}
                </Space>
            )
        }
    ];

    return (
        <div>
            <div style={{
                marginBottom: 16,
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center'
            }}>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreate}
                >
                    Add Time Off
                </Button>
            </div>

            <BaseTable
                data={timeOffs}
                columns={columns}
                loading={loading}
                rowKey="id"
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                }}
            />

            {/* Create/Edit Modal */}
            <Modal
                title={selectedTimeOff ? 'Edit Time Off' : 'Add Time Off'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                width={500}
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
                            placeholder="Select agent"
                            showSearch
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
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
                        <TextArea rows={3} placeholder="Enter reason for time off..." />
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
                            <Button onClick={() => setModalVisible(false)}>
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit">
                                {selectedTimeOff ? 'Update' : 'Create'} Time Off
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AgentTimeOff;