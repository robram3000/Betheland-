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
    const [formKey, setFormKey] = useState(Date.now()); // Add form key to force reset

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
                propertiesData = response;
            } else if (response && Array.isArray(response.properties)) {
                propertiesData = response.properties;
            } else if (response && response.data && Array.isArray(response.data.properties)) {
                propertiesData = response.data.properties;
            } else if (response && response.success && Array.isArray(response.properties)) {
                propertiesData = response.properties;
            } else {
                console.warn('Unexpected response format:', response);
                propertiesData = [];
            }

            // Process images to ensure proper URLs
            const processedProperties = propertiesData.map(property => ({
                ...property,
                mainImage: processImageUrl(property.mainImage),
                propertyImages: Array.isArray(property.propertyImages)
                    ? property.propertyImages.map(img => ({
                        ...img,
                        imageUrl: processImageUrl(img.imageUrl)
                    }))
                    : []
            }));

            console.log('Loaded properties:', processedProperties);
            setProperties(processedProperties);
        } catch (error) {
            console.error('Error loading properties:', error);
            message.error('Failed to load properties: ' + error.message);
            setProperties([]);
        } finally {
            setLoading(false);
        }
    };

    // Helper function to process image URLs
    const processImageUrl = (url) => {
        if (!url) return '/default-property.jpg';

        // If it's already a full URL, return as is
        if (url.startsWith('http') || url.startsWith('//')) {
            return url;
        }

        // If it starts with /uploads, make it absolute
        if (url.startsWith('/uploads/')) {
            return url;
        }

        // If it's a relative path from wwwroot, prepend with /
        if (url.startsWith('uploads/')) {
            return '/' + url;
        }

        // If it's just a filename, assume it's in the default location
        if (url.includes('.')) {
            return '/uploads/properties/' + url;
        }

        return '/default-property.jpg';
    };

    const handleCreate = () => {
        setEditingProperty(null);
        setFormKey(Date.now()); // Reset form key
        setModalVisible(true);
    };

    const handleEdit = (property) => {
        // Process property images before editing
        const processedProperty = {
            ...property,
            mainImage: processImageUrl(property.mainImage),
            propertyImages: Array.isArray(property.propertyImages)
                ? property.propertyImages.map(img => ({
                    ...img,
                    imageUrl: processImageUrl(img.imageUrl)
                }))
                : []
        };

        setEditingProperty(processedProperty);
        setFormKey(Date.now()); // Reset form key
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
                                style={{ width: '100%', borderRadius: '8px', maxHeight: '300px', objectFit: 'cover' }}
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

    const handleSubmit = async (formData, isMultipart = false) => {
        setLoading(true);
        try {
            let result;
            if (editingProperty) {
                if (isMultipart) {
                    result = await propertyService.updatePropertyWithImages(editingProperty.id, formData);
                } else {
                    result = await propertyService.updateProperty(editingProperty.id, formData);
                }
            } else {
                if (isMultipart) {
                    result = await propertyService.createPropertyWithImages(formData);
                } else {
                    result = await propertyService.createProperty(formData);
                }
            }

            // Handle response structure
            const updatedProperty = result.property || result;

            // Process images in the response
            const processedProperty = {
                ...updatedProperty,
                mainImage: processImageUrl(updatedProperty.mainImage),
                propertyImages: Array.isArray(updatedProperty.propertyImages)
                    ? updatedProperty.propertyImages.map(img => ({
                        ...img,
                        imageUrl: processImageUrl(img.imageUrl)
                    }))
                    : []
            };

            if (editingProperty) {
                setProperties(prev => prev.map(prop =>
                    prop.id === editingProperty.id ? processedProperty : prop
                ));
            } else {
                setProperties(prev => [...prev, processedProperty]);
            }

            setModalVisible(false);
            setEditingProperty(null);
            setFormKey(Date.now()); // Reset form for next use
            message.success(`Property ${editingProperty ? 'updated' : 'created'} successfully!`);
        } catch (error) {
            message.error(`Failed to ${editingProperty ? 'update' : 'create'} property: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setModalVisible(false);
        setEditingProperty(null);
        setFormKey(Date.now()); // Reset form key
    };

    const handleExport = () => {
        message.info('Export functionality to be implemented');
    };

    const handleImport = () => {
        message.info('Import functionality to be implemented');
    };

    const rowSelection = {
        selectedRowKeys: selectedRows.map(row => row.id),
        onChange: (selectedRowKeys, selectedRows) => {
            setSelectedRows(selectedRows);
        },
    };

    const stats = {
        total: Array.isArray(properties) ? properties.length : 0,
        available: Array.isArray(properties) ? properties.filter(p => p.status === 'available').length : 0,
        sold: Array.isArray(properties) ? properties.filter(p => p.status === 'sold').length : 0,
        pending: Array.isArray(properties) ? properties.filter(p => p.status === 'pending').length : 0,
        totalValue: Array.isArray(properties) ? properties.reduce((sum, prop) => sum + (prop.price || 0), 0) : 0,
    };

    return (
        <div style={{ padding: '24px' }}>
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

            <Modal
                title={editingProperty ? "Edit Property" : "Add New Property"}
                open={modalVisible}
                onCancel={handleCancel}
                footer={null}
                width={1200}
                style={{ top: 20 }}
                destroyOnClose={true} // This ensures the form is destroyed when modal closes
            >
                <InsertProperty
                    key={formKey} // This forces a fresh form instance
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