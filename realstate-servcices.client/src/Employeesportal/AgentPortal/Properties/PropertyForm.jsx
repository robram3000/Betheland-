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
    Spin,
    Alert
} from 'antd';
import {
    PlusOutlined,
    UploadOutlined,
    EyeOutlined,
    PlayCircleOutlined,
    EnvironmentOutlined
} from '@ant-design/icons';

// Leaflet imports
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const { Option } = Select;
const { TextArea } = Input;

// Map events component
function MapEvents({ onMapClick, position }) {
    useMapEvents({
        click(e) {
            onMapClick(e.latlng);
        },
    });
    return position ? <Marker position={position} /> : null;
}

const PropertyForm = ({
    initialValues = {},
    onSubmit,
    onCancel,
    loading = false,
    isEdit = false
}) => {
    const [form] = Form.useForm();
    const [imageList, setImageList] = useState([]);
    const [videoList, setVideoList] = useState([]);
    const [amenities, setAmenities] = useState([]);
    const [amenityInput, setAmenityInput] = useState('');
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [videoPreviewVisible, setVideoPreviewVisible] = useState(false);
    const [previewVideo, setPreviewVideo] = useState('');
    const [uploading, setUploading] = useState(false);
    const [mapPosition, setMapPosition] = useState([14.5995, 120.9842]);
    const [markerPosition, setMarkerPosition] = useState(null);
    const [isMapInteractive, setIsMapInteractive] = useState(false);
    const [isGeocoding, setIsGeocoding] = useState(false);

    // Options and constants
    const [cityOptions] = useState([
        { value: 'Manila' }, { value: 'Quezon City' }, { value: 'Makati' }, { value: 'Taguig' },
        { value: 'Pasig' }, { value: 'Mandaluyong' }, { value: 'Pasay' }, { value: 'Parañaque' },
        { value: 'Las Piñas' }, { value: 'Muntinlupa' }, { value: 'Marikina' }, { value: 'Caloocan' },
        { value: 'Valenzuela' }, { value: 'Malabon' }, { value: 'Navotas' },
    ]);

    const [stateOptions] = useState([
        { value: 'Metro Manila' }, { value: 'Cavite' }, { value: 'Laguna' }, { value: 'Rizal' },
        { value: 'Bulacan' }, { value: 'Batangas' }, { value: 'Pampanga' },
    ]);

    const [zipCodeOptions] = useState([
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

    // Initialize form
    useEffect(() => {
        if (isEdit && initialValues) {
            // Set form values for edit
            form.setFieldsValue(initialValues);

            if (initialValues.latitude && initialValues.longitude) {
                const lat = parseFloat(initialValues.latitude);
                const lng = parseFloat(initialValues.longitude);
                setMapPosition([lat, lng]);
                setMarkerPosition([lat, lng]);
            }

            if (initialValues.amenities) {
                try {
                    const parsedAmenities = JSON.parse(initialValues.amenities);
                    setAmenities(Array.isArray(parsedAmenities) ? parsedAmenities : []);
                } catch {
                    setAmenities([]);
                }
            }

            // Set existing images and videos
            if (initialValues.propertyImages) {
                setImageList(initialValues.propertyImages.map((img, index) => ({
                    uid: `existing-image-${index}`,
                    name: `property-image-${index}.jpg`,
                    status: 'done',
                    url: img.imageUrl,
                })));
            }

            if (initialValues.propertyVideos) {
                setVideoList(initialValues.propertyVideos.map((vid, index) => ({
                    uid: `existing-video-${index}`,
                    name: vid.videoName || `property-video-${index}.mp4`,
                    status: 'done',
                    url: vid.videoUrl,
                })));
            }
        } else {
            // Reset for new property
            form.resetFields();
            setAmenities([]);
            setImageList([]);
            setVideoList([]);
            setMarkerPosition(null);
        }
    }, [initialValues, isEdit, form]);

    // Form submission handler
    const handleSubmit = async (values) => {
        try {
            setUploading(true);

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
                },
                ImageUrls: [],
                VideoUrls: []
            };

            const formData = new FormData();
            formData.append('propertyData', JSON.stringify(propertyData));

            // Add new images and videos
            const newImages = imageList.filter(file => file.originFileObj);
            newImages.forEach((file) => {
                formData.append('images', file.originFileObj);
            });

            const newVideos = videoList.filter(file => file.originFileObj);
            newVideos.forEach((file) => {
                formData.append('videos', file.originFileObj);
            });

            const hasFiles = newImages.length > 0 || newVideos.length > 0;

            if (onSubmit) {
                await onSubmit(formData, hasFiles);
            }

        } catch (error) {
            message.error(`Failed to ${isEdit ? 'update' : 'create'} property: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    // Map handlers
    const handleMapClick = (latlng) => {
        if (!isMapInteractive) return;
        const { lat, lng } = latlng;
        setMarkerPosition([lat, lng]);
        form.setFieldsValue({
            latitude: lat,
            longitude: lng
        });
        message.success(`Location set: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    };

    const handleGeocodeAddress = async () => {
        const address = form.getFieldValue('address');
        const city = form.getFieldValue('city');
        if (!address || !city) {
            message.warning('Please enter address and city first');
            return;
        }

        setIsGeocoding(true);
        try {
            const fullAddress = `${address}, ${city}, ${form.getFieldValue('state') || 'Philippines'}`;
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1`
            );
            const data = await response.json();

            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                const latitude = parseFloat(lat);
                const longitude = parseFloat(lon);
                setMapPosition([latitude, longitude]);
                setMarkerPosition([latitude, longitude]);
                form.setFieldsValue({ latitude, longitude });
                message.success('Address geocoded successfully!');
                setIsMapInteractive(true);
            } else {
                message.warning('Address not found. Please set location manually.');
                setIsMapInteractive(true);
            }
        } catch (error) {
            message.error('Failed to geocode address. Please set location manually.');
            setIsMapInteractive(true);
        } finally {
            setIsGeocoding(false);
        }
    };

    const handleUseCoordinates = () => {
        const latitude = form.getFieldValue('latitude');
        const longitude = form.getFieldValue('longitude');
        if (latitude && longitude) {
            const lat = parseFloat(latitude);
            const lng = parseFloat(longitude);
            if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                setMapPosition([lat, lng]);
                setMarkerPosition([lat, lng]);
                setIsMapInteractive(true);
                message.success('Coordinates applied to map');
            } else {
                message.error('Invalid coordinates.');
            }
        } else {
            message.warning('Please enter coordinates first');
        }
    };

    // File upload handlers
    const handleImageUpload = ({ fileList }) => {
        const validFiles = fileList.filter(file => {
            const isValidType = file.type?.startsWith('image/') ||
                ['.jpg', '.jpeg', '.png', '.gif', '.webp'].some(ext =>
                    file.name?.toLowerCase().endsWith(ext));
            if (!isValidType) {
                message.error(`${file.name} is not a valid image file`);
                return false;
            }
            if (file.size && file.size > 10 * 1024 * 1024) {
                message.error(`${file.name} is too large. Maximum size is 10MB`);
                return false;
            }
            return true;
        });
        const limitedFiles = validFiles.slice(-10);
        if (limitedFiles.length < validFiles.length) {
            message.warning('Maximum 10 images allowed.');
        }
        setImageList(limitedFiles);
    };

    const handleVideoUpload = ({ fileList }) => {
        const validFiles = fileList.filter(file => {
            const isValidType = file.type?.startsWith('video/') ||
                ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv'].some(ext =>
                    file.name?.toLowerCase().endsWith(ext));
            if (!isValidType) {
                message.error(`${file.name} is not a valid video file`);
                return false;
            }
            if (file.size && file.size > 100 * 1024 * 1024) {
                message.error(`${file.name} is too large. Maximum size is 100MB`);
                return false;
            }
            return true;
        });
        const limitedFiles = validFiles.slice(-5);
        if (limitedFiles.length < validFiles.length) {
            message.warning('Maximum 5 videos allowed.');
        }
        setVideoList(limitedFiles);
    };

    // Amenities handlers
    const handleAddAmenity = () => {
        if (amenityInput && amenityInput.trim() && !amenities.includes(amenityInput.trim())) {
            setAmenities([...amenities, amenityInput.trim()]);
            setAmenityInput('');
        }
    };

    const handleRemoveAmenity = (removedAmenity) => {
        setAmenities(amenities.filter(amenity => amenity !== removedAmenity));
    };

    // Preview handlers
    const handlePreview = async (file) => {
        setPreviewImage(file.url || file.thumbUrl);
        setPreviewVisible(true);
    };

    const handleVideoPreview = async (file) => {
        setPreviewVideo(file.url || file.thumbUrl);
        setVideoPreviewVisible(true);
    };

    return (
        <Card title={isEdit ? "Edit Property" : "Add New Property"} style={{ maxWidth: 1200, margin: '0 auto' }}>
            <Spin spinning={uploading || loading}>
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    {/* Form fields remain the same as in the original InsertProperty.jsx */}
                    {/* ... include all the form fields from the original file ... */}

                    <Form.Item style={{ textAlign: 'right' }}>
                        <Space>
                            <Button onClick={onCancel} disabled={uploading}>
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={uploading}
                                icon={<PlusOutlined />}
                            >
                                {isEdit ? 'Update Property' : 'Add Property'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Spin>

            {/* Preview Modals */}
            <Modal open={previewVisible} footer={null} onCancel={() => setPreviewVisible(false)}>
                <img alt="Preview" style={{ width: '100%' }} src={previewImage} />
            </Modal>
            <Modal open={videoPreviewVisible} footer={null} onCancel={() => setVideoPreviewVisible(false)}>
                <video controls style={{ width: '100%' }} src={previewVideo} />
            </Modal>
        </Card>
    );
};

export default PropertyForm;