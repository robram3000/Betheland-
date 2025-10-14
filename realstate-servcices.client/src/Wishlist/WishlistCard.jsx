
import React from 'react';
import { Card, Button, Space, Tag, Typography, Divider } from 'antd';
import {
    HeartFilled,
    DeleteOutlined,
    CalendarOutlined,
    EyeOutlined,
    EnvironmentOutlined,
    UserOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const WishlistCard = ({ property, onRemove, onScheduleTour, onViewDetails }) => {
   
    const propertyData = property;
    const {
        id,
        propertyId,
        propertyTitle = 'Unknown Property',
        propertyAddress = 'Location not specified',
        propertyPrice = 0,
        propertyImages = [],
        propertyStatus = 'available',
        propertyType = 'Unknown',
        firstChoiceAgent = null
    } = propertyData || {};

    const displayId = propertyId || id;
    const displayTitle = propertyTitle;
    const displayLocation = propertyAddress;
    const displayPrice = propertyPrice;
    const displayStatus = propertyStatus;
    const displayType = propertyType;

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


    const getMainImage = () => {
        if (propertyImages && propertyImages.length > 0) {
            return processImageUrl(propertyImages[0]);
        }
        return '/default-property.jpg';
    };

    const displayImage = getMainImage();

    const formatPesoPrice = (price) => {
        if (!price && price !== 0) return 'Price on request';

        const numericPrice = typeof price === 'string' ? parseFloat(price) : price;

        if (numericPrice >= 1000000) {
            return `₱${(numericPrice / 1000000).toFixed(1)}M`;
        } else if (numericPrice >= 1000) {
            return `₱${(numericPrice / 1000).toFixed(0)}K`;
        }
        return `₱${numericPrice}`;
    };


    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'available':
                return 'green';
            case 'sold':
                return 'red';
            case 'pending':
                return 'orange';
            case 'rented':
                return 'blue';
            default:
                return 'default';
        }
    };

    const getStatusText = (status) => {
        switch (status?.toLowerCase()) {
            case 'available':
                return 'Available';
            case 'sold':
                return 'Sold';
            case 'pending':
                return 'Pending';
            case 'rented':
                return 'Rented';
            default:
                return status || 'Available';
        }
    };

 
    const bedrooms = 2; 
    const bathrooms = 2; 
    const areaSqft = 1200; 

    return (
        <Card
            hoverable
            style={{
                width: '100%',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid #e2e8f0',
                height: '100%'
            }}
            cover={
                <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                    <img
                        alt={displayTitle}
                        src={displayImage}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            cursor: 'pointer'
                        }}
                        onClick={onViewDetails}
                        onError={(e) => {
                            e.target.src = '/default-property.jpg';
                        }}
                    />
                    {/* Wishlist Heart Badge */}
                    <div style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '50%',
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backdropFilter: 'blur(4px)'
                    }}>
                        <HeartFilled style={{ color: '#ff4d4f', fontSize: '18px' }} />
                    </div>

                    {/* Property Type Tag */}
                    <div style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px'
                    }}>
                        <Tag
                            color="#1B3C53"
                            style={{
                                margin: 0,
                                borderRadius: '6px',
                                border: 'none',
                                fontWeight: '500',
                                color: 'white'
                            }}
                        >
                            {displayType}
                        </Tag>
                    </div>

                    {/* Status Badge */}
                    {displayStatus && displayStatus !== 'available' && (
                        <div style={{
                            position: 'absolute',
                            bottom: '12px',
                            left: '12px'
                        }}>
                            <Tag
                                color={getStatusColor(displayStatus)}
                                style={{
                                    margin: 0,
                                    borderRadius: '6px',
                                    border: 'none',
                                    fontWeight: '500',
                                    color: 'white'
                                }}
                            >
                                {getStatusText(displayStatus)}
                            </Tag>
                        </div>
                    )}

                    {/* First Choice Agent Badge */}
                    {firstChoiceAgent && (
                        <div style={{
                            position: 'absolute',
                            bottom: '12px',
                            right: '12px',
                            background: 'rgba(255, 214, 102, 0.95)',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            backdropFilter: 'blur(4px)'
                        }}>
                            <Text style={{
                                fontSize: '10px',
                                fontWeight: 'bold',
                                color: '#000'
                            }}>
                                👑 First Choice Agent
                            </Text>
                        </div>
                    )}
                </div>
            }
            actions={[
                <Button
                    type="text"
                    icon={<EyeOutlined />}
                    onClick={onViewDetails}
                    style={{ width: '100%' }}
                >
                    Details
                </Button>,
                <Button
                    type="text"
                    icon={<CalendarOutlined />}
                    onClick={onScheduleTour}
                    disabled={displayStatus === 'sold'} 
                    style={{ width: '100%' }}
                >
                    Tour
                </Button>,
                <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={onRemove}
                    style={{ width: '100%' }}
                >
                    Remove
                </Button>
            ]}
        >
            {/* Property Title */}
            <Title level={5} style={{
                margin: '0 0 8px 0',
                lineHeight: '1.4',
                color: '#1B3C53',
                minHeight: '48px',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
            }}>
                {displayTitle}
            </Title>

            {/* Location */}
            <div style={{ marginBottom: '12px' }}>
                <Space>
                    <EnvironmentOutlined style={{ color: '#8c8c8c', fontSize: '14px' }} />
                    <Text type="secondary" style={{ fontSize: '14px' }}>
                        {displayLocation}
                    </Text>
                </Space>
            </div>

     
            <div style={{ marginBottom: '12px' }}>
                <Space size="small" wrap>
                    <Tag style={{
                        background: '#f0f9ff',
                        border: '1px solid #1B3C53',
                        color: '#1B3C53',
                        borderRadius: '6px',
                        margin: 0,
                        fontSize: '12px'
                    }}>
                        {bedrooms} bed
                    </Tag>
                    <Tag style={{
                        background: '#f0f9ff',
                        border: '1px solid #1B3C53',
                        color: '#1B3C53',
                        borderRadius: '6px',
                        margin: 0,
                        fontSize: '12px'
                    }}>
                        {bathrooms} bath
                    </Tag>
                    <Tag style={{
                        background: '#f0f9ff',
                        border: '1px solid #1B3C53',
                        color: '#1B3C53',
                        borderRadius: '6px',
                        margin: 0,
                        fontSize: '12px'
                    }}>
                        {areaSqft.toLocaleString()} sq ft
                    </Tag>
                </Space>
            </div>

            <Divider style={{ margin: '12px 0' }} />

            {/* Price */}
            <div style={{ textAlign: 'center' }}>
                <Title level={4} style={{
                    margin: 0,
                    color: '#1B3C53',
                    fontSize: '20px',
                    fontWeight: '700'
                }}>
                    {formatPesoPrice(displayPrice)}
                </Title>
                {displayStatus === 'rented' && (
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        /month
                    </Text>
                )}
            </div>
        </Card>
    );
};

export default WishlistCard;