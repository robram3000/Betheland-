
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Row, Col, Card, Typography, Button, Tag, Rate, Space } from 'antd';
import {
    HeartOutlined,
    HeartFilled,
    EnvironmentOutlined,
    ArrowsAltOutlined,
    CarOutlined,
    EyeOutlined,
    ShareAltOutlined,
    LeftOutlined,
    RightOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph, Text } = Typography;

const FeaturedProperties = () => {
    const navigate = useNavigate();
    const [favorites, setFavorites] = useState([]);
    const [centerIndex, setCenterIndex] = useState(2);
    const [isMobile, setIsMobile] = useState(false);
    const scrollContainerRef = useRef(null);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    // Minimum swipe distance
    const minSwipeDistance = 50;

    // Check if mobile on mount and resize
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => {
            window.removeEventListener('resize', checkMobile);
        };
    }, []);

    const toggleFavorite = (propertyId) => {
        if (favorites.includes(propertyId)) {
            setFavorites(favorites.filter(id => id !== propertyId));
        } else {
            setFavorites([...favorites, propertyId]);
        }
    };

    const scrollToIndex = (index) => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const card = container.children[index];
            if (card) {
                const cardWidth = card.offsetWidth;
                const gap = isMobile ? 16 : 24;
                const scrollPosition = index * (cardWidth + gap) - (container.offsetWidth - cardWidth) / 2;

                container.scrollTo({
                    left: scrollPosition,
                    behavior: 'smooth'
                });
                setCenterIndex(index);
            }
        }
    };

    const scrollLeft = () => {
        const newIndex = centerIndex > 0 ? centerIndex - 1 : 0;
        scrollToIndex(newIndex);
    };

    const scrollRight = () => {
        const newIndex = centerIndex < featuredProperties.length - 1 ? centerIndex + 1 : featuredProperties.length - 1;
        scrollToIndex(newIndex);
    };

    // Touch handlers for swipe gestures
    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            scrollRight();
        } else if (isRightSwipe) {
            scrollLeft();
        }
    };

    const featuredProperties = [
        {
            id: 1,
            title: 'Modern Condo in BGC',
            address: 'Fort Strip, Bonifacio Global City, Taguig',
            price: 8500000,
            priceSuffix: '',
            image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400',
            beds: 2,
            baths: 2,
            sqft: 45,
            parking: 1,
            type: 'Condominium',
            status: 'For Sale',
            rating: 4.8,
            reviews: 36,
            featured: true,
            hot: true,
            yearBuilt: 2022,
            amenities: ['Swimming Pool', 'Gym', '24/7 Security', 'Parking']
        },
        {
            id: 2,
            title: 'Makati CBD Office Space',
            address: 'Ayala Avenue, Makati City',
            price: 85000,
            priceSuffix: '/month',
            image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400',
            beds: 0,
            baths: 1,
            sqft: 32,
            parking: 1,
            type: 'Commercial',
            status: 'For Rent',
            rating: 4.7,
            reviews: 28,
            featured: true,
            new: true,
            yearBuilt: 2023,
            amenities: ['Air Conditioning', 'Internet Ready', 'Security', 'Elevator']
        },
        {
            id: 3,
            title: 'Quezon City Townhouse',
            address: 'Scout Area, Quezon City',
            price: 5200000,
            priceSuffix: '',
            image: 'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?w=400',
            beds: 3,
            baths: 2,
            sqft: 65,
            parking: 2,
            type: 'Townhouse',
            status: 'For Sale',
            rating: 4.6,
            reviews: 42,
            featured: true,
            reduced: true,
            yearBuilt: 2018,
            amenities: ['Garden', 'Garage', 'Gated Community', 'Pet Friendly']
        },
        {
            id: 4,
            title: 'Beachfront Villa in Palawan',
            address: 'Coron, Palawan',
            price: 25000,
            priceSuffix: '/night',
            image: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=400',
            beds: 4,
            baths: 3,
            sqft: 120,
            parking: 3,
            type: 'Vacation Rental',
            status: 'For Rent',
            rating: 4.9,
            reviews: 67,
            featured: true,
            hot: true,
            yearBuilt: 2021,
            amenities: ['Beach Access', 'Private Pool', 'Free WiFi', 'Air Conditioning']
        },
        {
            id: 5,
            title: 'Alabang Subdivision House',
            address: 'Ayala Alabang Village, Muntinlupa',
            price: 18500000,
            priceSuffix: '',
            image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400',
            beds: 5,
            baths: 4,
            sqft: 280,
            parking: 3,
            type: 'Single Family Home',
            status: 'For Sale',
            rating: 4.8,
            reviews: 23,
            featured: true,
            new: true,
            yearBuilt: 2020,
            amenities: ['Pool', 'Garden', 'Security', 'Clubhouse Access']
        },
        {
            id: 6,
            title: 'Ortigas Center Studio',
            address: 'Emerald Avenue, Ortigas Center, Pasig',
            price: 18000,
            priceSuffix: '/month',
            image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
            beds: 1,
            baths: 1,
            sqft: 28,
            parking: 0,
            type: 'Studio',
            status: 'For Rent',
            rating: 4.5,
            reviews: 45,
            featured: true,
            reduced: true,
            yearBuilt: 2019,
            amenities: ['Fully Furnished', 'WiFi', 'Security', 'Laundry']
        },
        {
            id: 7,
            title: 'Cebu City Apartment',
            address: 'Lahug, Cebu City',
            price: 35000,
            priceSuffix: '/month',
            image: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=400',
            beds: 2,
            baths: 2,
            sqft: 55,
            parking: 1,
            type: 'Apartment',
            status: 'For Rent',
            rating: 4.7,
            reviews: 38,
            featured: true,
            hot: true,
            yearBuilt: 2022,
            amenities: ['Fully Furnished', 'Air Conditioning', 'Balcony', 'Security']
        },
        {
            id: 8,
            title: 'Davao Farm Lot',
            address: 'Calinan, Davao City',
            price: 2500000,
            priceSuffix: '',
            image: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ce?w=400',
            beds: 0,
            baths: 0,
            sqft: 5000,
            parking: 0,
            type: 'Agricultural Land',
            status: 'For Sale',
            rating: 4.4,
            reviews: 19,
            featured: true,
            new: true,
            yearBuilt: 0,
            amenities: ['Fenced', 'Road Access', 'Water Source', 'Fruit Trees']
        }
    ];

    const formatPrice = (price) => {
        if (price >= 1000000) {
            return `₱${(price / 1000000).toFixed(1)}M`;
        } else if (price >= 1000) {
            return `₱${(price / 1000).toFixed(0)}K`;
        }
        return `₱${price.toLocaleString()}`;
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
            <path d="M7 14c1.66 0 3-1.34 3-3S8.66 8 7 8s-3 1.34-3 3 1.34 3 3 3zm0-4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm12-3h-8v8H3V7H1v10h22v-6c0-2.21-1.79-4-4-4zM5 16h14v-2H5v2z" />
        </svg>
    );

    const BathIcon = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 12c0-.55.45-1 1-1s1 .45 1 1-.45 1-1 1-1-.45-1-1zm4 0c0-.55.45-1 1-1s1 .45 1 1-.45 1-1 1-1-.45-1-1zm4 0c0-.55.45-1 1-1s1 .45 1 1-.45 1-1 1-1-.45-1-1zm5 3v2c0 1.1-.9 2-2 2h-2v2H8v-2H6c-1.1 0-2-.9-2-2v-2H3v-2h18v2h-1zM6 16h12v-2H6v2z" />
        </svg>
    );

    const getCardStyle = (index) => {
        const isCenterCard = index === centerIndex;

        if (isMobile) {
            if (isCenterCard) {
                return {
                    minWidth: isMobile ? '280px' : '320px',
                    flexShrink: 0,
                    transform: 'scale(1)',
                    zIndex: 5,
                    transition: 'all 0.3s ease'
                };
            }
            return {
                minWidth: isMobile ? '240px' : '280px',
                flexShrink: 0,
                transform: 'scale(0.85)',
                opacity: 0.6,
                transition: 'all 0.3s ease'
            };
        }

        if (isCenterCard) {
            return {
                minWidth: '380px',
                flexShrink: 0,
                transform: 'scale(1.05)',
                zIndex: 5,
                transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            };
        }

        return {
            minWidth: '320px',
            flexShrink: 0,
            transform: 'scale(0.92)',
            opacity: 0.7,
            transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        };
    };

    const getCardContentStyle = (index) => {
        const isCenterCard = index === centerIndex;

        if (isMobile) {
            return {
                height: '100%',
                border: 'none',
                borderRadius: '16px',
                boxShadow: isCenterCard ? '0 8px 24px rgba(0, 0, 0, 0.2)' : '0 4px 12px rgba(0, 0, 0, 0.15)',
                overflow: 'hidden',
                position: 'relative',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                border: isCenterCard ? '1px solid #001529' : '1px solid #e8e8e8'
            };
        }

        if (isCenterCard) {
            return {
                height: '100%',
                border: 'none',
                borderRadius: '20px',
                boxShadow: '0 16px 40px rgba(0, 0, 0, 0.25)',
                overflow: 'hidden',
                position: 'relative',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                border: '2px solid #001529'
            };
        }

        return {
            height: '100%',
            border: 'none',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            overflow: 'hidden',
            position: 'relative',
        };
    };

    const getImageStyle = (index) => {
        const isCenterCard = index === centerIndex;

        if (isMobile) {
            return {
                height: isCenterCard ? '200px' : '160px',
                width: '100%',
                objectFit: 'cover',
            };
        }

        if (isCenterCard) {
            return {
                height: '260px',
                width: '100%',
                objectFit: 'cover',
            };
        }

        return {
            height: '200px',
            width: '100%',
            objectFit: 'cover',
        };
    };

    const getTitleStyle = (index) => {
        const isCenterCard = index === centerIndex;

        if (isMobile) {
            return {
                margin: '8px 0',
                color: '#001529',
                fontSize: isCenterCard ? '14px' : '12px',
                lineHeight: '1.4',
                height: isCenterCard ? '40px' : '32px',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                fontWeight: isCenterCard ? '600' : '500'
            };
        }

        if (isCenterCard) {
            return {
                margin: '12px 0',
                color: '#001529',
                fontSize: '18px',
                lineHeight: '1.4',
                height: '50px',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                fontWeight: '700'
            };
        }

        return {
            margin: '8px 0',
            color: '#001529',
            fontSize: '15px',
            lineHeight: '1.4',
            height: '42px',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            fontWeight: '500'
        };
    };

    return (
        <section style={{
            padding: isMobile ? '40px 16px' : '80px 24px',
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            position: 'relative'
        }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative' }}>

                {/* Header */}
                <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center', marginBottom: isMobile ? '2rem' : '3rem' }}>
                    <Title level={2} style={{
                        color: '#001529',
                        fontSize: isMobile ? '1.75rem' : '2.5rem',
                        fontWeight: '700',
                        margin: 0
                    }}>
                        Featured Properties in Philippines
                    </Title>
                    <Paragraph style={{
                        fontSize: isMobile ? '0.9rem' : '1.1rem',
                        color: '#666',
                        maxWidth: '700px',
                        margin: '0 auto',
                        lineHeight: '1.6'
                    }}>
                        Discover our handpicked properties across the Philippines.
                        Each offers excellent value and unique features in prime locations.
                    </Paragraph>
                </Space>

                {/* Navigation Arrows - Hidden on mobile */}
                {!isMobile && (
                    <>
                        <Button
                            type="primary"
                            shape="circle"
                            icon={<LeftOutlined />}
                            onClick={scrollLeft}
                            disabled={centerIndex === 0}
                            style={{
                                position: 'absolute',
                                left: '-60px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                zIndex: 10,
                                width: '50px',
                                height: '50px',
                                background: 'linear-gradient(135deg, #001529 0%, #003366 100%)',
                                border: 'none',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                                opacity: centerIndex === 0 ? 0.5 : 1
                            }}
                        />
                        <Button
                            type="primary"
                            shape="circle"
                            icon={<RightOutlined />}
                            onClick={scrollRight}
                            disabled={centerIndex === featuredProperties.length - 1}
                            style={{
                                position: 'absolute',
                                right: '-60px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                zIndex: 10,
                                width: '50px',
                                height: '50px',
                                background: 'linear-gradient(135deg, #001529 0%, #003366 100%)',
                                border: 'none',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                                opacity: centerIndex === featuredProperties.length - 1 ? 0.5 : 1
                            }}
                        />
                    </>
                )}

                {/* Properties Slider */}
                <div
                    ref={scrollContainerRef}
                    style={{
                        display: 'flex',
                        overflowX: 'auto',
                        gap: isMobile ? '16px' : '24px',
                        padding: isMobile ? '40px 10px' : '60px 20px',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        alignItems: 'center',
                        scrollBehavior: 'smooth',
                        cursor: isMobile ? 'grab' : 'auto'
                    }}
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                >
                    {featuredProperties.map((property, index) => (
                        <div
                            key={property.id}
                            style={getCardStyle(index)}
                            onClick={() => scrollToIndex(index)}
                        >
                            <Card
                                hoverable={!isMobile}
                                style={getCardContentStyle(index)}
                                cover={
                                    <div style={{ position: 'relative' }}>
                                        <img
                                            alt={property.title}
                                            src={property.image}
                                            style={getImageStyle(index)}
                                        />
                                        <div style={{
                                            position: 'absolute',
                                            top: isMobile ? '12px' : '16px',
                                            left: isMobile ? '12px' : '16px',
                                            right: isMobile ? '12px' : '16px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start'
                                        }}>
                                            <div>
                                                {getStatusTag(property)}
                                                {property.featured && !isMobile && (
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
                                                        <HeartFilled style={{ color: '#ff4d4f', fontSize: isMobile ? '16px' : '18px' }} />
                                                    ) : (
                                                        <HeartOutlined style={{ color: 'white', fontSize: isMobile ? '16px' : '18px' }} />
                                                    )
                                                }
                                                style={{
                                                    background: 'rgba(255, 255, 255, 0.9)',
                                                    backdropFilter: 'blur(4px)',
                                                    width: isMobile ? '28px' : '32px',
                                                    height: isMobile ? '28px' : '32px'
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleFavorite(property.id);
                                                }}
                                            />
                                        </div>
                                        <div style={{
                                            position: 'absolute',
                                            bottom: isMobile ? '12px' : '16px',
                                            left: isMobile ? '12px' : '16px',
                                            right: isMobile ? '12px' : '16px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <Tag color="#001529" style={{
                                                color: 'white',
                                                fontWeight: 'bold',
                                                border: 'none',
                                                padding: isMobile ? '6px 12px' : index === centerIndex ? '10px 24px' : '6px 16px',
                                                fontSize: isMobile ? '12px' : index === centerIndex ? '16px' : '14px',
                                                borderRadius: '20px',
                                            }}>
                                                {formatPrice(property.price)}{property.priceSuffix}
                                            </Tag>
                                        </div>
                                    </div>
                                }
                                bodyStyle={{ padding: isMobile ? '16px' : index === centerIndex ? '28px' : '20px' }}
                            >
                                {/* Property Type */}
                                <Text type="secondary" style={{
                                    fontSize: isMobile ? '10px' : '12px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    fontWeight: '600'
                                }}>
                                    {property.type}
                                </Text>

                                {/* Title */}
                                <Title level={4} style={getTitleStyle(index)}>
                                    {property.title}
                                </Title>

                                {/* Address */}
                                <Space size="small" style={{ marginBottom: '12px', height: isMobile ? '32px' : '40px', overflow: 'hidden' }}>
                                    <EnvironmentOutlined style={{ color: '#666', flexShrink: 0, fontSize: isMobile ? '12px' : '14px' }} />
                                    <Text type="secondary" style={{ fontSize: isMobile ? '11px' : '13px', lineHeight: '1.3' }}>
                                        {property.address}
                                    </Text>
                                </Space>

                                {/* Rating */}
                                <Space size="small" style={{ marginBottom: '12px' }}>
                                    <Rate
                                        disabled
                                        defaultValue={property.rating}
                                        style={{ fontSize: isMobile ? '12px' : '14px' }}
                                    />
                                    <Text type="secondary" style={{ fontSize: isMobile ? '10px' : '12px' }}>
                                        ({property.reviews})
                                    </Text>
                                </Space>

                                {/* Property Features */}
                                <Row gutter={[8, 6]} style={{ marginBottom: isMobile ? '12px' : '20px' }}>
                                    <Col span={6}>
                                        <Space direction="vertical" size={2} align="center" style={{ width: '100%' }}>
                                            <div style={{ color: '#001529' }}>
                                                <BedIcon />
                                            </div>
                                            <Text strong style={{ fontSize: isMobile ? '10px' : '12px', color: '#001529' }}>
                                                {property.beds}
                                            </Text>
                                            <Text type="secondary" style={{ fontSize: isMobile ? '8px' : '10px' }}>Beds</Text>
                                        </Space>
                                    </Col>
                                    <Col span={6}>
                                        <Space direction="vertical" size={2} align="center" style={{ width: '100%' }}>
                                            <div style={{ color: '#001529' }}>
                                                <BathIcon />
                                            </div>
                                            <Text strong style={{ fontSize: isMobile ? '10px' : '12px', color: '#001529' }}>
                                                {property.baths}
                                            </Text>
                                            <Text type="secondary" style={{ fontSize: isMobile ? '8px' : '10px' }}>Baths</Text>
                                        </Space>
                                    </Col>
                                    <Col span={6}>
                                        <Space direction="vertical" size={2} align="center" style={{ width: '100%' }}>
                                            <ArrowsAltOutlined style={{ color: '#001529', fontSize: isMobile ? '12px' : '14px' }} />
                                            <Text strong style={{ fontSize: isMobile ? '10px' : '12px', color: '#001529' }}>
                                                {property.sqft}
                                            </Text>
                                            <Text type="secondary" style={{ fontSize: isMobile ? '8px' : '10px' }}>SQM</Text>
                                        </Space>
                                    </Col>
                                    <Col span={6}>
                                        <Space direction="vertical" size={2} align="center" style={{ width: '100%' }}>
                                            <CarOutlined style={{ color: '#001529', fontSize: isMobile ? '12px' : '14px' }} />
                                            <Text strong style={{ fontSize: isMobile ? '10px' : '12px', color: '#001529' }}>
                                                {property.parking}
                                            </Text>
                                            <Text type="secondary" style={{ fontSize: isMobile ? '8px' : '10px' }}>Parking</Text>
                                        </Space>
                                    </Col>
                                </Row>

                                {/* Amenities - Hidden on mobile for non-center cards */}
                                {(isMobile && index === centerIndex) || !isMobile ? (
                                    <div style={{ marginBottom: isMobile ? '12px' : '20px', minHeight: isMobile ? '32px' : '40px' }}>
                                        <Space size={[4, 4]} wrap>
                                            {property.amenities.slice(0, isMobile ? 2 : 3).map((amenity, index) => (
                                                <Tag key={index} style={{
                                                    fontSize: isMobile ? '9px' : '10px',
                                                    padding: isMobile ? '1px 6px' : '2px 8px',
                                                    background: 'rgba(0, 21, 41, 0.08)',
                                                    border: 'none',
                                                    borderRadius: '12px',
                                                    color: '#001529'
                                                }}>
                                                    {amenity}
                                                </Tag>
                                            ))}
                                            {property.amenities.length > (isMobile ? 2 : 3) && (
                                                <Tag style={{
                                                    fontSize: isMobile ? '9px' : '10px',
                                                    padding: isMobile ? '1px 6px' : '2px 8px',
                                                    background: 'rgba(0, 21, 41, 0.08)',
                                                    border: 'none',
                                                    borderRadius: '12px',
                                                    color: '#001529'
                                                }}>
                                                    +{property.amenities.length - (isMobile ? 2 : 3)}
                                                </Tag>
                                            )}
                                        </Space>
                                    </div>
                                ) : null}

                                {/* Action Buttons */}
                                <Row gutter={6}>
                                    <Col span={isMobile ? 24 : 12}>
                                        <Button
                                            type="primary"
                                            block
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/properties/${property.id}`);
                                            }}
                                            style={{
                                                background: 'linear-gradient(135deg, #001529 0%, #003366 100%)',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontWeight: '600',
                                                height: isMobile ? '32px' : '36px',
                                                fontSize: isMobile ? '12px' : '14px'
                                            }}
                                        >
                                            View Details
                                        </Button>
                                    </Col>
                                    {!isMobile && (
                                        <>
                                            <Col span={6}>
                                                <Button
                                                    icon={<EyeOutlined />}
                                                    block
                                                    style={{
                                                        borderColor: '#001529',
                                                        color: '#001529',
                                                        borderRadius: '8px',
                                                        height: '36px'
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
                                                        borderRadius: '8px',
                                                        height: '36px'
                                                    }}
                                                />
                                            </Col>
                                        </>
                                    )}
                                </Row>
                            </Card>
                        </div>
                    ))}
                </div>

                {/* Dots Indicator */}
                <div style={{ textAlign: 'center', marginTop: isMobile ? '16px' : '20px' }}>
                    <Space size="small">
                        {featuredProperties.map((_, index) => (
                            <div
                                key={index}
                                onClick={() => scrollToIndex(index)}
                                style={{
                                    width: index === centerIndex ? (isMobile ? '20px' : '24px') : (isMobile ? '6px' : '8px'),
                                    height: isMobile ? '6px' : '8px',
                                    borderRadius: '4px',
                                    background: index === centerIndex ? '#001529' : '#ccc',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                            />
                        ))}
                    </Space>
                </div>

                {/* View All Button */}
                <div style={{ textAlign: 'center', marginTop: isMobile ? '2rem' : '3rem' }}>
                    <Button
                        type="primary"
                        size="large"
                        onClick={() => navigate('/properties')}
                        style={{
                            height: isMobile ? '44px' : '50px',
                            padding: isMobile ? '0 32px' : '0 40px',
                            fontSize: isMobile ? '14px' : '16px',
                            background: 'linear-gradient(135deg, #001529 0%, #003366 100%)',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            boxShadow: '0 4px 12px rgba(0, 21, 41, 0.3)'
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