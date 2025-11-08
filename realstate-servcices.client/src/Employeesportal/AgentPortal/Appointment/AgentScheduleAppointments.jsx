// AgentScheduleAppointments.jsx
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
    TimePicker,
    message,
    Tooltip,
    Avatar,
    Row,
    Col,
    Popconfirm,
    Badge,
    Alert,
    Spin,
    Result,
    Empty,
    List,
    Divider
} from 'antd';
import {
    SearchOutlined,
    EditOutlined,
    EyeOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    UserOutlined,
    HomeOutlined,
    MessageOutlined,
    CloseOutlined,
    ReloadOutlined,
    ExclamationCircleOutlined,
    PhoneOutlined,
    MailOutlined,
    VideoCameraOutlined,
    EnvironmentOutlined,
    InfoCircleOutlined,
    CalendarOutlined,
    SaveOutlined
} from '@ant-design/icons';
import BaseTable from './BaseTable';
import moment from 'moment';
import { SchedulePropertiesService } from '../../AdminPortal/appointment/Services/index.js';
import authService from '../../../Authpage/Services/LoginAuth';
import clientService from '../../AdminPortal/Creation_Agent/Services/ClientService';
import propertyService from '../../AdminPortal/Creation_Property/services/propertyService';

const { Option } = Select;
const { TextArea } = Input;

const AgentScheduleAppointments = ({ onScheduleUpdate }) => {
    const [appointments, setAppointments] = useState([]);
    const [clients, setClients] = useState([]);
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingClients, setLoadingClients] = useState(false);
    const [loadingProperties, setLoadingProperties] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [chatModalVisible, setChatModalVisible] = useState(false);
    const [meetingDetailsModalVisible, setMeetingDetailsModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [form] = Form.useForm();
    const [editForm] = Form.useForm();
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const [editLoading, setEditLoading] = useState(false);

    // Create service instance
    const scheduleService = new SchedulePropertiesService();

    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        await Promise.all([
            loadAppointments(),
            loadClients(),
            loadProperties()
        ]);
    };

    const loadClients = async () => {
        setLoadingClients(true);
        try {
            const currentUser = authService.getCurrentUser();
            const agentId = currentUser?.userId;

            if (!agentId) {
                throw new Error('Unable to determine agent ID. Please log in again.');
            }

            console.log('Fetching clients for agent:', agentId);

            // Using the client service to get all clients
            const clientsData = await clientService.getClients();
            console.log('Clients data:', clientsData);

            setClients(clientsData || []);
        } catch (error) {
            console.error('Error loading clients:', error);
            message.warning('Failed to load clients data');
            setClients([]);
        } finally {
            setLoadingClients(false);
        }
    };

    const loadProperties = async () => {
        setLoadingProperties(true);
        try {
            const currentUser = authService.getCurrentUser();
            const agentId = currentUser?.userId;

            if (!agentId) {
                throw new Error('Unable to determine agent ID. Please log in again.');
            }

            console.log('Fetching properties for agent:', agentId);

            // Using the property service to get all properties
            const propertiesData = await propertyService.getAllProperties();
            console.log('Properties data:', propertiesData);

            setProperties(propertiesData || []);
        } catch (error) {
            console.error('Error loading properties:', error);
            message.warning('Failed to load properties data');
            setProperties([]);
        } finally {
            setLoadingProperties(false);
        }
    };

    const loadAppointments = async () => {
        setLoading(true);
        setError(null);
        try {
            const currentUser = authService.getCurrentUser();
            const agentId = currentUser?.userId;

            if (!agentId) {
                throw new Error('Unable to determine agent ID. Please log in again.');
            }

            console.log('Fetching appointments for agent:', agentId);

            // Use the service instance
            const result = await scheduleService.getSchedulesByAgent(parseInt(agentId));

            console.log('Raw API response:', result);

            if (!result || !Array.isArray(result)) {
                console.warn('No appointments found or invalid response format');
                setAppointments([]);
                return;
            }

            // Enhanced data formatting with client and property integration
            const formattedAppointments = await Promise.all(
                result.map(async (appointment, index) => {
                    // Find client data from clients state
                    const clientData = clients.find(client =>
                        client.id === appointment.clientId ||
                        client.baseMemberId === appointment.clientId
                    );

                    // Find property data from properties state
                    const propertyData = properties.find(property =>
                        property.id === appointment.propertyId
                    );

                    // Enhanced client info with multiple fallbacks
                    const clientName = appointment.clientName ||
                        (clientData ?
                            `${clientData.firstName || ''} ${clientData.lastName || ''}`.trim() :
                            (appointment.client ?
                                `${appointment.client.firstName || ''} ${appointment.client.lastName || ''}`.trim() :
                                'Unknown Client'));

                    const clientPhone = appointment.clientPhone ||
                        clientData?.cellPhoneNo ||
                        appointment.client?.phone ||
                        'N/A';

                    const clientEmail = clientData?.email ||
                        appointment.client?.email ||
                        '';

                    // Enhanced property info with multiple fallbacks
                    const propertyTitle = appointment.propertyTitle ||
                        propertyData?.title ||
                        appointment.property?.title ||
                        'Unknown Property';

                    const propertyAddress = appointment.propertyAddress ||
                        propertyData?.address ||
                        appointment.property?.address ||
                        'No address';

                    // Format schedule number to be more readable
                    const scheduleNo = appointment.scheduleNo || `SCH-${appointment.id || index + 1}`;
                    const formattedScheduleNo = scheduleNo.length > 12
                        ? `${scheduleNo.substring(0, 10)}...`
                        : scheduleNo;

                    return {
                        ...appointment,
                        key: appointment.id || `appt-${index}`,
                        id: appointment.id || index + 1,
                        unreadMessages: appointment.unreadMessages || Math.floor(Math.random() * 3),

                        // Enhanced client object with integrated data
                        client: {
                            ...clientData,
                            ...appointment.client,
                            name: clientName,
                            phone: clientPhone,
                            email: clientEmail
                        },

                        // Enhanced property object with integrated data
                        property: {
                            ...propertyData,
                            ...appointment.property,
                            title: propertyTitle,
                            address: propertyAddress
                        },

                        // Direct fields for easy table access
                        clientName: clientName,
                        clientPhone: clientPhone,
                        clientEmail: clientEmail,
                        propertyTitle: propertyTitle,
                        propertyAddress: propertyAddress,

                        scheduleNo: scheduleNo,
                        formattedScheduleNo: formattedScheduleNo,
                        status: appointment.status || 'Scheduled',
                        scheduleTime: appointment.scheduleTime || new Date().toISOString(),
                        notes: appointment.notes || '',

                        // Meeting details
                        meetingType: appointment.meetingType || 'InPerson',
                        meetingLocation: appointment.meetingLocation || '',
                        virtualMeetingLink: appointment.virtualMeetingLink || '',

                        // Store IDs for reference
                        clientId: appointment.clientId || clientData?.id,
                        propertyId: appointment.propertyId || propertyData?.id
                    };
                })
            );

            console.log('Formatted appointments with integrated data:', formattedAppointments);

            setAppointments(formattedAppointments);
            onScheduleUpdate?.();

        } catch (error) {
            console.error('Error loading appointments:', error);
            const errorMessage = error.message || 'Failed to load appointments';
            setError(errorMessage);
            message.error(errorMessage);

            // Set empty array on error to prevent table issues
            setAppointments([]);
        } finally {
            setLoading(false);
        }
    };

    const handleView = (appointment) => {
        setSelectedAppointment(appointment);
        setViewModalVisible(true);
    };

    const handleChat = (appointment) => {
        setSelectedAppointment(appointment);
        loadChatMessages(appointment.id);
        setChatModalVisible(true);
    };

    const handleMeetingDetails = (appointment) => {
        setSelectedAppointment(appointment);
        setMeetingDetailsModalVisible(true);
    };

    const handleEdit = (appointment) => {
        setSelectedAppointment(appointment);
        // Pre-fill the form with existing data
        editForm.setFieldsValue({
            meetingType: appointment.meetingType || 'InPerson',
            meetingLocation: appointment.meetingLocation || '',
            virtualMeetingLink: appointment.virtualMeetingLink || '',
            notes: appointment.notes || ''
        });
        setEditModalVisible(true);
    };

    const handleEditSubmit = async (values) => {
        setEditLoading(true);
        try {
            if (!selectedAppointment) {
                throw new Error('No appointment selected for editing');
            }

            console.log('Updating appointment with values:', values);

            // Prepare update data
            const updateData = {
                ...selectedAppointment,
                meetingType: values.meetingType,
                meetingLocation: values.meetingLocation,
                virtualMeetingLink: values.virtualMeetingLink,
                notes: values.notes
            };

            // Call the update service
            const result = await scheduleService.updateSchedule(selectedAppointment.id, updateData);

            if (result && result.success) {
                message.success('Appointment updated successfully');
                setEditModalVisible(false);
                loadAppointments(); // Refresh the data
            } else {
                throw new Error(result?.message || 'Failed to update appointment');
            }
        } catch (error) {
            console.error('Error updating appointment:', error);
            message.error(error.message || 'Failed to update appointment');
        } finally {
            setEditLoading(false);
        }
    };

    const loadChatMessages = async (appointmentId) => {
        try {
            // Mock chat messages for demo
            const mockMessages = [
                {
                    id: 1,
                    appointmentId: appointmentId,
                    sender: 'client',
                    message: 'Hi, I\'m looking forward to the viewing tomorrow!',
                    timestamp: new Date(Date.now() - 3600000).toISOString(),
                    read: true
                },
                {
                    id: 2,
                    appointmentId: appointmentId,
                    sender: 'agent',
                    message: 'Great! The property is ready for viewing. Please bring your ID.',
                    timestamp: new Date(Date.now() - 1800000).toISOString(),
                    read: true
                },
                {
                    id: 3,
                    appointmentId: appointmentId,
                    sender: 'client',
                    message: 'Perfect, I\'ll see you then!',
                    timestamp: new Date().toISOString(),
                    read: false
                }
            ];
            setChatMessages(mockMessages);
        } catch (error) {
            console.error('Error loading chat messages:', error);
            message.error('Failed to load chat messages');
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        try {
            const newMessageObj = {
                id: chatMessages.length + 1,
                appointmentId: selectedAppointment.id,
                sender: 'agent',
                message: newMessage,
                timestamp: new Date().toISOString(),
                read: true
            };

            setChatMessages([...chatMessages, newMessageObj]);
            setNewMessage('');

            message.success('Message sent successfully');
        } catch (error) {
            message.error('Failed to send message');
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        setActionLoading(id);
        try {
            let result;
            if (newStatus === 'Completed') {
                result = await scheduleService.completeSchedule(id);
            } else if (newStatus === 'Cancelled') {
                result = await scheduleService.cancelSchedule(id);
            }

            if (result) {
                message.success(`Appointment ${newStatus.toLowerCase()} successfully`);
                loadAppointments();
            } else {
                throw new Error('Failed to update appointment status');
            }
        } catch (error) {
            console.error('Error updating appointment status:', error);
            const errorMessage = error.message || 'Failed to update appointment status';
            message.error(errorMessage);
            setError(errorMessage);
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'Scheduled': 'blue',
            'Completed': 'green',
            'Cancelled': 'red',
            'Rescheduled': 'orange'
        };
        return colors[status] || 'default';
    };

    const getMeetingTypeColor = (meetingType) => {
        const colors = {
            'InPerson': 'green',
            'Virtual': 'blue',
            'Phone': 'orange',
            'Hybrid': 'purple'
        };
        return colors[meetingType] || 'default';
    };

    const getMeetingTypeIcon = (meetingType) => {
        const icons = {
            'InPerson': <UserOutlined />,
            'Virtual': <VideoCameraOutlined />,
            'Phone': <PhoneOutlined />,
            'Hybrid': <EnvironmentOutlined />
        };
        return icons[meetingType] || <InfoCircleOutlined />;
    };

    // Enhanced search function
    const filteredAppointments = appointments.filter(appointment => {
        const clientName = appointment.clientName || appointment.client?.name || '';
        const propertyTitle = appointment.propertyTitle || appointment.property?.title || '';
        const scheduleNo = appointment.scheduleNo || '';
        const status = appointment.status || '';

        const matchesSearch = searchText === '' ||
            clientName.toLowerCase().includes(searchText.toLowerCase()) ||
            propertyTitle.toLowerCase().includes(searchText.toLowerCase()) ||
            scheduleNo.toLowerCase().includes(searchText.toLowerCase()) ||
            status.toLowerCase().includes(searchText.toLowerCase());

        const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const ErrorIndicator = ({ message, onRetry }) => (
        <Result
            status="error"
            title="Failed to Load Appointments"
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
            <div style={{ marginTop: 16 }}>Loading your appointments...</div>
        </div>
    );

    const columns = [
        {
            title: 'Schedule No',
            dataIndex: 'formattedScheduleNo',
            key: 'scheduleNo',
            width: 100,
            render: (formattedText, record) => (
                <Tooltip title={record.scheduleNo}>
                    <Tag color="blue" style={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {formattedText}
                    </Tag>
                </Tooltip>
            )
        },
        {
            title: 'Client',
            dataIndex: 'client',
            key: 'client',
            width: 150,
            render: (client, record) => (
                <Space>
                    <Avatar size="small" icon={<UserOutlined />} />
                    <div>
                        <div style={{ fontWeight: 500 }}>
                            {record.clientName || client?.name || 'Unknown Client'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                            {record.clientPhone || client?.phone || 'N/A'}
                        </div>
                    </div>
                    {record.unreadMessages > 0 && (
                        <Badge count={record.unreadMessages} size="small" />
                    )}
                </Space>
            )
        },
        {
            title: 'Property',
            dataIndex: 'property',
            key: 'property',
            width: 180,
            render: (property, record) => (
                <Space direction="vertical" size={0}>
                    <div style={{ fontWeight: 500 }}>
                        {record.propertyTitle || property?.title || 'Unknown Property'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                        {record.propertyAddress || property?.address || 'No address'}
                    </div>
                </Space>
            )
        },
        {
            title: 'Schedule Time',
            dataIndex: 'scheduleTime',
            key: 'scheduleTime',
            width: 150,
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
            render: (meetingType) => (
                <Tag
                    color={getMeetingTypeColor(meetingType)}
                    icon={getMeetingTypeIcon(meetingType)}
                >
                    {meetingType}
                </Tag>
            )
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
            title: 'Actions',
            key: 'actions',
            width: 240,
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="View Details">
                        <Button
                            icon={<EyeOutlined />}
                            size="small"
                            onClick={() => handleView(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Meeting Details">
                        <Button
                            icon={<CalendarOutlined />}
                            size="small"
                            type="default"
                            onClick={() => handleMeetingDetails(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Edit Meeting Details">
                        <Button
                            icon={<EditOutlined />}
                            size="small"
                            type="dashed"
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Chat with Client">
                        <Badge dot={record.unreadMessages > 0}>
                            <Button
                                icon={<MessageOutlined />}
                                size="small"
                                type="default"
                                onClick={() => handleChat(record)}
                            />
                        </Badge>
                    </Tooltip>
                    {record.status === 'Scheduled' && (
                        <>
                            <Tooltip title="Mark Complete">
                                <Button
                                    icon={<CheckCircleOutlined />}
                                    size="small"
                                    type="primary"
                                    loading={actionLoading === record.id}
                                    onClick={() => handleStatusChange(record.id, 'Completed')}
                                />
                            </Tooltip>
                            <Popconfirm
                                title="Are you sure to cancel this appointment?"
                                onConfirm={() => handleStatusChange(record.id, 'Cancelled')}
                                okText="Yes"
                                cancelText="No"
                                okButtonProps={{ loading: actionLoading === record.id }}
                            >
                                <Tooltip title="Cancel">
                                    <Button
                                        icon={<CloseCircleOutlined />}
                                        size="small"
                                        danger
                                        loading={actionLoading === record.id}
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
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 16
                }}>
                    <Space>
                        <Input
                            placeholder="Search appointments by client, property, or schedule no..."
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
                            <Option value="Scheduled">Scheduled</Option>
                            <Option value="Completed">Completed</Option>
                            <Option value="Cancelled">Cancelled</Option>
                            <Option value="Rescheduled">Rescheduled</Option>
                        </Select>
                    </Space>
                 
                </div>

                {(loadingClients || loadingProperties) && (
                    <Alert
                        message="Loading additional data..."
                        description="Fetching client and property information..."
                        type="info"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />
                )}

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
                                onClick={loadAllData}
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
                    <ErrorIndicator message={error} onRetry={loadAllData} />
                ) : (
                    <BaseTable
                        dataSource={filteredAppointments}
                        columns={columns}
                        loading={loading}
                        rowKey="key"
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showQuickJumper: true,
                        }}
                        locale={{
                            emptyText: (
                                <Empty
                                    description="No appointments found"
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                >
                                    <Button
                                        type="primary"
                                        icon={<ReloadOutlined />}
                                        onClick={loadAllData}
                                    >
                                        Refresh
                                    </Button>
                                </Empty>
                            )
                        }}
                    />
                )}
            </Card>

            {/* View Modal */}
            <Modal
                title="Appointment Details"
                open={viewModalVisible}
                onCancel={() => setViewModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setViewModalVisible(false)}>
                        Close
                    </Button>
                ]}
                width={600}
            >
                {selectedAppointment && (
                    <div>
                        <Row gutter={16} style={{ marginBottom: 16 }}>
                            <Col span={12}>
                                <strong>Schedule No:</strong>
                                <div>{selectedAppointment.scheduleNo}</div>
                            </Col>
                            <Col span={12}>
                                <strong>Status:</strong>
                                <div>
                                    <Tag color={getStatusColor(selectedAppointment.status)}>
                                        {selectedAppointment.status}
                                    </Tag>
                                </div>
                            </Col>
                        </Row>

                        <Divider orientation="left">Client Information</Divider>
                        <Row gutter={16} style={{ marginBottom: 16 }}>
                            <Col span={12}>
                                <strong>Client Name:</strong>
                                <div>{selectedAppointment.clientName || selectedAppointment.client?.name || 'N/A'}</div>
                            </Col>
                            <Col span={12}>
                                <strong>Contact:</strong>
                                <div>
                                    <Space direction="vertical" size={0}>
                                        <div>
                                            <PhoneOutlined /> {selectedAppointment.clientPhone || selectedAppointment.client?.phone || 'N/A'}
                                        </div>
                                        {selectedAppointment.clientEmail && (
                                            <div>
                                                <MailOutlined /> {selectedAppointment.clientEmail}
                                            </div>
                                        )}
                                    </Space>
                                </div>
                            </Col>
                        </Row>

                        <Divider orientation="left">Property Information</Divider>
                        <Row gutter={16} style={{ marginBottom: 16 }}>
                            <Col span={24}>
                                <strong>Property:</strong>
                                <div>{selectedAppointment.propertyTitle || selectedAppointment.property?.title || 'N/A'}</div>
                            </Col>
                            <Col span={24}>
                                <strong>Address:</strong>
                                <div>{selectedAppointment.propertyAddress || selectedAppointment.property?.address || 'N/A'}</div>
                            </Col>
                            {selectedAppointment.property?.price && (
                                <Col span={24}>
                                    <strong>Price:</strong>
                                    <div>${selectedAppointment.property.price.toLocaleString()}</div>
                                </Col>
                            )}
                        </Row>

                        <Divider orientation="left">Appointment Details</Divider>
                        <Row gutter={16} style={{ marginBottom: 16 }}>
                            <Col span={12}>
                                <strong>Date & Time:</strong>
                                <div>
                                    {moment(selectedAppointment.scheduleTime).format('MMMM DD, YYYY hh:mm A')}
                                </div>
                            </Col>
                            <Col span={12}>
                                <strong>Duration:</strong>
                                <div>60 minutes</div>
                            </Col>
                        </Row>

                        {selectedAppointment.notes && (
                            <>
                                <Divider orientation="left">Notes</Divider>
                                <div style={{
                                    background: '#f5f5f5',
                                    padding: '12px',
                                    borderRadius: '6px',
                                    marginBottom: '16px'
                                }}>
                                    {selectedAppointment.notes}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </Modal>

            {/* Meeting Details Modal */}
            <Modal
                title={
                    <Space>
                        <CalendarOutlined />
                        Meeting Details - {selectedAppointment?.scheduleNo}
                    </Space>
                }
                open={meetingDetailsModalVisible}
                onCancel={() => setMeetingDetailsModalVisible(false)}
                footer={[
                    <Button
                        key="edit"
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => {
                            setMeetingDetailsModalVisible(false);
                            handleEdit(selectedAppointment);
                        }}
                    >
                        Edit Details
                    </Button>,
                    <Button key="close" onClick={() => setMeetingDetailsModalVisible(false)}>
                        Close
                    </Button>
                ]}
                width={500}
            >
                {selectedAppointment && (
                    <div>
                        <Row gutter={16} style={{ marginBottom: 16 }}>
                            <Col span={24}>
                                <strong>Meeting Type:</strong>
                                <div style={{ marginTop: 8 }}>
                                    <Tag
                                        color={getMeetingTypeColor(selectedAppointment.meetingType)}
                                        icon={getMeetingTypeIcon(selectedAppointment.meetingType)}
                                        style={{ fontSize: '14px', padding: '4px 8px' }}
                                    >
                                        {selectedAppointment.meetingType || 'Not specified'}
                                    </Tag>
                                </div>
                            </Col>
                        </Row>

                        {selectedAppointment.meetingLocation && (
                            <Row gutter={16} style={{ marginBottom: 16 }}>
                                <Col span={24}>
                                    <strong>
                                        <EnvironmentOutlined /> Meeting Location:
                                    </strong>
                                    <div style={{
                                        marginTop: 8,
                                        padding: '8px 12px',
                                        background: '#f5f5f5',
                                        borderRadius: '6px',
                                        border: '1px solid #d9d9d9'
                                    }}>
                                        {selectedAppointment.meetingLocation}
                                    </div>
                                </Col>
                            </Row>
                        )}

                        {selectedAppointment.virtualMeetingLink && (
                            <Row gutter={16} style={{ marginBottom: 16 }}>
                                <Col span={24}>
                                    <strong>
                                        <VideoCameraOutlined /> Virtual Meeting Link:
                                    </strong>
                                    <div style={{ marginTop: 8 }}>
                                        <Button
                                            type="link"
                                            href={selectedAppointment.virtualMeetingLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            icon={<VideoCameraOutlined />}
                                            style={{ padding: 0, height: 'auto' }}
                                        >
                                            {selectedAppointment.virtualMeetingLink.length > 50
                                                ? `${selectedAppointment.virtualMeetingLink.substring(0, 50)}...`
                                                : selectedAppointment.virtualMeetingLink
                                            }
                                        </Button>
                                    </div>
                                </Col>
                            </Row>
                        )}

                        {selectedAppointment.notes && (
                            <Row gutter={16} style={{ marginBottom: 16 }}>
                                <Col span={24}>
                                    <strong>Additional Notes:</strong>
                                    <div style={{
                                        marginTop: 8,
                                        padding: '12px',
                                        background: '#f9f9f9',
                                        borderRadius: '6px',
                                        border: '1px solid #e8e8e8'
                                    }}>
                                        {selectedAppointment.notes}
                                    </div>
                                </Col>
                            </Row>
                        )}

                        {!selectedAppointment.meetingLocation && !selectedAppointment.virtualMeetingLink && !selectedAppointment.notes && (
                            <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                                <InfoCircleOutlined style={{ fontSize: '24px', marginBottom: 8 }} />
                                <div>No additional meeting details provided</div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* Edit Meeting Details Modal */}
            <Modal
                title={
                    <Space>
                        <EditOutlined />
                        Edit Meeting Details - {selectedAppointment?.scheduleNo}
                    </Space>
                }
                open={editModalVisible}
                onCancel={() => setEditModalVisible(false)}
                footer={[
                    <Button key="cancel" onClick={() => setEditModalVisible(false)}>
                        Cancel
                    </Button>,
                    <Button
                        key="save"
                        type="primary"
                        icon={<SaveOutlined />}
                        loading={editLoading}
                        onClick={() => editForm.submit()}
                    >
                        Save Changes
                    </Button>
                ]}
                width={500}
            >
                <Form
                    form={editForm}
                    layout="vertical"
                    onFinish={handleEditSubmit}
                >
                    <Form.Item
                        name="meetingType"
                        label="Meeting Type"
                        rules={[{ required: true, message: 'Please select a meeting type' }]}
                    >
                        <Select placeholder="Select meeting type">
                            <Option value="InPerson">In Person</Option>
                            <Option value="Virtual">Virtual</Option>
                            <Option value="Phone">Phone</Option>
                            <Option value="Hybrid">Hybrid</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="meetingLocation"
                        label="Meeting Location"
                    >
                        <Input
                            placeholder="Enter meeting location or address"
                            prefix={<EnvironmentOutlined />}
                        />
                    </Form.Item>

                    <Form.Item
                        name="virtualMeetingLink"
                        label="Virtual Meeting Link"
                    >
                        <Input
                            placeholder="Enter virtual meeting URL (Zoom, Teams, etc.)"
                            prefix={<VideoCameraOutlined />}
                        />
                    </Form.Item>

                    <Form.Item
                        name="notes"
                        label="Additional Notes"
                    >
                        <TextArea
                            placeholder="Enter any additional notes or instructions"
                            rows={4}
                        />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Chat Modal */}
            <Modal
                title={
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                        <Space>
                            <MessageOutlined />
                            Chat with {selectedAppointment?.clientName || selectedAppointment?.client?.name}
                            <Tag color="blue">{selectedAppointment?.formattedScheduleNo}</Tag>
                        </Space>
                        <Button
                            type="text"
                            icon={<CloseOutlined />}
                            onClick={() => setChatModalVisible(false)}
                            size="small"
                        />
                    </Space>
                }
                open={chatModalVisible}
                onCancel={() => setChatModalVisible(false)}
                footer={null}
                width={400}
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    top: 'auto',
                    left: 'auto',
                    margin: 0,
                    height: '500px',
                    display: 'flex',
                    flexDirection: 'column'
                }}
                bodyStyle={{
                    padding: 0,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {selectedAppointment && (
                    <div style={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        background: 'white'
                    }}>
                        {/* Chat Header */}
                        <div style={{
                            padding: '16px',
                            borderBottom: '1px solid #f0f0f0',
                            background: '#fafafa'
                        }}>
                            <div style={{ fontWeight: 'bold' }}>
                                {selectedAppointment.clientName || selectedAppointment.client?.name}
                            </div>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                                {selectedAppointment.propertyTitle || selectedAppointment.property?.title}
                            </div>
                        </div>

                        {/* Chat Messages */}
                        <div style={{
                            flex: 1,
                            padding: '16px',
                            overflowY: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                        }}>
                            {chatMessages.map(message => (
                                <div
                                    key={message.id}
                                    style={{
                                        display: 'flex',
                                        justifyContent: message.sender === 'agent' ? 'flex-end' : 'flex-start'
                                    }}
                                >
                                    <div
                                        style={{
                                            maxWidth: '80%',
                                            padding: '8px 12px',
                                            borderRadius: '12px',
                                            background: message.sender === 'agent' ? '#1890ff' : '#f0f0f0',
                                            color: message.sender === 'agent' ? 'white' : 'black'
                                        }}
                                    >
                                        {message.message}
                                        <div style={{
                                            fontSize: '10px',
                                            marginTop: '4px',
                                            opacity: 0.7
                                        }}>
                                            {moment(message.timestamp).format('HH:mm')}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Chat Input */}
                        <div style={{
                            padding: '16px',
                            borderTop: '1px solid #f0f0f0'
                        }}>
                            <Space.Compact style={{ width: '100%' }}>
                                <Input
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    onPressEnter={handleSendMessage}
                                />
                                <Button
                                    type="primary"
                                    onClick={handleSendMessage}
                                    disabled={!newMessage.trim()}
                                >
                                    Send
                                </Button>
                            </Space.Compact>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AgentScheduleAppointments;