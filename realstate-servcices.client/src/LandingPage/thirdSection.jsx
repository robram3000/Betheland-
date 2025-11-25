import React, { useState, useEffect } from 'react';
import { Row, Col, Typography, Button, Card, Space, Spin } from 'antd';
import { CheckCircleOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import ThirdSectionServices from '../Employeesportal/SuperAdminPortal/Content/Services/ThirdSectionServices';
import ThirdSectionMapper from '../Employeesportal/SuperAdminPortal/Content/Services/ThirdSectionMapper';

const { Title, Paragraph } = Typography;

const ThirdSection = ({
    title,
    subtitle,
    description,
    processSteps = [],
    featureItems = [],
    onGetStarted,
    autoLoad = true // New prop to control auto-loading
}) => {
    const navigate = useNavigate();
    const [sectionData, setSectionData] = useState(null);
    const [loading, setLoading] = useState(autoLoad);
    const [error, setError] = useState(null);

    // Load data from API when component mounts
    useEffect(() => {
        if (autoLoad) {
            loadSectionData();
        }
    }, [autoLoad]);

    const loadSectionData = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('🔍 ThirdSection: Loading section data...');
            const apiData = await ThirdSectionServices.getThirdSection();
            const mappedData = ThirdSectionMapper.mapFromApi(apiData);

            console.log('✅ ThirdSection: Data loaded successfully:', mappedData);
            setSectionData(mappedData);
        } catch (err) {
            console.error('❌ ThirdSection: Error loading data:', err);
            setError(err.message);
            // Fallback to default data structure
            setSectionData(ThirdSectionMapper.getEmptyThirdSection());
        } finally {
            setLoading(false);
        }
    };

    // Use props if provided, otherwise use loaded data
    const displayTitle = title || sectionData?.title || "Simple Process, Extraordinary Results";
    const displaySubtitle = subtitle || sectionData?.subtitle || "";
    const displayDescription = description || sectionData?.description || "Our streamlined process ensures you find the perfect property without the hassle. From browsing to moving in, we're with you every step of the way.";

    // Process steps: use props first, then loaded data, then defaults
    const getProcessSteps = () => {
        if (processSteps.length > 0) return processSteps;
        if (sectionData?.processSteps && sectionData.processSteps.length > 0) {
            return sectionData.processSteps.map((step, index) => ({
                step: (step.stepNumber || (index + 1)).toString().padStart(2, '0'),
                title: step.title || `Step ${step.stepNumber || (index + 1)}`,
                description: step.description || 'Step description'
            }));
        }

        // Default steps if none provided
        return [
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
    };

    // Feature items: use props first, then loaded data, then defaults
    const getFeatureItems = () => {
        if (featureItems.length > 0) return featureItems;
        if (sectionData?.featureItems && sectionData.featureItems.length > 0) {
            return sectionData.featureItems.map(item => item.title || 'Feature');
        }

        // Default features if none provided
        return [
            'No hidden fees or charges',
            '24/7 customer support',
            'Verified property listings',
            'Flexible viewing schedules'
        ];
    };

    const steps = getProcessSteps();
    const features = getFeatureItems();

    const handleGetStarted = () => {
        if (onGetStarted) {
            onGetStarted();
        } else {
            navigate('/register');
        }
    };

    // Show loading state
    if (loading && autoLoad) {
        return (
            <section style={{
                padding: '80px 24px',
                background: 'white',
                textAlign: 'center'
            }}>
                <Spin size="large" />
                <div style={{ marginTop: 16, color: '#666' }}>Loading content...</div>
            </section>
        );
    }

    // Show error state
    if (error && autoLoad) {
        return (
            <section style={{
                padding: '80px 24px',
                background: 'white',
                textAlign: 'center'
            }}>
                <div style={{ color: '#ff4d4f', marginBottom: 16 }}>
                    Failed to load content: {error}
                </div>
                <Button type="primary" onClick={loadSectionData}>
                    Retry
                </Button>
            </section>
        );
    }

    return (
        <section style={{
            padding: '40px 24px',
            background: 'white'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <Row gutter={[64, 32]} align="middle">
                    <Col xs={24} lg={12}>
                        <Space direction="vertical" size="large" style={{ width: '100%' }}>
                            <Title level={2} style={{ color: '#001529', fontSize: '2.5rem' }}>
                                {displayTitle}
                            </Title>

                            {displaySubtitle && (
                                <Title level={4} style={{ color: '#666', margin: 0 }}>
                                    {displaySubtitle}
                                </Title>
                            )}

                            <Paragraph style={{
                                fontSize: '1.1rem',
                                color: '#666',
                                lineHeight: '1.6'
                            }}>
                                {displayDescription}
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