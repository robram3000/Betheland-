import React, { useState } from 'react';
import { Row, Col, Typography, Rate, Tag, Button, Space } from 'antd';
import { EnvironmentOutlined, HeartOutlined, HeartFilled, CalendarOutlined, ShareAltOutlined, MessageOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const PropertyHeader = ({ property }) => {
    const [isFavorite, setIsFavorite] = useState(false);

    const toggleFavorite = () => {
        setIsFavorite(!isFavorite);
    };

    const handleScheduleTour = () => {
        console.log('Schedule tour for this property');
    };

    const handleShare = () => {
        console.log('Share this property');
    };

    const handleChat = () => {
        console.log('Start chat about this property');
    };

    if (!property) {
        return <div>Loading property...</div>;
    }

    const formatPesoPrice = (price) => {
        if (!price && price !== 0) return 'Price on request';
        if (price >= 1000000) {
            return `₱${(price / 1000000).toFixed(1)}M`;
        } else if (price >= 1000) {
            return `₱${(price / 1000).toFixed(0)}K`;
        }
        return `₱${price}`;
    };

    return (
        <div style={{ padding: '40px 0', background: '#f8f9fa' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
                <Row gutter={[32, 16]} align="middle">
                    <Col xs={24} md={16}>
                        <Title level={1}>{property.title || 'Property Title'}</Title>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                            <EnvironmentOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                            <Text type="secondary">{property.location || property.address || 'Location not specified'}</Text>
                        </div>
                        <Rate disabled defaultValue={property.rating || 4.5} allowHalf style={{ marginBottom: '16px' }} />
                        <div>
                            <Tag color="blue">{property.propertyType || 'Property'}</Tag>
                            <Tag color="green">{property.bedrooms || 0} Bedrooms</Tag>
                            <Tag color="orange">{property.bathrooms || 0} Bathrooms</Tag>
                            {property.status && <Tag color={property.status === 'available' ? 'green' : 'red'}>{property.status}</Tag>}
                        </div>
                    </Col>
                    <Col xs={24} md={8}>
                        <div style={{ textAlign: 'right' }}>
                            <Title level={2} style={{ color: '#1890ff', margin: 0 }}>
                                {formatPesoPrice(property.price)}
                            </Title>
                            {property.areaSqft && (
                                <Text type="secondary">
                                    ₱{Math.round(property.price / property.areaSqft).toLocaleString()}/sq ft
                                </Text>
                            )}

                            <Space direction="vertical" style={{ width: '100%', marginTop: '16px' }} size="small">
                                <Button
                                    type="primary"
                                    icon={<CalendarOutlined />}
                                    size="large"
                                    onClick={handleScheduleTour}
                                    style={{ width: '100%', borderRadius: '8px' }}
                                >
                                    Schedule a Tour
                                </Button>

                                <Button
                                    icon={<MessageOutlined />}
                                    size="large"
                                    onClick={handleChat}
                                    style={{ width: '100%', borderRadius: '8px' }}
                                >
                                    Chat with Agent
                                </Button>

                                <Space.Compact style={{ width: '100%' }}>
                                    <Button
                                        icon={isFavorite ? <HeartFilled /> : <HeartOutlined />}
                                        onClick={toggleFavorite}
                                        style={{
                                            borderRadius: '8px 0 0 8px',
                                            color: isFavorite ? '#ff4d4f' : undefined
                                        }}
                                    >
                                        {isFavorite ? 'Saved' : 'Save'}
                                    </Button>
                                    <Button
                                        icon={<ShareAltOutlined />}
                                        onClick={handleShare}
                                        style={{ borderRadius: '0 8px 8px 0' }}
                                    >
                                        Share
                                    </Button>
                                </Space.Compact>
                            </Space>
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default PropertyHeader;