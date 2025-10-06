import React, { useState, useEffect } from 'react';
import { Card, Tag, Typography, Space, Divider, Button, message, Avatar } from 'antd';
import {
    EnvironmentOutlined,
    HeartOutlined,
    HeartFilled,
    CalendarOutlined,
    MessageOutlined,
    EyeOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useWishlistData } from './Services/WishlistAdded';
import { useUser } from '../Authpage/Services/UserContextService';

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
    } = useWishlistData();

    const [isFavorite, setIsFavorite] = useState(false);
    const [isCheckingWishlist, setIsCheckingWishlist] = useState(true);
    const [isToggling, setIsToggling] = useState(false);
    const [showLoading, setShowLoading] = useState(false);

    // Check if property is in wishlist on component mount
    useEffect(() => {
        const checkWishlistStatus = async () => {
            if (!property?.id) {
                setIsCheckingWishlist(false);
                return;
            }

            try {
                setIsCheckingWishlist(true);
                const inWishlist = await isPropertyInWishlist(property.id);
                setIsFavorite(inWishlist);
            } catch (error) {
                console.error('Error checking wishlist status:', error);
                const localWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
                setIsFavorite(localWishlist.includes(property.id));
            } finally {
                setIsCheckingWishlist(false);
            }
        };

        checkWishlistStatus();
    }, [property?.id, isPropertyInWishlist]);

    const handleCardClick = () => {
        navigate('/properties/view', { state: { property } });
    };

    // Redirect to login if not authenticated
    const requireAuth = (actionName = 'perform this action') => {
        if (!isAuthenticated) {
            const returnUrl = window.location.pathname + window.location.search;
            navigate(`/login?returnUrl=${encodeURIComponent(returnUrl)}&action=${encodeURIComponent(actionName)}`);
            return false;
        }
        return true;
    };

    // Handle wishlist toggle with 0.5s loading
    const handleToggleFavorite = async (e, propertyId, isCurrentlyFavorite) => {
        e.stopPropagation();
        e.preventDefault();

        if (isWishlistButtonDisabled) {
            return;
        }

        // Check authentication
        if (!requireAuth('add to wishlist')) {
            return;
        }

        try {
            setIsToggling(true);
            setShowLoading(true);

            // Add minimum 0.5s loading delay
            const [wishlistResult] = await Promise.all([
                toggleWishlist(propertyId, !isCurrentlyFavorite),
                new Promise(resolve => setTimeout(resolve, 500)) // 0.5 second minimum delay
            ]);

            setIsFavorite(!isCurrentlyFavorite);
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

    // Handle schedule tour
    const handleScheduleTour = (e) => {
        e.stopPropagation();

        // Check authentication
        if (!requireAuth('schedule a tour')) {
            return;
        }

        if (onScheduleTour) {
            onScheduleTour(property);
        } else {
            navigate('/schedule', { state: { property } });
        }
    };

    // Handle chat
    const handleChat = (e) => {
        e.stopPropagation();

        // Check authentication
        if (!requireAuth('chat with agent')) {
            return;
        }

        if (onChat) {
            onChat(property);
        } else {
            navigate('/messages', { state: { property } });
        }
    };

    const handleViewDetails = (e) => {
        e.stopPropagation();
        navigate('/properties/view', { state: { property } });
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

    // Process image URL
    const processImageUrl = (url) => {
        if (!url || url === 'string') {
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

    // Process agent image URL
    const processAgentImageUrl = (url) => {
        if (!url || url === 'string') {
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

    const mainImage = property.mainImage ||
        (property.propertyImages && property.propertyImages[0]?.imageUrl) ||
        '/default-property.jpg';

    const processedImage = processImageUrl(mainImage);

    // Get agent information
    const agent = property.agent || property.listedBy || {};
    const agentName = agent.name || agent.fullName || 'Unknown Agent';
    const agentImage = processAgentImageUrl(agent.profilePicture || agent.imageUrl);

    // Determine if wishlist button should be disabled
    const isWishlistButtonDisabled = wishlistLoading || isToggling || isCheckingWishlist || !property?.id;

    return (
        <Card
            hoverable
            style={{
                height: '100%',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                overflow: 'hidden'
            }}
            bodyStyle={{ padding: '20px' }}
            cover={
                <div style={{ position: 'relative' }}>
                    <img
                        alt={property.title}
                        src={processedImage}
                        style={{
                            height: '220px',
                            objectFit: 'cover',
                            width: '100%',
                            cursor: 'pointer'
                        }}
                        onClick={handleCardClick}
                        onError={(e) => {
                            e.target.src = '/default-property.jpg';
                        }}
                    />
                    {/* Wishlist Heart Button */}
                    <div
                        style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            cursor: isWishlistButtonDisabled ? 'not-allowed' : 'pointer',
                            background: 'rgba(255, 255, 255, 0.9)',
                            borderRadius: '50%',
                            width: '36px',
                            height: '36px',
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
                                width: '16px',
                                height: '16px',
                                border: '2px solid #f0f0f0',
                                borderTop: '2px solid #ff4d4f',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                            }} />
                        ) : isFavorite ? (
                            <HeartFilled style={{ color: '#ff4d4f', fontSize: '18px' }} />
                        ) : (
                            <HeartOutlined style={{ color: '#64748b', fontSize: '18px' }} />
                        )}
                    </div>

                    {/* Property Type Tag */}
                    <div style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px'
                    }}>
                        <Tag
                            color="#1B3C53"
                            style={{
                                margin: 0,
                                borderRadius: '6px',
                                border: 'none',
                                fontWeight: '500'
                            }}
                        >
                            {property.propertyType || property.type || 'Property'}
                        </Tag>
                    </div>
                </div>
            }
            onClick={handleCardClick}
        >
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
                {/* Property Title */}
                <Title
                    level={4}
                    style={{
                        margin: 0,
                        fontSize: '18px',
                        lineHeight: '1.4',
                        color: '#1B3C53',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}
                    onClick={handleCardClick}
                >
                    {property.title}
                </Title>

                {/* Location */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <EnvironmentOutlined style={{ marginRight: '6px', color: '#64748b', fontSize: '14px' }} />
                    <Text type="secondary" style={{ fontSize: '14px', color: '#64748b' }}>
                        {property.location || property.city || property.address || 'Location not specified'}
                    </Text>
                </div>

                <Divider style={{ margin: '16px 0', background: '#f1f5f9' }} />

                {/* Price */}
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <Title level={3} style={{
                        margin: 0,
                        color: '#1B3C53',
                        fontSize: '24px',
                        fontWeight: '700'
                    }}>
                        {formatPesoPrice(property.price)}
                    </Title>
                    {property.pricePerSqft && (
                        <Text type="secondary" style={{ fontSize: '12px', color: '#64748b' }}>
                            ₱{property.pricePerSqft?.toLocaleString()}/sq ft
                        </Text>
                    )}
                </Space>

                <Divider style={{ margin: '16px 0', background: '#f1f5f9' }} />

                {/* Property Details */}
                <Space size="small" wrap>
                    <Tag style={{
                        background: '#f0f9ff',
                        border: '1px solid #1B3C53',
                        color: '#1B3C53',
                        borderRadius: '6px',
                        margin: 0
                    }}>
                        {property.bedrooms || 0} beds
                    </Tag>
                    <Tag style={{
                        background: '#f0f9ff',
                        border: '1px solid #1B3C53',
                        color: '#1B3C53',
                        borderRadius: '6px',
                        margin: 0
                    }}>
                        {property.bathrooms || 0} baths
                    </Tag>
                    <Tag style={{
                        background: '#f0f9ff',
                        border: '1px solid #1B3C53',
                        color: '#1B3C53',
                        borderRadius: '6px',
                        margin: 0
                    }}>
                        {(property.areaSqft || property.squareFeet || 0).toLocaleString()} sq ft
                    </Tag>
                </Space>

                {/* Agent Information */}
                <Divider style={{ margin: '16px 0', background: '#f1f5f9' }} />
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px',
                    background: '#f8fafc',
                    borderRadius: '8px'
                }}>
                    <Avatar
                        size={40}
                        src={agentImage}
                        alt={agentName}
                        onError={(e) => {
                            e.target.src = '/default-avatar.jpg';
                        }}
                    />
                    <div>
                        <Text strong style={{ color: '#1B3C53', fontSize: '14px' }}>
                            {agentName}
                        </Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            Real Estate Agent
                        </Text>
                    </div>
                </div>

                {/* Action Buttons */}
                {showActions && (
                    <Space.Compact style={{ width: '100%', marginTop: '16px' }}>
                        <Button
                            type="primary"
                            icon={<CalendarOutlined />}
                            onClick={handleScheduleTour}
                            style={{
                                borderRadius: '8px 0 0 8px',
                                background: '#1B3C53',
                                borderColor: '#1B3C53',
                                fontWeight: '600',
                                flex: 1
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
                                flex: 1
                            }}
                        >
                            Chat
                        </Button>
                        <Button
                            type="primary"
                            icon={<EyeOutlined />}
                            onClick={handleViewDetails}
                            style={{
                                borderRadius: '0 8px 8px 0',
                                background: '#1890ff',
                                borderColor: '#1890ff',
                                fontWeight: '600',
                                flex: 1
                            }}
                        >
                            View
                        </Button>
                    </Space.Compact>
                )}

                {/* Additional Property Features */}
                {(property.features || property.amenities) && (
                    <>
                        <Divider style={{ margin: '16px 0', background: '#f1f5f9' }} />
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {(property.features ?
                                (typeof property.features === 'string' ?
                                    property.features.split(',').slice(0, 2) :
                                    property.features.slice(0, 2)) :
                                (property.amenities ?
                                    (typeof property.amenities === 'string' ?
                                        JSON.parse(property.amenities).slice(0, 2) :
                                        property.amenities.slice(0, 2)) :
                                    [])
                            ).map((feature, index) => (
                                <Tag
                                    key={index}
                                    style={{
                                        background: '#f8fafc',
                                        border: '1px solid #e2e8f0',
                                        color: '#64748b',
                                        borderRadius: '4px',
                                        fontSize: '10px',
                                        padding: '2px 6px',
                                        margin: 0
                                    }}
                                >
                                    {typeof feature === 'string' ? feature.trim() : feature}
                                </Tag>
                            ))}
                            {((property.features &&
                                (typeof property.features === 'string' ?
                                    property.features.split(',').length > 2 :
                                    property.features.length > 2)) ||
                                (property.amenities &&
                                    (typeof property.amenities === 'string' ?
                                        JSON.parse(property.amenities).length > 2 :
                                        property.amenities.length > 2))) && (
                                    <Tag
                                        style={{
                                            background: '#f8fafc',
                                            border: '1px solid #e2e8f0',
                                            color: '#64748b',
                                            borderRadius: '4px',
                                            fontSize: '10px',
                                            padding: '2px 6px',
                                            margin: 0
                                        }}
                                    >
                                        +more
                                    </Tag>
                                )}
                        </div>
                    </>
                )}

                {/* Property Status Badge */}
                {property.status && property.status !== 'available' && (
                    <div style={{ marginTop: '12px' }}>
                        <Tag
                            color={getStatusColor(property.status)}
                            style={{
                                borderRadius: '6px',
                                fontWeight: '500',
                                margin: 0
                            }}
                        >
                            {getStatusText(property.status)}
                        </Tag>
                    </div>
                )}
            </Space>
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