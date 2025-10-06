import React, { useState } from 'react';
import { Image, Row, Col, Modal, Button } from 'antd';
import { ZoomInOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';

const PropertyGallery = ({ property }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Process image URLs from property data
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

    // Get images from property data or use defaults
    const getImages = () => {
        if (property?.propertyImages && property.propertyImages.length > 0) {
            return property.propertyImages.map(img => ({
                src: processImageUrl(img.imageUrl || img),
                alt: img.alt || `${property?.title || 'Property'} image`
            }));
        }

        if (property?.mainImage) {
            return [{
                src: processImageUrl(property.mainImage),
                alt: `${property?.title || 'Property'} main image`
            }];
        }

        // Fallback to default images
        return [
            'https://picsum.photos/800/600?random=1',
            'https://picsum.photos/400/300?random=2',
            'https://picsum.photos/400/300?random=3',
            'https://picsum.photos/400/300?random=4',
            'https://picsum.photos/400/300?random=5'
        ].map((src, index) => ({
            src,
            alt: `Default property image ${index + 1}`
        }));
    };

    const images = getImages();

    const openModal = (index = 0) => {
        setCurrentImageIndex(index);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentImageIndex(0);
    };

    const goToNext = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const goToPrev = () => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowLeft') goToPrev();
        if (e.key === 'ArrowRight') goToNext();
        if (e.key === 'Escape') closeModal();
    };

    // Preview images count logic
    const previewImages = images.slice(0, 5);
    const remainingCount = images.length - 5;

    return (
        <>
            <div style={{ padding: '40px 0', backgroundColor: '#ffffff' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
                    <Row gutter={[16, 16]}>
                        {/* Main Image */}
                        <Col xs={24} md={12}>
                            <div
                                style={{
                                    position: 'relative',
                                    cursor: 'pointer',
                                    borderRadius: '8px',
                                    overflow: 'hidden'
                                }}
                                onClick={() => openModal(0)}
                            >
                                <Image
                                    width="100%"
                                    height={400}
                                    src={previewImages[0]?.src}
                                    alt={previewImages[0]?.alt}
                                    style={{
                                        objectFit: 'cover',
                                        borderRadius: '8px',
                                        transition: 'transform 0.3s ease'
                                    }}
                                    fallback="/default-property.jpg"
                                    preview={false}
                                />
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: '16px',
                                        right: '16px',
                                        background: 'rgba(0, 0, 0, 0.7)',
                                        color: 'white',
                                        padding: '8px 12px',
                                        borderRadius: '4px',
                                        fontSize: '14px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}
                                >
                                    <ZoomInOutlined />
                                    Click to enlarge
                                </div>
                            </div>
                        </Col>

                        {/* Thumbnail Images */}
                        <Col xs={24} md={12}>
                            <Row gutter={[16, 16]} style={{ height: '100%' }}>
                                {previewImages.slice(1).map((image, index) => (
                                    <Col xs={12} key={index}>
                                        <div
                                            style={{
                                                position: 'relative',
                                                cursor: 'pointer',
                                                borderRadius: '8px',
                                                overflow: 'hidden'
                                            }}
                                            onClick={() => openModal(index + 1)}
                                        >
                                            <Image
                                                width="100%"
                                                height={192}
                                                src={image.src}
                                                alt={image.alt}
                                                style={{
                                                    objectFit: 'cover',
                                                    borderRadius: '8px',
                                                    transition: 'transform 0.3s ease'
                                                }}
                                                fallback="/default-property.jpg"
                                                preview={false}
                                            />
                                            {/* Show remaining count on last thumbnail */}
                                            {index === 3 && remainingCount > 0 && (
                                                <div
                                                    style={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        right: 0,
                                                        bottom: 0,
                                                        background: 'rgba(0, 0, 0, 0.6)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'white',
                                                        fontSize: '18px',
                                                        fontWeight: 'bold'
                                                    }}
                                                >
                                                    +{remainingCount} more
                                                </div>
                                            )}
                                        </div>
                                    </Col>
                                ))}
                            </Row>
                        </Col>
                    </Row>

                    {/* Image Counter */}
                    <div style={{ textAlign: 'center', marginTop: '16px', color: '#666' }}>
                        {images.length} image{images.length !== 1 ? 's' : ''} available
                    </div>
                </div>
            </div>

            {/* Image Modal */}
            <Modal
                open={isModalOpen}
                onCancel={closeModal}
                footer={null}
                width="90vw"
                style={{ top: 20 }}
                bodyStyle={{ padding: 0, backgroundColor: '#000' }}
                closeIcon={
                    <div style={{ color: '#fff', fontSize: '24px', zIndex: 1001 }}>×</div>
                }
            >
                <div
                    style={{
                        position: 'relative',
                        height: '80vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onKeyDown={handleKeyDown}
                    tabIndex={0}
                >
                    {/* Navigation Arrows */}
                    {images.length > 1 && (
                        <>
                            <Button
                                type="text"
                                icon={<LeftOutlined style={{ color: '#fff', fontSize: '24px' }} />}
                                onClick={goToPrev}
                                style={{
                                    position: 'absolute',
                                    left: '20px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    zIndex: 1000,
                                    background: 'rgba(0, 0, 0, 0.5)',
                                    border: 'none',
                                    width: '50px',
                                    height: '50px',
                                    borderRadius: '50%'
                                }}
                            />
                            <Button
                                type="text"
                                icon={<RightOutlined style={{ color: '#fff', fontSize: '24px' }} />}
                                onClick={goToNext}
                                style={{
                                    position: 'absolute',
                                    right: '20px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    zIndex: 1000,
                                    background: 'rgba(0, 0, 0, 0.5)',
                                    border: 'none',
                                    width: '50px',
                                    height: '50px',
                                    borderRadius: '50%'
                                }}
                            />
                        </>
                    )}

                    {/* Main Image in Modal */}
                    <Image
                        width="100%"
                        style={{
                            maxHeight: '80vh',
                            objectFit: 'contain',
                            borderRadius: '4px'
                        }}
                        src={images[currentImageIndex]?.src}
                        alt={images[currentImageIndex]?.alt}
                        fallback="/default-property.jpg"
                        preview={false}
                    />

                    {/* Image Counter in Modal */}
                    <div
                        style={{
                            position: 'absolute',
                            bottom: '20px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: 'rgba(0, 0, 0, 0.7)',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            fontSize: '14px'
                        }}
                    >
                        {currentImageIndex + 1} / {images.length}
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default PropertyGallery;