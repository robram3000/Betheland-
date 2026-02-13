// AgentAvailability.jsx - AGENT VERSION (Mobile Optimized)
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
    Empty,
    Popconfirm,
    Grid,
    Typography,
    List
} from 'antd';
import {
    EditOutlined,
    CheckOutlined,
    CloseOutlined,
    ReloadOutlined,
    PlusOutlined,
    DeleteOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';
import BaseTable from './BaseTable';
import moment from 'moment';
import { agentAvailabilityService } from '../../AdminPortal/appointment/Services/index.js';
import authService from '../../../Authpage/Services/LoginAuth';
import agentService from '../../AdminPortal/Creation_Agent/Services/AgentService';

const { Option } = Select;
const { useBreakpoint } = Grid;
const { Text } = Typography;

const AgentAvailability = () => {
    const [availabilities, setAvailabilities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedAvailability, setSelectedAvailability] = useState(null);
    const [form] = Form.useForm();
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [currentAgentId, setCurrentAgentId] = useState(null);

    const screens = useBreakpoint();
    const isMobile = !screens.md;

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
            setAvailabilities(result || []);

        } catch (error) {
            console.error('Error loading availabilities:', error);
            const errorMessage = handleApiError(error);
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
        setError(null);
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
                dayOfWeek: parseInt(values.dayOfWeek), // Ensure it's a number
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
                // Create new - Check for duplicate day first
                const existingDay = availabilities.find(avail =>
                    avail.dayOfWeek === availabilityData.dayOfWeek
                );

                if (existingDay) {
                    message.warning(`You already have availability set for ${numberToDayOfWeek(availabilityData.dayOfWeek)}. Please edit the existing one instead.`);
                    return;
                }

                result = await agentAvailabilityService.createAvailability(availabilityData);
                message.success('Availability created successfully');
            }

            setModalVisible(false);
            form.resetFields();
            setSelectedAvailability(null);
            loadAvailabilities();

        } catch (error) {
            console.error('Submit error details:', error);
            const errorMessage = handleApiError(error);
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
            const errorMessage = handleApiError(error);
            message.error(errorMessage);
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

    // Mobile Card Component
    const AvailabilityCard = ({ record }) => {
        const duration = () => {
            if (!record.isAvailable) return null;

            try {
                const start = moment(record.startTime, 'HH:mm:ss');
                const end = moment(record.endTime, 'HH:mm:ss');
                const duration = moment.duration(end.diff(start));
                const hours = duration.hours();
                const minutes = duration.minutes();

                if (hours === 0) {
                    return `${minutes}m`;
                } else if (minutes === 0) {
                    return `${hours}h`;
                } else {
                    return `${hours}h ${minutes}m`;
                }
            } catch (error) {
                return 'Invalid';
            }
        };

        return (
            <Card
                size="small"
                style={{
                    marginBottom: 12,
                    borderLeft: `4px solid ${record.isAvailable ? '#52c41a' : '#ff4d4f'}`
                }}
                bodyStyle={{ padding: '12px' }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                            <Tag
                                color={record.isAvailable ? 'green' : 'red'}
                                icon={record.isAvailable ? <CheckOutlined /> : <CloseOutlined />}
                                style={{
                                    margin: 0,
                                    fontSize: '11px',
                                    padding: '2px 6px'
                                }}
                            >
                                {record.isAvailable ? 'Available' : 'Unavailable'}
                            </Tag>
                            <Text strong style={{ marginLeft: 8, fontSize: '14px' }}>
                                {numberToDayOfWeek(record.dayOfWeek)}
                            </Text>
                        </div>

                        {record.isAvailable && (
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
                                <ClockCircleOutlined style={{ color: '#666', marginRight: 6 }} />
                                <Text style={{ fontSize: '12px', color: '#52c41a' }}>
                                    {record.startTime} - {record.endTime}
                                </Text>
                                {duration() && (
                                    <Tag
                                        color="blue"
                                        style={{
                                            marginLeft: 8,
                                            fontSize: '10px',
                                            padding: '1px 4px'
                                        }}
                                    >
                                        {duration()}
                                    </Tag>
                                )}
                            </div>
                        )}

                        {!record.isAvailable && (
                            <div style={{ marginBottom: 6 }}>
                                <Text style={{ fontSize: '12px', color: '#ff4d4f', fontStyle: 'italic' }}>
                                    Not available this day
                                </Text>
                            </div>
                        )}
                    </div>

                    <Space direction="vertical" size={4} style={{ marginLeft: 12 }}>
                        <Tooltip title="Edit Availability">
                            <Button
                                icon={<EditOutlined />}
                                size="small"
                                onClick={() => handleEdit(record)}
                                type="text"
                                style={{ color: '#1890ff' }}
                            />
                        </Tooltip>
                        <Popconfirm
                            title="Delete this availability?"
                            onConfirm={() => handleDelete(record.id)}
                            okText="Yes"
                            cancelText="No"
                        >
                            <Tooltip title="Delete Availability">
                                <Button
                                    icon={<DeleteOutlined />}
                                    size="small"
                                    danger
                                    type="text"
                                />
                            </Tooltip>
                        </Popconfirm>
                    </Space>
                </div>
            </Card>
        );
    };

    // Mobile Card List
    const MobileCardList = () => (
        <div style={{ padding: '8px 0' }}>
            {availabilities.length > 0 ? (
                availabilities.map(record => (
                    <AvailabilityCard key={record.id} record={record} />
                ))
            ) : (
                <Empty
                    description="No availability configured"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    imageStyle={{ height: 60 }}
                    style={{ margin: '40px 0' }}
                >
                    <p style={{ color: '#666', fontSize: '13px', marginBottom: 16 }}>
                        Your availability schedule will appear here once configured.
                    </p>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAddNew}
                        size="middle"
                    >
                        Add Your First Availability
                    </Button>
                </Empty>
            )}
        </div>
    );

    // Desktop Table Columns
    const desktopColumns = [
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
                    <Popconfirm
                        title="Are you sure to delete this availability?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Tooltip title="Delete Availability">
                            <Button
                                danger
                                size="small"
                                icon={<DeleteOutlined />}
                            >
                                Delete
                            </Button>
                        </Tooltip>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div>
            <Card bodyStyle={{ padding: isMobile ? '12px' : '24px' }}>
                <div style={{
                    marginBottom: 16,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: isMobile ? 'flex-start' : 'center',
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: isMobile ? '12px' : '0'
                }}>
                    <div>
                        <h3 style={{
                            margin: 0,
                            fontSize: isMobile ? '18px' : '20px'
                        }}>
                            My Availability
                        </h3>
                        <p style={{
                            margin: 0,
                            color: '#666',
                            maxWidth: '500px',
                            fontSize: isMobile ? '13px' : '14px'
                        }}>
                            Manage your working hours and availability for appointments.
                            Set specific time slots for each day when you're available.
                        </p>
                    </div>
                    <Space direction={isMobile ? 'horizontal' : 'horizontal'}>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleAddNew}
                            size={isMobile ? 'middle' : 'middle'}
                            block={isMobile}
                        >
                            {isMobile ? 'Add Availability' : 'Add Availability'}
                        </Button>
                        {/* Refresh button removed for mobile approach */}
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
                ) : isMobile ? (
                    <MobileCardList />
                ) : (
                    <BaseTable
                        data={availabilities}
                        columns={desktopColumns}
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
                width={isMobile ? '90%' : 500}
                confirmLoading={submitting}
                destroyOnClose
                maskClosable={!submitting}
                style={{
                    maxWidth: '100vw',
                    top: isMobile ? 20 : undefined
                }}
                bodyStyle={{
                    padding: isMobile ? '16px' : '24px'
                }}
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
                            <Select
                                placeholder="Select day"
                                disabled={submitting}
                                size={isMobile ? 'middle' : 'large'}
                            >
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
                                size={isMobile ? 'middle' : 'large'}
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
                            disabled={submitting}
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
                                    disabled={!form.getFieldValue('isAvailable') || submitting}
                                    minuteStep={15}
                                    showNow={false}
                                    size={isMobile ? 'middle' : 'large'}
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
                                    disabled={!form.getFieldValue('isAvailable') || submitting}
                                    minuteStep={15}
                                    showNow={false}
                                    size={isMobile ? 'middle' : 'large'}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
                        <Space direction={isMobile ? 'vertical' : 'horizontal'} style={{ width: '100%' }}>
                            {isMobile && (
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={submitting}
                                    icon={<CheckOutlined />}
                                    block
                                    size="large"
                                >
                                    {selectedAvailability ? 'Update' : 'Create'} Availability
                                </Button>
                            )}
                            <Button
                                onClick={() => {
                                    setModalVisible(false);
                                    form.resetFields();
                                    setSelectedAvailability(null);
                                }}
                                disabled={submitting}
                                block={isMobile}
                                size={isMobile ? 'large' : 'middle'}
                            >
                                Cancel
                            </Button>
                            {!isMobile && (
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={submitting}
                                    icon={<CheckOutlined />}
                                    size="middle"
                                >
                                    {selectedAvailability ? 'Update' : 'Create'} Availability
                                </Button>
                            )}
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AgentAvailability;