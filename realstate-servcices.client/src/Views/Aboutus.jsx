import React from 'react';
import { Card, Row, Col, Typography, Divider, Tag, Space } from 'antd';
import { TeamOutlined, TrophyOutlined, HeartOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import BaseView from './BaseView';

const { Title, Paragraph, Text } = Typography;

const AboutUs = () => {
    return (
        <BaseView>
            <div style={{ padding: '50px 24px', maxWidth: 1200, margin: '0 auto' }}>
                <Title level={1} style={{ textAlign: 'center', marginBottom: 10 }}>
                    About Betheland
                </Title>
                <Paragraph style={{ textAlign: 'center', fontSize: '18px', marginBottom: 50 }}>
                    Your Trusted Partner in Real Estate Journey
                </Paragraph>

                {/* Mission & Vision Section */}
                <Row gutter={[32, 32]} style={{ marginBottom: 50 }}>
                    <Col xs={24} lg={12}>
                        <Card
                            title={
                                <Space>
                                    <TrophyOutlined style={{ color: '#1890ff' }} />
                                    <span>Our Mission</span>
                                </Space>
                            }
                            bordered={false}
                            style={{ height: '100%' }}
                        >
                            <Paragraph>
                                To empower individuals and families in finding their dream properties through
                                transparent, reliable, and professional real estate services. We strive to make
                                property ownership accessible and rewarding for everyone.
                            </Paragraph>
                        </Card>
                    </Col>
                    <Col xs={24} lg={12}>
                        <Card
                            title={
                                <Space>
                                    <HeartOutlined style={{ color: '#ff4d4f' }} />
                                    <span>Our Vision</span>
                                </Space>
                            }
                            bordered={false}
                            style={{ height: '100%' }}
                        >
                            <Paragraph>
                                To be the most trusted real estate service provider, known for our integrity,
                                expertise, and commitment to client satisfaction. We envision creating
                                communities where every family finds their perfect home.
                            </Paragraph>
                        </Card>
                    </Col>
                </Row>

                {/* Our Story Section */}
                <Card style={{ marginBottom: 50 }}>
                    <Title level={2}>Our Story</Title>
                    <Divider />
                    <Paragraph style={{ fontSize: '16px', lineHeight: '1.8' }}>
                        Betheland Real Estate Services was founded with a simple yet powerful vision:
                        to help people find not just houses, but homes where memories are made and futures are built.
                        Our journey began with the recognition that the real estate process can be overwhelming,
                        and we set out to change that.
                    </Paragraph>
                    <Paragraph style={{ fontSize: '16px', lineHeight: '1.8' }}>
                        Today, we stand as a dedicated team of real estate professionals committed to
                        guiding you through every step of your property journey. From first-time home buyers
                        to seasoned investors, we provide personalized service that puts your needs first.
                    </Paragraph>
                </Card>

                {/* What Sets Us Apart */}
                <Title level={2} style={{ textAlign: 'center', marginBottom: 30 }}>
                    What Sets Us Apart
                </Title>
                <Row gutter={[24, 24]} style={{ marginBottom: 50 }}>
                    <Col xs={24} sm={12} md={6}>
                        <Card
                            bordered={false}
                            style={{ textAlign: 'center', height: '100%' }}
                            bodyStyle={{ padding: '20px' }}
                        >
                            <SafetyCertificateOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: 16 }} />
                            <Title level={4}>Trust & Integrity</Title>
                            <Paragraph>
                                We believe in transparent dealings and honest advice you can rely on.
                            </Paragraph>
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card
                            bordered={false}
                            style={{ textAlign: 'center', height: '100%' }}
                            bodyStyle={{ padding: '20px' }}
                        >
                            <TeamOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: 16 }} />
                            <Title level={4}>Personalized Service</Title>
                            <Paragraph>
                                Every client receives customized attention and tailored solutions.
                            </Paragraph>
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card
                            bordered={false}
                            style={{ textAlign: 'center', height: '100%' }}
                            bodyStyle={{ padding: '20px' }}
                        >
                            <TrophyOutlined style={{ fontSize: '48px', color: '#faad14', marginBottom: 16 }} />
                            <Title level={4}>Expert Knowledge</Title>
                            <Paragraph>
                                Deep market insights and professional expertise guide every decision.
                            </Paragraph>
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card
                            bordered={false}
                            style={{ textAlign: 'center', height: '100%' }}
                            bodyStyle={{ padding: '20px' }}
                        >
                            <HeartOutlined style={{ fontSize: '48px', color: '#ff4d4f', marginBottom: 16 }} />
                            <Title level={4}>Client-First Approach</Title>
                            <Paragraph>
                                Your satisfaction and success are our top priorities.
                            </Paragraph>
                        </Card>
                    </Col>
                </Row>

                {/* Our Values */}
                <Card style={{ marginBottom: 50 }}>
                    <Title level={2}>Our Values</Title>
                    <Divider />
                    <Space size={[8, 16]} wrap style={{ marginBottom: 24 }}>
                        <Tag color="blue" style={{ padding: '8px 16px', fontSize: '14px' }}>Integrity</Tag>
                        <Tag color="green" style={{ padding: '8px 16px', fontSize: '14px' }}>Excellence</Tag>
                        <Tag color="orange" style={{ padding: '8px 16px', fontSize: '14px' }}>Innovation</Tag>
                        <Tag color="red" style={{ padding: '8px 16px', fontSize: '14px' }}>Commitment</Tag>
                        <Tag color="purple" style={{ padding: '8px 16px', fontSize: '14px' }}>Community</Tag>
                        <Tag color="cyan" style={{ padding: '8px 16px', fontSize: '14px' }}>Transparency</Tag>
                    </Space>
                    <Paragraph>
                        These core values guide every interaction and decision we make. They are the foundation
                        of our company culture and the promise we make to every client who trusts us with their
                        real estate needs.
                    </Paragraph>
                </Card>

                {/* Connect With Us */}
                <Card>
                    <Title level={3}>Connect With Us</Title>
                    <Paragraph>
                        Follow our journey and stay updated with the latest property listings and real estate insights:
                    </Paragraph>
                    <Paragraph>
                        <Text strong>Facebook: </Text>
                        <a
                            href="https://www.facebook.com/bethelandrealestateservices"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ marginLeft: 8 }}
                        >
                            @bethelandrealestateservices
                        </a>
                    </Paragraph>
                    <Paragraph type="secondary">
                        We're excited to be part of your property journey and look forward to helping you
                        find the perfect place to call home.
                    </Paragraph>
                </Card>
            </div>
        </BaseView>
    );
};

export default AboutUs;