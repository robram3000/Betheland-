// WishlistPage.jsx (updated with agent functionality)
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
    Form,
    DatePicker,
    Input,
    TimePicker,
    Spin,
    Alert,
    Select,
    Card
} from 'antd';
import {
    HeartFilled,
    DeleteOutlined,
    ExclamationCircleOutlined,
    UserOutlined,
    StarFilled,
    MailOutlined,
    PhoneOutlined,
    CalendarOutlined  // Added missing import
} from '@ant-design/icons';
import { useWishlistData } from '../Property/Services/WishlistAdded';
import WishlistCard from './WishlistCard';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { confirm } = Modal;

const WishlistPage = () => {
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

    const [isScheduleModalVisible, setIsScheduleModalVisible] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [scheduleForm] = Form.useForm();
    const [initialLoad, setInitialLoad] = useState(true);
    const [availableAgents, setAvailableAgents] = useState([]);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [schedulingTour, setSchedulingTour] = useState(false);

    // Mock function to fetch agents for a property - replace with your actual API
    const fetchAgentsForProperty = async (propertyId) => {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // This would typically come from your backend
        // For now, using mock data
        const mockAgents = [
            {
                id: 1,
                name: 'Maria Santos',
                email: 'maria.santos@realestate.com',
                phone: '+63 912 345 6789',
                profileImage: '/agent1.jpg',
                rating: 4.8,
                reviews: 127,
                isFirstChoice: true,
                specialties: ['Residential', 'Condominium'],
                yearsExperience: 8,
                languages: ['English', 'Tagalog', 'Bisaya']
            },
            {
                id: 2,
                name: 'Juan Dela Cruz',
                email: 'juan.delacruz@realestate.com',
                phone: '+63 917 654 3210',
                profileImage: '/agent2.jpg',
                rating: 4.6,
                reviews: 89,
                isFirstChoice: false,
                specialties: ['Commercial', 'Land'],
                yearsExperience: 5,
                languages: ['English', 'Tagalog']
            },
            {
                id: 3,
                name: 'Anna Reyes',
                email: 'anna.reyes@realestate.com',
                phone: '+63 918 777 8888',
                profileImage: '/agent3.jpg',
                rating: 4.9,
                reviews: 156,
                isFirstChoice: false,
                specialties: ['Luxury Homes', 'Beach Properties'],
                yearsExperience: 12,
                languages: ['English', 'Tagalog', 'Spanish']
            }
        ];
        return mockAgents;
    };

    // Debug: Log the wishlist items to see the actual data structure
    useEffect(() => {
        console.log('Wishlist Items:', wishlistItems);
        console.log('Wishlist Count:', wishlistCount);
    }, [wishlistItems, wishlistCount]);

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

    const handleRemoveFromWishlist = async (propertyId) => {
        try {
            await removeFromWishlistByProperty(propertyId);
            message.success('Property removed from wishlist');
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            message.error('Failed to remove property from wishlist');
        }
    };

    const handleScheduleTour = async (property) => {
        setSelectedProperty(property);

        try {
            // Fetch available agents for this property
            const agents = await fetchAgentsForProperty(property.propertyId);
            setAvailableAgents(agents);

            // Auto-select first choice agent if available
            const firstChoiceAgent = agents.find(agent => agent.isFirstChoice);
            if (firstChoiceAgent) {
                setSelectedAgent(firstChoiceAgent);
                scheduleForm.setFieldValue('agentId', firstChoiceAgent.id);
            } else if (agents.length > 0) {
                // Select the first agent if no first choice is set
                setSelectedAgent(agents[0]);
                scheduleForm.setFieldValue('agentId', agents[0].id);
            }

            setIsScheduleModalVisible(true);
        } catch (error) {
            console.error('Error fetching agents:', error);
            message.error('Failed to load available agents');
        }
    };

    const handleViewDetails = (propertyId) => {
        window.location.href = `/properties/view?id=${propertyId}`;
    };

    const handleScheduleSubmit = async (values) => {
        setSchedulingTour(true);
        try {
            const scheduledDate = values.date.format('YYYY-MM-DD');
            const scheduledTime = values.time.format('HH:mm');
            const selectedAgentData = availableAgents.find(agent => agent.id === values.agentId);

            console.log('Scheduling tour:', {
                propertyId: selectedProperty.propertyId,
                propertyTitle: selectedProperty.propertyTitle,
                agentId: values.agentId,
                agentName: selectedAgentData?.name,
                date: scheduledDate,
                time: scheduledTime,
                notes: values.notes
            });

            // Simulate API call to schedule tour
            await new Promise(resolve => setTimeout(resolve, 1500));

            message.success(
                <span>
                    Tour scheduled successfully with <strong>{selectedAgentData?.name}</strong>!
                    <br />We will contact you within 24 hours to confirm.
                </span>,
                5
            );

            setIsScheduleModalVisible(false);
            scheduleForm.resetFields();
            setSelectedAgent(null);
        } catch (error) {
            console.error('Error scheduling tour:', error);
            message.error('Failed to schedule tour. Please try again.');
        } finally {
            setSchedulingTour(false);
        }
    };

    const handleAgentChange = (agentId) => {
        const agent = availableAgents.find(a => a.id === agentId);
        setSelectedAgent(agent);
        scheduleForm.setFieldValue('agentId', agentId);
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
        } catch (error) {
            console.error('Error clearing wishlist:', error);
            message.error('Failed to clear wishlist');
        }
    };

    // Agent Card Component
    const AgentCard = ({ agent, isSelected, onSelect }) => (
        <Card
            style={{
                border: isSelected ? '2px solid #1B3C53' : '1px solid #d9d9d9',
                borderRadius: '8px',
                cursor: 'pointer',
                marginBottom: '12px',
                background: isSelected ? '#f0f9ff' : 'white',
                transition: 'all 0.2s ease'
            }}
            onClick={() => onSelect(agent.id)}
            hoverable
            bodyStyle={{ padding: '12px' }}
        >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: '#f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    flexShrink: 0
                }}>
                    {agent.profileImage ? (
                        <img
                            src={agent.profileImage}
                            alt={agent.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                    ) : (
                        <UserOutlined style={{ fontSize: '24px', color: '#8c8c8c' }} />
                    )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                        <Text strong style={{ fontSize: '14px' }}>{agent.name}</Text>
                        {agent.isFirstChoice && (
                            <div style={{
                                background: 'linear-gradient(135deg, #ffd666 0%, #ffc53d 100%)',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '10px',
                                fontWeight: 'bold',
                                color: '#000',
                                border: '1px solid #ffc53d'
                            }}>
                                👑 FIRST CHOICE
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <StarFilled style={{ color: '#faad14', fontSize: '12px' }} />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            {agent.rating} ({agent.reviews} reviews)
                        </Text>
                    </div>

                    <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '2px' }}>
                        {agent.specialties.join(', ')}
                    </Text>

                    <Text type="secondary" style={{ fontSize: '11px' }}>
                        {agent.yearsExperience} years experience • {agent.languages?.join(', ')}
                    </Text>
                </div>

                {isSelected && (
                    <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: '#1B3C53',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: 'white'
                        }} />
                    </div>
                )}
            </div>
        </Card>
    );

    // Show loading state
    if (loading && initialLoad) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <Spin size="large" tip="Loading your wishlist..." />
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
    if (wishlistCount === 0 && wishlistItems.length === 0 && !loading) {
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

    return (
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

            {/* Wishlist Items Grid */}
            <Row gutter={[24, 24]}>
               {wishlistItems.map((wishlistItem) => {
    const propertyData = wishlistItem;
    const propertyId = wishlistItem.propertyId;
    
    // Add this debug log
    console.log('Property status:', {
        id: propertyId,
        title: propertyData.propertyTitle,
        status: propertyData.propertyStatus,
        isAvailable: propertyData.propertyStatus === 'available'
    });

    return (
        <Col key={wishlistItem.id} xs={24} sm={12} lg={8} xl={6}>
            <WishlistCard
                property={propertyData}
                onRemove={() => handleRemoveFromWishlist(propertyId)}
                onScheduleTour={() => handleScheduleTour(propertyData)}
                onViewDetails={() => handleViewDetails(propertyId)}
            />
        </Col>
    );
})}
            </Row>

            {/* Schedule Tour Modal with Agent Selection */}
            <Modal
                title={
                    <div>
                        <div>Schedule Property Tour</div>
                        <Text type="secondary" style={{ fontSize: '14px', fontWeight: 'normal' }}>
                            {selectedProperty?.propertyTitle}
                        </Text>
                    </div>
                }
                open={isScheduleModalVisible}
                onCancel={() => {
                    setIsScheduleModalVisible(false);
                    scheduleForm.resetFields();
                    setSelectedAgent(null);
                }}
                footer={null}
                width={650}
                destroyOnClose
            >
                <Form
                    form={scheduleForm}
                    layout="vertical"
                    onFinish={handleScheduleSubmit}
                    requiredMark="optional"
                >
                    {/* Agent Selection Section */}
                    <div style={{ marginBottom: '24px' }}>
                        <Text strong style={{ display: 'block', marginBottom: '12px', fontSize: '14px' }}>
                            Select Your Preferred Agent
                        </Text>
                        <Text type="secondary" style={{ display: 'block', marginBottom: '16px', fontSize: '12px' }}>
                            Choose an agent to conduct your property tour. First choice agents are recommended based on property type and expertise.
                        </Text>

                        <Form.Item
                            name="agentId"
                            rules={[{ required: true, message: 'Please select an agent' }]}
                            style={{ marginBottom: '8px', display: 'none' }}
                        >
                            <Select />
                        </Form.Item>

                        <div style={{ maxHeight: '280px', overflowY: 'auto', padding: '4px' }}>
                            {availableAgents.map(agent => (
                                <AgentCard
                                    key={agent.id}
                                    agent={agent}
                                    isSelected={selectedAgent?.id === agent.id}
                                    onSelect={handleAgentChange}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Selected Agent Info */}
                    {selectedAgent && (
                        <div style={{
                            background: 'linear-gradient(135deg, #f6ffed 0%, #e6f7ff 100%)',
                            border: '1px solid #91d5ff',
                            borderRadius: '8px',
                            padding: '16px',
                            marginBottom: '20px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <UserOutlined style={{ color: '#1B3C53', fontSize: '16px' }} />
                                <Text strong style={{ fontSize: '14px', color: '#1B3C53' }}>
                                    Selected Agent: {selectedAgent.name}
                                </Text>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <MailOutlined style={{ fontSize: '12px', color: '#8c8c8c' }} />
                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                        {selectedAgent.email}
                                    </Text>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <PhoneOutlined style={{ fontSize: '12px', color: '#8c8c8c' }} />
                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                        {selectedAgent.phone}
                                    </Text>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tour Details Section */}
                    <Divider style={{ margin: '16px 0' }}>
                        <Text type="secondary" style={{ fontSize: '12px' }}>Tour Details</Text>
                    </Divider>

                    <Form.Item
                        name="date"
                        label="Preferred Date"
                        rules={[{ required: true, message: 'Please select a date' }]}
                    >
                        <DatePicker
                            style={{ width: '100%' }}
                            disabledDate={(current) => {
                                return current && current < Date.now().startOf('day');
                            }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="time"
                        label="Preferred Time"
                        rules={[{ required: true, message: 'Please select a time' }]}
                    >
                        <TimePicker
                            style={{ width: '100%' }}
                            format="HH:mm"
                            minuteStep={15}
                            showNow={false}
                            placeholder="Select time"
                        />
                    </Form.Item>

                    <Form.Item
                        name="notes"
                        label="Additional Notes (Optional)"
                        help="Any specific requirements, questions, or special requests for the agent"
                    >
                        <TextArea
                            rows={4}
                            placeholder="Example: I'd like to see the garden area, please bring the key for the storage room, I have questions about the HOA fees..."
                            maxLength={500}
                            showCount
                        />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button
                                onClick={() => {
                                    setIsScheduleModalVisible(false);
                                    scheduleForm.resetFields();
                                    setSelectedAgent(null);
                                }}
                                disabled={schedulingTour}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                disabled={!selectedAgent}
                                loading={schedulingTour}
                                icon={<CalendarOutlined />}
                            >
                                {schedulingTour ? 'Scheduling...' : `Schedule with ${selectedAgent?.name?.split(' ')[0] || 'Agent'}`}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default WishlistPage;