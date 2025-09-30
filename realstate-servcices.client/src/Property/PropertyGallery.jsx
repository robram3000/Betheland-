// PropertyGallery.jsx (updated with working image URLs)
import React from 'react';
import { Image, Row, Col } from 'antd';

const PropertyGallery = () => {
    const images = [
        'https://picsum.photos/800/600?random=1',
        'https://picsum.photos/400/300?random=2',
        'https://picsum.photos/400/300?random=3',
        'https://picsum.photos/400/300?random=4',
        'https://picsum.photos/400/300?random=5'
    ];

    return (
        <div style={{ padding: '40px 0', backgroundColor: '#ffffff' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                        <Image
                            width="100%"
                            height={400}
                            src={images[0]}
                            alt="Main property view"
                            style={{ objectFit: 'cover', borderRadius: '8px' }}
                        />
                    </Col>
                    <Col xs={24} md={12}>
                        <Row gutter={[16, 16]} style={{ height: '100%' }}>
                            {images.slice(1).map((src, index) => (
                                <Col xs={12} key={index}>
                                    <Image
                                        width="100%"
                                        height={192}
                                        src={src}
                                        alt={`Property image ${index + 1}`}
                                        style={{ objectFit: 'cover', borderRadius: '8px' }}
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