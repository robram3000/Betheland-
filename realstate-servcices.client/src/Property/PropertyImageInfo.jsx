import React, { useState, useEffect, useRef } from 'react';
import {
    FaBed,
    FaBath,
    FaCar,
    FaRulerCombined,
    FaHeart,
    FaUtensils
} from 'react-icons/fa';
import './PropertyImageInfo.scss';

const PropertyImageInfo = ({ property, agent }) => {
    const [mainImage, setMainImage] = useState(property?.mainImage || '/default-property.jpg');
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isMobile, setIsMobile] = useState(false);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
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

    // Process image URL - SIMPLIFIED
    const processImageUrl = (url) => {
        if (!url) return url;
        if (url.startsWith('http') || url.startsWith('//') || url.startsWith('blob:') || url.startsWith('data:')) {
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
        if (url.startsWith('/uploads/')) {
            return `http://betheland.runasp.net/${url}`;
        }
        if (url.startsWith('uploads/')) {
            return `http://betheland.runasp.net/${url}`;
        }
        return url;
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

    useEffect(() => {
        if (images.length > 0 && currentSlide < images.length) {
            setMainImage(images[currentSlide]);
        }
    }, [currentSlide, images]);

    const additionalImagesCount = Math.max(0, images.length - 4);
    const displayThumbnails = images.slice(0, additionalImagesCount > 0 ? 3 : 4);

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
                                    >
                                        <img
                                            src={processImageUrl(image)}
                                            alt={`Property view ${index + 1}`}
                                            className="property-image-info-slider-image"
                                            onError={(e) => {
                                                console.log('Image failed to load:', image);
                                                e.target.src = '/default-property.jpg';
                                            }}
                                            onLoad={() => console.log('Image loaded successfully:', image)}
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
                        {/* Main Image */}
                        <div className="property-image-info-main-image-container">
                            <img
                                src={processImageUrl(mainImage)}
                                alt="Main property view"
                                className="property-image-info-main-image"
                                onError={(e) => {
                                    e.target.src = '/default-property.jpg';
                                }}
                            />
                        </div>

                        {/* Thumbnails */}
                        <div className="property-image-info-thumbnails-container">
                            <div className="property-image-info-thumbnails">
                                {displayThumbnails.map((image, index) => (
                                    <div
                                        key={index}
                                        className={`property-image-info-thumbnail-with-overlay ${mainImage === image ? 'property-image-info-active-thumbnail' : ''}`}
                                    >
                                        <img
                                            src={processImageUrl(image)}
                                            alt={`Property view ${index + 1}`}
                                            className="property-image-info-thumbnail"
                                            onClick={() => setMainImage(image)}
                                            onError={(e) => {
                                                e.target.src = '/default-property.jpg';
                                            }}
                                        />
                                    </div>
                                ))}
                                {additionalImagesCount > 0 && (
                                    <div
                                        className="property-image-info-thumbnail-with-overlay"
                                        onClick={() => setMainImage(images[3])}
                                    >
                                        <img
                                            src={processImageUrl(images[3])}
                                            alt="Property view"
                                            className="property-image-info-thumbnail"
                                            onError={(e) => {
                                                e.target.src = '/default-property.jpg';
                                            }}
                                        />
                                        <div className="property-image-info-overlay-counter">
                                            +{additionalImagesCount}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default PropertyImageInfo;