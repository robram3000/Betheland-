import React, { useState, useEffect, useCallback } from 'react';
import { Card, Tag, Typography, Space, Divider, Button, message, Avatar, Skeleton, Row, Col, Tooltip } from 'antd';
import {
    EnvironmentOutlined,
    HeartOutlined,
    HeartFilled,
    CalendarOutlined,
    MessageOutlined,
    EyeOutlined,
    UserOutlined,
    PhoneOutlined,
    MailOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useWishlistData } from './Services/WishlistAdded';
import { useUser } from '../Authpage/Services/UserContextService';
import { agentService } from './Services/GetAgent';

const { Title, Text } = Typography;

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

    const fetchAgent = useCallback(async () => {
        if (!property?.agentId) {
            console.log("No agent ID provided:", property?.agentId);
            setAgent(null);
            return;
        }

        // Check cache first to prevent unnecessary API calls
        if (agentCache[property.agentId]) {
            setAgent(agentCache[property.agentId]);
            return;
        }

        try {
            setLoadingAgent(true);
            console.log("Fetching agent with ID:", property.agentId);
            const agentData = await agentService.getAgentById(property.agentId);
            console.log("Agent data received:", agentData);
            setAgent(agentData);

            // Update cache
            setAgentCache(prev => ({
                ...prev,
                [property.agentId]: agentData
            }));
        } catch (error) {
            console.error('Error fetching agent:', error);
            setAgent(null);
        } finally {
            setLoadingAgent(false);
        }
    }, [property?.agentId, agentCache]);

    useEffect(() => {
        fetchAgent();
    }, [fetchAgent]);

    useEffect(() => {
        const checkWishlistStatus = async () => {
            if (!property?.id) {
                setIsCheckingWishlist(false);
                return;
            }

            try {
                setIsCheckingWishlist(true);
                const localCheck = wishlistPropertyIds?.includes(property.id);
                setIsFavorite(localCheck);

                if (isAuthenticated) {
                    const serverCheck = await isPropertyInWishlist(property.id);
                    if (serverCheck !== localCheck) {
                        setIsFavorite(serverCheck);
                    }
                }
            } catch (error) {
                console.error('Error checking wishlist status:', error);
                const localCheck = wishlistPropertyIds?.includes(property.id);
                setIsFavorite(localCheck);
            } finally {
                setIsCheckingWishlist(false);
            }
        };

        checkWishlistStatus();
    }, [property?.id, isPropertyInWishlist, isAuthenticated, wishlistPropertyIds]);

    const handleCardClick = () => {
        navigate('/properties/view', { state: { property, agent } });
    };

    const getSpecializationDisplay = (specialization) => {
        if (!specialization) return 'Not specified';

        try {
            if (Array.isArray(specialization)) {
                return specialization.join(', ');
            }

            if (typeof specialization === 'string' && specialization.startsWith('[')) {
                const parsed = JSON.parse(specialization);
                return Array.isArray(parsed) ? parsed.join(', ') : specialization;
            }

            return specialization;
        } catch (error) {
            console.error('Error parsing specialization:', error);
            return specialization || 'Not specified';
        }
    };

    const getAmenities = () => {
        if (!property?.amenities) return [];

        try {
            if (Array.isArray(property.amenities)) {
                return property.amenities;
            }

            if (typeof property.amenities === 'string' && property.amenities.startsWith('[')) {
                const parsed = JSON.parse(property.amenities);
                return Array.isArray(parsed) ? parsed : [];
            }

            return property.amenities.split(',').map(item => item.trim());
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

        if (isWishlistButtonDisabled) {
            return;
        }

        if (!requireAuth('add to wishlist')) {
            return;
        }

        try {
            setIsToggling(true);
            setShowLoading(true);
            setIsFavorite(!isCurrentlyFavorite);

            await toggleWishlist(propertyId, !isCurrentlyFavorite);
            await refreshWishlist();

            message.success(!isCurrentlyFavorite ? 'Added to wishlist' : 'Removed from wishlist');
        } catch (error) {
            console.error('Error updating wishlist:', error);
            message.error('Failed to update wishlist');
            setIsFavorite(isCurrentlyFavorite);
        } finally {
            setIsToggling(false);
            setShowLoading(false);
        }
    };

    const handleScheduleTour = (e) => {
        e.stopPropagation();

        if (!requireAuth('schedule a tour')) {
            return;
        }

        if (onScheduleTour) {
            // FIX: Pass both property and agent data
            onScheduleTour({
                ...property,
                agent: agent // Include the fetched agent data
            });
        } else {
            navigate('/schedule', { state: { property, agent } });
        }
    };

    const handleChat = (e) => {
        e.stopPropagation();

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
        navigate('/properties/view', { state: { property, agent } });
    };

    const handleCallAgent = (e) => {
        e.stopPropagation();

        if (!agent?.baseMember?.phoneNumber) {
            message.warning('No phone number available for this agent');
            return;
        }

        if (!requireAuth('call agent')) {
            return;
        }

        window.open(`tel:${agent.baseMember.phoneNumber}`);
    };

    const handleEmailAgent = (e) => {
        e.stopPropagation();

        if (!agent?.baseMember?.email) {
            message.warning('No email available for this agent');
            return;
        }

        if (!requireAuth('email agent')) {
            return;
        }

        window.open(`mailto:${agent.baseMember.email}`);
    };

    const formatPesoPrice = (price) => {
        if (!price && price !== 0) return 'Price on request';

        if (price >= 1000000) {
            return `₱${(price / 1000000).toFixed(1)}M`;
        } else if (price >= 1000) {
            return `₱${(price / 1000).toFixed(0)}K`;
        }
        return `₱${price}`;
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

    // FIXED: Image URL processing without the problematic condition
    const processImageUrl = (url) => {
        if (!url || typeof url !== 'string' || url.trim() === '') {
            return '/default-property.jpg';
        }

        if (url.startsWith('http') || url.startsWith('//') || url.startsWith('blob:')) {
            return url;
        }

        if (url.startsWith('/uploads/')) {
            return `https://localhost:7075${url}`;
        }

        if (url.includes('.') && !url.startsWith('/')) {
            return `https://localhost:7075/uploads/properties/${url}`;
        }

        if (url.startsWith('uploads/')) {
            return `https://localhost:7075/${url}`;
        }

        return '/default-property.jpg';
    };

    // FIXED: Agent image URL processing
    const processAgentImageUrl = (url) => {
        if (!url || typeof url !== 'string' || url.trim() === '') {
            return '/default-avatar.jpg';
        }

        if (url.startsWith('http') || url.startsWith('//') || url.startsWith('blob:')) {
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
        if (!phone) return 'Not available';

        const cleaned = phone.replace(/\D/g, '');

        if (cleaned.length === 10) {
            return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        }

        return phone;
    };

    const convertToSqm = (sqft) => {
        if (!sqft) return 0;
        return Math.round(sqft * 0.092903);
    };

    const mainImage = property.mainImage ||
        (property.propertyImages && property.propertyImages[0]?.imageUrl) ||
        '/default-property.jpg';

    const processedImage = processImageUrl(mainImage);

    const agentName = agent ? `${agent.firstName} ${agent.lastName}`.trim() : 'Unknown Agent';
    const agentImage = agent ? processAgentImageUrl(agent.baseMember?.profilePictureUrl) : '/default-avatar.jpg';
    const agentEmail = agent?.email || 'Not available';
    const agentPhone = agent?.cellPhoneNo || 'Not available';

    const areaSqm = convertToSqm(property.areaSqft || property.squareFeet || 0);

    const amenities = getAmenities();
    const displayAmenities = amenities.slice(0, 3);
    const hasMoreAmenities = amenities.length > 3;

    const isWishlistButtonDisabled = wishlistLoading || isToggling || isCheckingWishlist || !property?.id;

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
                                <HeartFilled style={{ color: '#ff4d4f', fontSize: '16px' }} />
                            ) : (
                                <HeartOutlined style={{ color: '#64748b', fontSize: '16px' }} />
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
                                        {property.title}
                                    </Title>
                                    <div style={{ display: 'flex', alignItems: 'center', marginTop: '4px' }}>
                                        <EnvironmentOutlined style={{ marginRight: '4px', color: '#64748b', fontSize: '12px' }} />
                                        <Text type="secondary" style={{ fontSize: '12px', color: '#64748b' }}>
                                            {property.location || property.city || property.address || 'Location not specified'}
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

                        <div style={{ flex: '0 0 auto' }}>
                            <Space size="small" wrap>
                                <Tag style={{
                                    background: '#f0f9ff',
                                    border: '1px solid #1B3C53',
                                    color: '#1B3C53',
                                    borderRadius: '6px',
                                    margin: 0,
                                    fontSize: '12px'
                                }}>
                                    {property.bedrooms || 0} beds
                                </Tag>
                                <Tag style={{
                                    background: '#f0f9ff',
                                    border: '1px solid #1B3C53',
                                    color: '#1B3C53',
                                    borderRadius: '6px',
                                    margin: 0,
                                    fontSize: '12px'
                                }}>
                                    {property.bathrooms || 0} baths
                                </Tag>
                                <Tag style={{
                                    background: '#f0f9ff',
                                    border: '1px solid #1B3C53',
                                    color: '#1B3C53',
                                    borderRadius: '6px',
                                    margin: 0,
                                    fontSize: '12px'
                                }}>
                                    {areaSqm.toLocaleString()} sqm
                                </Tag>
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
                                            icon={!agentImage && <UserOutlined />}
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
                                                {agent ? `${agent.firstName} ${agent.middleName} ${agent.lastName} ${agent.suffix}`.trim() : 'Unknown Agent'}
                                            </Text>
                                            <Text type="secondary" style={{ fontSize: '10px', display: 'block', lineHeight: '1.2' }}>
                                                {agent?.specialization ? getSpecializationDisplay(agent.specialization) : 'Not specified'}
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
                                            <PhoneOutlined style={{ fontSize: '10px', color: '#1B3C53' }} />
                                            <Tooltip title={agentPhone !== 'Not available' ? 'Click to call' : 'No phone number available'}>
                                                <Text
                                                    style={{
                                                        fontSize: '10px',
                                                        color: agentPhone !== 'Not available' ? '#1B3C53' : '#64748b',
                                                        cursor: agentPhone !== 'Not available' ? 'pointer' : 'default',
                                                        textDecoration: agentPhone !== 'Not available' ? 'underline' : 'none',
                                                        fontWeight: '500'
                                                    }}
                                                    onClick={agentPhone !== 'Not available' ? handleCallAgent : undefined}
                                                >
                                                    {formatPhoneNumber(agentPhone)}
                                                </Text>
                                            </Tooltip>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <MailOutlined style={{ fontSize: '10px', color: '#1B3C53' }} />
                                            <Tooltip title={agentEmail !== 'Not available' ? 'Click to email' : 'No email available'}>
                                                <Text
                                                    style={{
                                                        fontSize: '10px',
                                                        color: agentEmail !== 'Not available' ? '#1B3C53' : '#64748b',
                                                        cursor: agentEmail !== 'Not available' ? 'pointer' : 'default',
                                                        textDecoration: agentEmail !== 'Not available' ? 'underline' : 'none',
                                                        fontWeight: '500'
                                                    }}
                                                    onClick={agentEmail !== 'Not available' ? handleEmailAgent : undefined}
                                                >
                                                    {agentEmail}
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
                                        icon={<CalendarOutlined />}
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
                                        icon={<MessageOutlined />}
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
                                        icon={<EyeOutlined />}
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