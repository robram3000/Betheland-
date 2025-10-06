import React from 'react';
import { Row, Col, Card, Typography, Space } from 'antd';
import {
    HomeOutlined,
    SafetyCertificateOutlined,
    TeamOutlined,
    RocketOutlined
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const SecondSection = () => {
    const features = [
        {
            icon: <HomeOutlined style={{ fontSize: '48px', color: '#001529' }} />, // Updated to dark blue
            title: 'Wide Property Selection',
            description: 'Choose from thousands of verified properties across multiple cities and neighborhoods.'
        },
        {
            icon: <SafetyCertificateOutlined style={{ fontSize: '48px', color: '#001529' }} />, // Updated to dark blue
            title: 'Verified Listings',
            description: 'Every property is thoroughly verified to ensure accuracy and authenticity.'
        },
        {
            icon: <TeamOutlined style={{ fontSize: '48px', color: '#001529' }} />, // Updated to dark blue
            title: 'Expert Support',
            description: 'Our team of real estate experts is here to guide you every step of the way.'
        },
        {
            icon: <RocketOutlined style={{ fontSize: '48px', color: '#001529' }} />, // Updated to dark blue
            title: 'Quick Process',
            description: 'Streamlined processes to help you find and secure your property faster.'
        }
    ];

    return (
        <section style={{
            padding: '100px 24px',
            background: '#f8f9fa'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center', marginBottom: '4rem' }}>
                    <Title level={2} style={{ color: '#001529', fontSize: '2.5rem' }}>
                        Why Choose Betheland?
                    </Title>
                    <Paragraph style={{
                        fontSize: '1.1rem',
                        color: '#666',
                        maxWidth: '600px',
                        margin: '0 auto'
                    }}>
                        We revolutionize the way you find and secure properties with our innovative platform
                        and dedicated service.
                    </Paragraph>
                </Space>

                <Row gutter={[32, 32]}>
                    {features.map((feature, index) => (
                        <Col xs={24} md={12} lg={6} key={index}>
                            <Card
                                hoverable
                                style={{
                                    height: '100%',
                                    border: 'none',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                    textAlign: 'center'
                                }}
                                bodyStyle={{ padding: '2rem 1.5rem' }}
                            >
                                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                    {feature.icon}
                                    <Title level={4} style={{ margin: 0, color: '#001529' }}>
                                        {feature.title}
                                    </Title>
                                    <Paragraph style={{ color: '#666', margin: 0 }}>
                                        {feature.description}
                                    </Paragraph>
                                </Space>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>
        </section>
    );
};

export default SecondSection;