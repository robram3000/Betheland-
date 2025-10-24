// AgentAvailability.jsx
import React, { useState, useEffect } from 'react';
import {
    Table,
    Card,
    Button,
    Space,
    Tag,
    Modal,
    Form,
    TimePicker,
    Switch,
    message,
    Tooltip,
    Row,
    Col,
    Input
} from 'antd';
import {
    EditOutlined,
    CheckOutlined,
    CloseOutlined
} from '@ant-design/icons';
import BaseTable from './BaseTable';
import moment from 'moment';

const AgentAvailability = () => {
    const [availabilities, setAvailabilities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedAvailability, setSelectedAvailability] = useState(null);
    const [form] = Form.useForm();

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
    }, []);

    const loadAvailabilities = async () => {
        setLoading(true);
        try {
            // Mock data for current agent
            const mockData = [
                {
                    id: 1,
                    dayOfWeek: 'Monday',
                    startTime: '09:00',
                    endTime: '17:00',
                    isAvailable: true
                },
                {
                    id: 2,
                    dayOfWeek: 'Tuesday',
                    startTime: '09:00',
                    endTime: '17:00',
                    isAvailable: true
                },
                {
                    id: 3,
                    dayOfWeek: 'Wednesday',
                    startTime: '09:00',
                    endTime: '17:00',
                    isAvailable: true
                },
                {
                    id: 4,
                    dayOfWeek: 'Thursday',
                    startTime: '09:00',
                    endTime: '17:00',
                    isAvailable: true
                },
                {
                    id: 5,
                    dayOfWeek: 'Friday',
                    startTime: '09:00',
                    endTime: '17:00',
                    isAvailable: true
                },
                {
                    id: 6,
                    dayOfWeek: 'Saturday',
                    startTime: '10:00',
                    endTime: '14:00',
                    isAvailable: false
                },
                {
                    id: 7,
                    dayOfWeek: 'Sunday',
                    startTime: '00:00',
                    endTime: '00:00',
                    isAvailable: false
                },
            ];
            setAvailabilities(mockData);
        } catch (error) {
            console.error('Error loading availabilities:', error);
            message.error('Failed to load availabilities');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (availability) => {
        setSelectedAvailability(availability);
        form.setFieldsValue({
            ...availability,
            startTime: moment(availability.startTime, 'HH:mm'),
            endTime: moment(availability.endTime, 'HH:mm')
        });
        setModalVisible(true);
    };

    const handleSubmit = async (values) => {
        try {
            const availabilityData = {
                ...values,
                startTime: values.startTime.format('HH:mm'),
                endTime: values.endTime.format('HH:mm'),
                id: selectedAvailability.id
            };

            message.success('Availability updated successfully');
            setModalVisible(false);
            loadAvailabilities();
        } catch (error) {
            message.error('Failed to save availability');
        }
    };

    const columns = [
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
                    {record.isAvailable ? `${record.startTime} - ${record.endTime}` : 'Not Available'}
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
            width: 80,
            render: (_, record) => (
                <Tooltip title="Edit Availability">
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
                }}>
                    <h3 style={{ margin: 0 }}>My Availability</h3>
                    <p style={{ margin: 0, color: '#666' }}>
                        Set your working hours and availability for appointments
                    </p>
                </div>

                <BaseTable
                    data={availabilities}
                    columns={columns}
                    loading={loading}
                    rowKey="id"
                    pagination={false}
                />
            </Card>

            {/* Edit Modal */}
            <Modal
                title="Edit Availability"
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                width={500}
            >
                {selectedAvailability && (
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                    >
                        <Form.Item
                            name="dayOfWeek"
                            label="Day of Week"
                        >
                            <Input disabled />
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
                                        disabled={!form.getFieldValue('isAvailable')}
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
                                        disabled={!form.getFieldValue('isAvailable')}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item
                            name="isAvailable"
                            label="Available"
                            valuePropName="checked"
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
                                    Update Availability
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                )}
            </Modal>
        </div>
    );
};

export default AgentAvailability;