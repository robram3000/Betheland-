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
    TimePicker,
    Switch,
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
    CheckOutlined,
    CloseOutlined,
    UserOutlined,
    MailOutlined,
    PhoneOutlined
} from '@ant-design/icons';
import BaseTable from './BaseTable';
import moment from 'moment';

import { AgentAvailabilityService } from '../../AdminPortal/appointment/Services/index';
import agentService from '../../AdminPortal/Creation_Agent/Services/AgentService'; 

// Destructure necessary components
const { Option } = Select;

// Initialize service
const agentAvailabilityService = new AgentAvailabilityService();

const AgentAvailability = ({ onScheduleUpdate }) => {
    const [availabilities, setAvailabilities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedAvailability, setSelectedAvailability] = useState(null);
    const [form] = Form.useForm();
    const [agents, setAgents] = useState([]);
    const [agentsCache, setAgentsCache] = useState({});
    const [agentLoading, setAgentLoading] = useState({});

    const daysOfWeek = [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday'
    ];

    useEffect(() => {
        loadAvailabilities();
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

    const loadAvailabilities = async () => {
        setLoading(true);
        try {
            const result = await agentAvailabilityService.getAllAvailabilities();

            // Enhanced availabilities loader with agent data (similar to PropertyPage)
            if (result && result.length > 0) {
                // First, set availabilities with basic data
                const initialAvailabilities = result.map(availability => ({
                    ...availability,
                    agent: availability.agent || null // Keep existing agent data if any
                }));

                setAvailabilities(initialAvailabilities);

                // Then load agent data for availabilities that need it
                const availabilitiesWithAgents = await Promise.all(
                    initialAvailabilities.map(async (availability) => {
                        let agentData = availability.agent;

                        // If no agent data but we have agentId, load it
                        if (!agentData && availability.agentId) {
                            console.log(`Loading agent for availability ${availability.id}, agentId: ${availability.agentId}`);
                            agentData = await loadAgentData(availability.agentId);
                        }

                        // If we have embedded agent data but it's incomplete, enhance it
                        if (agentData && agentData.id && (!agentData.firstName || agentData.firstName === 'Unknown')) {
                            console.log(`Enhancing incomplete agent data for availability ${availability.id}`);
                            const enhancedAgent = await loadAgentData(agentData.id);
                            agentData = enhancedAgent || agentData;
                        }

                        return {
                            ...availability,
                            agent: agentData
                        };
                    })
                );

                console.log('Final processed availabilities with agent data:', availabilitiesWithAgents);
                setAvailabilities(availabilitiesWithAgents);
            } else {
                console.log('No availabilities found');
                setAvailabilities([]);
            }
        } catch (error) {
            console.error('Error loading availabilities:', error);
            message.error(error.message || 'Failed to load availabilities');
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
        setSelectedAvailability(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (availability) => {
        setSelectedAvailability(availability);
        form.setFieldsValue({
            ...availability,
            startTime: availability.startTime ? moment(availability.startTime, 'HH:mm:ss') : null,
            endTime: availability.endTime ? moment(availability.endTime, 'HH:mm:ss') : null
        });
        setModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            await agentAvailabilityService.deleteAvailability(id);
            message.success('Availability deleted successfully');
            loadAvailabilities();
            if (onScheduleUpdate) onScheduleUpdate();
        } catch (error) {
            console.error('Error deleting availability:', error);
            message.error(error.message || 'Failed to delete availability');
        }
    };

    const handleSubmit = async (values) => {
        try {
            const availabilityData = {
                ...values,
                startTime: values.startTime ? values.startTime.format('HH:mm:ss') : '09:00:00',
                endTime: values.endTime ? values.endTime.format('HH:mm:ss') : '17:00:00',
                id: selectedAvailability?.id
            };

            if (selectedAvailability) {
                await agentAvailabilityService.updateAvailability(selectedAvailability.id, availabilityData);
                message.success('Availability updated successfully');
            } else {
                await agentAvailabilityService.createAvailability(availabilityData);
                message.success('Availability created successfully');
            }

            setModalVisible(false);
            loadAvailabilities();
            if (onScheduleUpdate) onScheduleUpdate();
        } catch (error) {
            console.error('Error saving availability:', error);
            message.error(error.message || 'Failed to save availability');
        }
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
            title: 'Day',
            dataIndex: 'dayOfWeek',
            key: 'dayOfWeek',
            width: 120
        },
        {
            title: 'Time Slot',
            key: 'timeSlot',
            width: 200,
            render: (_, record) => (
                <span>
                    {record.startTime} - {record.endTime}
                </span>
            )
        },
        {
            title: 'Status',
            dataIndex: 'isAvailable',
            key: 'isAvailable',
            width: 100,
            render: (available) => (
                <Tag color={available ? 'green' : 'red'} icon={available ? <CheckOutlined /> : <CloseOutlined />}>
                    {available ? 'Available' : 'Unavailable'}
                </Tag>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 120,
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
                        title="Are you sure to delete this availability?"
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
                </Space>
            )
        }
    ];

    return (
        <div>
            <Card>
                <div style={{
                    marginBottom: 16,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <h3 style={{ margin: 0 }}>Agent Availability</h3>
                        <p style={{ margin: 0, color: '#666' }}>
                            Manage agent working hours and availability
                        </p>
                    </div>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleCreate}
                    >
                        Add Availability
                    </Button>
                </div>

                <BaseTable
                    data={availabilities}
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
                title={selectedAvailability ? 'Edit Availability' : 'Add Availability'}
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
                        name="dayOfWeek"
                        label="Day of Week"
                        rules={[{ required: true, message: 'Please select day' }]}
                    >
                        <Select placeholder="Select day">
                            {daysOfWeek.map(day => (
                                <Option key={day} value={day}>
                                    {day}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="startTime"
                                label="Start Time"
                                rules={[{ required: true, message: 'Please select start time' }]}
                            >
                                <TimePicker
                                    format="HH:mm"
                                    style={{ width: '100%' }}
                                    placeholder="Start time"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="endTime"
                                label="End Time"
                                rules={[{ required: true, message: 'Please select end time' }]}
                            >
                                <TimePicker
                                    format="HH:mm"
                                    style={{ width: '100%' }}
                                    placeholder="End time"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="isAvailable"
                        label="Availability Status"
                        valuePropName="checked"
                        initialValue={true}
                    >
                        <Switch
                            checkedChildren="Available"
                            unCheckedChildren="Unavailable"
                        />
                    </Form.Item>

                    <Form.Item style={{ textAlign: 'right' }}>
                        <Space>
                            <Button onClick={() => setModalVisible(false)}>
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit">
                                {selectedAvailability ? 'Update' : 'Create'} Availability
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );  
};

export default AgentAvailability;