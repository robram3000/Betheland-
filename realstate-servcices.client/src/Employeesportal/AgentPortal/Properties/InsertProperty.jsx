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
} from 'antd';
import {
    PlusOutlined,
    UploadOutlined,
    EyeOutlined,
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

    // Common options for dropdowns
    const [cityOptions, setCityOptions] = useState([
        { value: 'Manila' },
        { value: 'Quezon City' },
        { value: 'Makati' },
        { value: 'Taguig' },
        { value: 'Pasig' },
        { value: 'Mandaluyong' },
        { value: 'Pasay' },
        { value: 'Parañaque' },
        { value: 'Las Piñas' },
        { value: 'Muntinlupa' },
        { value: 'Marikina' },
        { value: 'Caloocan' },
        { value: 'Valenzuela' },
        { value: 'Malabon' },
        { value: 'Navotas' },
    ]);

    const [stateOptions, setStateOptions] = useState([
        { value: 'Metro Manila' },
        { value: 'Cavite' },
        { value: 'Laguna' },
        { value: 'Rizal' },
        { value: 'Bulacan' },
        { value: 'Batangas' },
        { value: 'Pampanga' },
    ]);

    const [zipCodeOptions, setZipCodeOptions] = useState([
        { value: '1000' },
        { value: '1001' },
        { value: '1002' },
        { value: '1003' },
        { value: '1004' },
        { value: '1005' },
        { value: '1006' },
        { value: '1007' },
        { value: '1008' },
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
        'Swimming Pool',
        'Garden',
        'Garage',
        'Balcony',
        'Fireplace',
        'Air Conditioning',
        'Heating',
        'Security System',
        'Elevator',
        'Fitness Center',
        'Pet Friendly',
        'Furnished',
        'Parking',
        'Gym',
        'Laundry',
    ];

    useEffect(() => {
        if (isEdit && initialValues) {
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
            }
        } else {
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
                // Add default ownerId and agentId if needed
                ownerId: 1, // You might want to get this from user context
                agentId: 1, // You might want to get this from user context
            });
            setAmenities([]);
            setImageList([]);
        }
    }, [initialValues, isEdit, form]);

    const handleSubmit = async (values) => {
        try {
            // Format the data according to API expectations
            const submitData = {
                title: values.title,
                description: values.description,
                type: values.type,
                price: Number(values.price),
                propertyAge: Number(values.propertyAge) || 0,
                propertyFloor: Number(values.propertyFloor) || 1,
                bedrooms: Number(values.bedrooms),
                bathrooms: Number(values.bathrooms),
                areaSqft: Number(values.areaSqft),
                address: values.address,
                city: values.city,
                state: values.state,
                zipCode: values.zipCode,
                latitude: values.latitude ? Number(values.latitude) : null,
                longitude: values.longitude ? Number(values.longitude) : null,
                status: values.status,
                ownerId: values.ownerId || 1,
                agentId: values.agentId || 1,
                amenities: JSON.stringify(amenities),
            };

            console.log('Submitting data:', submitData);

            if (onSubmit) {
                await onSubmit(submitData);
            }
        } catch (error) {
            console.error('Form submission error:', error);
            message.error(`Failed to ${isEdit ? 'update' : 'create'} property: ${error.message}`);
        }
    };

    const handleImageUpload = (info) => {
        let fileList = [...info.fileList];

        // Limit to 10 files
        fileList = fileList.slice(-10);

        // Handle file status
        fileList = fileList.map(file => {
            if (file.status === 'done') {
                // For demo purposes, create a blob URL
                if (file.originFileObj) {
                    file.url = URL.createObjectURL(file.originFileObj);
                }
            }
            return file;
        });

        setImageList(fileList);
    };

    const handleImageRemove = (file) => {
        setImageList(prev => prev.filter(img => img.uid !== file.uid));
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
                            rules={[{ required: true, message: 'Please enter price' }]}
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
                            rules={[{ required: true, message: 'Please enter number of bedrooms' }]}
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
                            rules={[{ required: true, message: 'Please enter number of bathrooms' }]}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                min={0}
                                max={20}
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
                                step={10}
                                placeholder="0"
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={12} lg={4}>
                        <Form.Item
                            name="propertyAge"
                            label="Property Age (Years)"
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
                            rules={[{ required: true, message: 'Please enter floor number' }]}
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
                                onSearch={(value) => {
                                    if (value) {
                                        const filteredOptions = cityOptions.filter(option =>
                                            option.value.toLowerCase().includes(value.toLowerCase())
                                        );
                                        setCityOptions(filteredOptions.length > 0 ? filteredOptions : [{ value }]);
                                    }
                                }}
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
                                onSearch={(value) => {
                                    if (value) {
                                        const filteredOptions = stateOptions.filter(option =>
                                            option.value.toLowerCase().includes(value.toLowerCase())
                                        );
                                        setStateOptions(filteredOptions.length > 0 ? filteredOptions : [{ value }]);
                                    }
                                }}
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
                                onSearch={(value) => {
                                    if (value) {
                                        const filteredOptions = zipCodeOptions.filter(option =>
                                            option.value.includes(value)
                                        );
                                        setZipCodeOptions(filteredOptions.length > 0 ? filteredOptions : [{ value }]);
                                    }
                                }}
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
                            extra="Note: Image upload functionality needs backend integration for file storage"
                        >
                            <Upload
                                listType="picture-card"
                                fileList={imageList}
                                onPreview={handlePreview}
                                onChange={handleImageUpload}
                                onRemove={handleImageRemove}
                                beforeUpload={() => false} // Prevent automatic upload
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
                            label="Longitude (Optional)"
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                step={0.0000001}
                                placeholder="e.g., -74.0060"
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
                        <Button onClick={onCancel} disabled={loading}>
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            icon={<PlusOutlined />}
                            style={{ backgroundColor: '#1a365d', borderColor: '#1a365d' }}
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