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
    Input,
    Alert,
    Select,
    Spin,
    Result,
    Empty
} from 'antd';
import {
    EditOutlined,
    CheckOutlined,
    CloseOutlined,
    ReloadOutlined,
    PlusOutlined
} from '@ant-design/icons';
import BaseTable from './BaseTable';
import moment from 'moment';
import { agentAvailabilityService } from '../../AdminPortal/appointment/Services/index.js';
import authService from '../../../Authpage/Services/LoginAuth';
import agentService from '../../AdminPortal/Creation_Agent/Services/AgentService'; // Import agent service

const { Option } = Select;

const AgentAvailability = () => {
    const [availabilities, setAvailabilities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedAvailability, setSelectedAvailability] = useState(null);
    const [form] = Form.useForm();
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [currentAgentId, setCurrentAgentId] = useState(null);

    // Day of week mapping
    const daysOfWeek = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday'
    ];

    // Helper functions for DayOfWeek conversion
    const dayOfWeekToNumber = (dayName) => {
        const days = {
            'Sunday': 0,
            'Monday': 1,
            'Tuesday': 2,
            'Wednesday': 3,
            'Thursday': 4,
            'Friday': 5,
            'Saturday': 6
        };
        return days[dayName] || 0;
    };

    const numberToDayOfWeek = (dayNumber) => {
        return daysOfWeek[dayNumber] || 'Monday';
    };

    // Helper function to get the actual agent ID from base member ID
    const getCurrentAgentId = async () => {
        try {
            const currentUser = authService.getCurrentUser();
            const baseMemberId = currentUser?.userId;

            if (!baseMemberId) {
                throw new Error('Unable to determine user ID. Please log in again.');
            }

            // Get the agent by base member ID to get the actual agent ID
            const agent = await agentService.getAgentByBaseMemberId(baseMemberId);

            if (!agent || !agent.id) {
                throw new Error('Agent profile not found. Please complete your agent profile first.');
            }

            return agent.id;
        } catch (error) {
            console.error('Error getting current agent ID:', error);
            throw new Error('Failed to retrieve agent information: ' + error.message);
        }
    };

    useEffect(() => {
        loadAvailabilities();
    }, []);

    const loadAvailabilities = async () => {
        setLoading(true);
        setError(null);
        try {
            // Get the actual agent ID first
            const agentId = await getCurrentAgentId();
            setCurrentAgentId(agentId);

            const result = await agentAvailabilityService.getAvailabilitiesByAgent(agentId);
            setAvailabilities(result);

        } catch (error) {
            console.error('Error loading availabilities:', error);
            const errorMessage = error.message || 'Failed to load availabilities';
            setError(errorMessage);
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleAddNew = () => {
        setSelectedAvailability(null);
        form.setFieldsValue({
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
            dayOfWeek: availability.dayOfWeek,
            startTime: availability.startTime ? moment(availability.startTime, 'HH:mm:ss') : moment('09:00:00', 'HH:mm:ss'),
            endTime: availability.endTime ? moment(availability.endTime, 'HH:mm:ss') : moment('17:00:00', 'HH:mm:ss'),
            isAvailable: availability.isAvailable ?? true
        });
        setModalVisible(true);
    };

    const handleSubmit = async (values) => {
        setSubmitting(true);
        try {
            // Get the actual agent ID for submission
            let agentId = currentAgentId;
            if (!agentId) {
                agentId = await getCurrentAgentId();
                setCurrentAgentId(agentId);
            }

            if (!agentId) {
                throw new Error('Unable to determine agent ID. Please log in again.');
            }

            // Prepare data for submission with correct agentId
            const availabilityData = {
                id: selectedAvailability?.id || 0,
                agentId: parseInt(agentId), // Use the actual agent ID, not base member ID
                dayOfWeek: values.dayOfWeek,
                startTime: values.startTime ? values.startTime.format('HH:mm:ss') : '00:00:00',
                endTime: values.endTime ? values.endTime.format('HH:mm:ss') : '00:00:00',
                isAvailable: values.isAvailable ?? true
            };

            console.log('Submitting availability data:', availabilityData);

            let result;
            if (selectedAvailability && selectedAvailability.id) {
                // Update existing
                result = await agentAvailabilityService.updateAvailability(
                    selectedAvailability.id,
                    availabilityData
                );
                message.success('Availability updated successfully');
            } else {
                // Create new
                result = await agentAvailabilityService.createAvailability(availabilityData);
                message.success('Availability created successfully');
            }

            setModalVisible(false);
            form.resetFields();
            loadAvailabilities();

        } catch (error) {
            console.error('Submit error details:', error);
            const errorMessage = error.message || 'Failed to save availability';
            message.error(errorMessage);
            setError(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const handleAvailabilityToggle = (checked) => {
        if (checked) {
            // Enable time pickers and set default times
            form.setFieldsValue({
                startTime: moment('09:00:00', 'HH:mm:ss'),
                endTime: moment('17:00:00', 'HH:mm:ss')
            });
        } else {
            // Clear time pickers when unavailable
            form.setFieldsValue({
                startTime: null,
                endTime: null
            });
        }
    };

    const validateTimeRange = ({ getFieldValue }) => ({
        validator(_, value) {
            if (!form.getFieldValue('isAvailable')) {
                return Promise.resolve();
            }

            const startTime = getFieldValue('startTime');
            const endTime = getFieldValue('endTime');

            if (!startTime || !endTime) {
                return Promise.resolve();
            }

            if (endTime.isAfter(startTime)) {
                return Promise.resolve();
            }

            return Promise.reject(new Error('End time must be after start time'));
        },
    });

    const handleDelete = async (id) => {
        try {
            await agentAvailabilityService.deleteAvailability(id);
            message.success('Availability deleted successfully');
            loadAvailabilities();
        } catch (error) {
            console.error('Error deleting availability:', error);
            message.error('Failed to delete availability');
        }
    };

    const ErrorIndicator = ({ message, onRetry }) => (
        <Result
            status="error"
            title="Failed to Load Availabilities"
            subTitle={message}
            extra={[
                <Button
                    type="primary"
                    key="retry"
                    icon={<ReloadOutlined />}
                    onClick={onRetry}
                >
                    Try Again
                </Button>
            ]}
        />
    );

    const LoadingIndicator = () => (
        <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>Loading your availability...</div>
        </div>
    );

    const columns = [
        {
            title: 'Day',
            dataIndex: 'dayOfWeek',
            key: 'dayOfWeek',
            width: 120,
            render: (dayNumber) => (
                <span style={{ fontWeight: 500 }}>
                    {numberToDayOfWeek(dayNumber)}
                </span>
            )
        },
        {
            title: 'Time Slot',
            key: 'timeSlot',
            width: 200,
            render: (_, record) => (
                <span>
                    {record.isAvailable ? (
                        <span style={{ color: '#52c41a' }}>
                            {record.startTime} - {record.endTime}
                        </span>
                    ) : (
                        <span style={{ color: '#ff4d4f', fontStyle: 'italic' }}>
                            Not Available
                        </span>
                    )}
                </span>
            )
        },
        {
            title: 'Duration',
            key: 'duration',
            width: 100,
            render: (_, record) => {
                if (!record.isAvailable) return '-';

                try {
                    const start = moment(record.startTime, 'HH:mm:ss');
                    const end = moment(record.endTime, 'HH:mm:ss');
                    const duration = moment.duration(end.diff(start));
                    const hours = duration.hours();
                    const minutes = duration.minutes();

                    if (hours === 0) {
                        return `${minutes} min${minutes > 1 ? 's' : ''}`;
                    } else if (minutes === 0) {
                        return `${hours} hour${hours > 1 ? 's' : ''}`;
                    } else {
                        return `${hours}h ${minutes}m`;
                    }
                } catch (error) {
                    return 'Invalid';
                }
            }
        },
        {
            title: 'Status',
            dataIndex: 'isAvailable',
            key: 'isAvailable',
            width: 100,
            render: (available) => (
                <Tag
                    color={available ? 'green' : 'red'}
                    icon={available ? <CheckOutlined /> : <CloseOutlined />}
                >
                    {available ? 'Available' : 'Unavailable'}
                </Tag>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 120,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Edit Availability">
                        <Button
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Delete Availability">
                        <Button
                            danger
                            size="small"
                            onClick={() => handleDelete(record.id)}
                        >
                            Delete
                        </Button>
                    </Tooltip>
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
                    alignItems: 'flex-start'
                }}>
                    <div>
                        <h3 style={{ margin: 0 }}>My Availability</h3>
                        <p style={{ margin: 0, color: '#666', maxWidth: '500px' }}>
                            Manage your working hours and availability for appointments.
                            Set specific time slots for each day when you're available.
                        </p>
                    </div>
                    <Space>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleAddNew}
                        >
                            Add Availability
                        </Button>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={loadAvailabilities}
                            loading={loading}
                        >
                            Refresh
                        </Button>
                    </Space>
                </div>

                {error && (
                    <Alert
                        message="Error Loading Data"
                        description={error}
                        type="error"
                        showIcon
                        action={
                            <Button
                                size="small"
                                type="primary"
                                ghost
                                onClick={loadAvailabilities}
                                icon={<ReloadOutlined />}
                                loading={loading}
                            >
                                Retry
                            </Button>
                        }
                        style={{ marginBottom: 16 }}
                    />
                )}

                {loading ? (
                    <LoadingIndicator />
                ) : error ? (
                    <ErrorIndicator message={error} onRetry={loadAvailabilities} />
                ) : (
                    <BaseTable
                        data={availabilities}
                        columns={columns}
                        loading={loading}
                        rowKey="id"
                        pagination={false}
                        locale={{
                            emptyText: (
                                <Empty
                                    description="No availability configured"
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                >
                                    <p style={{ color: '#666' }}>
                                        Your availability schedule will appear here once configured.
                                    </p>
                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        onClick={handleAddNew}
                                    >
                                        Add Your First Availability
                                    </Button>
                                </Empty>
                            )
                        }}
                    />
                )}
            </Card>

            <Modal
                title={
                    <Space>
                        {selectedAvailability ? <EditOutlined /> : <PlusOutlined />}
                        {selectedAvailability ? 'Edit Availability' : 'Add New Availability'}
                        {selectedAvailability && (
                            <Tag color="blue">
                                {numberToDayOfWeek(selectedAvailability.dayOfWeek)}
                            </Tag>
                        )}
                    </Space>
                }
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                    setSelectedAvailability(null);
                }}
                footer={null}
                width={500}
                confirmLoading={submitting}
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    disabled={submitting}
                    initialValues={{
                        isAvailable: true,
                        dayOfWeek: 1
                    }}
                >
                    {!selectedAvailability && (
                        <Form.Item
                            name="dayOfWeek"
                            label="Day of Week"
                            rules={[{ required: true, message: 'Please select a day' }]}
                        >
                            <Select placeholder="Select day">
                                {daysOfWeek.map((day, index) => (
                                    <Option key={index} value={index}>
                                        {day}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    )}

                    {selectedAvailability && (
                        <Form.Item
                            name="dayOfWeek"
                            label="Day of Week"
                        >
                            <Input
                                disabled
                                value={numberToDayOfWeek(selectedAvailability.dayOfWeek)}
                            />
                        </Form.Item>
                    )}

                    <Form.Item
                        name="isAvailable"
                        label="Availability Status"
                        valuePropName="checked"
                    >
                        <Switch
                            checkedChildren="Available"
                            unCheckedChildren="Unavailable"
                            onChange={handleAvailabilityToggle}
                        />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="startTime"
                                label="Start Time"
                                rules={[
                                    {
                                        required: form.getFieldValue('isAvailable'),
                                        message: 'Please select start time'
                                    }
                                ]}
                            >
                                <TimePicker
                                    format="HH:mm"
                                    style={{ width: '100%' }}
                                    placeholder="Start time"
                                    disabled={!form.getFieldValue('isAvailable')}
                                    minuteStep={15}
                                    showNow={false}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="endTime"
                                label="End Time"
                                rules={[
                                    {
                                        required: form.getFieldValue('isAvailable'),
                                        message: 'Please select end time'
                                    },
                                    validateTimeRange
                                ]}
                            >
                                <TimePicker
                                    format="HH:mm"
                                    style={{ width: '100%' }}
                                    placeholder="End time"
                                    disabled={!form.getFieldValue('isAvailable')}
                                    minuteStep={15}
                                    showNow={false}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
                        <Space>
                            <Button
                                onClick={() => {
                                    setModalVisible(false);
                                    form.resetFields();
                                    setSelectedAvailability(null);
                                }}
                                disabled={submitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={submitting}
                                icon={<CheckOutlined />}
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