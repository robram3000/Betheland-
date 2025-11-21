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

    // Swipe functionality state
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    // Simplified Image URL processing function
    const processImageUrl = (url) => {
        if (!url) return '/default-property.jpg';

        console.log('🖼️ Processing image URL:', url);

        // If it's already a relative path starting with /uploads
        if (url.startsWith('/uploads/')) {
            // In development, use the Vite proxy
            if (process.env.NODE_ENV === 'development') {
                return `/api${url}`; // This becomes "/api/uploads/properties/..."
            } else {
                // In production, use absolute URL
                return `https://betheland.com${url}`;
            }
        }

        // If it's already an absolute URL, return as is
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }

        // Return default image for invalid URLs
        return '/default-property.jpg';
    };

    // Simplified agent avatar URL processing
    const processAgentAvatarUrl = (url) => {
        if (!url) return null;

        // If it's already a relative path starting with /uploads
        if (url.startsWith('/uploads/')) {
            if (process.env.NODE_ENV === 'development') {
                return `/api${url}`;
            } else {
                return `https://betheland.com${url}`;
            }
        }

        // If it's already an absolute URL, return as is
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }

        return null;
    };

    // Enhanced property validation that handles incomplete data
    const isValidProperty = useMemo(() => {
        if (!property) {
            console.log('❌ Invalid property: property is null/undefined');
            return false;
        }

        // Check for minimal required properties
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

    // Simplified image processing
    const getPropertyImages = () => {
        const images = [];

        if (!property) return ['/default-property.jpg'];

        console.log('🖼️ Processing images for property:', property.id);

        // Collect all property images from various sources
        const imageSources = [];

        // Add main image if available
        if (property.mainImage) {
            imageSources.push(property.mainImage);
        }

        // Add property images array if available
        if (property.propertyImages && Array.isArray(property.propertyImages)) {
            property.propertyImages.forEach((img) => {
                if (img.imageUrl) {
                    imageSources.push(img.imageUrl);
                }
            });
        }

        // Add imageUrls array if available
        if (property.imageUrls && Array.isArray(property.imageUrls)) {
            property.imageUrls.forEach((url) => {
                if (url) {
                    imageSources.push(url);
                }
            });
        }

        // Add other possible image fields
        if (property.image) imageSources.push(property.image);
        if (property.thumbnail) imageSources.push(property.thumbnail);
        if (property.coverImage) imageSources.push(property.coverImage);

        // Process all collected image sources
        imageSources.forEach((imgSource) => {
            const processedImg = processImageUrl(imgSource);
            if (processedImg && !images.includes(processedImg)) {
                images.push(processedImg);
                console.log('✅ Added property image:', imgSource);
            }
        });

        // Remove duplicates and ensure we have at least default image
        const uniqueImages = [...new Set(images.filter(img => img && img.trim() !== ''))];

        if (uniqueImages.length === 0) {
            console.log('🖼️ No property images found, using default');
            return ['/default-property.jpg'];
        }

        console.log('🖼️ Final property images:', uniqueImages);
        return uniqueImages;
    };

    // Debug effect to see what data is coming through
    useEffect(() => {
        if (property) {
            console.log('🔍 PropertyCard received property data:', {
                id: property.id,
                title: property.title,
                price: property.price,
                hasMainImage: !!property.mainImage,
                hasPropertyImages: Array.isArray(property.propertyImages) && property.propertyImages.length,
                hasImageUrls: Array.isArray(property.imageUrls) && property.imageUrls.length,
                hasAgent: !!property.agent,
                agentId: property.agentId,
            });
        }
    }, [property]);

    const propertyImages = getPropertyImages();
    const hasMultipleImages = propertyImages.length > 1;

    // Get amenities for display - MAX 3 AMENITIES (Only for grid view)
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
                    }
                } catch (e) {
                    amenitiesArray = property.amenities.split(',').map(item => item.trim()).filter(item => item);
                }
            }
        } catch (error) {
            console.error('Error parsing amenities:', error);
            amenitiesArray = [];
        }

        return amenitiesArray.slice(0, 3);
    };

    const displayAmenities = getDisplayAmenities();
    const hasMoreAmenities = property.amenities && getDisplayAmenities().length > 3;

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
        setImageError(false);
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
        if (!type) return 'gray';

        const lowerType = type.toLowerCase();

        const typeColors = {
            // Residential - blue shades
            'house': 'blue',
            'apartment': 'geekblue',
            'condo': 'cyan',
            'townhouse': 'blue',
            'duplex': 'blue',
            'triplex': 'blue',
            'fourplex': 'blue',
            'mobile home': 'blue',
            'manufactured home': 'blue',
            'single family home': 'blue',
            'multi family home': 'blue',
            'studio': 'blue',
            'loft': 'blue',
            'villa': 'blue',
            'bungalow': 'blue',
            'cabin': 'blue',
            'cottage': 'blue',
            'farmhouse': 'blue',
            'ranch': 'blue',
            'mansion': 'blue',
            'estate': 'blue',
            'penthouse': 'blue',
            'residential': 'blue',

            // Commercial - green shades
            'retail space': 'green',
            'office space': 'green',
            'warehouse': 'green',
            'industrial': 'green',
            'storage unit': 'green',
            'parking space': 'green',
            'hotel': 'green',
            'motel': 'green',
            'restaurant': 'green',
            'bar': 'green',
            'showroom': 'green',
            'medical office': 'green',
            'mixed use': 'green',
            'commercial': 'green',

            // Land - orange/brown shades
            'land': 'orange',
            'agricultural': 'orange',
            'residential lot': 'orange',
            'commercial lot': 'orange',
            'farmland': 'orange',
            'ranch land': 'orange',
            'timberland': 'orange',
            'recreational land': 'orange',

            // Special purpose - purple shades
            'church': 'purple',
            'school': 'purple',
            'hospital': 'purple',
            'clinic': 'purple',
            'student housing': 'purple',
            'senior living': 'purple',
            'bed and breakfast': 'purple',
            'vacation home': 'purple',
            'timeshare': 'purple',
            'resort': 'purple',
            'specialpurpose': 'purple',

            // Transaction types
            'rental': 'purple',
            'sale': 'red',

            'default': 'gray'
        };

        // Try exact match first
        if (typeColors[lowerType]) {
            return typeColors[lowerType];
        }

        // Try partial matching
        for (const [key, color] of Object.entries(typeColors)) {
            if (lowerType.includes(key) || key.includes(lowerType)) {
                return color;
            }
        }

        return typeColors.default;
    };

    // Get property type display name
    const getPropertyTypeDisplay = () => {
        const type = property.propertyType || property.type;
        if (!type) return 'Property';

        const lowerType = type.toLowerCase();

        const typeNames = {
            // Residential types
            'house': 'House',
            'apartment': 'Apartment',
            'condo': 'Condo',
            'townhouse': 'Townhouse',
            'duplex': 'Duplex',
            'triplex': 'Triplex',
            'fourplex': 'Fourplex',
            'mobile home': 'Mobile Home',
            'manufactured home': 'Manufactured Home',
            'single family home': 'Single Family Home',
            'multi family home': 'Multi Family Home',
            'studio': 'Studio',
            'loft': 'Loft',
            'villa': 'Villa',
            'bungalow': 'Bungalow',
            'cabin': 'Cabin',
            'cottage': 'Cottage',
            'farmhouse': 'Farmhouse',
            'ranch': 'Ranch',
            'mansion': 'Mansion',
            'estate': 'Estate',
            'penthouse': 'Penthouse',

            // Commercial types
            'retail space': 'Retail Space',
            'office space': 'Office Space',
            'warehouse': 'Warehouse',
            'industrial': 'Industrial',
            'storage unit': 'Storage Unit',
            'parking space': 'Parking Space',
            'hotel': 'Hotel',
            'motel': 'Motel',
            'restaurant': 'Restaurant',
            'bar': 'Bar',
            'showroom': 'Showroom',
            'medical office': 'Medical Office',
            'mixed use': 'Mixed Use',

            // Land types
            'land': 'Land',
            'agricultural': 'Agricultural',
            'residential lot': 'Residential Lot',
            'commercial lot': 'Commercial Lot',
            'farmland': 'Farmland',
            'ranch land': 'Ranch Land',
            'timberland': 'Timberland',
            'recreational land': 'Recreational Land',

            // Special purpose types
            'church': 'Church',
            'school': 'School',
            'hospital': 'Hospital',
            'clinic': 'Clinic',
            'student housing': 'Student Housing',
            'senior living': 'Senior Living',
            'bed and breakfast': 'Bed and Breakfast',
            'vacation home': 'Vacation Home',
            'timeshare': 'Timeshare',
            'resort': 'Resort',

            // General categories (fallbacks)
            'residential': 'Residential',
            'commercial': 'Commercial',
            'land': 'Land',
            'specialpurpose': 'Special Purpose',
            'rental': 'For Rent',
            'sale': 'For Sale'
        };

        // First try exact match
        if (typeNames[lowerType]) {
            return typeNames[lowerType];
        }

        // If no exact match, try partial matching for flexibility
        for (const [key, value] of Object.entries(typeNames)) {
            if (lowerType.includes(key) || key.includes(lowerType)) {
                return value;
            }
        }

        // If still no match, return the original type with proper capitalization
        return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
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

    // Create serializable agent data for navigation
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

    // Fixed navigation handler - only pass serializable data
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

    // Fixed card click handler - only pass serializable data
    const handleCardClick = () => {
        if (!isValidProperty) return;

        navigate('/properties/view', {
            state: {
                propertyId: property.id,
                agentData: getSerializableAgentData(agent)
            }
        });
    };

    // Fetch agent data
    const fetchAgent = useCallback(async () => {
        if (!property?.agentId) {
            setAgent(null);
            return;
        }

        try {
            setLoadingAgent(true);

            if (property.agent && property.agent.id && property.agent.firstName) {
                setAgent(property.agent);
                return;
            }

            const agentData = await agentService.getAgentWithFallback(property.agentId);

            if (agentData && agentData.id) {
                setAgent(agentData);
            } else {
                setAgent(agentService.getFallbackAgent(property.agentId));
            }
        } catch (error) {
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

    // Process agent avatar image using the inline function
    const agentAvatarUrl = agent?.profilePictureUrl ? processAgentAvatarUrl(agent.profilePictureUrl) : null;

    console.log('🎨 Rendering PropertyCard for:', property.title);

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
                        src={imageError ? '/default-property.jpg' : currentImage}
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
                                console.log('🖼️ Image load error, using default');
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

                    {/* Amenities Section - ONLY FOR GRID VIEW */}
                    {viewMode === 'grid' && displayAmenities.length > 0 && (
                        <div style={{
                            marginBottom: '16px',
                            padding: '12px 0'
                        }}>
                            <Text strong style={{
                                fontSize: '12px',
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
                                {/* Show only 3 amenities */}
                                {displayAmenities.map((amenity, index) => (
                                    <Tag
                                        key={index}
                                        style={{
                                            fontSize: '10px',
                                            padding: '4px 10px',
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
                                            fontSize: '10px',
                                            padding: '4px 10px',
                                            borderRadius: '12px',
                                            backgroundColor: '#1B3C53',
                                            color: 'white',
                                            border: 'none',
                                            margin: 0
                                        }}
                                    >
                                        +{getDisplayAmenities().length - 3} more
                                    </Tag>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    {showActions && (
                        <div style={{
                            display: 'flex',
                            gap: '12px',
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
                                    fontWeight: '500',
                                    height: '40px'
                                }}
                                size="middle"
                            >
                                {viewMode === 'landscape' ? 'Schedule Tour' : 'Tour'}
                            </Button>

                            <Button
                                icon={<FaComments />}
                                onClick={handleChat}
                                style={{
                                    flex: 1,
                                    borderRadius: '8px',
                                    fontWeight: '500',
                                    height: '40px'
                                }}
                                size="middle"
                            >
                                {viewMode === 'landscape' ? 'Chat' : 'Chat'}
                            </Button>

                            <Button
                                icon={<FaEye />}
                                onClick={handleViewDetails}
                                style={{
                                    flex: 1,
                                    borderRadius: '8px',
                                    fontWeight: '500',
                                    height: '40px'
                                }}
                                size="middle"
                            >
                                {viewMode === 'landscape' ? 'View Details' : 'View'}
                            </Button>
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