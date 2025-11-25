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
    FaBug
} from 'react-icons/fa';
import { processImageUrl } from '../Employeesportal/AdminPortal/Creation_Property/processImageUrl';
import './PropertyLocation.scss';
import authService from '../Authpage/Services/LoginAuth';
import { SchedulePropertiesService } from '../Employeesportal/AdminPortal/appointment/Services/index.js';
import agentService from '../Employeesportal/AdminPortal/Creation_Agent/Services/AgentService';
import { useWishlistData } from './Services/WishlistAdded'; 

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

// Helper function to format date for API without timezone shift
const formatDateForAPI = (date) => {
    // Get local date components
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

const PropertyLocation = ({ property }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [showAllAmenities, setShowAllAmenities] = useState(false);
    const [scheduleDate, setScheduleDate] = useState('');
    const [scheduleTime, setScheduleTime] = useState('');
    const [scheduleNotes, setScheduleNotes] = useState('');
    const [scheduleSubmitted, setScheduleSubmitted] = useState(false);
    const [showScheduleOverlay, setShowScheduleOverlay] = useState(false);
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

    // Agent state - UPDATED: Get agent from location state or fetch it
    const [agent, setAgent] = useState(null);
    const [loadingAgent, setLoadingAgent] = useState(false);

    // Schedule service instance
    const [scheduleService, setScheduleService] = useState(null);

    // Time Slot Availability states
    const [selectedDate, setSelectedDate] = useState('');
    const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
    const [loadingAvailability, setLoadingAvailability] = useState(false);
    const [availabilityError, setAvailabilityError] = useState('');

    // Wishlist/Favorite states
    const {
        isPropertyInWishlist,
        toggleWishlist,
        loading: wishlistLoading
    } = useWishlistData();
    const [isFavorited, setIsFavorited] = useState(false);
    const [favoriteLoading, setFavoriteLoading] = useState(false);

    // Initialize schedule service and check authentication status
    useEffect(() => {
        checkAuthStatus();
        initializeScheduleService();
        handleAgentData();
        checkFavoriteStatus();
    }, [location.state, property?.id]);

    // Check favorite status when property loads
    const checkFavoriteStatus = async () => {
        if (!property?.id) return;

        try {
            setFavoriteLoading(true);
            const favoriteStatus = await isPropertyInWishlist(property.id);
            setIsFavorited(favoriteStatus);
        } catch (error) {
            console.error('Error checking favorite status:', error);
            setIsFavorited(false);
        } finally {
            setFavoriteLoading(false);
        }
    };

    // UPDATED: Handle agent data from location state or fetch it
    const handleAgentData = async () => {
        try {
            setLoadingAgent(true);

            // Check if agent data was passed from PropertyCard
            if (location.state?.agentData) {
                console.log('✅ Using agent data from location state:', location.state.agentData);
                console.log('🔍 Agent baseMemberId from location:', location.state.agentData.baseMemberId);
                setAgent(location.state.agentData);
            }
            // If no agent data in location but property has agentId, fetch it
            else if (property?.agentId) {
                console.log('🔄 Fetching agent data for property agentId:', property.agentId);
                const fetchedAgent = await agentService.getAgentWithFallback(property.agentId);
                console.log('✅ Fetched agent data:', fetchedAgent);
                console.log('🔍 Fetched agent baseMemberId:', fetchedAgent.baseMemberId);
                setAgent(fetchedAgent);
            }
            // If property has agent object directly
            else if (property?.agent) {
                console.log('✅ Using agent data from property:', property.agent);
                console.log('🔍 Agent baseMemberId from property:', property.agent.baseMemberId);
                setAgent(property.agent);
            } else {
                console.log('❌ No agent data available');
                setAgent(null);
            }
        } catch (error) {
            console.error('Error handling agent data:', error);
            setAgent(null);
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
            console.log('Current user object:', user);
            console.log('User ID:', user?.userId);
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
            // Toggle the favorite status
            await toggleWishlist(property.id, !isFavorited, `Favorite: ${property.title || 'Property'}`);

            // Update local state
            setIsFavorited(!isFavorited);
            console.log('Favorite status updated:', !isFavorited);

        } catch (error) {
            console.error('Error updating favorite:', error);
            // Show error message to user
            setScheduleError('Failed to update favorites. Please try again.');
        } finally {
            setFavoriteLoading(false);
        }
    };

    // Fixed Time Slot Availability Functions with proper timezone handling
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
                    isAvailable: true // Will be updated by API check
                });
            }
        }
        return slots;
    };

    const checkTimeSlotAvailability = async (timeSlots) => {
        if (!scheduleService || !agent?.baseMemberId) {
            return timeSlots.map(slot => ({ ...slot, isAvailable: true }));
        }

        const updatedSlots = [];
        const agentBaseMemberId = parseInt(agent.baseMemberId);

        for (const slot of timeSlots) {
            try {
                // Create local date without timezone conversion
                const slotDate = createLocalDate(selectedDate, slot.time);

                // Check if the slot is in the past
                if (slotDate <= new Date()) {
                    updatedSlots.push({
                        ...slot,
                        isAvailable: false
                    });
                    continue;
                }

                // Format date for API without timezone shift
                const apiDateString = formatDateForAPI(slotDate);

                // Use the correct API endpoint with properly formatted date
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
                // Fallback: assume available for future slots
                const slotDate = createLocalDate(selectedDate, slot.time);

                updatedSlots.push({
                    ...slot,
                    isAvailable: slotDate > new Date() // Only available if in future
                });
            }
        }

        return updatedSlots;
    };

    const handleDateSelection = async (date) => {
        setSelectedDate(date);
        setLoadingAvailability(true);
        setAvailabilityError('');

        try {
            // Generate time slots for the selected date
            const timeSlots = generateTimeSlots();

            // Check availability for each time slot
            const slotsWithAvailability = await checkTimeSlotAvailability(timeSlots);

            setAvailableTimeSlots(slotsWithAvailability);
        } catch (error) {
            console.error('Error loading availability:', error);
            setAvailabilityError('Failed to load available time slots. Please try again.');
        } finally {
            setLoadingAvailability(false);
        }
    };

    const handleTimeSlotSelect = (time) => {
        if (!isLoggedIn) {
            const returnUrl = window.location.pathname + window.location.search;
            navigate(`/login?returnUrl=${encodeURIComponent(returnUrl)}&action=${encodeURIComponent('schedule viewing')}`);
            return;
        }

        setScheduleDate(selectedDate);
        setScheduleTime(time);

        // Scroll to schedule section
        const scheduleSection = document.querySelector('.property-location-schedule-section');
        if (scheduleSection) {
            scheduleSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const formatSelectedDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // FIXED: Enhanced Chat Handler with proper agent data
    const handleChatClick = () => {
        if (!isLoggedIn) {
            const returnUrl = window.location.pathname + window.location.search;
            navigate(`/login?returnUrl=${encodeURIComponent(returnUrl)}&action=${encodeURIComponent('chat with agent')}`);
            return;
        }

        // Enhanced chat data with proper agent ID handling
        const chatData = {
            property: {
                id: property?.id,
                title: property?.title || 'Untitled Property',
                price: property?.price || 0,
                mainImage: processImageUrl(property?.mainImage) || '/default-property.jpg',
                address: property?.address || 'Address not specified',
                bedrooms: property?.bedrooms || 0,
                bathrooms: property?.bathrooms || 0,
                areaSqft: property?.areaSqft || property?.squareFeet || 'N/A',
                city: property?.city || '',
                state: property?.state || '',
                propertyType: property?.propertyType || 'Property'
            },
            agent: {
                // Try multiple possible ID fields
                id: agent?.id || agent?.agentId || agent?.userId || agent?.baseMemberId || 'agent-1',
                baseMemberId: agent?.baseMemberId || agent?.id,
                name: agent ? `${agent.firstName} ${agent.lastName}` : 'Contact Agent',
                firstName: agent?.firstName || 'Agent',
                lastName: agent?.lastName || '',
                profilePicture: processImageUrl(agent?.profilePictureUrl, 'profile'),
                title: agent?.title || 'Real Estate Agent',
                phone: agent?.cellPhoneNo,
                email: agent?.email,
                brokerageName: agent?.brokerageName || 'Real Estate Company'
            },
            chatType: 'property_chat',
            timestamp: new Date().toISOString()
        };

        console.log('🔍 Debug - Chat data being sent:', chatData);
        console.log('🔍 Debug - Agent ID:', chatData.agent.id);
        console.log('🔍 Debug - Agent baseMemberId:', chatData.agent.baseMemberId);

        navigate('/messages', {
            state: {
                propertyChat: chatData,
                // Add additional context for debugging
                _debug: {
                    source: 'PropertyLocation',
                    propertyId: property?.id,
                    agentId: agent?.id,
                    agentBaseMemberId: agent?.baseMemberId,
                    timestamp: new Date().toISOString()
                }
            }
        });
    };

    const handleAgentCardScheduleClick = () => {
        const scheduleSection = document.querySelector('.property-location-schedule-section');
        if (scheduleSection) {
            scheduleSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleCloseScheduleOverlay = () => {
        setShowScheduleOverlay(false);
        setScheduleError('');
    };

    // Enhanced debug function to test backend validation
    const debugBackendValidation = async (scheduleData) => {
        try {
            console.log('🔍 DEBUG: Testing backend validation with data:', scheduleData);

            // Test with minimal required data
            const testData = {
                propertyId: scheduleData.propertyId,
                agentId: scheduleData.agentId,
                clientId: scheduleData.clientId,
                scheduleTime: scheduleData.scheduleTime,
                scheduleEndTime: scheduleData.scheduleEndTime,
                status: "Scheduled"
            };

            console.log('🔍 DEBUG: Minimal test data:', testData);

            // Try to create a simple test request
            const response = await fetch('/api/ScheduleProperties/debug/test-creation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(testData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.log('🔍 DEBUG: Backend validation failed:', errorData);
                return errorData;
            }

            const result = await response.json();
            console.log('🔍 DEBUG: Backend validation passed:', result);
            return result;

        } catch (error) {
            console.log('🔍 DEBUG: Backend validation test failed:', error);
            return { error: error.message };
        }
    };

    // UPDATED: handleScheduleSubmit with proper baseMemberId handling
    const handleScheduleSubmit = async (e) => {
        e.preventDefault();
        setScheduleError('');
        setDebugInfo(null);

        // Authentication check
        if (!isLoggedIn) {
            const returnUrl = window.location.pathname + window.location.search;
            navigate(`/login?returnUrl=${encodeURIComponent(returnUrl)}&action=${encodeURIComponent('schedule viewing')}`);
            return;
        }

        // Wait for agent data to be loaded
        if (loadingAgent) {
            setScheduleError('Agent information is still loading. Please wait...');
            return;
        }

        // Debug agent object to see available properties
        console.log('🔍 DEBUG - Current Agent object:', agent);
        console.log('🔍 DEBUG - Agent baseMemberId:', agent?.baseMemberId);
        console.log('🔍 DEBUG - All agent properties:', Object.keys(agent || {}));

        // Use baseMemberId specifically
        const agentBaseMemberId = agent?.baseMemberId;

        if (!agentBaseMemberId) {
            setScheduleError('Agent information is not available. Please try again later.');
            console.error('❌ Agent baseMemberId is undefined');
            console.error('Available agent data:', agent);
            return;
        }

        if (!scheduleDate || !scheduleTime) {
            setScheduleError('Please select both date and time');
            return;
        }

        // Create local date without timezone conversion
        const selectedDateTime = createLocalDate(scheduleDate, scheduleTime);

        // Validate if the selected time is in the future
        if (selectedDateTime <= new Date()) {
            setScheduleError('Please select a future date and time');
            return;
        }

        if (!scheduleService) {
            setScheduleError('Scheduling service is not available. Please try again.');
            return;
        }

        setIsScheduling(true);

        try {
            const clientId = currentUser?.userId;

            if (!clientId) {
                setScheduleError('Unable to identify user. Please log in again.');
                return;
            }

            // FIX: Create date in local time but send as UTC to avoid timezone issues
            const localDate = new Date(selectedDateTime.getTime() - (selectedDateTime.getTimezoneOffset() * 60000));
            const apiDateString = localDate.toISOString();

            console.log('=== SCHEDULE DEBUG INFO ===');
            console.log('Client ID:', clientId);
            console.log('Property ID:', property.id);
            console.log('Agent baseMemberId:', agentBaseMemberId);
            console.log('Selected DateTime (Local):', selectedDateTime.toString());
            console.log('Selected DateTime (ISO):', selectedDateTime.toISOString());
            console.log('API Date String:', apiDateString);

            // Check availability with the properly formatted date
            const availabilityResponse = await scheduleService.checkTimeSlotAvailability(
                parseInt(agentBaseMemberId),
                apiDateString
            );

            console.log('Availability Response:', availabilityResponse);

            const isAvailable = availabilityResponse?.isAvailable ?? availabilityResponse;

            if (!isAvailable) {
                // Get detailed debug info
                try {
                    const debugResponse = await fetch(`/api/ScheduleProperties/debug/availability?agentId=${agentBaseMemberId}&scheduleTime=${encodeURIComponent(apiDateString)}`);
                    const debugData = await debugResponse.json();
                    console.log('Debug Availability Info:', debugData);
                    setDebugInfo(debugData);
                } catch (debugError) {
                    console.log('Could not get debug info:', debugError);
                }

                setScheduleError('This time slot is not available. Please choose a different time.');
                return;
            }

            // Prepare schedule data with baseMemberId
            const scheduleData = {
                propertyId: parseInt(property.id),
                agentId: parseInt(agentBaseMemberId), // Using baseMemberId here
                clientId: parseInt(clientId),
                scheduleTime: apiDateString,
                scheduleEndTime: new Date(localDate.getTime() + 60 * 60 * 1000).toISOString(), // 1 hour later
                notes: scheduleNotes || '',
                status: "Scheduled",
                meetingType: "InPerson",
                meetingLocation: property?.address || '',
                virtualMeetingLink: ""
            };

            console.log('Final Schedule Data for API:', scheduleData);

            // Create the schedule
            const createdSchedule = await scheduleService.createSchedule(scheduleData);

            // Success handling
            setScheduleDate('');
            setScheduleTime('');
            setScheduleNotes('');
            setScheduleSubmitted(true);
            setScheduleError('');
            setDebugInfo(null);

            console.log('Schedule created successfully:', createdSchedule);

            // Reset available slots
            setAvailableTimeSlots([]);
            setSelectedDate('');

            setTimeout(() => {
                setScheduleSubmitted(false);
            }, 5000);

        } catch (error) {
            console.error('=== SCHEDULING ERROR DETAILS ===');
            console.error('Error:', error);

            // Enhanced error handling
            if (error.message?.includes('time slot is not available')) {
                setScheduleError('The selected time slot is not available. Please choose a different time.');
            } else if (error.status === 400) {
                setScheduleError(error.responseData || 'Invalid data submitted. Please check your information.');
            } else {
                setScheduleError(error.message || 'Failed to schedule viewing. Please try again.');
            }
        } finally {
            setIsScheduling(false);
        }
    };

    // Auth handlers for overlay
    const handleSignIn = () => {
        const returnUrl = window.location.pathname + window.location.search;
        navigate(`/login?returnUrl=${encodeURIComponent(returnUrl)}&action=${encodeURIComponent('schedule viewing')}`);
        handleCloseScheduleOverlay();
    };

    const handleJoin = () => {
        navigate('/register/verify-email');
        handleCloseScheduleOverlay();
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
    const renderStars = (rating = 5) => {
        return Array.from({ length: 5 }, (_, index) => (
            <FaStar
                key={index}
                className="property-location-schedule-rating-star"
                color={index < rating ? "#ffc107" : "#e0e0e0"}
            />
        ));
    };

    // Enhanced schedule form with proper service integration
    const renderScheduleForm = () => (
        <form onSubmit={handleScheduleSubmit}>
            {scheduleError && (
                <div className="property-location-schedule-error">
                    <FaExclamationTriangle style={{ marginRight: '8px' }} />
                    {scheduleError}
                </div>
            )}

            {/* Debug Information */}
            {debugInfo && (
                <div className="property-location-debug-info">
                    <FaBug style={{ marginRight: '8px' }} />
                    <strong>Debug Info:</strong> {JSON.stringify(debugInfo)}
                </div>
            )}

            {/* Loading Agent Indicator */}
            {loadingAgent && (
                <div className="property-location-agent-loading">
                    <FaSpinner className="spinner" style={{ marginRight: '8px' }} />
                    Loading agent information...
                </div>
            )}

            <div className="property-location-schedule-overlay-inputs">
                <div className="property-location-schedule-overlay-input-group">
                    <label className="property-location-schedule-overlay-label">
                        Preferred Date *
                    </label>
                    <input
                        type="date"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        className="property-location-schedule-overlay-input"
                        min={new Date().toISOString().split('T')[0]}
                        required
                        disabled={!isLoggedIn || isScheduling || loadingAgent}
                    />
                </div>
                <div className="property-location-schedule-overlay-input-group">
                    <label className="property-location-schedule-overlay-label">
                        Preferred Time *
                    </label>
                    <input
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="property-location-schedule-overlay-input"
                        min="09:00"
                        max="17:00"
                        required
                        disabled={!isLoggedIn || isScheduling || loadingAgent}
                    />
                </div>
            </div>

            <div className="property-location-schedule-overlay-input-group">
                <label className="property-location-schedule-overlay-label">
                    Your Message (Optional)
                </label>
                <textarea
                    value={scheduleNotes}
                    onChange={(e) => setScheduleNotes(e.target.value)}
                    className="property-location-schedule-overlay-textarea"
                    placeholder="What would you like to ask the agent? For example: I'd like to see the backyard and ask about recent renovations..."
                    rows="4"
                    disabled={!isLoggedIn || isScheduling || loadingAgent}
                />
            </div>

            <button
                type="submit"
                className="property-location-schedule-overlay-submit-btn"
                disabled={!isLoggedIn || isScheduling || !scheduleService || loadingAgent || !agent?.baseMemberId}
            >
                {isScheduling ? (
                    <>
                        <FaSpinner className="spinner" style={{ marginRight: '8px' }} />
                        Scheduling...
                    </>
                ) : loadingAgent ? (
                    <>
                        <FaSpinner className="spinner" style={{ marginRight: '8px' }} />
                        Loading Agent...
                    </>
                ) : (
                    <>
                        <FaCalendarPlus style={{ marginRight: '8px' }} />
                        {isLoggedIn ? `Send Enquiry to ${agent?.firstName || 'Agent'}` : 'Sign In to Schedule'}
                    </>
                )}
            </button>

            {/* Debug Button - Optional, can be removed */}
            <button
                type="button"
                className="property-location-debug-btn"
                onClick={() => setDebugInfo(prev => !prev)}
                style={{
                    marginTop: '10px',
                    padding: '5px 10px',
                    background: '#f0f0f0',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '12px'
                }}
            >
                <FaBug style={{ marginRight: '5px' }} />
                Toggle Debug Info
            </button>
        </form>
    );

    const renderSignInPrompt = () => (
        <div className="property-location-schedule-overlay-signin">
            <div className="property-location-schedule-overlay-signin-content">
                <div className="property-location-schedule-overlay-signin-text">
                    <h4>Sign in to schedule a viewing</h4>
                    <p>Create an account or sign in to schedule property viewings and connect with agents directly.</p>

                    <div className="property-location-schedule-overlay-signin-buttons">
                        <button
                            className="property-location-schedule-overlay-signin-btn property-location-schedule-overlay-signin-primary"
                            onClick={handleSignIn}
                        >
                            <FaUser style={{ marginRight: '8px' }} />
                            Sign in
                        </button>
                        <button
                            className="property-location-schedule-overlay-signin-btn property-location-schedule-overlay-signin-secondary"
                            onClick={handleJoin}
                        >
                            <FaUserPlus style={{ marginRight: '8px' }} />
                            Join Now
                        </button>
                    </div>

                    <div className="property-location-schedule-overlay-signin-benefits">
                        <div className="property-location-schedule-overlay-benefit-item">
                            <FaCheck className="property-location-schedule-overlay-benefit-icon" />
                            Schedule property viewings instantly
                        </div>
                        <div className="property-location-schedule-overlay-benefit-item">
                            <FaCheck className="property-location-schedule-overlay-benefit-icon" />
                            Chat directly with agents
                        </div>
                        <div className="property-location-schedule-overlay-benefit-item">
                            <FaCheck className="property-location-schedule-overlay-benefit-icon" />
                            Save favorite properties
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // Enhanced success message with schedule details
    const renderSuccessMessage = () => {
        const formattedDate = new Date(scheduleDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const formattedTime = new Date(`2000-01-01T${scheduleTime}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });

        return (
            <div className="property-location-schedule-success">
                <div className="property-location-schedule-success-content">
                    <FaCalendarCheck className="property-location-schedule-success-icon" />
                    <h4>Viewing Scheduled Successfully!</h4>
                    <p>Your viewing request has been sent to {agent?.firstName || 'the agent'}. They will contact you shortly to confirm the appointment.</p>
                    <div className="property-location-schedule-success-details">
                        <div><strong>Property:</strong> {property?.title || 'Property'}</div>
                        <div><strong>Date:</strong> {formattedDate}</div>
                        <div><strong>Time:</strong> {formattedTime}</div>
                        <div><strong>Agent:</strong> {agent ? `${agent.firstName} ${agent.lastName}` : 'Contact Agent'}</div>
                        {scheduleNotes && <div><strong>Your message:</strong> {scheduleNotes}</div>}
                    </div>
                    <button
                        className="property-location-schedule-success-close"
                        onClick={() => setScheduleSubmitted(false)}
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    };

    // Render Time Slot Availability Section
    const renderTimeSlotAvailability = () => (
        <div className="property-location-availability-section">
            <h2 className="property-location-section-title">Available Time Slots</h2>
            <div className="property-location-availability-container">
                <div className="property-location-availability-info">
                    <div className="property-location-availability-header">
                        <FaCalendarCheck className="property-location-availability-icon" />
                        <h3>Check {agent?.firstName || 'Agent'}'s Availability</h3>
                    </div>
                    <p className="property-location-availability-description">
                        View available time slots for property viewings with {agent?.firstName || 'the agent'}.
                        Select a date to see available times.
                    </p>

                    <div className="property-location-availability-form">
                        <div className="property-location-availability-input-group">
                            <label className="property-location-availability-label">
                                Select Date to Check Availability
                            </label>
                            <input
                                type="date"
                                className="property-location-availability-input"
                                min={new Date().toISOString().split('T')[0]}
                                onChange={(e) => handleDateSelection(e.target.value)}
                                value={selectedDate}
                                disabled={loadingAgent || !agent?.baseMemberId}
                            />
                        </div>

                        {availabilityError && (
                            <div className="property-location-availability-error">
                                <FaExclamationTriangle style={{ marginRight: '8px' }} />
                                {availabilityError}
                            </div>
                        )}

                        {selectedDate && (
                            <div className="property-location-availability-slots">
                                <h4>Available Time Slots for {formatSelectedDate(selectedDate)}</h4>
                                {loadingAvailability ? (
                                    <div className="property-location-availability-loading">
                                        <FaSpinner className="spinner" />
                                        Loading available time slots...
                                    </div>
                                ) : availableTimeSlots.length > 0 ? (
                                    <div className="property-location-time-slots-grid">
                                        {availableTimeSlots.map((slot, index) => (
                                            <div
                                                key={index}
                                                className={`property-location-time-slot ${slot.isAvailable ? 'available' : 'unavailable'}`}
                                                onClick={() => slot.isAvailable && handleTimeSlotSelect(slot.time)}
                                            >
                                                <FaClock className="property-location-slot-icon" />
                                                <span className="property-location-slot-time">
                                                    {slot.displayTime}
                                                </span>
                                                <span className="property-location-slot-status">
                                                    {slot.isAvailable ? (
                                                        <>
                                                            <FaCheck className="property-location-slot-status-icon" />
                                                            Available
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FaTimes className="property-location-slot-status-icon" />
                                                            Unavailable
                                                        </>
                                                    )}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="property-location-no-slots">
                                        <FaExclamationTriangle className="property-location-no-slots-icon" />
                                        <p>No time slots available for this date. Please select another date.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="property-location-container">
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
                    <div className="property-location-features-container">
                        <div className="property-location-feature-section">
                            <h3 className="property-location-feature-header">Property Features</h3>

                            {/* Building Size */}
                            <div className="property-location-building-features">
                                <div className="property-location-feature-item">
                                    <FaBuilding className="property-location-feature-icon" />
                                    <div className="property-location-feature-text">
                                        <span className="property-location-feature-label">Building Size</span>
                                        <span className="property-location-feature-value">
                                            {property?.areaSqm ? `${property.areaSqm} sqm` : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                                <div className="property-location-feature-item">
                                    <FaRulerCombined className="property-location-feature-icon" />
                                    <div className="property-location-feature-text">
                                        <span className="property-location-feature-label">Square Feet</span>
                                        <span className="property-location-feature-value">
                                            {property?.areaSqft ? `${property.areaSqft} sqft` : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                                <div className="property-location-feature-item">
                                    <FaCalendarAlt className="property-location-feature-icon" />
                                    <div className="property-location-feature-text">
                                        <span className="property-location-feature-label">Property Age</span>
                                        <span className="property-location-feature-value">
                                            {property?.propertyAge ? `${property.propertyAge} years` : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                                <div className="property-location-feature-item">
                                    <FaHome className="property-location-feature-icon" />
                                    <div className="property-location-feature-text">
                                        <span className="property-location-feature-label">Property Type</span>
                                        <span className="property-location-feature-value">
                                            {property?.propertyType || 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Bedrooms & Bathrooms */}
                            <h4 className="property-location-feature-header" style={{ fontSize: '16px', marginBottom: '15px' }}>Bedrooms & Bathrooms</h4>
                            <div className="property-location-rooms-container">
                                <div className="property-location-room-item">
                                    <FaBed className="property-location-feature-icon" />
                                    <div className="property-location-feature-text">
                                        <span className="property-location-feature-label">Bedrooms</span>
                                        <span className="property-location-feature-value">
                                            {property?.bedrooms || 0}
                                        </span>
                                    </div>
                                </div>
                                <div className="property-location-room-item">
                                    <FaBath className="property-location-feature-icon" />
                                    <div className="property-location-feature-text">
                                        <span className="property-location-feature-label">Bathrooms</span>
                                        <span className="property-location-feature-value">
                                            {property?.bathrooms || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Parking */}
                            <h4 className="property-location-feature-header" style={{ fontSize: '16px', marginBottom: '15px' }}>Parking</h4>
                            <div className="property-location-rooms-container">
                                <div className="property-location-room-item">
                                    <FaCar className="property-location-feature-icon" />
                                    <div className="property-location-feature-text">
                                        <span className="property-location-feature-label">Garage</span>
                                        <span className="property-location-feature-value">
                                            {property?.garage || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Amenities */}
                            <h4 className="property-location-feature-header" style={{ fontSize: '16px', marginBottom: '15px' }}>Amenities</h4>
                            {amenities.length > 0 ? (
                                <>
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
                            ) : (
                                <div className="property-location-description">No amenities listed</div>
                            )}
                        </div>
                    </div>

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

                    {/* Divider */}
                    <div className="property-location-divider"></div>

                    {/* Time Slot Availability Section */}
                    {renderTimeSlotAvailability()}

                    {/* Divider */}
                    <div className="property-location-divider"></div>

                    {/* Schedule Section - Always show form */}
                    <div className="property-location-schedule-section">
                        <h2 className="property-location-section-title">Schedule a Viewing</h2>
                        <div className="property-location-schedule-container">
                            <div className={`property-location-schedule-card ${!isLoggedIn ? 'property-location-schedule-card-blurred' : ''}`}>
                                <div className="property-location-schedule-agent-info">
                                    {agent?.profilePictureUrl && (
                                        <img
                                            src={processImageUrl(agent.profilePictureUrl, 'profile')}
                                            alt={`${agent.firstName} ${agent.lastName}`}
                                            className="property-location-schedule-agent-image"
                                            onError={(e) => {
                                                e.target.src = '/default-profile.jpg';
                                            }}
                                        />
                                    )}
                                    <div className="property-location-schedule-agent-details">
                                        <div className="property-location-schedule-agent-name">
                                            {agent ? `${agent.firstName} ${agent.lastName}` : 'Contact Agent'}
                                        </div>
                                        <div className="property-location-schedule-agent-profession">
                                            {agent?.title || 'Real Estate Agent'} • {agent?.brokerageName || 'Real Estate Company'}
                                        </div>
                                        <div className="property-location-schedule-agent-ratings">
                                            <div className="property-location-schedule-rating-stars">
                                                {renderStars(5)}
                                            </div>
                                            <span className="property-location-schedule-rating-text">5.0 (24 reviews)</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="property-location-schedule-prompt">
                                    <h3>Schedule a Viewing with {agent?.firstName || 'the Agent'}</h3>
                                    <p>Select your preferred date and time to schedule a viewing of this property.</p>
                                </div>

                                {/* Schedule Form (always rendered) */}
                                <div className="property-location-schedule-form-content">
                                    {renderScheduleForm()}
                                </div>
                            </div>

                            {/* Blurred Overlay for Non-Logged-In Users */}
                            {!isLoggedIn && (
                                <div className="property-location-schedule-blurred-overlay">
                                    <div className="property-location-schedule-blurred-content">
                                        {renderSignInPrompt()}
                                    </div>
                                </div>
                            )}

                            {/* Success Message */}
                            {scheduleSubmitted && (
                                <div className="property-location-schedule-success-overlay">
                                    {renderSuccessMessage()}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Agent Column */}
                <div className="property-location-agent-column">
                    <div className="property-location-agent-card">
                        <div className="property-location-agent-header">
                            <div className="property-location-agent-header-content">
                                {agent?.profilePictureUrl && (
                                    <img
                                        src={processImageUrl(agent.profilePictureUrl, 'profile')}
                                        alt={`${agent.firstName} ${agent.lastName}`}
                                        className="property-location-agent-image"
                                        onError={(e) => {
                                            e.target.src = '/default-profile.jpg';
                                        }}
                                    />
                                )}
                                <div className="property-location-agent-info">
                                    <div className="property-location-agent-name">
                                        {agent ? `${agent.firstName} ${agent.lastName}` : 'Contact Agent'}
                                    </div>
                                    <div className="property-location-agent-title">
                                        {agent?.title || 'Real Estate Agent'}
                                    </div>
                                    <div className="property-location-agent-company">
                                        {agent?.brokerageName || 'Real Estate Company'}
                                    </div>
                                </div>
                            </div>

                            {/* Ratings Section */}
                            <div className="property-location-agent-ratings">
                                <div className="property-location-agent-rating-stars">
                                    {renderStars(5)}
                                </div>
                                <span className="property-location-agent-rating-text">5.0 (24 reviews)</span>
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
                                    <FaHeart className="property-location-action-icon" />
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
                            {agent?.cellPhoneNo && (
                                <div className="property-location-contact-item">
                                    <FaPhone className="property-location-contact-icon" />
                                    <span>{agent.cellPhoneNo}</span>
                                </div>
                            )}
                            {agent?.email && (
                                <div className="property-location-contact-item">
                                    <FaEnvelope className="property-location-contact-icon" />
                                    <span>{agent.email}</span>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyLocation;