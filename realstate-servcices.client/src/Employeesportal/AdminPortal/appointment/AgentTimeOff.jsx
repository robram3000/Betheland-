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
    Popconfirm
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
const { RangePicker } = DatePicker;
const { TextArea } = Input;

// Mock API client
const mockApiClient = {
    get: async (url) => ({ data: [], status: 200 }),
    post: async (url, data) => ({ data: { ...data, id: Date.now() }, status: 201 }),
    put: async (url, data) => ({ data, status: 200 }),
    patch: async (url, data) => ({ data, status: 200 }),
    delete: async (url) => ({ status: 200 })
};

const schedulingService = new SchedulingServices(mockApiClient);

const AgentTimeOff = ({ onScheduleUpdate }) => {
    const [timeOffs, setTimeOffs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedTimeOff, setSelectedTimeOff] = useState(null);
    const [form] = Form.useForm();
    const [agents, setAgents] = useState([]);

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

    const loadTimeOffs = async () => {
        setLoading(true);
        try {
            const result = await schedulingService.timeOff.getAll();
            if (result.success) {
                setTimeOffs(result.data);
            } else {
                message.error(result.error?.message || 'Failed to load time off requests');
            }
        } catch (error) {
            console.error('Error loading time offs:', error);
            message.error('Failed to load time off requests');
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
        setSelectedTimeOff(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (timeOff) => {
        setSelectedTimeOff(timeOff);
        form.setFieldsValue({
            ...timeOff,
            dateRange: [moment(timeOff.startDate), moment(timeOff.endDate)]
        });
        setModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            const result = await schedulingService.timeOff.delete(id);
            if (result.success) {
                message.success('Time off deleted successfully');
                loadTimeOffs();
                if (onScheduleUpdate) onScheduleUpdate();
            } else {
                message.error(result.error?.message || 'Failed to delete time off');
            }
        } catch (error) {
            message.error('Failed to delete time off');
        }
    };

    const handleSubmit = async (values) => {
        try {
            const timeOffData = {
                ...values,
                startDate: values.dateRange[0].format('YYYY-MM-DD'),
                endDate: values.dateRange[1].format('YYYY-MM-DD'),
                id: selectedTimeOff?.id
            };

            delete timeOffData.dateRange;

            let result;
            if (selectedTimeOff) {
                result = await schedulingService.timeOff.update(selectedTimeOff.id, timeOffData);
                if (result.success) {
                    message.success('Time off updated successfully');
                }
            } else {
                result = await schedulingService.timeOff.create(timeOffData);
                if (result.success) {
                    message.success('Time off created successfully');
                }
            }

            if (!result.success) {
                message.error(result.error?.message || 'Failed to save time off');
                return;
            }

            setModalVisible(false);
            loadTimeOffs();
            if (onScheduleUpdate) onScheduleUpdate();
        } catch (error) {
            message.error('Failed to save time off');
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            let result;
            if (newStatus === 'Approved') {
                result = await schedulingService.timeOff.approve(id);
            } else if (newStatus === 'Rejected') {
                result = await schedulingService.timeOff.reject(id);
            }

            if (result && result.success) {
                message.success(`Time off ${newStatus.toLowerCase()} successfully`);
                loadTimeOffs();
                if (onScheduleUpdate) onScheduleUpdate();
            } else {
                message.error(result?.error?.message || 'Failed to update time off status');
            }
        } catch (error) {
            message.error('Failed to update time off status');
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
            <Card>
                <div style={{
                    marginBottom: 16,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <h3 style={{ margin: 0 }}>Agent Time Off</h3>
                        <p style={{ margin: 0, color: '#666' }}>
                            Manage agent time off requests and approvals
                        </p>
                    </div>
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
            </Card>

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
                        <Select placeholder="Select agent">
                            {agents.map(agent => (
                                <Option key={agent.id} value={agent.id}>
                                    {agent.name}
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