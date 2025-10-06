// FeaturedProperties.jsx
import React from 'react';
import { Row, Col, Card, Typography, Button, Tag, Rate, Space } from 'antd';
import {
    HeartOutlined,
    HeartFilled,
    EnvironmentOutlined,
    ArrowsAltOutlined,
    CarOutlined,
    EyeOutlined,
    ShareAltOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph, Text } = Typography;

const FeaturedProperties = () => {
    const navigate = useNavigate();
    const [favorites, setFavorites] = React.useState([]);

    const toggleFavorite = (propertyId) => {
        if (favorites.includes(propertyId)) {
            setFavorites(favorites.filter(id => id !== propertyId));
        } else {
            setFavorites([...favorites, propertyId]);
        }
    };

    const featuredProperties = [
        {
            id: 1,
            title: 'Modern Luxury Villa',
            address: '123 Palm Street, Miami, FL',
            price: 1250000,
            priceSuffix: '',
            image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=400',
            beds: 4,
            baths: 3,
            sqft: 3200,
            parking: 2,
            type: 'Villa',
            status: 'For Sale',
            rating: 4.8,
            reviews: 42,
            featured: true,
            hot: true,
            yearBuilt: 2022,
            amenities: ['Pool', 'Garden', 'Garage', 'Security']
        },
        {
            id: 2,
            title: 'Downtown Penthouse',
            address: '456 Sky Avenue, New York, NY',
            price: 2850,
            priceSuffix: '/month',
            image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400',
            beds: 2,
            baths: 2,
            sqft: 1800,
            parking: 1,
            type: 'Apartment',
            status: 'For Rent',
            rating: 4.9,
            reviews: 38,
            featured: true,
            new: true,
            yearBuilt: 2023,
            amenities: ['Gym', 'Pool', 'Concierge', 'Roof Terrace']
        },
        {
            id: 3,
            title: 'Family Townhouse',
            address: '789 Oak Lane, Austin, TX',
            price: 750000,
            priceSuffix: '',
            image: 'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?w=400',
            beds: 3,
            baths: 2.5,
            sqft: 2200,
            parking: 2,
            type: 'Townhouse',
            status: 'For Sale',
            rating: 4.7,
            reviews: 29,
            featured: true,
            yearBuilt: 2019,
            amenities: ['Backyard', 'Patio', 'Storage', 'Pet Friendly']
        },
        {
            id: 4,
            title: 'Beachfront Condo',
            address: '321 Ocean Drive, Miami, FL',
            price: 3200,
            priceSuffix: '/month',
            image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
            beds: 3,
            baths: 2,
            sqft: 1600,
            parking: 1,
            type: 'Condo',
            status: 'For Rent',
            rating: 4.6,
            reviews: 51,
            featured: true,
            reduced: true,
            yearBuilt: 2021,
            amenities: ['Beach Access', 'Balcony', 'Pool', 'Fitness Center']
        }
    ];

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const getStatusTag = (property) => {
        if (property.hot) return <Tag color="red">Hot</Tag>;
        if (property.new) return <Tag color="blue">New</Tag>;
        if (property.reduced) return <Tag color="green">Reduced</Tag>;
        return <Tag color="orange">{property.status}</Tag>;
    };

    // Custom SVG icons for beds and baths
    const BedIcon = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 14c1.66 0 3-1.34 3-3S8.66 8 7 8s-3 1.34-3 3 1.34 3 3 3zm0-4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm12-3h-8v8H3V7H1v10h22v-6c0-2.21-1.79-4-4-4zM5 16h14v-2H5v2z"/>
        </svg>
    );

    const BathIcon = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 12c0-.55.45-1 1-1s1 .45 1 1-.45 1-1 1-1-.45-1-1zm4 0c0-.55.45-1 1-1s1 .45 1 1-.45 1-1 1-1-.45-1-1zm4 0c0-.55.45-1 1-1s1 .45 1 1-.45 1-1 1-1-.45-1-1zm5 3v2c0 1.1-.9 2-2 2h-2v2H8v-2H6c-1.1 0-2-.9-2-2v-2H3v-2h18v2h-1zM6 16h12v-2H6v2z"/>
        </svg>
    );

    return (
        <section style={{
            padding: '100px 24px',
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header */}
                <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center', marginBottom: '4rem' }}>
                    <Title level={2} style={{ color: '#001529', fontSize: '2.5rem' }}>
                        Featured Properties
                    </Title>
                    <Paragraph style={{
                        fontSize: '1.1rem',
                        color: '#666',
                        maxWidth: '600px',
                        margin: '0 auto'
                    }}>
                        Discover our handpicked selection of premium properties.
                        Each offering exceptional value and unique features.
                    </Paragraph>
                </Space>

                {/* Properties Grid */}
                <Row gutter={[32, 32]}>
                    {featuredProperties.map((property) => (
                        <Col xs={24} md={12} lg={6} key={property.id}>
                            <Card
                                hoverable
                                style={{
                                    height: '100%',
                                    border: 'none',
                                    borderRadius: '16px',
                                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                                    overflow: 'hidden',
                                    position: 'relative'
                                }}
                                cover={
                                    <div style={{ position: 'relative' }}>
                                        <img
                                            alt={property.title}
                                            src={property.image}
                                            style={{
                                                height: '220px',
                                                width: '100%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                        <div style={{
                                            position: 'absolute',
                                            top: '16px',
                                            left: '16px',
                                            right: '16px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start'
                                        }}>
                                            <div>
                                                {getStatusTag(property)}
                                                {property.featured && (
                                                    <Tag color="gold" style={{ marginLeft: '8px' }}>
                                                        Featured
                                                    </Tag>
                                                )}
                                            </div>
                                            <Button
                                                type="text"
                                                shape="circle"
                                                icon={
                                                    favorites.includes(property.id) ? (
                                                        <HeartFilled style={{ color: '#ff4d4f', fontSize: '18px' }} />
                                                    ) : (
                                                        <HeartOutlined style={{ color: 'white', fontSize: '18px' }} />
                                                    )
                                                }
                                                style={{
                                                    background: 'rgba(255, 255, 255, 0.9)',
                                                    backdropFilter: 'blur(4px)'
                                                }}
                                                onClick={() => toggleFavorite(property.id)}
                                            />
                                        </div>
                                        <div style={{
                                            position: 'absolute',
                                            bottom: '16px',
                                            left: '16px',
                                            right: '16px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <Tag color="#001529" style={{
                                                color: 'white',
                                                fontWeight: 'bold',
                                                border: 'none',
                                                padding: '4px 12px'
                                            }}>
                                                {formatPrice(property.price)}{property.priceSuffix}
                                            </Tag>
                                        </div>
                                    </div>
                                }
                                bodyStyle={{ padding: '20px' }}
                            >
                                {/* Property Type */}
                                <Text type="secondary" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    {property.type}
                                </Text>

                                {/* Title */}
                                <Title level={4} style={{ margin: '8px 0', color: '#001529', fontSize: '18px' }}>
                                    {property.title}
                                </Title>

                                {/* Address */}
                                <Space size="small" style={{ marginBottom: '16px' }}>
                                    <EnvironmentOutlined style={{ color: '#666' }} />
                                    <Text type="secondary" style={{ fontSize: '14px' }}>
                                        {property.address}
                                    </Text>
                                </Space>

                                {/* Rating */}
                                <Space size="small" style={{ marginBottom: '16px' }}>
                                    <Rate
                                        disabled
                                        defaultValue={property.rating}
                                        style={{ fontSize: '14px' }}
                                    />
                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                        ({property.reviews})
                                    </Text>
                                </Space>

                                {/* Property Features */}
                                <Row gutter={[16, 8]} style={{ marginBottom: '20px' }}>
                                    <Col span={6}>
                                        <Space direction="vertical" size={2} align="center" style={{ width: '100%' }}>
                                            <div style={{ color: '#001529' }}>
                                                <BedIcon />
                                            </div>
                                            <Text strong style={{ fontSize: '12px', color: '#001529' }}>
                                                {property.beds}
                                            </Text>
                                            <Text type="secondary" style={{ fontSize: '10px' }}>Beds</Text>
                                        </Space>
                                    </Col>
                                    <Col span={6}>
                                        <Space direction="vertical" size={2} align="center" style={{ width: '100%' }}>
                                            <div style={{ color: '#001529' }}>
                                                <BathIcon />
                                            </div>
                                            <Text strong style={{ fontSize: '12px', color: '#001529' }}>
                                                {property.baths}
                                            </Text>
                                            <Text type="secondary" style={{ fontSize: '10px' }}>Baths</Text>
                                        </Space>
                                    </Col>
                                    <Col span={6}>
                                        <Space direction="vertical" size={2} align="center" style={{ width: '100%' }}>
                                            <ArrowsAltOutlined style={{ color: '#001529' }} />
                                            <Text strong style={{ fontSize: '12px', color: '#001529' }}>
                                                {property.sqft}
                                            </Text>
                                            <Text type="secondary" style={{ fontSize: '10px' }}>Sq Ft</Text>
                                        </Space>
                                    </Col>
                                    <Col span={6}>
                                        <Space direction="vertical" size={2} align="center" style={{ width: '100%' }}>
                                            <CarOutlined style={{ color: '#001529' }} />
                                            <Text strong style={{ fontSize: '12px', color: '#001529' }}>
                                                {property.parking}
                                            </Text>
                                            <Text type="secondary" style={{ fontSize: '10px' }}>Parking</Text>
                                        </Space>
                                    </Col>
                                </Row>

                                {/* Amenities */}
                                <div style={{ marginBottom: '20px' }}>
                                    <Space size={[4, 4]} wrap>
                                        {property.amenities.slice(0, 3).map((amenity, index) => (
                                            <Tag key={index} style={{
                                                fontSize: '10px',
                                                padding: '2px 8px',
                                                background: 'rgba(0, 21, 41, 0.08)',
                                                border: 'none',
                                                borderRadius: '12px'
                                            }}>
                                                {amenity}
                                            </Tag>
                                        ))}
                                        {property.amenities.length > 3 && (
                                            <Tag style={{
                                                fontSize: '10px',
                                                padding: '2px 8px',
                                                background: 'rgba(0, 21, 41, 0.08)',
                                                border: 'none',
                                                borderRadius: '12px'
                                            }}>
                                                +{property.amenities.length - 3}
                                            </Tag>
                                        )}
                                    </Space>
                                </div>

                                {/* Action Buttons */}
                                <Row gutter={8}>
                                    <Col span={12}>
                                        <Button
                                            type="primary"
                                            block
                                            onClick={() => navigate(`/properties/${property.id}`)}
                                            style={{
                                                background: 'linear-gradient(135deg, #001529 0%, #003366 100%)',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontWeight: '600'
                                            }}
                                        >
                                            View Details
                                        </Button>
                                    </Col>
                                    <Col span={6}>
                                        <Button
                                            icon={<EyeOutlined />}
                                            block
                                            style={{
                                                borderColor: '#001529',
                                                color: '#001529',
                                                borderRadius: '8px'
                                            }}
                                        />
                                    </Col>
                                    <Col span={6}>
                                        <Button
                                            icon={<ShareAltOutlined />}
                                            block
                                            style={{
                                                borderColor: '#001529',
                                                color: '#001529',
                                                borderRadius: '8px'
                                            }}
                                        />
                                    </Col>
                                </Row>
                            </Card>
                        </Col>
                    ))}
                </Row>

                {/* View All Button */}
                <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                    <Button
                        type="primary"
                        size="large"
                        onClick={() => navigate('/properties')}
                        style={{
                            height: '50px',
                            padding: '0 40px',
                            fontSize: '16px',
                            background: 'linear-gradient(135deg, #001529 0%, #003366 100%)',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600'
                        }}
                    >
                        View All Properties
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default FeaturedProperties;