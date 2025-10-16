import React, { useState, useEffect, useCallback } from 'react';
import { Card, Tag, Typography, Space, Divider, Button, message, Avatar, Skeleton, Row, Col, Tooltip, Empty } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useWishlistData } from './Services/WishlistAdded';
import { useUser } from '../Authpage/Services/UserContextService';
import { agentService } from './Services/GetAgent';

// Import from React Icons instead of Ant Design
import {
    FaHeart,
    FaRegHeart,
    FaCalendarAlt,
    FaComments,
    FaEye,
    FaUser,
    FaPhone,
    FaEnvelope,
    FaCar,
    FaCoffee,
    FaHome,
    FaBed, // For bedrooms
    FaBath, // For bathrooms
    FaMapMarkerAlt,
    FaShower,
    FaHotTub,
    FaStar,
    FaCrown,
    FaTrophy,
    FaGift,
    FaRocket,
    FaBolt,
    FaLightbulb,
    FaTools,
    FaCog,
    FaBuilding,
    FaBox
} from 'react-icons/fa';

const { Title, Text } = Typography;

// Custom SVG bath icons component (optional - you can use FaIcons instead)
const CustomBathIcons = {
    Bathtub: ({ size = 16, color = "currentColor" }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
            <path d="M20,12H4V4H20M20,2H4C2.9,2,2,2.9,2,4V12C2,13.1,2.9,14,4,14H8V16H4V18H8C9.1,18,10,17.1,10,16V14H14V16C14,17.1,14.9,18,16,18H20V16H16V14H20C21.1,14,22,13.1,22,12V4C22,2.9,21.1,2,20,2Z" />
        </svg>
    ),
    Shower: ({ size = 16, color = "currentColor" }) => (
        <FaShower size={size} color={color} />
    ),
    WaterDrop: ({ size = 16, color = "currentColor" }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
            <path d="M12,20A6,6 0 0,1 6,14C6,10 12,3.25 12,3.25C12,3.25 18,10 18,14A6,6 0 0,1 12,20Z" />
        </svg>
    ),
    Spa: ({ size = 16, color = "currentColor" }) => (
        <FaHotTub size={size} color={color} />
    )
};

const PropertyCard = ({
    property,
    onScheduleTour,
    onChat,
    showActions = true
}) => {
    const navigate = useNavigate();
    const { isAuthenticated } = useUser();
    const {
        toggleWishlist,
        isPropertyInWishlist,
        loading: wishlistLoading,
        wishlistPropertyIds,
        refreshWishlist
    } = useWishlistData();

    const [isFavorite, setIsFavorite] = useState(false);
    const [isCheckingWishlist, setIsCheckingWishlist] = useState(true);
    const [isToggling, setIsToggling] = useState(false);
    const [showLoading, setShowLoading] = useState(false);
    const [agent, setAgent] = useState(null);
    const [loadingAgent, setLoadingAgent] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [agentImageError, setAgentImageError] = useState(false);

    // Add agent caching
    const [agentCache, setAgentCache] = useState({});

    // Validate property data - Enhanced validation
    const isValidProperty = property && property.id && property.title;

    // Helper functions
    const getAgentName = (agent) => {
        if (!agent) return 'Agent Not Assigned';

        const nameParts = [
            agent.firstName,
            agent.middleName,
            agent.lastName,
            agent.suffix
        ].filter(part => part && part.trim() !== '');

        return nameParts.join(' ').trim() || 'Agent Not Assigned';
    };

    const getAgentContactInfo = (agent) => {
        if (!agent) {
            return {
                phone: 'Not available',
                email: 'Not available',
                specialization: 'Not specified'
            };
        }

        // Enhanced contact info extraction
        const phone = agent.cellPhoneNo ||
            agent.phoneNumber ||
            agent.baseMember?.phoneNumber ||
            'Not available';

        const email = agent.email ||
            agent.baseMember?.email ||
            'Not available';

        return {
            phone: phone,
            email: email,
            specialization: agent.specialization || 'Not specified'
        };
    };

    // Helper function to format full address with zipcode, province, country
    const getFullAddress = (property) => {
        const addressParts = [
            property.address,
            property.city,
            property.state,
            property.zipCode,
            property.country
        ].filter(part => part && part.trim() !== '');

        return addressParts.join(', ') || 'Location not specified';
    };

    // Function to get bath icon based on bathroom count
    const getBathIcon = (bathroomCount) => {
        const bathIcons = [
            // For 1 bathroom - simple icons
            () => <FaBath size={12} />,
            () => <CustomBathIcons.WaterDrop />,
            () => <FaShower size={12} />,

            // For 2 bathrooms - medium luxury
            () => <FaStar size={12} />,
            () => <CustomBathIcons.Shower />,
            () => <FaLightbulb size={12} />,

            // For 3+ bathrooms - premium icons
            () => <FaTrophy size={12} />,
            () => <FaCrown size={12} />,
            () => <CustomBathIcons.Bathtub />,
            () => <FaGift size={12} />,
            () => <CustomBathIcons.Spa />,
            () => <FaRocket size={12} />,
            () => <FaBolt size={12} />,
        ];

        const iconIndex = Math.min(bathroomCount - 1, bathIcons.length - 1);
        const BathIcon = bathIcons[Math.max(iconIndex, 0)];

        return <BathIcon />;
    };

    // DEBUG: Add logging to see what's happening
    useEffect(() => {
        console.log('DEBUG - PropertyCard mounted:', {
            propertyId: property?.id,
            agentId: property?.agentId,
            hasAgentInProp: !!property?.agent,
            agentData: property?.agent
        });
    }, [property]);

    // Enhanced fetchAgent function with better error handling
    const fetchAgent = useCallback(async () => {
        if (!property?.agentId) {
            console.log("DEBUG - No agent ID provided:", property?.agentId);
            setAgent(null);
            return;
        }

        // Check cache first to prevent unnecessary API calls
        if (agentCache[property.agentId]) {
            console.log("DEBUG - Using cached agent:", agentCache[property.agentId]);
            setAgent(agentCache[property.agentId]);
            return;
        }

        try {
            setLoadingAgent(true);
            console.log("DEBUG - Fetching agent with ID:", property.agentId);

            // Use the enhanced agent service with fallbacks
            let agentData = await agentService.getAgentWithFallback(property.agentId);

            console.log("DEBUG - Agent data received:", agentData);

            if (agentData) {
                setAgent(agentData);
                // Update cache
                setAgentCache(prev => ({
                    ...prev,
                    [property.agentId]: agentData
                }));
            } else {
                console.log("DEBUG - No agent data found for ID:", property.agentId);
                setAgent(null);
            }
        } catch (error) {
            console.error('Error fetching agent:', error);
            setAgent(null);
        } finally {
            setLoadingAgent(false);
        }
    }, [property?.agentId, agentCache]);

    // Enhanced agent handling with multiple fallbacks
    useEffect(() => {
        if (!isValidProperty) return;

        console.log('DEBUG - Agent handling effect:', {
            agentId: property.agentId,
            hasAgentInProperty: !!property.agent,
            currentAgent: agent
        });

        // If agent data is already in property, use it
        if (property.agent && property.agent.id === property.agentId) {
            console.log('DEBUG - Using agent from property data');
            setAgent(property.agent);
            // Update cache
            setAgentCache(prev => ({
                ...prev,
                [property.agentId]: property.agent
            }));
        }
        // If we have agentId but no agent data, fetch it
        else if (property.agentId && !agent) {
            console.log('DEBUG - Fetching agent data');
            fetchAgent();
        }
        // If no agentId, set agent to null
        else if (!property.agentId) {
            console.log('DEBUG - No agent ID, setting agent to null');
            setAgent(null);
        }
    }, [property, agent, fetchAgent, isValidProperty]);

    // Enhanced wishlist status checking
    useEffect(() => {
        const checkWishlistStatus = async () => {
            if (!property?.id) {
                setIsCheckingWishlist(false);
                return;
            }

            try {
                setIsCheckingWishlist(true);

                // Always check local first for immediate response
                const localCheck = wishlistPropertyIds?.includes(property.id);
                setIsFavorite(localCheck);

                // Then verify with server if authenticated
                if (isAuthenticated) {
                    try {
                        const serverCheck = await isPropertyInWishlist(property.id);
                        if (serverCheck !== localCheck) {
                            setIsFavorite(serverCheck);
                        }
                    } catch (serverError) {
                        console.warn('Server wishlist check failed, using local:', serverError);
                        // Keep local state if server check fails
                    }
                }
            } catch (error) {
                console.error('Error checking wishlist status:', error);
                // Fallback to local check
                const localCheck = wishlistPropertyIds?.includes(property.id);
                setIsFavorite(localCheck);
            } finally {
                setIsCheckingWishlist(false);
            }
        };

        if (isValidProperty) {
            checkWishlistStatus();
        }
    }, [property?.id, isPropertyInWishlist, isAuthenticated, wishlistPropertyIds, isValidProperty]);

    const handleCardClick = () => {
        if (isValidProperty) {
            navigate('/properties/view', { state: { property, agent } });
        }
    };

    const getSpecializationDisplay = (specialization) => {
        if (!specialization) return 'Not specified';

        try {
            if (Array.isArray(specialization)) {
                return specialization.join(', ');
            }

            if (typeof specialization === 'string') {
                if (specialization.startsWith('[')) {
                    const parsed = JSON.parse(specialization);
                    return Array.isArray(parsed) ? parsed.join(', ') : specialization;
                }
                return specialization;
            }

            return 'Not specified';
        } catch (error) {
            console.error('Error parsing specialization:', error);
            return 'Not specified';
        }
    };

    const getAmenities = () => {
        if (!property?.amenities) return [];

        try {
            if (Array.isArray(property.amenities)) {
                return property.amenities.filter(amenity => amenity && amenity.trim() !== '');
            }

            if (typeof property.amenities === 'string') {
                if (property.amenities.startsWith('[')) {
                    const parsed = JSON.parse(property.amenities);
                    return Array.isArray(parsed) ? parsed.filter(a => a && a.trim() !== '') : [];
                }

                // Handle comma-separated string
                return property.amenities.split(',').map(item => item.trim()).filter(item => item !== '');
            }

            return [];
        } catch (error) {
            console.error('Error parsing amenities:', error);
            return [];
        }
    };

    const requireAuth = (actionName = 'perform this action') => {
        if (!isAuthenticated) {
            const returnUrl = window.location.pathname + window.location.search;
            navigate(`/login?returnUrl=${encodeURIComponent(returnUrl)}&action=${encodeURIComponent(actionName)}`);
            return false;
        }
        return true;
    };

    const handleToggleFavorite = async (e, propertyId, isCurrentlyFavorite) => {
        e.stopPropagation();
        e.preventDefault();

        if (isWishlistButtonDisabled || !isValidProperty) {
            return;
        }

        if (!requireAuth('add to wishlist')) {
            return;
        }

        try {
            setIsToggling(true);
            setShowLoading(true);

            // Optimistic update
            setIsFavorite(!isCurrentlyFavorite);

            await toggleWishlist(propertyId, !isCurrentlyFavorite);
            await refreshWishlist();

            message.success(!isCurrentlyFavorite ? 'Added to wishlist' : 'Removed from wishlist');
        } catch (error) {
            console.error('Error updating wishlist:', error);
            message.error('Failed to update wishlist');
            // Revert optimistic update
            setIsFavorite(isCurrentlyFavorite);
        } finally {
            setIsToggling(false);
            setShowLoading(false);
        }
    };

    const handleScheduleTour = (e) => {
        e.stopPropagation();

        if (!isValidProperty) {
            message.warning('Invalid property data');
            return;
        }

        if (!requireAuth('schedule a tour')) {
            return;
        }

        if (onScheduleTour) {
            onScheduleTour({
                ...property,
                agent: agent
            });
        } else {
            navigate('/schedule', { state: { property, agent } });
        }
    };

    const handleChat = (e) => {
        e.stopPropagation();

        if (!isValidProperty) {
            message.warning('Invalid property data');
            return;
        }

        if (!requireAuth('chat with agent')) {
            return;
        }

        if (onChat) {
            onChat(property);
        } else {
            navigate('/messages', { state: { property, agent } });
        }
    };

    const handleViewDetails = (e) => {
        e.stopPropagation();
        if (isValidProperty) {
            navigate('/properties/view', { state: { property, agent } });
        } else {
            message.warning('Invalid property data');
        }
    };

    const handleCallAgent = (e) => {
        e.stopPropagation();

        const contactInfo = getAgentContactInfo(agent);
        if (contactInfo.phone === 'Not available') {
            message.warning('No phone number available for this agent');
            return;
        }

        if (!requireAuth('call agent')) {
            return;
        }

        window.open(`tel:${contactInfo.phone}`);
    };

    const handleEmailAgent = (e) => {
        e.stopPropagation();

        const contactInfo = getAgentContactInfo(agent);
        if (contactInfo.email === 'Not available') {
            message.warning('No email available for this agent');
            return;
        }

        if (!requireAuth('email agent')) {
            return;
        }

        window.open(`mailto:${contactInfo.email}`);
    };

    const formatPesoPrice = (price) => {
        if (!price && price !== 0) return 'Price on request';

        const priceNum = typeof price === 'string' ? parseFloat(price.replace(/[^0-9.-]+/g, "")) : price;

        if (priceNum >= 1000000) {
            return `₱${(priceNum / 1000000).toFixed(1)}M`;
        } else if (priceNum >= 1000) {
            return `₱${(priceNum / 1000).toFixed(0)}K`;
        }
        return `₱${priceNum.toLocaleString()}`;
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'available':
                return 'green';
            case 'sold':
                return 'red';
            case 'pending':
                return 'orange';
            case 'rented':
                return 'blue';
            default:
                return 'default';
        }
    };

    const getStatusText = (status) => {
        switch (status?.toLowerCase()) {
            case 'available':
                return 'Available';
            case 'sold':
                return 'Sold';
            case 'pending':
                return 'Pending';
            case 'rented':
                return 'Rented';
            default:
                return status || 'Available';
        }
    };

    // FIXED: Improved image URL processing
    const processImageUrl = (url) => {
        if (!url || typeof url !== 'string' || url.trim() === '') {
            return '/default-property.jpg';
        }

        // Already full URL
        if (url.startsWith('http') || url.startsWith('//') || url.startsWith('blob:') || url.startsWith('data:')) {
            return url;
        }

        // Server path - prepend base URL
        if (url.startsWith('/uploads/')) {
            return `https://localhost:7075${url}`;
        }

        // Relative path without leading slash
        if (url.includes('.') && !url.startsWith('/')) {
            return `https://localhost:7075/uploads/properties/${url}`;
        }

        //uploads/ path
        if (url.startsWith('uploads/')) {
            return `https://localhost:7075/${url}`;
        }

        return '/default-property.jpg';
    };

    // FIXED: Improved agent image URL processing
    const processAgentImageUrl = (url) => {
        if (!url || typeof url !== 'string' || url.trim() === '') {
            return '/default-avatar.jpg';
        }

        if (url.startsWith('http') || url.startsWith('//') || url.startsWith('blob:') || url.startsWith('data:')) {
            return url;
        }

        if (url.startsWith('/uploads/')) {
            return `https://localhost:7075${url}`;
        }

        if (url.includes('.') && !url.startsWith('/')) {
            return `https://localhost:7075/uploads/agents/${url}`;
        }

        if (url.startsWith('uploads/')) {
            return `https://localhost:7075/${url}`;
        }

        return '/default-avatar.jpg';
    };

    const formatPhoneNumber = (phone) => {
        if (!phone || phone === 'Not available') return 'Not available';

        const cleaned = phone.replace(/\D/g, '');

        if (cleaned.length === 10) {
            return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        }

        if (cleaned.length === 11 && cleaned.startsWith('1')) {
            return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
        }

        return phone;
    };

    const convertToSqm = (sqft) => {
        if (!sqft) return 0;
        const sqftNum = typeof sqft === 'string' ? parseFloat(sqft) : sqft;
        return Math.round(sqftNum * 0.092903);
    };

    // Return empty card for invalid properties
    if (!isValidProperty) {
        return (
            <Card
                style={{
                    height: '350px',
                    border: '1px dashed #d9d9d9',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Invalid property data"
                />
            </Card>
        );
    }

    // Enhanced property data extraction
    const mainImage = property.mainImage ||
        (property.propertyImages && property.propertyImages[0]?.imageUrl) ||
        (property.imageUrls && property.imageUrls[0]) ||
        '/default-property.jpg';

    const processedImage = processImageUrl(mainImage);

    const agentName = getAgentName(agent);
    const contactInfo = getAgentContactInfo(agent);
    const agentImage = agent ? processAgentImageUrl(agent.profilePictureUrl || agent.baseMember?.profilePictureUrl) : '/default-avatar.jpg';

    // Enhanced area calculation
    const areaSqm = convertToSqm(property.areaSqft || property.squareFeet || property.areaSqm || 0);

    const amenities = getAmenities();
    const displayAmenities = amenities.slice(0, 3);
    const hasMoreAmenities = amenities.length > 3;

    const isWishlistButtonDisabled = wishlistLoading || isToggling || isCheckingWishlist || !property?.id;

    // DEBUG: Log final agent state
    console.log('DEBUG - Final agent display state:', {
        agentId: property.agentId,
        agent,
        agentName,
        contactInfo,
        loadingAgent
    });

    return (
        <Card
            hoverable
            style={{
                height: '350px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                overflow: 'hidden'
            }}
            bodyStyle={{ padding: '16px', height: '100%' }}
        >
            <Row gutter={16} style={{ height: '100%' }}>
                <Col span={8}>
                    <div style={{ position: 'relative', height: '100%' }}>
                        <img
                            alt={property.title}
                            src={imageError ? '/default-property.jpg' : processedImage}
                            style={{
                                height: '100%',
                                width: '100%',
                                objectFit: 'cover',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }}
                            onClick={handleCardClick}
                            onError={(e) => {
                                if (!imageError) {
                                    setImageError(true);
                                    e.target.src = '/default-property.jpg';
                                }
                            }}
                            onLoad={() => setImageError(false)}
                        />
                        <div
                            style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                cursor: isWishlistButtonDisabled ? 'not-allowed' : 'pointer',
                                background: 'rgba(255, 255, 255, 0.9)',
                                borderRadius: '50%',
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backdropFilter: 'blur(4px)',
                                zIndex: 2,
                                opacity: isWishlistButtonDisabled ? 0.6 : 1
                            }}
                            onClick={(e) => handleToggleFavorite(e, property.id, isFavorite)}
                            title={isWishlistButtonDisabled ? 'Updating...' : (isFavorite ? 'Remove from wishlist' : 'Add to wishlist')}
                        >
                            {showLoading ? (
                                <div style={{
                                    width: '14px',
                                    height: '14px',
                                    border: '2px solid #f0f0f0',
                                    borderTop: '2px solid #ff4d4f',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                }} />
                            ) : isFavorite ? (
                                <FaHeart style={{ color: '#ff4d4f', fontSize: '16px' }} />
                            ) : (
                                <FaRegHeart style={{ color: '#64748b', fontSize: '16px' }} />
                            )}
                        </div>

                        <div style={{
                            position: 'absolute',
                            top: '8px',
                            left: '8px'
                        }}>
                            <Tag
                                color="#1B3C53"
                                style={{
                                    margin: 0,
                                    borderRadius: '6px',
                                    border: 'none',
                                    fontWeight: '500',
                                    fontSize: '12px'
                                }}
                            >
                                {property.propertyType || property.type || 'Property'}
                            </Tag>
                        </div>
                    </div>
                </Col>

                <Col span={16}>
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ flex: '0 0 auto' }}>
                            <Row justify="space-between" align="top">
                                <Col flex="auto">
                                    <Title
                                        level={4}
                                        style={{
                                            margin: 0,
                                            fontSize: '16px',
                                            lineHeight: '1.4',
                                            color: '#1B3C53',
                                            fontWeight: '600',
                                            cursor: 'pointer'
                                        }}
                                        onClick={handleCardClick}
                                    >
                                        {property.title || 'Untitled Property'}
                                    </Title>
                                    {/* UPDATED: Location display with full address */}
                                    <div style={{ display: 'flex', alignItems: 'center', marginTop: '4px' }}>
                                        <FaMapMarkerAlt style={{ marginRight: '4px', color: '#64748b', fontSize: '12px' }} />
                                        <Text type="secondary" style={{ fontSize: '12px', color: '#64748b' }}>
                                            {getFullAddress(property)}
                                        </Text>
                                    </div>
                                </Col>
                                <Col flex="none">
                                    <Title level={3} style={{
                                        margin: 0,
                                        color: '#1B3C53',
                                        fontSize: '20px',
                                        fontWeight: '700',
                                        textAlign: 'right'
                                    }}>
                                        {formatPesoPrice(property.price)}
                                    </Title>
                                    {property.pricePerSqft && (
                                        <Text type="secondary" style={{ fontSize: '10px', color: '#64748b', textAlign: 'right', display: 'block' }}>
                                            ₱{Math.round(property.pricePerSqft * 10.7639)?.toLocaleString()}/sqm
                                        </Text>
                                    )}
                                </Col>
                            </Row>
                        </div>

                        <Divider style={{ margin: '12px 0', background: '#f1f5f9' }} />

                        {/* UPDATED: Property features with icons including garage and kitchen */}
                        <div style={{ flex: '0 0 auto' }}>
                            <Space size="small" wrap>
                                <Tooltip title="Bedrooms">
                                    <Tag style={{
                                        background: '#f0f9ff',
                                        border: '1px solid #1B3C53',
                                        color: '#1B3C53',
                                        borderRadius: '6px',
                                        margin: 0,
                                        fontSize: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}>
                                        <FaBed size={12} />
                                        {property.bedrooms || 0}
                                    </Tag>
                                </Tooltip>
                                <Tooltip title="Bathrooms">
                                    <Tag style={{
                                        background: '#f0f9ff',
                                        border: '1px solid #1B3C53',
                                        color: '#1B3C53',
                                        borderRadius: '6px',
                                        margin: 0,
                                        fontSize: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}>
                                        {/* UPDATED: Dynamic bath icon based on bathroom count */}
                                        {getBathIcon(property.bathrooms || 0)}
                                        {property.bathrooms || 0}
                                    </Tag>
                                </Tooltip>
                                <Tooltip title="Area">
                                    <Tag style={{
                                        background: '#f0f9ff',
                                        border: '1px solid #1B3C53',
                                        color: '#1B3C53',
                                        borderRadius: '6px',
                                        margin: 0,
                                        fontSize: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}>
                                        <FaHome size={12} />
                                        {areaSqm.toLocaleString()} sqm
                                    </Tag>
                                </Tooltip>
                                {/* NEW: Garage with icon */}
                                {property.garage > 0 && (
                                    <Tooltip title="Garage">
                                        <Tag style={{
                                            background: '#f0fdf4',
                                            border: '1px solid #16a34a',
                                            color: '#166534',
                                            borderRadius: '6px',
                                            margin: 0,
                                            fontSize: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}>
                                            <FaCar size={12} />
                                            {property.garage}
                                        </Tag>
                                    </Tooltip>
                                )}
                                {/* NEW: Kitchen with icon */}
                                {property.kitchen > 0 && (
                                    <Tooltip title="Kitchen">
                                        <Tag style={{
                                            background: '#fff7ed',
                                            border: '1px solid #ea580c',
                                            color: '#9a3412',
                                            borderRadius: '6px',
                                            margin: 0,
                                            fontSize: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}>
                                            <FaCoffee size={12} />
                                            {property.kitchen}
                                        </Tag>
                                    </Tooltip>
                                )}
                            </Space>
                        </div>

                        {amenities.length > 0 && (
                            <>
                                <Divider style={{ margin: '8px 0', background: '#f1f5f9' }} />
                                <div style={{ flex: '0 0 auto' }}>
                                    <Space size={[4, 4]} wrap>
                                        {displayAmenities.map((amenity, index) => (
                                            <Tag
                                                key={index}
                                                style={{
                                                    background: '#f0fdf4',
                                                    border: '1px solid #16a34a',
                                                    color: '#166534',
                                                    borderRadius: '4px',
                                                    margin: 0,
                                                    fontSize: '10px',
                                                    padding: '2px 6px',
                                                    lineHeight: '1.2'
                                                }}
                                            >
                                                {amenity}
                                            </Tag>
                                        ))}
                                        {hasMoreAmenities && (
                                            <Tag
                                                style={{
                                                    background: '#f8fafc',
                                                    border: '1px solid #64748b',
                                                    color: '#64748b',
                                                    borderRadius: '4px',
                                                    margin: 0,
                                                    fontSize: '10px',
                                                    padding: '2px 6px',
                                                    lineHeight: '1.2'
                                                }}
                                            >
                                                +{amenities.length - 3} more
                                            </Tag>
                                        )}
                                    </Space>
                                </div>
                            </>
                        )}

                        <Divider style={{ margin: '8px 0', background: '#f1f5f9' }} />

                        {/* FIXED: Agent display section with better fallbacks */}
                        <div style={{ flex: '1 1 auto', minHeight: '0' }}>
                            {loadingAgent ? (
                                <Skeleton avatar paragraph={{ rows: 2 }} />
                            ) : (
                                <div style={{
                                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    padding: '12px',
                                    marginBottom: '8px'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        marginBottom: '8px'
                                    }}>
                                        <Avatar
                                            size={32}
                                            src={agentImageError ? '/default-avatar.jpg' : agentImage}
                                            alt={agentName}
                                            icon={!agentImage && <FaUser />}
                                            onError={(e) => {
                                                if (!agentImageError) {
                                                    setAgentImageError(true);
                                                    e.target.src = '/default-avatar.jpg';
                                                }
                                            }}
                                            onLoad={() => setAgentImageError(false)}
                                        />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <Text strong style={{ color: '#1B3C53', fontSize: '12px', display: 'block', lineHeight: '1.2' }}>
                                                {agentName}
                                            </Text>
                                            <Text type="secondary" style={{ fontSize: '10px', display: 'block', lineHeight: '1.2' }}>
                                                {getSpecializationDisplay(contactInfo.specialization)}
                                            </Text>
                                        </div>
                                    </div>

                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '4px',
                                        background: 'rgba(255, 255, 255, 0.7)',
                                        borderRadius: '6px',
                                        padding: '8px'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <FaPhone style={{ fontSize: '10px', color: '#1B3C53' }} />
                                            <Tooltip title={contactInfo.phone !== 'Not available' ? 'Click to call' : 'No phone number available'}>
                                                <Text
                                                    style={{
                                                        fontSize: '10px',
                                                        color: contactInfo.phone !== 'Not available' ? '#1B3C53' : '#64748b',
                                                        cursor: contactInfo.phone !== 'Not available' ? 'pointer' : 'default',
                                                        textDecoration: contactInfo.phone !== 'Not available' ? 'underline' : 'none',
                                                        fontWeight: '500'
                                                    }}
                                                    onClick={contactInfo.phone !== 'Not available' ? handleCallAgent : undefined}
                                                >
                                                    {formatPhoneNumber(contactInfo.phone)}
                                                </Text>
                                            </Tooltip>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <FaEnvelope style={{ fontSize: '10px', color: '#1B3C53' }} />
                                            <Tooltip title={contactInfo.email !== 'Not available' ? 'Click to email' : 'No email available'}>
                                                <Text
                                                    style={{
                                                        fontSize: '10px',
                                                        color: contactInfo.email !== 'Not available' ? '#1B3C53' : '#64748b',
                                                        cursor: contactInfo.email !== 'Not available' ? 'pointer' : 'default',
                                                        textDecoration: contactInfo.email !== 'Not available' ? 'underline' : 'none',
                                                        fontWeight: '500'
                                                    }}
                                                    onClick={contactInfo.email !== 'Not available' ? handleEmailAgent : undefined}
                                                >
                                                    {contactInfo.email}
                                                </Text>
                                            </Tooltip>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {showActions && (
                            <div style={{ flex: '0 0 auto', marginTop: '12px' }}>
                                <Space.Compact style={{ width: '100%' }}>
                                    <Button
                                        type="primary"
                                        icon={<FaCalendarAlt />}
                                        onClick={handleScheduleTour}
                                        style={{
                                            borderRadius: '6px 0 0 6px',
                                            background: '#1B3C53',
                                            borderColor: '#1B3C53',
                                            fontWeight: '600',
                                            flex: 1,
                                            fontSize: '12px',
                                            height: '32px'
                                        }}
                                    >
                                        Tour
                                    </Button>
                                    <Button
                                        icon={<FaComments />}
                                        onClick={handleChat}
                                        style={{
                                            borderRadius: '0',
                                            borderColor: '#1B3C53',
                                            color: '#1B3C53',
                                            fontWeight: '600',
                                            flex: 1,
                                            fontSize: '12px',
                                            height: '32px'
                                        }}
                                    >
                                        Chat
                                    </Button>
                                    <Button
                                        type="primary"
                                        icon={<FaEye />}
                                        onClick={handleViewDetails}
                                        style={{
                                            borderRadius: '0 6px 6px 0',
                                            background: '#1890ff',
                                            borderColor: '#1890ff',
                                            fontWeight: '600',
                                            flex: 1,
                                            fontSize: '12px',
                                            height: '32px'
                                        }}
                                    >
                                        View
                                    </Button>
                                </Space.Compact>
                            </div>
                        )}

                        {property.status && property.status !== 'available' && (
                            <div style={{ marginTop: '8px', textAlign: 'center' }}>
                                <Tag
                                    color={getStatusColor(property.status)}
                                    style={{
                                        borderRadius: '4px',
                                        fontWeight: '500',
                                        margin: 0,
                                        fontSize: '10px'
                                    }}
                                >
                                    {getStatusText(property.status)}
                                </Tag>
                            </div>
                        )}
                    </div>
                </Col>
            </Row>
            <style>
                {`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                `}
            </style>
        </Card>
    );
};

export default PropertyCard;