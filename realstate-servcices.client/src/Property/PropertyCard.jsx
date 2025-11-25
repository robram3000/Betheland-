import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, Typography, Space, Button, message, Avatar, Skeleton, Row, Col, Tooltip, Modal, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useWishlistData } from './Services/WishlistAdded';
import { useUser } from '../Authpage/Services/UserContextService';
import agentService from '../Employeesportal/AdminPortal/Creation_Agent/Services/AgentService';

import {
    FaHeart,
    FaRegHeart,
    FaCalendarAlt,
    FaComments,
    FaEye,
    FaBed,
    FaBath,
    FaCar,
    FaHome,
    FaMapMarkerAlt,
    FaStar,
    FaChevronLeft,
    FaChevronRight,
    FaTimes,
    FaUtensils
} from 'react-icons/fa';

const { Text, Title } = Typography;

const PropertyCard = ({
    property,
    onScheduleTour,
    onChat,
    showActions = true,
    viewMode = 'grid',
    landscapeHeight = '320px'
}) => {
    const navigate = useNavigate();
    const { isAuthenticated } = useUser();
    const {
        toggleWishlist,
        isPropertyInWishlist,
        wishlistPropertyIds,
        refreshWishlist
    } = useWishlistData();

    const [isFavorite, setIsFavorite] = useState(false);
    const [isToggling, setIsToggling] = useState(false);
    const [agent, setAgent] = useState(null);
    const [loadingAgent, setLoadingAgent] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [galleryImageIndex, setGalleryImageIndex] = useState(0);

    // Enhanced property validation
    const isValidProperty = useMemo(() => {
        if (!property) {
            console.log('❌ Invalid property: property is null/undefined');
            return false;
        }

        const hasId = property.id || property.propertyId;
        const hasTitle = property.title || property.propertyName || property.name;

        if (!hasId) {
            console.log('❌ Invalid property: Missing ID', property);
            return false;
        }

        if (!hasTitle) {
            console.log('❌ Invalid property: Missing title', property);
            return false;
        }

        console.log('✅ Valid property:', {
            id: property.id || property.propertyId,
            title: property.title || property.propertyName || property.name
        });
        return true;
    }, [property]);

    // Get property images
    const propertyImages = useMemo(() => {
        if (!property) return [];

        const images = [];

        // Use mainImage if available
        if (property.mainImage) {
            images.push(property.mainImage);
        }

        // Use imageUrls if available
        if (property.imageUrls && Array.isArray(property.imageUrls)) {
            property.imageUrls.forEach(url => {
                if (url && !images.includes(url)) {
                    images.push(url);
                }
            });
        }

        // Use propertyImages if available
        if (property.propertyImages && Array.isArray(property.propertyImages)) {
            property.propertyImages.forEach(img => {
                if (img.imageUrl && !images.includes(img.imageUrl)) {
                    images.push(img.imageUrl);
                }
            });
        }

        // Fallback to default image if no images found
        if (images.length === 0) {
            images.push('/default-property.jpg');
        }

        return images;
    }, [property]);

    const hasMultipleImages = propertyImages.length > 1;

    // FIXED: Enhanced amenities parsing
    const getDisplayAmenities = () => {
        if (!property.amenities) return [];

        let amenitiesArray = [];

        try {
            if (Array.isArray(property.amenities)) {
                amenitiesArray = property.amenities;
            } else if (typeof property.amenities === 'string') {
                try {
                    const parsed = JSON.parse(property.amenities);
                    if (Array.isArray(parsed)) {
                        amenitiesArray = parsed;
                    } else if (typeof parsed === 'string') {
                        amenitiesArray = parsed.split(',').map(item => item.trim()).filter(item => item);
                    } else if (parsed && typeof parsed === 'object') {
                        // Handle object format
                        amenitiesArray = Object.values(parsed).filter(item => item && typeof item === 'string');
                    }
                } catch (e) {
                    amenitiesArray = property.amenities.split(',').map(item => item.trim()).filter(item => item);
                }
            } else if (property.amenities && typeof property.amenities === 'object') {
                amenitiesArray = Object.values(property.amenities).filter(item => item && typeof item === 'string');
            }
        } catch (error) {
            console.error('Error parsing amenities:', error);
            amenitiesArray = [];
        }

        console.log('🔧 Processed amenities for display:', amenitiesArray);
        return amenitiesArray;
    };

    const displayAmenities = getDisplayAmenities();
    const hasMoreAmenities = displayAmenities.length > 3;

    // Navigation functions
    const nextImage = (e) => {
        if (e) e.stopPropagation();
        setCurrentImageIndex((prevIndex) =>
            prevIndex === propertyImages.length - 1 ? 0 : prevIndex + 1
        );
    };

    const prevImage = (e) => {
        if (e) e.stopPropagation();
        setCurrentImageIndex((prevIndex) =>
            prevIndex === 0 ? propertyImages.length - 1 : prevIndex - 1
        );
    };

    const nextGalleryImage = () => {
        setGalleryImageIndex((prevIndex) =>
            prevIndex === propertyImages.length - 1 ? 0 : prevIndex + 1
        );
    };

    const prevGalleryImage = () => {
        setGalleryImageIndex((prevIndex) =>
            prevIndex === 0 ? propertyImages.length - 1 : prevIndex - 1
        );
    };

    const openGallery = (e) => {
        e.stopPropagation();
        setGalleryImageIndex(currentImageIndex);
        setIsGalleryOpen(true);
    };

    const closeGallery = () => {
        setIsGalleryOpen(false);
    };

    // Reset image index when property changes
    useEffect(() => {
        setCurrentImageIndex(0);
        setImageError(false);
    }, [property?.id]);

    // Helper functions
    const getAgentName = (agent) => {
        if (!agent) return 'Agent Not Assigned';
        const nameParts = [
            agent.firstName,
            agent.middleName,
            agent.lastName,
        ].filter(part => part && part.trim() !== '');
        return nameParts.join(' ').trim() || 'Agent Not Assigned';
    };

    const getPropertyTypeColor = (type) => {
        if (!type) return 'gray';

        const lowerType = type.toLowerCase();

        const typeColors = {
            'house': 'blue',
            'apartment': 'geekblue',
            'condo': 'cyan',
            'townhouse': 'blue',
            'commercial': 'green',
            'land': 'orange',
            'default': 'gray'
        };

        if (typeColors[lowerType]) {
            return typeColors[lowerType];
        }

        return typeColors.default;
    };

    const getPropertyTypeDisplay = () => {
        const type = property.propertyType || property.type;
        if (!type) return 'Property';

        const lowerType = type.toLowerCase();

        const typeNames = {
            'house': 'House',
            'apartment': 'Apartment',
            'condo': 'Condo',
            'townhouse': 'Townhouse',
            'commercial': 'Commercial',
            'land': 'Land',
            'residential': 'Residential'
        };

        if (typeNames[lowerType]) {
            return typeNames[lowerType];
        }

        return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
    };

    const formatCompleteAddress = () => {
        const addressParts = [
            property.address,
            property.city,
            property.state,
            property.zipCode
        ].filter(part => part && part.trim() !== '');

        return addressParts.join(', ') || 'Address not specified';
    };

    const formatPrice = (price) => {
        if (!price && price !== 0) return 'Price on request';
        const priceNum = typeof price === 'string' ? parseFloat(price.replace(/[^0-9.-]+/g, "")) : price;
        return `₱${priceNum.toLocaleString()}`;
    };

    const formatArea = (areaSqm) => {
        if (!areaSqm) return '0 sqm';
        const hectares = areaSqm / 10000;
        if (hectares >= 1) {
            return `${hectares.toFixed(2)}ha`;
        }
        return `${areaSqm.toLocaleString()} sqm`;
    };

    const getBrokerageName = () => {
        if (agent?.brokerageName) {
            return agent.brokerageName;
        }
        return 'Real Estate';
    };

    const getSerializableAgentData = (agentObj) => {
        if (!agentObj) return null;

        return {
            id: agentObj.id,
            baseMemberId: agentObj.baseMemberId,
            firstName: agentObj.firstName,
            middleName: agentObj.middleName,
            lastName: agentObj.lastName,
            email: agentObj.email,
            phoneNumber: agentObj.phoneNumber,
            profilePictureUrl: agentObj.profilePictureUrl,
            brokerageName: agentObj.brokerageName,
            licenseNumber: agentObj.licenseNumber,
        };
    };

    // FIXED: Enhanced agent avatar URL processing
    const processAgentAvatarUrl = (url) => {
        if (!url) return null;

        // If it's already a full URL, return as is
        if (url.startsWith('http') || url.startsWith('//') || url.startsWith('blob:') || url.startsWith('data:')) {
            return url;
        }

        // If it's a server path, construct full URL
        if (url.startsWith('/uploads/') || url.includes('.')) {
            const baseUrl = window.location.hostname === 'localhost'
                ? 'https://localhost:7080'
                : 'https://betheland.runasp.net';
            return url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/uploads/agents/${url}`;
        }

        return null;
    };

    // Wishlist handler
    const handleToggleFavorite = async (e, propertyId, isCurrentlyFavorite) => {
        e.stopPropagation();
        e.preventDefault();

        if (!isValidProperty) return;
        if (!isAuthenticated) {
            const returnUrl = window.location.pathname + window.location.search;
            navigate(`/login?returnUrl=${encodeURIComponent(returnUrl)}&action=add to wishlist`);
            return;
        }

        try {
            setIsToggling(true);
            setIsFavorite(!isCurrentlyFavorite);
            await toggleWishlist(propertyId, !isCurrentlyFavorite);
            await refreshWishlist();
            message.success(!isCurrentlyFavorite ? 'Added to wishlist' : 'Removed from wishlist');
        } catch (error) {
            setIsFavorite(isCurrentlyFavorite);
        } finally {
            setIsToggling(false);
        }
    };

    const handleViewDetails = (e) => {
        e.stopPropagation();
        if (!isValidProperty) return;

        navigate('/properties/view', {
            state: {
                propertyId: property.id,
                agentData: getSerializableAgentData(agent)
            }
        });
    };

    const handleCardClick = () => {
        if (!isValidProperty) return;

        navigate('/properties/view', {
            state: {
                propertyId: property.id,
                agentData: getSerializableAgentData(agent)
            }
        });
    };

    // FIXED: Enhanced agent data handling
    const fetchAgent = useCallback(async () => {
        if (!property?.agentId) {
            setAgent(null);
            return;
        }

        try {
            setLoadingAgent(true);

            // If agent data is already provided and valid, use it
            if (property.agent && property.agent.id && property.agent.firstName) {
                console.log('✅ Using provided agent data');
                setAgent(property.agent);
                return;
            }

            console.log(`🔍 Fetching agent data for ID: ${property.agentId}`);
            const agentData = await agentService.getAgentWithFallback(property.agentId);

            if (agentData && agentData.id) {
                console.log('✅ Agent data fetched successfully');
                setAgent(agentData);
            } else {
                console.log('⚠️ Using fallback agent data');
                setAgent(agentService.getFallbackAgent(property.agentId));
            }
        } catch (error) {
            console.error('❌ Error fetching agent:', error);
            setAgent(agentService.getFallbackAgent(property.agentId));
        } finally {
            setLoadingAgent(false);
        }
    }, [property?.agentId, property?.agent]);

    // Wishlist status
    useEffect(() => {
        const checkWishlistStatus = async () => {
            if (!property?.id) return;

            try {
                const localCheck = wishlistPropertyIds?.includes(property.id);
                setIsFavorite(localCheck);

                if (isAuthenticated) {
                    try {
                        const serverCheck = await isPropertyInWishlist(property.id);
                        if (serverCheck !== localCheck) {
                            setIsFavorite(serverCheck);
                        }
                    } catch (serverError) {
                        const localCheck = wishlistPropertyIds?.includes(property.id);
                        setIsFavorite(localCheck);
                    }
                }
            } catch (error) {
                const localCheck = wishlistPropertyIds?.includes(property.id);
                setIsFavorite(localCheck);
            }
        };

        if (isValidProperty) {
            checkWishlistStatus();
        }
    }, [property?.id, isPropertyInWishlist, isAuthenticated, wishlistPropertyIds, isValidProperty]);

    // Agent handling
    useEffect(() => {
        if (!isValidProperty) return;

        if (property.agent && property.agent.id === property.agentId && property.agent.baseMemberId) {
            setAgent(property.agent);
        } else if (property.agentId && !agent?.baseMemberId) {
            fetchAgent();
        } else if (!property.agentId) {
            setAgent(null);
        }
    }, [property, agent, fetchAgent, isValidProperty]);

    // Layout configuration based on view mode
    const getCardLayout = () => {
        switch (viewMode) {
            case 'landscape':
                return {
                    cardStyle: {
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'row',
                        height: landscapeHeight,
                        overflow: 'hidden'
                    },
                    imageStyle: {
                        width: '45%',
                        height: '100%',
                        minWidth: '300px'
                    },
                    contentStyle: {
                        width: '55%',
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                    },
                    featuresStyle: {
                        display: 'flex',
                        gap: '16px',
                        marginBottom: '16px',
                        padding: '16px 0',
                        borderTop: '1px solid #f0f0f0',
                        borderBottom: '1px solid #f0f0f0',
                        flexWrap: 'wrap'
                    }
                };
            default: // grid
                return {
                    cardStyle: {
                        width: '100%',
                        height: 'auto'
                    },
                    imageStyle: {
                        height: '280px'
                    },
                    contentStyle: {
                        padding: '16px'
                    },
                    featuresStyle: {
                        display: 'flex',
                        gap: '16px',
                        marginBottom: '16px',
                        padding: '12px 0',
                        borderTop: '1px solid #f0f0f0',
                        borderBottom: '1px solid #f0f0f0',
                        flexWrap: 'wrap'
                    }
                };
        }
    };

    const layout = getCardLayout();

    if (!isValidProperty) {
        console.log('🚫 Rendering null for invalid property');
        return null;
    }

    const currentImage = propertyImages[currentImageIndex];
    const agentName = getAgentName(agent);
    const areaSqm = property.areaSqm || 0;
    const completeAddress = formatCompleteAddress();
    const brokerageName = getBrokerageName();
    const propertyTypeDisplay = getPropertyTypeDisplay();

    const agentAvatarUrl = agent?.profilePictureUrl ? processAgentAvatarUrl(agent.profilePictureUrl) : null;

    console.log('🎨 Rendering PropertyCard for:', property.title);
    console.log('🖼️ Current image to display:', currentImage);
    console.log('🔧 Amenities to display:', displayAmenities);

    return (
        <>
            <Card
                hoverable
                style={{
                    ...layout.cardStyle,
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    borderRadius: '12px',
                    marginBottom: '0'
                }}
                styles={{
                    body: {
                        padding: '0',
                        height: '100%',
                        display: 'flex',
                        flexDirection: viewMode === 'landscape' ? 'row' : 'column'
                    }
                }}
                onClick={handleCardClick}
            >
                {/* Image Section */}
                <div
                    style={{
                        position: 'relative',
                        ...layout.imageStyle,
                        overflow: 'hidden',
                        backgroundColor: '#f8fafc',
                        flexShrink: 0,
                        cursor: 'pointer'
                    }}
                    className="image-section"
                    onClick={openGallery}
                >
                    <img
                        alt={property.title}
                        src={imageError ? '/default-property.jpg' : currentImage}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            cursor: 'pointer',
                            display: 'block',
                            transition: 'transform 0.3s ease',
                            userSelect: 'none'
                        }}
                        onError={(e) => {
                            console.log('❌ Image failed to load:', currentImage, e);
                            if (!imageError) {
                                setImageError(true);
                                e.target.src = '/default-property.jpg';
                            }
                        }}
                        onLoad={(e) => {
                            console.log('✅ Image loaded successfully:', currentImage);
                            setImageError(false);
                        }}
                        onLoadStart={(e) => {
                            console.log('🔄 Image loading started:', currentImage);
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'scale(1)';
                        }}
                        draggable="false"
                    />

                    {/* Property Type Badge */}
                    <div style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        zIndex: 5
                    }}>
                        <Tag
                            color={getPropertyTypeColor(property.propertyType || property.type)}
                            style={{
                                borderRadius: '6px',
                                fontWeight: '500',
                                fontSize: '12px'
                            }}
                        >
                            {propertyTypeDisplay}
                        </Tag>
                    </div>

                    {/* Image Navigation Dots */}
                    {hasMultipleImages && (
                        <div style={{
                            position: 'absolute',
                            bottom: '12px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            display: 'flex',
                            gap: '6px',
                            zIndex: 5
                        }}>
                            {propertyImages.map((_, index) => (
                                <div
                                    key={index}
                                    style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        backgroundColor: index === currentImageIndex ? '#ffffff' : 'rgba(255,255,255,0.5)',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentImageIndex(index);
                                    }}
                                />
                            ))}
                        </div>
                    )}

                    {/* Image Navigation Arrows */}
                    {hasMultipleImages && (
                        <>
                            <div
                                className="image-nav-arrow"
                                style={{
                                    position: 'absolute',
                                    left: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'rgba(255, 255, 255, 0.9)',
                                    borderRadius: '50%',
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    border: '1px solid #e2e8f0',
                                    zIndex: 5,
                                    opacity: 0,
                                    transition: 'opacity 0.3s ease'
                                }}
                                onClick={prevImage}
                                onMouseEnter={(e) => {
                                    e.target.style.opacity = '1';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.opacity = '0';
                                }}
                            >
                                <FaChevronLeft size={14} color="#1B3C53" />
                            </div>

                            <div
                                className="image-nav-arrow"
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'rgba(255, 255, 255, 0.9)',
                                    borderRadius: '50%',
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    border: '1px solid #e2e8f0',
                                    zIndex: 5,
                                    opacity: 0,
                                    transition: 'opacity 0.3s ease'
                                }}
                                onClick={nextImage}
                                onMouseEnter={(e) => {
                                    e.target.style.opacity = '1';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.opacity = '0';
                                }}
                            >
                                <FaChevronRight size={14} color="#1B3C53" />
                            </div>
                        </>
                    )}

                    {/* Wishlist Heart */}
                    <div
                        style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            cursor: 'pointer',
                            background: 'rgba(255, 255, 255, 0.9)',
                            borderRadius: '50%',
                            width: '36px',
                            height: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backdropFilter: 'blur(4px)',
                            border: '1px solid #e2e8f0',
                            zIndex: 10,
                            transition: 'all 0.2s ease'
                        }}
                        onClick={(e) => handleToggleFavorite(e, property.id, isFavorite)}
                        title={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                        {isToggling ? (
                            <div style={{
                                width: '16px',
                                height: '16px',
                                border: '2px solid #f0f0f0',
                                borderTop: '2px solid #ff4d4f',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                            }} />
                        ) : isFavorite ? (
                            <FaHeart style={{ color: '#ff4d4f', fontSize: '18px' }} />
                        ) : (
                            <FaRegHeart style={{ color: '#64748b', fontSize: '18px' }} />
                        )}
                    </div>
                </div>

                {/* Content Section */}
                <div style={{
                    ...layout.contentStyle,
                    flex: 1
                }}>
                    {/* Agent Info for All Modes */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '16px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {loadingAgent ? (
                                <Skeleton.Avatar active size={36} />
                            ) : (
                                <Avatar
                                    size={36}
                                    src={agentAvatarUrl}
                                    style={{
                                        backgroundColor: agentAvatarUrl ? 'transparent' : '#1B3C53',
                                        border: '2px solid #1B3C53'
                                    }}
                                >
                                    {!agentAvatarUrl && agentName?.charAt(0)?.toUpperCase()}
                                </Avatar>
                            )}
                            <div>
                                {loadingAgent ? (
                                    <Skeleton.Input active size="small" style={{ width: 120, height: 16 }} />
                                ) : (
                                    <Text strong style={{
                                        fontSize: viewMode === 'landscape' ? '15px' : '14px',
                                        color: '#1B3C53',
                                        display: 'block'
                                    }}>
                                        {agentName}
                                    </Text>
                                )}
                                <Text style={{
                                    fontSize: viewMode === 'landscape' ? '12px' : '11px',
                                    color: '#64748b'
                                }}>
                                    Real Estate Agent
                                </Text>
                            </div>
                        </div>

                        {/* Brokerage Name */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontFamily: 'Arial, sans-serif'
                        }}>
                            <div style={{
                                width: '24px',
                                height: '24px',
                                backgroundColor: '#1B3C53',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '12px',
                                fontWeight: 'bold'
                            }}>
                                {brokerageName.charAt(0).toUpperCase()}
                            </div>
                            <Text strong style={{
                                fontSize: viewMode === 'landscape' ? '14px' : '12px',
                                color: '#1B3C53',
                                letterSpacing: '0.5px'
                            }}>
                                {brokerageName}
                            </Text>
                        </div>
                    </div>

                    {/* Title and Price */}
                    <div style={{ marginBottom: '12px' }}>
                        <Title
                            level={viewMode === 'landscape' ? 4 : 5}
                            style={{
                                margin: 0,
                                color: '#1B3C53',
                                fontSize: viewMode === 'landscape' ? '18px' : '16px',
                                lineHeight: '1.3'
                            }}
                        >
                            {property.title || 'Untitled Property'}
                        </Title>
                        <Text strong style={{
                            fontSize: viewMode === 'landscape' ? '20px' : '18px',
                            color: '#1B3C53',
                            display: 'block',
                            marginTop: '6px'
                        }}>
                            {formatPrice(property.price)}
                        </Text>
                    </div>

                    {/* Address */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <FaMapMarkerAlt style={{
                            marginRight: '8px',
                            color: '#64748b',
                            fontSize: '14px',
                            marginTop: '2px',
                            flexShrink: 0
                        }} />
                        <Text style={{
                            fontSize: viewMode === 'landscape' ? '14px' : '12px',
                            color: '#64748b',
                            lineHeight: '1.4'
                        }}>
                            {completeAddress}
                        </Text>
                    </div>

                    {/* Property Features */}
                    <div style={layout.featuresStyle}>
                        <Tooltip title="Bedrooms">
                            <Space size={6} style={{ alignItems: 'center' }}>
                                <FaBed style={{ color: '#666', fontSize: '14px' }} />
                                <Text style={{
                                    fontSize: viewMode === 'landscape' ? '14px' : '11px',
                                    fontWeight: '500'
                                }}>
                                    {property.bedrooms || 0}
                                </Text>
                            </Space>
                        </Tooltip>

                        <Tooltip title="Bathrooms">
                            <Space size={6} style={{ alignItems: 'center' }}>
                                <FaBath style={{ color: '#666', fontSize: '14px' }} />
                                <Text style={{
                                    fontSize: viewMode === 'landscape' ? '14px' : '11px',
                                    fontWeight: '500'
                                }}>
                                    {property.bathrooms || 0}
                                </Text>
                            </Space>
                        </Tooltip>

                        <Tooltip title="Kitchen">
                            <Space size={6} style={{ alignItems: 'center' }}>
                                <FaUtensils style={{ color: '#666', fontSize: '14px' }} />
                                <Text style={{
                                    fontSize: viewMode === 'landscape' ? '14px' : '11px',
                                    fontWeight: '500'
                                }}>
                                    {property.kitchen || 0}
                                </Text>
                            </Space>
                        </Tooltip>

                        <Tooltip title="Garage">
                            <Space size={6} style={{ alignItems: 'center' }}>
                                <FaCar style={{ color: '#666', fontSize: '14px' }} />
                                <Text style={{
                                    fontSize: viewMode === 'landscape' ? '14px' : '11px',
                                    fontWeight: '500'
                                }}>
                                    {property.garage || 0}
                                </Text>
                            </Space>
                        </Tooltip>

                        <Tooltip title="Area">
                            <Space size={6} style={{ alignItems: 'center' }}>
                                <FaHome style={{ color: '#666', fontSize: '14px' }} />
                                <Text style={{
                                    fontSize: viewMode === 'landscape' ? '14px' : '11px',
                                    fontWeight: '500'
                                }}>
                                    {formatArea(areaSqm)}
                                </Text>
                            </Space>
                        </Tooltip>
                    </div>

                    {/* FIXED: Amenities Section - Show all amenities in landscape mode, limited in grid */}
                    {displayAmenities.length > 0 && (
                        <div style={{
                            marginBottom: '16px',
                            padding: viewMode === 'landscape' ? '16px 0' : '12px 0'
                        }}>
                            <Text strong style={{
                                fontSize: viewMode === 'landscape' ? '14px' : '12px',
                                color: '#1B3C53',
                                display: 'block',
                                marginBottom: '8px'
                            }}>
                                Amenities
                            </Text>
                            <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '8px'
                            }}>
                                {/* Show all amenities in landscape mode, only 3 in grid mode */}
                                {(viewMode === 'landscape' ? displayAmenities : displayAmenities.slice(0, 3)).map((amenity, index) => (
                                    <Tag
                                        key={index}
                                        style={{
                                            fontSize: viewMode === 'landscape' ? '12px' : '10px',
                                            padding: viewMode === 'landscape' ? '6px 12px' : '4px 10px',
                                            borderRadius: '12px',
                                            backgroundColor: '#f1f5f9',
                                            color: '#475569',
                                            border: '1px solid #e2e8f0',
                                            margin: 0
                                        }}
                                    >
                                        {amenity}
                                    </Tag>
                                ))}
                                {/* Show "+X more" only in grid mode when there are more than 3 amenities */}
                                {viewMode === 'grid' && hasMoreAmenities && (
                                    <Tag
                                        style={{
                                            fontSize: '10px',
                                            padding: '4px 10px',
                                            borderRadius: '12px',
                                            backgroundColor: '#1B3C53',
                                            color: 'white',
                                            border: 'none',
                                            margin: 0
                                        }}
                                    >
                                        +{displayAmenities.length - 3} more
                                    </Tag>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            {/* Image Gallery Modal */}
            <Modal
                open={isGalleryOpen}
                onCancel={closeGallery}
                footer={null}
                width="90vw"
                style={{
                    maxWidth: '1200px',
                    top: '20px'
                }}
                styles={{
                    body: {
                        padding: '0',
                        height: '80vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#000'
                    }
                }}
                closeIcon={
                    <div style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        zIndex: 1001,
                        background: 'rgba(0,0,0,0.7)',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        cursor: 'pointer'
                    }}>
                        <FaTimes size={20} />
                    </div>
                }
            >
                <div style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <img
                        src={propertyImages[galleryImageIndex]}
                        alt={`Property ${galleryImageIndex + 1}`}
                        style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain'
                        }}
                        onError={(e) => {
                            e.target.src = '/default-property.jpg';
                        }}
                    />

                    {propertyImages.length > 1 && (
                        <>
                            <div
                                style={{
                                    position: 'absolute',
                                    left: '20px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'rgba(255,255,255,0.9)',
                                    borderRadius: '50%',
                                    width: '50px',
                                    height: '50px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    border: '1px solid #e2e8f0'
                                }}
                                onClick={prevGalleryImage}
                            >
                                <FaChevronLeft size={20} color="#1B3C53" />
                            </div>

                            <div
                                style={{
                                    position: 'absolute',
                                    right: '20px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'rgba(255,255,255,0.9)',
                                    borderRadius: '50%',
                                    width: '50px',
                                    height: '50px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    border: '1px solid #e2e8f0'
                                }}
                                onClick={nextGalleryImage}
                            >
                                <FaChevronRight size={20} color="#1B3C53" />
                            </div>

                            <div style={{
                                position: 'absolute',
                                bottom: '20px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                display: 'flex',
                                gap: '8px'
                            }}>
                                {propertyImages.map((_, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            width: '12px',
                                            height: '12px',
                                            borderRadius: '50%',
                                            backgroundColor: index === galleryImageIndex ? '#ffffff' : 'rgba(255,255,255,0.5)',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => setGalleryImageIndex(index)}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </Modal>

            <style jsx>{`
                .image-section:hover .image-nav-arrow {
                    opacity: 1 !important;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </>
    );
};

export default PropertyCard;