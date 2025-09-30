// WishlistPage.jsx (updated to use WishlistCard)
import React, { useState, useEffect } from 'react';
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
    Spin
} from 'antd';
import { HeartFilled, DeleteOutlined } from '@ant-design/icons';
import WishlistCard from './WishlistCard';

const { Title, Text } = Typography;
const { TextArea } = Input;

const WishlistPage = () => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [isScheduleModalVisible, setIsScheduleModalVisible] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadWishlist = () => {
            try {
                setLoading(true);
                const savedWishlist = localStorage.getItem('propertyWishlist');
                if (savedWishlist) {
                    const parsedWishlist = JSON.parse(savedWishlist);
                    setWishlistItems(parsedWishlist);
                }
            } catch (error) {
                console.error('Error loading wishlist:', error);
                message.error('Failed to load wishlist');
            } finally {
                setLoading(false);
            }
        };

        loadWishlist();
    }, []);

    const handleRemoveFromWishlist = (propertyId) => {
        const updatedWishlist = wishlistItems.filter(item => item.id !== propertyId);
        setWishlistItems(updatedWishlist);
        localStorage.setItem('propertyWishlist', JSON.stringify(updatedWishlist));
        message.success('Property removed from wishlist');
    };

    const handleScheduleTour = (property) => {
        setSelectedProperty(property);
        setIsScheduleModalVisible(true);
    };

    const handleViewDetails = (propertyId) => {
        // Navigate to property details or show modal
        window.location.href = `/property/${propertyId}`;
    };

    const handleScheduleSubmit = (values) => {
        setLoading(true);
        setTimeout(() => {
            message.success('Tour scheduled successfully!');
            setIsScheduleModalVisible(false);
            setLoading(false);
        }, 1000);
    };

    const handleClearWishlist = () => {
        Modal.confirm({
            title: 'Clear Wishlist',
            content: 'Are you sure you want to remove all properties from your wishlist?',
            okText: 'Yes, Clear All',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk() {
                setWishlistItems([]);
                localStorage.removeItem('propertyWishlist');
                message.success('Wishlist cleared');
            }
        });
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '400px'
            }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{
            padding: '40px 24px',
            maxWidth: '1200px',
            margin: '0 auto',
            minHeight: '70vh'
        }}>
            <Space direction="vertical" size="large" style={{ width: '100%', marginBottom: '32px' }}>
                <Title level={1} style={{
                    color: '#1B3C53',
                    margin: 0,
                    fontSize: '2.5rem',
                    fontWeight: '700'
                }}>
                    My Wishlist
                </Title>

                <Space>
                    <Text strong style={{ color: '#64748b', fontSize: '16px' }}>
                        {wishlistItems.length} {wishlistItems.length === 1 ? 'property' : 'properties'} saved
                    </Text>

                    {wishlistItems.length > 0 && (
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={handleClearWishlist}
                            style={{ color: '#ff4d4f' }}
                        >
                            Clear All
                        </Button>
                    )}
                </Space>

                <Divider style={{ margin: '16px 0', background: '#f1f5f9' }} />
            </Space>

            {wishlistItems.length === 0 ? (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                        <Space direction="vertical" size="small">
                            <Text style={{ color: '#64748b', fontSize: '16px' }}>
                                Your wishlist is empty
                            </Text>
                            <Text type="secondary" style={{ fontSize: '14px' }}>
                                Start exploring properties and add them to your wishlist
                            </Text>
                        </Space>
                    }
                    style={{ marginTop: '80px', padding: '40px 0' }}
                >
                    <Button
                        type="primary"
                        size="large"
                        onClick={() => window.location.href = '/properties'}
                        style={{
                            background: '#1B3C53',
                            borderColor: '#1B3C53',
                            borderRadius: '8px',
                            fontWeight: '600'
                        }}
                    >
                        Browse Properties
                    </Button>
                </Empty>
            ) : (
                <Row gutter={[24, 24]}>
                    {wishlistItems.map(property => (
                        <Col key={property.id} xs={24} sm={12} lg={8} xl={6}>
                            <WishlistCard
                                property={property}
                                onRemoveFromWishlist={handleRemoveFromWishlist}
                                onScheduleTour={handleScheduleTour}
                                onViewDetails={handleViewDetails}
                            />
                        </Col>
                    ))}
                </Row>
            )}

            {/* Schedule Tour Modal remains the same */}
            <Modal
                title={<Space><HeartFilled style={{ color: '#1B3C53' }} />Schedule a Tour</Space>}
                open={isScheduleModalVisible}
                onCancel={() => setIsScheduleModalVisible(false)}
                footer={null}
                width={500}
            >
                {/* Modal content remains the same */}
            </Modal>
        </div>
    );
};

export default WishlistPage;