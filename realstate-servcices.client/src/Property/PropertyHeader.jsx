import React, { useState, useEffect } from 'react';
import { Row, Col, Typography, Rate, Tag, Button, Space, Avatar, Skeleton } from 'antd';
import { EnvironmentOutlined, HeartOutlined, HeartFilled, CalendarOutlined, ShareAltOutlined, MessageOutlined, UserOutlined } from '@ant-design/icons';
import { agentService } from './Services/GetAgent';

const { Title, Text } = Typography;

const PropertyHeader = ({ property }) => {
    const [isFavorite, setIsFavorite] = useState(false);
    const [agent, setAgent] = useState(null);
    const [loadingAgent, setLoadingAgent] = useState(false);

    // Fetch agent information
    useEffect(() => {
        const fetchAgent = async () => {
            if (!property?.agentId) {
                setAgent(null);
                return;
            }

            try {
                setLoadingAgent(true);
                const agentData = await agentService.getAgentById(property.agentId);
                setAgent(agentData);
            } catch (error) {
                console.error('Error fetching agent:', error);
                setAgent(null);
            } finally {
                setLoadingAgent(false);
            }
        };

        fetchAgent();
    }, [property?.agentId]);

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

    // Process agent image URL
    const processAgentImageUrl = (url) => {
        if (!url || url === 'string') {
            return '/default-avatar.jpg';
        }

        if (url.startsWith('http') || url.startsWith('//') || url.startsWith('blob:')) {
            return url;
        }

        if (url.startsWith('/uploads/')) {
            return `https://localhost:7075${url}`;
        }

        if (url.includes('.') && !url.startsWith('/')) {
            return `https://localhost:7075/uploads/agents/${url}`;
        }

        if (url.startsWith('uploads/')) {
            return `https://localhost:7075/${url}`;
        }

        return '/default-avatar.jpg';
    };

    const agentName = agent ? `${agent.FirstName} ${agent.LastName}`.trim() : 'Unknown Agent';
    const agentImage = agent ? processAgentImageUrl(agent.BaseMember?.profilePictureUrl) : '/default-avatar.jpg';
    const brokerageName = agent?.BrokerageName || 'Real Estate Company';
    const agentLicense = agent?.LicenseNumber ? `License: ${agent.LicenseNumber}` : 'Licensed Agent';

    return (
        <div style={{ padding: '40px 0', background: 'linear-gradient(135deg, #001529 0%, #003366 100%)' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
                <Row gutter={[32, 16]} align="middle">
                    <Col xs={24} md={16}>
                        <Title level={1} style={{ color: 'white' }}>{property.title || 'Property Title'}</Title>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                            <EnvironmentOutlined style={{ marginRight: '8px', color: 'rgba(255, 255, 255, 0.9)' }} />
                            <Text style={{ color: 'rgba(255, 255, 255, 0.9)' }}>{property.location || property.address || 'Location not specified'}</Text>
                        </div>
                        <Rate disabled defaultValue={property.rating || 4.5} allowHalf style={{ marginBottom: '16px', color: '#fadb14' }} />
                        <div>
                            <Tag color="white" style={{ color: '#001529' }}>{property.propertyType || 'Property'}</Tag>
                            <Tag color="white" style={{ color: '#001529' }}>{property.bedrooms || 0} Bedrooms</Tag>
                            <Tag color="white" style={{ color: '#001529' }}>{property.bathrooms || 0} Bathrooms</Tag>
                            {property.status && <Tag color={property.status === 'available' ? 'white' : 'red'} style={{ color: property.status === 'available' ? '#001529' : 'white' }}>{property.status}</Tag>}
                        </div>
                    </Col>
                    <Col xs={24} md={8}>
                        <div style={{ textAlign: 'right' }}>
                            {/* Agent Section */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: '16px' }}>
                                <div style={{ textAlign: 'right', marginRight: '12px' }}>
                                    <Text style={{ color: 'rgba(255, 255, 255, 0.9)', display: 'block', fontSize: '14px' }}>
                                        Listed by
                                    </Text>
                                    {loadingAgent ? (
                                        <Skeleton paragraph={{ rows: 1 }} />
                                    ) : (
                                        <>
                                            <Text strong style={{ color: 'white', fontSize: '16px' }}>
                                                {agentName}
                                            </Text>
                                            <Text style={{ color: 'rgba(255, 255, 255, 0.7)', display: 'block', fontSize: '12px' }}>
                                                {brokerageName}
                                            </Text>
                                            {agentLicense && (
                                                <Text style={{ color: 'rgba(255, 255, 255, 0.6)', display: 'block', fontSize: '10px' }}>
                                                    {agentLicense}
                                                </Text>
                                            )}
                                        </>
                                    )}
                                </div>
                                <Avatar
                                    size={60}
                                    src={agentImage}
                                    icon={!agentImage && <UserOutlined />}
                                    style={{
                                        border: '3px solid rgba(255, 255, 255, 0.3)',
                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                                    }}
                                    onError={(e) => {
                                        e.target.src = '/default-avatar.jpg';
                                    }}
                                />
                            </div>

                            {/* Price Section */}
                            <Title level={2} style={{ color: 'white', margin: 0 }}>
                                {formatPesoPrice(property.price)}
                            </Title>
                            {property.areaSqft && (
                                <Text style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                                    ₱{Math.round(property.price / property.areaSqft).toLocaleString()}/sq ft
                                </Text>
                            )}

                            {/* Action Buttons */}
                            <Space direction="vertical" style={{ width: '100%', marginTop: '16px' }} size="small">
                                <Button
                                    type="primary"
                                    icon={<CalendarOutlined />}
                                    size="large"
                                    onClick={handleScheduleTour}
                                    style={{
                                        width: '100%',
                                        borderRadius: '8px',
                                        background: 'white',
                                        color: '#001529',
                                        border: 'none',
                                        fontWeight: '600'
                                    }}
                                >
                                    Schedule a Tour
                                </Button>

                                <Button
                                    icon={<MessageOutlined />}
                                    size="large"
                                    onClick={handleChat}
                                    style={{
                                        width: '100%',
                                        borderRadius: '8px',
                                        background: 'transparent',
                                        color: 'white',
                                        border: '2px solid rgba(255, 255, 255, 0.3)'
                                    }}
                                >
                                    Chat with Agent
                                </Button>

                                <Space.Compact style={{ width: '100%' }}>
                                    <Button
                                        icon={isFavorite ? <HeartFilled /> : <HeartOutlined />}
                                        onClick={toggleFavorite}
                                        style={{
                                            borderRadius: '8px 0 0 8px',
                                            color: isFavorite ? '#ff4d4f' : 'white',
                                            background: 'rgba(255, 255, 255, 0.1)',
                                            border: '1px solid rgba(255, 255, 255, 0.3)'
                                        }}
                                    >
                                        {isFavorite ? 'Saved' : 'Save'}
                                    </Button>
                                    <Button
                                        icon={<ShareAltOutlined />}
                                        onClick={handleShare}
                                        style={{
                                            borderRadius: '0 8px 8px 0',
                                            background: 'rgba(255, 255, 255, 0.1)',
                                            border: '1px solid rgba(255, 255, 255, 0.3)',
                                            color: 'white'
                                        }}
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