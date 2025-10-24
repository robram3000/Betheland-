import React, { useState, useEffect } from 'react';
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
    ClockCircleOutlined
} from '@ant-design/icons';
import BaseTable from './BaseTable';
import moment from 'moment';

// Import the main service
import SchedulingServices from './Services';

// Destructure necessary components
const { Option } = Select;
const { TimePicker } = DatePicker;

// Mock API client
const mockApiClient = {
    get: async (url) => ({ data: [], status: 200 }),
    post: async (url, data) => ({ data: { ...data, id: Date.now() }, status: 201 }),
    put: async (url, data) => ({ data, status: 200 }),
    delete: async (url) => ({ status: 200 })
};

const schedulingService = new SchedulingServices(mockApiClient);

const ScheduleConfig = ({ onScheduleUpdate }) => {
    const [configs, setConfigs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedConfig, setSelectedConfig] = useState(null);
    const [form] = Form.useForm();
    const [agents, setAgents] = useState([]);

    useEffect(() => {
        loadConfigs();
        loadAgents();
    }, []);

    const loadConfigs = async () => {
        setLoading(true);
        try {
            const result = await schedulingService.config.getAll();
            if (result.success) {
                setConfigs(result.data);
            } else {
                message.error(result.error?.message || 'Failed to load schedule configurations');
            }
        } catch (error) {
            console.error('Error loading configs:', error);
            message.error('Failed to load schedule configurations');
        } finally {
            setLoading(false);
        }
    };

    const loadAgents = async () => {
        // Mock agents data - replace with actual API call
        setAgents([
            { id: 1, name: 'John Smith' },
            { id: 2, name: 'Sarah Johnson' },
            { id: 3, name: 'Mike Wilson' }
        ]);
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
            // Note: You might want to add a delete method to ScheduleConfigService
            message.success('Configuration deleted successfully');
            loadConfigs();
            if (onScheduleUpdate) onScheduleUpdate();
        } catch (error) {
            message.error('Failed to delete configuration');
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

            let result;
            if (selectedConfig) {
                result = await schedulingService.config.update(selectedConfig.id, configData);
                if (result.success) {
                    message.success('Configuration updated successfully');
                }
            } else {
                result = await schedulingService.config.create(configData);
                if (result.success) {
                    message.success('Configuration created successfully');
                }
            }

            if (!result.success) {
                message.error(result.error?.message || 'Failed to save configuration');
                return;
            }

            setModalVisible(false);
            loadConfigs();
            if (onScheduleUpdate) onScheduleUpdate();
        } catch (error) {
            message.error('Failed to save configuration');
        }
    };

    const columns = [
        {
            title: 'Agent',
            dataIndex: 'agentName',
            key: 'agent',
            width: 150,
            render: (text) => (
                <Space>
                    <Avatar size="small" icon={<UserOutlined />} />
                    {text}
                </Space>
            )
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
                        <Select placeholder="Select agent">
                            {agents.map(agent => (
                                <Option key={agent.id} value={agent.id}>
                                    {agent.name}
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