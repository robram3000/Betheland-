import React from 'react';
import { Row, Col, Typography, Button, Card, Space } from 'antd';
import { CheckCircleOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const ThirdSection = ({
    title = "Simple Process, Extraordinary Results",
    subtitle = "",
    description = "Our streamlined process ensures you find the perfect property without the hassle. From browsing to moving in, we're with you every step of the way.",
    processSteps = [],
    featureItems = [],
    onGetStarted
}) => {
    const navigate = useNavigate();

    // Default steps if none provided
    const defaultSteps = [
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

    const steps = processSteps.length > 0
        ? processSteps.map((step, index) => ({
            step: (index + 1).toString().padStart(2, '0'),
            title: step.title || `Step ${index + 1}`,
            description: step.description || 'Step description'
        }))
        : defaultSteps;

    // Default features if none provided
    const defaultFeatures = [
        'No hidden fees or charges',
        '24/7 customer support',
        'Verified property listings',
        'Flexible viewing schedules'
    ];

    const features = featureItems.length > 0
        ? featureItems.map(item => item.title || 'Feature')
        : defaultFeatures;

    const handleGetStarted = () => {
        if (onGetStarted) {
            onGetStarted();
        } else {
            navigate('/register');
        }
    };

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
                                {title}
                            </Title>

                            {subtitle && (
                                <Title level={4} style={{ color: '#666', margin: 0 }}>
                                    {subtitle}
                                </Title>
                            )}

                            <Paragraph style={{
                                fontSize: '1.1rem',
                                color: '#666',
                                lineHeight: '1.6'
                            }}>
                                {description}
                            </Paragraph>

                            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                {features.map((item, index) => (
                                    <Space key={index} style={{ fontSize: '16px' }}>
                                        <CheckCircleOutlined style={{ color: '#001529' }} />
                                        <span style={{ color: '#001529' }}>{item}</span>
                                    </Space>
                                ))}
                            </Space>

                            <Button
                                type="primary"
                                size="large"
                                onClick={handleGetStarted}
                                style={{
                                    height: '50px',
                                    padding: '0 32px',
                                    fontSize: '16px',
                                    background: 'linear-gradient(135deg, #001529 0%, #003366 100%)',
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
                                        background: index === 0 ? 'linear-gradient(135deg, #001529 0%, #003366 100%)' : 'white'
                                    }}
                                    bodyStyle={{ padding: '1.5rem' }}
                                >
                                    <Row align="middle" gutter={16}>
                                        <Col>
                                            <div style={{
                                                width: '60px',
                                                height: '60px',
                                                background: index === 0 ? 'white' : '#001529',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: index === 0 ? '#001529' : 'white',
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