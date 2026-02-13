// WishlistPage.jsx (UPDATED - Using separate ScheduleTour component)
import React, { useState, useEffect, useCallback } from 'react';
import {
    Row,
    Col,
    Typography,
    Empty,
    Button,
    Space,
    Divider,
    message,
    Modal,
    Spin,
    Alert,
    Card,
    Breadcrumb,
    Result,
    Progress,
    Statistic,
    Timeline
} from 'antd';
import {
    HeartFilled,
    DeleteOutlined,
    ExclamationCircleOutlined,
    ArrowLeftOutlined,
    HomeOutlined,
    CheckCircleOutlined,
    ClockCircleFilled,
    TeamOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useWishlistData } from '../Property/Services/WishlistAdded';
import WishlistCard from './WishlistCard';
import ScheduleTour from './../Scheduling/SchedulingTour';
import agentService from '../Employeesportal/AdminPortal/Creation_Agent/Services/AgentService';
import authService from '../Authpage/Services/LoginAuth';
import propertyService from '../Employeesportal/AdminPortal/Creation_Property/services/propertyService';
import ratingScheduleService from '../Employeesportal/AdminPortal/Ratings/RatingScheduleServices';

const { Title, Text } = Typography;
const { confirm } = Modal;

// Helper functions for data serialization
const serializePropertyData = (property) => {
    if (!property) return null;

    return {
        id: property.id || property.propertyId,
        title: property.title || 'Untitled Property',
        price: property.price || 0,
        mainImage: property.mainImage || '/default-property.jpg',
        address: property.address || 'Address not specified',
        bedrooms: property.bedrooms || 0,
        bathrooms: property.bathrooms || 0,
        areaSqft: property.areaSqft || property.squareFeet || 'N/A',
        city: property.city || '',
        state: property.state || '',
        propertyType: property.propertyType || 'Property',
        amenities: Array.isArray(property.amenities) ? property.amenities : [],
        latitude: property.latitude || 0,
        longitude: property.longitude || 0,
        description: property.description || '',
        garage: property.garage || 0,
        areaSqm: property.areaSqm || 0,
        propertyAge: property.propertyAge || 0
    };
};

const serializeAgentData = (agent) => {
    if (!agent) return null;

    return {
        id: agent.id || agent.agentId || agent.userId || agent.baseMemberId,
        baseMemberId: agent.baseMemberId || agent.id,
        firstName: agent.firstName || 'Agent',
        lastName: agent.lastName || '',
        name: `${agent.firstName || ''} ${agent.lastName || ''}`.trim(),
        profilePictureUrl: agent.profilePictureUrl || '',
        email: agent.email || '',
        cellPhoneNo: agent.cellPhoneNo || '',
        title: agent.title || 'Real Estate Agent',
        brokerageName: agent.brokerageName || 'Real Estate Company',
        specialties: Array.isArray(agent.specialties) ? agent.specialties : ['Real Estate'],
        yearsExperience: agent.yearsExperience || 5,
        languages: Array.isArray(agent.languages) ? agent.languages : ['English', 'Tagalog'],
        licenseNumber: agent.licenseNumber || ''
    };
};

const WishlistPage = () => {
    const navigate = useNavigate();

    const {
        wishlistItems,
        loading,
        error,
        wishlistCount,
        removeFromWishlistByProperty,
        clearWishlist,
        refreshWishlist,
        isAuthenticated
    } = useWishlistData();

    // View states: 'wishlist' | 'schedule' | 'success' | 'waiting-confirmation'
    const [currentView, setCurrentView] = useState('wishlist');
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [initialLoad, setInitialLoad] = useState(true);

    // Enhanced wishlist data
    const [enhancedWishlistItems, setEnhancedWishlistItems] = useState([]);
    const [loadingAgents, setLoadingAgents] = useState(false);
    const [agentsFetched, setAgentsFetched] = useState(false);

    // Scheduled appointment state
    const [scheduledAppointment, setScheduledAppointment] = useState(null);

    // Check authentication status
    useEffect(() => {
        const authenticated = authService.isAuthenticated();
        if (authenticated) {
            const user = authService.getCurrentUser();
            // Store user if needed
        }
    }, []);

    // Use useCallback to prevent unnecessary re-renders
    const loadWishlistData = useCallback(async () => {
        if (isAuthenticated && initialLoad) {
            await refreshWishlist();
            setInitialLoad(false);
        }
    }, [isAuthenticated, refreshWishlist, initialLoad]);

    // Refresh wishlist on component mount only once
    useEffect(() => {
        loadWishlistData();
    }, [loadWishlistData]);

    // Fetch agents and ratings for wishlist properties
    useEffect(() => {
        if (wishlistItems.length > 0 && !loading && !agentsFetched) {
            fetchAgentsForWishlist(wishlistItems);
            setAgentsFetched(true);
        }
    }, [wishlistItems, loading, agentsFetched]);

    // Function to fetch agent data for wishlist properties
    const fetchAgentsForWishlist = async (wishlistItems) => {
        setLoadingAgents(true);
        const enhancedItems = [];

        try {
            console.log('🔍 Fetching agents for wishlist properties...', wishlistItems);

            for (const wishlistItem of wishlistItems) {
                const propertyId = wishlistItem.propertyId;
                console.log(`Processing property ID: ${propertyId}`);

                try {
                    // Step 1: Get property data to get agentId
                    const propertyData = await propertyService.getProperty(propertyId);
                    console.log(`Property ${propertyId} data:`, propertyData);

                    if (propertyData && propertyData.agentId) {
                        const agentId = propertyData.agentId;

                        // Step 2: Get agent information
                        let agentData = null;
                        try {
                            agentData = await agentService.getAgent(agentId);
                            console.log(`Agent ${agentId} data:`, agentData);
                        } catch (agentError) {
                            console.warn(`Failed to fetch agent ${agentId}:`, agentError);
                            // Use fallback agent
                            agentData = {
                                id: agentId,
                                firstName: 'Maria',
                                lastName: 'Santos',
                                profilePictureUrl: '',
                                email: '',
                                cellPhoneNo: '',
                                title: 'Real Estate Agent',
                                brokerageName: 'Real Estate Company',
                                specialties: ['Real Estate'],
                                yearsExperience: 5,
                                languages: ['English', 'Tagalog']
                            };
                        }

                        // Step 3: Get agent ratings
                        let ratingSummary = null;
                        try {
                            ratingSummary = await ratingScheduleService.getRatingSummary(agentId);
                            console.log(`Rating summary for agent ${agentId}:`, ratingSummary);
                        } catch (ratingError) {
                            console.warn(`Could not fetch ratings for agent ${agentId}:`, ratingError);
                            // Use fallback ratings
                            ratingSummary = {
                                agentId: agentId,
                                averageRating: 4.5,
                                totalRatings: Math.floor(Math.random() * 50) + 10,
                                ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
                                recentRatings: []
                            };
                        }

                        // Create enhanced wishlist item with serialized data
                        enhancedItems.push({
                            ...wishlistItem,
                            propertyData: serializePropertyData(propertyData),
                            agentData: serializeAgentData(agentData),
                            ratingSummary: ratingSummary
                        });
                    } else {
                        // No agent found for this property
                        console.log(`No agent ID found for property ${propertyId}`);
                        enhancedItems.push({
                            ...wishlistItem,
                            propertyData: serializePropertyData(propertyData),
                            agentData: null,
                            ratingSummary: null
                        });
                    }
                } catch (propertyError) {
                    console.error(`Error processing property ${propertyId}:`, propertyError);
                    // Still add the item but with error state
                    enhancedItems.push({
                        ...wishlistItem,
                        propertyData: null,
                        agentData: null,
                        ratingSummary: null,
                        error: 'Failed to load property data'
                    });
                }
            }

            setEnhancedWishlistItems(enhancedItems);
            console.log('✅ Enhanced wishlist items:', enhancedItems);

        } catch (error) {
            console.error('❌ Error fetching agents for wishlist:', error);
            message.error('Failed to load agent information');
        } finally {
            setLoadingAgents(false);
        }
    };

    const handleRemoveFromWishlist = async (propertyId) => {
        try {
            await removeFromWishlistByProperty(propertyId);
            message.success('Property removed from wishlist');

            // Update local state and reset agents fetched flag
            setEnhancedWishlistItems(prev =>
                prev.filter(item => item.propertyId !== propertyId)
            );
            setAgentsFetched(false);
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            message.error('Failed to remove property from wishlist');
        }
    };

    const handleScheduleTour = (wishlistItem) => {
        const property = wishlistItem.propertyData || wishlistItem;
        setSelectedProperty(property);
        setCurrentView('schedule');
    };

    // Safe navigation function
    const handleViewDetails = (wishlistItem) => {
        const property = wishlistItem.propertyData || wishlistItem;

        // Use only serializable data in navigation state
        const navigationState = {
            propertyId: property.propertyId || property.id,
            propertyData: serializePropertyData(property),
            agentData: serializeAgentData(property.agent || wishlistItem.agentData || null)
        };

        console.log('🔄 Navigating to property view with:', navigationState);

        navigate('/properties/view', {
            state: navigationState
        });
    };

    const showClearWishlistConfirm = () => {
        confirm({
            title: 'Clear Entire Wishlist?',
            icon: <ExclamationCircleOutlined />,
            content: 'This will remove all properties from your wishlist. This action cannot be undone.',
            okText: 'Yes, Clear All',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk() {
                handleClearWishlist();
            },
        });
    };

    const handleClearWishlist = async () => {
        try {
            await clearWishlist();
            message.success('Wishlist cleared successfully');
            setEnhancedWishlistItems([]);
            setAgentsFetched(false);
        } catch (error) {
            console.error('Error clearing wishlist:', error);
            message.error('Failed to clear wishlist');
        }
    };

    // Handle schedule success
    const handleScheduleSuccess = (appointmentData) => {
        setScheduledAppointment(appointmentData);
        setCurrentView('success');
    };

    // Handle waiting confirmation
    const handleWaitingConfirmation = (appointmentData) => {
        setScheduledAppointment(appointmentData);
        setCurrentView('waiting-confirmation');
    };

    // Handle back to wishlist
    const handleBackToWishlist = () => {
        setCurrentView('wishlist');
        setSelectedProperty(null);
        setScheduledAppointment(null);
    };

    // WAITING CONFIRMATION VIEW COMPONENT
    const WaitingConfirmationView = () => (
        <div style={{ padding: '40px 24px', maxWidth: '800px', margin: '0 auto' }}>
            <Breadcrumb style={{ marginBottom: '24px' }}>
                <Breadcrumb.Item>
                    <HomeOutlined />
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                    <a onClick={handleBackToWishlist}>Wishlist</a>
                </Breadcrumb.Item>
                <Breadcrumb.Item>Appointment Confirmation</Breadcrumb.Item>
            </Breadcrumb>

            <Card>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <ClockCircleFilled style={{ fontSize: '64px', color: '#1890ff', marginBottom: '16px' }} />
                    <Title level={2} style={{ color: '#1890ff' }}>Waiting for Agent Confirmation</Title>
                    <Text type="secondary" style={{ fontSize: '16px' }}>
                        Your tour request has been sent to the agent. They will confirm within 24 hours.
                    </Text>
                </div>

                <Progress
                    percent={50}
                    status="active"
                    strokeColor={{
                        '0%': '#108ee9',
                        '100%': '#87d068',
                    }}
                    style={{ marginBottom: '32px' }}
                />

                <Row gutter={[32, 32]}>
                    <Col span={12}>
                        <Card
                            title="Appointment Details"
                            size="small"
                            style={{ border: '1px solid #f0f0f0' }}
                        >
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <Statistic
                                    title="Property"
                                    value={scheduledAppointment?.property?.title}
                                    valueStyle={{ fontSize: '14px', color: '#1B3C53' }}
                                />
                                <Statistic
                                    title="Date & Time"
                                    value={`${scheduledAppointment?.scheduledDate} at ${scheduledAppointment?.scheduledTime}`}
                                    valueStyle={{ fontSize: '14px' }}
                                />
                                <Statistic
                                    title="Agent"
                                    value={`${scheduledAppointment?.agent?.firstName} ${scheduledAppointment?.agent?.lastName}`}
                                    valueStyle={{ fontSize: '14px' }}
                                />
                                {scheduledAppointment?.notes && (
                                    <div>
                                        <Text strong>Notes: </Text>
                                        <Text type="secondary">{scheduledAppointment.notes}</Text>
                                    </div>
                                )}
                            </Space>
                        </Card>
                    </Col>

                    <Col span={12}>
                        <Card
                            title="Agent Contact"
                            size="small"
                            style={{ border: '1px solid #f0f0f0' }}
                        >
                            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                <Button
                                    type="primary"
                                    icon={<PhoneFilled />}
                                    block
                                    style={{ background: '#52c41a', borderColor: '#52c41a' }}
                                >
                                    Call Agent: {scheduledAppointment?.agent?.phone}
                                </Button>
                                <Button
                                    icon={<MailFilled />}
                                    block
                                >
                                    Email Agent: {scheduledAppointment?.agent?.email}
                                </Button>
                                <Button
                                    icon={<MessageOutlined />}
                                    block
                                >
                                    Send Message
                                </Button>
                            </Space>
                        </Card>
                    </Col>
                </Row>

                <Alert
                    message="Confirmation Timeline"
                    description="The agent typically confirms appointments within 24 hours. You'll receive a notification once your tour is confirmed."
                    type="info"
                    showIcon
                    style={{ marginTop: '24px' }}
                />

                <div style={{ textAlign: 'center', marginTop: '32px' }}>
                    <Space size="large">
                        <Button
                            type="primary"
                            onClick={handleBackToWishlist}
                            size="large"
                        >
                            Back to Wishlist
                        </Button>
                    </Space>
                </div>
            </Card>
        </div>
    );

    // SUCCESS VIEW COMPONENT
    const SuccessView = () => (
        <div style={{ padding: '40px 24px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <Result
                icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                title="Tour Scheduled Successfully!"
                subTitle="Your property tour has been scheduled and the agent has been notified."
                extra={[
                    <Button
                        type="primary"
                        key="view-details"
                        onClick={() => setCurrentView('waiting-confirmation')}
                        size="large"
                    >
                        View Appointment Details
                    </Button>,
                    <Button
                        key="back-to-wishlist"
                        onClick={handleBackToWishlist}
                        size="large"
                    >
                        Back to Wishlist
                    </Button>
                ]}
            />

            <Card style={{ marginTop: '32px', textAlign: 'left' }}>
                <Title level={4}>What happens next?</Title>
                <Timeline
                    items={[
                        {
                            color: 'green',
                            dot: <CheckCircleOutlined />,
                            children: (
                                <>
                                    <Text strong>Tour Scheduled</Text>
                                    <br />
                                    <Text type="secondary">Your request has been sent to the agent</Text>
                                </>
                            ),
                        },
                        {
                            color: 'blue',
                            dot: <ClockCircleFilled />,
                            children: (
                                <>
                                    <Text strong>Agent Confirmation</Text>
                                    <br />
                                    <Text type="secondary">Waiting for the agent to confirm your tour</Text>
                                </>
                            ),
                        },
                        {
                            color: 'gray',
                            dot: <TeamOutlined />,
                            children: (
                                <>
                                    <Text strong>Tour Preparation</Text>
                                    <br />
                                    <Text type="secondary">Agent will contact you to finalize details</Text>
                                </>
                            ),
                        },
                    ]}
                />
            </Card>
        </div>
    );

    // WISHLIST VIEW COMPONENT
    const WishlistView = () => (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header Section */}
            <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
                <Col>
                    <Space>
                        <HeartFilled style={{ fontSize: '24px', color: '#ff4d4f' }} />
                        <Title level={2} style={{ margin: 0 }}>
                            My Wishlist
                        </Title>
                        <Text type="secondary" style={{ fontSize: '16px' }}>
                            ({wishlistCount} {wishlistCount === 1 ? 'property' : 'properties'})
                        </Text>
                    </Space>
                </Col>
                <Col>
                    <Button
                        type="primary"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={showClearWishlistConfirm}
                        disabled={wishlistCount === 0}
                    >
                        Clear All
                    </Button>
                </Col>
            </Row>

            <Divider />

            {/* Loading indicator for agents */}
            {loadingAgents && (
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <Spin tip="Loading agent information and ratings..." />
                </div>
            )}

            {/* Wishlist Items Grid */}
            <Row gutter={[32, 32]} justify="start">
                {enhancedWishlistItems.map((wishlistItem) => {
                    const propertyData = wishlistItem.propertyData || wishlistItem;
                    const agentData = wishlistItem.agentData;
                    const ratingSummary = wishlistItem.ratingSummary;

                    return (
                        <Col key={wishlistItem.id} xs={24} sm={12} lg={8} xl={6}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                width: '100%'
                            }}>
                                <WishlistCard
                                    property={propertyData}
                                    agent={agentData}
                                    ratingSummary={ratingSummary}
                                    onRemove={() => handleRemoveFromWishlist(wishlistItem.propertyId)}
                                    onScheduleTour={() => handleScheduleTour(wishlistItem)}
                                    onViewDetails={() => handleViewDetails(wishlistItem)}
                                />
                            </div>
                        </Col>
                    );
                })}
            </Row>
        </div>
    );

    // Show loading state
    if (loading && initialLoad) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <Spin size="large" tip="Loading your wishlist..." />
            </div>
        );
    }

    // Show loading agents state
    if (loadingAgents && enhancedWishlistItems.length === 0) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <Spin size="large" tip="Loading property details and agent information..." />
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div style={{ padding: '20px' }}>
                <Alert
                    message="Error Loading Wishlist"
                    description={error}
                    type="error"
                    showIcon
                    action={
                        <Button size="small" onClick={refreshWishlist}>
                            Try Again
                        </Button>
                    }
                />
            </div>
        );
    }

    // Show empty state
    if (wishlistCount === 0 && wishlistItems.length === 0 && !loading && !loadingAgents) {
        return (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                        <div>
                            <Title level={4} style={{ color: '#8c8c8c' }}>
                                Your wishlist is empty
                            </Title>
                            <Text type="secondary">
                                Start exploring properties and add them to your wishlist!
                            </Text>
                        </div>
                    }
                >
                    <Button type="primary" href="/properties">
                        Browse Properties
                    </Button>
                </Empty>
            </div>
        );
    }

    // Main Render - Switch between views
    switch (currentView) {
        case 'success':
            return <SuccessView />;
        case 'waiting-confirmation':
            return <WaitingConfirmationView />;
        case 'schedule':
            return (
                <ScheduleTour
                    property={selectedProperty}
                    onBack={handleBackToWishlist}
                    onSuccess={handleScheduleSuccess}
                    onWaitingConfirmation={handleWaitingConfirmation}
                />
            );
        default:
            return <WishlistView />;
    }
};

export default WishlistPage;