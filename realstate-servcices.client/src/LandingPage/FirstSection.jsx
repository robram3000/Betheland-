import React from 'react';
import { Button, Row, Col, Typography, Space } from 'antd';
import { PlayCircleOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const FirstSection = () => {
    const navigate = useNavigate();

    return (
        <section style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            padding: '100px 24px 80px',
            color: 'white'
        }}>
            <Row justify="center" style={{ width: '100%' }}>
                <Col xs={24} lg={12} style={{ textAlign: 'center' }}>
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        <Title level={1} style={{
                            color: 'white',
                            fontSize: '3.5rem',
                            fontWeight: 'bold',
                            margin: 0,
                            lineHeight: '1.2'
                        }}>
                            Discover Your Perfect Property
                        </Title>

                        <Paragraph style={{
                            color: 'rgba(255, 255, 255, 0.9)',
                            fontSize: '1.2rem',
                            lineHeight: '1.6',
                            maxWidth: '600px',
                            margin: '0 auto'
                        }}>
                            Find your dream home from thousands of properties.
                            We make real estate simple, transparent, and accessible for everyone.
                        </Paragraph>

                        <Space size="middle" style={{ marginTop: '2rem' }}>
                            <Button
                                type="primary"
                                size="large"
                                onClick={() => navigate('/properties')}
                                style={{
                                    height: '50px',
                                    padding: '0 32px',
                                    fontSize: '16px',
                                    background: 'white',
                                    color: '#667eea',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: '600'
                                }}
                            >
                                Explore Properties
                                <ArrowRightOutlined style={{ marginLeft: '8px' }} />
                            </Button>

                            <Button
                                size="large"
                                icon={<PlayCircleOutlined />}
                                style={{
                                    height: '50px',
                                    padding: '0 24px',
                                    fontSize: '16px',
                                    background: 'transparent',
                                    color: 'white',
                                    border: '2px solid rgba(255, 255, 255, 0.3)',
                                    borderRadius: '8px'
                                }}
                            >
                                Watch Demo
                            </Button>
                        </Space>

                        {/* Stats */}
                        <Row gutter={32} style={{ marginTop: '4rem' }}>
                            <Col span={8}>
                                <div style={{ textAlign: 'center' }}>
                                    <Title level={2} style={{ color: 'white', margin: 0 }}>10K+</Title>
                                    <Paragraph style={{ color: 'rgba(255, 255, 255, 0.8)', margin: 0 }}>
                                        Properties
                                    </Paragraph>
                                </div>
                            </Col>
                            <Col span={8}>
                                <div style={{ textAlign: 'center' }}>
                                    <Title level={2} style={{ color: 'white', margin: 0 }}>5K+</Title>
                                    <Paragraph style={{ color: 'rgba(255, 255, 255, 0.8)', margin: 0 }}>
                                        Happy Clients
                                    </Paragraph>
                                </div>
                            </Col>
                            <Col span={8}>
                                <div style={{ textAlign: 'center' }}>
                                    <Title level={2} style={{ color: 'white', margin: 0 }}>50+</Title>
                                    <Paragraph style={{ color: 'rgba(255, 255, 255, 0.8)', margin: 0 }}>
                                        Cities
                                    </Paragraph>
                                </div>
                            </Col>
                        </Row>
                    </Space>
                </Col>
            </Row>
        </section>
    );
};

export default FirstSection;