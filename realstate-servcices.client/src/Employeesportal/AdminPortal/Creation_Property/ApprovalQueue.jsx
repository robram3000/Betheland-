import React, { useState, useEffect } from 'react';
import {
    Table,
    Card,
    Space,
    Tag,
    Avatar,
    Button,
    Modal,
    Input,
    message,
    Empty,
    Descriptions,
    Badge,
    Row,
    Col,
    Statistic
} from 'antd';
import {
    CheckOutlined,
    CloseOutlined,
    EyeOutlined,
    ReloadOutlined,
    PictureOutlined
} from '@ant-design/icons';
import BaseTable from './BaseTable';
import propertyService from './services/propertyService';
import { processImageUrl, getPropertyImage } from './processImageUrl';

const { TextArea } = Input;

const ApprovalQueue = ({ onUpdate }) => {
    const [pendingProperties, setPendingProperties] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    useEffect(() => {
        loadPendingProperties();
    }, []);

    const loadPendingProperties = async () => {
        setLoading(true);
        try {
            const data = await propertyService.getPropertiesByStatus('pending');
            console.log('Pending properties loaded:', data);
            setPendingProperties(data || []);
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Error loading pending properties:', error);
            message.error('Failed to load pending properties');
            setPendingProperties([]);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (propertyId) => {
        try {
            await propertyService.approveProperty(propertyId);
            message.success('Property approved successfully');
            loadPendingProperties();
        } catch (error) {
            message.error('Failed to approve property');
        }
    };

    const handleReject = async (propertyId, reason) => {
        try {
            await propertyService.rejectProperty(propertyId, reason);
            message.success('Property rejected successfully');
            setRejectModalVisible(false);
            setRejectReason('');
            loadPendingProperties();
        } catch (error) {
            message.error('Failed to reject property');
        }
    };

    const handleView = (property) => {
        setSelectedProperty(property);
        setViewModalVisible(true);
    };

    const columns = [
        {
            title: 'Property',
            dataIndex: 'title',
            key: 'property',
            render: (text, record) => {
                const imageUrl = getPropertyImage(record);
                return (
                    <Space>
                        <Badge dot color="orange" offset={[-5, 5]}>
                            <Avatar
                                src={imageUrl}
                                shape="square"
                                style={{
                                    backgroundColor: '#1a365d',
                                    width: 50,
                                    height: 50,
                                    objectFit: 'cover'
                                }}
                                onError={(e) => {
                                    e.target.src = '/default-property.jpg';
                                }}
                            >
                                {text?.[0]?.toUpperCase()}
                            </Avatar>
                        </Badge>
                        <div>
                            <div style={{ fontWeight: 500 }}>{text || 'Untitled Property'}</div>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                                {record.address}, {record.city}
                            </div>
                            <div style={{ fontSize: '11px', color: '#888', marginTop: 4 }}>
                                Submitted: {new Date(record.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    </Space>
                );
            },
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            render: (type) => <Tag color="blue">{type || 'Not specified'}</Tag>,
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            render: (price) => price ? `₱${price.toLocaleString()}` : 'Not set',
            sorter: (a, b) => (a.price || 0) - (b.price || 0),
        },
        {
            title: 'Details',
            key: 'details',
            render: (_, record) => (
                <Space direction="vertical" size={2}>
                    <div>{record.bedrooms || 0} BD / {record.bathrooms || 0} BA</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                        {record.areaSqm ? `${record.areaSqm} sqm` : 'Area not set'}
                    </div>
                </Space>
            ),
        },
        {
            title: 'Submitted By',
            dataIndex: 'submittedBy',
            key: 'submittedBy',
            render: (submittedBy) => submittedBy || 'System',
        },
        {
            title: 'Date',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => new Date(date).toLocaleDateString(),
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="small">
                    <Button
                        icon={<EyeOutlined />}
                        size="small"
                        onClick={() => handleView(record)}
                    >
                        View
                    </Button>
                    <Button
                        icon={<CheckOutlined />}
                        size="small"
                        type="primary"
                        onClick={() => handleApprove(record.id)}
                    >
                        Approve
                    </Button>
                    <Button
                        icon={<CloseOutlined />}
                        size="small"
                        danger
                        onClick={() => {
                            setSelectedProperty(record);
                            setRejectModalVisible(true);
                        }}
                    >
                        Reject
                    </Button>
                </Space>
            ),
        },
    ];

    const getStats = () => {
        const total = pendingProperties.length;
        const today = new Date().toDateString();
        const todayCount = pendingProperties.filter(p =>
            new Date(p.createdAt).toDateString() === today
        ).length;
        const highPrice = pendingProperties.filter(p => (p.price || 0) > 1000000).length;

        return { total, todayCount, highPrice };
    };

    const stats = getStats();

    return (
        <div>
            {/* Stats Cards */}
            <div style={{ marginBottom: 24 }}>
                <Row gutter={16}>
                    <Col span={8}>
                        <Card>
                            <Statistic
                                title="Total Pending"
                                value={stats.total}
                                valueStyle={{ color: '#fa8c16' }}
                                prefix={<ReloadOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card>
                            <Statistic
                                title="Submitted Today"
                                value={stats.todayCount}
                                valueStyle={{ color: '#1890ff' }}
                                prefix={<EyeOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card>
                            <Statistic
                                title="Premium Properties"
                                value={stats.highPrice}
                                valueStyle={{ color: '#52c41a' }}
                                prefix={<CheckOutlined />}
                            />
                        </Card>
                    </Col>
                </Row>
            </div>

            <Card
                title={`Pending Approval Queue (${pendingProperties.length})`}
                extra={
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={loadPendingProperties}
                        loading={loading}
                    >
                        Refresh
                    </Button>
                }
            >
                {pendingProperties.length === 0 ? (
                    <Empty
                        description="No properties pending approval"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                ) : (
                    <BaseTable
                        data={pendingProperties}
                        columns={columns}
                        loading={loading}
                        rowKey="id"
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) =>
                                `${range[0]}-${range[1]} of ${total} pending properties`,
                        }}
                        scroll={{ x: 1000 }}
                    />
                )}
            </Card>

            {/* View Property Modal */}
            <Modal
                title="Property Details - Pending Approval"
                open={viewModalVisible}
                onCancel={() => setViewModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setViewModalVisible(false)}>
                        Close
                    </Button>,
                    <Button
                        key="reject"
                        danger
                        icon={<CloseOutlined />}
                        onClick={() => {
                            setViewModalVisible(false);
                            setRejectModalVisible(true);
                        }}
                    >
                        Reject
                    </Button>,
                    <Button
                        key="approve"
                        type="primary"
                        icon={<CheckOutlined />}
                        onClick={() => {
                            handleApprove(selectedProperty?.id);
                            setViewModalVisible(false);
                        }}
                    >
                        Approve
                    </Button>
                ]}
                width={700}
            >
                {selectedProperty && (
                    <div>
                        {/* Property Image */}
                        <div style={{ textAlign: 'center', marginBottom: 16 }}>
                            <img
                                src={getPropertyImage(selectedProperty)}
                                alt={selectedProperty.title}
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '200px',
                                    borderRadius: '8px',
                                    objectFit: 'cover'
                                }}
                                onError={(e) => {
                                    e.target.src = '/default-property.jpg';
                                }}
                            />
                        </div>

                        <Descriptions column={1} bordered size="small">
                            <Descriptions.Item label="Title">{selectedProperty.title}</Descriptions.Item>
                            <Descriptions.Item label="Description">
                                {selectedProperty.description || 'No description'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Address">
                                {selectedProperty.address}, {selectedProperty.city}, {selectedProperty.state} {selectedProperty.zipCode}
                            </Descriptions.Item>
                            <Descriptions.Item label="Price">
                                ₱{selectedProperty.price?.toLocaleString()}
                            </Descriptions.Item>
                            <Descriptions.Item label="Type">{selectedProperty.type}</Descriptions.Item>
                            <Descriptions.Item label="Bedrooms/Bathrooms">
                                {selectedProperty.bedrooms || 0} BD / {selectedProperty.bathrooms || 0} BA
                            </Descriptions.Item>
                            <Descriptions.Item label="Area">
                                {selectedProperty.areaSqm?.toLocaleString()} sqm
                            </Descriptions.Item>
                            <Descriptions.Item label="Amenities">
                                {selectedProperty.amenities ?
                                    (Array.isArray(selectedProperty.amenities) ?
                                        selectedProperty.amenities.join(', ') :
                                        selectedProperty.amenities
                                    ) : 'None'
                                }
                            </Descriptions.Item>
                            <Descriptions.Item label="Submitted Date">
                                {new Date(selectedProperty.createdAt).toLocaleString()}
                            </Descriptions.Item>
                        </Descriptions>
                    </div>
                )}
            </Modal>

            {/* Reject Modal */}
            <Modal
                title="Reject Property"
                open={rejectModalVisible}
                onCancel={() => {
                    setRejectModalVisible(false);
                    setRejectReason('');
                }}
                onOk={() => handleReject(selectedProperty?.id, rejectReason)}
                okText="Reject Property"
                okType="danger"
            >
                <p>Are you sure you want to reject "<strong>{selectedProperty?.title}</strong>"?</p>
                <TextArea
                    placeholder="Please provide a reason for rejection (required)..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={4}
                    required
                />
            </Modal>
        </div>
    );
};

export default ApprovalQueue;