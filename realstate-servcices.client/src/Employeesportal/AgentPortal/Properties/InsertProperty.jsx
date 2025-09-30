// InsertProperty.jsx
import React, { useState, useEffect } from 'react';
import {
    Form,
    Input,
    InputNumber,
    Select,
    Button,
    Upload,
    message,
    Card,
    Row,
    Col,
    Divider,
    Space,
    Switch,
} from 'antd';
import {
    PlusOutlined,
    UploadOutlined,
    DeleteOutlined,
} from '@ant-design/icons';
import { useForm } from 'antd/es/form/Form';

const { Option } = Select;
const { TextArea } = Input;

const InsertProperty = ({
    initialValues = {},
    onSubmit,
    onCancel,
    loading = false,
    isEdit = false
}) => {
    const [form] = useForm();
    const [imageList, setImageList] = useState([]);
    const [mainImageIndex, setMainImageIndex] = useState(0);

    useEffect(() => {
        if (isEdit && initialValues) {
            form.setFieldsValue({
                ...initialValues,
                ownerId: initialValues.ownerId?.toString(),
                agentId: initialValues.agentId?.toString(),
            });

            // Set images if editing
            if (initialValues.propertyImages) {
                setImageList(initialValues.propertyImages.map((img, index) => ({
                    uid: index,
                    name: `property-image-${index}.jpg`,
                    status: 'done',
                    url: img.imageUrl,
                })));
            }
        }
    }, [initialValues, isEdit, form]);

    const handleSubmit = async (values) => {
        try {
            const submitData = {
                ...values,
                propertyImages: imageList.map(img => ({ imageUrl: img.url })),
                mainImage: imageList[mainImageIndex]?.url || '',
            };

            if (onSubmit) {
                await onSubmit(submitData);
                message.success(`Property ${isEdit ? 'updated' : 'created'} successfully!`);
                form.resetFields();
                setImageList([]);
                setMainImageIndex(0);
            }
        } catch (error) {
            message.error(`Failed to ${isEdit ? 'update' : 'create'} property: ${error.message}`);
        }
    };

    const handleImageUpload = (info) => {
        if (info.file.status === 'uploading') {
            return;
        }
        if (info.file.status === 'done') {
            // In a real app, you would get the URL from your upload service
            const newImage = {
                uid: info.file.uid,
                name: info.file.name,
                status: 'done',
                url: URL.createObjectURL(info.file.originFileObj), // Temporary URL
            };
            setImageList(prev => [...prev, newImage]);
            message.success(`${info.file.name} file uploaded successfully`);
        } else if (info.file.status === 'error') {
            message.error(`${info.file.name} file upload failed.`);
        }
    };

    const handleImageRemove = (file) => {
        setImageList(prev => prev.filter(img => img.uid !== file.uid));
        if (mainImageIndex >= imageList.length - 1) {
            setMainImageIndex(0);
        }
    };

    const propertyTypes = [
        { value: 'house', label: 'House' },
        { value: 'apartment', label: 'Apartment' },
        { value: 'condo', label: 'Condo' },
        { value: 'villa', label: 'Villa' },
        { value: 'townhouse', label: 'Townhouse' },
        { value: 'commercial', label: 'Commercial' },
    ];

    const statusOptions = [
        { value: 'available', label: 'Available' },
        { value: 'sold', label: 'Sold' },
        { value: 'pending', label: 'Pending' },
        { value: 'rented', label: 'Rented' },
    ];

    return (
        <Card
            title={isEdit ? "Edit Property" : "Add New Property"}
            style={{ maxWidth: 1200, margin: '0 auto' }}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    status: 'available',
                    type: 'house',
                    bedrooms: 1,
                    bathrooms: 1,
                    propertyAge: 0,
                    propertyFloor: 1,
                    areaSqft: 0,
                    price: 0,
                    ...initialValues,
                }}
            >
                <Row gutter={[24, 16]}>
                    {/* Basic Information */}
                    <Col span={24}>
                        <Divider orientation="left">Basic Information</Divider>
                    </Col>

                    <Col xs={24} lg={12}>
                        <Form.Item
                            name="title"
                            label="Property Title"
                            rules={[
                                { required: true, message: 'Please enter property title' },
                                { max: 200, message: 'Title must be less than 200 characters' }
                            ]}
                        >
                            <Input placeholder="Enter property title" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} lg={12}>
                        <Form.Item
                            name="type"
                            label="Property Type"
                            rules={[{ required: true, message: 'Please select property type' }]}
                        >
                            <Select placeholder="Select property type">
                                {propertyTypes.map(type => (
                                    <Option key={type.value} value={type.value}>
                                        {type.label}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col xs={24}>
                        <Form.Item
                            name="description"
                            label="Description"
                            rules={[{ required: true, message: 'Please enter property description' }]}
                        >
                            <TextArea
                                rows={4}
                                placeholder="Enter detailed property description..."
                                maxLength={2000}
                                showCount
                            />
                        </Form.Item>
                    </Col>

                    {/* Price & Details */}
                    <Col span={24}>
                        <Divider orientation="left">Price & Details</Divider>
                    </Col>

                    <Col xs={24} lg={8}>
                        <Form.Item
                            name="price"
                            label="Price (₱)"
                            rules={[{ required: true, message: 'Please enter price' }]}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                min={0}
                                formatter={value => `₱ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => value.replace(/\₱\s?|(,*)/g, '')}
                                placeholder="Enter price"
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={12} lg={4}>
                        <Form.Item
                            name="bedrooms"
                            label="Bedrooms"
                            rules={[{ required: true, message: 'Please enter number of bedrooms' }]}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                min={0}
                                placeholder="0"
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={12} lg={4}>
                        <Form.Item
                            name="bathrooms"
                            label="Bathrooms"
                            rules={[{ required: true, message: 'Please enter number of bathrooms' }]}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                min={0}
                                step={0.5}
                                placeholder="0.0"
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={12} lg={4}>
                        <Form.Item
                            name="areaSqft"
                            label="Area (sqft)"
                            rules={[{ required: true, message: 'Please enter area' }]}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                min={0}
                                placeholder="0"
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={12} lg={4}>
                        <Form.Item
                            name="propertyAge"
                            label="Property Age"
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                min={0}
                                placeholder="Years"
                            />
                        </Form.Item>
                    </Col>

                    {/* Location Information */}
                    <Col span={24}>
                        <Divider orientation="left">Location Information</Divider>
                    </Col>

                    <Col xs={24}>
                        <Form.Item
                            name="address"
                            label="Address"
                            rules={[
                                { required: true, message: 'Please enter address' },
                                { max: 255, message: 'Address must be less than 255 characters' }
                            ]}
                        >
                            <Input placeholder="Enter full address" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} lg={8}>
                        <Form.Item
                            name="city"
                            label="City"
                            rules={[
                                { required: true, message: 'Please enter city' },
                                { max: 100, message: 'City must be less than 100 characters' }
                            ]}
                        >
                            <Input placeholder="Enter city" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} lg={8}>
                        <Form.Item
                            name="state"
                            label="State"
                            rules={[
                                { required: true, message: 'Please enter state' },
                                { max: 100, message: 'State must be less than 100 characters' }
                            ]}
                        >
                            <Input placeholder="Enter state" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} lg={8}>
                        <Form.Item
                            name="zipCode"
                            label="ZIP Code"
                            rules={[
                                { required: true, message: 'Please enter ZIP code' },
                                { max: 20, message: 'ZIP code must be less than 20 characters' }
                            ]}
                        >
                            <Input placeholder="Enter ZIP code" />
                        </Form.Item>
                    </Col>

                    {/* Images Upload */}
                    <Col span={24}>
                        <Divider orientation="left">Property Images</Divider>

                        <Form.Item label="Upload Images">
                            <Upload
                                listType="picture-card"
                                fileList={imageList}
                                onChange={handleImageUpload}
                                onRemove={handleImageRemove}
                                beforeUpload={() => false} // Prevent auto upload
                                accept="image/*"
                                multiple
                            >
                                {imageList.length >= 10 ? null : (
                                    <div>
                                        <PlusOutlined />
                                        <div style={{ marginTop: 8 }}>Upload</div>
                                    </div>
                                )}
                            </Upload>
                        </Form.Item>

                        {imageList.length > 0 && (
                            <Form.Item label="Set Main Image">
                                <Select
                                    value={mainImageIndex}
                                    onChange={setMainImageIndex}
                                    style={{ width: 200 }}
                                >
                                    {imageList.map((img, index) => (
                                        <Option key={index} value={index}>
                                            Image {index + 1}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        )}
                    </Col>

                    {/* Status & Additional Info */}
                    <Col span={24}>
                        <Divider orientation="left">Status & Additional Information</Divider>
                    </Col>

                    <Col xs={24} lg={8}>
                        <Form.Item
                            name="status"
                            label="Status"
                            rules={[{ required: true, message: 'Please select status' }]}
                        >
                            <Select placeholder="Select status">
                                {statusOptions.map(status => (
                                    <Option key={status.value} value={status.value}>
                                        {status.label}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col xs={24} lg={8}>
                        <Form.Item
                            name="ownerId"
                            label="Owner ID"
                            rules={[{ required: true, message: 'Please enter owner ID' }]}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                min={1}
                                placeholder="Owner ID"
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} lg={8}>
                        <Form.Item
                            name="agentId"
                            label="Agent ID (Optional)"
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                min={1}
                                placeholder="Agent ID"
                            />
                        </Form.Item>
                    </Col>

                    {/* Coordinates */}
                    <Col xs={24} lg={12}>
                        <Form.Item
                            name="latitude"
                            label="Latitude"
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                step={0.0000001}
                                placeholder="e.g., 40.7128"
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} lg={12}>
                        <Form.Item
                            name="longitude"
                            label="Longitude"
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                step={0.0000001}
                                placeholder="e.g., -74.0060"
                            />
                        </Form.Item>
                    </Col>
                </Row>

                {/* Form Actions */}
                <Divider />
                <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                    <Space>
                        <Button onClick={onCancel} disabled={loading}>
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            icon={<PlusOutlined />}
                            style={{ backgroundColor: '#1a365d', borderColor: '#1a365d' }} // Dark blue color
                        >
                            {isEdit ? 'Update Property' : 'Add Property'}
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default InsertProperty;