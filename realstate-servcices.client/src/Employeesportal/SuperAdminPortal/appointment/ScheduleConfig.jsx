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
    Popconfirm,
    Switch,
    InputNumber
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
import  AgentScheduleConfigService  from '../../AdminPortal/appointment/Services/ScheduleConfigService';
import agentService from '../../AdminPortal/Creation_Agent/Services/AgentService'; 

// Destructure necessary components
const { Option } = Select;
const { TimePicker } = DatePicker;

// Initialize service
const agentScheduleConfigService = new AgentScheduleConfigService();

const ScheduleConfig = ({ onScheduleUpdate }) => {
    const [configs, setConfigs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedConfig, setSelectedConfig] = useState(null);
    const [form] = Form.useForm();
    const [agents, setAgents] = useState([]);
    const [agentsCache, setAgentsCache] = useState({});
    const [agentLoading, setAgentLoading] = useState({});

    useEffect(() => {
        loadConfigs();
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

    const loadConfigs = async () => {
        setLoading(true);
        try {
            const result = await agentScheduleConfigService.getAllConfigs();

            // Enhanced configs loader with agent data (similar to PropertyPage)
            if (result && result.length > 0) {
                // First, set configs with basic data
                const initialConfigs = result.map(config => ({
                    ...config,
                    agent: config.agent || null // Keep existing agent data if any
                }));

                setConfigs(initialConfigs);

                // Then load agent data for configs that need it
                const configsWithAgents = await Promise.all(
                    initialConfigs.map(async (config) => {
                        let agentData = config.agent;

                        // If no agent data but we have agentId, load it
                        if (!agentData && config.agentId) {
                            console.log(`Loading agent for config ${config.id}, agentId: ${config.agentId}`);
                            agentData = await loadAgentData(config.agentId);
                        }

                        // If we have embedded agent data but it's incomplete, enhance it
                        if (agentData && agentData.id && (!agentData.firstName || agentData.firstName === 'Unknown')) {
                            console.log(`Enhancing incomplete agent data for config ${config.id}`);
                            const enhancedAgent = await loadAgentData(agentData.id);
                            agentData = enhancedAgent || agentData;
                        }

                        return {
                            ...config,
                            agent: agentData
                        };
                    })
                );

                console.log('Final processed configs with agent data:', configsWithAgents);
                setConfigs(configsWithAgents);
            } else {
                console.log('No configs found');
                setConfigs([]);
            }
        } catch (error) {
            console.error('Error loading configs:', error);
            message.error(error.message || 'Failed to load schedule configurations');
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
        setSelectedConfig(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (config) => {
        setSelectedConfig(config);
        form.setFieldsValue({
            ...config,
            workDayStart: config.workDayStart ? moment(config.workDayStart, 'HH:mm:ss') : null,
            workDayEnd: config.workDayEnd ? moment(config.workDayEnd, 'HH:mm:ss') : null
        });
        setModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            await agentScheduleConfigService.deleteConfig(id);
            message.success('Configuration deleted successfully');
            loadConfigs();
            if (onScheduleUpdate) onScheduleUpdate();
        } catch (error) {
            console.error('Error deleting configuration:', error);
            message.error(error.message || 'Failed to delete configuration');
        }
    };

    const handleSubmit = async (values) => {
        try {
            const configData = {
                ...values,
                workDayStart: values.workDayStart ? values.workDayStart.format('HH:mm:ss') : '09:00:00',
                workDayEnd: values.workDayEnd ? values.workDayEnd.format('HH:mm:ss') : '17:00:00',
                id: selectedConfig?.id
            };

            if (selectedConfig) {
                await agentScheduleConfigService.updateConfig(selectedConfig.id, configData);
                message.success('Configuration updated successfully');
            } else {
                await agentScheduleConfigService.createConfig(configData);
                message.success('Configuration created successfully');
            }

            setModalVisible(false);
            loadConfigs();
            if (onScheduleUpdate) onScheduleUpdate();
        } catch (error) {
            console.error('Error saving configuration:', error);
            message.error(error.message || 'Failed to save configuration');
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
            title: 'Slot Duration',
            dataIndex: 'slotDurationMinutes',
            key: 'slotDuration',
            width: 120,
            render: (minutes) => `${minutes} min`
        },
        {
            title: 'Buffer Time',
            dataIndex: 'bufferTimeMinutes',
            key: 'bufferTime',
            width: 120,
            render: (minutes) => `${minutes} min`
        },
        {
            title: 'Max Daily Schedules',
            dataIndex: 'maxSchedulesPerDay',
            key: 'maxSchedules',
            width: 150
        },
        {
            title: 'Work Hours',
            key: 'workHours',
            width: 200,
            render: (_, record) => (
                <span>
                    {record.workDayStart} - {record.workDayEnd}
                </span>
            )
        },
        {
            title: 'Weekend Scheduling',
            dataIndex: 'allowWeekendScheduling',
            key: 'weekendScheduling',
            width: 150,
            render: (allowed) => (
                <Tag color={allowed ? 'green' : 'red'}>
                    {allowed ? 'Allowed' : 'Not Allowed'}
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
                        title="Are you sure to delete this configuration?"
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
                        <h3 style={{ margin: 0 }}>Schedule Configuration</h3>
                        <p style={{ margin: 0, color: '#666' }}>
                            Manage agent scheduling preferences and constraints
                        </p>
                    </div>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleCreate}
                    >
                        Add Configuration
                    </Button>
                </div>

                <BaseTable
                    data={configs}
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
                title={selectedConfig ? 'Edit Configuration' : 'Add Configuration'}
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

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="slotDurationMinutes"
                                label="Slot Duration (min)"
                                rules={[{ required: true, message: 'Please enter slot duration' }]}
                                initialValue={60}
                            >
                                <InputNumber
                                    min={15}
                                    max={240}
                                    style={{ width: '100%' }}
                                    placeholder="e.g., 60"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="bufferTimeMinutes"
                                label="Buffer Time (min)"
                                rules={[{ required: true, message: 'Please enter buffer time' }]}
                                initialValue={15}
                            >
                                <InputNumber
                                    min={0}
                                    max={60}
                                    style={{ width: '100%' }}
                                    placeholder="e.g., 15"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="maxSchedulesPerDay"
                        label="Max Schedules Per Day"
                        rules={[{ required: true, message: 'Please enter max schedules' }]}
                        initialValue={8}
                    >
                        <InputNumber
                            min={1}
                            max={20}
                            style={{ width: '100%' }}
                            placeholder="e.g., 8"
                        />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="workDayStart"
                                label="Work Day Start"
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
                                name="workDayEnd"
                                label="Work Day End"
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
                        name="allowWeekendScheduling"
                        label="Allow Weekend Scheduling"
                        valuePropName="checked"
                        initialValue={false}
                    >
                        <Switch />
                    </Form.Item>

                    <Form.Item style={{ textAlign: 'right' }}>
                        <Space>
                            <Button onClick={() => setModalVisible(false)}>
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit">
                                {selectedConfig ? 'Update' : 'Create'} Configuration
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ScheduleConfig;