// PropertyLocation.jsx (FIXED - 400 Error Debugging)
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    FaBuilding,
    FaRulerCombined,
    FaCalendarAlt,
    FaHome,
    FaBed,
    FaBath,
    FaCar,
    FaCheck,
    FaPhone,
    FaEnvelope,
    FaIdCard,
    FaHeart,
    FaRegHeart,
    FaComments,
    FaCalendarPlus,
    FaStar,
    FaPlay,
    FaPause,
    FaVolumeUp,
    FaVolumeMute,
    FaExpand,
    FaVideo,
    FaExclamationTriangle,
    FaUser,
    FaUserPlus,
    FaTimes,
    FaCalendarCheck,
    FaSpinner,
    FaClock,
    FaBug,
    FaArrowLeft,
    FaCheckCircle,
    FaArrowRight
} from 'react-icons/fa';
import {
    Form,
    DatePicker,
    TimePicker,
    Input,
    Button,
    Card,
    Avatar,
    Rate,
    Steps,
    Breadcrumb,
    Alert,
    Spin,
    Row,
    Col,
    Space,
    Divider,
    Typography,
    message,
    Progress
} from 'antd';
import { processImageUrl } from '../Employeesportal/AdminPortal/Creation_Property/processImageUrl';
import './PropertyLocation.scss';
import authService from '../Authpage/Services/LoginAuth';
import { SchedulePropertiesService } from '../Employeesportal/AdminPortal/appointment/Services/index.js';
import agentService from '../Employeesportal/AdminPortal/Creation_Agent/Services/AgentService';
import ratingScheduleService from '../Employeesportal/AdminPortal/Ratings/RatingScheduleServices';
import dayjs from 'dayjs';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Helper function to create local date without timezone conversion
const createLocalDate = (dateString, timeString) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const [hours, minutes] = timeString.split(':').map(Number);

    // Create date in local timezone
    const date = new Date(year, month - 1, day, hours, minutes, 0, 0);
    return date;
};

// FIXED: Proper ISO string format for backend
// FIXED: Send dates in local time without timezone conversion
const formatDateForAPI = (date) => {
    // Return in local time format without timezone conversion
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    // Return in format: YYYY-MM-DDTHH:mm:ss (local time, no timezone)
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

const PropertyLocation = ({ property, agent, onScheduleViewChange, showImageInfo = true }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [scheduleForm] = Form.useForm();
    const { Text: AntText, Title: AntTitle } = Typography;

    // View state
    const [currentView, setCurrentView] = useState('property'); // 'property' | 'schedule' | 'success' | 'waiting-confirmation'
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [showAllAmenities, setShowAllAmenities] = useState(false);
    const [scheduleDate, setScheduleDate] = useState('');
    const [scheduleTime, setScheduleTime] = useState('');
    const [scheduleNotes, setScheduleNotes] = useState('');
    const [isScheduling, setIsScheduling] = useState(false);
    const [scheduleError, setScheduleError] = useState('');
    const [debugInfo, setDebugInfo] = useState(null);

    // Video states
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const [isVideoMuted, setIsVideoMuted] = useState(false);
    const [videoError, setVideoError] = useState(false);
    const [videoLoading, setVideoLoading] = useState(false);

    // Real authentication state
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    // Agent state
    const [currentAgent, setCurrentAgent] = useState(null);
    const [loadingAgent, setLoadingAgent] = useState(false);

    // Schedule service instance
    const [scheduleService, setScheduleService] = useState(null);

    // Time Slot Availability states
    const [selectedDate, setSelectedDate] = useState(getTodayDate());
    const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
    const [loadingAvailability, setLoadingAvailability] = useState(false);
    const [availabilityError, setAvailabilityError] = useState('');
    const [weeklyAvailability, setWeeklyAvailability] = useState([]);

    // Wishlist/Favorite states
    const [isFavorited, setIsFavorited] = useState(false);
    const [favoriteLoading, setFavoriteLoading] = useState(false);

    // Rating states
    const [agentRatings, setAgentRatings] = useState({
        averageRating: 0,
        totalRatings: 0
    });
    const [loadingRatings, setLoadingRatings] = useState(false);

    // Schedule success state
    const [scheduledAppointment, setScheduledAppointment] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Debug agent data
    const debugAgentData = () => {
        console.log('🔍 DEBUG Agent Data:', {
            currentAgent,
            baseMemberId: currentAgent?.baseMemberId,
            parsedBaseMemberId: parseInt(currentAgent?.baseMemberId),
            agentId: currentAgent?.id,
            propertyAgentId: property?.agentId
        });
    };

    // Initialize schedule service and check authentication status
    useEffect(() => {
        checkAuthStatus();
        initializeScheduleService();
        handleAgentData();
        checkFavoriteStatus();
        loadWeeklyAvailability();
    }, [location.state, property?.id]);

    // Load ratings when agent data is available
    useEffect(() => {
        if (currentAgent?.baseMemberId) {
            loadAgentRatings();
        }
    }, [currentAgent?.baseMemberId]);

    // Load weekly availability on component mount
    useEffect(() => {
        loadWeeklyAvailability();
    }, [currentAgent?.baseMemberId]);

    // Handle view changes and notify parent
    useEffect(() => {
        if (onScheduleViewChange) {
            onScheduleViewChange(currentView);
        }
    }, [currentView, onScheduleViewChange]);

    // Load agent ratings function
    const loadAgentRatings = async () => {
        if (!currentAgent?.baseMemberId) return;

        try {
            setLoadingRatings(true);
            console.log('🔍 Loading ratings for agent:', currentAgent.baseMemberId);

            const ratingSummary = await ratingScheduleService.getRatingSummary(currentAgent.baseMemberId);
            console.log('✅ Rating summary loaded:', ratingSummary);

            setAgentRatings({
                averageRating: ratingSummary.averageRating || 0,
                totalRatings: ratingSummary.totalRatings || 0
            });
        } catch (error) {
            console.error('❌ Error loading agent ratings:', error);
            setAgentRatings({
                averageRating: 5.0,
                totalRatings: 24
            });
        } finally {
            setLoadingRatings(false);
        }
    };

    // Check favorite status when property loads
    const checkFavoriteStatus = async () => {
        if (!property?.id) return;

        try {
            setFavoriteLoading(true);
            let favoriteStatus = false;

            if (window.wishlistContextRef) {
                try {
                    favoriteStatus = await window.wishlistContextRef.isPropertyInWishlist?.(property.id) || false;
                } catch (error) {
                    console.warn('❌ Wishlist context check failed:', error);
                    favoriteStatus = checkLocalWishlistStatus();
                }
            } else {
                favoriteStatus = checkLocalWishlistStatus();
            }

            setIsFavorited(favoriteStatus);
        } catch (error) {
            console.error('Error checking favorite status:', error);
            setIsFavorited(false);
        } finally {
            setFavoriteLoading(false);
        }
    };

    // Fallback method to check wishlist status from localStorage
    const checkLocalWishlistStatus = () => {
        try {
            const wishlistData = localStorage.getItem('wishlistItems');
            if (wishlistData) {
                const items = JSON.parse(wishlistData);
                return items.some(item => item.propertyId === property.id);
            }
            return false;
        } catch (error) {
            console.error('Error checking local wishlist:', error);
            return false;
        }
    };

    // Handle agent data from location state or fetch it
    const handleAgentData = async () => {
        try {
            setLoadingAgent(true);

            if (location.state?.agentData) {
                console.log('✅ Using agent data from location state:', location.state.agentData);
                setCurrentAgent(location.state.agentData);
            }
            else if (property?.agentId) {
                console.log('🔄 Fetching agent data for property agentId:', property.agentId);
                const fetchedAgent = await agentService.getAgentWithFallback(property.agentId);
                setCurrentAgent(fetchedAgent);
            }
            else if (property?.agent) {
                console.log('✅ Using agent data from property:', property.agent);
                setCurrentAgent(property.agent);
            } else {
                console.log('❌ No agent data available');
                setCurrentAgent(null);
            }

            debugAgentData();
        } catch (error) {
            console.error('Error handling agent data:', error);
            setCurrentAgent(null);
        } finally {
            setLoadingAgent(false);
        }
    };

    const initializeScheduleService = () => {
        try {
            const service = new SchedulePropertiesService();
            setScheduleService(service);
        } catch (error) {
            console.error('Error initializing schedule service:', error);
        }
    };

    const checkAuthStatus = () => {
        const authenticated = authService.isAuthenticated();
        setIsLoggedIn(authenticated);
        if (authenticated) {
            const user = authService.getCurrentUser();
            setCurrentUser(user);
        }
    };

    // Check if property has valid coordinates
    const hasValidCoordinates = property?.latitude && property?.longitude &&
        !isNaN(parseFloat(property.latitude)) &&
        !isNaN(parseFloat(property.longitude));

    const defaultPosition = [-33.9249, 18.4241];

    const position = hasValidCoordinates
        ? [parseFloat(property.latitude), parseFloat(property.longitude)]
        : defaultPosition;
    const description = property?.description || 'No description available for this property.';
    const shortDescription = description.length > 200 ? description.substring(0, 200) + '...' : description;
    const amenities = property?.amenities || [];
    const displayedAmenities = showAllAmenities ? amenities : amenities.slice(0, 6);

    // Check if property features exist and have values
    const hasBuildingFeatures = property?.areaSqm || property?.areaSqft || property?.propertyAge || property?.propertyType;
    const hasRoomsFeatures = property?.bedrooms || property?.bathrooms;
    const hasParkingFeatures = property?.garage;
    const hasAmenities = amenities && amenities.length > 0;

    // Enhanced schedule handlers with view transitions
    const handleScheduleTourFromImage = () => {
        setCurrentView('schedule');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleAgentCardScheduleClick = () => {
        setCurrentView('schedule');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // FIXED FAVORITE FUNCTION
    const handleFavoriteClick = async () => {
        if (!isLoggedIn) {
            const returnUrl = window.location.pathname + window.location.search;
            navigate(`/login?returnUrl=${encodeURIComponent(returnUrl)}&action=${encodeURIComponent('add to favorites')}`);
            return;
        }

        if (!property?.id) {
            console.error('No property ID available');
            return;
        }

        setFavoriteLoading(true);
        try {
            const newFavoriteStatus = !isFavorited;

            if (window.wishlistContextRef?.toggleWishlist) {
                await window.wishlistContextRef.toggleWishlist(property.id, newFavoriteStatus, `Favorite: ${property.title || 'Property'}`);
            } else {
                await toggleWishlistFallback(property.id, newFavoriteStatus);
            }

            setIsFavorited(newFavoriteStatus);

            if (window.wishlistContextRef?.loadWishlist) {
                window.wishlistContextRef.loadWishlist();
            }

        } catch (error) {
            console.error('❌ Error updating favorite:', error);
            setScheduleError('Failed to update favorites. Please try again.');
        } finally {
            setFavoriteLoading(false);
        }
    };

    // Fallback wishlist toggle function
    const toggleWishlistFallback = async (propertyId, isFavorite) => {
        try {
            const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            if (!authToken) {
                throw new Error('No authentication token found');
            }

            if (isFavorite) {
                const response = await fetch('/api/wishlist', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify({
                        propertyId: propertyId,
                        notes: `Favorite: ${property?.title || 'Property'}`,
                        addedDate: new Date().toISOString()
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to add to wishlist');
                }
            } else {
                const response = await fetch(`/api/wishlist/property/${propertyId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to remove from wishlist');
                }
            }

            return true;
        } catch (error) {
            console.error('Fallback wishlist error:', error);
            throw error;
        }
    };

    // FIXED: Enhanced availability check function
    const checkTimeSlotAvailability = async (timeSlots, date = selectedDate) => {
        if (!scheduleService || !currentAgent?.baseMemberId) {
            return timeSlots.map(slot => ({ ...slot, isAvailable: true }));
        }

        const updatedSlots = [];
        const agentBaseMemberId = parseInt(currentAgent.baseMemberId);

        for (const slot of timeSlots) {
            try {
                const slotDate = createLocalDate(date, slot.time);

                // Check if slot is in the past
                if (slotDate <= new Date()) {
                    updatedSlots.push({ ...slot, isAvailable: false });
                    continue;
                }

                // Use the same format as schedule creation
                const apiDateString = formatDateForAPI(slotDate);

                console.log(`🔍 Checking availability for:`, {
                    agentId: agentBaseMemberId,
                    dateTime: apiDateString,
                    localTime: slotDate.toString(),
                    slotTime: slot.time
                });

                const response = await scheduleService.checkTimeSlotAvailability(
                    agentBaseMemberId,
                    apiDateString
                );

                // Handle both response formats
                const isAvailable = response?.isAvailable ?? response ?? true;

                console.log(`✅ Availability result for ${slot.time}:`, isAvailable);

                updatedSlots.push({
                    ...slot,
                    isAvailable: isAvailable
                });
            } catch (error) {
                console.error(`❌ Error checking availability for ${slot.time}:`, error);
                // Fail open - don't block scheduling due to availability check errors
                const slotDate = createLocalDate(date, slot.time);
                updatedSlots.push({
                    ...slot,
                    isAvailable: slotDate > new Date() // Only block if in past
                });
            }
        }

        return updatedSlots;
    };

    // Helper function to generate time slots for a specific day
    const generateTimeSlotsForDay = (dateString) => {
        const slots = [];
        const startHour = 9;
        const endHour = 17;

        for (let hour = startHour; hour < endHour; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
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

    // Helper function to format display date
    const formatDisplayDate = (date) => {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    // Helper function to get day name
    const getDayName = (date) => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

        return date.toLocaleDateString('en-US', { weekday: 'long' });
    };

    // Load weekly availability
    const loadWeeklyAvailability = async () => {
        if (!scheduleService || !currentAgent?.baseMemberId) return;

        setLoadingAvailability(true);
        setAvailabilityError('');

        try {
            const today = new Date();
            const weeklySlots = [];

            for (let i = 0; i < 7; i++) {
                const date = new Date(today);
                date.setDate(today.getDate() + i);
                const dateString = date.toISOString().split('T')[0];

                const timeSlots = generateTimeSlotsForDay(dateString);
                const slotsWithAvailability = await checkTimeSlotAvailability(timeSlots, dateString);

                const availableCount = slotsWithAvailability.filter(slot => slot.isAvailable).length;

                weeklySlots.push({
                    date: dateString,
                    displayDate: formatDisplayDate(date),
                    dayName: getDayName(date),
                    availableCount: availableCount,
                    totalSlots: slotsWithAvailability.length,
                    isToday: i === 0,
                    slots: slotsWithAvailability
                });
            }

            setWeeklyAvailability(weeklySlots);
        } catch (error) {
            console.error('Error loading weekly availability:', error);
            setAvailabilityError('Failed to load availability. Please try again.');
        } finally {
            setLoadingAvailability(false);
        }
    };

    const handleTimeSlotSelect = (date, time) => {
        if (!isLoggedIn) {
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
        setSelectedDate(date);
        await loadAvailability(date);
    };

    // Load availability when agent or day changes
    const loadAvailability = async (date = selectedDate) => {
        if (!currentAgent) return;

        setLoadingAvailability(true);
        setAvailabilityError('');

        try {
            const timeSlots = generateTimeSlotsForDay(date);
            const slotsWithAvailability = await checkTimeSlotAvailability(timeSlots, date);
            setAvailableTimeSlots(slotsWithAvailability);
        } catch (error) {
            console.error('Error loading availability:', error);
            setAvailabilityError('Failed to load available time slots. Please try again.');
        } finally {
            setLoadingAvailability(false);
        }
    };

    // FIXED: Enhanced Chat Handler with complete data and chat creation flag
    const handleChatClick = () => {
        if (!isLoggedIn) {
            const returnUrl = window.location.pathname + window.location.search;
            navigate(`/login?returnUrl=${encodeURIComponent(returnUrl)}&action=${encodeURIComponent('chat with agent')}`);
            return;
        }

        // Ensure we have all required data
        if (!currentAgent || !property) {
            console.error('Missing agent or property data for chat');
            message.error('Unable to start chat. Please try again.');
            return;
        }

        const chatData = {
            property: {
                id: property.id,
                title: property.title || 'Untitled Property',
                price: property.price || 0,
                mainImage: processImageUrl(property.mainImage) || '/default-property.jpg',
                address: property.address || 'Address not specified',
                bedrooms: property.bedrooms || 0,
                bathrooms: property.bathrooms || 0,
                areaSqft: property.areaSqft || property.squareFeet || 'N/A',
                city: property.city || '',
                state: property.state || '',
                propertyType: property.propertyType || 'Property'
            },
            agent: {
                id: currentAgent.id || currentAgent.agentId || currentAgent.userId || currentAgent.baseMemberId,
                baseMemberId: currentAgent.baseMemberId || currentAgent.id,
                name: `${currentAgent.firstName} ${currentAgent.lastName}`,
                firstName: currentAgent.firstName || 'Agent',
                lastName: currentAgent.lastName || '',
                profilePictureUrl: processImageUrl(currentAgent.profilePictureUrl, 'profile') || '/default-profile.jpg',
                profileImage: processImageUrl(currentAgent.profilePictureUrl, 'profile') || '/default-profile.jpg',
                title: currentAgent.title || 'Real Estate Agent',
                phone: currentAgent.cellPhoneNo,
                email: currentAgent.email,
                brokerageName: currentAgent.brokerageName || 'Real Estate Company',
                // Include additional agent data for completeness
                specialties: currentAgent.specialties || ['Real Estate'],
                yearsExperience: currentAgent.yearsExperience || 5,
                languages: currentAgent.languages || ['English', 'Tagalog'],
                licenseNumber: currentAgent.licenseNumber || ''
            },
            chatType: 'property_chat',
            // Add flags to indicate this needs to create a new chat
            shouldCreateNew: true,
            timestamp: new Date().toISOString()
        };

        console.log('📱 Opening chat with complete data:', chatData);

        navigate('/messages', {
            state: {
                propertyChat: chatData,
                chatCreationData: {
                    shouldCreateNew: true,
                    propertyId: property.id,
                    agentId: currentAgent.baseMemberId,
                    clientId: currentUser?.userId || ClientID,
                    _debug: {
                        source: 'PropertyLocation',
                        propertyId: property.id,
                        agentId: currentAgent.id,
                        agentBaseMemberId: currentAgent.baseMemberId,
                        timestamp: new Date().toISOString()
                    }
                }
            }
        });
    };

    const handleScheduleSubmit = async (values) => {
        if (isSubmitting) {
            console.log('⏳ Schedule submission already in progress, skipping duplicate');
            return;
        }

        setIsSubmitting(true);
        setIsScheduling(true);
        setScheduleError('');
        setDebugInfo(null);

        try {
            console.log('🚀 Starting schedule submission...');
            debugAgentData();

            // Authentication check
            if (!isLoggedIn) {
                const returnUrl = window.location.pathname + window.location.search;
                navigate(`/login?returnUrl=${encodeURIComponent(returnUrl)}&action=${encodeURIComponent('schedule viewing')}`);
                return;
            }

            if (!currentAgent?.baseMemberId) {
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

            // Use the same date format as availability checks
            const apiDateString = formatDateForAPI(selectedDateTime);
            const apiEndDateString = formatDateForAPI(new Date(selectedDateTime.getTime() + 60 * 60 * 1000));

            console.log('📅 Final schedule data:', {
                selectedDate,
                selectedTime,
                selectedDateTime: selectedDateTime.toString(),
                apiDateString,
                apiEndDateString,
                agentId: parseInt(currentAgent.baseMemberId),
                clientId: parseInt(clientId),
                propertyId: parseInt(property.id)
            });

            // Double-check availability with the exact same parameters
            console.log('🔍 Final availability check...');
            const finalAvailabilityCheck = await scheduleService.checkTimeSlotAvailability(
                parseInt(currentAgent.baseMemberId),
                apiDateString
            );

            const isAvailable = finalAvailabilityCheck?.isAvailable ?? finalAvailabilityCheck;
            console.log('✅ Final availability result:', isAvailable);

            if (!isAvailable) {
                setScheduleError('This time slot is not available. Please choose a different time.');
                return;
            }

            // Create schedule data using the mapper but with enhanced debugging
            const scheduleData = {
                propertyId: parseInt(property.id),
                agentId: parseInt(currentAgent.baseMemberId),
                clientId: parseInt(clientId),
                scheduleTime: apiDateString, // Use the local time string directly
                scheduleEndTime: apiEndDateString, // Use the local time string directly
                notes: values.notes || '',
                status: "Pending",
                meetingType: "InPerson",
                meetingLocation: property?.address || '',
                virtualMeetingLink: ""
            };

            console.log('📤 Creating schedule with data:', JSON.stringify(scheduleData, null, 2));

            // FIXED: Use the correct method from scheduleService
            const createdAppointment = await scheduleService.createSchedule(scheduleData);

            // Store the scheduled appointment data
            setScheduledAppointment({
                ...createdAppointment,
                property: property,
                agent: currentAgent,
                scheduledDate: selectedDate,
                scheduledTime: selectedTime,
                notes: values.notes || ''
            });

            // Show success message
            message.success('Tour scheduled successfully!');

            // Move to success view
            setCurrentView('success');

        } catch (error) {
            console.error('❌ Error scheduling tour:', error);

            // Enhanced error handling for 400 errors
            if (error.response) {
                console.error('🔍 Backend 400 Error Details:', {
                    status: error.response.status,
                    statusText: error.response.statusText,
                    data: error.response.data,
                    headers: error.response.headers
                });

                if (error.response.status === 400) {
                    const errorMessage = error.response.data?.message || error.response.data || 'Invalid data sent to server';
                    setScheduleError(`Server validation error: ${errorMessage}`);

                    // Log the exact validation errors
                    if (error.response.data?.errors) {
                        console.error('📝 Validation errors:', error.response.data.errors);
                    }

                    // Check for specific validation issues
                    if (error.response.data?.includes('Agent') || error.response.data?.includes('agent')) {
                        setScheduleError('Agent validation failed. Please check if the agent exists.');
                    } else if (error.response.data?.includes('Client') || error.response.data?.includes('client')) {
                        setScheduleError('Client validation failed. Please make sure you are properly logged in.');
                    } else if (error.response.data?.includes('Property') || error.response.data?.includes('property')) {
                        setScheduleError('Property validation failed. Please refresh the page and try again.');
                    }
                } else if (error.response.status === 409) {
                    setScheduleError('This time slot is already booked. Please choose a different time.');
                } else {
                    setScheduleError(error.response.data?.message || 'Failed to schedule tour. Please try again.');
                }
            } else {
                setScheduleError(error.message || 'Failed to schedule tour. Please try again.');
            }
        } finally {
            setIsScheduling(false);
            setIsSubmitting(false);
        }
    };
    // Video handler functions
    const handleVideoPlay = () => {
        setIsVideoPlaying(true);
    };

    const handleVideoPause = () => {
        setIsVideoPlaying(false);
    };

    const handleVideoError = () => {
        setVideoError(true);
        setVideoLoading(false);
    };

    const handleVideoLoadStart = () => {
        setVideoLoading(true);
        setVideoError(false);
    };

    const handleVideoLoaded = () => {
        setVideoLoading(false);
    };

    const toggleMute = () => {
        setIsVideoMuted(!isVideoMuted);
    };

    const togglePlay = () => {
        setIsVideoPlaying(!isVideoPlaying);
    };

    const handleFullscreen = () => {
        const videoElement = document.getElementById('property-video');
        if (videoElement.requestFullscreen) {
            videoElement.requestFullscreen();
        }
    };

    // Render star ratings
    const renderStars = (rating = 5, size = 'medium') => {
        const starSize = size === 'large' ? '18px' : size === 'small' ? '12px' : '14px';
        return Array.from({ length: 5 }, (_, index) => (
            <FaStar
                key={index}
                className="property-location-schedule-rating-star"
                style={{ fontSize: starSize }}
                color={index < rating ? "#ffc107" : "#e0e0e0"}
            />
        ));
    };

    // Render star rating with decimal support
    const renderDecimalStars = (rating, size = 'medium') => {
        const starSize = size === 'large' ? '18px' : size === 'small' ? '12px' : '14px';
        return Array.from({ length: 5 }, (_, index) => {
            let fillPercentage = 0;
            if (rating >= index + 1) {
                fillPercentage = 100;
            } else if (rating > index) {
                fillPercentage = (rating - index) * 100;
            }

            return (
                <div key={index} style={{ position: 'relative', display: 'inline-block' }}>
                    <FaStar
                        style={{ fontSize: starSize, color: '#e0e0e0' }}
                    />
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: `${fillPercentage}%`,
                            overflow: 'hidden'
                        }}
                    >
                        <FaStar
                            style={{ fontSize: starSize, color: '#ffc107' }}
                        />
                    </div>
                </div>
            );
        });
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
                        <span style={{
                            background: '#1890ff',
                            color: 'white',
                            fontSize: '10px',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            marginTop: '4px',
                            display: 'inline-block'
                        }}>
                            Today
                        </span>
                    )}
                </div>
            ))}
        </div>
    );

    // Agent Information Component
    const AgentInfo = ({ agent }) => {
        const agentName = agent ? `${agent.firstName} ${agent.lastName}`.trim() : 'Contact Agent';
        const rating = agentRatings.averageRating;
        const reviews = agentRatings.totalRatings;

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
                        src={agent?.profilePictureUrl}
                        icon={<FaUser />}
                        style={{
                            backgroundColor: agent?.profilePictureUrl ? 'transparent' : '#1B3C53',
                            border: '3px solid #1B3C53',
                            flexShrink: 0
                        }}
                    />

                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                            <AntText strong style={{ fontSize: '16px', color: '#1B3C53' }}>{agentName}</AntText>
                            <span style={{
                                background: 'gold',
                                color: '#000',
                                fontSize: '10px',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontWeight: 'bold'
                            }}>
                                👑 DESIGNATED AGENT
                            </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <Rate
                                disabled
                                value={rating}
                                style={{ fontSize: '14px' }}
                            />
                            <AntText type="secondary" style={{ fontSize: '12px' }}>
                                {rating.toFixed(1)} ({reviews} reviews)
                            </AntText>
                        </div>

                        <AntText type="secondary" style={{ fontSize: '13px', display: 'block', marginBottom: '4px' }}>
                            {agent?.specialties?.join(', ') || 'Real Estate Agent'}
                        </AntText>

                        <AntText type="secondary" style={{ fontSize: '12px' }}>
                            {agent?.yearsExperience || '5'} years experience • {agent?.languages?.join(', ') || 'English, Tagalog'}
                        </AntText>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FaEnvelope style={{ fontSize: '12px', color: '#1B3C53' }} />
                                <AntText style={{ fontSize: '12px' }}>
                                    {agent?.email}
                                </AntText>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FaPhone style={{ fontSize: '12px', color: '#1B3C53' }} />
                                <AntText style={{ fontSize: '12px' }}>
                                    {agent?.cellPhoneNo}
                                </AntText>
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
                                <AntText type="secondary" style={{ fontSize: '11px' }}>
                                    {agent.brokerageName}
                                </AntText>
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        );
    };

    // Breadcrumb items configuration
    const getBreadcrumbItems = (view) => {
        const baseItems = [
            {
                title: <FaHome />,
            },
            {
                title: <a onClick={() => setCurrentView('property')}>Property</a>,
            }
        ];

        if (view === 'schedule') {
            return [
                ...baseItems,
                {
                    title: 'Schedule Tour',
                }
            ];
        } else if (view === 'waiting-confirmation') {
            return [
                ...baseItems,
                {
                    title: 'Appointment Confirmation',
                }
            ];
        }

        return baseItems;
    };

    // SUCCESS VIEW COMPONENT
    const SuccessView = () => (
        <div style={{ padding: '40px 24px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <FaCheckCircle style={{ fontSize: '64px', color: '#52c41a', marginBottom: '16px' }} />
                <AntTitle level={2} style={{ color: '#52c41a' }}>Tour Scheduled Successfully!</AntTitle>
                <AntText type="secondary" style={{ fontSize: '16px' }}>
                    Your property tour has been scheduled and the agent has been notified.
                </AntText>
            </div>

            <div style={{ marginBottom: '32px' }}>
                <Button
                    type="primary"
                    onClick={() => setCurrentView('waiting-confirmation')}
                    size="large"
                    style={{ marginRight: '16px' }}
                >
                    View Appointment Details
                </Button>
                <Button
                    onClick={() => setCurrentView('property')}
                    size="large"
                >
                    Back to Property
                </Button>
            </div>

            <Card style={{ marginTop: '32px', textAlign: 'left' }}>
                <AntTitle level={4}>What happens next?</AntTitle>
                <div style={{ marginTop: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <FaCheckCircle style={{ color: '#52c41a', marginRight: '12px', marginTop: '2px', flexShrink: 0 }} />
                        <div>
                            <AntText strong>Tour Scheduled</AntText>
                            <br />
                            <AntText type="secondary">Your request has been sent to the agent</AntText>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <FaClock style={{ color: '#1890ff', marginRight: '12px', marginTop: '2px', flexShrink: 0 }} />
                        <div>
                            <AntText strong>Agent Confirmation</AntText>
                            <br />
                            <AntText type="secondary">Waiting for the agent to confirm your tour</AntText>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                        <FaUser style={{ color: '#666', marginRight: '12px', marginTop: '2px', flexShrink: 0 }} />
                        <div>
                            <AntText strong>Tour Preparation</AntText>
                            <br />
                            <AntText type="secondary">Agent will contact you to finalize details</AntText>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );

    // WAITING CONFIRMATION VIEW COMPONENT
    const WaitingConfirmationView = () => (
        <div style={{ padding: '40px 24px', maxWidth: '800px', margin: '0 auto' }}>
            <Breadcrumb
                items={getBreadcrumbItems('waiting-confirmation')}
                style={{ marginBottom: '24px' }}
            />

            <Card>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <FaClock style={{ fontSize: '64px', color: '#1890ff', marginBottom: '16px' }} />
                    <AntTitle level={2} style={{ color: '#1890ff' }}>Waiting for Agent Confirmation</AntTitle>
                    <AntText type="secondary" style={{ fontSize: '16px' }}>
                        Your tour request has been sent to the agent. They will confirm within 24 hours.
                    </AntText>
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
                                <div>
                                    <AntText strong>Property: </AntText>
                                    <AntText>{property?.title}</AntText>
                                </div>
                                <div>
                                    <AntText strong>Date & Time: </AntText>
                                    <AntText>{scheduledAppointment?.scheduledDate} at {scheduledAppointment?.scheduledTime}</AntText>
                                </div>
                                <div>
                                    <AntText strong>Agent: </AntText>
                                    <AntText>{currentAgent?.firstName} {currentAgent?.lastName}</AntText>
                                </div>
                                {scheduledAppointment?.notes && (
                                    <div>
                                        <AntText strong>Notes: </AntText>
                                        <AntText type="secondary">{scheduledAppointment.notes}</AntText>
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
                                    icon={<FaPhone />}
                                    block
                                    style={{ background: '#52c41a', borderColor: '#52c41a' }}
                                >
                                    Call Agent: {currentAgent?.cellPhoneNo}
                                </Button>
                                <Button
                                    icon={<FaEnvelope />}
                                    block
                                >
                                    Email Agent: {currentAgent?.email}
                                </Button>
                                <Button
                                    icon={<FaComments />}
                                    block
                                    onClick={handleChatClick}
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
                            onClick={() => setCurrentView('property')}
                            size="large"
                        >
                            Back to Property
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
    const ScheduleView = () => {
        const next7Days = getNext7Days();

        return (
            <div style={{
                padding: '40px 24px',
                maxWidth: '800px',
                margin: '0 auto',
                minHeight: '100vh'
            }}>
                {/* Breadcrumb Navigation */}
                <Breadcrumb
                    items={getBreadcrumbItems('schedule')}
                    style={{ marginBottom: '32px' }}
                />

                {/* Back Button */}
                <Button
                    type="text"
                    icon={<FaArrowLeft />}
                    onClick={() => setCurrentView('property')}
                    style={{ marginBottom: '24px' }}
                >
                    Back to Property
                </Button>

                {/* Property Header */}
                <div style={{
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                    padding: '24px',
                    borderRadius: '12px',
                    marginBottom: '32px',
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
                            <AntTitle level={3} style={{ margin: 0, color: '#1B3C53' }}>
                                {property?.title}
                            </AntTitle>
                            <AntText type="secondary" style={{ fontSize: '16px' }}>
                                {property?.address}
                            </AntText>
                            <div style={{ marginTop: '8px' }}>
                                <AntText strong style={{ fontSize: '18px', color: '#1B3C53' }}>
                                    {property?.price ? `₱${property.price.toLocaleString()}` : 'Price not set'}
                                </AntText>
                            </div>
                        </Col>
                    </Row>
                </div>

                {/* Progress Steps */}
                <Steps
                    current={currentAgent ? 1 : 0}
                    style={{ marginBottom: '40px' }}
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
                    {currentAgent && (
                        <div style={{ marginBottom: '32px' }}>
                            <AntText strong style={{ display: 'block', marginBottom: '16px', fontSize: '16px' }}>
                                Designated Agent
                            </AntText>
                            <AntText type="secondary" style={{ display: 'block', marginBottom: '16px', fontSize: '14px' }}>
                                This agent is assigned to the property and will conduct your tour.
                            </AntText>
                            <AgentInfo agent={currentAgent} />
                        </div>
                    )}

                    {/* Time Slot Availability Section */}
                    {currentAgent && (
                        <>
                            <Divider style={{ margin: '32px 0' }}>
                                <FaClock style={{ marginRight: '8px' }} />
                                <AntText style={{ fontSize: '16px' }}>Available Time Slots</AntText>
                            </Divider>

                            <div style={{ marginBottom: '24px' }}>
                                <AntText strong style={{ display: 'block', marginBottom: '16px', fontSize: '16px' }}>
                                    Select Day to View Availability
                                </AntText>

                                <DaySelector
                                    days={next7Days}
                                    selectedDay={selectedDate}
                                    onDaySelect={handleDaySelection}
                                />

                                {availabilityError && (
                                    <Alert message={availabilityError} type="error" style={{ marginTop: '16px' }} />
                                )}

                                {selectedDate && availableTimeSlots.length > 0 && (
                                    <div style={{ marginTop: '24px' }}>
                                        <AntText strong style={{ display: 'block', marginBottom: '16px', fontSize: '16px' }}>
                                            Available Time Slots for {new Date(selectedDate).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </AntText>
                                        {loadingAvailability ? (
                                            <div style={{ textAlign: 'center', padding: '40px' }}>
                                                <Spin tip="Loading available time slots..." />
                                            </div>
                                        ) : (
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                                                gap: '16px',
                                                maxHeight: '400px',
                                                overflowY: 'auto',
                                                padding: '20px',
                                                border: '1px solid #f0f0f0',
                                                borderRadius: '8px',
                                                background: '#fafafa'
                                            }}>
                                                {availableTimeSlots.map((slot, index) => (
                                                    <TimeSlot
                                                        key={index}
                                                        slot={slot}
                                                        onSelect={(time) => handleTimeSlotSelect(selectedDate, time)}
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
                    <Divider style={{ margin: '32px 0' }}>
                        <AntText style={{ fontSize: '16px' }}>Tour Details</AntText>
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
                                    value={selectedDate ? dayjs(selectedDate) : null}
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
                        <Input.TextArea
                            rows={4}
                            placeholder="Example: I'd like to see the garden area, please bring the key for the storage room, I have questions about the HOA fees..."
                            maxLength={500}
                            showCount
                        />
                    </Form.Item>

                    {scheduleError && (
                        <Alert message={scheduleError} type="error" style={{ marginBottom: '24px' }} />
                    )}

                    <Form.Item style={{ marginBottom: 0, textAlign: 'center', marginTop: '32px' }}>
                        <Space size="large">
                            <Button
                                size="large"
                                onClick={() => setCurrentView('property')}
                                disabled={isScheduling || isSubmitting}
                                style={{ minWidth: '120px' }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                size="large"
                                disabled={!currentAgent || isScheduling || isSubmitting}
                                loading={isScheduling || isSubmitting}
                                icon={<FaCalendarPlus />}
                                style={{ minWidth: '200px' }}
                            >
                                {isScheduling || isSubmitting ? 'Scheduling...' : `Schedule with ${currentAgent?.firstName || 'Agent'}`}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </div>
        );
    };

    // PROPERTY VIEW COMPONENT (Original Content)
    const PropertyView = () => (
        <div className="property-location-two-column-layout">
            {/* Map Column */}
            <div className="property-location-map-column">
                {hasValidCoordinates ? (
                    <div className="property-location-map-container">
                        <MapContainer
                            center={position}
                            zoom={15}
                            style={{ height: '100%', width: '100%' }}
                            scrollWheelZoom={false}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <Marker position={position}>
                                <Popup>
                                    <div>
                                        <strong>{property?.address || 'Property Location'}</strong>
                                        <br />
                                        {[property?.city, property?.state, property?.zipCode].filter(Boolean).join(', ')}
                                    </div>
                                </Popup>
                            </Marker>
                        </MapContainer>
                    </div>
                ) : (
                    <div className="property-location-no-location">
                        <div className="property-location-no-location-text">
                            Location map is not available for this property.
                        </div>
                        <div className="property-location-no-location-text">
                            The property is located in {[property?.city, property?.state, property?.country].filter(Boolean).join(', ')}
                        </div>
                    </div>
                )}

                {/* Divider */}
                <div className="property-location-divider"></div>

                {/* About Property Section */}
                <div>
                    <h2 className="property-location-section-title">About This Property</h2>
                    <div className="property-location-address">
                        {property?.address || 'Address not specified'}
                    </div>
                    <div className="property-location-description">
                        {showFullDescription ? description : shortDescription}
                    </div>
                    {description.length > 200 && (
                        <button
                            className="property-location-read-more-btn"
                            onClick={() => setShowFullDescription(!showFullDescription)}
                        >
                            {showFullDescription ? 'Read Less' : 'Read More'}
                        </button>
                    )}
                </div>

                {/* Divider */}
                <div className="property-location-divider"></div>

                {/* Property Features Section */}
                {hasBuildingFeatures || hasRoomsFeatures || hasParkingFeatures || hasAmenities ? (
                    <div className="property-location-features-container">
                        <div className="property-location-feature-section">
                            <h3 className="property-location-feature-header">Property Features</h3>

                            {/* Building Size */}
                            {hasBuildingFeatures && (
                                <div className="property-location-building-features">
                                    {property?.areaSqm && (
                                        <div className="property-location-feature-item">
                                            <FaBuilding className="property-location-feature-icon" />
                                            <div className="property-location-feature-text">
                                                <span className="property-location-feature-label">Building Size</span>
                                                <span className="property-location-feature-value">
                                                    {property.areaSqm} sqm
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    {property?.areaSqft && (
                                        <div className="property-location-feature-item">
                                            <FaRulerCombined className="property-location-feature-icon" />
                                            <div className="property-location-feature-text">
                                                <span className="property-location-feature-label">Square Feet</span>
                                                <span className="property-location-feature-value">
                                                    {property.areaSqft} sqft
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    {property?.propertyAge && (
                                        <div className="property-location-feature-item">
                                            <FaCalendarAlt className="property-location-feature-icon" />
                                            <div className="property-location-feature-text">
                                                <span className="property-location-feature-label">Property Age</span>
                                                <span className="property-location-feature-value">
                                                    {property.propertyAge} years
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    {property?.propertyType && (
                                        <div className="property-location-feature-item">
                                            <FaHome className="property-location-feature-icon" />
                                            <div className="property-location-feature-text">
                                                <span className="property-location-feature-label">Property Type</span>
                                                <span className="property-location-feature-value">
                                                    {property.propertyType}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Bedrooms & Bathrooms */}
                            {hasRoomsFeatures && (
                                <>
                                    <h4 className="property-location-feature-header" style={{ fontSize: '16px', marginBottom: '15px' }}>Bedrooms & Bathrooms</h4>
                                    <div className="property-location-rooms-container">
                                        {(property?.bedrooms || property?.bedrooms === 0) && (
                                            <div className="property-location-room-item">
                                                <FaBed className="property-location-feature-icon" />
                                                <div className="property-location-feature-text">
                                                    <span className="property-location-feature-label">Bedrooms</span>
                                                    <span className="property-location-feature-value">
                                                        {property.bedrooms}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                        {(property?.bathrooms || property?.bathrooms === 0) && (
                                            <div className="property-location-room-item">
                                                <FaBath className="property-location-feature-icon" />
                                                <div className="property-location-feature-text">
                                                    <span className="property-location-feature-label">Bathrooms</span>
                                                    <span className="property-location-feature-value">
                                                        {property.bathrooms}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* Parking */}
                            {hasParkingFeatures && (
                                <>
                                    <h4 className="property-location-feature-header" style={{ fontSize: '16px', marginBottom: '15px' }}>Parking</h4>
                                    <div className="property-location-rooms-container">
                                        {(property?.garage || property?.garage === 0) && (
                                            <div className="property-location-room-item">
                                                <FaCar className="property-location-feature-icon" />
                                                <div className="property-location-feature-text">
                                                    <span className="property-location-feature-label">Garage</span>
                                                    <span className="property-location-feature-value">
                                                        {property.garage}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* Amenities */}
                            {hasAmenities && (
                                <>
                                    <h4 className="property-location-feature-header" style={{ fontSize: '16px', marginBottom: '15px' }}>Amenities</h4>
                                    <div className="property-location-amenities-grid">
                                        {displayedAmenities.map((amenity, index) => (
                                            <div key={index} className="property-location-amenity-item">
                                                <FaCheck className="property-location-amenity-icon" />
                                                {amenity}
                                            </div>
                                        ))}
                                    </div>
                                    {amenities.length > 6 && (
                                        <button
                                            className="property-location-show-more-btn"
                                            onClick={() => setShowAllAmenities(!showAllAmenities)}
                                        >
                                            {showAllAmenities ? 'Show Less Amenities' : 'Show More Amenities'}
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="property-location-features-container">
                        <div className="property-location-feature-section">
                            <h3 className="property-location-feature-header">Property Features</h3>
                            <div className="property-location-no-features">
                                No property features available for this listing.
                            </div>
                        </div>
                    </div>
                )}

                {/* Divider */}
                <div className="property-location-divider"></div>

                {/* Property Video Section */}
                <div className="property-location-video-section">
                    <h2 className="property-location-section-title">Property Video</h2>
                    <div className="property-location-video-container">
                        <div className="property-location-video-wrapper">
                            {property?.videoUrl ? (
                                <>
                                    <video
                                        id="property-video"
                                        className="property-location-video-player"
                                        controls
                                        onPlay={handleVideoPlay}
                                        onPause={handleVideoPause}
                                        onError={handleVideoError}
                                        onLoadStart={handleVideoLoadStart}
                                        onLoadedData={handleVideoLoaded}
                                        muted={isVideoMuted}
                                        poster={processImageUrl(property?.videoThumbnail)}
                                    >
                                        <source src={property.videoUrl} type="video/mp4" />
                                        <source src={property.videoUrl} type="video/webm" />
                                        Your browser does not support the video tag.
                                    </video>
                                    {videoLoading && (
                                        <div className="property-location-video-loading">
                                            <FaVideo className="property-location-video-icon" />
                                            <div>Loading video...</div>
                                        </div>
                                    )}
                                    {videoError && (
                                        <div className="property-location-video-error">
                                            <FaExclamationTriangle className="property-location-video-error-icon" />
                                            <div className="property-location-video-error-text">Video unavailable</div>
                                            <div>We couldn't load the property video.</div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="property-location-video-placeholder">
                                    <FaVideo className="property-location-video-icon" />
                                    <div className="property-location-video-placeholder-text">No Video Available</div>
                                    <div className="property-location-video-placeholder-subtext">
                                        Video tour not provided for this property
                                    </div>
                                </div>
                            )}
                        </div>

                        {property?.videoUrl && !videoError && (
                            <>
                                <div className="property-location-video-description">
                                    {property.videoDescription || 'Take a virtual tour of this beautiful property and explore every corner from the comfort of your home.'}
                                </div>
                                <div className="property-location-video-controls">
                                    <button
                                        className="property-location-video-control-btn"
                                        onClick={togglePlay}
                                    >
                                        {isVideoPlaying ? <FaPause /> : <FaPlay />}
                                        {isVideoPlaying ? 'Pause' : 'Play'}
                                    </button>
                                    <button
                                        className="property-location-video-control-btn"
                                        onClick={toggleMute}
                                    >
                                        {isVideoMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                                        {isVideoMuted ? 'Unmute' : 'Mute'}
                                    </button>
                                    <button
                                        className="property-location-video-control-btn"
                                        onClick={handleFullscreen}
                                    >
                                        <FaExpand />
                                        Fullscreen
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Agent Column */}
            <div className="property-location-agent-column">
                <div className="property-location-agent-card">
                    <div className="property-location-agent-header">
                        <div className="property-location-agent-header-content">
                            {currentAgent?.profilePictureUrl && (
                                <img
                                    src={processImageUrl(currentAgent.profilePictureUrl, 'profile')}
                                    alt={`${currentAgent.firstName} ${currentAgent.lastName}`}
                                    className="property-location-agent-image"
                                    onError={(e) => {
                                        e.target.src = '/default-profile.jpg';
                                    }}
                                />
                            )}
                            <div className="property-location-agent-info">
                                <div className="property-location-agent-name">
                                    {currentAgent ? `${currentAgent.firstName} ${currentAgent.lastName}` : 'Contact Agent'}
                                </div>
                                <div className="property-location-agent-title">
                                    {currentAgent?.title || 'Real Estate Agent'}
                                </div>
                                <div className="property-location-agent-company">
                                    {currentAgent?.brokerageName || 'Real Estate Company'}
                                </div>
                            </div>
                        </div>

                        {/* Ratings Section */}
                        <div className="property-location-agent-ratings">
                            <div className="property-location-agent-rating-stars">
                                {renderDecimalStars(agentRatings.averageRating)}
                            </div>
                            <span className="property-location-agent-rating-text">
                                {agentRatings.averageRating.toFixed(1)} ({agentRatings.totalRatings} review{agentRatings.totalRatings !== 1 ? 's' : ''})
                            </span>
                        </div>
                    </div>

                    {/* Divider after ratings */}
                    <div className="property-location-divider"></div>

                    {/* Action Buttons */}
                    <div className="property-location-action-buttons">
                        <button
                            className="property-location-action-btn property-location-chat-btn"
                            onClick={handleChatClick}
                        >
                            <FaComments className="property-location-action-icon" />
                            Chat
                        </button>
                        <button
                            className="property-location-action-btn property-location-favorite-btn"
                            onClick={handleFavoriteClick}
                            disabled={favoriteLoading || !property?.id}
                        >
                            {favoriteLoading ? (
                                <FaSpinner className="property-location-action-icon spinner" />
                            ) : isFavorited ? (
                                <FaHeart className="property-location-action-icon" style={{ color: '#ff4d4f' }} />
                            ) : (
                                <FaRegHeart className="property-location-action-icon" />
                            )}
                            {favoriteLoading ? 'Loading...' : (isFavorited ? 'Favorited' : 'Favorite')}
                        </button>
                        <button
                            className="property-location-action-btn property-location-schedule-btn"
                            onClick={handleAgentCardScheduleClick}
                        >
                            <FaCalendarPlus className="property-location-action-icon" />
                            Schedule
                        </button>
                    </div>

                    <div className="property-location-contact-info">
                        {currentAgent?.cellPhoneNo && (
                            <div className="property-location-contact-item">
                                <FaPhone className="property-location-contact-icon" />
                                <span>{currentAgent.cellPhoneNo}</span>
                            </div>
                        )}
                        {currentAgent?.email && (
                            <div className="property-location-contact-item">
                                <FaEnvelope className="property-location-contact-icon" />
                                <span>{currentAgent.email}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    // Main render with view switching
    switch (currentView) {
        case 'success':
            return <SuccessView />;
        case 'waiting-confirmation':
            return <WaitingConfirmationView />;
        case 'schedule':
            return <ScheduleView />;
        default:
            return <PropertyView />;
    }
};

export default PropertyLocation;