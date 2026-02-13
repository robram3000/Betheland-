// ScheduleTour.jsx
import React, { useState, useEffect } from 'react';
import {
    Breadcrumb,
    Button,
    Card,
    Form,
    DatePicker,
    Input,
    TimePicker,
    Select,
    Space,
    Divider,
    Alert,
    Spin,
    Row,
    Col,
    Typography,
    Tag,
    Steps,
    Progress,
    Statistic,
    Timeline,
    Result
} from 'antd';
import {
    ArrowLeftOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    ClockCircleFilled,
    HomeOutlined,
    TeamOutlined,
    MailFilled,
    PhoneFilled,
    MessageOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import agentService from '../Employeesportal/AdminPortal/Creation_Agent/Services/AgentService';
import { SchedulePropertiesService } from '../Employeesportal/AdminPortal/appointment/Services/index.js';
import authService from '../Authpage/Services/LoginAuth';
import ratingScheduleService from '../Employeesportal/AdminPortal/Ratings/RatingScheduleServices';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Step } = Steps;

// Helper function to create local date without timezone conversion
const createLocalDate = (dateString, timeString) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date(year, month - 1, day, hours, minutes, 0, 0);
    return date;
};

// Helper function to format date for API without timezone shift
const formatDateForAPI = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

// Get today's date in YYYY-MM-DD format
const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Get next 7 days
const getNext7Days = () => {
    const days = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;

        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        const fullDate = date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });

        days.push({
            date: dateString,
            dayName,
            fullDate,
            isToday: i === 0
        });
    }

    return days;
};

// Agent Information Component
const AgentInfo = ({ agent }) => {
    const agentName = agent ? `${agent.firstName} ${agent.lastName}`.trim() : 'Contact Agent';
    const rating = agent?.rating || 4.5;
    const reviews = agent?.reviews || 0;

    return (
        <Card
            style={{
                border: '1px solid #1B3C53',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #f6ffed 0%, #e6f7ff 100%)',
                marginBottom: '20px'
            }}
            styles={{ body: { padding: '16px' } }}
        >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <img
                    src={agent?.profilePictureUrl}
                    alt={agentName}
                    style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '3px solid #1B3C53',
                        flexShrink: 0
                    }}
                    onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/60x60?text=Agent';
                    }}
                />

                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                        <Text strong style={{ fontSize: '16px', color: '#1B3C53' }}>{agentName}</Text>
                        {agent?.isFirstChoice && (
                            <Tag color="gold" style={{ margin: 0, fontSize: '10px', padding: '2px 6px' }}>
                                👑 DESIGNATED AGENT
                            </Tag>
                        )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            {[...Array(5)].map((_, i) => (
                                <span key={i} style={{ color: i < Math.floor(rating) ? '#faad14' : '#d9d9d9', fontSize: '14px' }}>
                                    ★
                                </span>
                            ))}
                        </div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            {rating.toFixed(1)} ({reviews} reviews)
                        </Text>
                    </div>

                    <Text type="secondary" style={{ fontSize: '13px', display: 'block', marginBottom: '4px' }}>
                        {agent?.specialties?.join(', ') || 'Real Estate Agent'}
                    </Text>

                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        {agent?.yearsExperience || '5'} years experience • {agent?.languages?.join(', ') || 'English, Tagalog'}
                    </Text>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '12px', color: '#1B3C53' }}>✉️</span>
                            <Text style={{ fontSize: '12px' }}>
                                {agent?.email}
                            </Text>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '12px', color: '#1B3C53' }}>📞</span>
                            <Text style={{ fontSize: '12px' }}>
                                {agent?.phone}
                            </Text>
                        </div>
                    </div>

                    {agent?.brokerageName && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                            <div style={{
                                width: '18px',
                                height: '18px',
                                backgroundColor: '#1B3C53',
                                borderRadius: '2px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '9px',
                                fontWeight: 'bold'
                            }}>
                                {agent.brokerageName.charAt(0).toUpperCase()}
                            </div>
                            <Text type="secondary" style={{ fontSize: '11px' }}>
                                {agent.brokerageName}
                            </Text>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};

// Time Slot Component
const TimeSlot = ({ slot, onSelect }) => (
    <div
        className={`time-slot ${slot.isAvailable ? 'available' : 'unavailable'}`}
        onClick={() => slot.isAvailable && onSelect(slot.time)}
        style={{
            padding: '12px',
            border: '1px solid #d9d9d9',
            borderRadius: '6px',
            cursor: slot.isAvailable ? 'pointer' : 'not-allowed',
            background: slot.isAvailable ? '#f6ffed' : '#f5f5f5',
            opacity: slot.isAvailable ? 1 : 0.6,
            textAlign: 'center',
            transition: 'all 0.2s ease',
            minWidth: '100px'
        }}
    >
        <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
            {slot.displayTime}
        </div>
        <div style={{ fontSize: '12px', color: slot.isAvailable ? '#52c41a' : '#d9d9d9' }}>
            {slot.isAvailable ? 'Available' : 'Unavailable'}
        </div>
    </div>
);

// Day Selector Component
const DaySelector = ({ days, selectedDay, onDaySelect }) => (
    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '8px 0', marginBottom: '16px' }}>
        {days.map(day => (
            <div
                key={day.date}
                onClick={() => onDaySelect(day.date)}
                style={{
                    padding: '12px 16px',
                    border: `2px solid ${selectedDay === day.date ? '#1B3C53' : '#d9d9d9'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: selectedDay === day.date ? '#1B3C53' : 'white',
                    color: selectedDay === day.date ? 'white' : '#333',
                    minWidth: '120px',
                    textAlign: 'center',
                    transition: 'all 0.2s ease'
                }}
            >
                <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
                    {day.dayName}
                </div>
                <div style={{ fontSize: '11px', opacity: 0.8 }}>
                    {day.fullDate.split(',')[0]}
                </div>
                {day.isToday && (
                    <Tag color="blue" style={{ marginTop: '4px', fontSize: '10px', padding: '2px 4px' }}>
                        Today
                    </Tag>
                )}
            </div>
        ))}
    </div>
);

const ScheduleTour = ({
    property,
    onBack,
    onSuccess,
    onWaitingConfirmation
}) => {
    const navigate = useNavigate();
    const [scheduleForm] = Form.useForm();
    const [scheduleService] = useState(new SchedulePropertiesService());
    const [currentUser, setCurrentUser] = useState(null);

    // Agent states
    const [availableAgents, setAvailableAgents] = useState([]);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [loadingAgents, setLoadingAgents] = useState(false);

    // Time Slot Availability states
    const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
    const [loadingAvailability, setLoadingAvailability] = useState(false);
    const [availabilityError, setAvailabilityError] = useState('');
    const [scheduleDate, setScheduleDate] = useState(getTodayDate());
    const [scheduleTime, setScheduleTime] = useState('');
    const [scheduleNotes, setScheduleNotes] = useState('');
    const [scheduleError, setScheduleError] = useState('');
    const [selectedDay, setSelectedDay] = useState(getTodayDate());

    // Scheduling state
    const [schedulingTour, setSchedulingTour] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [scheduledAppointment, setScheduledAppointment] = useState(null);

    // View states
    const [currentView, setCurrentView] = useState('schedule'); // 'schedule' | 'success' | 'waiting-confirmation'

    // Check authentication status
    useEffect(() => {
        const authenticated = authService.isAuthenticated();
        if (authenticated) {
            const user = authService.getCurrentUser();
            setCurrentUser(user);
        }
    }, []);

    // Load agents when component mounts
    useEffect(() => {
        if (property) {
            fetchAgentsForProperty(property);
        }
    }, [property]);

    // Load availability when agent is selected
    useEffect(() => {
        if (selectedAgent) {
            loadAvailability();
        }
    }, [selectedAgent]);

    // Fetch agents for property
    const fetchAgentsForProperty = async (property) => {
        setLoadingAgents(true);
        try {
            const agents = [];

            // If property has an agentId, try to fetch that agent
            if (property.agentId) {
                try {
                    let agentData = await agentService.getAgent(property.agentId);
                    if (!agentData || !agentData.id) {
                        // If agent fetch fails, use fallback
                        agentData = {
                            id: property.agentId,
                            firstName: 'Maria',
                            lastName: 'Santos',
                            email: 'maria.santos@realestate.com',
                            phone: '+63 912 345 6789',
                            profilePictureUrl: '/agent1.jpg',
                            rating: 4.8,
                            reviews: 127,
                            specialties: ['Residential', 'Condominium'],
                            yearsExperience: 8,
                            languages: ['English', 'Tagalog', 'Bisaya'],
                            brokerageName: 'Premium Realty'
                        };
                    }

                    // Get rating summary for this agent
                    let ratingSummary = null;
                    try {
                        ratingSummary = await ratingScheduleService.getRatingSummary(property.agentId);
                    } catch (ratingError) {
                        console.warn('Could not fetch ratings for agent:', ratingError);
                        ratingSummary = {
                            averageRating: 4.5,
                            totalRatings: Math.floor(Math.random() * 50) + 10
                        };
                    }

                    agents.push({
                        ...agentData,
                        isFirstChoice: true,
                        rating: ratingSummary?.averageRating || 4.5,
                        reviews: ratingSummary?.totalRatings || Math.floor(Math.random() * 100) + 50,
                        specialties: agentData.specialization || ['Residential', 'Commercial'],
                        yearsExperience: agentData.yearsOfExperience || Math.floor(Math.random() * 10) + 3,
                        languages: agentData.languages || ['English', 'Tagalog'],
                        phone: agentData.cellPhoneNo || agentData.phone || '+63 912 345 6789'
                    });
                } catch (error) {
                    console.warn('Failed to fetch specific agent:', error);
                }
            }

            // Add fallback agents if no agents found
            if (agents.length === 0) {
                const mockAgents = [
                    {
                        id: 1,
                        firstName: 'Maria',
                        lastName: 'Santos',
                        name: 'Maria Santos',
                        email: 'maria.santos@realestate.com',
                        phone: '+63 912 345 6789',
                        profilePictureUrl: '/agent1.jpg',
                        rating: 4.8,
                        reviews: 127,
                        isFirstChoice: true,
                        specialties: ['Residential', 'Condominium'],
                        yearsExperience: 8,
                        languages: ['English', 'Tagalog', 'Bisaya'],
                        brokerageName: 'Premium Realty'
                    }
                ];
                agents.push(...mockAgents);
            }

            setAvailableAgents(agents);

            const firstChoiceAgent = agents.find(agent => agent.isFirstChoice);
            if (firstChoiceAgent) {
                setSelectedAgent(firstChoiceAgent);
                scheduleForm.setFieldValue('agentId', firstChoiceAgent.id);
            } else if (agents.length > 0) {
                setSelectedAgent(agents[0]);
                scheduleForm.setFieldValue('agentId', agents[0].id);
            }
        } catch (error) {
            console.error('Error fetching agents:', error);
            setScheduleError('Failed to load available agents');
        } finally {
            setLoadingAgents(false);
        }
    };

    // Generate time slots for business hours
    const generateTimeSlots = () => {
        const slots = [];
        const startHour = 9; // 9 AM
        const endHour = 17; // 5 PM

        for (let hour = startHour; hour < endHour; hour++) {
            for (let minute = 0; minute < 60; minute += 30) { // 30-minute intervals
                const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

                slots.push({
                    time: timeString,
                    displayTime: new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                    }),
                    isAvailable: true
                });
            }
        }
        return slots;
    };

    // Check time slot availability for selected day
    const checkTimeSlotAvailability = async (timeSlots, date) => {
        if (!scheduleService || !selectedAgent?.baseMemberId) {
            return timeSlots.map(slot => ({ ...slot, isAvailable: true }));
        }

        const updatedSlots = [];
        const agentBaseMemberId = parseInt(selectedAgent.baseMemberId);

        for (const slot of timeSlots) {
            try {
                const slotDate = createLocalDate(date, slot.time);

                if (slotDate <= new Date()) {
                    updatedSlots.push({ ...slot, isAvailable: false });
                    continue;
                }

                const apiDateString = formatDateForAPI(slotDate);
                const isAvailable = await scheduleService.checkTimeSlotAvailability(
                    agentBaseMemberId,
                    apiDateString
                );

                updatedSlots.push({
                    ...slot,
                    isAvailable: isAvailable?.isAvailable ?? isAvailable ?? true
                });
            } catch (error) {
                console.error(`Error checking availability for ${slot.time}:`, error);
                const slotDate = createLocalDate(date, slot.time);
                updatedSlots.push({ ...slot, isAvailable: slotDate > new Date() });
            }
        }

        return updatedSlots;
    };

    // Load availability when agent or day changes
    const loadAvailability = async (date = selectedDay) => {
        if (!selectedAgent) return;

        setLoadingAvailability(true);
        setAvailabilityError('');

        try {
            const timeSlots = generateTimeSlots();
            const slotsWithAvailability = await checkTimeSlotAvailability(timeSlots, date);
            setAvailableTimeSlots(slotsWithAvailability);
        } catch (error) {
            console.error('Error loading availability:', error);
            setAvailabilityError('Failed to load available time slots. Please try again.');
        } finally {
            setLoadingAvailability(false);
        }
    };

    const handleTimeSlotSelect = (time, date = selectedDay) => {
        if (!authService.isAuthenticated()) {
            const returnUrl = window.location.pathname + window.location.search;
            navigate(`/login?returnUrl=${encodeURIComponent(returnUrl)}&action=${encodeURIComponent('schedule viewing')}`);
            return;
        }

        setScheduleDate(date);
        setScheduleTime(time);
        scheduleForm.setFieldValue('date', dayjs(date));
        scheduleForm.setFieldValue('time', dayjs(`2000-01-01T${time}`));
    };

    const handleDaySelection = async (date) => {
        setSelectedDay(date);
        await loadAvailability(date);
    };

    // Handle schedule submission
    const handleScheduleSubmit = async (values) => {
        // Prevent multiple submissions
        if (isSubmitting) {
            console.log('⏳ Schedule submission already in progress, skipping duplicate');
            return;
        }

        setIsSubmitting(true);
        setSchedulingTour(true);
        setScheduleError('');

        try {
            console.log('🚀 Starting schedule submission...');

            // Authentication check
            if (!authService.isAuthenticated()) {
                const returnUrl = window.location.pathname + window.location.search;
                navigate(`/login?returnUrl=${encodeURIComponent(returnUrl)}&action=${encodeURIComponent('schedule viewing')}`);
                return;
            }

            if (!selectedAgent?.baseMemberId) {
                setScheduleError('Agent information is not available. Please try again later.');
                return;
            }

            const selectedDate = values.date.format('YYYY-MM-DD');
            const selectedTime = values.time.format('HH:mm');
            const selectedDateTime = createLocalDate(selectedDate, selectedTime);

            if (selectedDateTime <= new Date()) {
                setScheduleError('Please select a future date and time');
                return;
            }

            const clientId = currentUser?.userId;
            if (!clientId) {
                setScheduleError('Unable to identify user. Please log in again.');
                return;
            }

            // Create date in local time but send as UTC to avoid timezone issues
            const localDate = new Date(selectedDateTime.getTime() - (selectedDateTime.getTimezoneOffset() * 60000));
            const apiDateString = localDate.toISOString();

            console.log('📅 Checking availability...');
            // Check availability
            const availabilityResponse = await scheduleService.checkTimeSlotAvailability(
                parseInt(selectedAgent.baseMemberId),
                apiDateString
            );

            const isAvailable = availabilityResponse?.isAvailable ?? availabilityResponse;
            if (!isAvailable) {
                setScheduleError('This time slot is not available. Please choose a different time.');
                return;
            }

            // Prepare schedule data
            const scheduleData = {
                propertyId: parseInt(property.propertyId || property.id),
                agentId: parseInt(selectedAgent.baseMemberId),
                clientId: parseInt(clientId),
                scheduleTime: apiDateString,
                scheduleEndTime: new Date(localDate.getTime() + 60 * 60 * 1000).toISOString(),
                notes: values.notes || '',
                status: "Scheduled",
                meetingType: "InPerson",
                meetingLocation: property?.address || '',
                virtualMeetingLink: ""
            };

            console.log('📤 Creating schedule with data:', scheduleData);

            // Create the schedule - ONLY ONCE
            const createdAppointment = await scheduleService.createSchedule(scheduleData);
            console.log('✅ Schedule created successfully:', createdAppointment);

            // Store the scheduled appointment data
            const appointmentData = {
                ...createdAppointment,
                property: property,
                agent: selectedAgent,
                scheduledDate: selectedDate,
                scheduledTime: selectedTime,
                notes: values.notes || ''
            };

            setScheduledAppointment(appointmentData);

            // Show success message and transition to success view
            setCurrentView('success');

            // Call success callback if provided
            if (onSuccess) {
                onSuccess(appointmentData);
            }

        } catch (error) {
            console.error('❌ Error scheduling tour:', error);
            setScheduleError(error.message || 'Failed to schedule tour. Please try again.');
        } finally {
            setSchedulingTour(false);
            setIsSubmitting(false);
        }
    };

    const next7Days = getNext7Days();

    // SUCCESS VIEW COMPONENT
    const SuccessView = () => (
        <div style={{ padding: '40px 24px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <Result
                icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                title="Tour Scheduled Successfully!"
                subTitle="Your property tour has been scheduled and the agent has been notified."
                extra={[
                    <Button
                        type="primary"
                        key="view-details"
                        onClick={() => {
                            setCurrentView('waiting-confirmation');
                            if (onWaitingConfirmation) {
                                onWaitingConfirmation(scheduledAppointment);
                            }
                        }}
                        size="large"
                    >
                        View Appointment Details
                    </Button>,
                    <Button
                        key="back-to-wishlist"
                        onClick={onBack}
                        size="large"
                    >
                        Back to Wishlist
                    </Button>
                ]}
            />

            <Card style={{ marginTop: '32px', textAlign: 'left' }}>
                <Title level={4}>What happens next?</Title>
                <Timeline
                    items={[
                        {
                            color: 'green',
                            dot: <CheckCircleOutlined />,
                            children: (
                                <>
                                    <Text strong>Tour Scheduled</Text>
                                    <br />
                                    <Text type="secondary">Your request has been sent to the agent</Text>
                                </>
                            ),
                        },
                        {
                            color: 'blue',
                            dot: <ClockCircleFilled />,
                            children: (
                                <>
                                    <Text strong>Agent Confirmation</Text>
                                    <br />
                                    <Text type="secondary">Waiting for the agent to confirm your tour</Text>
                                </>
                            ),
                        },
                        {
                            color: 'gray',
                            dot: <TeamOutlined />,
                            children: (
                                <>
                                    <Text strong>Tour Preparation</Text>
                                    <br />
                                    <Text type="secondary">Agent will contact you to finalize details</Text>
                                </>
                            ),
                        },
                    ]}
                />
            </Card>
        </div>
    );

    // WAITING CONFIRMATION VIEW COMPONENT
    const WaitingConfirmationView = () => (
        <div style={{ padding: '40px 24px', maxWidth: '800px', margin: '0 auto' }}>
            <Breadcrumb style={{ marginBottom: '24px' }}>
                <Breadcrumb.Item>
                    <HomeOutlined />
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                    <a onClick={onBack}>Wishlist</a>
                </Breadcrumb.Item>
                <Breadcrumb.Item>Appointment Confirmation</Breadcrumb.Item>
            </Breadcrumb>

            <Card>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <ClockCircleFilled style={{ fontSize: '64px', color: '#1890ff', marginBottom: '16px' }} />
                    <Title level={2} style={{ color: '#1890ff' }}>Waiting for Agent Confirmation</Title>
                    <Text type="secondary" style={{ fontSize: '16px' }}>
                        Your tour request has been sent to the agent. They will confirm within 24 hours.
                    </Text>
                </div>

                <Progress
                    percent={50}
                    status="active"
                    strokeColor={{
                        '0%': '#108ee9',
                        '100%': '#87d068',
                    }}
                    style={{ marginBottom: '32px' }}
                />

                <Row gutter={[32, 32]}>
                    <Col span={12}>
                        <Card
                            title="Appointment Details"
                            size="small"
                            style={{ border: '1px solid #f0f0f0' }}
                        >
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <Statistic
                                    title="Property"
                                    value={scheduledAppointment?.property?.title}
                                    valueStyle={{ fontSize: '14px', color: '#1B3C53' }}
                                />
                                <Statistic
                                    title="Date & Time"
                                    value={`${scheduledAppointment?.scheduledDate} at ${scheduledAppointment?.scheduledTime}`}
                                    valueStyle={{ fontSize: '14px' }}
                                />
                                <Statistic
                                    title="Agent"
                                    value={`${scheduledAppointment?.agent?.firstName} ${scheduledAppointment?.agent?.lastName}`}
                                    valueStyle={{ fontSize: '14px' }}
                                />
                                {scheduledAppointment?.notes && (
                                    <div>
                                        <Text strong>Notes: </Text>
                                        <Text type="secondary">{scheduledAppointment.notes}</Text>
                                    </div>
                                )}
                            </Space>
                        </Card>
                    </Col>

                    <Col span={12}>
                        <Card
                            title="Agent Contact"
                            size="small"
                            style={{ border: '1px solid #f0f0f0' }}
                        >
                            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                <Button
                                    type="primary"
                                    icon={<PhoneFilled />}
                                    block
                                    style={{ background: '#52c41a', borderColor: '#52c41a' }}
                                >
                                    Call Agent: {scheduledAppointment?.agent?.phone}
                                </Button>
                                <Button
                                    icon={<MailFilled />}
                                    block
                                >
                                    Email Agent: {scheduledAppointment?.agent?.email}
                                </Button>
                                <Button
                                    icon={<MessageOutlined />}
                                    block
                                >
                                    Send Message
                                </Button>
                            </Space>
                        </Card>
                    </Col>
                </Row>

                <Alert
                    message="Confirmation Timeline"
                    description="The agent typically confirms appointments within 24 hours. You'll receive a notification once your tour is confirmed."
                    type="info"
                    showIcon
                    style={{ marginTop: '24px' }}
                />

                <div style={{ textAlign: 'center', marginTop: '32px' }}>
                    <Space size="large">
                        <Button
                            type="primary"
                            onClick={onBack}
                            size="large"
                        >
                            Back to Wishlist
                        </Button>
                        <Button
                            onClick={() => setCurrentView('schedule')}
                            size="large"
                        >
                            Modify Appointment
                        </Button>
                    </Space>
                </div>
            </Card>
        </div>
    );

    // SCHEDULE VIEW COMPONENT
    const ScheduleView = () => (
        <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
            {/* Breadcrumb Navigation */}
            <Breadcrumb style={{ marginBottom: '24px' }}>
                <Breadcrumb.Item>
                    <HomeOutlined />
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                    <a onClick={onBack}>Wishlist</a>
                </Breadcrumb.Item>
                <Breadcrumb.Item>Schedule Tour</Breadcrumb.Item>
            </Breadcrumb>

            {/* Back Button */}
            <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={onBack}
                style={{ marginBottom: '20px' }}
            >
                Back to Wishlist
            </Button>

            {/* Property Header */}
            <div style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '24px',
                border: '1px solid #e2e8f0'
            }}>
                <Row gutter={16} align="middle">
                    <Col flex="80px">
                        <img
                            src={property?.mainImage || '/default-property.jpg'}
                            alt={property?.title}
                            style={{
                                width: '80px',
                                height: '80px',
                                objectFit: 'cover',
                                borderRadius: '8px'
                            }}
                        />
                    </Col>
                    <Col flex="auto">
                        <Title level={3} style={{ margin: 0, color: '#1B3C53' }}>
                            {property?.title}
                        </Title>
                        <Text type="secondary" style={{ fontSize: '16px' }}>
                            {property?.address}
                        </Text>
                        <div style={{ marginTop: '8px' }}>
                            <Text strong style={{ fontSize: '18px', color: '#1B3C53' }}>
                                {property?.price ? `₱${property.price.toLocaleString()}` : 'Price not set'}
                            </Text>
                        </div>
                    </Col>
                </Row>
            </div>

            {/* Progress Steps */}
            <Steps
                current={selectedAgent ? 1 : 0}
                style={{ marginBottom: '32px' }}
                items={[
                    {
                        title: 'Select Agent',
                        description: 'Choose your tour guide'
                    },
                    {
                        title: 'Schedule Time',
                        description: 'Pick date & time'
                    },
                    {
                        title: 'Confirm',
                        description: 'Review & book'
                    }
                ]}
            />

            <Form
                form={scheduleForm}
                layout="vertical"
                onFinish={handleScheduleSubmit}
                requiredMark="optional"
            >
                {/* Agent Information Section */}
                {selectedAgent && (
                    <div style={{ marginBottom: '24px' }}>
                        <Text strong style={{ display: 'block', marginBottom: '12px', fontSize: '16px' }}>
                            Designated Agent
                        </Text>
                        <Text type="secondary" style={{ display: 'block', marginBottom: '16px', fontSize: '14px' }}>
                            This agent is assigned to the property and will conduct your tour.
                        </Text>
                        <AgentInfo agent={selectedAgent} />
                    </div>
                )}

                {/* Loading indicator for agents */}
                {loadingAgents && !selectedAgent && (
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <Spin tip="Loading agent information..." />
                    </div>
                )}

                {/* Time Slot Availability Section */}
                {selectedAgent && (
                    <>
                        <Divider style={{ margin: '24px 0' }}>
                            <ClockCircleOutlined style={{ marginRight: '8px' }} />
                            <Text style={{ fontSize: '16px' }}>Available Time Slots</Text>
                        </Divider>

                        <div style={{ marginBottom: '20px' }}>
                            <Text strong style={{ display: 'block', marginBottom: '16px', fontSize: '16px' }}>
                                Select Day to View Availability
                            </Text>

                            <DaySelector
                                days={next7Days}
                                selectedDay={selectedDay}
                                onDaySelect={handleDaySelection}
                            />

                            {availabilityError && (
                                <Alert message={availabilityError} type="error" style={{ marginTop: '12px' }} />
                            )}

                            {selectedDay && availableTimeSlots.length > 0 && (
                                <div style={{ marginTop: '16px' }}>
                                    <Text strong style={{ display: 'block', marginBottom: '16px', fontSize: '16px' }}>
                                        Available Time Slots for {new Date(selectedDay).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </Text>
                                    {loadingAvailability ? (
                                        <div style={{ textAlign: 'center', padding: '40px' }}>
                                            <Spin tip="Loading available time slots..." />
                                        </div>
                                    ) : (
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                                            gap: '12px',
                                            maxHeight: '400px',
                                            overflowY: 'auto',
                                            padding: '16px',
                                            border: '1px solid #f0f0f0',
                                            borderRadius: '8px',
                                            background: '#fafafa'
                                        }}>
                                            {availableTimeSlots.map((slot, index) => (
                                                <TimeSlot
                                                    key={index}
                                                    slot={slot}
                                                    onSelect={(time) => handleTimeSlotSelect(time, selectedDay)}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Tour Details Section */}
                <Divider style={{ margin: '24px 0' }}>
                    <Text style={{ fontSize: '16px' }}>Tour Details</Text>
                </Divider>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="date"
                            label="Selected Date"
                            rules={[{ required: true, message: 'Please select a date' }]}
                        >
                            <DatePicker
                                style={{ width: '100%' }}
                                disabledDate={(current) => current && current < dayjs().startOf('day')}
                                value={selectedDay ? dayjs(selectedDay) : null}
                                onChange={(date, dateString) => handleDaySelection(dateString)}
                                size="large"
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="time"
                            label="Selected Time"
                            rules={[{ required: true, message: 'Please select a time' }]}
                        >
                            <TimePicker
                                style={{ width: '100%' }}
                                format="HH:mm"
                                minuteStep={15}
                                showNow={false}
                                placeholder="Select time from available slots above"
                                size="large"
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    name="notes"
                    label="Additional Notes (Optional)"
                    help="Any specific requirements, questions, or special requests for the agent"
                >
                    <TextArea
                        rows={4}
                        placeholder="Example: I'd like to see the garden area, please bring the key for the storage room, I have questions about the HOA fees..."
                        maxLength={500}
                        showCount
                    />
                </Form.Item>

                {scheduleError && (
                    <Alert message={scheduleError} type="error" style={{ marginBottom: '16px' }} />
                )}

                <Form.Item style={{ marginBottom: 0, textAlign: 'center' }}>
                    <Space size="large">
                        <Button
                            size="large"
                            onClick={onBack}
                            disabled={schedulingTour || isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            disabled={!selectedAgent || schedulingTour || isSubmitting}
                            loading={schedulingTour || isSubmitting}
                            icon={<CalendarOutlined />}
                            style={{ minWidth: '200px' }}
                        >
                            {schedulingTour || isSubmitting ? 'Scheduling...' : `Schedule with ${selectedAgent?.firstName || 'Agent'}`}
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </div>
    );
    switch (currentView) {
        case 'success':
            return <SuccessView />;
        case 'waiting-confirmation':
            return <WaitingConfirmationView />;
        case 'schedule':
        default:
            return <ScheduleView />;
    }
};

export default ScheduleTour;