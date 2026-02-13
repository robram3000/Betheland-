// WishlistCard.jsx (UPDATED TO MATCH PropertyCard DESIGN)
import React, { useState } from 'react';
import {
    Card,
    Button,
    Space,
    Rate,
    Avatar,
    Tag,
    Typography,
    Image,
    Divider,
    Tooltip
} from 'antd';
import {
    HeartFilled,
    DeleteOutlined,
    CalendarOutlined,
    EyeOutlined,
    UserOutlined,
    EnvironmentOutlined,
    DollarOutlined,
    HomeOutlined,
    StarFilled
} from '@ant-design/icons';
import {
    FaBed,
    FaBath,
    FaHome,
    FaMapMarkerAlt,
    FaChevronLeft,
    FaChevronRight,
    FaTimes
} from 'react-icons/fa';

const { Title, Text } = Typography;

const WishlistCard = ({
    property,
    agent,
    ratingSummary,
    onRemove,
    onScheduleTour,
    onViewDetails
}) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [galleryImageIndex, setGalleryImageIndex] = useState(0);

    // Safe data extraction with fallbacks
    const propertyId = property?.id || property?.propertyId;
    const title = property?.title || 'No Title';
    const description = property?.description || 'No description available';
    const price = property?.price ? `₱${property.price.toLocaleString()}` : 'Price not set';
    const address = property?.address || 'Address not available';
    const city = property?.city || '';
    const state = property?.state || '';
    const bedrooms = property?.bedrooms || 0;
    const bathrooms = property?.bathrooms || 0;
    const areaSqm = property?.areaSqm || 0;
    const propertyType = property?.type || 'Property';

    // Handle images safely - similar to PropertyCard
    const propertyImages = (() => {
        const images = [];

        // Use mainImage if available
        if (property?.mainImage) {
            images.push(property.mainImage);
        }

        // Use imageUrls if available
        if (property?.imageUrls && Array.isArray(property.imageUrls)) {
            property.imageUrls.forEach(url => {
                if (url && !images.includes(url)) {
                    images.push(url);
                }
            });
        }

        // Use propertyImages if available
        if (property?.propertyImages && Array.isArray(property.propertyImages)) {
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
    })();

    const mainImage = propertyImages[0] || '/default-property.jpg';
    const hasMultipleImages = propertyImages.length > 1;

    // Handle agent data safely
    const agentName = agent ? `${agent.firstName} ${agent.lastName}`.trim() : 'No Agent Assigned';
    const agentRating = ratingSummary?.averageRating || agent?.rating || 4.0;
    const agentReviews = ratingSummary?.totalRatings || agent?.reviews || 0;
    const agentProfilePicture = agent?.profilePictureUrl || '';

    // Property features - similar to PropertyCard
    const features = [
        { icon: <FaBed style={{ color: '#666', fontSize: '14px' }} />, text: `${bedrooms}`, label: 'Bedrooms' },
        { icon: <FaBath style={{ color: '#666', fontSize: '14px' }} />, text: `${bathrooms}`, label: 'Bathrooms' },
        { icon: <FaHome style={{ color: '#666', fontSize: '14px' }} />, text: `${areaSqm.toLocaleString()} sqm`, label: 'Area' }
    ].filter(feature => feature.text && !feature.text.includes('0'));

    // Format area similar to PropertyCard
    const formatArea = (areaSqm) => {
        if (!areaSqm) return '0 sqm';
        const hectares = areaSqm / 10000;
        if (hectares >= 1) {
            return `${hectares.toFixed(2)}ha`;
        }
        return `${areaSqm.toLocaleString()} sqm`;
    };

    // Get property type color similar to PropertyCard
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

    // Navigation functions similar to PropertyCard
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
        e?.stopPropagation();
        setGalleryImageIndex(currentImageIndex);
        setIsGalleryOpen(true);
    };

    const closeGallery = () => {
        setIsGalleryOpen(false);
    };

    const currentImage = propertyImages[currentImageIndex];

    return (
        <>
            <Card
                hoverable
                style={{
                    width: '300px', // CHANGED: Fixed width to 300px
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    border: '1px solid #f0f0f0'
                }}
                styles={{
                    body: {
                        padding: '0'
                    }
                }}
            >
                {/* Image Section - Similar to PropertyCard */}
                <div
                    style={{
                        position: 'relative',
                        height: '200px', // ADJUSTED: Slightly smaller height for 300px width
                        overflow: 'hidden',
                        backgroundColor: '#f8fafc',
                        cursor: 'pointer'
                    }}
                    className="image-section"
                    onClick={openGallery}
                >
                    <img
                        alt={title}
                        src={currentImage}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            cursor: 'pointer',
                            display: 'block',
                            transition: 'transform 0.3s ease'
                        }}
                        onError={(e) => {
                            if (e.target.src !== '/default-property.jpg') {
                                e.target.src = '/default-property.jpg';
                            }
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'scale(1)';
                        }}
                    />

                    {/* Property Type Badge - Similar to PropertyCard */}
                    <div style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        zIndex: 5
                    }}>
                        <Tag
                            color={getPropertyTypeColor(propertyType)}
                            style={{
                                borderRadius: '6px',
                                fontWeight: '500',
                                fontSize: '12px'
                            }}
                        >
                            {propertyType}
                        </Tag>
                    </div>

                    {/* Wishlist Heart - Similar to PropertyCard but always filled */}
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
                            zIndex: 10
                        }}
                        title="In Wishlist"
                    >
                        <HeartFilled style={{ color: '#ff4d4f', fontSize: '18px' }} />
                    </div>

                    {/* Image Navigation Dots - Similar to PropertyCard */}
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

                    {/* Image Navigation Arrows - Similar to PropertyCard */}
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
                </div>

                {/* Content Section - Similar to PropertyCard */}
                <div style={{
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    height: 'calc(100% - 200px)', // ADJUSTED: Match the image height change
                    justifyContent: 'space-between'
                }}>
                    {/* Agent Info - Similar to PropertyCard */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '12px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Avatar
                                size={36}
                                src={agentProfilePicture}
                                style={{
                                    backgroundColor: agentProfilePicture ? 'transparent' : '#1B3C53',
                                    border: '2px solid #1B3C53'
                                }}
                                icon={<UserOutlined />}
                            >
                                {!agentProfilePicture && agentName?.charAt(0)?.toUpperCase()}
                            </Avatar>
                            <div>
                                <Text strong style={{
                                    fontSize: '14px',
                                    color: '#1B3C53',
                                    display: 'block'
                                }}>
                                    {agentName}
                                </Text>
                                <Text style={{
                                    fontSize: '11px',
                                    color: '#64748b'
                                }}>
                                    Real Estate Agent
                                </Text>
                            </div>
                        </div>

                        {/* Agent Rating - Similar to PropertyCard */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}>
                            <StarFilled style={{ color: '#faad14', fontSize: '12px' }} />
                            <Text style={{ fontSize: '12px', fontWeight: '500' }}>
                                {agentRating.toFixed(1)}
                            </Text>
                            <Text type="secondary" style={{ fontSize: '11px' }}>
                                ({agentReviews})
                            </Text>
                        </div>
                    </div>

                    {/* Title and Price - Similar to PropertyCard */}
                    <div style={{ marginBottom: '12px' }}>
                        <Title
                            level={5}
                            style={{
                                margin: 0,
                                color: '#1B3C53',
                                fontSize: '16px',
                                lineHeight: '1.3',
                                height: '42px',
                                overflow: 'hidden',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical'
                            }}
                        >
                            {title}
                        </Title>
                        <Text strong style={{
                            fontSize: '18px',
                            color: '#1B3C53',
                            display: 'block',
                            marginTop: '6px'
                        }}>
                            {price}
                        </Text>
                    </div>

                    {/* Address - Similar to PropertyCard */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <FaMapMarkerAlt style={{
                            marginRight: '8px',
                            color: '#64748b',
                            fontSize: '12px',
                            marginTop: '2px',
                            flexShrink: 0
                        }} />
                        <Text style={{
                            fontSize: '12px',
                            color: '#64748b',
                            lineHeight: '1.4'
                        }}>
                            {address}
                            {city && `, ${city}`}
                            {state && `, ${state}`}
                        </Text>
                    </div>

                    {/* Property Features - Similar to PropertyCard */}
                    {features.length > 0 && (
                        <div style={{
                            display: 'flex',
                            gap: '16px',
                            marginBottom: '16px',
                            padding: '12px 0',
                            borderTop: '1px solid #f0f0f0',
                            borderBottom: '1px solid #f0f0f0',
                            flexWrap: 'wrap',
                            justifyContent: 'space-around'
                        }}>
                            {features.map((feature, index) => (
                                <Tooltip key={index} title={feature.label}>
                                    <Space size={6} style={{ alignItems: 'center', flexDirection: 'column' }}>
                                        {feature.icon}
                                        <Text style={{
                                            fontSize: '11px',
                                            fontWeight: '500'
                                        }}>
                                            {feature.text}
                                        </Text>
                                    </Space>
                                </Tooltip>
                            ))}
                        </div>
                    )}

                    {/* Action Buttons - Enhanced to match PropertyCard style */}
                    <div style={{
                        display: 'flex',
                        gap: '8px',
                        justifyContent: 'space-between'
                    }}>
                        <Button
                            type="primary"
                            icon={<CalendarOutlined />}
                            onClick={onScheduleTour}
                            size="small"
                            style={{
                                flex: 1,
                                fontSize: '12px',
                                height: '32px'
                            }}
                        >
                            Tour
                        </Button>
                        <Button
                            icon={<EyeOutlined />}
                            onClick={onViewDetails}
                            size="small"
                            style={{
                                flex: 1,
                                fontSize: '12px',
                                height: '32px'
                            }}
                        >
                            View
                        </Button>
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            onClick={onRemove}
                            size="small"
                            style={{
                                fontSize: '12px',
                                height: '32px'
                            }}
                        >
                            Remove
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Image Gallery Modal - Similar to PropertyCard */}
            {isGalleryOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: 'rgba(0,0,0,0.9)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div style={{
                        position: 'relative',
                        width: '90%',
                        height: '90%',
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

                        <div
                            style={{
                                position: 'absolute',
                                top: '20px',
                                right: '20px',
                                background: 'rgba(0,0,0,0.7)',
                                borderRadius: '50%',
                                width: '40px',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                cursor: 'pointer'
                            }}
                            onClick={closeGallery}
                        >
                            <FaTimes size={20} />
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .image-section:hover .image-nav-arrow {
                    opacity: 1 !important;
                }
            `}</style>
        </>
    );
};

export default WishlistCard;