import React from 'react';
import { Image, Row, Col } from 'antd';

const PropertyGallery = ({ property }) => {
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
            return property.propertyImages.map(img => processImageUrl(img.imageUrl || img));
        }

        if (property?.mainImage) {
            return [processImageUrl(property.mainImage)];
        }

        // Fallback to default images
        return [
            'https://picsum.photos/800/600?random=1',
            'https://picsum.photos/400/300?random=2',
            'https://picsum.photos/400/300?random=3',
            'https://picsum.photos/400/300?random=4',
            'https://picsum.photos/400/300?random=5'
        ];
    };

    const images = getImages();

    return (
        <div style={{ padding: '40px 0', backgroundColor: '#ffffff' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                        <Image
                            width="100%"
                            height={400}
                            src={images[0]}
                            alt={property?.title || 'Property image'}
                            style={{ objectFit: 'cover', borderRadius: '8px' }}
                            fallback="/default-property.jpg"
                        />
                    </Col>
                    <Col xs={24} md={12}>
                        <Row gutter={[16, 16]} style={{ height: '100%' }}>
                            {images.slice(1, 5).map((src, index) => (
                                <Col xs={12} key={index}>
                                    <Image
                                        width="100%"
                                        height={192}
                                        src={src}
                                        alt={`${property?.title || 'Property'} image ${index + 2}`}
                                        style={{ objectFit: 'cover', borderRadius: '8px' }}
                                        fallback="/default-property.jpg"
                                    />
                                </Col>
                            ))}
                        </Row>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default PropertyGallery;