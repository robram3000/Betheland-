// ApprovalQueue.jsx
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
    Descriptions
} from 'antd';
import {
    CheckOutlined,
    CloseOutlined,
    EyeOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import BaseTable from './BaseTable';
import propertyService from './services/propertyService';

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
            const data = await propertyService.getPendingProperties();
            setPendingProperties(data);
            if (onUpdate) onUpdate();
        } catch (error) {
            message.error('Failed to load pending properties');
            console.error('Error loading pending properties:', error);
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
            render: (text, record) => (
                <Space>
                    <Avatar
                        src={record.propertyImages?.[0]?.imageUrl}
                        shape="square"
                        style={{ backgroundColor: '#1a365d' }}
                    >
                        {text?.[0]}
                    </Avatar>
                    <div>
                        <div style={{ fontWeight: 500 }}>{text}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                            {record.address}, {record.city}
                        </div>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            render: (type) => <Tag color="blue">{type}</Tag>,
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            render: (price) => price ? `$${price.toLocaleString()}` : 'Not set',
        },
        {
            title: 'Submitted By',
            dataIndex: 'submittedBy',
            key: 'submittedBy',
            render: (submittedBy) => submittedBy || 'System',
        },
        {
            title: 'Submitted Date',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => new Date(date).toLocaleDateString(),
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

    return (
        <div>
            <Card
                title={`Pending Approval (${pendingProperties.length})`}
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
                        pagination={false}
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
                    <Descriptions column={1} bordered size="small">
                        <Descriptions.Item label="Title">{selectedProperty.title}</Descriptions.Item>
                        <Descriptions.Item label="Description">
                            {selectedProperty.description}
                        </Descriptions.Item>
                        <Descriptions.Item label="Address">
                            {selectedProperty.address}, {selectedProperty.city}, {selectedProperty.state} {selectedProperty.zipCode}
                        </Descriptions.Item>
                        <Descriptions.Item label="Price">
                            ${selectedProperty.price?.toLocaleString()}
                        </Descriptions.Item>
                        <Descriptions.Item label="Type">{selectedProperty.type}</Descriptions.Item>
                        <Descriptions.Item label="Bedrooms/Bathrooms">
                            {selectedProperty.bedrooms} BD / {selectedProperty.bathrooms} BA
                        </Descriptions.Item>
                        <Descriptions.Item label="Area">
                            {selectedProperty.areaSqft?.toLocaleString()} sqft
                        </Descriptions.Item>
                        <Descriptions.Item label="Amenities">
                            {selectedProperty.amenities ? JSON.parse(selectedProperty.amenities).join(', ') : 'None'}
                        </Descriptions.Item>
                    </Descriptions>
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