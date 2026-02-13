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
    Popconfirm,
    Grid
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
const { useBreakpoint } = Grid;

// Initialize service
const agentAvailabilityService = new AgentAvailabilityService();

// Day of week mapping
const daysOfWeek = [
    { name: 'Sunday', value: 0 },
    { name: 'Monday', value: 1 },
    { name: 'Tuesday', value: 2 },
    { name: 'Wednesday', value: 3 },
    { name: 'Thursday', value: 4 },
    { name: 'Friday', value: 5 },
    { name: 'Saturday', value: 6 }
];

const AgentAvailability = ({ onScheduleUpdate }) => {
    const [availabilities, setAvailabilities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedAvailability, setSelectedAvailability] = useState(null);
    const [form] = Form.useForm();
    const [agents, setAgents] = useState([]);
    const [agentsCache, setAgentsCache] = useState({});
    const [agentLoading, setAgentLoading] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const screens = useBreakpoint();
    const isMobile = !screens.md;

    useEffect(() => {
        loadAvailabilities();
        loadAgents();
    }, []);

    // Enhanced error handler
    const handleApiError = (error) => {
        console.error('API Error:', error);

        if (error.response?.data) {
            const serverError = error.response.data;

            if (typeof serverError === 'string') {
                return serverError;
            }

            if (serverError.message) {
                return serverError.message;
            }

            if (serverError.details) {
                return Array.isArray(serverError.details)
                    ? serverError.details.join(', ')
                    : serverError.details;
            }
        }

        if (error.message) {
            return error.message;
        }

        return 'An unexpected error occurred';
    };

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

            // Enhanced availabilities loader with agent data
            if (result && result.length > 0) {
                // First, set availabilities with basic data
                const initialAvailabilities = result.map(availability => ({
                    ...availability,
                    agent: availability.agent || null
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
            const errorMessage = handleApiError(error);
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const loadAgents = async () => {
        try {
            console.log('Loading agents for availability dropdown...');

            // Load all agents for the dropdown
            const allAgents = await agentService.getAgents();
            console.log('Raw agents data received:', allAgents);

            // Enhanced agent processing with better error handling
            const processedAgents = allAgents.map(agent => {
                // Ensure we have basic required fields
                const processedAgent = {
                    id: agent.id || 0,
                    firstName: agent.firstName || 'Unknown',
                    lastName: agent.lastName || 'Agent',
                    email: agent.email || '',
                    cellPhoneNo: agent.cellPhoneNo || '',
                    profilePictureUrl: agent.profilePictureUrl || '',
                    licenseNumber: agent.licenseNumber || ''
                };

                // Log any problematic agents
                if (!agent.id) {
                    console.warn('Agent without ID found:', agent);
                }

                return processedAgent;
            }).filter(agent => agent.id > 0); // Filter out invalid agents

            console.log('Processed agents for dropdown:', processedAgents);
            setAgents(processedAgents);

            if (processedAgents.length === 0) {
                console.warn('No valid agents found for dropdown');
                message.warning('No agents available. Please create agents first.');
            }

        } catch (error) {
            console.error('Error loading agents:', error);
            const errorMessage = handleApiError(error);
            message.error(errorMessage);

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
        form.setFieldsValue({
            agentId: undefined,
            dayOfWeek: 1, // Default to Monday
            startTime: moment('09:00:00', 'HH:mm:ss'),
            endTime: moment('17:00:00', 'HH:mm:ss'),
            isAvailable: true
        });
        setModalVisible(true);
    };

    const handleEdit = (availability) => {
        setSelectedAvailability(availability);
        form.setFieldsValue({
            agentId: availability.agentId,
            dayOfWeek: availability.dayOfWeek,
            startTime: availability.startTime ? moment(availability.startTime, 'HH:mm:ss') : moment('09:00:00', 'HH:mm:ss'),
            endTime: availability.endTime ? moment(availability.endTime, 'HH:mm:ss') : moment('17:00:00', 'HH:mm:ss'),
            isAvailable: availability.isAvailable ?? true
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
            const errorMessage = handleApiError(error);
            message.error(errorMessage);
        }
    };

    const handleSubmit = async (values) => {
        setSubmitting(true);
        try {
            // Ensure all data types are correct
            const availabilityData = {
                agentId: parseInt(values.agentId),
                dayOfWeek: parseInt(values.dayOfWeek), // Ensure it's a number
                startTime: values.startTime ? values.startTime.format('HH:mm:ss') : '09:00:00',
                endTime: values.endTime ? values.endTime.format('HH:mm:ss') : '17:00:00',
                isAvailable: values.isAvailable ?? true
            };

            // Include ID for updates
            if (selectedAvailability && selectedAvailability.id) {
                availabilityData.id = selectedAvailability.id;
            }

            console.log('Submitting availability data:', availabilityData);

            if (selectedAvailability && selectedAvailability.id) {
                await agentAvailabilityService.updateAvailability(selectedAvailability.id, availabilityData);
                message.success('Availability updated successfully');
            } else {
                await agentAvailabilityService.createAvailability(availabilityData);
                message.success('Availability created successfully');
            }

            setModalVisible(false);
            form.resetFields();
            loadAvailabilities();
            if (onScheduleUpdate) onScheduleUpdate();
        } catch (error) {
            console.error('Error saving availability:', error);
            const errorMessage = handleApiError(error);

            // More specific error handling
            let userMessage = errorMessage;
            if (errorMessage.includes('overlap')) {
                userMessage = 'This time slot overlaps with existing availability for this agent.';
            } else if (errorMessage.includes('Agent') && errorMessage.includes('exist')) {
                userMessage = 'Selected agent does not exist.';
            }

            message.error(userMessage);
        } finally {
            setSubmitting(false);
        }
    };

    // Mobile Card View
    const renderMobileCard = (availability) => {
        const agent = availability.agent;
        const isLoading = availability.agentId && isAgentLoading(availability.agentId);
        const dayName = daysOfWeek.find(day => day.value === availability.dayOfWeek)?.name || 'Unknown';

        return (
            <Card
                key={availability.id}
                style={{ marginBottom: 16 }}
                bodyStyle={{ padding: '16px' }}
            >
                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                    {getAgentAvatar(agent)}
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: '4px' }}>
                            {isLoading ? 'Loading...' : getAgentDisplayName(agent)}
                        </div>
                        {getAgentContactInfo(agent) && (
                            <div style={{ fontSize: '12px', color: '#666' }}>
                                {getAgentContactInfo(agent)}
                            </div>
                        )}
                    </div>
                </div>

                <Row gutter={[8, 8]} style={{ marginBottom: '12px' }}>
                    <Col span={12}>
                        <div style={{ fontSize: '14px', fontWeight: 500 }}>
                            {dayName}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>Day</div>
                    </Col>
                    <Col span={12}>
                        <div style={{ fontSize: '14px', fontWeight: 500 }}>
                            {availability.startTime} - {availability.endTime}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>Time Slot</div>
                    </Col>
                </Row>

                <div style={{ marginBottom: '12px' }}>
                    <Tag color={availability.isAvailable ? 'green' : 'red'} icon={availability.isAvailable ? <CheckOutlined /> : <CloseOutlined />}>
                        {availability.isAvailable ? 'Available' : 'Unavailable'}
                    </Tag>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
                
                    <Popconfirm
                        title="Are you sure to delete this availability?"
                        onConfirm={() => handleDelete(availability.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button
                            icon={<DeleteOutlined />}
                            size="small"
                            danger
                            style={{ flex: 1 }}
                        >
                            Delete
                        </Button>
                    </Popconfirm>
                </div>
            </Card>
        );
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
            width: 120,
            render: (dayNumber) => {
                const day = daysOfWeek.find(d => d.value === dayNumber);
                return day ? day.name : `Day ${dayNumber}`;
            }
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
                    size={isMobile ? "large" : "middle"}
                    disabled={agents.length === 0}
                >
                    Add Availability
                </Button>
            </div>

            {agents.length === 0 && (
                <Card style={{ marginBottom: 16, background: '#fffbe6', border: '1px solid #ffe58f' }}>
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <UserOutlined style={{ fontSize: '24px', color: '#faad14', marginBottom: '8px' }} />
                        <div style={{ fontWeight: 500, marginBottom: '8px' }}>No Agents Available</div>
                        <div style={{ color: '#666' }}>Please create agents first before adding availability schedules.</div>
                    </div>
                </Card>
            )}

            {/* Conditional Rendering: Table for Desktop, Cards for Mobile */}
            {!isMobile ? (
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
            ) : (
                <div>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            Loading availabilities...
                        </div>
                    ) : (
                        <div>
                            {availabilities.map(availability => renderMobileCard(availability))}
                        </div>
                    )}
                </div>
            )}

            {/* Create/Edit Modal */}
            <Modal
                title={selectedAvailability ? 'Edit Availability' : 'Add Availability'}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                    setSelectedAvailability(null);
                }}
                footer={null}
                width={isMobile ? '100%' : 500}
                style={isMobile ? { top: 0, padding: 0 } : {}}
                confirmLoading={submitting}
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    disabled={submitting}
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
                            size={isMobile ? "large" : "middle"}
                            disabled={agents.length === 0 || submitting}
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
                        <Select
                            placeholder="Select day"
                            size={isMobile ? "large" : "middle"}
                            disabled={submitting}
                        >
                            {daysOfWeek.map(day => (
                                <Option key={day.value} value={day.value}>
                                    {day.name}
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
                                    size={isMobile ? "large" : "middle"}
                                    disabled={submitting}
                                    minuteStep={15}
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
                                    size={isMobile ? "large" : "middle"}
                                    disabled={submitting}
                                    minuteStep={15}
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
                            size={isMobile ? "default" : "small"}
                            disabled={submitting}
                        />
                    </Form.Item>

                    <Form.Item style={{ textAlign: 'right' }}>
                        <Space>
                            <Button
                                onClick={() => {
                                    setModalVisible(false);
                                    form.resetFields();
                                    setSelectedAvailability(null);
                                }}
                                size={isMobile ? "large" : "middle"}
                                disabled={submitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                size={isMobile ? "large" : "middle"}
                                disabled={agents.length === 0}
                                loading={submitting}
                            >
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