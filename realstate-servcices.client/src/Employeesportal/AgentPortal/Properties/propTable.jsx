// Updated propTable.jsx with proper data handling
import React, { useState, useEffect } from 'react';
import {
    Button,
    Modal,
    message,
    Space,
    Row,
    Col,
    Statistic,
    Typography,
    Card
} from 'antd';
import {
    PlusOutlined,
    ExportOutlined,
    ImportOutlined,
} from '@ant-design/icons';
import BaseTableProperty from './BaseTableProperty';
import InsertProperty from './InsertProperty';
import propertyService from './Services/propertyService';

const { Title, Text } = Typography;

const PropTable = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingProperty, setEditingProperty] = useState(null);
    const [selectedRows, setSelectedRows] = useState([]);

    useEffect(() => {
        loadProperties();
    }, []);

    const loadProperties = async () => {
        setLoading(true);
        try {
            const response = await propertyService.getAllProperties();

            // Handle different response structures
            let propertiesData = [];

            if (Array.isArray(response)) {
                // If response is directly an array
                propertiesData = response;
            } else if (response && Array.isArray(response.properties)) {
                // If response has a properties array (from PropertiesResponse)
                propertiesData = response.properties;
            } else if (response && response.data && Array.isArray(response.data.properties)) {
                // If response is Axios response with data property
                propertiesData = response.data.properties;
            } else if (response && response.success && Array.isArray(response.properties)) {
                // If response has success flag and properties array
                propertiesData = response.properties;
            } else {
                console.warn('Unexpected response format:', response);
                propertiesData = [];
            }

            console.log('Loaded properties:', propertiesData);
            setProperties(propertiesData);
        } catch (error) {
            console.error('Error loading properties:', error);
            message.error('Failed to load properties: ' + error.message);
            setProperties([]); // Ensure properties is always an array
        } finally {
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
            await propertyService.deleteProperty(propertyId);
            setProperties(prev => prev.filter(prop => prop.id !== propertyId));
            message.success('Property deleted successfully');
        } catch (error) {
            message.error('Failed to delete property: ' + error.message);
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
                                src={property.mainImage || (property.propertyImages && property.propertyImages[0]?.imageUrl) || '/default-property.jpg'}
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
            let result;
            if (editingProperty) {
                // Update existing property
                result = await propertyService.updateProperty(editingProperty.id, formData);
                setProperties(prev => prev.map(prop =>
                    prop.id === editingProperty.id ? (result.property || result) : prop
                ));
                message.success('Property updated successfully');
            } else {
                // Create new property
                result = await propertyService.createProperty(formData);
                const newProperty = result.property || result;
                setProperties(prev => [...prev, newProperty]);
                message.success('Property created successfully');
            }
            setModalVisible(false);
            setEditingProperty(null);
        } catch (error) {
            message.error(`Failed to ${editingProperty ? 'update' : 'create'} property: ${error.message}`);
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

    // Safe statistics calculation
    const stats = {
        total: Array.isArray(properties) ? properties.length : 0,
        available: Array.isArray(properties) ? properties.filter(p => p.status === 'available').length : 0,
        sold: Array.isArray(properties) ? properties.filter(p => p.status === 'sold').length : 0,
        pending: Array.isArray(properties) ? properties.filter(p => p.status === 'pending').length : 0,
        totalValue: Array.isArray(properties) ? properties.reduce((sum, prop) => sum + (prop.price || 0), 0) : 0,
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
                            style={{ backgroundColor: '#1a365d', borderColor: '#1a365d' }}
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
                            valueStyle={{ color: '#1a365d' }}
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
                            valueStyle={{ color: '#1a365d' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Property Table */}
            <BaseTableProperty
                dataSource={Array.isArray(properties) ? properties : []}
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