// ScheduleAppointments.jsx - Fixed with Scheduled status for reopen and removed create appointment
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
    Statistic,
    Popconfirm,
    InputNumber,
    Alert,
    Dropdown,
    Menu,
    TimePicker,
    Grid,
    Collapse
} from 'antd';
import {
    SearchOutlined,
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    CalendarOutlined,
    UserOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ClockCircleOutlined,
    ReloadOutlined,
    MoreOutlined,
    StopOutlined,
    CheckOutlined,
    ExclamationCircleOutlined,
    SyncOutlined,
    PlayCircleOutlined,
    PauseCircleOutlined,
    FilterOutlined
} from '@ant-design/icons';
import BaseTable from './BaseTable';
import moment from 'moment';

// Import the services
import SchedulePropertiesService from '../../AdminPortal/appointment/Services/SchedulePropertiesService';
import agentService from '../../AdminPortal/Creation_Agent/Services/AgentService';
import clientService from '../../AdminPortal/Creation_Agent/Services/ClientService';
import propertyService from '../../AdminPortal/Creation_Property/services/propertyService';
import { schedulePropertiesMapper } from '../../AdminPortal/appointment/mappers/schedulePropertiesMapper';

const { TextArea } = Input;
const { Option } = Select;
const { useBreakpoint } = Grid;
const { Panel } = Collapse;

const ScheduleAppointments = ({ onScheduleUpdate }) => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [statusModalVisible, setStatusModalVisible] = useState(false);
    const [rescheduleModalVisible, setRescheduleModalVisible] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [rescheduleForm] = Form.useForm();
    const [agents, setAgents] = useState([]);
    const [properties, setProperties] = useState([]);
    const [clients, setClients] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [error, setError] = useState(null);
    const [filtersVisible, setFiltersVisible] = useState(false);

    const screens = useBreakpoint();
    const isMobile = !screens.md;

    const scheduleService = new SchedulePropertiesService();

    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        await Promise.all([
            loadAppointments(),
            loadAgents(),
            loadProperties(),
            loadClients()
        ]);
    };

    const loadAppointments = async () => {
        setLoading(true);
        setError(null);
        try {
            const schedules = await scheduleService.getAllSchedules();
            console.log('Raw appointments data:', schedules);

            if (schedules && Array.isArray(schedules)) {
                const mappedAppointments = schedulePropertiesMapper.toFrontendList(schedules);
                console.log('Mapped appointments:', mappedAppointments);
                setAppointments(mappedAppointments);
            } else {
                setAppointments([]);
                message.warning('No appointments found');
            }
        } catch (error) {
            console.error('Error loading appointments:', error);
            const errorMessage = error.message || 'Failed to load appointments';
            setError(errorMessage);
            message.error(errorMessage);
            setAppointments([]);
        } finally {
            setLoading(false);
        }
    };

    const loadAgents = async () => {
        try {
            const agentsData = await agentService.getAgents();
            if (agentsData && Array.isArray(agentsData)) {
                const mappedAgents = agentsData.map(agent => ({
                    id: agent.id,
                    name: `${agent.firstName || ''} ${agent.lastName || ''}`.trim() || 'Unknown Agent',
                    phone: agent.cellPhoneNo,
                    email: agent.email,
                    profilePicture: agent.profilePictureUrl
                }));
                setAgents(mappedAgents);
            } else {
                setAgents([]);
            }
        } catch (error) {
            console.error('Error loading agents:', error);
            setAgents([]);
            message.warning('Failed to load agents data');
        }
    };

    const loadProperties = async () => {
        try {
            const propertiesData = await propertyService.getAllProperties();
            if (propertiesData && Array.isArray(propertiesData)) {
                const mappedProperties = propertiesData.map(property => ({
                    id: property.id,
                    title: property.title || 'Unknown Property',
                    address: property.address || 'No address',
                    price: property.price,
                    bedrooms: property.bedrooms,
                    bathrooms: property.bathrooms
                }));
                setProperties(mappedProperties);
            } else {
                setProperties([]);
            }
        } catch (error) {
            console.error('Error loading properties:', error);
            setProperties([]);
            message.warning('Failed to load properties data');
        }
    };

    const loadClients = async () => {
        try {
            const clientsData = await clientService.getClients();
            if (clientsData && Array.isArray(clientsData)) {
                const mappedClients = clientsData.map(client => ({
                    id: client.id,
                    name: `${client.firstName || ''} ${client.lastName || ''}`.trim() || 'Unknown Client',
                    phone: client.cellPhoneNo,
                    email: client.email
                }));
                setClients(mappedClients);
            } else {
                setClients([]);
            }
        } catch (error) {
            console.error('Error loading clients:', error);
            setClients([]);
            message.warning('Failed to load clients data');
        }
    };

    const handleView = (appointment) => {
        setSelectedAppointment(appointment);
        setViewModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            // Check if appointment can be deleted
            const canDelete = await scheduleService.canScheduleBeDeleted(id);
            if (!canDelete) {
                message.warning('Cannot delete a completed or cancelled appointment');
                return;
            }

            await scheduleService.deleteSchedule(id);
            message.success('Appointment deleted successfully');
            loadAppointments();
            if (onScheduleUpdate) onScheduleUpdate();
        } catch (error) {
            console.error('Error deleting appointment:', error);
            message.error(error.message || 'Failed to delete appointment');
        }
    };

    // NEW: Complete status actions using the new service methods
    const handleAccept = async (id) => {
        try {
            await scheduleService.acceptSchedule(id);
            message.success('Appointment accepted successfully');
            loadAppointments();
            if (onScheduleUpdate) onScheduleUpdate();
        } catch (error) {
            console.error('Error accepting appointment:', error);
            message.error(error.message || 'Failed to accept appointment');
        }
    };

    const handleComplete = async (id) => {
        try {
            await scheduleService.completeSchedule(id);
            message.success('Appointment marked as completed');
            loadAppointments();
            if (onScheduleUpdate) onScheduleUpdate();
        } catch (error) {
            console.error('Error completing appointment:', error);
            message.error(error.message || 'Failed to complete appointment');
        }
    };

    const handleCancel = async (id, reason = '') => {
        try {
            await scheduleService.cancelSchedule(id, reason);
            message.success('Appointment cancelled successfully');
            loadAppointments();
            if (onScheduleUpdate) onScheduleUpdate();
        } catch (error) {
            console.error('Error cancelling appointment:', error);
            message.error(error.message || 'Failed to cancel appointment');
        }
    };

    const handleReschedule = async (id, newScheduleTime, reason = '') => {
        try {
            await scheduleService.reschedule(id, newScheduleTime, reason);
            message.success('Appointment rescheduled successfully');
            loadAppointments();
            if (onScheduleUpdate) onScheduleUpdate();
        } catch (error) {
            console.error('Error rescheduling appointment:', error);
            message.error(error.message || 'Failed to reschedule appointment');
        }
    };

    // MODIFIED: Reopen sets status to "Scheduled" instead of "Pending"
    const handleReopen = async (id) => {
        try {
            // For reopening cancelled appointments, we'll update directly to Scheduled status
            await scheduleService.updateSchedule(id, {
                status: 'Scheduled',
                cancelledAt: null,
                cancellationReason: null
            });
            message.success('Appointment reopened and scheduled successfully');
            loadAppointments();
            if (onScheduleUpdate) onScheduleUpdate();
        } catch (error) {
            console.error('Error reopening appointment:', error);
            message.error(error.message || 'Failed to reopen appointment');
        }
    };

    // Status change modal handlers
    const openCancelModal = (appointment) => {
        setSelectedAppointment(appointment);
        setSelectedStatus('Cancelled');
        setStatusModalVisible(true);
    };

    const openRescheduleModal = (appointment) => {
        setSelectedAppointment(appointment);
        rescheduleForm.setFieldsValue({
            newScheduleTime: moment(appointment.scheduleTime)
        });
        setRescheduleModalVisible(true);
    };

    const handleStatusSubmit = async (values) => {
        try {
            if (selectedStatus === 'Cancelled') {
                await handleCancel(selectedAppointment.id, values.reason || '');
            }
            setStatusModalVisible(false);
        } catch (error) {
            console.error('Error updating status:', error);
            message.error(error.message || 'Failed to update status');
        }
    };

    const handleRescheduleSubmit = async (values) => {
        try {
            await handleReschedule(
                selectedAppointment.id,
                values.newScheduleTime.format(),
                values.reason || ''
            );
            setRescheduleModalVisible(false);
        } catch (error) {
            console.error('Error rescheduling:', error);
            message.error(error.message || 'Failed to reschedule appointment');
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'Pending': 'gold',
            'Scheduled': 'blue',
            'Completed': 'green',
            'Cancelled': 'red',
            'Rescheduled': 'orange'
        };
        return colors[status] || 'default';
    };

    const getStatusIcon = (status) => {
        const icons = {
            'Pending': <ClockCircleOutlined />,
            'Scheduled': <PlayCircleOutlined />,
            'Completed': <CheckCircleOutlined />,
            'Cancelled': <CloseCircleOutlined />,
            'Rescheduled': <SyncOutlined />
        };
        return icons[status] || <ClockCircleOutlined />;
    };

    const renderErrorAlert = () => {
        if (!error) return null;
        return (
            <Alert
                message="Loading Error"
                description={error}
                type="error"
                showIcon
                action={
                    <Button size="small" onClick={loadAllData} icon={<ReloadOutlined />}>
                        Retry
                    </Button>
                }
                style={{ marginBottom: 16, borderRadius: 8 }}
            />
        );
    };

    const getAvailableActions = (appointment) => {
        const actions = [];
        const status = appointment.status;

        switch (status) {
            case 'Pending':
                actions.push(
                    {
                        key: 'accept',
                        label: 'Accept',
                        icon: <CheckOutlined />,
                        onClick: () => handleAccept(appointment.id),
                        color: 'green'
                    },
                    {
                        key: 'cancel',
                        label: 'Cancel',
                        icon: <CloseCircleOutlined />,
                        onClick: () => openCancelModal(appointment),
                        color: 'red'
                    }
                );
                break;
            case 'Scheduled':
                actions.push(
                    {
                        key: 'complete',
                        label: 'Complete',
                        icon: <CheckCircleOutlined />,
                        onClick: () => handleComplete(appointment.id),
                        color: 'green'
                    },
                    {
                        key: 'reschedule',
                        label: 'Reschedule',
                        icon: <SyncOutlined />,
                        onClick: () => openRescheduleModal(appointment),
                        color: 'orange'
                    },
                    {
                        key: 'cancel',
                        label: 'Cancel',
                        icon: <CloseCircleOutlined />,
                        onClick: () => openCancelModal(appointment),
                        color: 'red'
                    }
                );
                break;
            case 'Rescheduled':
                actions.push(
                    {
                        key: 'complete',
                        label: 'Complete',
                        icon: <CheckCircleOutlined />,
                        onClick: () => handleComplete(appointment.id),
                        color: 'green'
                    },
                    {
                        key: 'cancel',
                        label: 'Cancel',
                        icon: <CloseCircleOutlined />,
                        onClick: () => openCancelModal(appointment),
                        color: 'red'
                    }
                );
                break;
            case 'Cancelled':
                actions.push(
                    {
                        key: 'reopen',
                        label: 'Reopen as Scheduled', // MODIFIED: Changed label
                        icon: <ReloadOutlined />,
                        onClick: () => handleReopen(appointment.id),
                        color: 'blue'
                    }
                );
                break;
            case 'Completed':
                // No actions for completed appointments
                break;
        }

        return actions;
    };

    // Mobile Card View
    const renderMobileCard = (appointment) => {
        const availableActions = getAvailableActions(appointment);

        const actionMenu = (
            <Menu>
                {availableActions.map(action => (
                    <Menu.Item
                        key={action.key}
                        icon={action.icon}
                        onClick={action.onClick}
                        style={{ color: action.color }}
                    >
                        {action.label}
                    </Menu.Item>
                ))}
            </Menu>
        );

        return (
            <Card
                key={appointment.id}
                style={{ marginBottom: 16 }}
                bodyStyle={{ padding: '16px' }}
            >
                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                    <Avatar
                        size="large"
                        src={appointment.agent?.profilePicture}
                        icon={<UserOutlined />}
                    />
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: '4px' }}>
                            {appointment.agentName || 'Unknown Agent'}
                        </div>
                        <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                            with {appointment.clientName || 'Unknown Client'}
                        </div>
                        <Tag color={getStatusColor(appointment.status)} icon={getStatusIcon(appointment.status)}>
                            {appointment.status}
                        </Tag>
                    </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontWeight: 500, fontSize: '14px' }}>
                        {appointment.propertyTitle || 'Unknown Property'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                        {appointment.propertyAddress || 'No address available'}
                    </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 500 }}>
                        {moment(appointment.scheduleTime).format('MMM DD, YYYY')}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                        {moment(appointment.scheduleTime).format('hh:mm A')}
                    </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                    <Tag color={appointment.meetingType === 'Virtual' ? 'blue' : appointment.meetingType === 'Phone' ? 'orange' : 'green'}>
                        {appointment.meetingType || 'InPerson'}
                    </Tag>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    <Button
                        icon={<EyeOutlined />}
                        size="small"
                        onClick={() => handleView(appointment)}
                        style={{ flex: 1 }}
                    >
                        View
                    </Button>

                    {/* Status Actions Dropdown */}
                    {availableActions.length > 0 && (
                        <Dropdown overlay={actionMenu} trigger={['click']}>
                            <Button
                                icon={<MoreOutlined />}
                                size="small"
                                style={{ flex: 1 }}
                            >
                                Actions
                            </Button>
                        </Dropdown>
                    )}

                    {appointment.canDelete && (
                        <Popconfirm
                            title="Are you sure to delete this appointment?"
                            onConfirm={() => handleDelete(appointment.id)}
                            okText="Yes"
                            cancelText="No"
                        >
                            <Button
                                icon={<DeleteOutlined />}
                                size="small"
                                danger
                                style={{ flex: 1 }}
                            >
                                Delete
                            </Button>
                        </Popconfirm>
                    )}
                </div>
            </Card>
        );
    };

    // Render filters based on device
    const renderFilters = () => {
        if (isMobile) {
            return (
                <div style={{ width: '100%' }}>
                    {/* Search Bar - Full width on mobile */}
                    <div style={{ marginBottom: '16px' }}>
                        <Input
                            placeholder="Search appointments..."
                            prefix={<SearchOutlined />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            style={{ width: '100%' }}
                            size="large"
                        />
                    </div>

                    {/* Filter Toggle Button */}
                    <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                        <Button
                            type={filtersVisible ? "primary" : "default"}
                            icon={<FilterOutlined />}
                            onClick={() => setFiltersVisible(!filtersVisible)}
                            size="large"
                            style={{ width: '100%' }}
                        >
                            {filtersVisible ? 'Hide Filters' : 'Show Filters'}
                        </Button>
                    </div>

                    {/* Collapsible Filters */}
                    {filtersVisible && (
                        <div style={{
                            backgroundColor: '#f8f9fa',
                            padding: '16px',
                            borderRadius: '8px',
                            marginBottom: '16px'
                        }}>
                            <Select
                                value={statusFilter}
                                onChange={setStatusFilter}
                                style={{ width: '100%' }}
                                placeholder="Filter by status"
                                size="large"
                            >
                                <Option value="all">All Status</Option>
                                <Option value="Pending">Pending</Option>
                                <Option value="Scheduled">Scheduled</Option>
                                <Option value="Completed">Completed</Option>
                                <Option value="Cancelled">Cancelled</Option>
                                <Option value="Rescheduled">Rescheduled</Option>
                            </Select>
                        </div>
                    )}
                </div>
            );
        }

        // Desktop filters
        return (
            <Space>
                <Input
                    placeholder="Search appointments..."
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ width: 300 }}
                />
                <Select
                    value={statusFilter}
                    onChange={setStatusFilter}
                    style={{ width: 150 }}
                    placeholder="Filter by status"
                >
                    <Option value="all">All Status</Option>
                    <Option value="Pending">Pending</Option>
                    <Option value="Scheduled">Scheduled</Option>
                    <Option value="Completed">Completed</Option>
                    <Option value="Cancelled">Cancelled</Option>
                    <Option value="Rescheduled">Rescheduled</Option>
                </Select>
            </Space>
        );
    };

    const columns = [
        {
            title: 'Agent',
            dataIndex: 'agentName',
            key: 'agent',
            width: 150,
            render: (text, record) => (
                <Space>
                    <Avatar
                        size="small"
                        src={record.agent?.profilePicture}
                        icon={<UserOutlined />}
                    />
                    {text || 'Unknown Agent'}
                </Space>
            )
        },
        {
            title: 'Client',
            dataIndex: 'clientName',
            key: 'client',
            width: 150,
            render: (text) => text || 'Unknown Client'
        },
        {
            title: 'Property',
            dataIndex: 'propertyTitle',
            key: 'property',
            width: 200,
            render: (text, record) => (
                <Space direction="vertical" size={0}>
                    <div style={{ fontWeight: 500 }}>{text || 'Unknown Property'}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                        {record.propertyAddress || 'No address available'}
                    </div>
                </Space>
            )
        },
        {
            title: 'Schedule Time',
            dataIndex: 'scheduleTime',
            key: 'scheduleTime',
            width: 180,
            render: (time) => (
                <Space direction="vertical" size={0}>
                    <div>{moment(time).format('MMM DD, YYYY')}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                        {moment(time).format('hh:mm A')}
                    </div>
                </Space>
            ),
            sorter: (a, b) => moment(a.scheduleTime) - moment(b.scheduleTime)
        },
        {
            title: 'Meeting Type',
            dataIndex: 'meetingType',
            key: 'meetingType',
            width: 120,
            render: (type) => (
                <Tag color={type === 'Virtual' ? 'blue' : type === 'Phone' ? 'orange' : 'green'}>
                    {type || 'InPerson'}
                </Tag>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status) => (
                <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
                    {status}
                </Tag>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 200,
            render: (_, record) => {
                const availableActions = getAvailableActions(record);

                const actionMenu = (
                    <Menu>
                        {availableActions.map(action => (
                            <Menu.Item
                                key={action.key}
                                icon={action.icon}
                                onClick={action.onClick}
                                style={{ color: action.color }}
                            >
                                {action.label}
                            </Menu.Item>
                        ))}
                    </Menu>
                );

                return (
                    <Space size="small">
                        <Tooltip title="View Details">
                            <Button
                                icon={<EyeOutlined />}
                                size="small"
                                onClick={() => handleView(record)}
                            />
                        </Tooltip>

                        {/* Status Actions Dropdown */}
                        {availableActions.length > 0 && (
                            <Dropdown overlay={actionMenu} trigger={['click']}>
                                <Button
                                    icon={<MoreOutlined />}
                                    size="small"
                                />
                            </Dropdown>
                        )}

                        {record.canDelete && (
                            <Popconfirm
                                title="Are you sure to delete this appointment?"
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
                        )}
                    </Space>
                );
            }
        }
    ];

    const filteredAppointments = appointments.filter(appointment => {
        const matchesSearch = searchText === '' ||
            (appointment.agentName || '').toLowerCase().includes(searchText.toLowerCase()) ||
            (appointment.clientName || '').toLowerCase().includes(searchText.toLowerCase()) ||
            (appointment.propertyTitle || '').toLowerCase().includes(searchText.toLowerCase()) ||
            (appointment.scheduleNo || '').toLowerCase().includes(searchText.toLowerCase());

        const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: appointments.length,
        pending: appointments.filter(a => a.status === 'Pending').length,
        scheduled: appointments.filter(a => a.status === 'Scheduled').length,
        completed: appointments.filter(a => a.status === 'Completed').length,
        cancelled: appointments.filter(a => a.status === 'Cancelled').length,
        rescheduled: appointments.filter(a => a.status === 'Rescheduled').length
    };

    return (
        <div>
            {/* Statistics Cards - Responsive */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={12} sm={4}>
                    <Card size="small">
                        <Statistic
                            title="Total"
                            value={stats.total}
                            prefix={<CalendarOutlined />}
                            valueStyle={{ color: '#1a365d', fontSize: isMobile ? '16px' : '24px' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={4}>
                    <Card size="small">
                        <Statistic
                            title="Pending"
                            value={stats.pending}
                            prefix={<ClockCircleOutlined />}
                            valueStyle={{ color: '#faad14', fontSize: isMobile ? '16px' : '24px' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={4}>
                    <Card size="small">
                        <Statistic
                            title="Scheduled"
                            value={stats.scheduled}
                            prefix={<PlayCircleOutlined />}
                            valueStyle={{ color: '#1890ff', fontSize: isMobile ? '16px' : '24px' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={4}>
                    <Card size="small">
                        <Statistic
                            title="Completed"
                            value={stats.completed}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#52c41a', fontSize: isMobile ? '16px' : '24px' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={4}>
                    <Card size="small">
                        <Statistic
                            title="Cancelled"
                            value={stats.cancelled}
                            prefix={<CloseCircleOutlined />}
                            valueStyle={{ color: '#ff4d4f', fontSize: isMobile ? '16px' : '24px' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card>
                {/* Filters Section */}
                <div style={{
                    marginBottom: 16,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 16,
                    flexDirection: isMobile ? 'column' : 'row'
                }}>
                    {renderFilters()}
                </div>

                {/* Results Count */}
                <div style={{ marginBottom: 16, textAlign: isMobile ? 'center' : 'left' }}>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                        Showing {filteredAppointments.length} of {appointments.length} appointments
                    </div>
                </div>

                {renderErrorAlert()}

                {/* Conditional Rendering: Table for Desktop, Cards for Mobile */}
                {!isMobile ? (
                    <BaseTable
                        data={filteredAppointments}
                        columns={columns}
                        loading={loading}
                        rowKey="id"
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showQuickJumper: true,
                        }}
                    />
                ) : (
                    <div>
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '40px' }}>
                                Loading appointments...
                            </div>
                        ) : (
                            <div>
                                {filteredAppointments.map(appointment => renderMobileCard(appointment))}
                            </div>
                        )}
                    </div>
                )}
            </Card>

            {/* Cancel Confirmation Modal */}
            <Modal
                title="Cancel Appointment"
                open={statusModalVisible}
                onCancel={() => setStatusModalVisible(false)}
                footer={null}
                width={isMobile ? '100%' : 500}
                style={isMobile ? { top: 0, padding: 0 } : {}}
            >
                <Form
                    layout="vertical"
                    onFinish={handleStatusSubmit}
                >
                    <Form.Item
                        name="reason"
                        label="Reason for Cancellation (Optional)"
                    >
                        <TextArea
                            rows={4}
                            placeholder="Enter reason for cancellation..."
                        />
                    </Form.Item>

                    <Form.Item style={{ textAlign: 'right' }}>
                        <Space>
                            <Button onClick={() => setStatusModalVisible(false)}>
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                danger
                                htmlType="submit"
                                icon={<CloseCircleOutlined />}
                            >
                                Cancel Appointment
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Reschedule Modal */}
            <Modal
                title="Reschedule Appointment"
                open={rescheduleModalVisible}
                onCancel={() => setRescheduleModalVisible(false)}
                footer={null}
                width={isMobile ? '100%' : 500}
                style={isMobile ? { top: 0, padding: 0 } : {}}
            >
                <Form
                    form={rescheduleForm}
                    layout="vertical"
                    onFinish={handleRescheduleSubmit}
                >
                    <Form.Item
                        name="newScheduleTime"
                        label="New Schedule Date & Time"
                        rules={[{ required: true, message: 'Please select new date and time' }]}
                    >
                        <DatePicker
                            showTime
                            format="YYYY-MM-DD HH:mm"
                            style={{ width: '100%' }}
                            placeholder="Select new date and time"
                        />
                    </Form.Item>

                    <Form.Item
                        name="reason"
                        label="Reason for Rescheduling (Optional)"
                    >
                        <TextArea
                            rows={3}
                            placeholder="Enter reason for rescheduling..."
                        />
                    </Form.Item>

                    <Form.Item style={{ textAlign: 'right' }}>
                        <Space>
                            <Button onClick={() => setRescheduleModalVisible(false)}>
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                icon={<SyncOutlined />}
                            >
                                Reschedule
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* View Details Modal */}
            <Modal
                title="Appointment Details"
                open={viewModalVisible}
                onCancel={() => setViewModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setViewModalVisible(false)}>
                        Close
                    </Button>
                ]}
                width={isMobile ? '100%' : 600}
                style={isMobile ? { top: 0, padding: 0 } : {}}
            >
                {selectedAppointment && (
                    <div>
                        <Row gutter={16} style={{ marginBottom: 16 }}>
                            <Col span={isMobile ? 24 : 12}>
                                <strong>Schedule No:</strong>
                                <div>{selectedAppointment.scheduleNo}</div>
                            </Col>
                            <Col span={isMobile ? 24 : 12}>
                                <strong>Status:</strong>
                                <div>
                                    <Tag color={getStatusColor(selectedAppointment.status)}>
                                        {selectedAppointment.status}
                                    </Tag>
                                </div>
                            </Col>
                        </Row>
                        <Row gutter={16} style={{ marginBottom: 16 }}>
                            <Col span={isMobile ? 24 : 12}>
                                <strong>Agent:</strong>
                                <div>{selectedAppointment.agentName}</div>
                            </Col>
                            <Col span={isMobile ? 24 : 12}>
                                <strong>Client:</strong>
                                <div>{selectedAppointment.clientName}</div>
                            </Col>
                        </Row>
                        <Row gutter={16} style={{ marginBottom: 16 }}>
                            <Col span={24}>
                                <strong>Property:</strong>
                                <div>{selectedAppointment.propertyTitle}</div>
                                <div style={{ color: '#666', fontSize: '12px' }}>
                                    {selectedAppointment.propertyAddress}
                                </div>
                            </Col>
                        </Row>
                        <Row gutter={16} style={{ marginBottom: 16 }}>
                            <Col span={isMobile ? 24 : 12}>
                                <strong>Schedule Time:</strong>
                                <div>{moment(selectedAppointment.scheduleTime).format('MMM DD, YYYY hh:mm A')}</div>
                            </Col>
                            <Col span={isMobile ? 24 : 12}>
                                <strong>Meeting Type:</strong>
                                <div>
                                    <Tag color={selectedAppointment.meetingType === 'Virtual' ? 'blue' : selectedAppointment.meetingType === 'Phone' ? 'orange' : 'green'}>
                                        {selectedAppointment.meetingType}
                                    </Tag>
                                </div>
                            </Col>
                        </Row>
                        {selectedAppointment.meetingLocation && (
                            <Row gutter={16} style={{ marginBottom: 16 }}>
                                <Col span={24}>
                                    <strong>Meeting Location:</strong>
                                    <div>{selectedAppointment.meetingLocation}</div>
                                </Col>
                            </Row>
                        )}
                        {selectedAppointment.notes && (
                            <Row gutter={16}>
                                <Col span={24}>
                                    <strong>Notes:</strong>
                                    <div style={{
                                        background: '#f5f5f5',
                                        padding: '12px',
                                        borderRadius: '6px',
                                        marginTop: '8px'
                                    }}>
                                        {selectedAppointment.notes}
                                    </div>
                                </Col>
                            </Row>
                        )}
                        {selectedAppointment.cancellationReason && (
                            <Row gutter={16}>
                                <Col span={24}>
                                    <strong>Cancellation Reason:</strong>
                                    <div style={{
                                        background: '#fff2f0',
                                        padding: '12px',
                                        borderRadius: '6px',
                                        marginTop: '8px',
                                        border: '1px solid #ffccc7'
                                    }}>
                                        {selectedAppointment.cancellationReason}
                                    </div>
                                </Col>
                            </Row>
                        )}
                        {selectedAppointment.rescheduleReason && (
                            <Row gutter={16}>
                                <Col span={24}>
                                    <strong>Reschedule Reason:</strong>
                                    <div style={{
                                        background: '#fff7e6',
                                        padding: '12px',
                                        borderRadius: '6px',
                                        marginTop: '8px',
                                        border: '1px solid #ffd591'
                                    }}>
                                        {selectedAppointment.rescheduleReason}
                                    </div>
                                </Col>
                            </Row>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ScheduleAppointments;