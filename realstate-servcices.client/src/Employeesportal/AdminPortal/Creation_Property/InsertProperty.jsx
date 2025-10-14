import React, { useState, useEffect } from 'react';
import {
    Form,
    Input,
    Button,
    Select,
    InputNumber,
    Row,
    Col,
    Card,
    Space,
    message,
    Divider,
    Upload,
    DatePicker,
    Steps,
    Alert,
    Typography,
    Descriptions,
    Collapse
} from 'antd';
import {
    SaveOutlined,
    CloseOutlined,
    UploadOutlined,
    EnvironmentOutlined
} from '@ant-design/icons';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import moment from 'moment';

import propertyService from './Services/propertyService';
import agentService from '../Creation_Agent/Services/agentService';
import { propertyErrorHandler, propertyValidator } from './services/PropertyErrorHandler';
import amenities from './services/amenities';
import statusOptions from './services/Status';
import propertyTypeOptions from './services/propertyTypeOption';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;
const { Step } = Steps;
const { Panel } = Collapse;

// Default property types as fallback
const DEFAULT_PROPERTY_TYPES = [
    'House',
    'Apartment',
    'Condo',
    'Townhouse',
    'Villa',
    'Commercial',
    'Industrial',
    'Land',
    'Farm',
    'Other'
];

// Default status options as fallback
const DEFAULT_STATUS_OPTIONS = [
    'draft',
    'available',
    'sold',
    'rented',
    'pending',
    'expired'
];

// Map click handler component
function MapClickHandler({ onMapClick }) {
    useMapEvents({
        click(e) {
            onMapClick(e.latlng);
        },
    });
    return null;
}

const InsertProperty = ({ property, onSuccess, onCancel }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [agents, setAgents] = useState([]);
    const [imageList, setImageList] = useState([]);
    const [videoList, setVideoList] = useState([]);
    const [mapCenter, setMapCenter] = useState([40.7128, -74.0060]);
    const [markerPosition, setMarkerPosition] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [submittedData, setSubmittedData] = useState(null);
    const [showSuccessInfo, setShowSuccessInfo] = useState(false);
    const [error, setError] = useState(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [missingFields, setMissingFields] = useState([]);

    // Safe options with fallbacks
    const [propertyTypes, setPropertyTypes] = useState([]);
    const [statuses, setStatuses] = useState([]);

    // Flatten amenities for the select component
    const allAmenities = amenities && typeof amenities === 'object'
        ? Object.values(amenities).flat()
        : [];

    useEffect(() => {
        // Safely initialize options
        initializeOptions();
        loadAgents();
        if (property) {
            initializeFormWithPropertyData();
        }
    }, [property, form]);

    const initializeOptions = () => {
        // Handle propertyTypeOptions - Flatten categorized types
        if (propertyTypeOptions && typeof propertyTypeOptions === 'object') {
            const flattenedTypes = Object.values(propertyTypeOptions).flat();
            setPropertyTypes(flattenedTypes);
        } else {
            console.warn('propertyTypeOptions is not valid, using fallback');
            setPropertyTypes(DEFAULT_PROPERTY_TYPES);
        }

        // Handle statusOptions - Flatten categorized statuses
        if (statusOptions && typeof statusOptions === 'object') {
            const flattenedStatuses = Object.values(statusOptions).flat();
            setStatuses(flattenedStatuses);
        } else {
            console.warn('statusOptions is not valid, using fallback');
            setStatuses(DEFAULT_STATUS_OPTIONS);
        }

        // Debug logging
        console.log('Processed propertyTypes:', propertyTypes);
        console.log('Processed statuses:', statuses);
    };

    const initializeFormWithPropertyData = () => {
        try {
            const formData = {
                ...property,
                listedDate: property.listedDate ? moment(property.listedDate) : null,
                amenities: Array.isArray(property.amenities) ? property.amenities : []
            };

            form.setFieldsValue(formData);
            setImageList(property.propertyImages || []);
            setVideoList(property.propertyVideos || []);

            // Set map position if coordinates exist
            if (property.latitude && property.longitude) {
                setMapCenter([property.latitude, property.longitude]);
                setMarkerPosition([property.latitude, property.longitude]);
            }
        } catch (error) {
            console.error('Error initializing form with property data:', error);
            message.error('Failed to load property data');
        }
    };

    const loadAgents = async () => {
        try {
            const data = await agentService.getAgents();
            setAgents(data);
        } catch (error) {
            console.error('Error loading agents:', error);
            message.error('Failed to load agents');
        }
    };

    const handleMapClick = (latlng) => {
        setMarkerPosition([latlng.lat, latlng.lng]);
        form.setFieldsValue({
            latitude: latlng.lat,
            longitude: latlng.lng
        });
    };

    const handleAddressChange = () => {
        const latitude = form.getFieldValue('latitude');
        const longitude = form.getFieldValue('longitude');

        if (latitude && longitude) {
            setMapCenter([parseFloat(latitude), parseFloat(longitude)]);
            setMarkerPosition([parseFloat(latitude), parseFloat(longitude)]);
        }
    };

    const clearError = () => {
        setError(null);
        setMissingFields([]);
    };

    const validateCurrentStep = () => {
        const fieldNames = getStepFields(currentStep);
        const values = form.getFieldsValue(fieldNames);
        const currentMissing = [];

        fieldNames.forEach(field => {
            if (field === 'title' && !values.title) {
                currentMissing.push('Property Title');
            }
            if (field === 'type' && !values.type) {
                currentMissing.push('Property Type');
            }
            if (field === 'description' && !values.description) {
                currentMissing.push('Description');
            }
            if (field === 'price' && (!values.price || values.price <= 0)) {
                currentMissing.push('Price');
            }
            if (field === 'address' && !values.address) {
                currentMissing.push('Street Address');
            }
            if (field === 'city' && !values.city) {
                currentMissing.push('City');
            }
            if (field === 'state' && !values.state) {
                currentMissing.push('State/Province');
            }
            if (field === 'zipCode' && !values.zipCode) {
                currentMissing.push('Zip/Postal Code');
            }
            if (field === 'country' && !values.country) {
                currentMissing.push('Country');
            }
        });

        setMissingFields(currentMissing);
        return currentMissing.length === 0;
    };

    const getStepFields = (step) => {
        const stepFields = {
            0: ['title', 'type', 'description', 'price', 'status', 'listedDate'],
            1: ['address', 'unit', 'city', 'state', 'zipCode', 'country', 'neighborhood', 'latitude', 'longitude'],
            2: ['bedrooms', 'bathrooms', 'areaSqft', 'propertyAge', 'propertyFloor', 'amenities'],
            3: ['agentId', 'ownerId']
        };
        return stepFields[step] || [];
    };

    const next = () => {
        if (validateCurrentStep()) {
            setCurrentStep(currentStep + 1);
        } else {
            message.warning('Please fill in all required fields before proceeding');
        }
    };

    const prev = () => {
        setCurrentStep(currentStep - 1);
    };

    const onFinish = async (values) => {
        setLoading(true);
        clearError();

        try {
            // Validate ALL steps before submission
            const allStepFields = [0, 1, 2, 3].flatMap(step => getStepFields(step));
            const allValues = form.getFieldsValue(allStepFields);

            // Check for missing required fields across all steps
            const missingFields = [];

            if (!allValues.title) missingFields.push('Property Title');
            if (!allValues.type) missingFields.push('Property Type');
            if (!allValues.description) missingFields.push('Description');
            if (!allValues.price || allValues.price <= 0) missingFields.push('Price');
            if (!allValues.address) missingFields.push('Street Address');
            if (!allValues.city) missingFields.push('City');
            if (!allValues.state) missingFields.push('State/Province');
            if (!allValues.zipCode) missingFields.push('Zip/Postal Code');
            if (!allValues.country) missingFields.push('Country');

            if (missingFields.length > 0) {
                setMissingFields(missingFields);
                message.warning('Please complete all required fields before submitting');
                setLoading(false);
                return;
            }

            // Prepare property data
            const propertyData = {
                ...allValues,
                listedDate: allValues.listedDate ? allValues.listedDate.toISOString() : new Date().toISOString(),
                amenities: allValues.amenities || [],
                latitude: allValues.latitude ? parseFloat(allValues.latitude) : null,
                longitude: allValues.longitude ? parseFloat(allValues.longitude) : null,
                price: parseFloat(allValues.price) || 0,
                bedrooms: parseInt(allValues.bedrooms) || 0,
                bathrooms: parseFloat(allValues.bathrooms) || 0,
                areaSqft: parseInt(allValues.areaSqft) || 0,
                propertyAge: parseInt(allValues.propertyAge) || 0,
                propertyFloor: parseInt(allValues.propertyFloor) || 1,
                ownerId: allValues.ownerId ? parseInt(allValues.ownerId) : null,
                agentId: allValues.agentId ? parseInt(allValues.agentId) : null,
            };

            console.log('Submitting property data:', propertyData);

            let result;
            if (property) {
                result = await propertyService.updateProperty(property.id, propertyData);
                message.success('Property updated successfully');
            } else {
                result = await propertyService.createProperty(propertyData);
                message.success('Property created successfully');
            }

            console.log('API Response:', result);

            // Store submitted data to show after submission
            setSubmittedData({
                title: allValues.title,
                type: allValues.type,
                price: allValues.price,
                address: `${allValues.address}, ${allValues.city}, ${allValues.state}`,
                status: allValues.status,
                referenceId: result.id || `PROP-${Date.now()}`
            });

            setShowSuccessInfo(true);

            if (onSuccess) onSuccess(result);
        } catch (error) {
            console.error('Error saving property:', error);

            // Handle different types of errors
            if (error.code === 'FORM_VALIDATION_ERROR') {
                // Set form field errors for validation errors
                const fieldErrors = Object.entries(error.details).map(([field, errorMsg]) => ({
                    name: field,
                    errors: [errorMsg]
                }));
                form.setFields(fieldErrors);
                message.error('Please fix the form errors');
            } else if (error instanceof Error && error.code) {
                // Handled error from our error handler
                setError({
                    message: error.message,
                    details: error.details
                });
                message.error(error.message);
            } else {
                // Unhandled error
                setError({
                    message: `Failed to ${property ? 'update' : 'create'} property`,
                    details: error.message
                });
                message.error(`Failed to ${property ? 'update' : 'create'} property`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (info) => {
        if (info.file.status === 'uploading') {
            setUploading(true);
            return;
        }

        if (info.file.status === 'done') {
            setUploading(false);
            message.success('Image uploaded successfully');
        } else if (info.file.status === 'error') {
            setUploading(false);
            message.error('Image upload failed');
        }
    };

    const handleVideoUpload = async (info) => {
        if (info.file.status === 'uploading') {
            setUploading(true);
            return;
        }

        if (info.file.status === 'done') {
            setUploading(false);
            message.success('Video uploaded successfully');
        } else if (info.file.status === 'error') {
            setUploading(false);
            message.error('Video upload failed');
        }
    };

    const countryOptions = [
        'United States',
        'Canada',
        'United Kingdom',
        'Australia',
        'Germany',
        'France',
        'Japan',
        'China',
        'India',
        'Brazil',
        'Mexico'
    ];

    const uploadProps = {
        beforeUpload: (file) => {
            const isImage = file.type.startsWith('image/');
            const isVideo = file.type.startsWith('video/');

            if (!isImage && !isVideo) {
                message.error('You can only upload image or video files!');
                return false;
            }

            const isLt10M = file.size / 1024 / 1024 < 10;
            if (!isLt10M) {
                message.error('File must be smaller than 10MB!');
                return false;
            }

            return false; // Return false to handle upload manually
        },
    };

    const getErrorAlert = () => {
        if (!error) return null;

        return (
            <Alert
                message="Error"
                description={
                    <div>
                        <div style={{ marginBottom: 8, fontWeight: 500 }}>{error.message}</div>
                        {error.details && typeof error.details === 'object' && Object.keys(error.details).length > 0 ? (
                            <div style={{ fontSize: '12px' }}>
                                <div style={{ marginBottom: 4, fontWeight: 500 }}>Details:</div>
                                {Object.entries(error.details).map(([key, value]) => (
                                    <div key={key} style={{ marginLeft: 8 }}>
                                        • <span style={{ fontWeight: 500 }}>{key}:</span> {String(value)}
                                    </div>
                                ))}
                            </div>
                        ) : error.details ? (
                            <div style={{ fontSize: '12px' }}>
                                {String(error.details)}
                            </div>
                        ) : null}
                    </div>
                }
                type="error"
                showIcon
                closable
                onClose={clearError}
                style={{
                    marginBottom: 16,
                    border: '1px solid #ffccc7'
                }}
            />
        );
    };

    const getMissingFieldsAlert = () => {
        if (missingFields.length === 0) return null;

        return (
            <Alert
                message="Missing Required Fields"
                description={
                    <div>
                        Please fill in the following required fields before submitting:
                        <ul style={{ margin: '8px 0 0 0', paddingLeft: '16px' }}>
                            {missingFields.map((field, index) => (
                                <li key={index} style={{ fontWeight: 500 }}>{field}</li>
                            ))}
                        </ul>
                    </div>
                }
                type="warning"
                showIcon
                closable
                onClose={() => setMissingFields([])}
                style={{
                    marginBottom: 16,
                    border: '1px solid #ffe58f'
                }}
            />
        );
    };

    const handleCreateAnother = () => {
        setShowSuccessInfo(false);
        setSubmittedData(null);
        setError(null);
        form.resetFields();
        setImageList([]);
        setVideoList([]);
        setMarkerPosition(null);
        setCurrentStep(0);
    };

    // Safe function to get display name for status
    const getStatusDisplayName = (status) => {
        if (typeof status === 'string') {
            return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
        }
        return String(status);
    };

    // Categorized amenities for better UX
    const renderCategorizedAmenities = () => {
        if (!amenities || typeof amenities !== 'object') {
            return (
                <Select
                    mode="multiple"
                    placeholder="Select amenities"
                    style={{ width: '100%' }}
                    onChange={clearError}
                >
                    {allAmenities.map(amenity => (
                        <Option key={amenity} value={amenity}>{amenity}</Option>
                    ))}
                </Select>
            );
        }

        return (
            <Collapse
                defaultActiveKey={['basics']}
                style={{ marginBottom: 16 }}
            >
                {Object.entries(amenities).map(([category, categoryAmenities]) => (
                    <Panel
                        header={category.charAt(0).toUpperCase() + category.slice(1)}
                        key={category}
                    >
                        <Row gutter={[8, 8]}>
                            {categoryAmenities.map(amenity => (
                                <Col span={8} key={amenity}>
                                    <Button
                                        type="default"
                                        size="small"
                                        style={{
                                            width: '100%',
                                            marginBottom: 4,
                                            textAlign: 'left',
                                            fontSize: '12px'
                                        }}
                                        onClick={() => {
                                            const currentAmenities = form.getFieldValue('amenities') || [];
                                            if (currentAmenities.includes(amenity)) {
                                                form.setFieldsValue({
                                                    amenities: currentAmenities.filter(a => a !== amenity)
                                                });
                                            } else {
                                                form.setFieldsValue({
                                                    amenities: [...currentAmenities, amenity]
                                                });
                                            }
                                        }}
                                    >
                                        {amenity}
                                    </Button>
                                </Col>
                            ))}
                        </Row>
                    </Panel>
                ))}
            </Collapse>
        );
    };

    const steps = [
        {
            title: 'Basic Info',
            content: (
                <Card title="Basic Information" size="small">
                    <Row gutter={[16, 0]}>
                        <Col span={12}>
                            <Form.Item
                                label="Property Title"
                                name="title"
                                rules={[{ required: true, message: 'Please enter property title' }]}
                            >
                                <Input placeholder="Enter property title" onChange={clearError} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Property Type"
                                name="type"
                                rules={[{ required: true, message: 'Please select property type' }]}
                            >
                                <Select
                                    placeholder="Select property type"
                                    onChange={clearError}
                                    showSearch
                                    filterOption={(input, option) =>
                                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                    }
                                >
                                    {propertyTypes.map(type => (
                                        <Option key={type} value={type}>{type}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item
                        label="Description"
                        name="description"
                        rules={[{ required: true, message: 'Please enter property description' }]}
                    >
                        <TextArea
                            rows={4}
                            placeholder="Enter property description"
                            maxLength={1000}
                            showCount
                            onChange={clearError}
                        />
                    </Form.Item>
                    <Row gutter={[16, 0]}>
                        <Col span={8}>
                            <Form.Item
                                label="Price"
                                name="price"
                                rules={[{ required: true, message: 'Please enter price' }]}
                            >
                                <InputNumber
                                    min={0}
                                    style={{ width: '100%' }}
                                    placeholder="Enter price"
                                    formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                    onChange={clearError}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label="Status"
                                name="status"
                            >
                                <Select
                                    onChange={clearError}
                                    showSearch
                                    filterOption={(input, option) =>
                                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                    }
                                >
                                    {statuses.map(status => (
                                        <Option key={status} value={status}>
                                            {getStatusDisplayName(status)}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label="Listed Date"
                                name="listedDate"
                            >
                                <DatePicker
                                    style={{ width: '100%' }}
                                    disabledDate={(current) => current && current > moment().endOf('day')}
                                    onChange={clearError}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>
            )
        },
        {
            title: 'Location',
            content: (
                <Card title="Location Information" size="small">
                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <Form.Item
                                label="Street Address"
                                name="address"
                                rules={[{ required: true, message: 'Please enter street address' }]}
                            >
                                <Input placeholder="Enter full street address" onChange={clearError} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Apartment/Unit"
                                name="unit"
                            >
                                <Input placeholder="Unit, Apt, Suite, etc." onChange={clearError} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={[16, 0]}>
                        <Col span={8}>
                            <Form.Item
                                label="City"
                                name="city"
                                rules={[{ required: true, message: 'Please enter city' }]}
                            >
                                <Input placeholder="Enter city" onChange={clearError} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label="State/Province"
                                name="state"
                                rules={[{ required: true, message: 'Please enter state/province' }]}
                            >
                                <Input placeholder="Enter state or province" onChange={clearError} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label="Zip/Postal Code"
                                name="zipCode"
                                rules={[{ required: true, message: 'Please enter zip/postal code' }]}
                            >
                                <Input placeholder="Enter zip or postal code" onChange={clearError} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={[16, 0]}>
                        <Col span={12}>
                            <Form.Item
                                label="Country"
                                name="country"
                                rules={[{ required: true, message: 'Please select country' }]}
                            >
                                <Select placeholder="Select country" onChange={clearError}>
                                    {countryOptions.map(country => (
                                        <Option key={country} value={country}>{country}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Neighborhood"
                                name="neighborhood"
                            >
                                <Input placeholder="Enter neighborhood (optional)" onChange={clearError} />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Map Section */}
                    <Card
                        title={
                            <Space>
                                <EnvironmentOutlined />
                                Location Map
                            </Space>
                        }
                        size="small"
                        style={{ marginTop: 16 }}
                    >
                        <div style={{ height: '300px', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
                            <MapContainer
                                center={mapCenter}
                                zoom={13}
                                style={{ height: '100%', width: '100%' }}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <MapClickHandler onMapClick={handleMapClick} />
                                {markerPosition && (
                                    <Marker position={markerPosition} />
                                )}
                            </MapContainer>
                        </div>
                        <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#666' }}>
                            Click on the map to set the property location or enter coordinates below
                        </p>
                    </Card>

                    <Row gutter={[16, 0]} style={{ marginTop: 16 }}>
                        <Col span={12}>
                            <Form.Item
                                label="Latitude"
                                name="latitude"
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    placeholder="Enter latitude"
                                    step={0.000001}
                                    min={-90}
                                    max={90}
                                    onChange={handleAddressChange}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Longitude"
                                name="longitude"
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    placeholder="Enter longitude"
                                    step={0.000001}
                                    min={-180}
                                    max={180}
                                    onChange={handleAddressChange}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>
            )
        },
        {
            title: 'Details',
            content: (
                <Card title="Property Details" size="small">
                    <Row gutter={[16, 0]}>
                        <Col span={6}>
                            <Form.Item
                                label="Bedrooms"
                                name="bedrooms"
                            >
                                <InputNumber
                                    min={0}
                                    style={{ width: '100%' }}
                                    placeholder="Bedrooms"
                                    onChange={clearError}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item
                                label="Bathrooms"
                                name="bathrooms"
                            >
                                <InputNumber
                                    min={0}
                                    step={0.5}
                                    style={{ width: '100%' }}
                                    placeholder="Bathrooms"
                                    onChange={clearError}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item
                                label="Area (sqft)"
                                name="areaSqft"
                            >
                                <InputNumber
                                    min={0}
                                    style={{ width: '100%' }}
                                    placeholder="Area"
                                    onChange={clearError}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item
                                label="Property Age"
                                name="propertyAge"
                            >
                                <InputNumber
                                    min={0}
                                    style={{ width: '100%' }}
                                    placeholder="Age in years"
                                    onChange={clearError}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={[16, 0]}>
                        <Col span={12}>
                            <Form.Item
                                label="Floor"
                                name="propertyFloor"
                            >
                                <InputNumber
                                    min={0}
                                    style={{ width: '100%' }}
                                    placeholder="Floor number"
                                    onChange={clearError}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Selected Amenities"
                                name="amenities"
                            >
                                <Select
                                    mode="multiple"
                                    placeholder="Selected amenities will appear here"
                                    style={{ width: '100%' }}
                                    value={form.getFieldValue('amenities') || []}
                                    onChange={clearError}
                                >
                                    {allAmenities.map(amenity => (
                                        <Option key={amenity} value={amenity}>{amenity}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Categorized Amenities Section */}
                    <Card title="Select Amenities" size="small" style={{ marginTop: 16 }}>
                        {renderCategorizedAmenities()}
                    </Card>

                    {/* Media Section */}
                    <Card title="Media" size="small" style={{ marginTop: 16 }}>
                        <Row gutter={[16, 0]}>
                            <Col span={12}>
                                <Form.Item label="Property Images">
                                    <Upload
                                        {...uploadProps}
                                        multiple
                                        listType="picture"
                                        accept="image/*"
                                        fileList={imageList}
                                        onChange={handleImageUpload}
                                    >
                                        <Button icon={<UploadOutlined />} loading={uploading}>
                                            Upload Images
                                        </Button>
                                    </Upload>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="Property Videos">
                                    <Upload
                                        {...uploadProps}
                                        multiple
                                        accept="video/*"
                                        fileList={videoList}
                                        onChange={handleVideoUpload}
                                    >
                                        <Button icon={<UploadOutlined />} loading={uploading}>
                                            Upload Videos
                                        </Button>
                                    </Upload>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Card>
                </Card>
            )
        },
        {
            title: 'Assignment',
            content: (
                <Card title="Assignment" size="small">
                    <Row gutter={[16, 0]}>
                        <Col span={12}>
                            <Form.Item
                                label="Assigned Agent"
                                name="agentId"
                            >
                                <Select placeholder="Select agent" allowClear onChange={clearError}>
                                    {agents.map(agent => (
                                        <Option key={agent.id} value={agent.id}>
                                            {agent.firstName} {agent.lastName}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Owner ID"
                                name="ownerId"
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    placeholder="Enter owner ID"
                                    min={1}
                                    onChange={clearError}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>
            )
        }
    ];

    return (
        <>
            {!showSuccessInfo ? (
                // FORM VIEW WITH STEPS
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    onFieldsChange={clearError}
                    initialValues={{
                        status: 'available',
                        bedrooms: 0,
                        bathrooms: 1,
                        areaSqft: 0,
                        propertyAge: 0,
                        propertyFloor: 1,
                        country: 'United States',
                        type: 'House'
                    }}
                    scrollToFirstError
                >
                    {/* ERROR ALERTS AT THE TOP */}
                    <div style={{ marginBottom: 16 }}>
                        {getErrorAlert()}
                        {getMissingFieldsAlert()}
                    </div>

                    {/* Progress Steps */}
                    <div style={{ marginBottom: 16 }}>
                        <Steps current={currentStep} size="small">
                            {steps.map((step, index) => (
                                <Step key={index} title={step.title} />
                            ))}
                        </Steps>
                    </div>

                    {/* Current Step Content */}
                    {steps[currentStep].content}

                    <Divider style={{ margin: '12px 0' }} />

                    {/* Navigation Buttons */}
                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            {currentStep > 0 && (
                                <Button onClick={prev}>
                                    Previous
                                </Button>
                            )}
                            {currentStep < steps.length - 1 && (
                                <Button type="primary" onClick={next}>
                                    Next
                                </Button>
                            )}
                            {currentStep === steps.length - 1 && (
                                <>
                                    <Button onClick={onCancel} disabled={loading}>
                                        <CloseOutlined /> Cancel
                                    </Button>
                                    <Button type="primary" htmlType="submit" loading={loading}>
                                        <SaveOutlined /> {property ? 'Update Property' : 'Create Property'}
                                    </Button>
                                </>
                            )}
                        </Space>
                    </Form.Item>
                </Form>
            ) : (
                // SUCCESS INFORMATION VIEW (After Submission)
                <div>
                    <Card bodyStyle={{ padding: '16px' }}>
                        <div style={{ textAlign: 'center', marginBottom: 16 }}>
                            <Title level={4} style={{ color: '#52c41a', marginBottom: 4 }}>
                                ✅ {property ? 'Property Updated Successfully!' : 'Property Created Successfully!'}
                            </Title>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                {property ? 'The property information has been updated.' : 'The new property has been created successfully.'}
                            </Text>
                        </div>

                        <Card
                            title="Property Information"
                            type="inner"
                            style={{ marginBottom: 12 }}
                            headStyle={{ backgroundColor: '#f0f8ff', borderBottom: '1px solid #d9d9d9', padding: '8px 12px' }}
                            bodyStyle={{ padding: '12px' }}
                        >
                            <Descriptions bordered column={1} size="small">
                                <Descriptions.Item label="Property Title">
                                    <Text strong>{submittedData?.title}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Property Type">
                                    <Text strong>{submittedData?.type}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Price">
                                    <Text strong>${submittedData?.price?.toLocaleString()}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Address">
                                    <Text>{submittedData?.address}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Status">
                                    <Text type="success" strong>
                                        {getStatusDisplayName(submittedData?.status)}
                                    </Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Reference ID">
                                    <Text type="secondary">{submittedData?.referenceId}</Text>
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>

                        <div style={{ textAlign: 'center', marginTop: 12 }}>
                            <Space>
                                {!property && (
                                    <Button
                                        type="primary"
                                        onClick={handleCreateAnother}
                                    >
                                        Create Another Property
                                    </Button>
                                )}
                                <Button
                                    onClick={onCancel}
                                >
                                    Close
                                </Button>
                            </Space>
                        </div>
                    </Card>
                </div>
            )}
        </>
    );
};

export default InsertProperty;