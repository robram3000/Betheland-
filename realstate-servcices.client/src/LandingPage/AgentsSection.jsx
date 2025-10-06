// AgentsSection.jsx
import React from 'react';
import { Row, Col, Card, Typography, Button, Space, Avatar } from 'antd';
import {
    StarFilled,
    CheckCircleFilled,
    MessageOutlined,
    ArrowRightOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const AgentsSection = () => {
    const navigate = useNavigate();

    const featuredAgents = [
        {
            name: 'Sarah Johnson',
            role: 'Senior Real Estate Agent',
            experience: '8+ years',
            properties: '250+',
            rating: 4.9,
            reviews: 127,
            avatar: 'SJ',
            specialty: 'Luxury Homes'
        },
        {
            name: 'Michael Chen',
            role: 'Property Consultant',
            experience: '6+ years',
            properties: '180+',
            rating: 4.8,
            reviews: 94,
            avatar: 'MC',
            specialty: 'Commercial Properties'
        },
        {
            name: 'Emily Rodriguez',
            role: 'Real Estate Advisor',
            experience: '5+ years',
            properties: '120+',
            rating: 4.9,
            reviews: 86,
            avatar: 'ER',
            specialty: 'First-time Buyers'
        }
    ];

    const benefits = [
        {
            title: 'Verified Professionals',
            description: 'All agents are thoroughly vetted and certified'
        },
        {
            title: 'Local Market Expertise',
            description: 'Deep knowledge of local property markets and trends'
        },
        {
            title: 'Personalized Service',
            description: 'Tailored approach to meet your specific needs'
        },
        {
            title: 'Negotiation Power',
            description: 'Expert negotiators to get you the best deal'
        }
    ];

    return (
        <section style={{
            padding: '100px 24px',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #e6e9f0 100%)' // Lighter gradient to match
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header */}
                <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center', marginBottom: '4rem' }}>
                    <Title level={2} style={{ color: '#001529', fontSize: '2.5rem' }}>
                        Work With Expert Agents
                    </Title>
                    <Paragraph style={{
                        fontSize: '1.1rem',
                        color: '#666',
                        maxWidth: '600px',
                        margin: '0 auto'
                    }}>
                        Connect with our certified real estate professionals who will guide you
                        through every step of your property journey.
                    </Paragraph>
                </Space>

                <Row gutter={[48, 48]}>
                    {/* Benefits Column */}
                    <Col xs={24} lg={12}>
                        <Space direction="vertical" size="large" style={{ width: '100%' }}>
                            <Title level={3} style={{ color: '#001529' }}>
                                Why Work With Our Agents?
                            </Title>

                            {benefits.map((benefit, index) => (
                                <Card
                                    key={index}
                                    style={{
                                        border: 'none',
                                        background: 'white',
                                        borderRadius: '12px',
                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                                    }}
                                    bodyStyle={{ padding: '1.5rem' }}
                                >
                                    <Space size="middle" align="start">
                                        <CheckCircleFilled style={{ fontSize: '24px', color: '#001529' }} /> {/* Updated to dark blue */}
                                        <Space direction="vertical" size="small" style={{ flex: 1 }}>
                                            <Title level={5} style={{ margin: 0, color: '#001529' }}>
                                                {benefit.title}
                                            </Title>
                                            <Paragraph style={{ margin: 0, color: '#666' }}>
                                                {benefit.description}
                                            </Paragraph>
                                        </Space>
                                    </Space>
                                </Card>
                            ))}

                            <Button
                                type="primary"
                                size="large"
                                onClick={() => navigate('/agents')}
                                style={{
                                    height: '50px',
                                    padding: '0 32px',
                                    fontSize: '16px',
                                    background: 'linear-gradient(135deg, #001529 0%, #003366 100%)', // Updated to dark blue gradient
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    marginTop: '1rem'
                                }}
                            >
                                View All Agents
                                <ArrowRightOutlined style={{ marginLeft: '8px' }} />
                            </Button>
                        </Space>
                    </Col>

                    {/* Featured Agents Column */}
                    <Col xs={24} lg={12}>
                        <Space direction="vertical" size="large" style={{ width: '100%' }}>
                            <Title level={3} style={{ color: '#001529' }}>
                                Featured Agents
                            </Title>

                            {featuredAgents.map((agent, index) => (
                                <Card
                                    key={index}
                                    hoverable
                                    style={{
                                        border: 'none',
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                        background: 'white'
                                    }}
                                    bodyStyle={{ padding: '1.5rem' }}
                                >
                                    <Row gutter={16} align="middle">
                                        <Col>
                                            <Avatar
                                                size={64}
                                                style={{
                                                    backgroundColor: '#001529', // Updated to dark blue
                                                    fontSize: '18px',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                {agent.avatar}
                                            </Avatar>
                                        </Col>
                                        <Col flex={1}>
                                            <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                                <div>
                                                    <Title level={4} style={{ margin: 0, color: '#001529' }}>
                                                        {agent.name}
                                                    </Title>
                                                    <Paragraph style={{ margin: 0, color: '#001529', fontWeight: '500' }}> {/* Updated to dark blue */}
                                                        {agent.role}
                                                    </Paragraph>
                                                </div>

                                                <Space size="middle">
                                                    <Space size="small">
                                                        <StarFilled style={{ color: '#fadb14' }} />
                                                        <span style={{ color: '#001529', fontWeight: '500' }}>
                                                            {agent.rating}
                                                        </span>
                                                        <span style={{ color: '#666' }}>
                                                            ({agent.reviews} reviews)
                                                        </span>
                                                    </Space>
                                                </Space>

                                                <Row gutter={16} style={{ marginTop: '8px' }}>
                                                    <Col>
                                                        <div style={{ textAlign: 'center' }}>
                                                            <div style={{ fontWeight: 'bold', color: '#001529' }}>
                                                                {agent.experience}
                                                            </div>
                                                            <div style={{ fontSize: '12px', color: '#666' }}>
                                                                Experience
                                                            </div>
                                                        </div>
                                                    </Col>
                                                    <Col>
                                                        <div style={{ textAlign: 'center' }}>
                                                            <div style={{ fontWeight: 'bold', color: '#001529' }}>
                                                                {agent.properties}
                                                            </div>
                                                            <div style={{ fontSize: '12px', color: '#666' }}>
                                                                Properties
                                                            </div>
                                                        </div>
                                                    </Col>
                                                    <Col>
                                                        <div style={{ textAlign: 'center' }}>
                                                            <div style={{ fontWeight: 'bold', color: '#001529' }}>
                                                                {agent.specialty}
                                                            </div>
                                                            <div style={{ fontSize: '12px', color: '#666' }}>
                                                                Specialty
                                                            </div>
                                                        </div>
                                                    </Col>
                                                </Row>
                                            </Space>
                                        </Col>
                                        <Col>
                                            <Button
                                                type="default"
                                                icon={<MessageOutlined />}
                                                onClick={() => navigate(`/agents/${agent.name.toLowerCase().replace(' ', '-')}`)}
                                            >
                                                Contact
                                            </Button>
                                        </Col>
                                    </Row>
                                </Card>
                            ))}
                        </Space>
                    </Col>
                </Row>

            
            </div>
        </section>
    );
};

export default AgentsSection;