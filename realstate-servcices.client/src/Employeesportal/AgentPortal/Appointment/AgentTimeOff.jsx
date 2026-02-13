// AgentPortal/AgentTimeOff.jsx
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
    Popconfirm,
    Alert,
    Spin,
    Result,
    Empty,
    Grid,
    List,
    Typography
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    ReloadOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    CalendarOutlined
} from '@ant-design/icons';
import BaseTable from './BaseTable';
import moment from 'moment';
import { AgentTimeOffService } from '../../AdminPortal/appointment/Services/index.js';
import authService from '../../../Authpage/Services/LoginAuth';
import agentService from '../../AdminPortal/Creation_Agent/Services/AgentService';

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { useBreakpoint } = Grid;
const { Text } = Typography;

// Initialize service
const agentTimeOffService = new AgentTimeOffService();

const AgentTimeOff = () => {
    const [timeOffs, setTimeOffs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedTimeOff, setSelectedTimeOff] = useState(null);
    const [form] = Form.useForm();
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [currentAgentId, setCurrentAgentId] = useState(null);

    const screens = useBreakpoint();
    const isMobile = !screens.md;

    const timeOffTypes = [
        'Vacation',
        'Sick Leave',
        'Personal Day',
        'Holiday',
        'Training',
        'Other'
    ];

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
        loadTimeOffs();
    }, []);

    const loadTimeOffs = async () => {
        setLoading(true);
        setError(null);
        try {
            const agentId = await getCurrentAgentId();
            setCurrentAgentId(agentId);

            const result = await agentTimeOffService.getTimeOffsByAgent(agentId);
            setTimeOffs(result);

        } catch (error) {
            console.error('Error loading time offs:', error);
            const errorMessage = error.message || 'Failed to load time off requests';
            setError(errorMessage);
            message.error(errorMessage);
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
        setDeletingId(id);
        try {
            await agentTimeOffService.deleteTimeOff(id);
            message.success('Time off request deleted successfully');
            loadTimeOffs();
        } catch (error) {
            const errorMessage = error.message || 'Failed to delete time off request';
            message.error(errorMessage);
            setError(errorMessage);
        } finally {
            setDeletingId(null);
        }
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

            const timeOffData = {
                type: values.type,
                startDate: values.dateRange[0].format('YYYY-MM-DD'),
                endDate: values.dateRange[1].format('YYYY-MM-DD'),
                reason: values.reason,
                agentId: parseInt(agentId),
                isApproved: false,
                status: 'Pending', // Explicitly set status for consistency
                isAllDay: true
            };

            console.log('Submitting time off data:', timeOffData);

            let result;
            if (selectedTimeOff) {
                result = await agentTimeOffService.updateTimeOff(selectedTimeOff.id, timeOffData);
            } else {
                result = await agentTimeOffService.requestTimeOff(timeOffData);
            }

            message.success(selectedTimeOff ?
                'Time off request updated successfully' :
                'Time off request submitted successfully'
            );
            setModalVisible(false);
            loadTimeOffs();

        } catch (error) {
            console.error('Submit error details:', error);
            const errorMessage = error.message || 'Failed to save time off request';
            message.error(errorMessage);
            setError(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusColor = (status) => {
        const statusMap = {
            'Pending': 'orange',
            'Approved': 'green',
            'Rejected': 'red'
        };
        return statusMap[status] || 'default';
    };

    const getStatusIcon = (status) => {
        const icons = {
            'Pending': <ClockCircleOutlined />,
            'Approved': <CheckCircleOutlined />,
            'Rejected': <CloseCircleOutlined />
        };
        return icons[status] || <ClockCircleOutlined />;
    };

    // Unified status getter that handles both status field and isApproved boolean
    const getStatusInfo = (record) => {
        // Prefer status field, fallback to isApproved
        const status = record.status || (record.isApproved ? 'Approved' : 'Pending');
        return {
            status,
            color: getStatusColor(status),
            icon: getStatusIcon(status)
        };
    };

    const ErrorIndicator = ({ message, onRetry }) => (
        <Result
            status="error"
            title="Failed to Load Time Off Requests"
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
            <div style={{ marginTop: 16 }}>Loading your time off requests...</div>
        </div>
    );

    // Mobile Card Component
    const TimeOffCard = ({ record }) => {
        const statusInfo = getStatusInfo(record);
        const start = moment(record.startDate);
        const end = moment(record.endDate);
        const duration = end.diff(start, 'days') + 1;
        const isPending = statusInfo.status === 'Pending';

        return (
            <Card
                size="small"
                style={{
                    marginBottom: 12,
                    borderLeft: `4px solid ${getStatusColor(statusInfo.status)}`
                }}
                bodyStyle={{ padding: '12px' }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                            <Tag
                                color={statusInfo.color}
                                icon={statusInfo.icon}
                                style={{
                                    margin: 0,
                                    fontSize: '11px',
                                    padding: '2px 6px'
                                }}
                            >
                                {statusInfo.status}
                            </Tag>
                            <Text strong style={{ marginLeft: 8, fontSize: '14px' }}>
                                {record.type}
                            </Text>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
                            <CalendarOutlined style={{ color: '#666', marginRight: 6 }} />
                            <Text style={{ fontSize: '12px', color: '#666' }}>
                                {start.format('MMM DD')} - {end.format('MMM DD, YYYY')}
                            </Text>
                        </div>

                        <div style={{ marginBottom: 6 }}>
                            <Text style={{ fontSize: '12px', color: '#666' }}>
                                {duration} day{duration > 1 ? 's' : ''}
                            </Text>
                        </div>

                        {record.reason && (
                            <div>
                                <Text
                                    style={{ fontSize: '12px' }}
                                    ellipsis={{ tooltip: record.reason }}
                                >
                                    {record.reason}
                                </Text>
                            </div>
                        )}
                    </div>

                    {isPending && (
                        <Space direction="vertical" size={4} style={{ marginLeft: 12 }}>
                            <Tooltip title="Edit">
                                <Button
                                    icon={<EditOutlined />}
                                    size="small"
                                    onClick={() => handleEdit(record)}
                                    type="text"
                                    style={{ color: '#1890ff' }}
                                />
                            </Tooltip>
                            <Popconfirm
                                title="Delete this time off request?"
                                onConfirm={() => handleDelete(record.id)}
                                okText="Yes"
                                cancelText="No"
                                okButtonProps={{ loading: deletingId === record.id }}
                            >
                                <Tooltip title="Delete">
                                    <Button
                                        icon={<DeleteOutlined />}
                                        size="small"
                                        danger
                                        type="text"
                                        loading={deletingId === record.id}
                                    />
                                </Tooltip>
                            </Popconfirm>
                        </Space>
                    )}
                </div>
            </Card>
        );
    };

    // Mobile Card List
    const MobileCardList = () => (
        <div style={{ padding: '8px 0' }}>
            {timeOffs.length > 0 ? (
                timeOffs.map(record => (
                    <TimeOffCard key={record.id} record={record} />
                ))
            ) : (
                <Empty
                    description="No time off requests"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    imageStyle={{ height: 60 }}
                    style={{ margin: '40px 0' }}
                />
            )}
        </div>
    );

    // Desktop Table Columns
    const desktopColumns = [
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
            key: 'status',
            width: 100,
            render: (_, record) => {
                const statusInfo = getStatusInfo(record);
                return (
                    <Tag color={statusInfo.color} icon={statusInfo.icon}>
                        {statusInfo.status}
                    </Tag>
                );
            }
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
            render: (_, record) => {
                const statusInfo = getStatusInfo(record);
                const isPending = statusInfo.status === 'Pending';

                return (
                    <Space size="small">
                        {isPending && (
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
                                    okButtonProps={{ loading: deletingId === record.id }}
                                >
                                    <Tooltip title="Delete">
                                        <Button
                                            icon={<DeleteOutlined />}
                                            size="small"
                                            danger
                                            loading={deletingId === record.id}
                                        />
                                    </Tooltip>
                                </Popconfirm>
                            </>
                        )}
                        {!isPending && (
                            <Tooltip title="This request can no longer be modified">
                                <span style={{ color: '#999', fontSize: '12px' }}>
                                    Locked
                                </span>
                            </Tooltip>
                        )}
                    </Space>
                );
            }
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
                            My Time Off Requests
                        </h3>
                        <p style={{
                            margin: 0,
                            color: '#666',
                            fontSize: isMobile ? '13px' : '14px'
                        }}>
                            Request and manage your time off
                        </p>
                    </div>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleCreate}
                        size={isMobile ? 'middle' : 'middle'}
                        block={isMobile}
                    >
                        {isMobile ? 'New Time Off Request' : 'Request Time Off'}
                    </Button>
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
                                onClick={loadTimeOffs}
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
                    <ErrorIndicator message={error} onRetry={loadTimeOffs} />
                ) : isMobile ? (
                    <MobileCardList />
                ) : (
                    <BaseTable
                        data={timeOffs}
                        columns={desktopColumns}
                        loading={loading}
                        rowKey="id"
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showQuickJumper: true,
                        }}
                        locale={{
                            emptyText: (
                                <Empty
                                    description="No time off requests found"
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                />
                            )
                        }}
                    />
                )}
            </Card>

            <Modal
                title={selectedTimeOff ? 'Edit Time Off Request' : 'Request Time Off'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                width={isMobile ? '90%' : 500}
                confirmLoading={submitting}
                destroyOnClose
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
                >
                    <Form.Item
                        name="type"
                        label="Type"
                        rules={[{ required: true, message: 'Please select type' }]}
                    >
                        <Select
                            placeholder="Select type"
                            size={isMobile ? 'middle' : 'large'}
                        >
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
                            disabledDate={(current) => {
                                return current && current < moment().startOf('day');
                            }}
                            size={isMobile ? 'middle' : 'large'}
                        />
                    </Form.Item>

                    <Form.Item
                        name="reason"
                        label="Reason"
                        rules={[{ required: true, message: 'Please enter reason' }]}
                    >
                        <TextArea
                            rows={isMobile ? 3 : 4}
                            placeholder="Enter reason for time off..."
                            maxLength={500}
                            showCount
                            size={isMobile ? 'middle' : 'large'}
                        />
                    </Form.Item>

                    <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
                        <Space direction={isMobile ? 'vertical' : 'horizontal'} style={{ width: '100%' }}>
                            {isMobile && (
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={submitting}
                                    icon={selectedTimeOff ? <EditOutlined /> : <PlusOutlined />}
                                    block
                                    size="large"
                                >
                                    {selectedTimeOff ? 'Update' : 'Submit'} Request
                                </Button>
                            )}
                            <Button
                                onClick={() => setModalVisible(false)}
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
                                    icon={selectedTimeOff ? <EditOutlined /> : <PlusOutlined />}
                                    size="middle"
                                >
                                    {selectedTimeOff ? 'Update' : 'Submit'} Request
                                </Button>
                            )}
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AgentTimeOff;