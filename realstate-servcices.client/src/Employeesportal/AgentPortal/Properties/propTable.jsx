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
    const [formKey, setFormKey] = useState(Date.now());

    useEffect(() => {
        loadProperties();
    }, []);

    // Enhanced image URL processor - matches getUserProfileImage pattern
    const processImageUrl = (url) => {
        if (!url || url === 'string') {
            console.log('No URL or invalid URL provided:', url);
            return '/default-property.jpg';
        }

        // If it's already a full URL, return as is
        if (url.startsWith('http') || url.startsWith('//') || url.startsWith('blob:')) {
            return url;
        }

        // If it starts with /uploads, prepend the base URL
        if (url.startsWith('/uploads/')) {
            return `https://localhost:7075${url}`;
        }

        // If it's just a filename, construct the full URL
        if (url.includes('.') && !url.startsWith('/')) {
            const fullUrl = `https://localhost:7075/uploads/properties/${url}`;
            console.log('Converted filename to full URL:', url, '->', fullUrl);
            return fullUrl;
        }

        // If it's a relative path without leading slash, add base URL
        if (url.startsWith('uploads/')) {
            const fullUrl = `https://localhost:7075/${url}`;
            console.log('Added base URL to relative path:', url, '->', fullUrl);
            return fullUrl;
        }

        console.log('Using default image for URL:', url);
        return '/default-property.jpg';
    };

    const loadProperties = async () => {
        setLoading(true);
        try {
            const response = await propertyService.getAllProperties();
            console.log('Raw API response:', response);

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

            // Process images with detailed logging
            const processedProperties = propertiesData.map(property => {
                console.log('Processing property:', property.id, property.title);
                console.log('Raw mainImage:', property.mainImage);
                console.log('Raw propertyImages:', property.propertyImages);

                const processedProperty = {
                    ...property,
                    mainImage: processImageUrl(property.mainImage),
                    propertyImages: Array.isArray(property.propertyImages)
                        ? property.propertyImages.map(img => {
                            const processedImg = {
                                ...img,
                                imageUrl: processImageUrl(img.imageUrl)
                            };
                            console.log('Processed image:', img.imageUrl, '->', processedImg.imageUrl);
                            return processedImg;
                        })
                        : []
                };

                console.log('Final processed property:', processedProperty);
                return processedProperty;
            });

            console.log('All processed properties:', processedProperties);
            setProperties(processedProperties);
        } catch (error) {
            console.error('Error loading properties:', error);
            message.error('Failed to load properties: ' + error.message);
            setProperties([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingProperty(null);
        setFormKey(Date.now());
        setModalVisible(true);
    };

    const handleEdit = (property) => {
        console.log('Editing property:', property);

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

        console.log('Processed property for edit:', processedProperty);
        setEditingProperty(processedProperty);
        setFormKey(Date.now());
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
        const mainImageUrl = property.mainImage ||
            (property.propertyImages && property.propertyImages[0]?.imageUrl) ||
            '/default-property.jpg';

        console.log('Viewing property image:', mainImageUrl);

        Modal.info({
            title: property.title,
            width: 800,
            content: (
                <div>
                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <img
                                src={mainImageUrl}
                                alt={property.title}
                                style={{
                                    width: '100%',
                                    borderRadius: '8px',
                                    maxHeight: '300px',
                                    objectFit: 'cover'
                                }}
                                onError={(e) => {
                                    console.error('Failed to load image:', mainImageUrl);
                                    e.target.src = '/default-property.jpg';
                                }}
                            />
                            <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '8px' }}>
                                Image URL: {mainImageUrl}
                            </Text>
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
                        <Col span={24}>
                            <Text strong>All Images:</Text>
                            <Row gutter={[8, 8]} style={{ marginTop: '8px' }}>
                                {property.propertyImages && property.propertyImages.map((img, index) => (
                                    <Col key={index} span={6}>
                                        <img
                                            src={img.imageUrl}
                                            alt={`Property ${index + 1}`}
                                            style={{
                                                width: '100%',
                                                height: '80px',
                                                objectFit: 'cover',
                                                borderRadius: '4px'
                                            }}
                                            onError={(e) => {
                                                console.error('Failed to load thumbnail:', img.imageUrl);
                                                e.target.src = '/default-property.jpg';
                                            }}
                                        />
                                    </Col>
                                ))}
                            </Row>
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

            const updatedProperty = result.property || result;

            // Process the returned property data
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

            console.log('Submitted property result:', processedProperty);

            if (editingProperty) {
                setProperties(prev => prev.map(prop =>
                    prop.id === editingProperty.id ? processedProperty : prop
                ));
            } else {
                setProperties(prev => [...prev, processedProperty]);
            }

            setModalVisible(false);
            setEditingProperty(null);
            setFormKey(Date.now());
            message.success(`Property ${editingProperty ? 'updated' : 'created'} successfully!`);
        } catch (error) {
            console.error('Submit error:', error);
            message.error(`Failed to ${editingProperty ? 'update' : 'create'} property: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setModalVisible(false);
        setEditingProperty(null);
        setFormKey(Date.now());
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
                destroyOnClose={true}
            >
                <InsertProperty
                    key={formKey}
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