// SchedulingPage.jsx - Fixed with complete modify schedule and meeting details
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
    Typography,
    DatePicker,
    TimePicker,
    Steps,
    Breadcrumb,
    Result,
    Progress,
    Statistic,
    Timeline,
    Spin,
    Rate
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
    StarFilled,
    PhoneOutlined,
    MailOutlined,
    EnvironmentOutlined,
    ClockCircleOutlined,
    VideoCameraOutlined,
    EyeOutlined,
    ArrowRightOutlined,
    MessageOutlined,
    CheckCircleOutlined,
    EyeFilled,
    ArrowLeftOutlined,
    CheckCircleFilled,
    TeamOutlined,
    PhoneFilled,
    MailFilled
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import propertyService from '../Employeesportal/AdminPortal/Creation_Property/services/propertyService';
import SchedulePropertiesService from '../Employeesportal/AdminPortal/appointment/Services/SchedulePropertiesService';
import agentService from '../Employeesportal/AdminPortal/Creation_Agent/Services/AgentService';
import authService from '../Authpage/Services/LoginAuth';
import BaseRating from '../Ratings/BaseRatings';
import ratingScheduleService from '../Employeesportal/AdminPortal/Ratings/RatingScheduleServices';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Step } = Steps;

// Helper function to create local date without timezone conversion
// Helper function to create date without timezone issues
const createLocalDate = (dateString, timeString) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const [hours, minutes] = timeString.split(':').map(Number);

    // Create date in local timezone but treat it as UTC for backend
    const date = new Date(year, month - 1, day, hours, minutes, 0, 0);

    console.log('🕐 Date created:', {
        input: `${dateString} ${timeString}`,
        local: date.toString(),
        iso: date.toISOString(),
        utc: date.toUTCString()
    });

    return date;
};

// Helper function to format date for API without timezone shift
// Helper function to format date for API in UTC format
const formatDateForAPI = (date) => {
    // Convert to UTC ISO string
    return date.toISOString();
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
    const [agentRatingSummaries, setAgentRatingSummaries] = useState({}); // Store agent rating summaries
    const [existingRatings, setExistingRatings] = useState({});
    const [ratingScores, setRatingScores] = useState({}); // Store actual rating scores
    const [activeTab, setActiveTab] = useState('upcoming');
    const [loading, setLoading] = useState(false);
    const [notesLoading, setNotesLoading] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [error, setError] = useState(null);
    const [form] = Form.useForm();
    const [editForm] = Form.useForm();
    const [notesForm] = Form.useForm();

    // New states for modify schedule functionality
    const [currentView, setCurrentView] = useState('main'); // 'main' | 'modify' | 'success' | 'waiting-confirmation'
    const [modifyForm] = Form.useForm();
    const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
    const [loadingAvailability, setLoadingAvailability] = useState(false);
    const [availabilityError, setAvailabilityError] = useState('');
    const [scheduleDate, setScheduleDate] = useState(getTodayDate());
    const [scheduleTime, setScheduleTime] = useState('');
    const [selectedDay, setSelectedDay] = useState(getTodayDate());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [modifyError, setModifyError] = useState('');

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
                        email: agent.email,
                        licenseNumber: agent.licenseNumber,
                        specialties: agent.specialties || ['Real Estate'],
                        yearsExperience: agent.yearsExperience || 5,
                        languages: agent.languages || ['English', 'Tagalog']
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
                await loadAgentRatingSummaries(appointmentsData);
                await checkExistingRatings(appointmentsData, clientId);
            }

        } catch (error) {
            console.error('Error loading data:', error);
            setError(error.message || 'Failed to load scheduling data');
        } finally {
            setLoading(false);
        }
    };

    // Load agent rating summaries
    const loadAgentRatingSummaries = async (appointments) => {
        if (!appointments || !Array.isArray(appointments)) return;

        const summariesMap = {};
        const uniqueAgentIds = [...new Set(appointments.map(app => app.agentId).filter(id => id))];

        for (const agentId of uniqueAgentIds) {
            try {
                console.log('Loading rating summary for agent:', agentId);
                const summary = await ratingScheduleService.getRatingSummary(parseInt(agentId));
                summariesMap[agentId] = summary;
                console.log(`Rating summary for agent ${agentId}:`, summary);
            } catch (error) {
                console.error(`Error loading rating summary for agent ${agentId}:`, error);
                // Set default summary if error
                summariesMap[agentId] = {
                    agentId: parseInt(agentId),
                    averageRating: 4.5,
                    totalRatings: 0,
                    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
                    recentRatings: []
                };
            }
        }

        setAgentRatingSummaries(summariesMap);
    };

    // Fixed function to check existing ratings and get actual scores
    const checkExistingRatings = async (appointments, clientId) => {
        if (!appointments || !Array.isArray(appointments)) return;

        const ratingsMap = {};
        const scoresMap = {};

        try {
            console.log('Checking existing ratings for client:', clientId);

            // Get all ratings for the current user using the correct service
            const userRatings = await ratingScheduleService.getRatingSchedulesByClient(parseInt(clientId));
            console.log('User ratings found:', userRatings);
            console.log('Appointments to check:', appointments);

            // Create a map of scheduleId to boolean indicating if rating exists and store the score
            appointments.forEach(appointment => {
                const existingRating = userRatings.find(rating => {
                    console.log(`Comparing: Rating ScheduleId ${rating.scheduleId} vs Appointment Id ${appointment.id}`);
                    return rating.scheduleId === appointment.id;
                });

                ratingsMap[appointment.id] = !!existingRating;
                scoresMap[appointment.id] = existingRating?.rating || 0;

                console.log(`Appointment ${appointment.id} - Status: ${appointment.status}, Has Rating: ${!!existingRating}, Score: ${scoresMap[appointment.id]}`);
            });

            setExistingRatings(ratingsMap);
            setRatingScores(scoresMap);
            console.log('Final ratings map:', ratingsMap);
            console.log('Final scores map:', scoresMap);
        } catch (error) {
            console.error('Error checking existing ratings:', error);
            // If there's an error, assume no ratings exist
            appointments.forEach(appointment => {
                ratingsMap[appointment.id] = false;
                scoresMap[appointment.id] = 0;
            });
            setExistingRatings(ratingsMap);
            setRatingScores(scoresMap);
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
        if (!agentId) return {
            id: 0,
            name: 'Unknown Agent',
            phone: 'N/A',
            profilePicture: '',
            email: '',
            brokerageName: 'Real Estate',
            rating: 4.5,
            reviews: 0,
            specialties: ['Real Estate'],
            yearsExperience: 5,
            languages: ['English', 'Tagalog'],
            licenseNumber: ''
        };

        if (agentDetails[agentId]) {
            const agent = agentDetails[agentId];
            const ratingSummary = agentRatingSummaries[agentId];

            return {
                id: agentId,
                name: agent ? `${agent.firstName || ''} ${agent.lastName || ''}`.trim() : 'Unknown Agent',
                phone: agent?.cellPhoneNo || 'N/A',
                profilePicture: agent?.profilePictureUrl,
                email: agent?.email || '',
                brokerageName: agent?.brokerageName || 'Real Estate',
                rating: ratingSummary?.averageRating || 4.5,
                reviews: ratingSummary?.totalRatings || 0,
                specialties: agent?.specialties || ['Real Estate'],
                yearsExperience: agent?.yearsExperience || 5,
                languages: agent?.languages || ['English', 'Tagalog'],
                licenseNumber: agent?.licenseNumber || ''
            };
        }

        const agent = agents.find(a => a.id === agentId);
        const ratingSummary = agentRatingSummaries[agentId];

        return {
            id: agentId,
            name: agent ? `${agent.firstName || ''} ${agent.lastName || ''}`.trim() : 'Unknown Agent',
            phone: agent?.cellPhoneNo || 'N/A',
            profilePicture: agent?.profilePictureUrl,
            email: agent?.email || '',
            brokerageName: agent?.brokerageName || 'Real Estate',
            rating: ratingSummary?.averageRating || 4.5,
            reviews: ratingSummary?.totalRatings || 0,
            specialties: agent?.specialties || ['Real Estate'],
            yearsExperience: agent?.yearsExperience || 5,
            languages: agent?.languages || ['English', 'Tagalog'],
            licenseNumber: agent?.licenseNumber || ''
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
                        id: appointment.agentId,
                        firstName: agentDetail?.firstName || 'Unknown',
                        lastName: agentDetail?.lastName || 'Agent',
                        profilePictureUrl: agentDetail?.profilePictureUrl || '',
                        cellPhoneNo: agentDetail?.cellPhoneNo || 'N/A',
                        email: agentDetail?.email || '',
                        brokerageName: agentDetail?.brokerageName || 'Real Estate',
                        specialties: agentDetail?.specialties || ['Real Estate'],
                        yearsExperience: agentDetail?.yearsExperience || 5,
                        languages: agentDetail?.languages || ['English', 'Tagalog'],
                        licenseNumber: agentDetail?.licenseNumber || ''
                    };
                } catch (error) {
                    agentDetailsCache[appointment.agentId] = {
                        id: appointment.agentId,
                        firstName: 'Unknown',
                        lastName: 'Agent',
                        profilePictureUrl: '',
                        cellPhoneNo: 'N/A',
                        email: '',
                        brokerageName: 'Real Estate',
                        specialties: ['Real Estate'],
                        yearsExperience: 5,
                        languages: ['English', 'Tagalog'],
                        licenseNumber: ''
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

    // FIXED: Enhanced handleOpenChat with complete data
    const handleOpenChat = (record) => {
        const agentData = getSafeAgentData(record.agentId);
        const propertyData = getSafePropertyData(record.propertyId);

        console.log('📱 Opening chat with data:', { agentData, propertyData, record });

        navigate('/messages', {
            state: {
                propertyChat: {
                    agent: {
                        id: record.agentId,
                        baseMemberId: record.agentId,
                        name: agentData.name,
                        firstName: agentData.firstName || agentData.name?.split(' ')[0] || 'Agent',
                        lastName: agentData.lastName || agentData.name?.split(' ')[1] || '',
                        profilePicture: agentData.profilePicture,
                        cellPhoneNo: agentData.phone,
                        email: agentData.email,
                        brokerageName: agentData.brokerageName,
                        title: 'Real Estate Agent'
                    },
                    property: {
                        id: record.propertyId,
                        title: propertyData.title,
                        address: propertyData.address,
                        price: propertyData.price,
                        mainImage: propertyData.mainImage,
                        bedrooms: propertyData.bedrooms,
                        bathrooms: propertyData.bathrooms,
                        areaSqft: propertyData.areaSqm,
                        city: propertyData.city,
                        state: propertyData.state,
                        propertyType: 'Property'
                    },
                    chatType: 'property_chat',
                    timestamp: new Date().toISOString()
                },
                _debug: {
                    source: 'SchedulingPage',
                    appointmentId: record.id,
                    agentId: record.agentId,
                    propertyId: record.propertyId
                }
            }
        });
    };

    const handleOpenRating = (record) => {
        console.log('Opening rating modal for appointment:', record);
        console.log('Appointment status:', record.status);
        console.log('Has existing rating:', existingRatings[record.id]);
        setSelectedAppointment(record);
        setIsRatingModalVisible(true);
    };

    const handleCloseRating = () => {
        console.log('Closing rating modal');
        setIsRatingModalVisible(false);
        setSelectedAppointment(null);
        // Reload data to refresh the rating status
        loadAllData();
    };

    const getStatusColor = (status) => {
        const colors = {
            'Scheduled': '#1B3C53',
            'Completed': '#52c41a',
            'Cancelled': '#ff4d4f',
            'Rescheduled': '#fa8c16',
            'Pending': '#faad14'
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
        if (!scheduleService || !selectedAppointment?.agentId) {
            return timeSlots.map(slot => ({ ...slot, isAvailable: true }));
        }

        const updatedSlots = [];
        const agentId = parseInt(selectedAppointment.agentId);

        for (const slot of timeSlots) {
            try {
                const slotDate = createLocalDate(date, slot.time);

                if (slotDate <= new Date()) {
                    updatedSlots.push({ ...slot, isAvailable: false });
                    continue;
                }

                const apiDateString = formatDateForAPI(slotDate);
                const isAvailable = await scheduleService.checkTimeSlotAvailability(
                    agentId,
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

    // Load availability when day changes
    const loadAvailability = async (date = selectedDay) => {
        if (!selectedAppointment) return;

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
        setScheduleDate(date);
        setScheduleTime(time);

        // FIXED: Avoid circular references by using simple values
        modifyForm.setFieldsValue({
            date: dayjs(date),
            time: dayjs(`2000-01-01T${time}`)
        });

        console.log('✅ Time slot selected:', { date, time });
    };

    const handleDaySelection = async (date) => {
        setSelectedDay(date);
        await loadAvailability(date);
    };

    // FIXED: Modify Schedule functionality
    const handleModifySchedule = (appointment) => {
        setSelectedAppointment(appointment);
        setCurrentView('modify');
        setSelectedDay(getTodayDate());

        // Pre-fill the form with current appointment data
        const appointmentDate = new Date(appointment.scheduleTime);
        const dateString = appointmentDate.toISOString().split('T')[0];
        const timeString = appointmentDate.toTimeString().split(':').slice(0, 2).join(':');

        modifyForm.setFieldsValue({
            date: dayjs(dateString),
            time: dayjs(`2000-01-01T${timeString}`),
            notes: appointment.notes || ''
        });

        // Load availability for the current agent
        loadAvailability();
    };

    const handleModifySubmit = async (values) => {
        if (isSubmitting) {
            console.log('⏳ Schedule modification already in progress, skipping duplicate');
            return;
        }

        setIsSubmitting(true);
        setModifyError('');

        try {
            console.log('🚀 Starting schedule modification...');

            const selectedDate = values.date.format('YYYY-MM-DD');
            const selectedTime = values.time.format('HH:mm');
            const selectedDateTime = createLocalDate(selectedDate, selectedTime);

            if (selectedDateTime <= new Date()) {
                setModifyError('Please select a future date and time');
                return;
            }

            // FIXED: Convert to UTC format for backend
            const apiDateString = selectedDateTime.toISOString(); // This creates UTC format
            const apiEndDateString = new Date(selectedDateTime.getTime() + 60 * 60 * 1000).toISOString();

            console.log('📅 Date conversion:', {
                local: selectedDateTime.toString(),
                utc: apiDateString,
                localTime: formatDateForAPI(selectedDateTime),
                utcTime: apiDateString
            });

            console.log('📅 Checking availability...');
            // Check availability - use the same UTC format
            const availabilityResponse = await scheduleService.checkTimeSlotAvailability(
                parseInt(selectedAppointment.agentId),
                apiDateString // Use UTC format for consistency
            );

            const isAvailable = availabilityResponse?.isAvailable ?? availabilityResponse;
            if (!isAvailable) {
                setModifyError('This time slot is not available. Please choose a different time.');
                return;
            }

            // FIXED: Use UTC date format for backend
            const updateData = {
                id: parseInt(selectedAppointment.id),
                propertyId: parseInt(selectedAppointment.propertyId),
                agentId: parseInt(selectedAppointment.agentId),
                clientId: parseInt(selectedAppointment.clientId),
                scheduleTime: apiDateString, // UTC format
                scheduleEndTime: apiEndDateString, // UTC format
                notes: values.notes || selectedAppointment.notes || '',
                status: selectedAppointment.status || "Pending",
                meetingType: selectedAppointment.meetingType || 'InPerson',
                meetingLocation: selectedAppointment.meetingLocation || '',
                virtualMeetingLink: selectedAppointment.virtualMeetingLink || '',
                scheduleNo: selectedAppointment.scheduleNo || '',
                cancellationReason: selectedAppointment.cancellationReason || '',
                rescheduleReason: selectedAppointment.rescheduleReason || '',
                createdAt: selectedAppointment.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            console.log('📤 Updating schedule with UTC dates:', updateData);

            // Use the updateSchedule method from service
            const updatedAppointment = await scheduleService.updateSchedule(selectedAppointment.id, updateData);
            console.log('✅ Schedule updated successfully:', updatedAppointment);

            // Show success message
            message.success('Appointment rescheduled successfully!');

            // Move back to main view
            setCurrentView('main');

            // Reload data to reflect changes
            loadAllData();

        } catch (error) {
            console.error('❌ Error modifying schedule:', error);

            // Enhanced error handling
            if (error.response) {
                console.error('🔍 Backend error details:', {
                    status: error.response.status,
                    statusText: error.response.statusText,
                    data: error.response.data
                });

                if (error.response.status === 400) {
                    // Show specific validation errors if available
                    if (error.response.data?.errors) {
                        const errorMessages = Object.values(error.response.data.errors).flat();
                        setModifyError(`Validation errors: ${errorMessages.join(', ')}`);
                    } else if (error.response.data) {
                        // Show the actual backend error message
                        setModifyError(`Backend error: ${JSON.stringify(error.response.data)}`);
                    } else {
                        setModifyError('Invalid data. Please check your inputs and try again.');
                    }
                } else if (error.response.status === 404) {
                    setModifyError('Appointment not found. It may have been deleted.');
                } else {
                    setModifyError(error.response.data?.message || 'Failed to reschedule appointment.');
                }
            } else {
                setModifyError(error.message || 'Failed to reschedule appointment. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };
    // FIXED: Enhanced handleCancelAppointment function
    const handleCancelAppointment = async (appointment) => {
        try {
            console.log('🗑️ Cancelling appointment:', appointment.id);

            // Use the cancelSchedule method from service
            const result = await scheduleService.cancelSchedule(
                appointment.id,
                'Cancelled by client from scheduling page'
            );

            if (result) {
                message.success('Appointment cancelled successfully!');
                // Reload data to reflect changes
                loadAllData();
            } else {
                message.error('Failed to cancel appointment');
            }
        } catch (error) {
            console.error('❌ Error cancelling appointment:', error);

            // More specific error handling
            if (error.response) {
                const errorData = error.response.data;
                console.error('🔍 Backend error details:', errorData);

                if (error.response.status === 400) {
                    message.error(errorData?.message || 'Cannot cancel this appointment. It may be completed or already cancelled.');
                } else if (error.response.status === 404) {
                    message.error('Appointment not found. It may have been already deleted.');
                } else if (error.response.status === 409) {
                    message.error('Cannot cancel a completed or cancelled appointment.');
                } else {
                    message.error(errorData?.message || 'Failed to cancel appointment. Please try again.');
                }
            } else if (error.request) {
                message.error('Network error: Unable to connect to server. Please check your connection.');
            } else {
                message.error(error.message || 'Failed to cancel appointment. Please try again.');
            }
        }
    };

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

    // Agent Information Component
    const AgentInfo = ({ agent }) => {
        const agentName = agent ? `${agent.firstName || ''} ${agent.lastName || ''}`.trim() : agent?.name || 'Contact Agent';
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
                    <Avatar
                        size={60}
                        src={agent?.profilePictureUrl || agent?.profilePicture}
                        icon={<UserOutlined />}
                        style={{
                            backgroundColor: (agent?.profilePictureUrl || agent?.profilePicture) ? 'transparent' : '#1B3C53',
                            border: '3px solid #1B3C53',
                            flexShrink: 0
                        }}
                    />

                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                            <Text strong style={{ fontSize: '16px', color: '#1B3C53' }}>{agentName}</Text>
                            <Tag color="gold" style={{ margin: 0, fontSize: '10px', padding: '2px 6px' }}>
                                👑 ASSIGNED AGENT
                            </Tag>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <Rate
                                disabled
                                value={rating}
                                style={{ fontSize: '14px' }}
                            />
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
                                <MailOutlined style={{ fontSize: '12px', color: '#1B3C53' }} />
                                <Text style={{ fontSize: '12px' }}>
                                    {agent?.email || 'Email not provided'}
                                </Text>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <PhoneOutlined style={{ fontSize: '12px', color: '#1B3C53' }} />
                                <Text style={{ fontSize: '12px' }}>
                                    {agent?.phone || agent?.cellPhoneNo || 'Phone not provided'}
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

    // SUCCESS VIEW COMPONENT
    const SuccessView = () => (
        <div style={{ padding: '40px 24px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <Result
                icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                title="Appointment Rescheduled Successfully!"
                subTitle="Your property tour has been rescheduled and the agent has been notified."
                extra={[
                    <Button
                        type="primary"
                        key="view-details"
                        onClick={() => setCurrentView('waiting-confirmation')}
                        size="large"
                    >
                        View Appointment Details
                    </Button>,
                    <Button
                        key="back-to-schedule"
                        onClick={() => {
                            setCurrentView('main');
                            modifyForm.resetFields();
                            setSelectedDay(getTodayDate());
                            setAvailableTimeSlots([]);
                            setSelectedAppointment(null);
                        }}
                        size="large"
                    >
                        Back to Appointments
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
                                    <Text strong>Appointment Rescheduled</Text>
                                    <br />
                                    <Text type="secondary">Your request has been sent to the agent</Text>
                                </>
                            ),
                        },
                        {
                            color: 'blue',
                            dot: <ClockCircleOutlined />,
                            children: (
                                <>
                                    <Text strong>Agent Confirmation</Text>
                                    <br />
                                    <Text type="secondary">Waiting for the agent to confirm your new schedule</Text>
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
    const WaitingConfirmationView = () => {
        const breadcrumbItems = [
            {
                title: <a onClick={() => setCurrentView('main')}>Appointments</a>,
            },
            {
                title: 'Appointment Confirmation',
            },
        ];

        return (
            <div style={{ padding: '40px 24px', maxWidth: '800px', margin: '0 auto' }}>
                <Breadcrumb items={breadcrumbItems} style={{ marginBottom: '24px' }} />

                <Card>
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <ClockCircleOutlined style={{ fontSize: '64px', color: '#1890ff', marginBottom: '16px' }} />
                        <Title level={2} style={{ color: '#1890ff' }}>Waiting for Agent Confirmation</Title>
                        <Text type="secondary" style={{ fontSize: '16px' }}>
                            Your reschedule request has been sent to the agent. They will confirm within 24 hours.
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
                                        value={selectedAppointment ? getSafePropertyData(selectedAppointment.propertyId).title : 'N/A'}
                                        valueStyle={{ fontSize: '14px', color: '#1B3C53' }}
                                    />
                                    <Statistic
                                        title="Date & Time"
                                        value={`${scheduleDate} at ${scheduleTime}`}
                                        valueStyle={{ fontSize: '14px' }}
                                    />
                                    <Statistic
                                        title="Agent"
                                        value={selectedAppointment ? getSafeAgentData(selectedAppointment.agentId).name : 'N/A'}
                                        valueStyle={{ fontSize: '14px' }}
                                    />
                                    {modifyForm.getFieldValue('notes') && (
                                        <div>
                                            <Text strong>Notes: </Text>
                                            <Text type="secondary">{modifyForm.getFieldValue('notes')}</Text>
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
                                        Call Agent: {selectedAppointment ? getSafeAgentData(selectedAppointment.agentId).phone : 'N/A'}
                                    </Button>
                                    <Button
                                        icon={<MailFilled />}
                                        block
                                    >
                                        Email Agent: {selectedAppointment ? getSafeAgentData(selectedAppointment.agentId).email : 'N/A'}
                                    </Button>
                                    <Button
                                        icon={<MessageOutlined />}
                                        block
                                        onClick={() => selectedAppointment && handleOpenChat(selectedAppointment)}
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
                                onClick={() => {
                                    setCurrentView('main');
                                    // Reset scheduling states
                                    modifyForm.resetFields();
                                    setSelectedDay(getTodayDate());
                                    setAvailableTimeSlots([]);
                                    setSelectedAppointment(null);
                                }}
                                size="large"
                            >
                                Back to Appointments
                            </Button>
                            <Button
                                onClick={() => setCurrentView('modify')}
                                size="large"
                            >
                                Modify Appointment
                            </Button>
                        </Space>
                    </div>
                </Card>
            </div>
        );
    };

    // MODIFY SCHEDULE VIEW COMPONENT
    const ModifyScheduleView = () => {
        const propertyData = selectedAppointment ? getSafePropertyData(selectedAppointment.propertyId) : {};
        const agentData = selectedAppointment ? getSafeAgentData(selectedAppointment.agentId) : {};
        const next7Days = getNext7Days();

        const breadcrumbItems = [
            {
                title: <a onClick={() => setCurrentView('main')}>Appointments</a>,
            },
            {
                title: 'Modify Schedule',
            },
        ];

        return (
            <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
                {/* Breadcrumb Navigation */}
                <Breadcrumb items={breadcrumbItems} style={{ marginBottom: '24px' }} />

                {/* Back Button */}
                <Button
                    type="text"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => {
                        setCurrentView('main');
                        modifyForm.resetFields();
                        setSelectedDay(getTodayDate());
                        setAvailableTimeSlots([]);
                    }}
                    style={{ marginBottom: '20px' }}
                >
                    Back to Appointments
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
                                src={propertyData?.mainImage || '/default-property.jpg'}
                                alt={propertyData?.title}
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
                                {propertyData?.title}
                            </Title>
                            <Text type="secondary" style={{ fontSize: '16px' }}>
                                {propertyData?.address}
                            </Text>
                            <div style={{ marginTop: '8px' }}>
                                <Text strong style={{ fontSize: '18px', color: '#1B3C53' }}>
                                    {propertyData?.price ? formatPrice(propertyData.price) : 'Price not set'}
                                </Text>
                            </div>
                        </Col>
                    </Row>
                </div>

                {/* Progress Steps */}
                <Steps
                    current={1}
                    style={{ marginBottom: '32px' }}
                    items={[
                        {
                            title: 'Select New Time',
                            description: 'Choose new date & time'
                        },
                        {
                            title: 'Confirm Changes',
                            description: 'Review & update'
                        }
                    ]}
                />

                <Form
                    form={modifyForm}
                    layout="vertical"
                    onFinish={handleModifySubmit}
                    requiredMark="optional"
                >
                    {/* Agent Information Section */}
                    <div style={{ marginBottom: '24px' }}>
                        <Text strong style={{ display: 'block', marginBottom: '12px', fontSize: '16px' }}>
                            Assigned Agent
                        </Text>
                        <Text type="secondary" style={{ display: 'block', marginBottom: '16px', fontSize: '14px' }}>
                            This agent is assigned to the property and will conduct your tour.
                        </Text>
                        <AgentInfo agent={agentData} />
                    </div>

                    {/* Time Slot Availability Section */}
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

                    {modifyError && (
                        <Alert message={modifyError} type="error" style={{ marginBottom: '16px' }} />
                    )}

                    <Form.Item style={{ marginBottom: 0, textAlign: 'center' }}>
                        <Space size="large">
                            <Button
                                size="large"
                                onClick={() => {
                                    setCurrentView('main');
                                    modifyForm.resetFields();
                                    setSelectedDay(getTodayDate());
                                    setAvailableTimeSlots([]);
                                }}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                size="large"
                                disabled={!selectedAppointment || isSubmitting}
                                loading={isSubmitting}
                                icon={<CalendarOutlined />}
                                style={{ minWidth: '200px' }}
                            >
                                {isSubmitting ? 'Updating...' : `Reschedule with ${agentData?.firstName || agentData?.name || 'Agent'}`}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </div>
        );
    };

    // Property Card Style Appointment Component
    const AppointmentCard = ({ appointment }) => {
        const propertyData = getSafePropertyData(appointment.propertyId);
        const agentData = getSafeAgentData(appointment.agentId);
        const isCompleted = appointment.status === 'Completed';
        const isCancelled = appointment.status === 'Cancelled';
        const isScheduled = appointment.status === 'Scheduled';
        const isRescheduled = appointment.status === 'Rescheduled';
        const isPending = appointment.status === 'Pending';
        const appointmentDate = new Date(appointment.scheduleTime);
        const isToday = appointmentDate.toDateString() === new Date().toDateString();
        const isUpcoming = (isScheduled || isRescheduled || isPending) && !isCancelled && !isCompleted;
        const hasExistingRating = existingRatings[appointment.id];
        const ratingScore = ratingScores[appointment.id] || 0;

        const handleRateClick = (e) => {
            e.stopPropagation();
            console.log('Rate button clicked for appointment:', appointment);
            console.log('Appointment status:', appointment.status);
            console.log('Has existing rating:', hasExistingRating);
            handleOpenRating(appointment);
        };

        const handleViewProperty = (e) => {
            e.stopPropagation();
            navigate('/properties/view', {
                state: { propertyId: appointment.propertyId }
            });
        };

        // Render accurate star rating based on actual score
        const renderStarRating = (score) => {
            const stars = [];
            const fullStars = Math.floor(score);
            const hasHalfStar = score % 1 !== 0;

            // Full stars
            for (let i = 0; i < fullStars; i++) {
                stars.push(<StarFilled key={`full-${i}`} style={{ color: '#ffc107', fontSize: '14px' }} />);
            }

            // Half star
            if (hasHalfStar) {
                stars.push(<StarFilled key="half" style={{ color: '#ffc107', fontSize: '14px', opacity: 0.7 }} />);
            }

            // Empty stars
            const emptyStars = 5 - Math.ceil(score);
            for (let i = 0; i < emptyStars; i++) {
                stars.push(<StarOutlined key={`empty-${i}`} style={{ color: '#e0e0e0', fontSize: '14px' }} />);
            }

            return (
                <Tooltip title={`Rated ${score.toFixed(1)} out of 5`}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {stars}
                        <Text style={{ fontSize: '11px', color: '#666', marginLeft: 4, fontWeight: 500 }}>
                            {score.toFixed(1)}
                        </Text>
                    </div>
                </Tooltip>
            );
        };

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
                {/* Top Action Buttons - VERTICALLY ALIGNED */}
                <div style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    zIndex: 10,
                    display: 'flex',
                    flexDirection: 'column', // Changed to column for vertical alignment
                    gap: '8px'
                }}>
                    {isUpcoming && (
                        <>
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
                                    height: '32px',
                                    fontSize: '13px',
                                    padding: '0 12px',
                                    width: '100px' // Fixed width for consistency
                                }}
                            >
                                Message
                            </Button>
                            <Button
                                size="small"
                                type="default"
                                icon={<EditOutlined />}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleModifySchedule(appointment);
                                }}
                                style={{
                                    background: '#fa8c16',
                                    borderColor: '#fa8c16',
                                    color: 'white',
                                    fontWeight: 600,
                                    borderRadius: '6px',
                                    height: '32px',
                                    fontSize: '13px',
                                    padding: '0 12px',
                                    width: '100px' // Fixed width for consistency
                                }}
                            >
                                Modify
                            </Button>
                            <Popconfirm
                                title="Cancel Appointment"
                                description="Are you sure you want to cancel this appointment?"
                                onConfirm={() => handleCancelAppointment(appointment)}
                                okText="Yes"
                                cancelText="No"
                            >
                                <Button
                                    size="small"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={(e) => e.stopPropagation()}
                                    style={{
                                        fontWeight: 600,
                                        borderRadius: '6px',
                                        height: '32px',
                                        fontSize: '13px',
                                        padding: '0 12px',
                                        width: '100px' // Fixed width for consistency
                                    }}
                                >
                                    Cancel
                                </Button>
                            </Popconfirm>
                        </>
                    )}
                    {isCompleted && !hasExistingRating && (
                        <Button
                            size="small"
                            type="primary"
                            icon={<StarOutlined />}
                            onClick={handleRateClick}
                            style={{
                                background: '#1B3C53',
                                border: 'none',
                                fontWeight: 600,
                                borderRadius: '6px',
                                height: '32px',
                                fontSize: '13px',
                                padding: '0 12px',
                                width: '140px' // Wider for longer text
                            }}
                        >
                            Rate Experience
                        </Button>
                    )}
                    {isCompleted && hasExistingRating && (
                        <Tooltip title={`You rated this ${ratingScore.toFixed(1)} stars`}>
                            <Button
                                size="small"
                                type="default"
                                style={{
                                    background: '#fffbe6',
                                    borderColor: '#ffe58f',
                                    color: '#faad14',
                                    fontWeight: 600,
                                    borderRadius: '6px',
                                    height: '32px',
                                    fontSize: '13px',
                                    padding: '0 12px',
                                    width: '100px', // Fixed width for consistency
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6
                                }}
                                disabled
                            >
                                <StarFilled style={{ color: '#faad14' }} />
                                {ratingScore.toFixed(1)}
                            </Button>
                        </Tooltip>
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

                        {/* Agent Info */}
                        <Col xs={24} sm={12}>
                            <Space direction="vertical" size="small" style={{ width: '100%' }}>
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

                                {/* Reduced gap divider */}
                                <Divider style={{
                                    margin: '12px 0 8px 0',
                                    borderColor: '#f0f0f0'
                                }} />

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
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <Text strong style={{ color: '#1B3C53', fontSize: '14px' }}>
                                                    {formatPrice(propertyData.price)}
                                                </Text>
                                                {/* SEE PROPERTY LINK ADDED HERE */}
                                                <Button
                                                    type="link"
                                                    size="small"
                                                    onClick={handleViewProperty}
                                                    style={{
                                                        padding: 0,
                                                        height: 'auto',
                                                        fontSize: '12px',
                                                        color: '#1B3C53',
                                                        fontWeight: 500,
                                                        textDecoration: 'underline'
                                                    }}
                                                    icon={<EyeFilled style={{ fontSize: '10px' }} />}
                                                >
                                                    See Property
                                                </Button>
                                            </div>
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
                            </Space>
                        </Col>

                        {/* Actions */}
                        <Col xs={24} sm={6}>
                            <Space direction="vertical" style={{ width: '100%' }} size="small">
                                {/* Actions are now in the top right corner */}
                            </Space>
                        </Col>
                    </Row>

                    {/* Status and Rating Badge */}
                    <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Tag
                            color={getStatusColor(appointment.status)}
                            style={{
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                fontSize: '11px'
                            }}
                        >
                            {appointment.status}
                        </Tag>
                        {isCompleted && hasExistingRating && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                {renderStarRating(ratingScore)}
                            </div>
                        )}
                    </div>

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

                    {/* FIXED: Meeting Details Section */}
                    {(appointment.meetingType === 'Virtual' && appointment.virtualMeetingLink) ||
                        (appointment.meetingType === 'InPerson' && appointment.meetingLocation) && (
                            <>
                                <Divider style={{ margin: '16px 0', borderColor: '#f0f0f0' }} />
                                <div style={{
                                    background: '#f0f8ff',
                                    padding: '12px 16px',
                                    borderRadius: '8px',
                                    fontSize: '13px'
                                }}>
                                    <div style={{ fontWeight: 600, marginBottom: 8, color: '#1B3C53', display: 'flex', alignItems: 'center', gap: 6 }}>
                                        {appointment.meetingType === 'Virtual' ? (
                                            <VideoCameraOutlined style={{ color: '#1B3C53' }} />
                                        ) : (
                                            <EnvironmentOutlined style={{ color: '#1B3C53' }} />
                                        )}
                                        Meeting Details:
                                    </div>

                                    {appointment.meetingType === 'Virtual' && appointment.virtualMeetingLink && (
                                        <div style={{ marginBottom: 6 }}>
                                            <Text strong style={{ color: '#1B3C53' }}>Video Link: </Text>
                                            <a
                                                href={appointment.virtualMeetingLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ color: '#1890ff', textDecoration: 'underline' }}
                                            >
                                                Join Virtual Meeting
                                            </a>
                                        </div>
                                    )}

                                    {appointment.meetingType === 'InPerson' && appointment.meetingLocation && (
                                        <div style={{ marginBottom: 6 }}>
                                            <Text strong style={{ color: '#1B3C53' }}>Location: </Text>
                                            <Text>{appointment.meetingLocation}</Text>
                                        </div>
                                    )}

                                    <div>
                                        <Text strong style={{ color: '#1B3C53' }}>Type: </Text>
                                        <Text>{getMeetingTypeText(appointment.meetingType)}</Text>
                                    </div>
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
                return appointments.filter(app => app.status === 'Scheduled' || app.status === 'Rescheduled' || app.status === 'Pending');
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

    // MAIN VIEW COMPONENT
    const MainView = () => (
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
                            />
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
                            />
                        ) : (
                            appointments.map(appointment => (
                                <AppointmentCard key={appointment.id} appointment={appointment} />
                            ))
                        )}
                    </TabPane>
                </Tabs>
            </Card>

            {/* Rating Modal - Fixed with proper state management */}
            <Modal
                open={isRatingModalVisible}
                onCancel={handleCloseRating}
                footer={null}
                width={800}
                style={{ top: 20 }}
                destroyOnClose={true}
                maskClosable={false}
            >
                {selectedAppointment && (
                    <BaseRating
                        appointment={selectedAppointment}
                        onClose={handleCloseRating}
                    />
                )}
            </Modal>
        </div>
    );

    // Main Render - Switch between views
    switch (currentView) {
        case 'success':
            return <SuccessView />;
        case 'waiting-confirmation':
            return <WaitingConfirmationView />;
        case 'modify':
            return <ModifyScheduleView />;
        default:
            return <MainView />;
    }
};

export default SchedulingPage;