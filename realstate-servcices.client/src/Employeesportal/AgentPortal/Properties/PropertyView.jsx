import React from 'react';
import {
    Modal,
    Row,
    Col,
    Statistic,
    Typography,
    Image,
    Space,
    Tag,
    Divider
} from 'antd';
import {
    EnvironmentOutlined,
    HomeOutlined,
    BankOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const PropertyView = ({
    property,
    visible,
    onCancel
}) => {
    if (!property) return null;

    const processImageUrl = (url) => {
        if (!url || url === 'string') {
            return '/default-property.jpg';
        }
        if (url.startsWith('http') || url.startsWith('//') || url.startsWith('blob:')) {
            return url;
        }
        if (url.startsWith('/uploads/')) {
            return `https://localhost:7075${url}`;
        }
        if (url.includes('.') && !url.startsWith('/')) {
            return `https://localhost:7075/uploads/properties/${url}`;
        }
        if (url.startsWith('uploads/')) {
            return `https://localhost:7075/${url}`;
        }
        return '/default-property.jpg';
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'available': return 'green';
            case 'sold': return 'red';
            case 'pending': return 'orange';
            case 'rented': return 'blue';
            default: return 'default';
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const mainImageUrl = property.mainImage ||
        (property.propertyImages && property.propertyImages[0]?.imageUrl) ||
        '/default-property.jpg';

    return (
        <Modal
            title={property.title}
            open={visible}
            onCancel={onCancel}
            width={1000}
            footer={null}
        >
            <Row gutter={[24, 16]}>
                {/* Main Image */}
                <Col span={24}>
                    <div style={{ textAlign: 'center', marginBottom: 16 }}>
                        <Image
                            src={processImageUrl(mainImageUrl)}
                            alt={property.title}
                            style={{
                                maxHeight: '400px',
                                objectFit: 'cover',
                                borderRadius: '8px'
                            }}
                            fallback="/default-property.jpg"
                        />
                    </div>
                </Col>

                {/* Basic Information */}
                <Col span={24}>
                    <Title level={4}>Basic Information</Title>
                    <Divider />
                </Col>

                <Col xs={24} md={8}>
                    <Statistic
                        title="Price"
                        value={property.price}
                        prefix="₱"
                        valueStyle={{ color: '#1a365d' }}
                    />
                </Col>
                <Col xs={24} md={8}>
                    <Statistic
                        title="Type"
                        value={property.type?.charAt(0).toUpperCase() + property.type?.slice(1)}
                        prefix={<HomeOutlined />}
                    />
                </Col>
                <Col xs={24} md={8}>
                    <Statistic
                        title="Status"
                        valueRender={() => (
                            <Tag color={getStatusColor(property.status)}>
                                {property.status?.toUpperCase()}
                            </Tag>
                        )}
                    />
                </Col>

                {/* Property Details */}
                <Col span={24}>
                    <Title level={4}>Property Details</Title>
                    <Divider />
                </Col>

                <Col xs={12} md={6}>
                    <Statistic title="Bedrooms" value={property.bedrooms || 0} />
                </Col>
                <Col xs={12} md={6}>
                    <Statistic title="Bathrooms" value={property.bathrooms || 0} />
                </Col>
                <Col xs={12} md={6}>
                    <Statistic title="Area" value={property.areaSqft || 0} suffix="sqft" />
                </Col>
                <Col xs={12} md={6}>
                    <Statistic title="Property Age" value={property.propertyAge || 0} suffix="years" />
                </Col>

                {/* Location */}
                <Col span={24}>
                    <Title level={4}>Location</Title>
                    <Divider />
                </Col>

                <Col span={24}>
                    <Space direction="vertical" size="small">
                        <Text strong>
                            <EnvironmentOutlined /> Address
                        </Text>
                        <Text>
                            {property.address}, {property.city}, {property.state} {property.zipCode}
                        </Text>
                        {property.latitude && property.longitude && (
                            <Text type="secondary">
                                Coordinates: {property.latitude.toFixed(6)}, {property.longitude.toFixed(6)}
                            </Text>
                        )}
                    </Space>
                </Col>

                {/* Description */}
                <Col span={24}>
                    <Title level={4}>Description</Title>
                    <Divider />
                </Col>
                <Col span={24}>
                    <Text>{property.description}</Text>
                </Col>

                {/* Amenities */}
                {property.amenities && (
                    <>
                        <Col span={24}>
                            <Title level={4}>Amenities</Title>
                            <Divider />
                        </Col>
                        <Col span={24}>
                            <Space wrap>
                                {(() => {
                                    try {
                                        const amenitiesList = JSON.parse(property.amenities);
                                        return Array.isArray(amenitiesList) ?
                                            amenitiesList.map((amenity, index) => (
                                                <Tag key={index} color="blue">{amenity}</Tag>
                                            )) : null;
                                    } catch {
                                        return null;
                                    }
                                })()}
                            </Space>
                        </Col>
                    </>
                )}

                {/* Additional Images */}
                {property.propertyImages && property.propertyImages.length > 0 && (
                    <>
                        <Col span={24}>
                            <Title level={4}>Gallery</Title>
                            <Divider />
                        </Col>
                        <Col span={24}>
                            <Row gutter={[8, 8]}>
                                {property.propertyImages.map((img, index) => (
                                    <Col key={index} xs={12} sm={8} md={6}>
                                        <Image
                                            src={processImageUrl(img.imageUrl)}
                                            alt={`Property ${index + 1}`}
                                            style={{
                                                width: '100%',
                                                height: '100px',
                                                objectFit: 'cover',
                                                borderRadius: '4px'
                                            }}
                                            fallback="/default-property.jpg"
                                            preview={{
                                                mask: <div>View</div>,
                                            }}
                                        />
                                    </Col>
                                ))}
                            </Row>
                        </Col>
                    </>
                )}
            </Row>
        </Modal>
    );
};

export default PropertyView;