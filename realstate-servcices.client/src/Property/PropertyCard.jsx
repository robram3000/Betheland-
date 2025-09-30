// PropertyCard.jsx (updated with proper view navigation to BaseSeeProperty)
import React from 'react';
import { Card, Rate, Tag, Typography, Space, Divider, Badge, Button } from 'antd';
import { EnvironmentOutlined, HeartOutlined, HeartFilled, StarFilled, CalendarOutlined, MessageOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const PropertyCard = ({ property, onAddToWishlist, onScheduleTour, onChat }) => {
    const navigate = useNavigate();
    const [isFavorite, setIsFavorite] = React.useState(property.isFavorite || false);

    const handleCardClick = () => {
        // Navigate to property details when card is clicked
        navigate('/properties/view', { state: { property } });
    };

    const toggleFavorite = (e) => {
        e.stopPropagation();
        const newFavoriteState = !isFavorite;
        setIsFavorite(newFavoriteState);

        if (onAddToWishlist) {
            onAddToWishlist(property.id, newFavoriteState);
        }
    };

    const handleScheduleTour = (e) => {
        e.stopPropagation();
        if (onScheduleTour) {
            onScheduleTour(property);
        }
    };

    const handleChat = (e) => {
        e.stopPropagation();
        if (onChat) {
            onChat(property);
        } else {
            // Default chat behavior
            console.log('Chat with property owner:', property.id);
            // You can implement chat functionality here
        }
    };

    const handleViewDetails = (e) => {
        e.stopPropagation();
        // Navigate to BaseSeeProperty page with property data
        navigate('/properties/view', { state: { property } });
    };

    const formatPesoPrice = (price) => {
        if (price >= 1000000) {
            return `₱${(price / 1000000).toFixed(1)}M`;
        } else if (price >= 1000) {
            return `₱${(price / 1000).toFixed(0)}K`;
        }
        return `₱${price}`;
    };

    return (
        <Badge.Ribbon
            text="Featured"
            color="#1B3C53"
            style={{ display: property.featured ? 'block' : 'none' }}
        >
            <Card
                hoverable
                style={{
                    height: '100%',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    overflow: 'hidden'
                }}
                bodyStyle={{ padding: '20px' }}
                cover={
                    <div style={{ position: 'relative' }}>
                        <img
                            alt={property.title}
                            src={property.image}
                            style={{
                                height: '220px',
                                objectFit: 'cover',
                                width: '100%'
                            }}
                        />
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
                                zIndex: 2
                            }}
                            onClick={toggleFavorite}
                        >
                            {isFavorite ? (
                                <HeartFilled style={{ color: '#ff4d4f', fontSize: '18px' }} />
                            ) : (
                                <HeartOutlined style={{ color: '#64748b', fontSize: '18px' }} />
                            )}
                        </div>
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
                                    fontWeight: '500'
                                }}
                            >
                                {property.propertyType}
                            </Tag>
                        </div>
                        <div style={{
                            position: 'absolute',
                            bottom: '12px',
                            left: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            background: 'rgba(255, 255, 255, 0.9)',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            backdropFilter: 'blur(4px)'
                        }}>
                            <StarFilled style={{ color: '#fbbf24', fontSize: '14px', marginRight: '4px' }} />
                            <Text strong style={{ color: '#1B3C53', fontSize: '12px' }}>
                                {property.rating}
                            </Text>
                        </div>
                    </div>
                }
                onClick={handleCardClick}
            >
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <Title level={4} style={{
                        margin: 0,
                        fontSize: '18px',
                        lineHeight: '1.4',
                        color: '#1B3C53',
                        fontWeight: '600'
                    }}>
                        {property.title}
                    </Title>

                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <EnvironmentOutlined style={{ marginRight: '6px', color: '#64748b', fontSize: '14px' }} />
                        <Text type="secondary" style={{ fontSize: '14px', color: '#64748b' }}>
                            {property.location}
                        </Text>
                    </div>

                    <Divider style={{ margin: '16px 0', background: '#f1f5f9' }} />

                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <Title level={3} style={{
                            margin: 0,
                            color: '#1B3C53',
                            fontSize: '24px',
                            fontWeight: '700'
                        }}>
                            {formatPesoPrice(property.price)}
                        </Title>
                        <Text type="secondary" style={{ fontSize: '12px', color: '#64748b' }}>
                            ₱{property.pricePerSqft?.toLocaleString()}/sq ft
                        </Text>
                    </Space>

                    <Divider style={{ margin: '16px 0', background: '#f1f5f9' }} />

                    <Space size="small" wrap>
                        <Tag style={{
                            background: '#f0f9ff',
                            border: '1px solid #1B3C53',
                            color: '#1B3C53',
                            borderRadius: '6px',
                            margin: 0
                        }}>
                            {property.bedrooms} beds
                        </Tag>
                        <Tag style={{
                            background: '#f0f9ff',
                            border: '1px solid #1B3C53',
                            color: '#1B3C53',
                            borderRadius: '6px',
                            margin: 0
                        }}>
                            {property.bathrooms} baths
                        </Tag>
                        <Tag style={{
                            background: '#f0f9ff',
                            border: '1px solid #1B3C53',
                            color: '#1B3C53',
                            borderRadius: '6px',
                            margin: 0
                        }}>
                            {property.squareFeet.toLocaleString()} sq ft
                        </Tag>
                    </Space>

                    <Space size={[4, 8]} wrap style={{ marginTop: '12px' }}>
                        {property.tags.slice(0, 3).map((tag, index) => (
                            <Tag key={index} style={{
                                background: '#f1f5f9',
                                color: '#475569',
                                border: 'none',
                                borderRadius: '6px',
                                margin: 0,
                                fontSize: '11px',
                                padding: '2px 8px'
                            }}>
                                {tag}
                            </Tag>
                        ))}
                        {property.tags.length > 3 && (
                            <Tag style={{
                                background: 'transparent',
                                color: '#64748b',
                                border: '1px dashed #cbd5e1',
                                borderRadius: '6px',
                                margin: 0,
                                fontSize: '11px',
                                padding: '2px 8px'
                            }}>
                                +{property.tags.length - 3} more
                            </Tag>
                        )}
                    </Space>

                    {/* Action Buttons */}
                    <Space.Compact style={{ width: '100%', marginTop: '16px' }}>
                        <Button
                            type="primary"
                            icon={<CalendarOutlined />}
                            onClick={handleScheduleTour}
                            style={{
                                borderRadius: '8px 0 0 8px',
                                background: '#1B3C53',
                                borderColor: '#1B3C53',
                                fontWeight: '600',
                                flex: 1
                            }}
                        >
                            Tour
                        </Button>
                        <Button
                            icon={<MessageOutlined />}
                            onClick={handleChat}
                            style={{
                                borderRadius: '0',
                                borderColor: '#1B3C53',
                                color: '#1B3C53',
                                fontWeight: '600',
                                flex: 1
                            }}
                        >
                            Chat
                        </Button>
                        <Button
                            type="primary"
                            icon={<EyeOutlined />}
                            onClick={handleViewDetails}
                            style={{
                                borderRadius: '0 8px 8px 0',
                                background: '#1890ff',
                                borderColor: '#1890ff',
                                fontWeight: '600',
                                flex: 1
                            }}
                        >
                            View
                        </Button>
                    </Space.Compact>
                </Space>
            </Card>
        </Badge.Ribbon>
    );
};

export default PropertyCard;