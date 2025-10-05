// WishlistPage.jsx (updated)
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
    Alert
} from 'antd';
import { HeartFilled, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useWishlistData } from '../Property/Services/WishlistAdded';
import WishlistCard from './WishlistCard'; // Import the fixed WishlistCard

const { Title, Text } = Typography;
const { TextArea } = Input;
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

    const handleScheduleTour = (property) => {
        setSelectedProperty(property);
        setIsScheduleModalVisible(true);
    };

    const handleViewDetails = (propertyId) => {
        // Use navigate instead of window.location for better SPA experience
        window.location.href = `/properties/view?id=${propertyId}`;
    };

    const handleScheduleSubmit = async (values) => {
        try {
            // Format the date and time
            const scheduledDate = values.date.format('YYYY-MM-DD');
            const scheduledTime = values.time.format('HH:mm');

            console.log('Scheduling tour:', {
                propertyId: selectedProperty.id,
                propertyTitle: selectedProperty.title,
                date: scheduledDate,
                time: scheduledTime,
                notes: values.notes
            });

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            message.success('Tour scheduled successfully! We will contact you to confirm.');
            setIsScheduleModalVisible(false);
            scheduleForm.resetFields();
        } catch (error) {
            console.error('Error scheduling tour:', error);
            message.error('Failed to schedule tour. Please try again.');
        }
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
                    console.log('Wishlist Item Structure:', wishlistItem);

                    // Use the wishlistItem directly since it contains all property data
                    const propertyData = wishlistItem;
                    const propertyId = wishlistItem.propertyId;

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

            {/* Schedule Tour Modal */}
            <Modal
                title={`Schedule Tour - ${selectedProperty?.title || 'Property'}`}
                open={isScheduleModalVisible}
                onCancel={() => {
                    setIsScheduleModalVisible(false);
                    scheduleForm.resetFields();
                }}
                footer={null}
                width={500}
            >
                <Form
                    form={scheduleForm}
                    layout="vertical"
                    onFinish={handleScheduleSubmit}
                >
                    <Form.Item
                        name="date"
                        label="Preferred Date"
                        rules={[{ required: true, message: 'Please select a date' }]}
                    >
                        <DatePicker style={{ width: '100%' }} />
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
                        />
                    </Form.Item>

                    <Form.Item
                        name="notes"
                        label="Additional Notes (Optional)"
                    >
                        <TextArea
                            rows={4}
                            placeholder="Any specific requirements or questions..."
                        />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button
                                onClick={() => {
                                    setIsScheduleModalVisible(false);
                                    scheduleForm.resetFields();
                                }}
                            >
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit">
                                Schedule Tour
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default WishlistPage;