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
    UserOutlined
} from '@ant-design/icons';
import BaseTable from './BaseTable';
import moment from 'moment';
import ApiClient from './Services/apiClient';
import SchedulingServices from './Services/SchedulePropertiesService';

const { Option } = Select;


const apiClient = new ApiClient(process.env.REACT_APP_API_BASE_URL);
const schedulingService = new SchedulingServices(apiClient);

const AgentAvailability = () => {
    const [availabilities, setAvailabilities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedAvailability, setSelectedAvailability] = useState(null);
    const [form] = Form.useForm();
    const [agents, setAgents] = useState([]);

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

    const loadAvailabilities = async () => {
        setLoading(true);
        try {
            const result = await schedulingService.getAllAvailabilities();
            if (result.success) {
                setAvailabilities(result.data);
            } else {
                message.error(result.error?.message || 'Failed to load availabilities');
            }
        } catch (error) {
            console.error('Error loading availabilities:', error);
            message.error('Failed to load availabilities');
        } finally {
            setLoading(false);
        }
    };

    const loadAgents = async () => {
        
        setAgents([
            { id: 1, name: 'John Smith' },
            { id: 2, name: 'Sarah Johnson' },
            { id: 3, name: 'Mike Wilson' }
        ]);
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
            startTime: moment(availability.startTime, 'HH:mm:ss'),
            endTime: moment(availability.endTime, 'HH:mm:ss')
        });
        setModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            const result = await schedulingService.deleteAvailability(id);
            if (result.success) {
                message.success('Availability deleted successfully');
                loadAvailabilities();
            } else {
                message.error(result.error?.message || 'Failed to delete availability');
            }
        } catch (error) {
            message.error('Failed to delete availability');
        }
    };

    const handleSubmit = async (values) => {
        try {
            const availabilityData = {
                ...values,
                startTime: values.startTime.format('HH:mm:ss'),
                endTime: values.endTime.format('HH:mm:ss'),
                id: selectedAvailability?.id
            };

            let result;
            if (selectedAvailability) {
                result = await schedulingService.updateAvailability(selectedAvailability.id, availabilityData);
                if (result.success) {
                    message.success('Availability updated successfully');
                }
            } else {
                result = await schedulingService.createAvailability(availabilityData);
                if (result.success) {
                    message.success('Availability created successfully');
                }
            }

            if (!result.success) {
                message.error(result.error?.message || 'Failed to save availability');
                return;
            }

            setModalVisible(false);
            loadAvailabilities();
        } catch (error) {
            message.error('Failed to save availability');
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
                        <Select placeholder="Select agent">
                            {agents.map(agent => (
                                <Option key={agent.id} value={agent.id}>
                                    {agent.name}
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