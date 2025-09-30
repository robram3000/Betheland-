import React from 'react';
import { Row, Col, Typography, Button, Card, Space } from 'antd';
import { CheckCircleOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const ThirdSection = () => {
    const navigate = useNavigate();

    const steps = [
        {
            step: '01',
            title: 'Browse Properties',
            description: 'Explore our extensive collection of verified properties'
        },
        {
            step: '02',
            title: 'Schedule Viewing',
            description: 'Book appointments directly through our platform'
        },
        {
            step: '03',
            title: 'Make Decision',
            description: 'Get expert advice and make informed decisions'
        },
        {
            step: '04',
            title: 'Move In',
            description: 'Complete paperwork and move into your new property'
        }
    ];

    return (
        <section style={{
            padding: '100px 24px',
            background: 'white'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <Row gutter={[64, 32]} align="middle">
                    <Col xs={24} lg={12}>
                        <Space direction="vertical" size="large" style={{ width: '100%' }}>
                            <Title level={2} style={{ color: '#001529', fontSize: '2.5rem' }}>
                                Simple Process, Extraordinary Results
                            </Title>

                            <Paragraph style={{
                                fontSize: '1.1rem',
                                color: '#666',
                                lineHeight: '1.6'
                            }}>
                                Our streamlined process ensures you find the perfect property without the hassle.
                                From browsing to moving in, we're with you every step of the way.
                            </Paragraph>

                            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                {[
                                    'No hidden fees or charges',
                                    '24/7 customer support',
                                    'Verified property listings',
                                    'Flexible viewing schedules'
                                ].map((item, index) => (
                                    <Space key={index} style={{ fontSize: '16px' }}>
                                        <CheckCircleOutlined style={{ color: '#52c41a' }} />
                                        <span style={{ color: '#001529' }}>{item}</span>
                                    </Space>
                                ))}
                            </Space>

                            <Button
                                type="primary"
                                size="large"
                                onClick={() => navigate('/register')}
                                style={{
                                    height: '50px',
                                    padding: '0 32px',
                                    fontSize: '16px',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    marginTop: '2rem'
                                }}
                            >
                                Get Started Today
                                <ArrowRightOutlined style={{ marginLeft: '8px' }} />
                            </Button>
                        </Space>
                    </Col>

                    <Col xs={24} lg={12}>
                        <Space direction="vertical" size="large" style={{ width: '100%' }}>
                            {steps.map((step, index) => (
                                <Card
                                    key={index}
                                    hoverable
                                    style={{
                                        border: 'none',
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                        background: index === 0 ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white'
                                    }}
                                    bodyStyle={{ padding: '1.5rem' }}
                                >
                                    <Row align="middle" gutter={16}>
                                        <Col>
                                            <div style={{
                                                width: '60px',
                                                height: '60px',
                                                background: index === 0 ? 'white' : '#667eea',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: index === 0 ? '#667eea' : 'white',
                                                fontSize: '24px',
                                                fontWeight: 'bold'
                                            }}>
                                                {step.step}
                                            </div>
                                        </Col>
                                        <Col flex={1}>
                                            <Title
                                                level={4}
                                                style={{
                                                    margin: 0,
                                                    color: index === 0 ? 'white' : '#001529'
                                                }}
                                            >
                                                {step.title}
                                            </Title>
                                            <Paragraph
                                                style={{
                                                    margin: 0,
                                                    color: index === 0 ? 'rgba(255, 255, 255, 0.9)' : '#666'
                                                }}
                                            >
                                                {step.description}
                                            </Paragraph>
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

export default ThirdSection;