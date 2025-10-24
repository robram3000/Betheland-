import React, { useState, useEffect } from 'react';
import {
    Table,
    Card,
    Button,
    Space,
    Modal,
    Form,
    InputNumber,
    Switch,
    TimePicker,
    Select,
    message,
    Tooltip,
    Avatar,
    Tag,
    Popconfirm,
    Row,
    Col
} from 'antd';
import {
    EditOutlined,
    SettingOutlined,
    UserOutlined,
    CheckOutlined,
    CloseOutlined
} from '@ant-design/icons';
import BaseTable from './BaseTable';
import moment from 'moment';
import ApiClient from './apiClient';
import SchedulingServices from './SchedulePropertiesService';

const { Option } = Select;

// Initialize services
const apiClient = new ApiClient(process.env.REACT_APP_API_BASE_URL);
const schedulingService = new SchedulingServices(apiClient);

const ScheduleConfig = () => {
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
            const result = await schedulingService.getAllConfigs();
            if (result.success) {
                setConfigs(result.data);
            } else {
                message.error(result.error?.message || 'Failed to load configurations');
            }
        } catch (error) {
            console.error('Error loading configs:', error);
            message.error('Failed to load configurations');
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

    const handleEdit = (config) => {
        setSelectedConfig(config);
        form.setFieldsValue({
            ...config,
            workDayStart: moment(config.workDayStart, 'HH:mm:ss'),
            workDayEnd: moment(config.workDayEnd, 'HH:mm:ss')
        });
        setModalVisible(true);
    };

    const handleSubmit = async (values) => {
        try {
            const configData = {
                ...values,
                workDayStart: values.workDayStart.format('HH:mm:ss'),
                workDayEnd: values.workDayEnd.format('HH:mm:ss'),
                id: selectedConfig.id
            };

            const result = await schedulingService.updateConfig(selectedConfig.id, configData);
            if (result.success) {
                message.success('Configuration updated successfully');
                setModalVisible(false);
                loadConfigs();
            } else {
                message.error(result.error?.message || 'Failed to update configuration');
            }
        } catch (error) {
            message.error('Failed to update configuration');
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
            title: 'Max Daily',
            dataIndex: 'maxSchedulesPerDay',
            key: 'maxSchedules',
            width: 100
        },
        {
            title: 'Buffer Time',
            dataIndex: 'bufferTimeMinutes',
            key: 'bufferTime',
            width: 100,
            render: (minutes) => `${minutes} min`
        },
        {
            title: 'Working Hours',
            key: 'workingHours',
            width: 150,
            render: (_, record) => (
                <span>
                    {record.workDayStart} - {record.workDayEnd}
                </span>
            )
        },
        {
            title: 'Weekends',
            dataIndex: 'allowWeekendScheduling',
            key: 'weekends',
            width: 100,
            render: (allowed) => (
                <Tag color={allowed ? 'green' : 'red'} icon={allowed ? <CheckOutlined /> : <CloseOutlined />}>
                    {allowed ? 'Allowed' : 'Not Allowed'}
                </Tag>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 80,
            render: (_, record) => (
                <Tooltip title="Edit Configuration">
                    <Button
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => handleEdit(record)}
                    />
                </Tooltip>
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
                            Configure agent scheduling preferences and constraints
                        </p>
                    </div>
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

            {/* Edit Modal */}
            <Modal
                title="Edit Schedule Configuration"
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                width={600}
            >
                {selectedConfig && (
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                    >
                        <Form.Item
                            name="agentId"
                            label="Agent"
                        >
                            <Select disabled>
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
                                    label="Slot Duration (minutes)"
                                    rules={[{ required: true, message: 'Please enter slot duration' }]}
                                >
                                    <InputNumber
                                        min={15}
                                        max={240}
                                        step={15}
                                        style={{ width: '100%' }}
                                        placeholder="e.g., 60"
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="maxSchedulesPerDay"
                                    label="Max Schedules Per Day"
                                    rules={[{ required: true, message: 'Please enter max schedules' }]}
                                >
                                    <InputNumber
                                        min={1}
                                        max={20}
                                        style={{ width: '100%' }}
                                        placeholder="e.g., 8"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="bufferTimeMinutes"
                                    label="Buffer Time (minutes)"
                                    rules={[{ required: true, message: 'Please enter buffer time' }]}
                                >
                                    <InputNumber
                                        min={0}
                                        max={60}
                                        style={{ width: '100%' }}
                                        placeholder="e.g., 15"
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="advanceBookingDays"
                                    label="Advance Booking (days)"
                                >
                                    <InputNumber
                                        min={1}
                                        max={365}
                                        style={{ width: '100%' }}
                                        placeholder="e.g., 30"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

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
                        >
                            <Switch />
                        </Form.Item>

                        <Form.Item style={{ textAlign: 'right' }}>
                            <Space>
                                <Button onClick={() => setModalVisible(false)}>
                                    Cancel
                                </Button>
                                <Button type="primary" htmlType="submit">
                                    Update Configuration
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                )}
            </Modal>
        </div>
    );
};

export default ScheduleConfig;