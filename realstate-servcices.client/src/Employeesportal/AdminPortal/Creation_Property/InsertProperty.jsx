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
    Collapse,
    Image,
    Modal
} from 'antd';
import {
    SaveOutlined,
    CloseOutlined,
    UploadOutlined,
    EnvironmentOutlined,
    EyeOutlined,
    DeleteOutlined,
    PlayCircleOutlined
} from '@ant-design/icons';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import moment from 'moment';
import propertyService from './Services/propertyService';
import agentService from '../Creation_Agent/Services/agentService';
import amenities from './services/amenities';
import statusOptions from './services/Status';
import propertyTypeOptions from './services/propertyTypeOption';
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
const DEFAULT_STATUS_OPTIONS = [
    'draft',
    'available',
    'sold',
    'rented',
    'pending',
    'expired'
];
const DEFAULT_PH_COORDINATES = [14.1999, 121.4290];
const DEFAULT_ZOOM = 15;

const reverseGeocode = async (lat, lng) => {
    let normalizedLat = lat;
    let normalizedLng = lng;

    if (lng > 180 || lng < -180) {
        normalizedLng = ((lng + 180) % 360 + 360) % 360 - 180;
    }

    if (lat > 90 || lat < -90) {
        normalizedLat = ((lat + 90) % 180 + 180) % 180 - 90;
    }

    const proxies = [
        'https://cors-anywhere.herokuapp.com/',
        'https://api.allorigins.win/raw?url=',
        'https://corsproxy.io/?',
    ];

    const targetUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${normalizedLat}&lon=${normalizedLng}&addressdetails=1&zoom=18`;

    for (let i = 0; i < proxies.length; i++) {
        try {
            const proxy = proxies[i];
            let url;

            if (proxy.includes('allorigins.win') || proxy.includes('corsproxy.io')) {
                url = proxy + encodeURIComponent(targetUrl);
            } else {
                url = proxy + targetUrl;
            }

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'PropertyApp/1.0',
                },
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) continue;

            const data = await response.json();

            if (data && data.address) {
                const address = data.address;
                let streetAddress = '';
                if (address.road) {
                    streetAddress = address.road;
                    if (address.house_number) {
                        streetAddress = `${address.house_number} ${streetAddress}`;
                    }
                } else if (address.pedestrian) {
                    streetAddress = address.pedestrian;
                } else if (address.footway) {
                    streetAddress = address.footway;
                }

                const city = address.city || address.town || address.village || address.municipality || address.county || address.hamlet || '';
                const state = address.state || address.region || address.province || address.county || '';
                const zipCode = address.postcode || '';
                const country = address.country || '';

                return {
                    address: streetAddress,
                    city: city,
                    state: state,
                    zipCode: zipCode,
                    country: country,
                    fullAddress: data.display_name || ''
                };
            }
        } catch (error) {
            console.log(`Proxy ${i} error:`, error.message);
        }
    }

    return null;
};

// Map click handler component
function MapClickHandler({ onMapClick }) {
    const map = useMapEvents({
        click(e) {
            onMapClick(e.latlng);
            map.setZoom(DEFAULT_ZOOM);
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
    const [mapCenter, setMapCenter] = useState(DEFAULT_PH_COORDINATES);
    const [markerPosition, setMarkerPosition] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [submittedData, setSubmittedData] = useState(null);
    const [showSuccessInfo, setShowSuccessInfo] = useState(false);
    const [error, setError] = useState(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [missingFields, setMissingFields] = useState([]);
    const [geocoding, setGeocoding] = useState(false);
    const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');
    const [videoPreviewVisible, setVideoPreviewVisible] = useState(false);
    const [previewVideo, setPreviewVideo] = useState('');

    // Safe options with fallbacks
    const [propertyTypes, setPropertyTypes] = useState([]);
    const [statuses, setStatuses] = useState([]);

    // Flatten amenities for the select component
    const allAmenities = amenities && typeof amenities === 'object'
        ? Object.values(amenities).flat()
        : [];

    useEffect(() => {
        initializeOptions();
        loadAgents();
        if (property) {
            initializeFormWithPropertyData();
        } else {
            form.setFieldsValue({
                country: 'Philippines',
                state: 'Laguna',
                city: 'Magdalena'
            });
        }
    }, [property, form]);

    const initializeOptions = () => {
        if (propertyTypeOptions && typeof propertyTypeOptions === 'object') {
            const flattenedTypes = Object.values(propertyTypeOptions).flat();
            setPropertyTypes(flattenedTypes);
        } else {
            setPropertyTypes(DEFAULT_PROPERTY_TYPES);
        }

        if (statusOptions && typeof statusOptions === 'object') {
            const flattenedStatuses = Object.values(statusOptions).flat();
            setStatuses(flattenedStatuses);
        } else {
            setStatuses(DEFAULT_STATUS_OPTIONS);
        }
    };

    const initializeFormWithPropertyData = () => {
        try {
            const formData = {
                ...property,
                listedDate: property.listedDate ? moment(property.listedDate) : null,
                amenities: Array.isArray(property.amenities) ? property.amenities : []
            };

            form.setFieldsValue(formData);

            // Initialize image list with preview
            if (property.propertyImages && property.propertyImages.length > 0) {
                const imagesWithPreview = property.propertyImages.map(img => ({
                    uid: img.id || `img-${Date.now()}`,
                    name: `image-${img.id}.jpg`,
                    status: 'done',
                    url: img.imageUrl,
                    thumbUrl: img.imageUrl
                }));
                setImageList(imagesWithPreview);
            }

            // Initialize video list with preview
            if (property.propertyVideos && property.propertyVideos.length > 0) {
                const videosWithPreview = property.propertyVideos.map(vid => ({
                    uid: vid.id || `vid-${Date.now()}`,
                    name: vid.videoName || `video-${vid.id}.mp4`,
                    status: 'done',
                    url: vid.videoUrl
                }));
                setVideoList(videosWithPreview);
            }

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

    // Enhanced image upload handler
    const handleImageUpload = ({ file, fileList }) => {
        if (file.status === 'uploading') {
            setUploading(true);
        } else if (file.status === 'done') {
            setUploading(false);
            message.success(`${file.name} uploaded successfully`);

            // Create preview for newly uploaded images
            const updatedList = fileList.map(item => {
                if (item.originFileObj && !item.url) {
                    return {
                        ...item,
                        url: URL.createObjectURL(item.originFileObj),
                        thumbUrl: URL.createObjectURL(item.originFileObj)
                    };
                }
                return item;
            });
            setImageList(updatedList);
        } else if (file.status === 'error') {
            setUploading(false);
            message.error(`${file.name} upload failed`);
        }

        setImageList(fileList);
    };

    // Enhanced video upload handler
    const handleVideoUpload = ({ file, fileList }) => {
        if (file.status === 'uploading') {
            setUploading(true);
        } else if (file.status === 'done') {
            setUploading(false);
            message.success(`${file.name} uploaded successfully`);

            // Create preview for newly uploaded videos
            const updatedList = fileList.map(item => {
                if (item.originFileObj && !item.url) {
                    return {
                        ...item,
                        url: URL.createObjectURL(item.originFileObj)
                    };
                }
                return item;
            });
            setVideoList(updatedList);
        } else if (file.status === 'error') {
            setUploading(false);
            message.error(`${file.name} upload failed`);
        }

        setVideoList(fileList);
    };

    // Image preview handlers
    const handlePreview = async (file) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }
        setPreviewImage(file.url || file.preview);
        setPreviewVisible(true);
        setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
    };

    const handleCancel = () => setPreviewVisible(false);

    // Video preview handlers
    const handleVideoPreview = (file) => {
        setPreviewVideo(file.url || URL.createObjectURL(file.originFileObj));
        setVideoPreviewVisible(true);
    };

    const handleVideoCancel = () => setVideoPreviewVisible(false);

    // Helper function to get base64 for preview
    const getBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    };

    // Custom upload button for images
    const uploadButton = (
        <div>
            <UploadOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
        </div>
    );

    // Custom upload button for videos
    const videoUploadButton = (
        <div>
            <UploadOutlined />
            <div style={{ marginTop: 8 }}>Upload Video</div>
        </div>
    );

    // Custom item render for images with preview and delete
    const customItemRender = (originNode, file, fileList, actions) => {
        return (
            <div style={{ display: 'flex', alignItems: 'center', padding: '8px', border: '1px solid #d9d9d9', borderRadius: '6px', marginBottom: '8px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                    {file.type?.startsWith('image/') ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Image
                                width={50}
                                height={50}
                                src={file.thumbUrl || file.url}
                                style={{ objectFit: 'cover', borderRadius: '4px' }}
                                preview={false}
                            />
                            <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {file.name}
                            </span>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <PlayCircleOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                            <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {file.name}
                            </span>
                        </div>
                    )}
                </div>
                <Space>
                    <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => file.type?.startsWith('image/') ? handlePreview(file) : handleVideoPreview(file)}
                        size="small"
                    />
                    <Button
                        type="text"
                        icon={<DeleteOutlined />}
                        onClick={() => actions.remove()}
                        size="small"
                        danger
                    />
                </Space>
            </div>
        );
    };

    const countryOptions = [
        'Philippines',
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

    const imageUploadProps = {
        beforeUpload: (file) => {
            const isImage = file.type.startsWith('image/');
            if (!isImage) {
                message.error('You can only upload image files!');
                return Upload.LIST_IGNORE;
            }

            if (file.size > 10 * 1024 * 1024) {
                message.error('Image must be smaller than 10MB!');
                return Upload.LIST_IGNORE;
            }

            return false;
        },
        fileList: imageList,
        onChange: handleImageUpload,
        onPreview: handlePreview,
        multiple: true,
        accept: "image/*",
        listType: "picture-card",
        showUploadList: {
            showPreviewIcon: false,
            showRemoveIcon: false,
        },
        itemRender: customItemRender
    };

    const videoUploadProps = {
        beforeUpload: (file) => {
            const isVideo = file.type.startsWith('video/');
            if (!isVideo) {
                message.error('You can only upload video files!');
                return Upload.LIST_IGNORE;
            }

            if (file.size > 100 * 1024 * 1024) {
                message.error('Video must be smaller than 100MB!');
                return Upload.LIST_IGNORE;
            }

            return false;
        },
        fileList: videoList,
        onChange: handleVideoUpload,
        onPreview: handleVideoPreview,
        multiple: true,
        accept: "video/*",
        listType: "picture-card",
        showUploadList: {
            showPreviewIcon: false,
            showRemoveIcon: false,
        },
        itemRender: customItemRender
    };

    const handleMapClick = async (latlng) => {
        console.log('Map clicked at:', latlng);

        setMarkerPosition([latlng.lat, latlng.lng]);
        setMapCenter([latlng.lat, latlng.lng]);
        setMapZoom(DEFAULT_ZOOM);

        form.setFieldsValue({
            latitude: latlng.lat,
            longitude: latlng.lng
        });

        setGeocoding(true);
        message.loading('Fetching address details...', 0);

        try {
            const addressData = await reverseGeocode(latlng.lat, latlng.lng);

            if (addressData) {
                console.log('Geocoding result for form:', addressData);

                const updates = {
                    address: addressData.address || '',
                    city: addressData.city || '',
                    state: addressData.state || '',
                    zipCode: addressData.zipCode || '',
                    country: addressData.country || ''
                };

                console.log('Setting form fields with:', updates);

                setTimeout(() => {
                    form.setFieldsValue(updates);
                    message.destroy();
                    message.success('Address details filled automatically');
                }, 100);

            } else {
                message.destroy();
                message.warning('Could not fetch address details for this location');
            }
        } catch (error) {
            console.error('Error in reverse geocoding:', error);
            message.destroy();
            message.error('Failed to fetch address details');
        } finally {
            setGeocoding(false);
        }
    };

    const handleGeocodeFromCoordinates = async () => {
        const latitude = form.getFieldValue('latitude');
        const longitude = form.getFieldValue('longitude');

        if (!latitude || !longitude) {
            message.warning('Please enter both latitude and longitude');
            return;
        }

        setGeocoding(true);
        try {
            message.loading('Fetching address details...', 0);
            const addressData = await reverseGeocode(latitude, longitude);

            if (addressData) {
                console.log('Geocoding result for coordinates:', addressData);

                const updates = {
                    address: addressData.address || '',
                    city: addressData.city || '',
                    state: addressData.state || '',
                    zipCode: addressData.zipCode || '',
                    country: addressData.country || ''
                };

                console.log('Setting form fields with:', updates);
                form.setFieldsValue(updates);

                setMapCenter([parseFloat(latitude), parseFloat(longitude)]);
                setMarkerPosition([parseFloat(latitude), parseFloat(longitude)]);
                setMapZoom(DEFAULT_ZOOM);

                message.destroy();
                message.success('Address details filled automatically');
            } else {
                message.destroy();
                message.warning('Could not fetch address details for these coordinates');
            }
        } catch (error) {
            console.error('Error in reverse geocoding:', error);
            message.destroy();
            message.error('Failed to fetch address details');
        } finally {
            setGeocoding(false);
        }
    };

    const handleAddressChange = () => {
        const latitude = form.getFieldValue('latitude');
        const longitude = form.getFieldValue('longitude');

        if (latitude && longitude) {
            setMapCenter([parseFloat(latitude), parseFloat(longitude)]);
            setMarkerPosition([parseFloat(latitude), parseFloat(longitude)]);
            setMapZoom(DEFAULT_ZOOM);
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
                currentMissing.push('Address');
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
            1: ['address', 'city', 'state', 'zipCode', 'country', 'latitude', 'longitude'],
            2: ['bedrooms', 'bathrooms', 'kitchen', 'garage', 'areaSqm', 'propertyAge', 'propertyFloor', 'amenities'],
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
            const allStepFields = [0, 1, 2, 3].flatMap(step => getStepFields(step));
            const allValues = form.getFieldsValue(allStepFields);

            const missingFields = [];

            if (!allValues.title) missingFields.push('Property Title');
            if (!allValues.type) missingFields.push('Property Type');
            if (!allValues.description) missingFields.push('Description');
            if (!allValues.price || allValues.price <= 0) missingFields.push('Price');
            if (!allValues.address) missingFields.push('Address');
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

            // Prepare files for upload - ensure we're only getting File objects
            const imageFiles = imageList
                .filter(file => file.originFileObj instanceof File)
                .map(file => file.originFileObj);

            const videoFiles = videoList
                .filter(file => file.originFileObj instanceof File)
                .map(file => file.originFileObj);

            // Convert amenities array to comma-separated string if it's an array
            let amenitiesValue = allValues.amenities;
            if (Array.isArray(amenitiesValue)) {
                amenitiesValue = amenitiesValue.join(', ');
            } else if (!amenitiesValue) {
                amenitiesValue = '';
            }

            // Format the property data for API
            const propertyData = {
                title: allValues.title,
                type: allValues.type,
                description: allValues.description,
                price: parseFloat(allValues.price) || 0,
                status: allValues.status || 'available',
                listedDate: allValues.listedDate ? allValues.listedDate.toISOString() : new Date().toISOString(),
                address: allValues.address,
                city: allValues.city,
                state: allValues.state,
                zipCode: allValues.zipCode,
                country: allValues.country,
                latitude: allValues.latitude ? parseFloat(allValues.latitude) : null,
                longitude: allValues.longitude ? parseFloat(allValues.longitude) : null,
                bedrooms: parseInt(allValues.bedrooms) || 0,
                bathrooms: parseFloat(allValues.bathrooms) || 0,
                kitchen: parseInt(allValues.kitchen) || 0,
                garage: parseInt(allValues.garage) || 0,
                areaSqm: parseInt(allValues.areaSqm) || 0,
                propertyAge: parseInt(allValues.propertyAge) || 0,
                propertyFloor: parseInt(allValues.propertyFloor) || 1,
                amenities: amenitiesValue, // This is now a string instead of array
                ownerId: allValues.ownerId ? parseInt(allValues.ownerId) : null,
                agentId: allValues.agentId ? parseInt(allValues.agentId) : null,
            };

            console.log('Submitting property data:', propertyData);
            console.log('Amenities value:', amenitiesValue);
            console.log('Amenities type:', typeof amenitiesValue);
            console.log('Image files to upload:', imageFiles.length);
            console.log('Video files to upload:', videoFiles.length);

            let result;
            if (property) {
                // Update existing property
                if (imageFiles.length > 0 || videoFiles.length > 0) {
                    console.log('Updating property with media...');
                    result = await propertyService.updatePropertyWithMedia(property.id, propertyData, imageFiles, videoFiles);
                } else {
                    console.log('Updating property without media...');
                    result = await propertyService.updateProperty(property.id, propertyData);
                }
                message.success('Property updated successfully');
            } else {
                // Create new property
                if (imageFiles.length > 0 || videoFiles.length > 0) {
                    console.log('Creating property with media...');
                    result = await propertyService.createPropertyWithMedia(propertyData, imageFiles, videoFiles);
                } else {
                    console.log('Creating property without media...');
                    result = await propertyService.createProperty(propertyData);
                }
                message.success('Property created successfully');
            }

            console.log('API Response:', result);

            // Handle successful response
            if (result && (result.property || result.id)) {
                const propertyResult = result.property || result;

                setSubmittedData({
                    title: propertyData.title,
                    type: propertyData.type,
                    price: propertyData.price,
                    address: `${propertyData.address}, ${propertyData.city}, ${propertyData.state}, ${propertyData.zipCode}, ${propertyData.country}`,
                    status: propertyData.status,
                    referenceId: propertyResult.id || `PROP-${Date.now()}`
                });

                setShowSuccessInfo(true);

                if (onSuccess) {
                    onSuccess(propertyResult);
                }
            } else {
                throw new Error('Invalid response from server');
            }

        } catch (error) {
            console.error('Error saving property:', error);
            const errorMessage = error.message || `Failed to ${property ? 'update' : 'create'} property`;

            // More detailed error message
            let displayMessage = errorMessage;
            if (error.details && Array.isArray(error.details) && error.details.length > 0) {
                displayMessage += `: ${error.details.join(', ')}`;
            } else if (error.details) {
                displayMessage += `: ${error.details}`;
            }

            message.error(displayMessage);
            setError({
                message: displayMessage,
                details: error.details
            });
        } finally {
            setLoading(false);
        }
    };

    const getErrorAlert = () => {
        if (!error) return null;

        return (
            <Alert
                message="Error"
                description={error.message}
                type="error"
                showIcon
                closable
                onClose={clearError}
                style={{ marginBottom: 16 }}
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
                        Please fill in the following required fields:
                        <ul style={{ margin: '8px 0 0 0', paddingLeft: '16px' }}>
                            {missingFields.map((field, index) => (
                                <li key={index}>{field}</li>
                            ))}
                        </ul>
                    </div>
                }
                type="warning"
                showIcon
                closable
                onClose={() => setMissingFields([])}
                style={{ marginBottom: 16 }}
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
        setMapCenter(DEFAULT_PH_COORDINATES);
        setMapZoom(DEFAULT_ZOOM);
        setCurrentStep(0);

        setTimeout(() => {
            form.setFieldsValue({
                country: 'Philippines',
                state: 'Laguna',
                city: 'Magdalena'
            });
        }, 100);
    };

    const getStatusDisplayName = (status) => {
        if (typeof status === 'string') {
            return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
        }
        return String(status);
    };

    const renderCategorizedAmenities = () => {
        if (!amenities || typeof amenities !== 'object') {
            return (
                <Select
                    mode="multiple"
                    placeholder="Select amenities"
                    style={{ width: '100%' }}
                >
                    {allAmenities.map(amenity => (
                        <Option key={amenity} value={amenity}>{amenity}</Option>
                    ))}
                </Select>
            );
        }

        return (
            <Collapse defaultActiveKey={['basics']} style={{ marginBottom: 16 }}>
                {Object.entries(amenities).map(([category, categoryAmenities]) => (
                    <Panel header={category.charAt(0).toUpperCase() + category.slice(1)} key={category}>
                        <Row gutter={[8, 8]}>
                            {categoryAmenities.map(amenity => (
                                <Col span={8} key={amenity}>
                                    <Button
                                        type="default"
                                        size="small"
                                        style={{ width: '100%', marginBottom: 4, textAlign: 'left', fontSize: '12px' }}
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
                                <Input placeholder="Enter property title" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Property Type"
                                name="type"
                                rules={[{ required: true, message: 'Please select property type' }]}
                            >
                                <Select placeholder="Select property type" showSearch>
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
                        <TextArea rows={4} placeholder="Enter property description" maxLength={1000} showCount />
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
                                    formatter={value => `₱ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={value => value.replace(/\₱\s?|(,*)/g, '')}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="Status" name="status">
                                <Select showSearch>
                                    {statuses.map(status => (
                                        <Option key={status} value={status}>
                                            {getStatusDisplayName(status)}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="Listed Date" name="listedDate">
                                <DatePicker
                                    style={{ width: '100%' }}
                                    disabledDate={(current) => current && current > moment().endOf('day')}
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
                        <Col span={24}>
                            <Form.Item
                                label="Address"
                                name="address"
                                rules={[{ required: true, message: 'Please enter address' }]}
                            >
                                <Input placeholder="Enter address (e.g., 123 Main St)" />
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
                                <Input placeholder="Enter city" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label="State/Province"
                                name="state"
                                rules={[{ required: true, message: 'Please enter state/province' }]}
                            >
                                <Input placeholder="Enter state or province" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label="Zip/Postal Code"
                                name="zipCode"
                                rules={[{ required: true, message: 'Please enter zip/postal code' }]}
                            >
                                <Input placeholder="Enter zip or postal code" />
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
                                <Select placeholder="Select country">
                                    {countryOptions.map(country => (
                                        <Option key={country} value={country}>{country}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Map Section */}
                    <Card
                        title={<Space><EnvironmentOutlined />Location Map - Magdalena, Laguna, Philippines</Space>}
                        size="small"
                        style={{ marginTop: 16 }}
                    >
                        <div style={{ height: '300px', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
                            <MapContainer
                                center={mapCenter}
                                zoom={mapZoom}
                                style={{ height: '100%', width: '100%' }}
                                key={`${mapCenter[0]}-${mapCenter[1]}-${mapZoom}`}
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
                            Click on the map to set the property location and automatically fill address details
                        </p>
                    </Card>

                    {/* Coordinates Section with Geocode Button */}
                    <Row gutter={[16, 0]} style={{ marginTop: 16 }}>
                        <Col span={10}>
                            <Form.Item label="Latitude" name="latitude">
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
                        <Col span={10}>
                            <Form.Item label="Longitude" name="longitude">
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
                        <Col span={4}>
                            <Form.Item label=" ">
                                <Button
                                    onClick={handleGeocodeFromCoordinates}
                                    loading={geocoding}
                                    style={{ marginTop: '29px', width: '100%' }}
                                    icon={<EnvironmentOutlined />}
                                >
                                    Get Address
                                </Button>
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
                            <Form.Item label="Bedrooms" name="bedrooms">
                                <InputNumber min={0} style={{ width: '100%' }} placeholder="Bedrooms" />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item label="Bathrooms" name="bathrooms">
                                <InputNumber min={0} step={0.5} style={{ width: '100%' }} placeholder="Bathrooms" />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item label="Kitchen" name="kitchen">
                                <InputNumber min={0} style={{ width: '100%' }} placeholder="Kitchen" />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item label="Garage" name="garage">
                                <InputNumber min={0} style={{ width: '100%' }} placeholder="Garage" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={[16, 0]}>
                        <Col span={6}>
                            <Form.Item label="Area (sqm)" name="areaSqm">
                                <InputNumber min={0} style={{ width: '100%' }} placeholder="Area in sqm" />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item label="Property Age" name="propertyAge">
                                <InputNumber min={0} style={{ width: '100%' }} placeholder="Age in years" />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item label="Floor" name="propertyFloor">
                                <InputNumber min={0} style={{ width: '100%' }} placeholder="Floor number" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item label="Selected Amenities" name="amenities">
                        <Select mode="multiple" placeholder="Selected amenities will appear here" style={{ width: '100%' }}>
                            {allAmenities.map(amenity => (
                                <Option key={amenity} value={amenity}>{amenity}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Card title="Select Amenities" size="small" style={{ marginTop: 16 }}>
                        {renderCategorizedAmenities()}
                    </Card>

                    <Card title="Media" size="small" style={{ marginTop: 16 }}>
                        <Row gutter={[16, 16]}>
                            <Col span={24}>
                                <Form.Item label="Property Images">
                                    <div>
                                        <Upload {...imageUploadProps}>
                                            {imageList.length >= 8 ? null : uploadButton}
                                        </Upload>
                                        <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                                            Upload up to 8 images. Click on images to preview.
                                        </div>
                                    </div>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={[16, 16]}>
                            <Col span={24}>
                                <Form.Item label="Property Videos">
                                    <div>
                                        <Upload {...videoUploadProps}>
                                            {videoList.length >= 5 ? null : videoUploadButton}
                                        </Upload>
                                        <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                                            Upload up to 5 videos. Click on videos to preview.
                                        </div>
                                    </div>
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
                            <Form.Item label="Assigned Agent" name="agentId">
                                <Select placeholder="Select agent" allowClear>
                                    {agents.map(agent => (
                                        <Option key={agent.id} value={agent.id}>
                                            {agent.firstName} {agent.lastName}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Owner ID" name="ownerId">
                                <InputNumber style={{ width: '100%' }} placeholder="Enter owner ID" min={1} />
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
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{
                        status: 'available',
                        bedrooms: 0,
                        bathrooms: 1,
                        kitchen: 0,
                        garage: 0,
                        areaSqm: 0,
                        propertyAge: 0,
                        propertyFloor: 1,
                        country: 'Philippines',
                        state: 'Laguna',
                        city: 'Magdalena',
                        type: 'House'
                    }}
                >
                    <div style={{ marginBottom: 16 }}>
                        {getErrorAlert()}
                        {getMissingFieldsAlert()}
                    </div>

                    <div style={{ marginBottom: 16 }}>
                        <Steps current={currentStep} size="small">
                            {steps.map((step, index) => (
                                <Step key={index} title={step.title} />
                            ))}
                        </Steps>
                    </div>

                    {steps[currentStep].content}

                    {/* Image Preview Modal */}
                    <Modal
                        open={previewVisible}
                        title={previewTitle}
                        footer={null}
                        onCancel={handleCancel}
                        width="80vw"
                        style={{ top: 20 }}
                    >
                        <img alt="Preview" style={{ width: '100%' }} src={previewImage} />
                    </Modal>

                    {/* Video Preview Modal */}
                    <Modal
                        open={videoPreviewVisible}
                        title="Video Preview"
                        footer={null}
                        onCancel={handleVideoCancel}
                        width="80vw"
                        style={{ top: 20 }}
                    >
                        <video
                            controls
                            style={{ width: '100%', maxHeight: '70vh' }}
                            src={previewVideo}
                        >
                            Your browser does not support the video tag.
                        </video>
                    </Modal>

                    <Divider style={{ margin: '12px 0' }} />

                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            {currentStep > 0 && (
                                <Button onClick={prev}>Previous</Button>
                            )}
                            {currentStep < steps.length - 1 && (
                                <Button type="primary" onClick={next}>Next</Button>
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
                <div>
                    <Card bodyStyle={{ padding: '16px' }}>
                        <div style={{ textAlign: 'center', marginBottom: 16 }}>
                            <Title level={4} style={{ color: '#52c41a', marginBottom: 4 }}>
                                ✅ {property ? 'Property Updated Successfully!' : 'Property Created Successfully!'}
                            </Title>
                            <Text type="secondary">
                                {property ? 'The property information has been updated.' : 'The new property has been created successfully.'}
                            </Text>
                        </div>

                        <Card title="Property Information" type="inner" style={{ marginBottom: 12 }}>
                            <Descriptions bordered column={1} size="small">
                                <Descriptions.Item label="Property Title">
                                    <Text strong>{submittedData?.title}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Property Type">
                                    <Text strong>{submittedData?.type}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Price">
                                    <Text strong>₱{submittedData?.price?.toLocaleString()}</Text>
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
                                    <Button type="primary" onClick={handleCreateAnother}>
                                        Create Another Property
                                    </Button>
                                )}
                                <Button onClick={onCancel}>Close</Button>
                            </Space>
                        </div>
                    </Card>
                </div>
            )}
        </>
    );
};

export default InsertProperty;