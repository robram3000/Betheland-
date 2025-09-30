// propTable.jsx
import React, { useState, useEffect } from 'react';
import {
    Button,
    Modal,
    message,
    Space,
    Row,
    Col,
    Statistic,
    Flex,
    Typography,
    Table,
    Card // Add Card to the imports
} from 'antd';
import {
    PlusOutlined,
    ExportOutlined,
    ImportOutlined,
} from '@ant-design/icons';
import BaseTableProperty from './BaseTableProperty';
import InsertProperty from './InsertProperty';

const { Title, Text } = Typography;

const PropTable = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingProperty, setEditingProperty] = useState(null);
    const [selectedRows, setSelectedRows] = useState([]);

    // Mock data - replace with actual API calls
    const mockProperties = [
        {
            id: 1,
            propertyNo: 'PROP-001-ABC123',
            title: 'Beautiful Modern House in Downtown',
            description: 'A stunning modern house with panoramic city views...',
            type: 'house',
            price: 750000,
            propertyAge: 5,
            propertyFloor: 2,
            bedrooms: 4,
            bathrooms: 3.5,
            areaSqft: 2800,
            address: '123 Main Street',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            latitude: 40.7128,
            longitude: -74.0060,
            status: 'available',
            ownerId: '101',
            agentId: '201',
            listedDate: '2024-01-15',
            mainImage: '/house1.jpg',
            propertyImages: [
                { imageUrl: '/house1-1.jpg' },
                { imageUrl: '/house1-2.jpg' },
            ],
        },
        {
            id: 2,
            propertyNo: 'PROP-002-DEF456',
            title: 'Luxury Apartment with Pool',
            description: 'Spacious luxury apartment with resort-style amenities...',
            type: 'apartment',
            price: 250000,
            propertyAge: 2,
            propertyFloor: 15,
            bedrooms: 2,
            bathrooms: 2,
            areaSqft: 1200,
            address: '456 Park Avenue',
            city: 'Los Angeles',
            state: 'CA',
            zipCode: '90001',
            latitude: 34.0522,
            longitude: -118.2437,
            status: 'sold',
            ownerId: '102',
            agentId: '202',
            listedDate: '2024-01-10',
            mainImage: '/apartment1.jpg',
            propertyImages: [
                { imageUrl: '/apartment1-1.jpg' },
                { imageUrl: '/apartment1-2.jpg' },
            ],
        },
        {
            id: 3,
            propertyNo: 'PROP-003-GHI789',
            title: 'Cozy Studio in City Center',
            description: 'Perfect studio apartment for young professionals...',
            type: 'condo',
            price: 180000,
            propertyAge: 1,
            propertyFloor: 8,
            bedrooms: 1,
            bathrooms: 1,
            areaSqft: 650,
            address: '789 Downtown Blvd',
            city: 'Chicago',
            state: 'IL',
            zipCode: '60007',
            latitude: 41.8781,
            longitude: -87.6298,
            status: 'pending',
            ownerId: '103',
            agentId: null,
            listedDate: '2024-01-20',
            mainImage: '/studio1.jpg',
            propertyImages: [
                { imageUrl: '/studio1-1.jpg' },
                { imageUrl: '/studio1-2.jpg' },
            ],
        },
    ];

    useEffect(() => {
        loadProperties();
    }, []);

    const loadProperties = async () => {
        setLoading(true);
        try {
            // Simulate API call
            setTimeout(() => {
                setProperties(mockProperties);
                setLoading(false);
            }, 1000);
        } catch (error) {
            message.error('Failed to load properties');
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingProperty(null);
        setModalVisible(true);
    };

    const handleEdit = (property) => {
        setEditingProperty(property);
        setModalVisible(true);
    };

    const handleDelete = async (propertyId) => {
        try {
            // Simulate API call
            setProperties(prev => prev.filter(prop => prop.id !== propertyId));
            message.success('Property deleted successfully');
        } catch (error) {
            message.error('Failed to delete property');
        }
    };

    const handleView = (property) => {
        Modal.info({
            title: property.title,
            width: 800,
            content: (
                <div>
                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <img
                                src={property.mainImage}
                                alt={property.title}
                                style={{ width: '100%', borderRadius: '8px' }}
                            />
                        </Col>
                        <Col span={12}>
                            <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                <Statistic title="Price" value={property.price} prefix="₱" />
                                <Statistic title="Type" value={property.type} />
                                <Statistic title="Status" value={property.status} />
                                <Statistic title="Bedrooms" value={property.bedrooms} />
                                <Statistic title="Bathrooms" value={property.bathrooms} />
                                <Statistic title="Area" value={property.areaSqft} suffix="sqft" />
                            </Space>
                        </Col>
                        <Col span={24}>
                            <Text strong>Description:</Text>
                            <p>{property.description}</p>
                        </Col>
                        <Col span={24}>
                            <Text strong>Address:</Text>
                            <p>{property.address}, {property.city}, {property.state} {property.zipCode}</p>
                        </Col>
                    </Row>
                </div>
            ),
        });
    };

    const handleSubmit = async (formData) => {
        setLoading(true);
        try {
            // Simulate API call
            if (editingProperty) {
                // Update existing property
                setProperties(prev => prev.map(prop =>
                    prop.id === editingProperty.id
                        ? { ...formData, id: editingProperty.id }
                        : prop
                ));
                message.success('Property updated successfully');
            } else {
                // Create new property
                const newProperty = {
                    ...formData,
                    id: Math.max(...properties.map(p => p.id)) + 1,
                    propertyNo: `PROP-${String(properties.length + 1).padStart(3, '0')}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
                    listedDate: new Date().toISOString().split('T')[0],
                };
                setProperties(prev => [...prev, newProperty]);
                message.success('Property created successfully');
            }
            setModalVisible(false);
            setEditingProperty(null);
        } catch (error) {
            message.error(`Failed to ${editingProperty ? 'update' : 'create'} property`);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setModalVisible(false);
        setEditingProperty(null);
    };

    const handleExport = () => {
        // Implement export functionality
        message.info('Export functionality to be implemented');
    };

    const handleImport = () => {
        // Implement import functionality
        message.info('Import functionality to be implemented');
    };

    const rowSelection = {
        selectedRowKeys: selectedRows.map(row => row.id),
        onChange: (selectedRowKeys, selectedRows) => {
            setSelectedRows(selectedRows);
        },
    };

    const stats = {
        total: properties.length,
        available: properties.filter(p => p.status === 'available').length,
        sold: properties.filter(p => p.status === 'sold').length,
        pending: properties.filter(p => p.status === 'pending').length,
        totalValue: properties.reduce((sum, prop) => sum + prop.price, 0),
    };

    return (
        <div style={{ padding: '24px' }}>
            {/* Header Section */}
            <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                <Col>
                    <Title level={2} style={{ margin: 0, color: '#1a365d' }}>
                        Property Management
                    </Title>
                    <Text type="secondary">
                        Manage your property listings and inventory
                    </Text>
                </Col>
                <Col>
                    <Space>
                        <Button
                            icon={<ExportOutlined />}
                            onClick={handleExport}
                        >
                            Export
                        </Button>
                        <Button
                            icon={<ImportOutlined />}
                            onClick={handleImport}
                        >
                            Import
                        </Button>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleCreate}
                            style={{ backgroundColor: '#1a365d', borderColor: '#1a365d' }} // Dark blue color
                        >
                            Add Property
                        </Button>
                    </Space>
                </Col>
            </Row>

            {/* Statistics */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={12} sm={6}>
                    <Card>
                        <Statistic
                            title="Total Properties"
                            value={stats.total}
                            valueStyle={{ color: '#1a365d' }} // Dark blue color
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card>
                        <Statistic
                            title="Available"
                            value={stats.available}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card>
                        <Statistic
                            title="Sold"
                            value={stats.sold}
                            valueStyle={{ color: '#f5222d' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card>
                        <Statistic
                            title="Total Value"
                            value={stats.totalValue}
                            prefix="₱"
                            valueStyle={{ color: '#1a365d' }} // Dark blue color
                        />
                    </Card>
                </Col>
            </Row>

            {/* Property Table */}
            <BaseTableProperty
                dataSource={properties}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
                onCreate={handleCreate}
                onRefresh={loadProperties}
                rowSelection={rowSelection}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                }}
            />

            {/* Add/Edit Property Modal */}
            <Modal
                title={editingProperty ? "Edit Property" : "Add New Property"}
                open={modalVisible}
                onCancel={handleCancel}
                footer={null}
                width={1200}
                style={{ top: 20 }}
            >
                <InsertProperty
                    initialValues={editingProperty}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    loading={loading}
                    isEdit={!!editingProperty}
                />
            </Modal>
        </div>
    );
};

export default PropTable;