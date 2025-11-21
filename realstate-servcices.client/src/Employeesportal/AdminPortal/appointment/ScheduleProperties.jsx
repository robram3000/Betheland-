// ScheduleProperties.jsx - Fixed with real service integration
import React, { useState, useEffect } from 'react';
import {
    Table,
    Card,
    Button,
    Space,
    Tag,
    Modal,
    Form,
    Input,
    Switch,
    Select,
    message,
    Tooltip,
    Row,
    Col,
    Popconfirm,
    InputNumber,
    Alert,
    Spin
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    CheckOutlined,
    CloseOutlined,
    HomeOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import BaseTable from './BaseTable';
import propertyService from '../Creation_Property/services/propertyService';

// Destructure necessary components
const { Option } = Select;
const { TextArea } = Input;

const ScheduleProperties = ({ onScheduleUpdate }) => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [form] = Form.useForm();
    const [error, setError] = useState(null);

    const propertyTypes = [
        'Residential',
        'Commercial',
        'Land',
        'Industrial',
        'Agricultural'
    ];

    const propertyStatuses = [
        'Available',
        'Under Contract',
        'Sold',
        'Rented',
        'Maintenance'
    ];

    useEffect(() => {
        loadProperties();
    }, []);

    const loadProperties = async () => {
        setLoading(true);
        setError(null);
        try {
            // Use actual service instead of mock data
            const propertiesData = await propertyService.getAllProperties();

            if (propertiesData && Array.isArray(propertiesData)) {
                // Map the properties to include scheduling-specific fields
                const mappedProperties = propertiesData.map(property => ({
                    id: property.id,
                    title: property.title,
                    address: property.address,
                    city: property.city,
                    state: property.state,
                    type: property.propertyType || 'Residential',
                    status: property.status || 'Available',
                    isSchedulable: property.isActive !== false, // Default to true if active
                    maxVisitors: property.maxVisitors || 5,
                    visitDurationMinutes: property.visitDurationMinutes || 60,
                    specialInstructions: property.specialInstructions || '',
                    contactPerson: property.contactPerson || 'Property Manager',
                    contactPhone: property.contactPhone || 'N/A',
                    price: property.price,
                    bedrooms: property.bedrooms,
                    bathrooms: property.bathrooms,
                    areaSqm: property.areaSqm,
                    mainImage: property.mainImage
                }));
                setProperties(mappedProperties);
            } else {
                setProperties([]);
                message.warning('No properties found');
            }
        } catch (error) {
            console.error('Error loading properties:', error);
            const errorMessage = error.message || 'Failed to load properties';
            setError(errorMessage);
            message.error(errorMessage);
            setProperties([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedProperty(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (property) => {
        setSelectedProperty(property);
        form.setFieldsValue({
            title: property.title,
            address: property.address,
            type: property.type,
            status: property.status,
            maxVisitors: property.maxVisitors,
            visitDurationMinutes: property.visitDurationMinutes,
            specialInstructions: property.specialInstructions,
            contactPerson: property.contactPerson,
            contactPhone: property.contactPhone,
            isSchedulable: property.isSchedulable
        });
        setModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            // Use actual service to delete property
            const result = await propertyService.deleteProperty(id);
            if (result) {
                message.success('Property deleted successfully');
                loadProperties();
                if (onScheduleUpdate) onScheduleUpdate();
            }
        } catch (error) {
            console.error('Error deleting property:', error);
            message.error(error.message || 'Failed to delete property');
        }
    };

    const handleSubmit = async (values) => {
        try {
            const propertyData = {
                ...values,
                id: selectedProperty?.id
            };

            if (selectedProperty) {
                // Update existing property
                const result = await propertyService.updateProperty(selectedProperty.id, propertyData);
                if (result) {
                    message.success('Property updated successfully');
                }
            } else {
                // Create new property
                const result = await propertyService.createProperty(propertyData);
                if (result) {
                    message.success('Property created successfully');
                }
            }

            setModalVisible(false);
            loadProperties();
            if (onScheduleUpdate) onScheduleUpdate();
        } catch (error) {
            console.error('Error saving property:', error);
            message.error(error.message || 'Failed to save property');
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'Available': 'green',
            'Under Contract': 'orange',
            'Sold': 'red',
            'Rented': 'blue',
            'Maintenance': 'purple'
        };
        return colors[status] || 'default';
    };

    const renderErrorAlert = () => {
        if (!error) return null;
        return (
            <Alert
                message="Loading Error"
                description={error}
                type="error"
                showIcon
                action={
                    <Button size="small" onClick={loadProperties} icon={<ReloadOutlined />}>
                        Retry
                    </Button>
                }
                style={{ marginBottom: 16, borderRadius: 8 }}
            />
        );
    };

    const columns = [
        {
            title: 'Property Title',
            dataIndex: 'title',
            key: 'title',
            width: 200,
            render: (text, record) => (
                <Space direction="vertical" size={0}>
                    <div style={{ fontWeight: 500 }}>{text}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                        {record.address}
                    </div>
                </Space>
            )
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            width: 120
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status) => (
                <Tag color={getStatusColor(status)}>
                    {status}
                </Tag>
            )
        },
        {
            title: 'Schedulable',
            dataIndex: 'isSchedulable',
            key: 'isSchedulable',
            width: 100,
            render: (schedulable) => (
                <Tag color={schedulable ? 'green' : 'red'} icon={schedulable ? <CheckOutlined /> : <CloseOutlined />}>
                    {schedulable ? 'Yes' : 'No'}
                </Tag>
            )
        },
        {
            title: 'Max Visitors',
            dataIndex: 'maxVisitors',
            key: 'maxVisitors',
            width: 100
        },
        {
            title: 'Visit Duration',
            dataIndex: 'visitDurationMinutes',
            key: 'visitDuration',
            width: 100,
            render: (minutes) => `${minutes} min`
        },
        {
            title: 'Contact Person',
            dataIndex: 'contactPerson',
            key: 'contactPerson',
            width: 150
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 120,
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Edit">
                        <Button
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Are you sure to delete this property?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Tooltip title="Delete">
                            <Button
                                icon={<DeleteOutlined />}
                                size="small"
                                danger
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div>
            <Card>
                <div style={{
                    marginBottom: 16,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <h3 style={{ margin: 0 }}>Schedule Properties</h3>
                        <p style={{ margin: 0, color: '#666' }}>
                            Manage properties available for scheduling appointments
                        </p>
                    </div>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleCreate}
                    >
                        Add Property
                    </Button>
                </div>

                {renderErrorAlert()}

                <BaseTable
                    data={properties}
                    columns={columns}
                    loading={loading}
                    rowKey="id"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                    }}
                />
            </Card>

            {/* Create/Edit Modal */}
            <Modal
                title={selectedProperty ? 'Edit Property' : 'Add Property'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        name="title"
                        label="Property Title"
                        rules={[{ required: true, message: 'Please enter property title' }]}
                    >
                        <Input placeholder="Enter property title" />
                    </Form.Item>

                    <Form.Item
                        name="address"
                        label="Address"
                        rules={[{ required: true, message: 'Please enter address' }]}
                    >
                        <Input placeholder="Enter full address" />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="type"
                                label="Property Type"
                                rules={[{ required: true, message: 'Please select type' }]}
                            >
                                <Select placeholder="Select type">
                                    {propertyTypes.map(type => (
                                        <Option key={type} value={type}>
                                            {type}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="status"
                                label="Status"
                                rules={[{ required: true, message: 'Please select status' }]}
                            >
                                <Select placeholder="Select status">
                                    {propertyStatuses.map(status => (
                                        <Option key={status} value={status}>
                                            {status}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="maxVisitors"
                                label="Maximum Visitors"
                                rules={[{ required: true, message: 'Please enter max visitors' }]}
                            >
                                <InputNumber
                                    min={1}
                                    max={20}
                                    style={{ width: '100%' }}
                                    placeholder="e.g., 5"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="visitDurationMinutes"
                                label="Visit Duration (minutes)"
                                rules={[{ required: true, message: 'Please enter duration' }]}
                            >
                                <InputNumber
                                    min={15}
                                    max={240}
                                    step={15}
                                    style={{ width: '100%' }}
                                    placeholder="e.g., 60"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="contactPerson"
                                label="Contact Person"
                                rules={[{ required: true, message: 'Please enter contact person' }]}
                            >
                                <Input placeholder="Contact person name" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="contactPhone"
                                label="Contact Phone"
                                rules={[{ required: true, message: 'Please enter contact phone' }]}
                            >
                                <Input placeholder="Contact phone number" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="specialInstructions"
                        label="Special Instructions"
                    >
                        <TextArea rows={3} placeholder="Any special instructions for visitors..." />
                    </Form.Item>

                    <Form.Item
                        name="isSchedulable"
                        label="Available for Scheduling"
                        valuePropName="checked"
                        initialValue={true}
                    >
                        <Switch />
                    </Form.Item>

                    <Form.Item style={{ textAlign: 'right' }}>
                        <Space>
                            <Button onClick={() => setModalVisible(false)}>
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit">
                                {selectedProperty ? 'Update' : 'Create'} Property
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ScheduleProperties;