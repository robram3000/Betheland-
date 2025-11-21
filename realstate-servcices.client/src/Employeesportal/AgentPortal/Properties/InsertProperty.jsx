// InsertProperty.jsx (Agent Version)
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
    Steps,
    Alert,
    Typography,
    Descriptions,
    Collapse,
    Image,
    Modal,
    Progress,
    notification,
    Spin
} from 'antd';
import {
    SaveOutlined,
    CloseOutlined,
    UploadOutlined,
    EnvironmentOutlined,
    EyeOutlined,
    DeleteOutlined,
    PlayCircleOutlined,
    CheckCircleOutlined,
    SearchOutlined,
    AimOutlined,
    UserOutlined
} from '@ant-design/icons';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import propertyService from '../../AdminPortal/Creation_Property/services/propertyService';
import authService from '../../../Authpage/Services/LoginAuth';
import agentService from '../../AdminPortal/Creation_Agent/Services/AgentService';
import amenities from '../../AdminPortal/Creation_Property/services/amenities';
import statusOptions from '../../AdminPortal/Creation_Property/services/Status';
import propertyTypeOptions from '../../AdminPortal/Creation_Property/services/propertyTypeOption';

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

const DEFAULT_PH_COORDINATES = [14.5995, 120.9842]; // Manila coordinates
const DEFAULT_ZOOM = 15;

// Enhanced Philippine Location API Service using PSGC API
const phLocationService = {
    // Get all provinces
    getProvinces: async () => {
        try {
            const response = await fetch('https://psgc.gitlab.io/api/provinces/');
            if (!response.ok) throw new Error('Failed to fetch provinces');
            const provinces = await response.json();

            // Ensure Metro Manila is included as a province
            const metroManila = provinces.find(p =>
                p.name === 'Metro Manila' ||
                p.name === 'National Capital Region'
            );

            if (!metroManila) {
                provinces.unshift({
                    code: '130000000',
                    name: 'Metro Manila',
                    regionCode: '130000000',
                    regionName: 'National Capital Region'
                });
            }

            return provinces;
        } catch (error) {
            console.error('Error fetching provinces:', error);
            return [];
        }
    },

    // Get cities and municipalities by province code
    getCitiesByProvince: async (provinceCode) => {
        try {
            // Handle Metro Manila specially
            if (provinceCode === '130000000') {
                return getMetroManilaCities();
            }

            const response = await fetch(`https://psgc.gitlab.io/api/provinces/${provinceCode}/cities-municipalities/`);
            if (!response.ok) throw new Error('Failed to fetch cities/municipalities');
            let cities = await response.json();

            cities.sort((a, b) => a.name.localeCompare(b.name));
            return cities;
        } catch (error) {
            console.error('Error fetching cities:', error);
            return [];
        }
    },

    // Get barangays by city/municipality code
    getBarangaysByCity: async (cityCode) => {
        try {
            const response = await fetch(`https://psgc.gitlab.io/api/cities-municipalities/${cityCode}/barangays/`);
            if (!response.ok) throw new Error('Failed to fetch barangays');
            const barangays = await response.json();

            barangays.sort((a, b) => a.name.localeCompare(b.name));
            return barangays;
        } catch (error) {
            console.error('Error fetching barangays:', error);
            return [];
        }
    },

    // Get zip code from PSGC API
    getZipCodeByCity: async (cityCode) => {
        try {
            // First try to get city data which might contain zip code
            const response = await fetch(`https://psgc.gitlab.io/api/cities-municipalities/${cityCode}/`);
            if (!response.ok) throw new Error('Failed to fetch city data');
            const cityData = await response.json();

            // Some PSGC entries have zip codes in the name or other fields
            if (cityData.name && cityData.name.includes('(')) {
                const zipMatch = cityData.name.match(/\((\d{4})\)/);
                if (zipMatch) {
                    return zipMatch[1];
                }
            }

            // Fallback to our predefined zip codes for major cities
            return getFallbackZipCodeByCityCode(cityCode);
        } catch (error) {
            console.error('Error fetching zip code:', error);
            return getFallbackZipCodeByCityCode(cityCode);
        }
    },

    // Get zip code by barangay (if available)
    getZipCodeByBarangay: async (barangayCode) => {
        try {
            const response = await fetch(`https://psgc.gitlab.io/api/barangays/${barangayCode}/`);
            if (!response.ok) throw new Error('Failed to fetch barangay data');
            const barangayData = await response.json();

            // Some barangay entries might have zip codes
            if (barangayData.name && barangayData.name.includes('(')) {
                const zipMatch = barangayData.name.match(/\((\d{4})\)/);
                if (zipMatch) {
                    return zipMatch[1];
                }
            }

            return null; // No specific barangay zip code found
        } catch (error) {
            console.error('Error fetching barangay zip code:', error);
            return null;
        }
    },

    // Enhanced geocode address
    geocodeAddress: async (address, city, province, country = 'Philippines') => {
        try {
            const predefinedCoords = getPredefinedCityCoordinates(city, province);
            if (predefinedCoords) {
                return predefinedCoords;
            }

            const query = `${address}, ${city}, ${province}, ${country}`.replace(/\s+/g, '+');
            return await fetchCoordinates(query);
        } catch (error) {
            console.error('Error geocoding address:', error);
            return null;
        }
    }
};

// Helper function for Metro Manila cities
const getMetroManilaCities = () => {
    return [
        { code: '133900000', name: 'Manila', type: 'HUC' },
        { code: '133901000', name: 'Quezon City', type: 'HUC' },
        { code: '133902000', name: 'Caloocan', type: 'HUC' },
        { code: '133903000', name: 'Las Piñas', type: 'HUC' },
        { code: '133904000', name: 'Makati', type: 'HUC' },
        { code: '133905000', name: 'Malabon', type: 'HUC' },
        { code: '133906000', name: 'Mandaluyong', type: 'HUC' },
        { code: '133907000', name: 'Marikina', type: 'HUC' },
        { code: '133908000', name: 'Muntinlupa', type: 'HUC' },
        { code: '133909000', name: 'Navotas', type: 'HUC' },
        { code: '133910000', name: 'Parañaque', type: 'HUC' },
        { code: '133911000', name: 'Pasay', type: 'HUC' },
        { code: '133912000', name: 'Pasig', type: 'HUC' },
        { code: '133913000', name: 'San Juan', type: 'HUC' },
        { code: '133914000', name: 'Taguig', type: 'HUC' },
        { code: '133915000', name: 'Valenzuela', type: 'HUC' },
        { code: '133916000', name: 'Pateros', type: 'MUN' }
    ];
};

// Fallback zip codes for major cities by city code
const getFallbackZipCodeByCityCode = (cityCode) => {
    const zipCodeMap = {
        // Metro Manila
        '133900000': '1000', // Manila
        '133901000': '1100', // Quezon City
        '133902000': '1400', // Caloocan
        '133903000': '1740', // Las Piñas
        '133904000': '1200', // Makati
        '133905000': '1470', // Malabon
        '133906000': '1550', // Mandaluyong
        '133907000': '1800', // Marikina
        '133908000': '1771', // Muntinlupa
        '133909000': '1485', // Navotas
        '133910000': '1700', // Parañaque
        '133911000': '1300', // Pasay
        '133912000': '1600', // Pasig
        '133913000': '1500', // San Juan
        '133914000': '1630', // Taguig
        '133915000': '1441', // Valenzuela
        '133916000': '1620', // Pateros

        // Laguna
        '043401000': '4007', // Magdalena
        '043402000': '4009', // Santa Cruz
        '043403000': '4027', // Calamba
        '043404000': '4000', // San Pablo
        '043405000': '4030', // Los Baños
        '043406000': '4026', // Santa Rosa
        '043407000': '4024', // Biñan
        '043408000': '4025', // Cabuyao
        '043409000': '4023', // San Pedro

        // Cavite
        '043101000': '4114', // Dasmarinas
        '043102000': '4102', // Bacoor
        '043103000': '4103', // Imus
        '043104000': '4107', // General Trias
        '043105000': '4109', // Trece Martires
        '043106000': '4120', // Tagaytay
        '043107000': '4118', // Silang

        // Batangas
        '041005000': '4200', // Batangas City
        '041006000': '4217', // Lipa City
        '041035000': '4232', // Tanauan City

        // Bulacan
        '031404000': '3000', // Malolos
        '031410000': '3020', // Meycauayan

        // Rizal
        '137401000': '1870', // Antipolo
        '137404000': '1920', // Taytay
        '137402000': '1900', // Cainta
        '137403000': '1930', // Angono
        '137405000': '1940', // Binangonan
        '137406000': '1860'  // Rodriguez
    };

    return zipCodeMap[cityCode] || '';
};

// Predefined coordinates for major cities
const getPredefinedCityCoordinates = (cityName, provinceName) => {
    const cityCoordinates = {
        // Metro Manila
        'Manila': [14.5995, 120.9842],
        'Quezon City': [14.6760, 121.0437],
        'Caloocan': [14.6540, 120.9833],
        'Las Piñas': [14.4517, 120.9930],
        'Makati': [14.5547, 121.0244],
        'Malabon': [14.6629, 120.9569],
        'Mandaluyong': [14.5794, 121.0359],
        'Marikina': [14.6500, 121.1000],
        'Muntinlupa': [14.4081, 121.0405],
        'Navotas': [14.6667, 120.9500],
        'Parañaque': [14.4793, 121.0198],
        'Pasay': [14.5378, 121.0014],
        'Pasig': [14.5750, 121.0833],
        'San Juan': [14.6039, 121.0333],
        'Taguig': [14.5176, 121.0509],
        'Valenzuela': [14.7000, 120.9833],
        'Pateros': [14.5417, 121.0667],

        // Laguna
        'Magdalena': [14.1999, 121.4290],
        'Santa Cruz': [14.2814, 121.4161],
        'Calamba': [14.2118, 121.1653],
        'San Pablo': [14.0680, 121.3253],
        'Los Baños': [14.1667, 121.2167],
        'Santa Rosa': [14.3125, 121.1094],
        'Biñan': [14.3333, 121.0833],
        'Cabuyao': [14.2725, 121.1261],
        'San Pedro': [14.3649, 121.0550],

        // Cavite
        'Dasmarinas': [14.3294, 120.9367],
        'Bacoor': [14.4624, 120.9645],
        'Imus': [14.4297, 120.9367],
        'Tagaytay': [14.1000, 120.9333],

        // Batangas
        'Batangas City': [13.7565, 121.0583],
        'Lipa': [13.9411, 121.1622],
        'Tanauan': [14.0862, 121.1498],

        // Bulacan
        'Malolos': [14.8433, 120.8114],
        'Meycauayan': [14.7369, 120.9600],

        // Rizal
        'Antipolo': [14.6255, 121.1245],
        'Taytay': [14.5692, 121.1325]
    };

    return cityCoordinates[cityName] ? {
        lat: cityCoordinates[cityName][0],
        lng: cityCoordinates[cityName][1]
    } : null;
};

// Helper function to fetch coordinates
const fetchCoordinates = async (query) => {
    const proxies = [
        'https://cors-anywhere.herokuapp.com/',
        'https://api.allorigins.win/raw?url=',
        'https://corsproxy.io/?',
    ];

    const targetUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;

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

            if (data && data.length > 0) {
                return {
                    lat: parseFloat(data[0].lat),
                    lng: parseFloat(data[0].lon)
                };
            }
        } catch (error) {
            console.log(`Proxy ${i} error:`, error.message);
        }
    }

    return null;
};

// Enhanced reverse geocoding for Philippines
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

    const targetUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${normalizedLat}&lon=${normalizedLng}&addressdetails=1&zoom=18&accept-language=en`;

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
            const timeoutId = setTimeout(() => controller.abort(), 15000);

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

                // Enhanced address parsing for Philippine addresses
                let streetAddress = '';

                // Try multiple address components for street name
                if (address.road) {
                    streetAddress = address.road;
                    if (address.house_number) {
                        streetAddress = `${address.house_number} ${streetAddress}`;
                    }
                } else if (address.pedestrian) {
                    streetAddress = address.pedestrian;
                } else if (address.footway) {
                    streetAddress = address.footway;
                } else if (address.residential) {
                    streetAddress = address.residential;
                } else if (address.neighbourhood) {
                    streetAddress = address.neighbourhood;
                } else if (address.suburb) {
                    streetAddress = address.suburb;
                }

                // Enhanced city detection for Philippines
                const city = address.city ||
                    address.town ||
                    address.village ||
                    address.municipality ||
                    address.county ||
                    address.hamlet ||
                    address.suburb ||
                    '';

                // Enhanced state/province detection
                const state = address.state ||
                    address.region ||
                    address.province ||
                    address.county ||
                    '';

                const zipCode = address.postcode || '';
                const country = address.country || '';

                // For Philippines, try to extract barangay
                const barangay = address.neighbourhood ||
                    address.suburb ||
                    address.village ||
                    '';

                console.log('Parsed address components:', {
                    streetAddress,
                    city,
                    state,
                    zipCode,
                    country,
                    barangay,
                    rawAddress: address
                });

                return {
                    address: streetAddress,
                    city: city,
                    state: state,
                    zipCode: zipCode,
                    country: country,
                    barangay: barangay,
                    fullAddress: data.display_name || ''
                };
            }
        } catch (error) {
            console.log(`Proxy ${i} error:`, error.message);
        }
    }

    return null;
};

// Helper function for better address matching
const findBestMatch = (searchTerm, options) => {
    if (!searchTerm || !options || options.length === 0) return null;

    const searchLower = searchTerm.toLowerCase().trim();

    // Try exact match first
    let match = options.find(option =>
        option.name.toLowerCase() === searchLower
    );

    if (match) return match;

    // Try contains match
    match = options.find(option =>
        option.name.toLowerCase().includes(searchLower) ||
        searchLower.includes(option.name.toLowerCase())
    );

    if (match) return match;

    // Try partial match (first 3-5 characters)
    if (searchLower.length >= 3) {
        match = options.find(option =>
            option.name.toLowerCase().startsWith(searchLower.substring(0, 3))
        );
    }

    return match;
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

// Helper function to check if string contains only whitespace
const isWhitespaceOnly = (str) => {
    return !str || str.trim().length === 0;
};

const InsertProperty = ({ property, onSuccess, onCancel }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
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

    // Progress states
    const [progressVisible, setProgressVisible] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentAction, setCurrentAction] = useState('');

    // Enhanced Philippine location states
    const [provinces, setProvinces] = useState([]);
    const [cities, setCities] = useState([]);
    const [barangays, setBarangays] = useState([]);
    const [loadingProvinces, setLoadingProvinces] = useState(false);
    const [loadingCities, setLoadingCities] = useState(false);
    const [loadingBarangays, setLoadingBarangays] = useState(false);
    const [loadingZipCode, setLoadingZipCode] = useState(false);

    // Store PSGC codes
    const [selectedProvinceCode, setSelectedProvinceCode] = useState(null);
    const [selectedCityCode, setSelectedCityCode] = useState(null);
    const [selectedBarangayCode, setSelectedBarangayCode] = useState(null);

    // Current user state
    const [currentUser, setCurrentUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(false);

    // Agent ID state
    const [agentId, setAgentId] = useState(null);
    const [loadingAgent, setLoadingAgent] = useState(false);

    // Safe options with fallbacks
    const [propertyTypes, setPropertyTypes] = useState([]);
    const [statuses, setStatuses] = useState([]);

    // Flatten amenities for the select component
    const allAmenities = amenities && typeof amenities === 'object'
        ? Object.values(amenities).flat()
        : [];

    // Show success notification
    const showSuccessMessage = (action, propertyTitle) => {
        const messages = {
            create: 'Property created successfully!',
            update: 'Property updated successfully!'
        };

        notification.success({
            message: (
                <Space>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    <span>{messages[action]}</span>
                </Space>
            ),
            description: `"${propertyTitle}" has been ${action === 'create' ? 'created' : 'updated'} successfully.`,
            placement: 'topRight',
            duration: 4,
        });
    };

    // Show progress bar
    const startProgress = (actionName) => {
        setCurrentAction(actionName);
        setProgressVisible(true);
        setProgress(0);

        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 90) {
                    clearInterval(interval);
                    return prev;
                }
                return prev + 10;
            });
        }, 100);

        return interval;
    };

    // Complete progress
    const completeProgress = (interval) => {
        setProgress(100);
        setTimeout(() => {
            if (interval) clearInterval(interval);
            setProgressVisible(false);
            setProgress(0);
            setCurrentAction('');
        }, 500);
    };

    // Load current user
    const loadCurrentUser = async () => {
        setLoadingUser(true);
        try {
            const user = await authService.getCurrentUser();
            setCurrentUser(user);
            console.log('Current user loaded:', user);
        } catch (error) {
            console.error('Error loading current user:', error);
            message.error('Failed to load user information');
        } finally {
            setLoadingUser(false);
        }
    };

    const fetchCurrentUserAgentId = async () => {
        if (!currentUser || !currentUser.userId || agentId) {
            return; // Don't fetch if we already have the data
        }

        try {
            setLoadingAgent(true);
            console.log('Manually fetching agent for user:', currentUser.userId);

            const agent = await agentService.getAgentByBaseMemberId(currentUser.userId);

            if (agent && agent.id) {
                console.log('Found agent:', agent);
                setAgentId(agent.id);

                setCurrentUser(prev => ({
                    ...prev,
                    agentId: agent.id,
                    agentName: `${agent.firstName} ${agent.lastName}`
                }));
            } else {
                console.warn('No agent found for current user');
                message.warning('No agent profile found for current user');
            }
        } catch (error) {
            console.error('Error fetching agent ID:', error);
            message.error('Failed to load agent information');
        } finally {
            setLoadingAgent(false);
        }
    };

    // Load Philippine geographic data on component mount
    useEffect(() => {
        loadGeographicData();
        initializeOptions();
        loadCurrentUser();

        // Use setTimeout to ensure geographic data is loaded first
        if (property) {
            setTimeout(() => {
                initializeFormWithPropertyData();
            }, 1000);
        } else {
            setDefaultLocation();
        }
    }, [property, form]);

    // Fetch agent ID when current user is available
    useEffect(() => {
        let isMounted = true;

        const fetchAgentData = async () => {
            if (currentUser && currentUser.userId && !agentId && isMounted) {
                try {
                    setLoadingAgent(true);

                    console.log('Fetching agent for user:', currentUser.userId);
                    const agent = await agentService.getAgentByBaseMemberId(currentUser.userId);

                    if (isMounted && agent && agent.id) {
                        console.log('Found agent:', agent);
                        setAgentId(agent.id);

                        // Update current user with agent info
                        setCurrentUser(prev => ({
                            ...prev,
                            agentId: agent.id,
                            agentName: `${agent.firstName} ${agent.lastName}`
                        }));
                    } else if (isMounted) {
                        console.warn('No agent found for current user');
                    }
                } catch (error) {
                    console.error('Error fetching agent ID:', error);
                    if (isMounted) {
                        message.error('Failed to load agent information');
                    }
                } finally {
                    if (isMounted) {
                        setLoadingAgent(false);
                    }
                }
            }
        };

        fetchAgentData();

        return () => {
            isMounted = false;
        };
    }, [currentUser, agentId]); // Only run when currentUser or agentId changes

    const loadGeographicData = async () => {
        setLoadingProvinces(true);
        try {
            const provincesData = await phLocationService.getProvinces();
            setProvinces(provincesData);
        } catch (error) {
            console.error('Error loading geographic data:', error);
            message.error('Failed to load location data');
        } finally {
            setLoadingProvinces(false);
        }
    };

    const setDefaultLocation = () => {
        form.setFieldsValue({
            state: 'Metro Manila',
            city: 'Manila',
            zipCode: '1000',
            barangay: ''
        });
    };

    // Enhanced initializeFormWithPropertyData function
    const initializeFormWithPropertyData = async () => {
        try {
            console.log('Initializing form with property data:', property);

            // Parse amenities properly
            let amenitiesValue = [];
            if (property.amenities) {
                if (Array.isArray(property.amenities)) {
                    amenitiesValue = property.amenities;
                } else if (typeof property.amenities === 'string') {
                    try {
                        amenitiesValue = JSON.parse(property.amenities);
                    } catch (e) {
                        amenitiesValue = property.amenities.split(',').map(item => item.trim()).filter(item => item);
                    }
                }
            }

            const formData = {
                ...property,
                amenities: amenitiesValue,
                // Ensure numeric fields have proper values
                garage: property.garage || 0,
                kitchen: property.kitchen || 0,
                bedrooms: property.bedrooms || 0,
                bathrooms: property.bathrooms || 0,
                areaSqm: property.areaSqm || 0,
                propertyAge: property.propertyAge || 0,
                propertyFloor: property.propertyFloor || 1,
                barangay: property.barangay || ''
            };

            console.log('Setting form values:', formData);
            form.setFieldsValue(formData);

            // Handle location data initialization
            if (property.state) {
                console.log('Loading province data for:', property.state);
                await handleProvinceChange(property.state, true);

                // After cities are loaded, set the city
                if (property.city) {
                    setTimeout(async () => {
                        console.log('Loading city data for:', property.city);
                        await handleCityChange(property.city, true);

                        // After barangays are loaded, set the barangay
                        if (property.barangay) {
                            setTimeout(() => {
                                console.log('Setting barangay:', property.barangay);
                                handleBarangayChange(property.barangay, true);
                            }, 500);
                        }
                    }, 500);
                }
            }

            // Handle media
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

            if (property.propertyVideos && property.propertyVideos.length > 0) {
                const videosWithPreview = property.propertyVideos.map(vid => ({
                    uid: vid.id || `vid-${Date.now()}`,
                    name: vid.videoName || `video-${vid.id}.mp4`,
                    status: 'done',
                    url: vid.videoUrl
                }));
                setVideoList(videosWithPreview);
            }

            // Handle coordinates
            if (property.latitude && property.longitude) {
                const lat = parseFloat(property.latitude);
                const lng = parseFloat(property.longitude);
                setMapCenter([lat, lng]);
                setMarkerPosition([lat, lng]);
            }

        } catch (error) {
            console.error('Error initializing form with property data:', error);
            message.error('Failed to load property data');
        }
    };

    // Auto-geocoding when address fields are filled
    const handleAutoGeocode = async () => {
        const address = form.getFieldValue('address');
        const city = form.getFieldValue('city');
        const province = form.getFieldValue('state');

        if (city && province) {
            setGeocoding(true);
            message.loading('Getting coordinates for location...', 1);

            try {
                const coordinates = await phLocationService.geocodeAddress(
                    address || '',
                    city,
                    province,
                    'Philippines'
                );

                if (coordinates) {
                    form.setFieldsValue({
                        latitude: coordinates.lat,
                        longitude: coordinates.lng
                    });

                    setMapCenter([coordinates.lat, coordinates.lng]);
                    setMarkerPosition([coordinates.lat, coordinates.lng]);
                    setMapZoom(DEFAULT_ZOOM);

                    message.success('Location coordinates updated automatically');
                } else {
                    message.info('Could not find exact coordinates for this location');
                }
            } catch (error) {
                console.error('Error in auto-geocoding:', error);
                message.error('Failed to get coordinates for this location');
            } finally {
                setGeocoding(false);
            }
        } else {
            message.warning('Please select both province and city first');
        }
    };

    // Auto-geocode when address is manually entered
    const handleAddressChange = () => {
        const address = form.getFieldValue('address');
        const city = form.getFieldValue('city');
        const province = form.getFieldValue('state');

        if (address && city && province) {
            setTimeout(() => {
                handleAutoGeocode();
            }, 1000);
        }
    };

    // Enhanced province change handler
    const handleProvinceChange = async (provinceName, isInitialLoad = false) => {
        if (!provinceName) {
            setCities([]);
            setBarangays([]);
            setSelectedProvinceCode(null);
            form.setFieldsValue({
                city: undefined,
                barangay: undefined,
                zipCode: undefined
            });
            return;
        }

        setLoadingCities(true);
        try {
            const province = provinces.find(p => p.name === provinceName);
            if (province) {
                setSelectedProvinceCode(province.code);
                const citiesData = await phLocationService.getCitiesByProvince(province.code);
                setCities(citiesData);

                // If this is initial load from existing property, don't trigger auto-geocode
                if (!isInitialLoad) {
                    const currentAddress = form.getFieldValue('address');
                    if (currentAddress) {
                        setTimeout(() => {
                            handleAutoGeocode();
                        }, 500);
                    }
                }
            } else {
                setCities([]);
                setSelectedProvinceCode(null);
            }

            setBarangays([]);
            setSelectedCityCode(null);
            setSelectedBarangayCode(null);

            if (!isInitialLoad) {
                form.setFieldsValue({
                    city: undefined,
                    barangay: undefined,
                    zipCode: undefined
                });
            }
        } catch (error) {
            console.error('Error loading cities:', error);
            message.error('Failed to load cities');
            setCities([]);
            setSelectedProvinceCode(null);
        } finally {
            setLoadingCities(false);
        }
    };

    // City change handler with API-based zip code lookup
    const handleCityChange = async (cityName, isInitialLoad = false) => {
        if (!cityName) {
            setBarangays([]);
            setSelectedCityCode(null);
            setSelectedBarangayCode(null);
            form.setFieldsValue({
                barangay: undefined,
                zipCode: undefined
            });
            return;
        }

        // Find city and its code
        const city = cities.find(c => c.name === cityName);
        if (city) {
            setSelectedCityCode(city.code);

            // Load barangays
            setLoadingBarangays(true);
            try {
                const barangaysData = await phLocationService.getBarangaysByCity(city.code);
                setBarangays(barangaysData);
            } catch (error) {
                console.error('Error loading barangays:', error);
                setBarangays([]);
            } finally {
                setLoadingBarangays(false);
            }

            // Get zip code from PSGC API (only if not initial load)
            if (!isInitialLoad) {
                setLoadingZipCode(true);
                try {
                    const zipCode = await phLocationService.getZipCodeByCity(city.code);
                    if (zipCode) {
                        form.setFieldsValue({ zipCode });
                        message.success(`Zip code auto-filled: ${zipCode}`);
                    } else {
                        message.info('No specific zip code found for this city');
                    }
                } catch (error) {
                    console.error('Error fetching zip code:', error);
                    message.error('Failed to fetch zip code');
                } finally {
                    setLoadingZipCode(false);
                }
            }

            // Auto-geocode when city is selected (only if not initial load)
            if (!isInitialLoad) {
                const address = form.getFieldValue('address');
                const province = form.getFieldValue('state');
                if (address && province) {
                    await handleAutoGeocode();
                }
            }
        } else {
            setSelectedCityCode(null);
            setSelectedBarangayCode(null);
            setBarangays([]);
        }
    };

    // Enhanced barangay change handler with zip code lookup
    const handleBarangayChange = async (barangayName, isInitialLoad = false) => {
        if (!barangayName) {
            setSelectedBarangayCode(null);
            return;
        }

        // Find barangay and its code
        const barangay = barangays.find(b => b.name === barangayName);
        if (barangay) {
            setSelectedBarangayCode(barangay.code);

            // Try to get barangay-specific zip code from API (only if not initial load)
            if (!isInitialLoad) {
                setLoadingZipCode(true);
                try {
                    const barangayZipCode = await phLocationService.getZipCodeByBarangay(barangay.code);
                    if (barangayZipCode) {
                        form.setFieldsValue({ zipCode: barangayZipCode });
                        message.success(`Barangay-specific zip code: ${barangayZipCode}`);
                    } else {
                        // If no barangay-specific zip code, keep the city zip code
                        message.info('Using city zip code for this barangay');
                    }
                } catch (error) {
                    console.error('Error fetching barangay zip code:', error);
                    // Keep the existing city zip code
                } finally {
                    setLoadingZipCode(false);
                }
            }
        } else {
            setSelectedBarangayCode(null);
        }
    };

    // Enhanced reverse geocoding
    const enhancedReverseGeocode = async (lat, lng) => {
        setGeocoding(true);
        message.loading('Fetching Philippine address details...', 2);

        try {
            const addressData = await reverseGeocode(lat, lng);

            if (addressData) {
                // Set the basic address fields
                form.setFieldsValue({
                    address: addressData.address || '',
                    zipCode: addressData.zipCode || '',
                    barangay: addressData.barangay || ''
                });

                const provinceName = addressData.state;
                const cityName = addressData.city;

                console.log('Reverse geocode result:', { provinceName, cityName, addressData });

                // If we have province name, try to match it with our provinces
                if (provinceName && provinces.length > 0) {
                    const matchedProvince = findBestMatch(provinceName, provinces);

                    if (matchedProvince) {
                        form.setFieldsValue({ state: matchedProvince.name });
                        setSelectedProvinceCode(matchedProvince.code);

                        // Load cities for this province
                        const citiesData = await phLocationService.getCitiesByProvince(matchedProvince.code);
                        setCities(citiesData);

                        // If we have city name, try to match it
                        if (cityName && citiesData.length > 0) {
                            const matchedCity = findBestMatch(cityName, citiesData);

                            if (matchedCity) {
                                form.setFieldsValue({ city: matchedCity.name });
                                setSelectedCityCode(matchedCity.code);

                                // Load barangays for this city
                                const barangaysData = await phLocationService.getBarangaysByCity(matchedCity.code);
                                setBarangays(barangaysData);

                                // Get zip code for the matched city
                                const zipCode = await phLocationService.getZipCodeByCity(matchedCity.code);
                                if (zipCode) {
                                    form.setFieldsValue({ zipCode });
                                }
                            } else {
                                console.log('No city match found for:', cityName);
                            }
                        }
                    } else {
                        console.log('No province match found for:', provinceName);
                    }
                }

                message.success('Address details filled from map location');
            } else {
                message.warning('Could not fetch address details for this location');
            }
        } catch (error) {
            console.error('Error in enhanced reverse geocoding:', error);
            message.error('Failed to fetch address details');
        } finally {
            setGeocoding(false);
        }
    };

    // Enhanced coordinates change handler
    const handleCoordinatesChange = () => {
        const latitude = form.getFieldValue('latitude');
        const longitude = form.getFieldValue('longitude');

        if (latitude && longitude) {
            const lat = parseFloat(latitude);
            const lng = parseFloat(longitude);

            if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                setMapCenter([lat, lng]);
                setMarkerPosition([lat, lng]);
                setMapZoom(DEFAULT_ZOOM);
            }
        }
    };

    // Manual coordinate update with validation
    const handleManualCoordinateUpdate = () => {
        const latitude = form.getFieldValue('latitude');
        const longitude = form.getFieldValue('longitude');

        if (!latitude || !longitude) {
            message.warning('Please enter both latitude and longitude');
            return;
        }

        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);

        if (lat < -90 || lat > 90) {
            message.error('Latitude must be between -90 and 90');
            return;
        }

        if (lng < -180 || lng > 180) {
            message.error('Longitude must be between -180 and 180');
            return;
        }

        setMapCenter([lat, lng]);
        setMarkerPosition([lat, lng]);
        setMapZoom(DEFAULT_ZOOM);
        message.success('Map location updated from coordinates');
    };

    // Enhanced handleMapClick function
    const handleMapClick = async (latlng) => {
        setMarkerPosition([latlng.lat, latlng.lng]);
        setMapCenter([latlng.lat, latlng.lng]);
        setMapZoom(DEFAULT_ZOOM);

        form.setFieldsValue({
            latitude: latlng.lat,
            longitude: latlng.lng
        });

        // Enhanced: Immediately trigger reverse geocoding
        await enhancedReverseGeocode(latlng.lat, latlng.lng);
    };

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

    // Image upload handlers
    const handleImageUpload = ({ file, fileList }) => {
        if (file.status === 'uploading') {
            setUploading(true);
        } else if (file.status === 'done') {
            setUploading(false);
            message.success(`${file.name} uploaded successfully`);

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

    const handleVideoUpload = ({ file, fileList }) => {
        if (file.status === 'uploading') {
            setUploading(true);
        } else if (file.status === 'done') {
            setUploading(false);
            message.success(`${file.name} uploaded successfully`);

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

    const handlePreview = async (file) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }
        setPreviewImage(file.url || file.preview);
        setPreviewVisible(true);
        setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
    };

    const handleCancel = () => setPreviewVisible(false);

    const handleVideoPreview = (file) => {
        setPreviewVideo(file.url || URL.createObjectURL(file.originFileObj));
        setVideoPreviewVisible(true);
    };

    const handleVideoCancel = () => setVideoPreviewVisible(false);

    const getBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onError = error => reject(error);
        });
    };

    const uploadButton = (
        <div>
            <UploadOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
        </div>
    );

    const videoUploadButton = (
        <div>
            <UploadOutlined />
            <div style={{ marginTop: 8 }}>Upload Video</div>
        </div>
    );

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

    // Geocode from coordinates handler
    const handleGeocodeFromCoordinates = async () => {
        const latitude = form.getFieldValue('latitude');
        const longitude = form.getFieldValue('longitude');

        if (!latitude || !longitude) {
            message.warning('Please enter both latitude and longitude');
            return;
        }

        await enhancedReverseGeocode(latitude, longitude);
    };

    const clearError = () => {
        setError(null);
        setMissingFields([]);
    };

    // FIXED: Enhanced validateCurrentStep function with proper whitespace validation
    const validateCurrentStep = () => {
        const fieldNames = getStepFields(currentStep);
        const values = form.getFieldsValue(fieldNames);
        const currentMissing = [];

        fieldNames.forEach(field => {
            const value = values[field];

            if (field === 'title' && (!value || isWhitespaceOnly(value))) {
                currentMissing.push('Property Title');
            }
            if (field === 'type' && !value) {
                currentMissing.push('Property Type');
            }
            if (field === 'description' && (!value || isWhitespaceOnly(value))) {
                currentMissing.push('Description');
            }
            if (field === 'price' && (!value || value <= 0)) {
                currentMissing.push('Price');
            }
            if (field === 'address' && (!value || isWhitespaceOnly(value))) {
                currentMissing.push('Address');
            }
            if (field === 'city' && !value) {
                currentMissing.push('City');
            }
            if (field === 'state' && !value) {
                currentMissing.push('State/Province');
            }
            if (field === 'zipCode' && (!value || isWhitespaceOnly(value))) {
                currentMissing.push('Zip/Postal Code');
            }
        });

        setMissingFields(currentMissing);
        return currentMissing.length === 0;
    };

    // MODIFIED: Removed assignment step from step fields
    const getStepFields = (step) => {
        const stepFields = {
            0: ['title', 'type', 'description', 'price', 'status'],
            1: ['address', 'city', 'state', 'zipCode', 'latitude', 'longitude', 'barangay'],
            2: ['bedrooms', 'bathrooms', 'kitchen', 'garage', 'areaSqm', 'propertyAge', 'propertyFloor', 'amenities'],
            // REMOVED: Assignment step fields
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
        // Ensure we have the agentId before proceeding
        if (!agentId && currentUser?.userId) {
            try {
                await fetchCurrentUserAgentId();
                // If still no agentId after fetching, proceed without it
                if (!agentId) {
                    console.warn('Proceeding without agent ID - no agent profile found');
                }
            } catch (error) {
                console.error('Failed to fetch agent ID, proceeding without it:', error);
                // Continue without agent ID - don't block form submission
            }
        }

        const progressInterval = startProgress(property ? 'Updating property...' : 'Creating property...');
        setLoading(true);
        clearError();

        try {
            const allStepFields = [0, 1, 2].flatMap(step => getStepFields(step));
            const allValues = form.getFieldsValue(allStepFields);

            const missingFields = [];

            if (!allValues.title || isWhitespaceOnly(allValues.title)) missingFields.push('Property Title');
            if (!allValues.type) missingFields.push('Property Type');
            if (!allValues.description || isWhitespaceOnly(allValues.description)) missingFields.push('Description');
            if (!allValues.price || allValues.price <= 0) missingFields.push('Price');
            if (!allValues.address || isWhitespaceOnly(allValues.address)) missingFields.push('Address');
            if (!allValues.city) missingFields.push('City');
            if (!allValues.state) missingFields.push('State/Province');
            if (!allValues.zipCode || isWhitespaceOnly(allValues.zipCode)) missingFields.push('Zip/Postal Code');

            if (missingFields.length > 0) {
                setMissingFields(missingFields);
                message.warning('Please complete all required fields before submitting');
                setLoading(false);
                return;
            }

            if (allValues.price < 5000) {
                message.error('Price must be at least ₱5,000');
                setLoading(false);
                return;
            }

            const imageFiles = imageList
                .filter(file => file.originFileObj instanceof File)
                .map(file => file.originFileObj);

            const videoFiles = videoList
                .filter(file => file.originFileObj instanceof File)
                .map(file => file.originFileObj);

            let amenitiesValue = allValues.amenities;
            if (Array.isArray(amenitiesValue)) {
                amenitiesValue = amenitiesValue.join(', ');
            } else if (!amenitiesValue) {
                amenitiesValue = '';
            }

            // MODIFIED: Use the fetched agentId
            const propertyData = {
                title: allValues.title.trim(),
                type: allValues.type,
                description: allValues.description.trim(),
                price: parseFloat(allValues.price) || 0,
                status: allValues.status || 'available',
                listedDate: new Date().toISOString(),
                address: allValues.address.trim(),
                city: allValues.city,
                state: allValues.state,
                zipCode: allValues.zipCode.trim(),
                country: 'Philippines', // Hardcoded as Philippines
                latitude: allValues.latitude ? parseFloat(allValues.latitude) : null,
                longitude: allValues.longitude ? parseFloat(allValues.longitude) : null,
                barangay: allValues.barangay || '',
                bedrooms: parseInt(allValues.bedrooms) || 0,
                bathrooms: parseFloat(allValues.bathrooms) || 0,
                kitchen: parseInt(allValues.kitchen) || 0,
                garage: parseInt(allValues.garage) || 0,
                areaSqm: parseInt(allValues.areaSqm) || 0,
                propertyAge: parseInt(allValues.propertyAge) || 0,
                propertyFloor: parseInt(allValues.propertyFloor) || 1,
                amenities: amenitiesValue,
                // MODIFIED: Use the fetched agentId
                ownerId: null,
                agentId: agentId ? parseInt(agentId) : null,
                provinceCode: selectedProvinceCode,
                cityCode: selectedCityCode,
                barangayCode: selectedBarangayCode
            };

            console.log('Submitting property with agent ID:', {
                propertyData,
                currentUser,
                agentId
            });

            let result;
            if (property) {
                if (imageFiles.length > 0 || videoFiles.length > 0) {
                    result = await propertyService.updatePropertyWithMedia(property.id, propertyData, imageFiles, videoFiles);
                } else {
                    result = await propertyService.updateProperty(property.id, propertyData);
                }
            } else {
                if (imageFiles.length > 0 || videoFiles.length > 0) {
                    result = await propertyService.createPropertyWithMedia(propertyData, imageFiles, videoFiles);
                } else {
                    result = await propertyService.createProperty(propertyData);
                }
            }

            completeProgress(progressInterval);
            showSuccessMessage(property ? 'update' : 'create', propertyData.title);

            if (result && (result.property || result.id)) {
                const propertyResult = result.property || result;

                setSubmittedData({
                    title: propertyData.title,
                    type: propertyData.type,
                    price: propertyData.price,
                    address: `${propertyData.address}, ${propertyData.city}, ${propertyData.state}, ${propertyData.zipCode}, Philippines`,
                    status: propertyData.status,
                    referenceId: propertyResult.id || `PROP-${Date.now()}`,
                    // Add current user and agent info to display
                    assignedTo: currentUser?.agentName || `${currentUser?.firstName} ${currentUser?.lastName}` || 'You',
                    agentId: agentId
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
            completeProgress(progressInterval);
            const errorMessage = error.message || `Failed to ${property ? 'update' : 'create'} property`;

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
        setCities([]);
        setBarangays([]);
        setSelectedProvinceCode(null);
        setSelectedCityCode(null);
        setSelectedBarangayCode(null);

        setTimeout(() => {
            setDefaultLocation();
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

    // MODIFIED: Steps without Assignment step
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
                                rules={[
                                    { required: true, message: 'Please enter property title' },
                                    {
                                        validator: (_, value) => {
                                            if (!value || isWhitespaceOnly(value)) {
                                                return Promise.reject(new Error('Property title cannot be empty or whitespace'));
                                            }
                                            return Promise.resolve();
                                        }
                                    }
                                ]}
                            >
                                <Input
                                    placeholder="Enter property title"
                                    onBlur={(e) => {
                                        // Auto-trim on blur
                                        const trimmed = e.target.value.trim();
                                        if (trimmed !== e.target.value) {
                                            form.setFieldsValue({ title: trimmed });
                                        }
                                    }}
                                />
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
                        rules={[
                            { required: true, message: 'Please enter property description' },
                            {
                                validator: (_, value) => {
                                    if (!value || isWhitespaceOnly(value)) {
                                        return Promise.reject(new Error('Description cannot be empty or whitespace'));
                                    }
                                    if (value.trim().length < 10) {
                                        return Promise.reject(new Error('Description must be at least 10 characters'));
                                    }
                                    return Promise.resolve();
                                }
                            }
                        ]}
                    >
                        <TextArea
                            rows={4}
                            placeholder="Enter property description"
                            maxLength={1000}
                            showCount
                            onBlur={(e) => {
                                // Auto-trim on blur
                                const trimmed = e.target.value.trim();
                                if (trimmed !== e.target.value) {
                                    form.setFieldsValue({ description: trimmed });
                                }
                            }}
                        />
                    </Form.Item>
                    <Row gutter={[16, 0]}>
                        <Col span={12}>
                            <Form.Item
                                label="Price"
                                name="price"
                                rules={[
                                    { required: true, message: 'Please enter price' },
                                    {
                                        validator: (_, value) => {
                                            if (value && value < 5000) {
                                                return Promise.reject(new Error('Price must be at least ₱5,000'));
                                            }
                                            return Promise.resolve();
                                        }
                                    }
                                ]}
                            >
                                <InputNumber
                                    min={5000}
                                    style={{ width: '100%' }}
                                    placeholder="Enter price (min: ₱5,000)"
                                    formatter={value => `₱ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={value => value.replace(/\₱\s?|(,*)/g, '')}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
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
                    </Row>

                    {/* FIXED: Agent Information Display - Memoized to prevent re-renders */}
                    {React.useMemo(() => (
                        <Card
                            size="small"
                            style={{ marginTop: 16, background: '#f0f8ff', border: '1px solid #1890ff' }}
                        >
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <div>
                                    <UserOutlined style={{ color: '#1890ff', marginRight: 8 }} />
                                    <Text strong>Property will be automatically assigned to: </Text>
                                    <Text type="success">
                                        {currentUser?.firstName} {currentUser?.lastName}
                                    </Text>
                                    <Text type="secondary">({currentUser?.email})</Text>
                                </div>
                                {loadingAgent ? (
                                    <div>
                                        <Spin size="small" style={{ marginRight: 8 }} />
                                        <Text type="secondary">Loading agent information...</Text>
                                    </div>
                                ) : agentId ? (
                                    <div>
                                        <Text strong>Agent ID: </Text>
                                        <Text code>{agentId}</Text>
                                        <Text type="secondary" style={{ marginLeft: 8 }}>
                                            (Auto-assigned from your profile)
                                        </Text>
                                    </div>
                                ) : (
                                    <div>
                                        <Text type="warning">No agent profile found. Creating property as owner.</Text>
                                    </div>
                                )}
                            </Space>
                        </Card>
                    ), [currentUser, loadingAgent, agentId])}
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
                                rules={[
                                    { required: true, message: 'Please enter address' },
                                    {
                                        validator: (_, value) => {
                                            if (!value || isWhitespaceOnly(value)) {
                                                return Promise.reject(new Error('Address cannot be empty or whitespace'));
                                            }
                                            return Promise.resolve();
                                        }
                                    }
                                ]}
                            >
                                <Input
                                    placeholder="Enter address (e.g., 123 Main St)"
                                    onChange={handleAddressChange}
                                    onBlur={(e) => {
                                        // Auto-trim on blur
                                        const trimmed = e.target.value.trim();
                                        if (trimmed !== e.target.value) {
                                            form.setFieldsValue({ address: trimmed });
                                        }
                                    }}
                                    suffix={
                                        <Space>
                                            <Button
                                                type="text"
                                                icon={<SearchOutlined />}
                                                onClick={handleAutoGeocode}
                                                loading={geocoding}
                                                size="small"
                                                title="Get coordinates from address"
                                            >
                                                Locate
                                            </Button>
                                            <Button
                                                type="text"
                                                icon={<AimOutlined />}
                                                onClick={handleManualCoordinateUpdate}
                                                size="small"
                                                title="Update map from coordinates"
                                            >
                                                Update Map
                                            </Button>
                                        </Space>
                                    }
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={[16, 0]}>
                        <Col span={8}>
                            <Form.Item
                                label="Province"
                                name="state"
                                rules={[{ required: true, message: 'Please select province' }]}
                            >
                                <Select
                                    placeholder="Select province"
                                    onChange={handleProvinceChange}
                                    loading={loadingProvinces}
                                    showSearch
                                    filterOption={(input, option) =>
                                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                    }
                                >
                                    {provinces.map(province => (
                                        <Option key={province.code} value={province.name}>
                                            {province.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label="City/Municipality"
                                name="city"
                                rules={[{ required: true, message: 'Please select city/municipality' }]}
                            >
                                <Select
                                    placeholder="Select city"
                                    onChange={handleCityChange}
                                    loading={loadingCities}
                                    showSearch
                                    filterOption={(input, option) =>
                                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                    }
                                    disabled={!form.getFieldValue('state')}
                                >
                                    {cities.map(city => (
                                        <Option key={city.code} value={city.name}>
                                            {city.name} {city.type ? `(${city.type})` : ''}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label="Zip Code"
                                name="zipCode"
                                rules={[
                                    { required: true, message: 'Please enter zip code' },
                                    {
                                        validator: (_, value) => {
                                            if (!value || isWhitespaceOnly(value)) {
                                                return Promise.reject(new Error('Zip code cannot be empty or whitespace'));
                                            }
                                            return Promise.resolve();
                                        }
                                    }
                                ]}
                            >
                                <Input
                                    placeholder="Zip code"
                                    suffix={loadingZipCode ? <Spin size="small" /> : null}
                                    onBlur={(e) => {
                                        // Auto-trim on blur
                                        const trimmed = e.target.value.trim();
                                        if (trimmed !== e.target.value) {
                                            form.setFieldsValue({ zipCode: trimmed });
                                        }
                                    }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={[16, 0]}>
                        <Col span={12}>
                            <Form.Item label="Barangay" name="barangay">
                                <Select
                                    placeholder="Select barangay"
                                    onChange={handleBarangayChange}
                                    loading={loadingBarangays}
                                    showSearch
                                    filterOption={(input, option) =>
                                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                    }
                                    disabled={!form.getFieldValue('city')}
                                >
                                    {barangays.map(barangay => (
                                        <Option key={barangay.code} value={barangay.name}>
                                            {barangay.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Card
                        title={<Space><EnvironmentOutlined />Location Map - Click to Set Location</Space>}
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
                            Click on the map to set the property location and automatically fill Philippine address details using PSGC data
                        </p>
                    </Card>

                    <Row gutter={[16, 0]} style={{ marginTop: 16 }}>
                        <Col span={10}>
                            <Form.Item label="Latitude" name="latitude">
                                <InputNumber
                                    style={{ width: '100%' }}
                                    placeholder="Enter latitude"
                                    step={0.000001}
                                    min={-90}
                                    max={90}
                                    onChange={handleCoordinatesChange}
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
                                    onChange={handleCoordinatesChange}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={4}>
                            <Form.Item label=" ">
                                <Button
                                    onClick={handleGeocodeFromCoordinates}
                                    loading={geocoding}
                                    style={{ marginTop: '29px', width: '100%' }}
                                    icon={<SearchOutlined />}
                                >
                                    Get Address
                                </Button>
                            </Form.Item>
                        </Col>
                    </Row>

                    {(selectedProvinceCode || selectedCityCode || selectedBarangayCode) && (
                        <Card title="PSGC Information" size="small" style={{ marginTop: 16 }}>
                            <Descriptions size="small" column={2}>
                                {selectedProvinceCode && (
                                    <Descriptions.Item label="Province Code">
                                        <Text code>{selectedProvinceCode}</Text>
                                    </Descriptions.Item>
                                )}
                                {selectedCityCode && (
                                    <Descriptions.Item label="City/Municipality Code">
                                        <Text code>{selectedCityCode}</Text>
                                    </Descriptions.Item>
                                )}
                                {selectedBarangayCode && (
                                    <Descriptions.Item label="Barangay Code">
                                        <Text code>{selectedBarangayCode}</Text>
                                    </Descriptions.Item>
                                )}
                            </Descriptions>
                        </Card>
                    )}
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
        }
        // REMOVED: Assignment step
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
                        state: 'Metro Manila',
                        city: 'Manila',
                        zipCode: '1000',
                        type: 'House',
                        amenities: [],
                        barangay: ''
                    }}
                >
                    {progressVisible && (
                        <div style={{ marginBottom: 16 }}>
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: 8
                                }}>
                                    <span style={{ fontWeight: 500, color: '#1890ff' }}>
                                        {currentAction}
                                    </span>
                                    <span style={{ fontSize: '12px', color: '#666' }}>
                                        {progress}%
                                    </span>
                                </div>
                                <Progress
                                    percent={progress}
                                    status="active"
                                    strokeColor={{
                                        '0%': '#108ee9',
                                        '100%': '#87d068',
                                    }}
                                    showInfo={false}
                                />
                            </Space>
                        </div>
                    )}

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
                                {/* ADDED: Assigned To information */}
                                <Descriptions.Item label="Assigned To">
                                    <Text strong type="primary">
                                        <UserOutlined /> {submittedData?.assignedTo || 'You'}
                                    </Text>
                                </Descriptions.Item>
                                {submittedData?.agentId && (
                                    <Descriptions.Item label="Agent ID">
                                        <Text code>{submittedData.agentId}</Text>
                                    </Descriptions.Item>
                                )}
                                <Descriptions.Item label="Reference ID">
                                    <Text type="secondary">{submittedData?.referenceId}</Text>
                                </Descriptions.Item>
                                {selectedProvinceCode && (
                                    <Descriptions.Item label="PSGC Province Code">
                                        <Text code>{selectedProvinceCode}</Text>
                                    </Descriptions.Item>
                                )}
                                {selectedCityCode && (
                                    <Descriptions.Item label="PSGC City Code">
                                        <Text code>{selectedCityCode}</Text>
                                    </Descriptions.Item>
                                )}
                                {selectedBarangayCode && (
                                    <Descriptions.Item label="PSGC Barangay Code">
                                        <Text code>{selectedBarangayCode}</Text>
                                    </Descriptions.Item>
                                )}
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