import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Button, Space, Avatar, Spin } from 'antd';
import {
    StarFilled,
    CheckCircleFilled,
    MessageOutlined,
    ArrowRightOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import agentService from '../Employeesportal/AdminPortal/Creation_Agent/Services/AgentService'; // Adjust path as needed
import ratingScheduleService from '../Employeesportal/AdminPortal/Ratings/RatingScheduleServices'; // Adjust path as needed

const { Title, Paragraph } = Typography;

const AgentsSection = () => {
    const navigate = useNavigate();
    const [featuredAgents, setFeaturedAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ratingsData, setRatingsData] = useState({}); // Store ratings by agent ID

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

    // Function to fetch rating summary for an agent
    const fetchAgentRating = async (agentId) => {
        try {
            const ratingSummary = await ratingScheduleService.getRatingSummary(agentId);
            return {
                averageRating: ratingSummary.averageRating || 4.5,
                totalRatings: ratingSummary.totalRatings || 0
            };
        } catch (error) {
            console.error(`Error fetching rating for agent ${agentId}:`, error);
            // Return default values if rating service fails
            return {
                averageRating: 4.5,
                totalRatings: Math.floor(Math.random() * 50) + 10 // Fallback random reviews
            };
        }
    };

    // Function to fetch all ratings for multiple agents
    const fetchAllRatings = async (agents) => {
        const ratings = {};
        for (const agent of agents) {
            const ratingData = await fetchAgentRating(agent.id);
            ratings[agent.id] = ratingData;
        }
        return ratings;
    };

    useEffect(() => {
        const fetchFeaturedAgentsWithRatings = async () => {
            try {
                setLoading(true);

                // Get 3 random featured agents
                const agents = await agentService.getFeaturedAgents(3);

                // Fetch ratings for all agents
                const ratings = await fetchAllRatings(agents);

                setFeaturedAgents(agents);
                setRatingsData(ratings);

            } catch (error) {
                console.error('Error fetching featured agents with ratings:', error);
                // Fallback to empty arrays if there's an error
                setFeaturedAgents([]);
                setRatingsData({});
            } finally {
                setLoading(false);
            }
        };

        fetchFeaturedAgentsWithRatings();
    }, []);

    // Format agent data for display with real ratings
    const formatAgentData = (agent) => {
        const agentRatings = ratingsData[agent.id] || {
            averageRating: 4.5,
            totalRatings: Math.floor(Math.random() * 50) + 10
        };

        return {
            name: `${agent.firstName} ${agent.lastName}`,
            role: agent.specialization && agent.specialization.length > 0
                ? `${agent.specialization[0]} Specialist`
                : 'Real Estate Agent',
            experience: agent.yearsOfExperience ? `${agent.yearsOfExperience}+ years` : '5+ years',
            properties: agent.propertyCount ? `${agent.propertyCount}+` : '100+',
            rating: agentRatings.averageRating,
            reviews: agentRatings.totalRatings,
            avatar: `${agent.firstName?.charAt(0)}${agent.lastName?.charAt(0)}` || 'AG',
            specialty: agent.specialization && agent.specialization.length > 0
                ? agent.specialization[0]
                : 'Property Specialist',
            profilePictureUrl: agent.profilePictureUrl,
            id: agent.id
        };
    };

    return (
        <section style={{
            padding: '40px 24px',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #e6e9f0 100%)'
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
                                        <CheckCircleFilled style={{ fontSize: '24px', color: '#001529' }} />
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
                                    background: 'linear-gradient(135deg, #001529 0%, #003366 100%)',
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

                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '40px' }}>
                                    <Spin size="large" />
                                </div>
                            ) : featuredAgents.length > 0 ? (
                                featuredAgents.map((agent, index) => {
                                    const formattedAgent = formatAgentData(agent);
                                    return (
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
                                                    {formattedAgent.profilePictureUrl ? (
                                                        <Avatar
                                                            size={64}
                                                            src={formattedAgent.profilePictureUrl}
                                                            style={{
                                                                fontSize: '18px',
                                                                fontWeight: 'bold'
                                                            }}
                                                        />
                                                    ) : (
                                                        <Avatar
                                                            size={64}
                                                            style={{
                                                                backgroundColor: '#001529',
                                                                fontSize: '18px',
                                                                fontWeight: 'bold'
                                                            }}
                                                        >
                                                            {formattedAgent.avatar}
                                                        </Avatar>
                                                    )}
                                                </Col>
                                                <Col flex={1}>
                                                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                                        <div>
                                                            <Title level={4} style={{ margin: 0, color: '#001529' }}>
                                                                {formattedAgent.name}
                                                            </Title>
                                                            <Paragraph style={{ margin: 0, color: '#001529', fontWeight: '500' }}>
                                                                {formattedAgent.role}
                                                            </Paragraph>
                                                        </div>

                                                        <Space size="middle">
                                                            <Space size="small">
                                                                <StarFilled style={{ color: '#fadb14' }} />
                                                                <span style={{ color: '#001529', fontWeight: '500' }}>
                                                                    {formattedAgent.rating.toFixed(1)}
                                                                </span>
                                                                <span style={{ color: '#666' }}>
                                                                    ({formattedAgent.reviews} reviews)
                                                                </span>
                                                            </Space>
                                                        </Space>

                                                        <Row gutter={16} style={{ marginTop: '8px' }}>
                                                            <Col>
                                                                <div style={{ textAlign: 'center' }}>
                                                                    <div style={{ fontWeight: 'bold', color: '#001529' }}>
                                                                        {formattedAgent.experience}
                                                                    </div>
                                                                    <div style={{ fontSize: '12px', color: '#666' }}>
                                                                        Experience
                                                                    </div>
                                                                </div>
                                                            </Col>
                                                            <Col>
                                                                <div style={{ textAlign: 'center' }}>
                                                                    <div style={{ fontWeight: 'bold', color: '#001529' }}>
                                                                        {formattedAgent.properties}
                                                                    </div>
                                                                    <div style={{ fontSize: '12px', color: '#666' }}>
                                                                        Properties
                                                                    </div>
                                                                </div>
                                                            </Col>
                                                            <Col>
                                                                <div style={{ textAlign: 'center' }}>
                                                                    <div style={{ fontWeight: 'bold', color: '#001529' }}>
                                                                        {formattedAgent.specialty}
                                                                    </div>
                                                                    <div style={{ fontSize: '12px', color: '#666' }}>
                                                                        Specialty
                                                                    </div>
                                                                </div>
                                                            </Col>
                                                        </Row>
                                                    </Space>
                                                </Col>
                                              
                                            </Row>
                                        </Card>
                                    );
                                })
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                                    No featured agents available at the moment.
                                </div>
                            )}
                        </Space>
                    </Col>
                </Row>
            </div>
        </section>
    );
};

export default AgentsSection;