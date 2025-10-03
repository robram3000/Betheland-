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
    Tag,
    Modal,
    AutoComplete,
    Spin
} from 'antd';
import {
    PlusOutlined,
    UploadOutlined,
    EyeOutlined,
    DeleteOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

const InsertProperty = ({
    initialValues = {},
    onSubmit,
    onCancel,
    loading = false,
    isEdit = false
}) => {
    const [form] = Form.useForm();
    const [imageList, setImageList] = useState([]);
    const [amenities, setAmenities] = useState([]);
    const [amenityInput, setAmenityInput] = useState('');
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [uploading, setUploading] = useState(false);

    // Common options for dropdowns
    const [cityOptions, setCityOptions] = useState([
        { value: 'Manila' }, { value: 'Quezon City' }, { value: 'Makati' }, { value: 'Taguig' },
        { value: 'Pasig' }, { value: 'Mandaluyong' }, { value: 'Pasay' }, { value: 'Parañaque' },
        { value: 'Las Piñas' }, { value: 'Muntinlupa' }, { value: 'Marikina' }, { value: 'Caloocan' },
        { value: 'Valenzuela' }, { value: 'Malabon' }, { value: 'Navotas' },
    ]);

    const [stateOptions, setStateOptions] = useState([
        { value: 'Metro Manila' }, { value: 'Cavite' }, { value: 'Laguna' }, { value: 'Rizal' },
        { value: 'Bulacan' }, { value: 'Batangas' }, { value: 'Pampanga' },
    ]);

    const [zipCodeOptions, setZipCodeOptions] = useState([
        { value: '1000' }, { value: '1001' }, { value: '1002' }, { value: '1003' },
        { value: '1004' }, { value: '1005' }, { value: '1006' }, { value: '1007' }, { value: '1008' },
    ]);

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

    const commonAmenities = [
        'Swimming Pool', 'Garden', 'Garage', 'Balcony', 'Fireplace',
        'Air Conditioning', 'Heating', 'Security System', 'Elevator',
        'Fitness Center', 'Pet Friendly', 'Furnished', 'Parking', 'Gym', 'Laundry',
    ];

    // Reset form when initialValues changes (when switching between add/edit)
    useEffect(() => {
        if (isEdit && initialValues) {
            // Set form values for edit mode
            form.setFieldsValue({
                title: initialValues.title,
                description: initialValues.description,
                type: initialValues.type,
                price: initialValues.price,
                propertyAge: initialValues.propertyAge,
                propertyFloor: initialValues.propertyFloor || 1,
                bedrooms: initialValues.bedrooms,
                bathrooms: initialValues.bathrooms,
                areaSqft: initialValues.areaSqft,
                address: initialValues.address,
                city: initialValues.city,
                state: initialValues.state,
                zipCode: initialValues.zipCode,
                status: initialValues.status,
                latitude: initialValues.latitude,
                longitude: initialValues.longitude,
                ownerId: initialValues.ownerId,
                agentId: initialValues.agentId,
            });

            // Set amenities if editing
            if (initialValues.amenities) {
                try {
                    const parsedAmenities = JSON.parse(initialValues.amenities);
                    setAmenities(Array.isArray(parsedAmenities) ? parsedAmenities : []);
                } catch {
                    setAmenities([]);
                }
            }

            // Set images if editing
            if (initialValues.propertyImages && initialValues.propertyImages.length > 0) {
                setImageList(initialValues.propertyImages.map((img, index) => ({
                    uid: `existing-${index}`,
                    name: `property-image-${index}.jpg`,
                    status: 'done',
                    url: img.imageUrl,
                })));
            } else {
                setImageList([]);
            }
        } else {
            // Reset form for new property
            form.resetFields();
            setAmenities([]);
            setImageList([]);
            setAmenityInput('');

            // Set default values for new property
            form.setFieldsValue({
                status: 'available',
                type: 'house',
                bedrooms: 1,
                bathrooms: 1,
                propertyAge: 0,
                propertyFloor: 1,
                areaSqft: 0,
                price: 0,
                ownerId: 1,
                agentId: 1,
            });
        }
    }, [initialValues, isEdit, form]);

    const validateCoordinates = (values) => {
        const errors = [];

        if (values.latitude && (values.latitude < -90 || values.latitude > 90)) {
            errors.push('Latitude must be between -90 and 90');
        }

        if (values.longitude && (values.longitude < -180 || values.longitude > 180)) {
            errors.push('Longitude must be between -180 and 180');
        }

        if (values.bathrooms && (values.bathrooms < 0 || values.bathrooms > 99.9)) {
            errors.push('Bathrooms must be between 0 and 99.9');
        }

        if (values.price && values.price > 9999999999.99) {
            errors.push('Price cannot exceed 9,999,999,999.99');
        }

        return errors;
    };

    const handleSubmit = async (values) => {
        try {
            // Validate coordinates and other decimal fields
            const validationErrors = validateCoordinates(values);
            if (validationErrors.length > 0) {
                validationErrors.forEach(error => message.error(error));
                return;
            }

            setUploading(true);

            // Create the property data in the exact structure expected by backend
            const propertyData = {
                Property: {
                    Id: isEdit ? parseInt(initialValues.id) : 0,
                    Title: values.title || '',
                    Description: values.description || '',
                    Type: values.type || 'house',
                    Price: values.price ? parseFloat(values.price) : 0,
                    PropertyAge: values.propertyAge ? parseInt(values.propertyAge) : 0,
                    PropertyFloor: values.propertyFloor ? parseInt(values.propertyFloor) : 1,
                    Bedrooms: values.bedrooms ? parseInt(values.bedrooms) : 1,
                    Bathrooms: values.bathrooms ? parseFloat(values.bathrooms) : 1,
                    AreaSqft: values.areaSqft ? parseInt(values.areaSqft) : 0,
                    Address: values.address || '',
                    City: values.city || '',
                    State: values.state || '',
                    ZipCode: values.zipCode || '',
                    Latitude: values.latitude ? parseFloat(values.latitude) : null,
                    Longitude: values.longitude ? parseFloat(values.longitude) : null,
                    Status: values.status || 'available',
                    Amenities: JSON.stringify(amenities),
                    OwnerId: values.ownerId ? parseInt(values.ownerId) : null,
                    AgentId: values.agentId ? parseInt(values.agentId) : null,
                    ListedDate: isEdit ? initialValues.listedDate : new Date().toISOString()
                }
            };

            // Create multipart form data
            const formData = new FormData();

            // Append property data as JSON string
            formData.append('propertyData', JSON.stringify(propertyData));

            // Add only new images (files that have originFileObj)
            const newImages = imageList.filter(file => file.originFileObj);
            newImages.forEach((file) => {
                formData.append('images', file.originFileObj);
            });

            console.log('Submitting property with data:', propertyData);
            console.log('Image count:', newImages.length);
            console.log('FormData entries:');
            for (let [key, value] of formData.entries()) {
                console.log(key, value);
            }

            if (onSubmit) {
                await onSubmit(formData, true);
            }

            // Don't show success message here - let the parent component handle it
            // The form reset will be handled by the parent component

        } catch (error) {
            console.error('Form submission error:', error);
            message.error(`Failed to ${isEdit ? 'update' : 'create'} property: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    const handleImageUpload = ({ fileList }) => {
        // Validate file types
        const validFiles = fileList.filter(file => {
            const isValidType = file.type?.startsWith('image/') ||
                ['.jpg', '.jpeg', '.png', '.gif', '.webp'].some(ext =>
                    file.name?.toLowerCase().endsWith(ext));

            if (!isValidType) {
                message.error(`${file.name} is not a valid image file`);
                return false;
            }

            // Validate file size (10MB)
            if (file.size && file.size > 10 * 1024 * 1024) {
                message.error(`${file.name} is too large. Maximum size is 10MB`);
                return false;
            }

            return true;
        });

        // Limit to 10 files
        const limitedFiles = validFiles.slice(-10);

        if (limitedFiles.length < validFiles.length) {
            message.warning('Maximum 10 images allowed. Only the first 10 will be uploaded.');
        }

        setImageList(limitedFiles);
    };

    const handleImageRemove = async (file) => {
        // If it's an existing image (has URL but no originFileObj), you might want to delete it from server
        if (file.url && !file.originFileObj) {
            try {
                // Call API to delete the image
                const response = await fetch(`/api/CreationProperty/image/${encodeURIComponent(file.url)}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    message.error('Failed to delete image from server');
                    return false; // Prevent removal from UI
                }
            } catch (error) {
                console.error('Error deleting image:', error);
                message.error('Error deleting image from server');
                return false;
            }
        }

        // Remove from local state
        setImageList(prev => prev.filter(img => img.uid !== file.uid));
        return true;
    };

    const handlePreview = async (file) => {
        setPreviewImage(file.url || file.thumbUrl);
        setPreviewVisible(true);
    };

    const handleAddAmenity = () => {
        if (amenityInput && amenityInput.trim() && !amenities.includes(amenityInput.trim())) {
            setAmenities([...amenities, amenityInput.trim()]);
            setAmenityInput('');
        }
    };

    const handleRemoveAmenity = (removedAmenity) => {
        setAmenities(amenities.filter(amenity => amenity !== removedAmenity));
    };

    const beforeUpload = (file) => {
        const isValidType = file.type.startsWith('image/');
        if (!isValidType) {
            message.error('You can only upload image files!');
        }

        const isLt10M = file.size / 1024 / 1024 < 10;
        if (!isLt10M) {
            message.error('Image must be smaller than 10MB!');
        }

        return isValidType && isLt10M;
    };

    const uploadButton = (
        <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
        </div>
    );

    return (
        <Card
            title={isEdit ? "Edit Property" : "Add New Property"}
            style={{ maxWidth: 1200, margin: '0 auto' }}
        >
            <Spin spinning={uploading || loading}>
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
                        ownerId: 1,
                        agentId: 1,
                    }}
                >
                    <Row gutter={[24, 16]}>
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
                                <Select
                                    placeholder="Select property type"
                                    showSearch
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                        option.children.toLowerCase().includes(input.toLowerCase())
                                    }
                                >
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

                        <Col span={24}>
                            <Divider orientation="left">Price & Details</Divider>
                        </Col>

                        <Col xs={24} lg={8}>
                            <Form.Item
                                name="price"
                                label="Price (₱)"
                                rules={[
                                    { required: true, message: 'Please enter price' },
                                    {
                                        validator: (_, value) => {
                                            if (value && value > 9999999999.99) {
                                                return Promise.reject(new Error('Price cannot exceed 9,999,999,999.99'));
                                            }
                                            return Promise.resolve();
                                        }
                                    }
                                ]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={0}
                                    step={1000}
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
                                rules={[
                                    { required: true, message: 'Please enter number of bedrooms' },
                                    { type: 'number', min: 0, max: 20, message: 'Bedrooms must be between 0 and 20' }
                                ]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={0}
                                    max={20}
                                    placeholder="0"
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={12} lg={4}>
                            <Form.Item
                                name="bathrooms"
                                label="Bathrooms"
                                rules={[
                                    { required: true, message: 'Please enter number of bathrooms' },
                                    {
                                        validator: (_, value) => {
                                            if (value && (value < 0 || value > 99.9)) {
                                                return Promise.reject(new Error('Bathrooms must be between 0 and 99.9'));
                                            }
                                            return Promise.resolve();
                                        }
                                    }
                                ]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={0}
                                    max={99.9}
                                    step={0.5}
                                    placeholder="0.0"
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={12} lg={4}>
                            <Form.Item
                                name="areaSqft"
                                label="Area (sqft)"
                                rules={[
                                    { required: true, message: 'Please enter area' },
                                    { type: 'number', min: 0, message: 'Area must be positive' }
                                ]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={0}
                                    step={10}
                                    placeholder="0"
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={12} lg={4}>
                            <Form.Item
                                name="propertyAge"
                                label="Property Age (Years)"
                                rules={[
                                    { type: 'number', min: 0, max: 100, message: 'Property age must be between 0 and 100 years' }
                                ]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={0}
                                    max={100}
                                    placeholder="Years"
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={12} lg={4}>
                            <Form.Item
                                name="propertyFloor"
                                label="Floor"
                                rules={[
                                    { required: true, message: 'Please enter floor number' },
                                    { type: 'number', min: 0, max: 100, message: 'Floor must be between 0 and 100' }
                                ]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={0}
                                    max={100}
                                    placeholder="Floor"
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
                                <Input placeholder="Enter full address (e.g., 123 Main Street, Barangay 123)" />
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
                                <AutoComplete
                                    options={cityOptions}
                                    placeholder="Type or select city"
                                    filterOption={false}
                                >
                                    <Input />
                                </AutoComplete>
                            </Form.Item>
                        </Col>

                        <Col xs={24} lg={8}>
                            <Form.Item
                                name="state"
                                label="State/Province"
                                rules={[
                                    { required: true, message: 'Please enter state/province' },
                                    { max: 100, message: 'State must be less than 100 characters' }
                                ]}
                            >
                                <AutoComplete
                                    options={stateOptions}
                                    placeholder="Type or select state"
                                    filterOption={false}
                                >
                                    <Input />
                                </AutoComplete>
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
                                <AutoComplete
                                    options={zipCodeOptions}
                                    placeholder="Type or select ZIP code"
                                    filterOption={false}
                                >
                                    <Input />
                                </AutoComplete>
                            </Form.Item>
                        </Col>

                        {/* Amenities Section */}
                        <Col span={24}>
                            <Divider orientation="left">Amenities</Divider>
                            <Form.Item label="Property Amenities">
                                <Space.Compact style={{ width: '100%', marginBottom: 12 }}>
                                    <Input
                                        value={amenityInput}
                                        onChange={(e) => setAmenityInput(e.target.value)}
                                        placeholder="Enter amenity"
                                        onPressEnter={handleAddAmenity}
                                    />
                                    <Button type="primary" onClick={handleAddAmenity}>
                                        Add
                                    </Button>
                                </Space.Compact>

                                <div style={{ marginBottom: 12 }}>
                                    <span style={{ fontWeight: 'bold', marginRight: 8 }}>Quick Add:</span>
                                    <Space size={[8, 8]} wrap style={{ marginTop: 8 }}>
                                        {commonAmenities.map(amenity => (
                                            <Button
                                                key={amenity}
                                                size="small"
                                                onClick={() => {
                                                    if (!amenities.includes(amenity)) {
                                                        setAmenities([...amenities, amenity]);
                                                    }
                                                }}
                                                disabled={amenities.includes(amenity)}
                                                type={amenities.includes(amenity) ? "primary" : "default"}
                                            >
                                                {amenity}
                                            </Button>
                                        ))}
                                    </Space>
                                </div>

                                <div>
                                    {amenities.map(amenity => (
                                        <Tag
                                            key={amenity}
                                            closable
                                            onClose={() => handleRemoveAmenity(amenity)}
                                            style={{ marginBottom: 8, padding: '4px 8px' }}
                                            color="blue"
                                        >
                                            {amenity}
                                        </Tag>
                                    ))}
                                    {amenities.length === 0 && (
                                        <div style={{ color: '#999', fontStyle: 'italic' }}>
                                            No amenities added yet
                                        </div>
                                    )}
                                </div>
                            </Form.Item>
                        </Col>

                        {/* Property Images */}
                        <Col span={24}>
                            <Divider orientation="left">Property Images</Divider>

                            <Form.Item
                                label="Upload Images (Max 10 images)"
                                extra="Supported formats: JPG, JPEG, PNG, GIF, WEBP. Max file size: 10MB"
                            >
                                <Upload
                                    listType="picture-card"
                                    fileList={imageList}
                                    onPreview={handlePreview}
                                    onChange={handleImageUpload}
                                    onRemove={handleImageRemove}
                                    beforeUpload={beforeUpload}
                                    accept="image/*"
                                    multiple
                                >
                                    {imageList.length >= 10 ? null : uploadButton}
                                </Upload>
                            </Form.Item>
                        </Col>

                        {/* Status & Additional Information */}
                        <Col span={24}>
                            <Divider orientation="left">Status & Additional Information</Divider>
                        </Col>

                        <Col xs={24} lg={8}>
                            <Form.Item
                                name="status"
                                label="Status"
                                rules={[{ required: true, message: 'Please select status' }]}
                            >
                                <Select
                                    placeholder="Select status"
                                    showSearch
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                        option.children.toLowerCase().includes(input.toLowerCase())
                                    }
                                >
                                    {statusOptions.map(status => (
                                        <Option key={status.value} value={status.value}>
                                            {status.label}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>

                        {/* Hidden fields for ownerId and agentId */}
                        <Col xs={24} lg={8} style={{ display: 'none' }}>
                            <Form.Item name="ownerId" hidden>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col xs={24} lg={8} style={{ display: 'none' }}>
                            <Form.Item name="agentId" hidden>
                                <Input />
                            </Form.Item>
                        </Col>

                        {/* Coordinates */}
                        <Col xs={24} lg={12}>
                            <Form.Item
                                name="latitude"
                                label="Latitude (Optional)"
                                rules={[
                                    {
                                        validator: (_, value) => {
                                            if (!value) return Promise.resolve();
                                            if (value < -90 || value > 90) {
                                                return Promise.reject(new Error('Latitude must be between -90 and 90'));
                                            }
                                            return Promise.resolve();
                                        }
                                    }
                                ]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    step={0.0000001}
                                    placeholder="e.g., 14.5995 (Manila)"
                                    min={-90}
                                    max={90}
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} lg={12}>
                            <Form.Item
                                name="longitude"
                                label="Longitude (Optional)"
                                rules={[
                                    {
                                        validator: (_, value) => {
                                            if (!value) return Promise.resolve();
                                            if (value < -180 || value > 180) {
                                                return Promise.reject(new Error('Longitude must be between -180 and 180'));
                                            }
                                            return Promise.resolve();
                                        }
                                    }
                                ]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    step={0.0000001}
                                    placeholder="e.g., 120.9842 (Manila)"
                                    min={-180}
                                    max={180}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Image Preview Modal */}
                    <Modal
                        open={previewVisible}
                        title="Image Preview"
                        footer={null}
                        onCancel={() => setPreviewVisible(false)}
                        width={800}
                    >
                        <img
                            alt="Preview"
                            style={{ width: '100%' }}
                            src={previewImage}
                        />
                    </Modal>

                    {/* Form Actions */}
                    <Divider />
                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={onCancel} disabled={uploading || loading}>
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={uploading || loading}
                                icon={<PlusOutlined />}
                                style={{ backgroundColor: '#1a365d', borderColor: '#1a365d' }}
                            >
                                {isEdit ? 'Update Property' : 'Add Property'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Spin>
        </Card>
    );
};

export default InsertProperty;