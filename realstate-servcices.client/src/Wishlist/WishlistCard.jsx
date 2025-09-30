// WishlistCard.jsx
import React from 'react';
import { Card, Tag, Typography, Space, Divider, Badge, Button } from 'antd';
import {
    EnvironmentOutlined,
    HeartFilled,
    StarFilled,
    CalendarOutlined,
    DeleteOutlined,
    EyeOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const WishlistCard = ({
    property,
    onRemoveFromWishlist,
    onScheduleTour,
    onViewDetails
}) => {
    const navigate = useNavigate();

    const handleCardClick = () => {
        if (onViewDetails) {
            onViewDetails(property.id);
        } else {
            navigate(`/property/${property.id}`);
        }
    };

    const handleRemoveClick = (e) => {
        e.stopPropagation();
        if (onRemoveFromWishlist) {
            onRemoveFromWishlist(property.id);
        }
    };

    const handleScheduleTour = (e) => {
        e.stopPropagation();
        if (onScheduleTour) {
            onScheduleTour(property);
        }
    };

    const formatPesoPrice = (price) => {
        if (price >= 1000000) {
            return `₱${(price / 1000000).toFixed(1)}M`;
        } else if (price >= 1000) {
            return `₱${(price / 1000).toFixed(0)}K`;
        }
        return `₱${price}`;
    };

    const getTimeAgo = (dateAdded) => {
        if (!dateAdded) return '';

        const now = new Date();
        const added = new Date(dateAdded);
        const diffTime = Math.abs(now - added);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return 'Added today';
        if (diffDays < 7) return `Added ${diffDays} days ago`;
        if (diffDays < 30) return `Added ${Math.floor(diffDays / 7)} weeks ago`;
        return `Added ${Math.floor(diffDays / 30)} months ago`;
    };

    return (
        <Badge.Ribbon
            text="In Wishlist"
            color="#10b981"
            style={{ display: property.featured ? 'none' : 'block' }}
        >
            <Card
                hoverable
                style={{
                    height: '100%',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: '2px solid #f0f9ff',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    position: 'relative'
                }}
                bodyStyle={{ padding: '20px' }}
                cover={
                    <div style={{ position: 'relative' }}>
                        <img
                            alt={property.title}
                            src={property.image}
                            style={{
                                height: '200px',
                                objectFit: 'cover',
                                width: '100%'
                            }}
                        />
                        {/* Wishlist Badge */}
                        <div
                            style={{
                                position: 'absolute',
                                top: '12px',
                                right: '12px',
                                background: '#10b981',
                                color: 'white',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '600'
                            }}
                        >
                            <HeartFilled style={{ marginRight: '4px' }} />
                            Saved
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
                                    fontWeight: '500'
                                }}
                            >
                                {property.propertyType}
                            </Tag>
                        </div>

                        {/* Rating */}
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

                        {/* Added Date */}
                        {property.dateAdded && (
                            <div style={{
                                position: 'absolute',
                                bottom: '12px',
                                right: '12px',
                                background: 'rgba(255, 255, 255, 0.9)',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                backdropFilter: 'blur(4px)'
                            }}>
                                <Text style={{ color: '#64748b', fontSize: '11px', fontWeight: '500' }}>
                                    {getTimeAgo(property.dateAdded)}
                                </Text>
                            </div>
                        )}
                    </div>
                }
                onClick={handleCardClick}
            >
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    {/* Title and Remove Button */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Title level={4} style={{
                            margin: 0,
                            fontSize: '16px',
                            lineHeight: '1.4',
                            color: '#1B3C53',
                            fontWeight: '600',
                            flex: 1,
                            marginRight: '12px'
                        }}>
                            {property.title}
                        </Title>

                        <Button
                            type="text"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={handleRemoveClick}
                            style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '6px'
                            }}
                        />
                    </div>

                    {/* Location */}
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <EnvironmentOutlined style={{ marginRight: '6px', color: '#64748b', fontSize: '12px' }} />
                        <Text type="secondary" style={{ fontSize: '13px', color: '#64748b' }}>
                            {property.location}
                        </Text>
                    </div>

                    <Divider style={{ margin: '12px 0', background: '#f1f5f9' }} />

                    {/* Price */}
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <Title level={3} style={{
                            margin: 0,
                            color: '#1B3C53',
                            fontSize: '20px',
                            fontWeight: '700'
                        }}>
                            {formatPesoPrice(property.price)}
                        </Title>
                        <Text type="secondary" style={{ fontSize: '11px', color: '#64748b' }}>
                            ₱{property.pricePerSqft?.toLocaleString()}/sq ft
                        </Text>
                    </Space>

                    <Divider style={{ margin: '12px 0', background: '#f1f5f9' }} />

                    {/* Property Features */}
                    <Space size="small" wrap>
                        <Tag style={{
                            background: '#f0f9ff',
                            border: '1px solid #1B3C53',
                            color: '#1B3C53',
                            borderRadius: '6px',
                            margin: 0,
                            fontSize: '11px'
                        }}>
                            {property.bedrooms} beds
                        </Tag>
                        <Tag style={{
                            background: '#f0f9ff',
                            border: '1px solid #1B3C53',
                            color: '#1B3C53',
                            borderRadius: '6px',
                            margin: 0,
                            fontSize: '11px'
                        }}>
                            {property.bathrooms} baths
                        </Tag>
                        <Tag style={{
                            background: '#f0f9ff',
                            border: '1px solid #1B3C53',
                            color: '#1B3C53',
                            borderRadius: '6px',
                            margin: 0,
                            fontSize: '11px'
                        }}>
                            {property.squareFeet.toLocaleString()} sq ft
                        </Tag>
                    </Space>

                    {/* Tags */}
                    <Space size={[4, 8]} wrap style={{ marginTop: '8px' }}>
                        {property.tags.slice(0, 2).map((tag, index) => (
                            <Tag key={index} style={{
                                background: '#f1f5f9',
                                color: '#475569',
                                border: 'none',
                                borderRadius: '6px',
                                margin: 0,
                                fontSize: '10px',
                                padding: '1px 6px'
                            }}>
                                {tag}
                            </Tag>
                        ))}
                        {property.tags.length > 2 && (
                            <Tag style={{
                                background: 'transparent',
                                color: '#64748b',
                                border: '1px dashed #cbd5e1',
                                borderRadius: '6px',
                                margin: 0,
                                fontSize: '10px',
                                padding: '1px 6px'
                            }}>
                                +{property.tags.length - 2} more
                            </Tag>
                        )}
                    </Space>

                    {/* Action Buttons */}
                    <Space size="small" style={{ width: '100%', marginTop: '12px' }}>
                        <Button
                            type="primary"
                            icon={<CalendarOutlined />}
                            onClick={handleScheduleTour}
                            style={{
                                flex: 1,
                                borderRadius: '8px',
                                background: '#1B3C53',
                                borderColor: '#1B3C53',
                                fontWeight: '600',
                                fontSize: '13px'
                            }}
                        >
                            Schedule Tour
                        </Button>

                        <Button
                            icon={<EyeOutlined />}
                            onClick={handleCardClick}
                            style={{
                                borderRadius: '8px',
                                borderColor: '#1B3C53',
                                color: '#1B3C53',
                                fontWeight: '500',
                                fontSize: '13px'
                            }}
                        >
                            View
                        </Button>
                    </Space>
                </Space>
            </Card>
        </Badge.Ribbon>
    );
};

export default WishlistCard;