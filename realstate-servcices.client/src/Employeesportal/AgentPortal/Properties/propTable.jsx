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
import PropertyInsert from './PropertyInsert';
import PropertyUpdate from './PropertyUpdate';
import PropertyView from './PropertyView';
import propertyService from './Services/propertyService';
import authService from '../../../Authpage/Services/LoginAuth';

const { Title, Text } = Typography;

const PropTable = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(false);
    const [insertModalVisible, setInsertModalVisible] = useState(false);
    const [updateModalVisible, setUpdateModalVisible] = useState(false);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [editingProperty, setEditingProperty] = useState(null);
    const [viewingProperty, setViewingProperty] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        loadProperties();
        getCurrentUser();
    }, []);

    const getCurrentUser = () => {
        const user = authService.getCurrentUser();
        setCurrentUser(user);
    };

    const loadProperties = async () => {
        setLoading(true);
        try {
            const response = await propertyService.getAllProperties();
            // Process properties data...
            setProperties(processedProperties);
        } catch (error) {
            message.error('Failed to load properties: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Insert Handlers
    const handleInsert = () => {
        setInsertModalVisible(true);
    };

    const handleInsertSubmit = async (formData, isMultipart) => {
        setLoading(true);
        try {
            let result;
            if (isMultipart) {
                result = await propertyService.createPropertyWithImages(formData);
            } else {
                const propertyData = JSON.parse(formData.get('propertyData'));
                propertyData.Property.AgentId = currentUser?.userId;
                result = await propertyService.createProperty(propertyData);
            }
            // Add new property to list
            setInsertModalVisible(false);
            message.success('Property created successfully!');
            loadProperties(); // Reload the list
        } catch (error) {
            message.error('Failed to create property: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Update Handlers
    const handleUpdate = (property) => {
        setEditingProperty(property);
        setUpdateModalVisible(true);
    };

    const handleUpdateSubmit = async (formData, isMultipart) => {
        setLoading(true);
        try {
            let result;
            if (isMultipart) {
                result = await propertyService.updatePropertyWithImages(editingProperty.id, formData);
            } else {
                const propertyData = JSON.parse(formData.get('propertyData'));
                result = await propertyService.updateProperty(editingProperty.id, propertyData);
            }
            setUpdateModalVisible(false);
            setEditingProperty(null);
            message.success('Property updated successfully!');
            loadProperties(); // Reload the list
        } catch (error) {
            message.error('Failed to update property: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // View Handlers
    const handleView = (property) => {
        setViewingProperty(property);
        setViewModalVisible(true);
    };

    // Delete Handler
    const handleDelete = async (propertyId) => {
        try {
            await propertyService.deleteProperty(propertyId);
            message.success('Property deleted successfully');
            loadProperties();
        } catch (error) {
            message.error('Failed to delete property: ' + error.message);
        }
    };

    return (
        <div style={{ padding: '24px' }}>
            {/* Header and Stats */}
            <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                <Col>
                    <Title level={2}>Property Management</Title>
                </Col>
                <Col>
                    <Space>
                        <Button icon={<ExportOutlined />}>Export</Button>
                        <Button icon={<ImportOutlined />}>Import</Button>
                        <Button type="primary" icon={<PlusOutlined />} onClick={handleInsert}>
                            Add Property
                        </Button>
                    </Space>
                </Col>
            </Row>

            {/* Statistics */}

            {/* Table */}
            <BaseTableProperty
                dataSource={properties}
                loading={loading}
                onEdit={handleUpdate}
                onDelete={handleDelete}
                onView={handleView}
                onCreate={handleInsert}
                onRefresh={loadProperties}
            />

            {/* Insert Modal */}
            <Modal
                title="Add New Property"
                open={insertModalVisible}
                onCancel={() => setInsertModalVisible(false)}
                footer={null}
                width={1200}
            >
                <PropertyInsert
                    onSubmit={handleInsertSubmit}
                    onCancel={() => setInsertModalVisible(false)}
                    loading={loading}
                    currentUser={currentUser}
                />
            </Modal>

            {/* Update Modal */}
            <Modal
                title="Edit Property"
                open={updateModalVisible}
                onCancel={() => {
                    setUpdateModalVisible(false);
                    setEditingProperty(null);
                }}
                footer={null}
                width={1200}
            >
                <PropertyUpdate
                    property={editingProperty}
                    onSubmit={handleUpdateSubmit}
                    onCancel={() => {
                        setUpdateModalVisible(false);
                        setEditingProperty(null);
                    }}
                    loading={loading}
                    currentUser={currentUser}
                />
            </Modal>

            {/* View Modal */}
            <PropertyView
                property={viewingProperty}
                visible={viewModalVisible}
                onCancel={() => {
                    setViewModalVisible(false);
                    setViewingProperty(null);
                }}
            />
        </div>
    );
};

export default PropTable;