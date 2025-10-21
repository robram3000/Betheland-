import React, { useState, useEffect, useCallback } from 'react';
import { Card, Typography, Space, Button, message, Avatar, Skeleton, Row, Col, Tooltip, Modal, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useWishlistData } from './Services/WishlistAdded';
import { useUser } from '../Authpage/Services/UserContextService';
import agentService from '../Employeesportal/AdminPortal/Creation_Agent/Services/AgentService';

// React Icons
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
    viewMode = 'grid'
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

    // Swipe functionality state
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    // Validate property data
    const isValidProperty = property && property.id && property.title;

    // Get all property images
    const getPropertyImages = () => {
        const images = [];

        // Add main image if available
        if (property.mainImage) {
            images.push(property.mainImage);
        }

        // Add property images array if available
        if (property.propertyImages && Array.isArray(property.propertyImages)) {
            property.propertyImages.forEach(img => {
                if (img.imageUrl) images.push(img.imageUrl);
            });
        }

        // Add imageUrls array if available
        if (property.imageUrls && Array.isArray(property.imageUrls)) {
            property.imageUrls.forEach(url => {
                if (url) images.push(url);
            });
        }

        // Remove duplicates and return
        const uniqueImages = [...new Set(images.filter(img => img && img.trim() !== ''))];
        return uniqueImages.length > 0 ? uniqueImages : ['/default-property.jpg'];
    };

    const propertyImages = getPropertyImages();
    const hasMultipleImages = propertyImages.length > 1;

    // Get amenities for display - MAX 3 AMENITIES
    const getDisplayAmenities = () => {
        if (!property.amenities || !Array.isArray(property.amenities)) return [];

        // Return only first 3 amenities for display
        return property.amenities.slice(0, 3);
    };

    const displayAmenities = getDisplayAmenities();
    const hasMoreAmenities = property.amenities && property.amenities.length > 3;

    // Touch swipe handlers
    const handleTouchStart = (e) => {
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe && hasMultipleImages) {
            nextImage();
        } else if (isRightSwipe && hasMultipleImages) {
            prevImage();
        }

        setTouchStart(null);
        setTouchEnd(null);
    };

    // Mouse drag handlers for desktop
    const [mouseStart, setMouseStart] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setMouseStart(e.clientX);
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        setTouchEnd(e.clientX);
    };

    const handleMouseUp = () => {
        if (!mouseStart || !touchEnd) {
            setIsDragging(false);
            return;
        }

        const distance = mouseStart - touchEnd;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe && hasMultipleImages) {
            nextImage();
        } else if (isRightSwipe && hasMultipleImages) {
            prevImage();
        }

        setIsDragging(false);
        setMouseStart(null);
        setTouchEnd(null);
    };

    // Navigation functions for image slider
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

    // Gallery navigation functions
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

    // Open gallery modal
    const openGallery = (e) => {
        e.stopPropagation();
        setGalleryImageIndex(currentImageIndex);
        setIsGalleryOpen(true);
    };

    // Close gallery modal
    const closeGallery = () => {
        setIsGalleryOpen(false);
    };

    // Reset image index when property changes
    useEffect(() => {
        setCurrentImageIndex(0);
    }, [property?.id]);

    // Keyboard navigation for gallery
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isGalleryOpen) return;

            if (e.key === 'ArrowRight') {
                nextGalleryImage();
            } else if (e.key === 'ArrowLeft') {
                prevGalleryImage();
            } else if (e.key === 'Escape') {
                closeGallery();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isGalleryOpen]);

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

    // Get property type color
    const getPropertyTypeColor = (type) => {
        const typeColors = {
            residential: 'blue',
            commercial: 'green',
            industrial: 'orange',
            land: 'brown',
            rental: 'purple',
            sale: 'red',
            apartment: 'geekblue',
            house: 'cyan',
            default: 'gray'
        };
        return typeColors[type?.toLowerCase()] || typeColors.default;
    };

    // Get property type display name - FIXED: Use propertyType if available
    const getPropertyTypeDisplay = () => {
        // Prefer propertyType over type
        const type = property.propertyType || property.type;

        const typeNames = {
            residential: 'Residential',
            commercial: 'Commercial',
            industrial: 'Industrial',
            land: 'Land',
            rental: 'For Rent',
            sale: 'For Sale',
            apartment: 'Apartment',
            house: 'House',
            default: 'Property'
        };
        return typeNames[type?.toLowerCase()] || typeNames.default;
    };

    // Format complete address
    const formatCompleteAddress = () => {
        const addressParts = [
            property.address,
            property.city,
            property.state,
            property.zipCode
        ].filter(part => part && part.trim() !== '');

        return addressParts.join(', ') || 'Address not specified';
    };

    // Image processing
    const processImageUrl = (url) => {
        if (!url || typeof url !== 'string' || url.trim() === '') {
            return '/default-property.jpg';
        }
        if (url.startsWith('http') || url.startsWith('//') || url.startsWith('blob:') || url.startsWith('data:')) {
            return url;
        }
        if (url.startsWith('/uploads/')) {
            return `https://localhost:7075${url}`;
        }
        if (url.includes('.') && !url.startsWith('/')) {
            return `https://localhost:7075/uploads/properties/${url}`;
        }
        return '/default-property.jpg';
    };

    // Process agent image URL
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
        return '/default-avatar.jpg';
    };

    // Price formatting - Philippine Pesos
    const formatPrice = (price) => {
        if (!price && price !== 0) return 'Price on request';
        const priceNum = typeof price === 'string' ? parseFloat(price.replace(/[^0-9.-]+/g, "")) : price;
        return `₱${priceNum.toLocaleString()}`;
    };

    // Area formatting
    const formatArea = (areaSqm) => {
        if (!areaSqm) return '0 sqm';
        const hectares = areaSqm / 10000;
        if (hectares >= 1) {
            return `${hectares.toFixed(2)}ha • Lifestyle`;
        }
        return `${areaSqm.toLocaleString()} sqm`;
    };

    // Get brokerage name
    const getBrokerageName = () => {
        if (agent?.brokerageName) {
            return agent.brokerageName;
        }
        return 'Real Estate';
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
            console.error('Error updating wishlist:', error);
            message.error('Failed to update wishlist');
            setIsFavorite(isCurrentlyFavorite);
        } finally {
            setIsToggling(false);
        }
    };

    // Action handlers
    const handleScheduleTour = (e) => {
        e.stopPropagation();
        if (!isValidProperty) {
            message.warning('Invalid property data');
            return;
        }
        if (!isAuthenticated) {
            const returnUrl = window.location.pathname + window.location.search;
            navigate(`/login?returnUrl=${encodeURIComponent(returnUrl)}&action=schedule a tour`);
            return;
        }
        if (onScheduleTour) {
            onScheduleTour({
                ...property,
                agent: agent
            });
        }
    };

    const handleChat = (e) => {
        e.stopPropagation();
        if (!isValidProperty) {
            message.warning('Invalid property data');
            return;
        }
        if (!isAuthenticated) {
            const returnUrl = window.location.pathname + window.location.search;
            navigate(`/login?returnUrl=${encodeURIComponent(returnUrl)}&action=chat with agent`);
            return;
        }
        if (onChat) {
            onChat(property);
        }
    };

    const handleViewDetails = (e) => {
        e.stopPropagation();
        if (isValidProperty) {
            console.log('DEBUG - View details clicked, navigating with property ID:', property.id);

            navigate('/properties/view', {
                state: {
                    propertyId: property.id
                }
            });
        }
    };

    const handleCardClick = () => {
        if (isValidProperty) {
            console.log('DEBUG - Card clicked, navigating with property ID:', property.id);

            navigate('/properties/view', {
                state: {
                    propertyId: property.id
                }
            });
        }
    };

    // Fetch agent data
    const fetchAgent = useCallback(async () => {
        if (!property?.agentId) {
            console.log('No agentId found for property:', property?.id);
            setAgent(null);
            return;
        }

        try {
            setLoadingAgent(true);
            console.log('Fetching agent for property:', property.id, 'agentId:', property.agentId);

            // First, check if we already have valid agent data in the property
            if (property.agent && property.agent.id && property.agent.firstName) {
                console.log('Using agent data from property object:', property.agent);
                setAgent(property.agent);
                return;
            }

            // Try to fetch agent data
            const agentData = await agentService.getAgentWithFallback(property.agentId);

            if (agentData && agentData.id) {
                console.log('Agent data fetched successfully:', agentData);
                setAgent(agentData);
            } else {
                console.warn('No agent data found, setting to fallback');
                setAgent(agentService.getFallbackAgent(property.agentId));
            }
        } catch (error) {
            console.error('Error fetching agent:', error);
            // Set fallback agent
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
                        console.warn('Server wishlist check failed:', serverError);
                    }
                }
            } catch (error) {
                console.error('Error checking wishlist status:', error);
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

        console.log('PropertyCard - Agent handling effect:', {
            propertyId: property.id,
            agentId: property.agentId,
            hasAgentData: !!property.agent,
            currentAgent: agent
        });

        if (property.agent && property.agent.id === property.agentId) {
            console.log('Using agent data from property');
            setAgent(property.agent);
        } else if (property.agentId && !agent) {
            console.log('Fetching agent data');
            fetchAgent();
        } else if (!property.agentId) {
            console.log('No agent ID, setting agent to null');
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
                        height: '100%',
                        overflow: 'hidden'
                    },
                    imageStyle: {
                        width: '40%',
                        height: '100%',
                        minWidth: '250px'
                    },
                    contentStyle: {
                        width: '60%',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                    },
                    featuresStyle: {
                        display: 'flex',
                        gap: '12px',
                        marginBottom: '12px',
                        padding: '12px 0',
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
        return null;
    }

    const currentImage = propertyImages[currentImageIndex];
    const processedImage = processImageUrl(currentImage);
    const agentName = getAgentName(agent);
    const areaSqm = property.areaSqm || 0;
    const completeAddress = formatCompleteAddress();
    const brokerageName = getBrokerageName();
    const propertyTypeDisplay = getPropertyTypeDisplay();

    return (
        <>
            <Card
                hoverable
                style={{
                    ...layout.cardStyle,
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    borderRadius: '12px', // Rounded corners
                    marginBottom: '0'
                }}
                bodyStyle={{ padding: '0' }}
                onClick={handleCardClick}
            >
                {/* Top Section with Agent Photo and Branding - Only for Grid View */}
                {viewMode === 'grid' && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        backgroundColor: '#f8fafc',
                        borderBottom: '1px solid #e2e8f0'
                    }}>
                        {/* Left side - Agent info */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {loadingAgent ? (
                                <Skeleton.Avatar active size={40} />
                            ) : (
                                <Avatar
                                    size={40}
                                    src={agent?.profilePictureUrl ? processAgentImageUrl(agent.profilePictureUrl) : null}
                                    style={{
                                        backgroundColor: agent?.profilePictureUrl ? 'transparent' : '#1B3C53',
                                        border: '2px solid #1B3C53'
                                    }}
                                >
                                    {!agent?.profilePictureUrl && agentName?.charAt(0)?.toUpperCase()}
                                </Avatar>
                            )}
                            <div>
                                {loadingAgent ? (
                                    <Skeleton.Input active size="small" style={{ width: 120, height: 16 }} />
                                ) : (
                                    <Text strong style={{ fontSize: '14px', color: '#1B3C53', display: 'block' }}>
                                        {agentName}
                                    </Text>
                                )}
                                <Text style={{ fontSize: '12px', color: '#64748b' }}>
                                    Real Estate Agent
                                </Text>
                            </div>
                        </div>

                        {/* Right side - Brokerage Name */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
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
                                fontSize: '16px',
                                color: '#1B3C53',
                                letterSpacing: '0.5px'
                            }}>
                                {brokerageName}
                            </Text>
                        </div>
                    </div>
                )}

                {/* Main Content Container */}
                <div style={viewMode === 'landscape' ? {
                    display: 'flex',
                    width: '100%',
                    height: '100%'
                } : {}}>

                    {/* Image Section with Swipe Support */}
                    <div
                        style={{
                            position: 'relative',
                            ...layout.imageStyle,
                            overflow: 'hidden',
                            backgroundColor: '#f8fafc',
                            flexShrink: 0,
                            cursor: isDragging ? 'grabbing' : 'grab'
                        }}
                        className="image-section"
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    >
                        <img
                            alt={property.title}
                            src={imageError ? '/default-property.jpg' : processedImage}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                cursor: 'pointer',
                                display: 'block',
                                transition: isDragging ? 'none' : 'transform 0.3s ease',
                                userSelect: 'none'
                            }}
                            onClick={openGallery}
                            onError={(e) => {
                                if (!imageError) {
                                    setImageError(true);
                                    e.target.src = '/default-property.jpg';
                                }
                            }}
                            onMouseEnter={(e) => {
                                if (!isDragging) {
                                    e.target.style.transform = 'scale(1.05)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'scale(1)';
                            }}
                            draggable="false"
                        />

                        {/* Property Type Badge - FIXED: Now properly displays property type */}
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

                        {/* Image Navigation Dots - Mobile Friendly */}
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

                        {/* Image Navigation Arrows - Hidden on mobile, show on hover */}
                        {hasMultipleImages && (
                            <>
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '8px',
                                        transform: 'translateY(-50%)',
                                        cursor: 'pointer',
                                        background: 'rgba(255, 255, 255, 0.9)',
                                        borderRadius: '50%',
                                        width: '32px',
                                        height: '32px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backdropFilter: 'blur(4px)',
                                        border: '1px solid #e2e8f0',
                                        zIndex: 10,
                                        transition: 'all 0.2s ease',
                                        opacity: 0
                                    }}
                                    className="image-nav-arrow"
                                    onClick={prevImage}
                                    title="Previous image"
                                >
                                    <FaChevronLeft style={{ color: '#1B3C53', fontSize: '14px' }} />
                                </div>

                                <div
                                    style={{
                                        position: 'absolute',
                                        top: '50%',
                                        right: '8px',
                                        transform: 'translateY(-50%)',
                                        cursor: 'pointer',
                                        background: 'rgba(255, 255, 255, 0.9)',
                                        borderRadius: '50%',
                                        width: '32px',
                                        height: '32px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backdropFilter: 'blur(4px)',
                                        border: '1px solid #e2e8f0',
                                        zIndex: 10,
                                        transition: 'all 0.2s ease',
                                        opacity: 0
                                    }}
                                    className="image-nav-arrow"
                                    onClick={nextImage}
                                    title="Next image"
                                >
                                    <FaChevronRight style={{ color: '#1B3C53', fontSize: '14px' }} />
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
                    <div style={layout.contentStyle}>
                        {/* Agent Info for Landscape Mode */}
                        {viewMode === 'landscape' && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: '12px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    {loadingAgent ? (
                                        <Skeleton.Avatar active size={32} />
                                    ) : (
                                        <Avatar
                                            size={32}
                                            src={agent?.profilePictureUrl ? processAgentImageUrl(agent.profilePictureUrl) : null}
                                            style={{
                                                backgroundColor: agent?.profilePictureUrl ? 'transparent' : '#1B3C53',
                                                border: '2px solid #1B3C53'
                                            }}
                                        >
                                            {!agent?.profilePictureUrl && agentName?.charAt(0)?.toUpperCase()}
                                        </Avatar>
                                    )}
                                    <div>
                                        {loadingAgent ? (
                                            <Skeleton.Input active size="small" style={{ width: 100, height: 14 }} />
                                        ) : (
                                            <Text strong style={{ fontSize: '13px', color: '#1B3C53', display: 'block' }}>
                                                {agentName}
                                            </Text>
                                        )}
                                        <Text style={{ fontSize: '11px', color: '#64748b' }}>
                                            Real Estate Agent
                                        </Text>
                                    </div>
                                </div>

                                {/* Brokerage Name */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontFamily: 'Arial, sans-serif'
                                }}>
                                    <div style={{
                                        width: '20px',
                                        height: '20px',
                                        backgroundColor: '#1B3C53',
                                        borderRadius: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: '10px',
                                        fontWeight: 'bold'
                                    }}>
                                        {brokerageName.charAt(0).toUpperCase()}
                                    </div>
                                    <Text strong style={{
                                        fontSize: '14px',
                                        color: '#1B3C53',
                                        letterSpacing: '0.5px'
                                    }}>
                                        {brokerageName}
                                    </Text>
                                </div>
                            </div>
                        )}

                        {/* Title and Price */}
                        <div style={{ marginBottom: '8px' }}>
                            <Title
                                level={viewMode === 'landscape' ? 4 : 5}
                                style={{
                                    margin: 0,
                                    color: '#1B3C53',
                                    fontSize: viewMode === 'landscape' ? '18px' : '16px',
                                    lineHeight: '1.3'
                                }}
                            >
                                {property.title}
                            </Title>
                            <Text strong style={{
                                fontSize: viewMode === 'landscape' ? '20px' : '18px',
                                color: '#1B3C53',
                                display: 'block',
                                marginTop: '4px'
                            }}>
                                {formatPrice(property.price)}
                            </Text>
                        </div>

                        {/* Address */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '12px' }}>
                            <FaMapMarkerAlt style={{
                                marginRight: '6px',
                                color: '#64748b',
                                fontSize: '12px',
                                marginTop: '2px',
                                flexShrink: 0
                            }} />
                            <Text style={{
                                fontSize: viewMode === 'landscape' ? '13px' : '12px',
                                color: '#64748b',
                                lineHeight: '1.4'
                            }}>
                                {completeAddress}
                            </Text>
                        </div>

                        {/* Property Features */}
                        <div style={layout.featuresStyle}>
                            <Tooltip title="Bedrooms">
                                <Space size={4} style={{ alignItems: 'center' }}>
                                    <FaBed style={{ color: '#666', fontSize: '12px' }} />
                                    <Text style={{
                                        fontSize: viewMode === 'landscape' ? '12px' : '11px',
                                        fontWeight: '500'
                                    }}>
                                        {property.bedrooms || 0}
                                    </Text>
                                </Space>
                            </Tooltip>

                            <Tooltip title="Bathrooms">
                                <Space size={4} style={{ alignItems: 'center' }}>
                                    <FaBath style={{ color: '#666', fontSize: '12px' }} />
                                    <Text style={{
                                        fontSize: viewMode === 'landscape' ? '12px' : '11px',
                                        fontWeight: '500'
                                    }}>
                                        {property.bathrooms || 0}
                                    </Text>
                                </Space>
                            </Tooltip>

                            <Tooltip title="Kitchen">
                                <Space size={4} style={{ alignItems: 'center' }}>
                                    <FaUtensils style={{ color: '#666', fontSize: '12px' }} />
                                    <Text style={{
                                        fontSize: viewMode === 'landscape' ? '12px' : '11px',
                                        fontWeight: '500'
                                    }}>
                                        {property.kitchen || 0}
                                    </Text>
                                </Space>
                            </Tooltip>

                            <Tooltip title="Garage">
                                <Space size={4} style={{ alignItems: 'center' }}>
                                    <FaCar style={{ color: '#666', fontSize: '12px' }} />
                                    <Text style={{
                                        fontSize: viewMode === 'landscape' ? '12px' : '11px',
                                        fontWeight: '500'
                                    }}>
                                        {property.garage || 0}
                                    </Text>
                                </Space>
                            </Tooltip>

                            <Tooltip title="Area">
                                <Space size={4} style={{ alignItems: 'center' }}>
                                    <FaHome style={{ color: '#666', fontSize: '12px' }} />
                                    <Text style={{
                                        fontSize: viewMode === 'landscape' ? '12px' : '11px',
                                        fontWeight: '500'
                                    }}>
                                        {formatArea(areaSqm)}
                                    </Text>
                                </Space>
                            </Tooltip>
                        </div>

                        {/* Amenities Section - MAX 3 AMENITIES */}
                        {displayAmenities.length > 0 && (
                            <div style={{
                                marginBottom: '12px',
                                padding: '8px 0'
                            }}>
                                <Text strong style={{
                                    fontSize: viewMode === 'landscape' ? '13px' : '12px',
                                    color: '#1B3C53',
                                    display: 'block',
                                    marginBottom: '6px'
                                }}>
                        
                                </Text>
                                <div style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '6px'
                                }}>
                                    {/* Show only 3 amenities */}
                                    {displayAmenities.map((amenity, index) => (
                                        <Tag
                                            key={index}
                                            style={{
                                                fontSize: viewMode === 'landscape' ? '11px' : '10px',
                                                padding: '2px 8px',
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
                                    {/* Show "+X more" only if there are more than 3 amenities */}
                                    {hasMoreAmenities && (
                                        <Tag
                                            style={{
                                                fontSize: viewMode === 'landscape' ? '11px' : '10px',
                                                padding: '2px 8px',
                                                borderRadius: '12px',
                                                backgroundColor: '#1B3C53',
                                                color: 'white',
                                                border: 'none',
                                                margin: 0
                                            }}
                                        >
                                            +{property.amenities.length - 3} more
                                        </Tag>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        {showActions && (
                            <div style={{
                                display: 'flex',
                                gap: '8px',
                                marginTop: viewMode === 'landscape' ? 'auto' : '12px'
                            }}>
                                <Button
                                    type="primary"
                                    icon={<FaCalendarAlt />}
                                    onClick={handleScheduleTour}
                                    style={{
                                        flex: 1,
                                        background: 'linear-gradient(135deg, #1B3C53, #2D556E)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: '500'
                                    }}
                                    size={viewMode === 'landscape' ? 'small' : 'middle'}
                                >
                                    Tour
                                </Button>

                                <Button
                                    icon={<FaComments />}
                                    onClick={handleChat}
                                    style={{
                                        flex: 1,
                                        borderRadius: '8px',
                                        fontWeight: '500'
                                    }}
                                    size={viewMode === 'landscape' ? 'small' : 'middle'}
                                >
                                    Chat
                                </Button>

                                <Button
                                    icon={<FaEye />}
                                    onClick={handleViewDetails}
                                    style={{
                                        flex: 1,
                                        borderRadius: '8px',
                                        fontWeight: '500'
                                    }}
                                    size={viewMode === 'landscape' ? 'small' : 'middle'}
                                >
                                    View
                                </Button>
                            </div>
                        )}
                    </div>
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
                bodyStyle={{
                    padding: '0',
                    height: '80vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#000'
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
                        src={processImageUrl(propertyImages[galleryImageIndex])}
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