// AgentScheduleAppointments.jsx - Complete with fixed update functionality
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
    Divider,
    Grid,
    App
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
    SaveOutlined,
    ClockCircleOutlined,
    CheckOutlined,
    MoreOutlined,
    SyncOutlined,
    PlayCircleOutlined
} from '@ant-design/icons';
import BaseTable from './BaseTable';
import moment from 'moment';
import { SchedulePropertiesService } from '../../AdminPortal/appointment/Services/index.js';
import authService from '../../../Authpage/Services/LoginAuth';
import clientService from '../../AdminPortal/Creation_Agent/Services/ClientService';
import propertyService from '../../AdminPortal/Creation_Property/services/propertyService';
import agentService from '../../AdminPortal/Creation_Agent/Services/AgentService';

const { Option } = Select;
const { TextArea } = Input;
const { useBreakpoint } = Grid;

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
    const [cancelModalVisible, setCancelModalVisible] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [form] = Form.useForm();
    const [editForm] = Form.useForm();
    const [cancelForm] = Form.useForm();
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const [editLoading, setEditLoading] = useState(false);
    const [currentAgentId, setCurrentAgentId] = useState(null);
    const screens = useBreakpoint();
    const isMobile = !screens.md;

    // Create service instance
    const scheduleService = new SchedulePropertiesService();

    // Helper function to get the actual agent ID from base member ID
    const getCurrentAgentId = async () => {
        try {
            const currentUser = authService.getCurrentUser();
            const baseMemberId = currentUser?.userId;

            if (!baseMemberId) {
                throw new Error('Unable to determine user ID. Please log in again.');
            }

            console.log('Getting agent ID for base member:', baseMemberId);

            // Get the agent by base member ID to get the actual agent ID
            const agent = await agentService.getAgentByBaseMemberId(baseMemberId);

            if (!agent || !agent.id) {
                throw new Error('Agent profile not found. Please complete your agent profile first.');
            }

            console.log('Found agent ID:', agent.id);
            return agent.id;
        } catch (error) {
            console.error('Error getting current agent ID:', error);
            throw new Error('Failed to retrieve agent information: ' + error.message);
        }
    };

    // Enhanced agent ID retrieval with caching
    const getAgentId = async (forceRefresh = false) => {
        if (currentAgentId && !forceRefresh) {
            return currentAgentId;
        }

        try {
            const agentId = await getCurrentAgentId();
            setCurrentAgentId(agentId);
            return agentId;
        } catch (error) {
            console.error('Failed to get agent ID:', error);
            throw error;
        }
    };

    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        try {
            await Promise.all([
                loadAppointments(),
                loadClients(),
                loadProperties()
            ]);
        } catch (error) {
            console.error('Error loading all data:', error);
            message.error('Failed to load data: ' + error.message);
        }
    };

    const loadClients = async () => {
        setLoadingClients(true);
        try {
            const agentId = await getAgentId();
            console.log('Fetching clients for agent:', agentId);

            // Using the client service to get all clients
            const clientsData = await clientService.getClients();
            console.log('Clients data:', clientsData);

            setClients(clientsData || []);
        } catch (error) {
            console.error('Error loading clients:', error);
            message.warning('Failed to load clients data: ' + error.message);
            setClients([]);
        } finally {
            setLoadingClients(false);
        }
    };

    const loadProperties = async () => {
        setLoadingProperties(true);
        try {
            const agentId = await getAgentId();
            console.log('Fetching properties for agent:', agentId);

            // Using the property service to get all properties
            const propertiesData = await propertyService.getAllProperties();
            console.log('Properties data:', propertiesData);

            setProperties(propertiesData || []);
        } catch (error) {
            console.error('Error loading properties:', error);
            message.warning('Failed to load properties data: ' + error.message);
            setProperties([]);
        } finally {
            setLoadingProperties(false);
        }
    };

    const loadAppointments = async () => {
        setLoading(true);
        setError(null);
        try {
            const agentId = await getAgentId();
            console.log('Fetching appointments for agent:', agentId);

            // Use the service instance to get schedules by agent ID
            const result = await scheduleService.getSchedulesByAgent(parseInt(agentId));

            console.log('Raw API response for schedules:', result);

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
                        status: appointment.status || 'Pending', // Default to Pending
                        scheduleTime: appointment.scheduleTime || new Date().toISOString(),
                        notes: appointment.notes || '',

                        // Meeting details
                        meetingType: appointment.meetingType || 'InPerson',
                        meetingLocation: appointment.meetingLocation || '',
                        virtualMeetingLink: appointment.virtualMeetingLink || '',

                        // Store IDs for reference
                        clientId: appointment.clientId || clientData?.id,
                        propertyId: appointment.propertyId || propertyData?.id,
                        agentId: appointment.agentId || agentId
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

    // FIXED: Accept appointment functionality with proper error handling
    const handleAccept = async (id) => {
        setActionLoading(id);
        try {
            console.log('Accepting appointment with ID:', id);

            // Use the service method directly and handle the response properly
            const result = await scheduleService.acceptSchedule(id);
            console.log('Accept schedule result:', result);

            // Check if the operation was successful
            if (result) {
                message.success('Appointment accepted successfully');
                await loadAppointments(); // Reload to get updated status
                onScheduleUpdate?.();
            } else {
                throw new Error('Failed to accept appointment - no response from server');
            }
        } catch (error) {
            console.error('Error accepting appointment:', error);

            // Provide more specific error messages
            let errorMessage = 'Failed to accept appointment';
            if (error.response) {
                // Server responded with error status
                errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
            } else if (error.request) {
                // Request was made but no response received
                errorMessage = 'No response from server. Please check your connection.';
            } else {
                // Something else happened
                errorMessage = error.message || 'Failed to accept appointment';
            }

            message.error(errorMessage);
        } finally {
            setActionLoading(null);
        }
    };

    // FIXED: Cancel appointment with proper error handling
    const handleCancel = async (id, reason = '') => {
        setActionLoading(id);
        try {
            console.log('Cancelling appointment with ID:', id, 'Reason:', reason);

            const result = await scheduleService.cancelSchedule(id, reason);
            console.log('Cancel schedule result:', result);

            if (result) {
                message.success('Appointment cancelled successfully');
                setCancelModalVisible(false);
                await loadAppointments(); // Reload to get updated status
                onScheduleUpdate?.();
            } else {
                throw new Error('Failed to cancel appointment - no response from server');
            }
        } catch (error) {
            console.error('Error cancelling appointment:', error);

            let errorMessage = 'Failed to cancel appointment';
            if (error.response) {
                errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
            } else if (error.request) {
                errorMessage = 'No response from server. Please check your connection.';
            } else {
                errorMessage = error.message || 'Failed to cancel appointment';
            }

            message.error(errorMessage);
            throw error; // Re-throw to handle in the calling function
        } finally {
            setActionLoading(null);
        }
    };

    // FIXED: Complete appointment with proper error handling
    const handleComplete = async (id) => {
        setActionLoading(id);
        try {
            console.log('Completing appointment with ID:', id);

            const result = await scheduleService.completeSchedule(id);
            console.log('Complete schedule result:', result);

            if (result) {
                message.success('Appointment completed successfully');
                await loadAppointments(); // Reload to get updated status
                onScheduleUpdate?.();
            } else {
                throw new Error('Failed to complete appointment - no response from server');
            }
        } catch (error) {
            console.error('Error completing appointment:', error);

            let errorMessage = 'Failed to complete appointment';
            if (error.response) {
                errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
            } else if (error.request) {
                errorMessage = 'No response from server. Please check your connection.';
            } else {
                errorMessage = error.message || 'Failed to complete appointment';
            }

            message.error(errorMessage);
        } finally {
            setActionLoading(null);
        }
    };

    // NEW: Reopen appointment functionality
    const handleReopen = async (id) => {
        setActionLoading(id);
        try {
            console.log('Reopening appointment with ID:', id);

            const result = await scheduleService.reopenSchedule(id);
            console.log('Reopen schedule result:', result);

            if (result) {
                message.success('Appointment reopened successfully');
                await loadAppointments(); // Reload to get updated status
                onScheduleUpdate?.();
            } else {
                throw new Error('Failed to reopen appointment - no response from server');
            }
        } catch (error) {
            console.error('Error reopening appointment:', error);

            let errorMessage = 'Failed to reopen appointment';
            if (error.response) {
                errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
            } else if (error.request) {
                errorMessage = 'No response from server. Please check your connection.';
            } else {
                errorMessage = error.message || 'Failed to reopen appointment';
            }

            message.error(errorMessage);
        } finally {
            setActionLoading(null);
        }
    };

    // NEW: Open cancel modal with reason
    const openCancelModal = (appointment) => {
        setSelectedAppointment(appointment);
        cancelForm.resetFields();
        setCancelModalVisible(true);
    };

    // FIXED: Handle cancel with proper error handling
    const handleCancelSubmit = async (values) => {
        if (selectedAppointment) {
            try {
                await handleCancel(selectedAppointment.id, values.reason || '');
            } catch (error) {
                // Error is already handled in handleCancel, just log it here
                console.error('Error in cancel submission:', error);
            }
        }
    };

    // Refresh function that forces agent ID refresh if needed
    const refreshData = async () => {
        try {
            // Force refresh agent ID in case it changed
            await getAgentId(true);
            await loadAllData();
            message.success('Data refreshed successfully');
        } catch (error) {
            console.error('Error refreshing data:', error);
            message.error('Failed to refresh data: ' + error.message);
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

    // FIXED: Handle Edit - Properly populate form with current data
    const handleEdit = (appointment) => {
        setSelectedAppointment(appointment);

        // Reset form and set values properly
        editForm.resetFields();
        editForm.setFieldsValue({
            meetingType: appointment.meetingType || 'InPerson',
            meetingLocation: appointment.meetingLocation || '',
            virtualMeetingLink: appointment.virtualMeetingLink || '',
            notes: appointment.notes || ''
        });

        console.log('Editing appointment:', appointment);
        console.log('Form values set:', {
            meetingType: appointment.meetingType,
            meetingLocation: appointment.meetingLocation,
            virtualMeetingLink: appointment.virtualMeetingLink,
            notes: appointment.notes
        });

        setEditModalVisible(true);
    };

    // FIXED: Handle Edit Submit - Pass only the complete schedule object
    const handleEditSubmit = async (values) => {
        setEditLoading(true);
        try {
            if (!selectedAppointment) {
                throw new Error('No appointment selected for editing');
            }

            console.log('Updating appointment with values:', values);
            console.log('Selected appointment ID:', selectedAppointment.id);

            // Create the update data using the existing appointment as base
            // Only update the fields that are allowed to be edited
            // Create proper update data with all required fields
            const updateData = {
                id: selectedAppointment.id,
                scheduleNo: selectedAppointment.scheduleNo,
                propertyId: selectedAppointment.propertyId,
                agentId: selectedAppointment.agentId,
                clientId: selectedAppointment.clientId,
                scheduleTime: selectedAppointment.scheduleTime,
                scheduleEndTime: selectedAppointment.scheduleEndTime,
                status: selectedAppointment.status,
                meetingType: values.meetingType,
                meetingLocation: values.meetingLocation,
                virtualMeetingLink: values.virtualMeetingLink,
                notes: values.notes,
                cancellationReason: selectedAppointment.cancellationReason || "",
                createdAt: selectedAppointment.createdAt,
                updatedAt: new Date().toISOString()
            };

            // Remove any undefined or null values that might cause issues
            Object.keys(updateData).forEach(key => {
                if (updateData[key] === undefined) {
                    updateData[key] = null;
                }
            });

            console.log('🧹 Cleaned update data:', updateData);

            // FIX: Pass only the complete schedule object (not ID + data)
            const result = await scheduleService.updateSchedule(updateData);

            if (result) {
                message.success('Meeting details updated successfully');
                setEditModalVisible(false);
                await loadAppointments();
                onScheduleUpdate?.();
            } else {
                throw new Error('Failed to update meeting details');
            }
        } catch (error) {
            console.error('Error updating meeting details:', error);

            let errorMessage = 'Failed to update meeting details';
            if (error.response?.data) {
                // Try to get more specific error message from backend
                errorMessage = error.response.data.message || error.response.data.title || errorMessage;
            } else if (error.message) {
                errorMessage = error.message;
            }

            message.error(errorMessage);
        } finally {
            setEditLoading(false);
        }
    };

    const loadChatMessages = async (appointmentId) => {
        try {
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

    // UPDATED: Mobile Card View with all status actions including Reopen
    const MobileCardView = ({ data, onView, onEdit, onChat, onMeetingDetails, onAccept, onComplete, onCancel, onReopen }) => {
        return (
            <div style={{ padding: '8px 0' }}>
                {data.map((item) => (
                    <Card
                        key={item.key}
                        style={{
                            marginBottom: 16,
                            border: `1px solid ${getStatusColor(item.status)}20`,
                            background: `${getStatusColor(item.status)}08`
                        }}
                        bodyStyle={{ padding: '16px' }}
                    >
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: 4, color: '#1a365d' }}>
                                    {item.clientName || 'Unknown Client'}
                                </div>
                                <Tag
                                    color={getStatusColor(item.status)}
                                    icon={getStatusIcon(item.status)}
                                >
                                    {item.status}
                                </Tag>
                            </div>
                            <Space>
                                <Tooltip title="View Details">
                                    <Button
                                        icon={<EyeOutlined />}
                                        size="small"
                                        onClick={() => onView(item)}
                                    />
                                </Tooltip>
                            </Space>
                        </div>

                        {/* Property Info */}
                        <div style={{ background: 'white', padding: '12px', borderRadius: '6px', border: '1px solid #e8e8e8', marginBottom: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <HomeOutlined style={{ color: '#52c41a' }} />
                                <span style={{ fontWeight: 500 }}>Property</span>
                            </div>
                            <div style={{ fontWeight: 600, marginBottom: 4 }}>
                                {item.propertyTitle || 'Unknown Property'}
                            </div>
                            <div style={{ fontSize: '14px', color: '#666' }}>
                                {item.propertyAddress || 'No address'}
                            </div>
                        </div>

                        {/* Schedule Info */}
                        <div style={{ background: 'white', padding: '12px', borderRadius: '6px', border: '1px solid #e8e8e8', marginBottom: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <CalendarOutlined style={{ color: '#1890ff' }} />
                                    <span style={{ fontWeight: 500 }}>Schedule</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    {getMeetingTypeIcon(item.meetingType)}
                                    <span style={{ fontSize: '12px', color: '#666' }}>
                                        {item.meetingType}
                                    </span>
                                </div>
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: 4 }}>
                                {moment(item.scheduleTime).format('MMM DD, YYYY')}
                            </div>
                            <div style={{ fontSize: '14px', color: '#666' }}>
                                {moment(item.scheduleTime).format('hh:mm A')}
                            </div>
                        </div>

                        {/* Actions based on status */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                            <Space>
                                <Button
                                    size="small"
                                    icon={<CalendarOutlined />}
                                    onClick={() => onMeetingDetails(item)}
                                >
                                    Details
                                </Button>
                            
                            </Space>

                            {/* Status-specific actions */}
                            <Space>
                                {item.status === 'Pending' && (
                                    <>
                                        <Button
                                            size="small"
                                            type="primary"
                                            icon={<CheckOutlined />}
                                            onClick={() => onAccept(item.id)}
                                            loading={actionLoading === item.id}
                                        >
                                            Accept
                                        </Button>
                                        <Button
                                            size="small"
                                            danger
                                            icon={<CloseCircleOutlined />}
                                            onClick={() => onCancel(item)}
                                            loading={actionLoading === item.id}
                                        >
                                            Cancel
                                        </Button>
                                    </>
                                )}
                                {(item.status === 'Scheduled' || item.status === 'Rescheduled') && (
                                    <>
                                        <Button
                                            size="small"
                                            type="primary"
                                            icon={<CheckCircleOutlined />}
                                            onClick={() => onComplete(item.id)}
                                            loading={actionLoading === item.id}
                                        >
                                            Complete
                                        </Button>
                                        <Button
                                            size="small"
                                            danger
                                            icon={<CloseCircleOutlined />}
                                            onClick={() => onCancel(item)}
                                            loading={actionLoading === item.id}
                                        >
                                            Cancel
                                        </Button>
                                    </>
                                )}
                                {/* ADD REOPEN ACTION FOR CANCELLED STATUS */}
                                {item.status === 'Cancelled' && (
                                    <Button
                                        size="small"
                                        type="primary"
                                        icon={<ReloadOutlined />}
                                        onClick={() => onReopen(item.id)}
                                        loading={actionLoading === item.id}
                                    >
                                        Reopen
                                    </Button>
                                )}
                            </Space>
                        </div>
                    </Card>
                ))}
            </div>
        );
    };

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

    // UPDATED: Columns with all status actions including Reopen
    const columns = [
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
                    </div>
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
                <Tag
                    color={getStatusColor(status)}
                    icon={getStatusIcon(status)}
                >
                    {status}
                </Tag>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 300,
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
               

                    {/* Status-specific actions */}
                    {record.status === 'Pending' && (
                        <>
                            <Tooltip title="Accept Appointment">
                                <Button
                                    icon={<CheckOutlined />}
                                    size="small"
                                    type="primary"
                                    loading={actionLoading === record.id}
                                    onClick={() => handleAccept(record.id)}
                                />
                            </Tooltip>
                            <Tooltip title="Cancel Appointment">
                                <Button
                                    icon={<CloseCircleOutlined />}
                                    size="small"
                                    danger
                                    loading={actionLoading === record.id}
                                    onClick={() => openCancelModal(record)}
                                />
                            </Tooltip>
                        </>
                    )}
                    {(record.status === 'Scheduled' || record.status === 'Rescheduled') && (
                        <>
                            <Tooltip title="Mark Complete">
                                <Button
                                    icon={<CheckCircleOutlined />}
                                    size="small"
                                    type="primary"
                                    loading={actionLoading === record.id}
                                    onClick={() => handleComplete(record.id)}
                                />
                            </Tooltip>
                            <Tooltip title="Cancel Appointment">
                                <Button
                                    icon={<CloseCircleOutlined />}
                                    size="small"
                                    danger
                                    loading={actionLoading === record.id}
                                    onClick={() => openCancelModal(record)}
                                />
                            </Tooltip>
                        </>
                    )}
                    {/* ADD REOPEN ACTION FOR CANCELLED STATUS */}
                    {record.status === 'Cancelled' && (
                        <Tooltip title="Reopen Appointment">
                            <Button
                                icon={<ReloadOutlined />}
                                size="small"
                                type="primary"
                                loading={actionLoading === record.id}
                                onClick={() => handleReopen(record.id)}
                            >
                                Reopen
                            </Button>
                        </Tooltip>
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
                            style={{ width: isMobile ? '100%' : 300 }}
                        />
                        <Select
                            value={statusFilter}
                            onChange={setStatusFilter}
                            style={{ width: isMobile ? '100%' : 150 }}
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
                                onClick={refreshData}
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
                    <ErrorIndicator message={error} onRetry={refreshData} />
                ) : isMobile ? (
                    <MobileCardView
                        data={filteredAppointments}
                        onView={handleView}
                        onEdit={handleEdit}
                        onChat={handleChat}
                        onMeetingDetails={handleMeetingDetails}
                        onAccept={handleAccept}
                        onComplete={handleComplete}
                        onCancel={openCancelModal}
                        onReopen={handleReopen}
                    />
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
                                        onClick={refreshData}
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
                width={isMobile ? '90%' : 600}
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
                                    <Tag
                                        color={getStatusColor(selectedAppointment.status)}
                                        icon={getStatusIcon(selectedAppointment.status)}
                                    >
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

            {/* Cancel Appointment Modal with Reason */}
            <Modal
                title="Cancel Appointment"
                open={cancelModalVisible}
                onCancel={() => setCancelModalVisible(false)}
                footer={null}
                width={500}
            >
                <Form
                    form={cancelForm}
                    layout="vertical"
                    onFinish={handleCancelSubmit}
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
                            <Button onClick={() => setCancelModalVisible(false)}>
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                danger
                                htmlType="submit"
                                icon={<CloseCircleOutlined />}
                                loading={actionLoading === selectedAppointment?.id}
                            >
                                Cancel Appointment
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
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
                        disabled={selectedAppointment?.status === 'Completed' || selectedAppointment?.status === 'Cancelled'}
                    >
                        Edit Details
                    </Button>,
                    <Button key="close" onClick={() => setMeetingDetailsModalVisible(false)}>
                        Close
                    </Button>
                ]}
                width={isMobile ? '90%' : 500}
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

            {/* FIXED: Edit Meeting Details Modal */}
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
                width={isMobile ? '90%' : 500}
                afterClose={() => editForm.resetFields()}
            >
                <Form
                    form={editForm}
                    layout="vertical"
                    onFinish={handleEditSubmit}
                    initialValues={{
                        meetingType: 'InPerson',
                        meetingLocation: '',
                        virtualMeetingLink: '',
                        notes: ''
                    }}
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
                        rules={[
                            {
                                required: form.getFieldValue('meetingType') === 'InPerson' || form.getFieldValue('meetingType') === 'Hybrid',
                                message: 'Meeting location is required for in-person or hybrid meetings'
                            }
                        ]}
                    >
                        <Input
                            placeholder="Enter meeting location or address"
                            prefix={<EnvironmentOutlined />}
                        />
                    </Form.Item>

                    <Form.Item
                        name="virtualMeetingLink"
                        label="Virtual Meeting Link"
                        rules={[
                            {
                                required: form.getFieldValue('meetingType') === 'Virtual' || form.getFieldValue('meetingType') === 'Hybrid',
                                message: 'Virtual meeting link is required for virtual or hybrid meetings'
                            },
                            {
                                type: 'url',
                                message: 'Please enter a valid URL'
                            }
                        ]}
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
                            showCount
                            maxLength={500}
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
                width={isMobile ? '90%' : 400}
                style={{
                    position: isMobile ? 'fixed' : 'relative',
                    bottom: isMobile ? '20px' : 'auto',
                    right: isMobile ? '20px' : 'auto',
                    top: 'auto',
                    left: 'auto',
                    margin: 0,
                    height: isMobile ? '80%' : '500px',
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