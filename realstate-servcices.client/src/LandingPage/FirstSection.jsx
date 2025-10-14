import React from 'react';
import { Button, Row, Col, Typography, Space } from 'antd';
import { PlayCircleOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const FirstSection = () => {
    const navigate = useNavigate();

    return (
        <section style={{
            background: 'linear-gradient(135deg, #001529 0%, #00274d 50%, #003366 100%)',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            padding: '100px 24px 80px',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Minimal Background Elements */}
            <div className="minimal-background">
                {/* Subtle Grid */}
                <div className="grid-overlay"></div>

                {/* Floating Property Dots */}
                {Array.from({ length: 3 }).map((_, i) => (
                    <div
                        key={`dot-${i}`}
                        className="property-dot"
                        style={{
                            left: `${20 + i * 30}%`,
                            top: `${30 + i * 15}%`,
                            animationDelay: `${i * 2}s`
                        }}
                    />
                ))}

                {/* Simple Location Pin */}
                <div className="location-pin">📍</div>

                {/* Minimal Building Outline */}
                <div className="building-outline"></div>
            </div>

            <style>
                {`
                .minimal-background {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                }

                /* Subtle Grid */
                .grid-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-image: 
                        linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
                    background-size: 50px 50px;
                    animation: gridMove 20s linear infinite;
                }

                @keyframes gridMove {
                    0% {
                        transform: translate(0, 0);
                    }
                    100% {
                        transform: translate(50px, 50px);
                    }
                }

                /* Property Dots */
                .property-dot {
                    position: absolute;
                    width: 6px;
                    height: 6px;
                    background: rgba(255, 255, 255, 0.4);
                    border-radius: 50%;
                    animation: dotPulse 4s ease-in-out infinite;
                }

                @keyframes dotPulse {
                    0%, 100% {
                        transform: scale(1);
                        opacity: 0.4;
                    }
                    50% {
                        transform: scale(1.5);
                        opacity: 0.8;
                    }
                }

                /* Location Pin */
                .location-pin {
                    position: absolute;
                    top: 70%;
                    right: 20%;
                    font-size: 24px;
                    animation: pinFloat 6s ease-in-out infinite;
                    opacity: 0.3;
                }

                @keyframes pinFloat {
                    0%, 100% {
                        transform: translateY(0px) scale(1);
                    }
                    50% {
                        transform: translateY(-10px) scale(1.1);
                    }
                }

                /* Building Outline */
                .building-outline {
                    position: absolute;
                    bottom: 0;
                    left: 10%;
                    width: 80%;
                    height: 100px;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    background: linear-gradient(transparent, rgba(0, 40, 80, 0.1));
                }

                .building-outline::before {
                    content: '';
                    position: absolute;
                    top: -80px;
                    left: 20%;
                    width: 60px;
                    height: 80px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-bottom: none;
                }

                .building-outline::after {
                    content: '';
                    position: absolute;
                    top: -120px;
                    right: 30%;
                    width: 40px;
                    height: 120px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-bottom: none;
                }
                `}
            </style>

            <Row justify="center" style={{ width: '100%', position: 'relative', zIndex: 1 }}>
                <Col xs={24} lg={12} style={{ textAlign: 'center' }}>
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        <Title level={1} style={{
                            color: 'white',
                            fontSize: '3rem',
                            fontWeight: '700',
                            margin: 0,
                            lineHeight: '1.2'
                        }}>
                            Find Your Dream Home
                        </Title>

                        <Paragraph style={{
                            color: 'rgba(255, 255, 255, 0.8)',
                            fontSize: '1.1rem',
                            lineHeight: '1.6',
                            maxWidth: '500px',
                            margin: '0 auto'
                        }}>
                            Discover the perfect property that matches your lifestyle.
                            Simple, modern, and made for you.
                        </Paragraph>

                        <Space size="middle" style={{ marginTop: '2rem' }}>
                            <Button
                                type="primary"
                                size="large"
                                onClick={() => navigate('/properties')}
                                style={{
                                    height: '48px',
                                    padding: '0 30px',
                                    fontSize: '16px',
                                    background: 'white',
                                    color: '#001529',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontWeight: '600'
                                }}
                            >
                                Browse Properties
                                <ArrowRightOutlined style={{ marginLeft: '8px' }} />
                            </Button>

                            {/*<Button*/}
                            {/*    size="large"*/}
                            {/*    style={{*/}
                            {/*        height: '48px',*/}
                            {/*        padding: '0 24px',*/}
                            {/*        fontSize: '16px',*/}
                            {/*        background: 'transparent',*/}
                            {/*        color: 'white',*/}
                            {/*        border: '1px solid rgba(255, 255, 255, 0.3)',*/}
                            {/*        borderRadius: '6px'*/}
                            {/*    }}*/}
                            {/*>*/}
                            {/*    <PlayCircleOutlined style={{ marginRight: '8px' }} />*/}
                            {/*    Watch Demo*/}
                            {/*</Button>*/}
                        </Space>

                        {/* Minimal Stats */}
                        <Row gutter={32} style={{ marginTop: '3rem' }}>
                            {[
                                { number: '10K+', label: 'Properties' },
                                { number: '5K+', label: 'Clients' },
                                { number: '50+', label: 'Locations' }
                            ].map((stat, index) => (
                                <Col span={8} key={index}>
                                    <div>
                                        <Title level={3} style={{
                                            color: 'white',
                                            margin: 0,
                                            fontSize: '1.8rem'
                                        }}>
                                            {stat.number}
                                        </Title>
                                        <Paragraph style={{
                                            color: 'rgba(255, 255, 255, 0.7)',
                                            margin: 0,
                                            fontSize: '0.9rem'
                                        }}>
                                            {stat.label}
                                        </Paragraph>
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    </Space>
                </Col>
            </Row>
        </section>
    );
};

export default FirstSection;