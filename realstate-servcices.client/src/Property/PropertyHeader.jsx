// PropertyHeader.jsx (updated with wishlist, schedule, and chat buttons)
import React from 'react';
import { Row, Col, Typography, Rate, Tag, Button, Space } from 'antd';
import { EnvironmentOutlined, HeartOutlined, HeartFilled, CalendarOutlined, ShareAltOutlined, MessageOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const PropertyHeader = () => {
    const [isFavorite, setIsFavorite] = React.useState(false);

    const toggleFavorite = () => {
        setIsFavorite(!isFavorite);
    };

    const handleScheduleTour = () => {
        // Implement schedule tour functionality
        console.log('Schedule tour for this property');
    };

    const handleShare = () => {
        // Implement share functionality
        console.log('Share this property');
    };

    const handleChat = () => {
        // Implement chat functionality
        console.log('Start chat about this property');
    };

    return (
        <div style={{ padding: '40px 0', background: '#f8f9fa' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
                <Row gutter={[32, 16]} align="middle">
                    <Col xs={24} md={16}>
                        <Title level={1}>Luxury Villa with Ocean View</Title>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                            <EnvironmentOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                            <Text type="secondary">Miami Beach, Florida</Text>
                        </div>
                        <Rate disabled defaultValue={4.5} allowHalf style={{ marginBottom: '16px' }} />
                        <div>
                            <Tag color="blue">Villa</Tag>
                            <Tag color="green">5 Bedrooms</Tag>
                            <Tag color="orange">3 Bathrooms</Tag>
                        </div>
                    </Col>
                    <Col xs={24} md={8}>
                        <div style={{ textAlign: 'right' }}>
                            <Title level={2} style={{ color: '#1890ff', margin: 0 }}>1,200,000</Title>
                            <Text type="secondary">2,500/sq ft</Text>

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