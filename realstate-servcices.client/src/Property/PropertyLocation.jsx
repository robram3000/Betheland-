import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
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
    FaSpinner
} from 'react-icons/fa';
import { processImageUrl } from '../Employeesportal/AdminPortal/Creation_Property/processImageUrl';
import './PropertyLocation.scss';

// Import services
import authService from '../Authpage/Services/LoginAuth';
import scheduleServices from './Services/ScheduleServices';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const PropertyLocation = ({ property, agent }) => {
    const navigate = useNavigate();
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [showAllAmenities, setShowAllAmenities] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false);
    const [scheduleDate, setScheduleDate] = useState('');
    const [scheduleTime, setScheduleTime] = useState('');
    const [scheduleNotes, setScheduleNotes] = useState('');
    const [scheduleSubmitted, setScheduleSubmitted] = useState(false);
    const [showScheduleOverlay, setShowScheduleOverlay] = useState(false);
    const [isScheduling, setIsScheduling] = useState(false);
    const [scheduleError, setScheduleError] = useState('');

    // Video states
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const [isVideoMuted, setIsVideoMuted] = useState(false);
    const [videoError, setVideoError] = useState(false);
    const [videoLoading, setVideoLoading] = useState(false);

    // Real authentication state
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    // Check authentication status on component mount and when component updates
    useEffect(() => {
        checkAuthStatus();
    }, []);

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

    const handleFavoriteClick = () => {
        if (!isLoggedIn) {
            const returnUrl = window.location.pathname + window.location.search;
            navigate(`/login?returnUrl=${encodeURIComponent(returnUrl)}&action=${encodeURIComponent('add to favorites')}`);
            return;
        }
        setIsFavorited(!isFavorited);
        console.log('Favorite clicked:', !isFavorited);
    };

    const handleChatClick = () => {
        if (!isLoggedIn) {
            const returnUrl = window.location.pathname + window.location.search;
            navigate(`/login?returnUrl=${encodeURIComponent(returnUrl)}&action=${encodeURIComponent('chat with agent')}`);
            return;
        }
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
                id: agent?.id || 'agent-1',
                name: agent ? `${agent.firstName} ${agent.lastName}` : 'Contact Agent',
                profilePicture: processImageUrl(agent?.profilePictureUrl, 'profile'),
                title: agent?.title || 'Real Estate Agent',
                phone: agent?.cellPhoneNo,
                email: agent?.email
            }
        };

        console.log('Navigating to chat with property data:', chatData);
        navigate('/messages', { state: { propertyChat: chatData } });
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

    // Enhanced schedule submission with full mapper integration
    const handleScheduleSubmit = async (e) => {
        e.preventDefault();
        setScheduleError('');

        // Double-check authentication
        if (!isLoggedIn) {
            const returnUrl = window.location.pathname + window.location.search;
            navigate(`/login?returnUrl=${encodeURIComponent(returnUrl)}&action=${encodeURIComponent('schedule viewing')}`);
            return;
        }

        if (!scheduleDate || !scheduleTime) {
            setScheduleError('Please select both date and time');
            return;
        }

        // Validate if the selected time is in the future
        const selectedDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
        if (selectedDateTime <= new Date()) {
            setScheduleError('Please select a future date and time');
            return;
        }

        setIsScheduling(true);

        try {
            // Use userId instead of id
            const clientId = currentUser?.userId;

            if (!clientId) {
                setScheduleError('Unable to identify user. Please log in again.');
                return;
            }

            if (!property?.id || !agent?.id) {
                setScheduleError('Property or agent information is missing');
                return;
            }

            // Prepare schedule data according to Mapper.js structure
            const scheduleData = {
                propertyId: parseInt(property.id),
                agentId: parseInt(agent.id),
                clientId: parseInt(clientId),
                scheduleTime: selectedDateTime.toISOString(),
                notes: scheduleNotes,
                status: "Scheduled",
                // Enhanced scheduling fields from mapper
                meetingType: "InPerson",
                meetingLocation: property?.address || '',
                durationMinutes: 60 // Default 1 hour viewing
            };

            // Validate the data using service
            const validationErrors = scheduleServices.validateScheduleData(scheduleData);
            if (validationErrors.length > 0) {
                setScheduleError(validationErrors.join(', '));
                return;
            }

            // Check time slot availability
            const isAvailable = await scheduleServices.checkTimeSlotAvailability(
                parseInt(agent.id),
                selectedDateTime
            );
            if (!isAvailable) {
                setScheduleError('This time slot is not available. Please choose a different time.');
                return;
            }

            // Create the schedule using the service with mapper integration
            const result = await scheduleServices.createSchedule(scheduleData);

            if (result.success) {
                // Success handling
                setScheduleDate('');
                setScheduleTime('');
                setScheduleNotes('');
                setScheduleSubmitted(true);
                setScheduleError('');

                setTimeout(() => {
                    setScheduleSubmitted(false);
                }, 5000);
            } else {
                // Handle service error
                setScheduleError(result.error?.message || 'Failed to schedule viewing. Please try again.');
            }

        } catch (error) {
            console.error('Error scheduling viewing:', error);
            setScheduleError(error.message || 'Failed to schedule viewing. Please try again.');
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

    // Enhanced schedule form with proper mapper integration
    const renderScheduleForm = () => (
        <form onSubmit={handleScheduleSubmit}>
            {scheduleError && (
                <div className="property-location-schedule-error">
                    <FaExclamationTriangle style={{ marginRight: '8px' }} />
                    {scheduleError}
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
                        disabled={!isLoggedIn || isScheduling}
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
                        disabled={!isLoggedIn || isScheduling}
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
                    disabled={!isLoggedIn || isScheduling}
                />
            </div>

            <button
                type="submit"
                className="property-location-schedule-overlay-submit-btn"
                disabled={!isLoggedIn || isScheduling}
            >
                {isScheduling ? (
                    <>
                        <FaSpinner className="spinner" style={{ marginRight: '8px' }} />
                        Scheduling...
                    </>
                ) : (
                    <>
                        <FaCalendarPlus style={{ marginRight: '8px' }} />
                        {isLoggedIn ? `Send Enquiry to ${agent?.firstName || 'Agent'}` : 'Sign In to Schedule'}
                    </>
                )}
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
                            >
                                {isFavorited ?
                                    <FaHeart className="property-location-action-icon" /> :
                                    <FaRegHeart className="property-location-action-icon" />
                                }
                                Favorite
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
                            {agent?.licenseNumber && (
                                <div className="property-location-contact-item">
                                    <FaIdCard className="property-location-contact-icon" />
                                    <span>License: {agent.licenseNumber}</span>
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