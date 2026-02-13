// PropertyImageInfo.jsx (UPDATED - With Schedule Transition Support)
import React, { useState, useEffect, useRef } from 'react';
import {
    FaBed,
    FaBath,
    FaCar,
    FaRulerCombined,
    FaUtensils,
    FaCalendarPlus
} from 'react-icons/fa';
import { Modal, Button } from 'antd';
import {
    CloseOutlined,
    LeftOutlined,
    RightOutlined,
    EyeOutlined
} from '@ant-design/icons';
import './PropertyImageInfo.scss';

const processImageUrl = (url) => {
    if (!url || typeof url !== 'string' || url.trim() === '') {
        return '/default-property.jpg';
    }

    // Already full URL (http, https, blob, data, etc.)
    if (url.startsWith('http') || url.startsWith('//') || url.startsWith('blob:') || url.startsWith('data:')) {
        return url;
    }

    // Server path - prepend appropriate base URL
    if (url.startsWith('/uploads/')) {
        const baseUrl = window.location.hostname === 'localhost'
            ? 'https://localhost:7080'
            : 'https://betheland.runasp.net';
        return `${baseUrl}${url}`;
    }

    // Relative path without leading slash
    if (url.includes('.') && !url.startsWith('/')) {
        const baseUrl = window.location.hostname === 'localhost'
            ? 'https://localhost:7080'
            : 'https://betheland.runasp.net';
        return `${baseUrl}/uploads/${url}`;
    }

    // uploads/ path
    if (url.startsWith('uploads/')) {
        const baseUrl = window.location.hostname === 'localhost'
            ? 'https://localhost:7080'
            : 'https://betheland.runasp.net';
        return `${baseUrl}/${url}`;
    }

    return '/default-property.jpg';
};

const PropertyImageInfo = ({ property, agent, onScheduleTour, onScheduleViewChange }) => {
    const [mainImage, setMainImage] = useState(property?.mainImage || '/default-property.jpg');
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isMobile, setIsMobile] = useState(false);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const [imageErrors, setImageErrors] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalCurrentSlide, setModalCurrentSlide] = useState(0);
    const sliderRef = useRef(null);

    if (!property) return null;

    // Check if mobile on mount and resize
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => {
            window.removeEventListener('resize', checkMobile);
        };
    }, []);

    // Get all available images from property
    const getAvailableImages = () => {
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

    const availableImages = getAvailableImages();
    const images = availableImages.length > 0 ? availableImages : ['/default-property.jpg'];

    // Handle image errors
    const handleImageError = (imageUrl) => {
        setImageErrors(prev => ({ ...prev, [imageUrl]: true }));
    };

    const getProcessedImageUrl = (imageUrl) => {
        if (imageErrors[imageUrl]) {
            return '/default-property.jpg';
        }
        return processImageUrl(imageUrl);
    };

    // Touch handlers for swipe
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

        if (isLeftSwipe && images.length > 1) {
            nextSlide();
        } else if (isRightSwipe && images.length > 1) {
            prevSlide();
        }

        setTouchStart(null);
        setTouchEnd(null);
    };

    // Slider navigation functions
    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % images.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
    };

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    // Modal navigation functions
    const nextModalSlide = () => {
        setModalCurrentSlide((prev) => (prev + 1) % images.length);
    };

    const prevModalSlide = () => {
        setModalCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
    };

    const goToModalSlide = (index) => {
        setModalCurrentSlide(index);
    };

    // Update main image when current slide changes
    useEffect(() => {
        if (images.length > 0 && currentSlide < images.length) {
            setMainImage(images[currentSlide]);
        }
    }, [currentSlide, images]);

    // Handle thumbnail click
    const handleThumbnailClick = (image, index) => {
        setMainImage(image);
        setCurrentSlide(index);
    };

    // Open modal
    const openModal = (index = 0) => {
        setModalCurrentSlide(index);
        setIsModalOpen(true);
    };

    // Close modal
    const closeModal = () => {
        setIsModalOpen(false);
    };

    // NEW: Enhanced schedule tour handler with transition support
    const handleScheduleTour = () => {
        if (onScheduleTour) {
            onScheduleTour();
        }

        // NEW: Trigger view change to schedule template
        if (onScheduleViewChange) {
            onScheduleViewChange('schedule');
        }
    };

    const additionalImagesCount = Math.max(0, images.length - 4);
    const displayThumbnails = images.slice(0, 4);

    return (
        <div className="property-image-info-container">
            {/* Information Section */}
            <div className="property-image-info-info-section">
                {/* Property Title */}
                <div className="property-image-info-title">
                    {property.title || 'Untitled Property'}
                </div>

                {/* Property Address */}
                <div className="property-image-info-address">
                    {property.address || 'Address not specified'}
                </div>

                {/* Property Location (City, State, Zip) */}
                <div className="property-image-info-suburb">
                    {[property.city, property.state, property.zipCode].filter(Boolean).join(', ')}
                </div>

                <div className="property-image-info-divider"></div>

                {/* Property Features */}
                <div className="property-image-info-features-grid">
                    <div className="property-image-info-feature-item">
                        <FaBed className="property-image-info-feature-icon" />
                        <span className="property-image-info-feature-value">{property.bedrooms || 0}</span>
                        <span className="property-image-info-feature-label">Beds</span>
                    </div>
                    <div className="property-image-info-feature-item">
                        <FaBath className="property-image-info-feature-icon" />
                        <span className="property-image-info-feature-value">{property.bathrooms || 0}</span>
                        <span className="property-image-info-feature-label">Baths</span>
                    </div>
                    <div className="property-image-info-feature-item">
                        <FaCar className="property-image-info-feature-icon" />
                        <span className="property-image-info-feature-value">{property.garage || 0}</span>
                        <span className="property-image-info-feature-label">Garage</span>
                    </div>
                    <div className="property-image-info-feature-item">
                        <FaRulerCombined className="property-image-info-feature-icon" />
                        <span className="property-image-info-feature-value">{property.areaSqft || 'N/A'}</span>
                        <span className="property-image-info-feature-label">SqM</span>
                    </div>
                    <div className="property-image-info-feature-item">
                        <FaUtensils className="property-image-info-feature-icon" />
                        <span className="property-image-info-feature-value">{property.kitchen || 0}</span>
                        <span className="property-image-info-feature-label">Kitchen</span>
                    </div>
                </div>

             
            </div>

            {/* Image Section */}
            <div className="property-image-info-image-section">
                {/* Mobile Slider */}
                {isMobile && (
                    <div className="property-image-info-mobile-slider mobile-slider-fix">
                        <div
                            className="property-image-info-slider-container"
                            ref={sliderRef}
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                        >
                            <div
                                className="property-image-info-slider-track"
                                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                            >
                                {images.map((image, index) => (
                                    <div
                                        key={index}
                                        className="property-image-info-slide"
                                        onClick={() => openModal(index)}
                                    >
                                        <img
                                            src={getProcessedImageUrl(image)}
                                            alt={`Property view ${index + 1}`}
                                            className="property-image-info-slider-image"
                                            onError={(e) => {
                                                handleImageError(image);
                                                e.target.src = '/default-property.jpg';
                                            }}
                                            loading="lazy"
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Slide Indicators */}
                            {images.length > 1 && (
                                <div className="property-image-info-slider-indicators">
                                    {images.map((_, index) => (
                                        <button
                                            key={index}
                                            className={`property-image-info-slider-indicator ${index === currentSlide ? 'property-image-info-slider-indicator-active' : ''}`}
                                            onClick={() => goToSlide(index)}
                                            aria-label={`Go to slide ${index + 1}`}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Image Counter */}
                            {images.length > 1 && (
                                <div className="property-image-info-slider-counter">
                                    {currentSlide + 1} / {images.length}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Desktop Layout */}
                {!isMobile && (
                    <>
                        {/* Main Image - Click to open modal */}
                        <div
                            className="property-image-info-main-image-container"
                            onClick={() => openModal(currentSlide)}
                        >
                            <img
                                src={getProcessedImageUrl(mainImage)}
                                alt="Main property view"
                                className="property-image-info-main-image"
                                onError={(e) => {
                                    handleImageError(mainImage);
                                    e.target.src = '/default-property.jpg';
                                }}
                            />
                            {/* View All Photos Button */}
                            <div className="property-image-info-view-all-btn">
                                <EyeOutlined style={{ marginRight: '8px' }} />
                                View All Photos ({images.length})
                            </div>
                        </div>

                        {/* Thumbnails */}
                        <div className="property-image-info-thumbnails-container">
                            <div className="property-image-info-thumbnails">
                                {displayThumbnails.map((image, index) => (
                                    <div
                                        key={index}
                                        className={`property-image-info-thumbnail-with-overlay ${mainImage === image ? 'property-image-info-active-thumbnail' : ''}`}
                                        onClick={() => handleThumbnailClick(image, index)}
                                    >
                                        <img
                                            src={getProcessedImageUrl(image)}
                                            alt={`Property view ${index + 1}`}
                                            className="property-image-info-thumbnail"
                                            onError={(e) => {
                                                handleImageError(image);
                                                e.target.src = '/default-property.jpg';
                                            }}
                                        />
                                        {/* Show +X overlay only on the last thumbnail when there are more images */}
                                        {index === 3 && additionalImagesCount > 0 && (
                                            <div
                                                className="property-image-info-overlay-counter"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openModal(3);
                                                }}
                                            >
                                                +{additionalImagesCount}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Ant Design Modal */}
            <Modal
                open={isModalOpen}
                onCancel={closeModal}
                footer={null}
                width="90vw"
                style={{ maxWidth: '1200px' }}
                closeIcon={<CloseOutlined style={{ color: '#fff', fontSize: '24px' }} />}
                className="property-image-gallery-modal"
                bodyStyle={{
                    padding: 0,
                    height: '80vh',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                <div className="property-image-gallery-content">
                    {/* Main Image with Navigation */}
                    <div className="property-image-gallery-main">
                        <Button
                            className="property-image-gallery-nav property-image-gallery-prev"
                            onClick={prevModalSlide}
                            icon={<LeftOutlined />}
                            type="text"
                            style={{
                                color: '#fff',
                                fontSize: '20px'
                            }}
                        />

                        <div className="property-image-gallery-image-container">
                            <img
                                src={getProcessedImageUrl(images[modalCurrentSlide])}
                                alt={`Property view ${modalCurrentSlide + 1}`}
                                className="property-image-gallery-image"
                                onError={(e) => {
                                    handleImageError(images[modalCurrentSlide]);
                                    e.target.src = '/default-property.jpg';
                                }}
                            />
                        </div>

                        <Button
                            className="property-image-gallery-nav property-image-gallery-next"
                            onClick={nextModalSlide}
                            icon={<RightOutlined />}
                            type="text"
                            style={{
                                color: '#fff',
                                fontSize: '20px'
                            }}
                        />
                    </div>

                    {/* Image Counter */}
                    <div className="property-image-gallery-counter">
                        {modalCurrentSlide + 1} / {images.length}
                    </div>

                    {/* Thumbnail Strip */}
                    <div className="property-image-gallery-thumbnails">
                        {images.map((image, index) => (
                            <div
                                key={index}
                                className={`property-image-gallery-thumbnail ${index === modalCurrentSlide ? 'property-image-gallery-thumbnail-active' : ''}`}
                                onClick={() => goToModalSlide(index)}
                            >
                                <img
                                    src={getProcessedImageUrl(image)}
                                    alt={`Property view ${index + 1}`}
                                    onError={(e) => {
                                        handleImageError(image);
                                        e.target.src = '/default-property.jpg';
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default PropertyImageInfo;