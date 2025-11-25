// SchedulingPage.jsx - Updated with new service methods
import React, { useState, useEffect } from 'react';
import {
    Card,
    Button,
    Modal,
    Form,
    Input,
    Select,
    Row,
    Col,
    Tag,
    message,
    Tabs,
    Space,
    Avatar,
    Tooltip,
    Empty,
    Alert,
    Divider,
    Badge,
    Popconfirm,
    Typography
} from 'antd';
import {
    PlusOutlined,
    CalendarOutlined,
    UnorderedListOutlined,
    UserOutlined,
    HomeOutlined,
    ReloadOutlined,
    EditOutlined,
    DeleteOutlined,
    WechatOutlined,
    StarOutlined,
    PhoneOutlined,
    MailOutlined,
    EnvironmentOutlined,
    ClockCircleOutlined,
    VideoCameraOutlined,
    EyeOutlined,
    ArrowRightOutlined,
    MessageOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import propertyService from '../Employeesportal/AdminPortal/Creation_Property/services/propertyService';
import SchedulePropertiesService from '../Employeesportal/AdminPortal/appointment/Services/SchedulePropertiesService';
import agentService from '../Employeesportal/AdminPortal/Creation_Agent/Services/AgentService';
import authService from '../Authpage/Services/LoginAuth';
import BaseRating from '../Ratings/BaseRatings';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

const SchedulingPage = () => {
    const navigate = useNavigate();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isNotesModalVisible, setIsNotesModalVisible] = useState(false);
    const [isRatingModalVisible, setIsRatingModalVisible] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [properties, setProperties] = useState([]);
    const [agents, setAgents] = useState([]);
    const [propertyDetails, setPropertyDetails] = useState({});
    const [agentDetails, setAgentDetails] = useState({});
    const [activeTab, setActiveTab] = useState('upcoming');
    const [loading, setLoading] = useState(false);
    const [notesLoading, setNotesLoading] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [error, setError] = useState(null);
    const [form] = Form.useForm();
    const [editForm] = Form.useForm();
    const [notesForm] = Form.useForm();

    const scheduleService = new SchedulePropertiesService();

    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        setLoading(true);
        setError(null);
        try {
            const currentUser = authService.getCurrentUser();
            const clientId = currentUser?.userId;

            if (!clientId) {
                throw new Error('Unable to determine client ID');
            }

            // Load appointments first
            let appointmentsData = [];
            try {
                appointmentsData = await scheduleService.getSchedulesByClient(parseInt(clientId));
                if (appointmentsData && Array.isArray(appointmentsData)) {
                    appointmentsData = appointmentsData.map(appointment => ({
                        id: appointment.id,
                        scheduleNo: appointment.scheduleNo,
                        agentId: appointment.agentId,
                        clientId: appointment.clientId,
                        propertyId: appointment.propertyId,
                        scheduleTime: appointment.scheduleTime,
                        scheduleEndTime: appointment.scheduleEndTime,
                        status: appointment.status,
                        notes: appointment.notes,
                        meetingType: appointment.meetingType,
                        meetingLocation: appointment.meetingLocation,
                        virtualMeetingLink: appointment.virtualMeetingLink,
                        createdAt: appointment.createdAt,
                        updatedAt: appointment.updatedAt
                    }));
                }
            } catch (scheduleError) {
                console.error('Error loading schedules:', scheduleError);
                appointmentsData = [];
            }

            setAppointments(appointmentsData || []);

            // Load properties
            let propertiesData = [];
            try {
                propertiesData = await propertyService.getAllProperties();
                if (propertiesData && Array.isArray(propertiesData)) {
                    propertiesData = propertiesData.map(property => ({
                        id: property.id,
                        title: property.title,
                        address: property.address,
                        city: property.city,
                        state: property.state,
                        mainImage: property.mainImage,
                        propertyImages: property.propertyImages,
                        bedrooms: property.bedrooms,
                        bathrooms: property.bathrooms,
                        areaSqm: property.areaSqm,
                        price: property.price
                    }));
                }
            } catch (propertyError) {
                console.error('Error loading properties:', propertyError);
                propertiesData = [];
            }
            setProperties(propertiesData || []);

            // Load ALL agents (not just by appointment agentId)
            let agentsData = [];
            try {
                agentsData = await agentService.getAllAgents();
                if (agentsData && Array.isArray(agentsData)) {
                    agentsData = agentsData.map(agent => ({
                        id: agent.id,
                        firstName: agent.firstName,
                        lastName: agent.lastName,
                        cellPhoneNo: agent.cellPhoneNo,
                        profilePictureUrl: agent.profilePictureUrl,
                        brokerageName: agent.brokerageName,
                        email: agent.email
                    }));
                }
            } catch (agentError) {
                console.error('Error loading agents:', agentError);
                agentsData = [];
            }
            setAgents(agentsData || []);

            // Load additional details for appointments
            if (appointmentsData && appointmentsData.length > 0) {
                await loadAdditionalDetails(appointmentsData);
            }

        } catch (error) {
            console.error('Error loading data:', error);
            setError(error.message || 'Failed to load scheduling data');
        } finally {
            setLoading(false);
        }
    };
    const getSafePropertyData = (propertyId) => {
        if (!propertyId) return { title: 'Unknown Property', address: 'No address' };
        if (propertyDetails[propertyId]) {
            const prop = propertyDetails[propertyId];
            return {
                title: prop?.title || prop?.property?.title || 'Unknown Property',
                address: prop?.address || prop?.property?.address || 'No address available',
                mainImage: prop?.mainImage || prop?.property?.mainImage,
                bedrooms: prop?.bedrooms || prop?.property?.bedrooms || 0,
                bathrooms: prop?.bathrooms || prop?.property?.bathrooms || 0,
                areaSqm: prop?.areaSqm || prop?.property?.areaSqm || 0,
                price: prop?.price || prop?.property?.price || 0
            };
        }
        const property = properties.find(p => p.id === propertyId || p.property?.id === propertyId);
        const propData = property?.property || property;
        return {
            title: propData?.title || 'Unknown Property',
            address: propData?.address || 'No address available',
            mainImage: propData?.mainImage,
            bedrooms: propData?.bedrooms || 0,
            bathrooms: propData?.bathrooms || 0,
            areaSqm: propData?.areaSqm || 0,
            price: propData?.price || 0
        };
    };

    const getSafeAgentData = (agentId) => {
        if (!agentId) return { name: 'Unknown Agent', phone: 'N/A', profilePicture: '', email: '' };
        if (agentDetails[agentId]) {
            const agent = agentDetails[agentId];
            return {
                name: agent ? `${agent.firstName || ''} ${agent.lastName || ''}`.trim() : 'Unknown Agent',
                phone: agent?.cellPhoneNo || 'N/A',
                profilePicture: agent?.profilePictureUrl,
                email: agent?.email || '',
                brokerageName: agent?.brokerageName || 'Real Estate'
            };
        }
        const agent = agents.find(a => a.id === agentId);
        return {
            name: agent ? `${agent.firstName || ''} ${agent.lastName || ''}`.trim() : 'Unknown Agent',
            phone: agent?.cellPhoneNo || 'N/A',
            profilePicture: agent?.profilePictureUrl,
            email: agent?.email || '',
            brokerageName: agent?.brokerageName || 'Real Estate'
        };
    };
    const loadAdditionalDetails = async (appointments) => {
        if (!appointments || !Array.isArray(appointments)) return;
        const propertyDetailsCache = {};
        const agentDetailsCache = {};

        for (const appointment of appointments) {
            if (appointment.propertyId && !propertyDetailsCache[appointment.propertyId]) {
                try {
                    const propertyDetail = await propertyService.getProperty(appointment.propertyId);
                    propertyDetailsCache[appointment.propertyId] = {
                        title: propertyDetail?.title || 'Unknown Property',
                        address: propertyDetail?.address || 'Address not available',
                        mainImage: propertyDetail?.mainImage,
                        bedrooms: propertyDetail?.bedrooms || 0,
                        bathrooms: propertyDetail?.bathrooms || 0,
                        areaSqm: propertyDetail?.areaSqm || 0,
                        price: propertyDetail?.price || 0
                    };
                } catch (error) {
                    propertyDetailsCache[appointment.propertyId] = {
                        title: 'Unknown Property',
                        address: 'Address not available',
                        mainImage: null,
                        bedrooms: 0,
                        bathrooms: 0,
                        areaSqm: 0,
                        price: 0
                    };
                }
            }
            if (appointment.agentId && !agentDetailsCache[appointment.agentId]) {
                try {
                    const agentDetail = await agentService.getAgent(appointment.agentId);
                    agentDetailsCache[appointment.agentId] = {
                        firstName: agentDetail?.firstName || 'Unknown',
                        lastName: agentDetail?.lastName || 'Agent',
                        profilePictureUrl: agentDetail?.profilePictureUrl || '',
                        cellPhoneNo: agentDetail?.cellPhoneNo || 'N/A',
                        email: agentDetail?.email || '',
                        brokerageName: agentDetail?.brokerageName || 'Real Estate'
                    };
                } catch (error) {
                    agentDetailsCache[appointment.agentId] = {
                        firstName: 'Unknown',
                        lastName: 'Agent',
                        profilePictureUrl: '',
                        cellPhoneNo: 'N/A',
                        email: '',
                        brokerageName: 'Real Estate'
                    };
                }
            }
        }

        setPropertyDetails(propertyDetailsCache);
        setAgentDetails(agentDetailsCache);
    };

    // Modal handlers
    const showModal = () => setIsModalVisible(true);
    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    const handleOk = () => {
        form.validateFields()
            .then(async (values) => {
                try {
                    const currentUser = authService.getCurrentUser();
                    const clientId = currentUser?.userId;
                    if (!clientId) throw new Error('Unable to determine client ID');

                    const newAppointment = {
                        clientId: parseInt(clientId),
                        propertyId: parseInt(values.propertyId),
                        agentId: parseInt(values.agentId),
                        scheduleTime: `${values.date}T${values.time}:00`,
                        notes: values.notes || '',
                        meetingType: values.meetingType || 'InPerson',
                        meetingLocation: values.meetingLocation || '',
                        status: 'Scheduled'
                    };

                    const result = await scheduleService.createSchedule(newAppointment);
                    if (result) {
                        message.success('Appointment scheduled successfully!');
                        setIsModalVisible(false);
                        form.resetFields();
                        loadAllData();
                    }
                } catch (error) {
                    message.error(error.message || 'Failed to schedule appointment');
                }
            });
    };

    const handleOpenChat = (record) => {
        const agentData = getSafeAgentData(record.agentId);
        const propertyData = getSafePropertyData(record.propertyId);
        navigate('/messages', {
            state: { propertyChat: { agent: { id: record.agentId, name: agentData.name }, property: { id: record.propertyId, title: propertyData.title } } }
        });
    };

    const handleOpenRating = (record) => {
        setSelectedAppointment(record);
        setIsRatingModalVisible(true);
    };

    const handleCloseRating = () => {
        setIsRatingModalVisible(false);
        setSelectedAppointment(null);
    };

    const getStatusColor = (status) => {
        const colors = {
            'Scheduled': '#1B3C53',
            'Completed': '#52c41a',
            'Cancelled': '#ff4d4f',
            'Rescheduled': '#fa8c16'
        };
        return colors[status] || '#d9d9d9';
    };

    const getMeetingTypeIcon = (type) => {
        switch (type) {
            case 'Virtual': return <VideoCameraOutlined style={{ color: '#1B3C53' }} />;
            case 'Phone': return <PhoneOutlined style={{ color: '#52c41a' }} />;
            default: return <EnvironmentOutlined style={{ color: '#fa8c16' }} />;
        }
    };

    const getMeetingTypeText = (type) => {
        switch (type) {
            case 'Virtual': return 'Virtual Tour';
            case 'Phone': return 'Phone Consultation';
            default: return 'In Person';
        }
    };

    // Format price for display
    const formatPrice = (price) => {
        if (!price && price !== 0) return 'Price on request';
        const priceNum = typeof price === 'string' ? parseFloat(price.replace(/[^0-9.-]+/g, "")) : price;
        return `₱${priceNum.toLocaleString()}`;
    };

    // Property Card Style Appointment Component
    const AppointmentCard = ({ appointment }) => {
        const propertyData = getSafePropertyData(appointment.propertyId);
        const agentData = getSafeAgentData(appointment.agentId);
        const isCompleted = appointment.status === 'Completed';
        const isCancelled = appointment.status === 'Cancelled';
        const appointmentDate = new Date(appointment.scheduleTime);
        const isToday = appointmentDate.toDateString() === new Date().toDateString();
        const isUpcoming = (appointment.status === 'Scheduled' || appointment.status === 'Rescheduled') && !isCancelled && !isCompleted;

        return (
            <Card
                key={appointment.id}
                style={{
                    marginBottom: 20,
                    overflow: 'hidden',
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.3s ease',
                    cursor: 'default'
                }}
                bodyStyle={{ padding: 0 }}
            >
                {/* Top Action Buttons - Right Corner */}
                <div style={{
                    position: 'absolute',
                    top: '150px',
                    right: 16,
                    zIndex: 10,
                    display: 'flex',
                    gap: 8
                }}>
                    {isUpcoming && (
                        <Button
                            size="small"
                            type="primary"
                            icon={<WechatOutlined />}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleOpenChat(appointment);
                            }}
                            style={{
                                background: '#1B3C53',
                                border: 'none',
                                fontWeight: 600,
                                borderRadius: '6px',
                                height: '28px',
                                fontSize: '12px'
                            }}
                        >
                            Message
                        </Button>
                    )}
                    {isCompleted && (
                        <Button
                            size="small"
                            type="primary"
                            icon={<StarOutlined />}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleOpenRating(appointment);
                            }}
                            style={{
                                background: '#1B3C53',
                                border: 'none',
                                fontWeight: 600,
                                borderRadius: '6px',
                                height: '28px',
                                fontSize: '12px'
                            }}
                        >
                            Rate Experience
                        </Button>
                    )}
                </div>

                {/* Card Content */}
                <div style={{ padding: '20px' }}>
                    <Row gutter={[16, 16]} align="middle">
                        {/* Date Section */}
                        <Col xs={24} sm={6}>
                            <div style={{
                                textAlign: 'center',
                                padding: '16px 8px',
                                background: isToday ? '#e6f7ff' : '#f8fafc',
                                border: `2px dashed ${isToday ? '#1B3C53' : '#e2e8f0'}`,
                                borderRadius: 8,
                            }}>
                                <div style={{
                                    fontSize: '28px',
                                    fontWeight: 'bold',
                                    color: isToday ? '#1B3C53' : '#1B3C53',
                                    lineHeight: 1.2
                                }}>
                                    {appointmentDate.getDate()}
                                </div>
                                <div style={{
                                    fontSize: '14px',
                                    color: isToday ? '#1B3C53' : '#64748b',
                                    textTransform: 'uppercase',
                                    fontWeight: 600,
                                    marginBottom: 4
                                }}>
                                    {appointmentDate.toLocaleDateString('en', { month: 'short' })}
                                </div>
                                <div style={{
                                    fontSize: '13px',
                                    color: '#64748b',
                                    fontWeight: 500
                                }}>
                                    {appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                {isToday && (
                                    <Tag color="#1B3C53" style={{
                                        marginTop: 6,
                                        fontSize: '10px',
                                        fontWeight: 600,
                                        background: '#1B3C53',
                                        color: 'white',
                                        border: 'none'
                                    }}>
                                        TODAY
                                    </Tag>
                                )}
                            </div>
                        </Col>

                        {/* Property & Agent Info */}
                        <Col xs={24} sm={12}>
                            <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                {/* Property Info */}
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                                    <div style={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: 8,
                                        background: '#1B3C53',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        <HomeOutlined style={{ fontSize: '20px', color: 'white' }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{
                                            fontWeight: 700,
                                            fontSize: '16px',
                                            marginBottom: 4,
                                            color: '#1B3C53'
                                        }}>
                                            {propertyData.title}
                                        </div>
                                        <div style={{
                                            color: '#64748b',
                                            fontSize: '13px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 6,
                                            marginBottom: 4
                                        }}>
                                            <EnvironmentOutlined style={{ color: '#1B3C53' }} />
                                            {propertyData.address}
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 12,
                                            flexWrap: 'wrap'
                                        }}>
                                            <Text strong style={{ color: '#1B3C53', fontSize: '14px' }}>
                                                {formatPrice(propertyData.price)}
                                            </Text>
                                            <Space size="small">
                                                <Text style={{ fontSize: '12px', color: '#64748b' }}>
                                                    {propertyData.bedrooms || 0} beds
                                                </Text>
                                                <Text style={{ fontSize: '12px', color: '#64748b' }}>
                                                    {propertyData.bathrooms || 0} baths
                                                </Text>
                                                <Text style={{ fontSize: '12px', color: '#64748b' }}>
                                                    {propertyData.areaSqm || 0} sqm
                                                </Text>
                                            </Space>
                                        </div>
                                    </div>
                                </div>

                                {/* Reduced gap divider */}
                                <Divider style={{
                                    margin: '12px 0 8px 0',
                                    borderColor: '#f0f0f0'
                                }} />

                                {/* Agent Info */}
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                                    <Avatar
                                        size={48}
                                        icon={<UserOutlined />}
                                        src={agentData.profilePicture}
                                        style={{
                                            flexShrink: 0,
                                            border: '2px solid #1B3C53',
                                            backgroundColor: '#1B3C53'
                                        }}
                                    />
                                    <div style={{ flex: 1 }}>
                                        <div style={{
                                            fontWeight: 600,
                                            fontSize: '14px',
                                            marginBottom: 2,
                                            color: '#1B3C53'
                                        }}>
                                            {agentData.name}
                                        </div>
                                        <div style={{
                                            color: '#64748b',
                                            fontSize: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 6,
                                            marginBottom: 2
                                        }}>
                                            <PhoneOutlined style={{ color: '#52c41a' }} />
                                            {agentData.phone}
                                        </div>
                                        <div style={{
                                            color: '#64748b',
                                            fontSize: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 6
                                        }}>
                                            <MailOutlined style={{ color: '#fa8c16' }} />
                                            {agentData.email || 'No email provided'}
                                        </div>
                                    </div>
                                </div>
                            </Space>
                        </Col>

                        {/* Actions - Removed the upcoming appointment buttons from here */}
                        <Col xs={24} sm={6}>
                            <Space direction="vertical" style={{ width: '100%' }} size="small">
                                {/* Removed the upcoming appointment buttons from this section */}
                            </Space>
                        </Col>
                    </Row>

                    {/* Notes Section */}
                    {appointment.notes && (
                        <>
                            <Divider style={{ margin: '16px 0', borderColor: '#f0f0f0' }} />
                            <div style={{
                                background: '#f8fafc',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                fontSize: '13px',
                                color: '#64748b'
                            }}>
                                <div style={{ fontWeight: 600, marginBottom: 4, color: '#1B3C53' }}>
                                    <EditOutlined style={{ marginRight: 6 }} />
                                    Additional Notes:
                                </div>
                                {appointment.notes}
                            </div>
                        </>
                    )}
                </div>
            </Card>
        );
    };

    // Group appointments by status for tabs
    const getAppointmentsByTab = (tabKey) => {
        switch (tabKey) {
            case 'upcoming':
                return appointments.filter(app => app.status === 'Scheduled' || app.status === 'Rescheduled');
            case 'completed':
                return appointments.filter(app => app.status === 'Completed');
            case 'cancelled':
                return appointments.filter(app => app.status === 'Cancelled');
            case 'all':
            default:
                return appointments;
        }
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

    return (
        <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
            {renderErrorAlert()}

            <Card
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 4,
                            height: 24,
                            background: '#1B3C53',
                            borderRadius: 2
                        }} />
                        <span style={{ fontSize: '20px', fontWeight: 700, color: '#1B3C53' }}>
                            My Property Viewing Appointments
                        </span>
                    </div>
                }

                style={{
                    borderRadius: 12,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    border: 'none'
                }}
                bodyStyle={{ padding: '24px' }}
            >
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    type="card"
                    style={{ borderRadius: 8 }}
                >
                    <TabPane
                        tab={
                            <span style={{ fontWeight: 600, color: '#1B3C53' }}>
                                <CalendarOutlined />
                                Upcoming ({getAppointmentsByTab('upcoming').length})
                            </span>
                        }
                        key="upcoming"
                    >
                        {getAppointmentsByTab('upcoming').length === 0 ? (
                            <Empty
                                description="No upcoming appointments"
                                imageStyle={{ height: 80 }}
                            >
                                <Button
                                    type="primary"
                                    onClick={showModal}
                                    size="large"
                                    style={{
                                        background: '#1B3C53',
                                        border: 'none',
                                        fontWeight: 600,
                                        borderRadius: 8
                                    }}
                                >
                                    Schedule Your First Viewing
                                </Button>
                            </Empty>
                        ) : (
                            getAppointmentsByTab('upcoming').map(appointment => (
                                <AppointmentCard key={appointment.id} appointment={appointment} />
                            ))
                        )}
                    </TabPane>

                    <TabPane
                        tab={
                            <span style={{ fontWeight: 600, color: '#52c41a' }}>
                                <StarOutlined />
                                Completed ({getAppointmentsByTab('completed').length})
                            </span>
                        }
                        key="completed"
                    >
                        {getAppointmentsByTab('completed').length === 0 ? (
                            <Empty
                                description="No completed appointments"
                                imageStyle={{ height: 80 }}
                            />
                        ) : (
                            getAppointmentsByTab('completed').map(appointment => (
                                <AppointmentCard key={appointment.id} appointment={appointment} />
                            ))
                        )}
                    </TabPane>

                    <TabPane
                        tab={
                            <span style={{ fontWeight: 600, color: '#ff4d4f' }}>
                                <DeleteOutlined />
                                Cancelled ({getAppointmentsByTab('cancelled').length})
                            </span>
                        }
                        key="cancelled"
                    >
                        {getAppointmentsByTab('cancelled').length === 0 ? (
                            <Empty
                                description="No cancelled appointments"
                                imageStyle={{ height: 80 }}
                            />
                        ) : (
                            getAppointmentsByTab('cancelled').map(appointment => (
                                <AppointmentCard key={appointment.id} appointment={appointment} />
                            ))
                        )}
                    </TabPane>

                    <TabPane
                        tab={
                            <span style={{ fontWeight: 600, color: '#666' }}>
                                <UnorderedListOutlined />
                                All Appointments ({appointments.length})
                            </span>
                        }
                        key="all"
                    >
                        {appointments.length === 0 ? (
                            <Empty
                                description="No appointments scheduled"
                                imageStyle={{ height: 80 }}
                            >
                                <Button
                                    type="primary"
                                    onClick={showModal}
                                    size="large"
                                    style={{
                                        background: '#1B3C53',
                                        border: 'none',
                                        fontWeight: 600,
                                        borderRadius: 8
                                    }}
                                >
                                    Schedule Your First Viewing
                                </Button>
                            </Empty>
                        ) : (
                            appointments.map(appointment => (
                                <AppointmentCard key={appointment.id} appointment={appointment} />
                            ))
                        )}
                    </TabPane>
                </Tabs>
            </Card>

            {/* Schedule Modal */}
            <Modal
                title="Schedule Property Viewing"
                open={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                width={600}
                okText="Schedule Viewing"
                cancelText="Cancel"
                styles={{
                    body: { padding: '24px' }
                }}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="agentId" label="Select Agent" rules={[{ required: true }]}>
                        <Select placeholder="Choose an agent" showSearch size="large">
                            {agents.map(agent => (
                                <Option key={agent.id} value={agent.id}>
                                    {agent.firstName} {agent.lastName} ({agent.cellPhoneNo})
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="propertyId" label="Select Property" rules={[{ required: true }]}>
                        <Select placeholder="Choose a property" showSearch size="large">
                            {properties.map(property => (
                                <Option key={property.id} value={property.id}>
                                    {property.title} - {property.address}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="date" label="Date" rules={[{ required: true }]}>
                                <Input type="date" size="large" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="time" label="Time" rules={[{ required: true }]}>
                                <Input type="time" size="large" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="meetingType" label="Meeting Type" rules={[{ required: true }]}>
                        <Select size="large">
                            <Option value="InPerson">In Person</Option>
                            <Option value="Virtual">Virtual Tour</Option>
                            <Option value="Phone">Phone Consultation</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="meetingLocation" label="Meeting Location">
                        <Input placeholder="Location for in-person meetings" size="large" />
                    </Form.Item>
                    <Form.Item name="notes" label="Additional Notes">
                        <TextArea rows={3} placeholder="Any specific requirements..." size="large" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Rating Modal */}
            <Modal
                open={isRatingModalVisible}
                onCancel={handleCloseRating}
                footer={null}
                width={800}
            >
                {selectedAppointment && <BaseRating appointment={selectedAppointment} onClose={handleCloseRating} />}
            </Modal>
        </div>
    );
};

export default SchedulingPage;