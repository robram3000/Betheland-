// AgentTimeOff.jsx
import React, { useState, useEffect } from 'react';
import {
    Table,
    Card,
    Button,
    Space,
    Tag,
    Modal,
    Form,
    DatePicker,
    Input,
    Select,
    message,
    Tooltip,
    Row,
    Col,
    Popconfirm
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import BaseTable from './BaseTable';
import moment from 'moment';
import AgentTimeOffService from '../../AdminPortal/appointment/Services/AgentTimeOffService';

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const AgentTimeOff = () => {
    const [timeOffs, setTimeOffs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedTimeOff, setSelectedTimeOff] = useState(null);
    const [form] = Form.useForm();

    const timeOffService = new AgentTimeOffService();

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
    }, []);

    const loadTimeOffs = async () => {
        setLoading(true);
        try {
            const agentId = localStorage.getItem('agentId') || 123;
            const result = await timeOffService.getByAgent(agentId);

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
            const result = await timeOffService.delete(id);

            if (result.success) {
                message.success('Time off request deleted successfully');
                loadTimeOffs();
            } else {
                message.error(result.error?.message || 'Failed to delete time off request');
            }
        } catch (error) {
            message.error('Failed to delete time off request');
        }
    };

    const handleSubmit = async (values) => {
        try {
            const agentId = localStorage.getItem('agentId') || 123;
            const timeOffData = {
                ...values,
                startDate: values.dateRange[0].format('YYYY-MM-DD'),
                endDate: values.dateRange[1].format('YYYY-MM-DD'),
                agentId: agentId,
                status: 'Pending'
            };

            delete timeOffData.dateRange;

            let result;
            if (selectedTimeOff) {
                result = await timeOffService.update(selectedTimeOff.id, timeOffData);
            } else {
                result = await timeOffService.create(timeOffData);
            }

            if (result.success) {
                message.success(selectedTimeOff ?
                    'Time off request updated successfully' :
                    'Time off request submitted successfully'
                );
                setModalVisible(false);
                loadTimeOffs();
            } else {
                message.error(result.error?.message || 'Failed to save time off request');
            }
        } catch (error) {
            message.error('Failed to save time off request');
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
            width: 120,
            render: (_, record) => (
                <Space size="small">
                    {record.status === 'Pending' && (
                        <>
                            <Tooltip title="Edit">
                                <Button
                                    icon={<EditOutlined />}
                                    size="small"
                                    onClick={() => handleEdit(record)}
                                />
                            </Tooltip>
                            <Popconfirm
                                title="Are you sure to delete this time off request?"
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
                        <h3 style={{ margin: 0 }}>My Time Off Requests</h3>
                        <p style={{ margin: 0, color: '#666' }}>
                            Request and manage your time off
                        </p>
                    </div>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleCreate}
                    >
                        Request Time Off
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

            <Modal
                title={selectedTimeOff ? 'Edit Time Off Request' : 'Request Time Off'}
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

                    <Form.Item style={{ textAlign: 'right' }}>
                        <Space>
                            <Button onClick={() => setModalVisible(false)}>
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit">
                                {selectedTimeOff ? 'Update' : 'Submit'} Request
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AgentTimeOff;