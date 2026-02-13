import React, { useEffect, useState } from 'react';
import { Layout, ConfigProvider, Spin, message, Button } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { GlobalNavigation, Footer } from '../Navigation/index';
import propertyService from '../Employeesportal/AdminPortal/Creation_Property/services/propertyService';
import agentService from '../Employeesportal/AdminPortal/Creation_Agent/Services/AgentService';
import PropertyImageInfo from './PropertyImageInfo';
import PropertyLocation from './PropertyLocation';

const { Content } = Layout;

const theme = {
    token: {
        colorPrimary: '#001529',
        borderRadius: 8,
        colorBgContainer: '#ffffff',
    },
};

// Enhanced image URL processing function
const processImageUrl = (url) => {
    if (!url || typeof url !== 'string' || url.trim() === '') {
        return '/default-partner-logo.png';
    }

    // Already full URL (http, https, blob, data, etc.)
    if (url.startsWith('http') || url.startsWith('//') || url.startsWith('blob:') || url.startsWith('data:')) {
        return url;
    }

    // Server path - prepend appropriate base URL
    if (url.startsWith('/uploads/')) {
        const baseUrl = window.location.hostname === 'localhost'
            ? 'https://localhost:7080'
            : 'https://betheland.runasp.net'; // Use HTTPS for production
        return `${baseUrl}${url}`;
    }

    // Relative path without leading slash
    if (url.includes('.') && !url.startsWith('/')) {
        const baseUrl = window.location.hostname === 'localhost'
            ? 'https://localhost:7080'
            : 'https://betheland.runasp.net'; // Use HTTPS for production
        return `${baseUrl}/uploads/partners/${url}`;
    }

    // uploads/ path
    if (url.startsWith('uploads/')) {
        const baseUrl = window.location.hostname === 'localhost'
            ? 'https://localhost:7080'
            : 'https://betheland.runasp.net';
        return `${baseUrl}/${url}`;
    }

    return '/default-partner-logo.png';
};

const BaseSeePropertySimple = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [property, setProperty] = useState(null);
    const [agent, setAgent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentView, setCurrentView] = useState('property'); // 'property' | 'schedule' | 'success' | 'waiting-confirmation'

    // Process agent image URL using the centralized utility
    const processAgentImageUrl = (url) => {
        return processImageUrl(url);
    };

    // Handler for schedule view changes
    const handleScheduleViewChange = (view) => {
        setCurrentView(view);
    };

    const processPropertyData = (property) => {
        if (!property) return null;

        try {
            // Parse amenities if it's a string
            let amenities = [];
            if (property.amenities) {
                if (typeof property.amenities === 'string') {
                    try {
                        amenities = JSON.parse(property.amenities);
                    } catch (e) {
                        console.warn('Failed to parse amenities:', property.amenities);
                        amenities = [];
                    }
                } else if (Array.isArray(property.amenities)) {
                    amenities = property.amenities;
                }
            }

            // Process images using centralized utility
            let propertyImages = [];
            let mainImage = '';

            if (property.propertyImages && Array.isArray(property.propertyImages)) {
                propertyImages = property.propertyImages.map(img => ({
                    ...img,
                    imageUrl: processImageUrl(img.imageUrl)
                }));
                mainImage = propertyImages[0]?.imageUrl || '';
            } else if (property.imageUrls && Array.isArray(property.imageUrls)) {
                propertyImages = property.imageUrls.map(url => ({
                    imageUrl: processImageUrl(url)
                }));
                mainImage = processImageUrl(property.imageUrls[0]) || '';
            }

            // Process main image separately
            if (property.mainImage) {
                mainImage = processImageUrl(property.mainImage);
            }

            // Calculate area in square feet if not provided
            const areaSqft = property.areaSqft || property.squareFeet || (property.areaSqm ? Math.round(property.areaSqm * 10.7639) : 0);

            return {
                id: property.id || property.propertyId || 0,
                propertyNo: property.propertyNo || '',
                title: property.title || property.propertyName || 'Untitled Property',
                description: property.description || '',
                type: property.type || property.propertyType || 'residential',
                price: parseFloat(property.price) || 0,
                status: property.status || 'available',
                propertyAge: parseInt(property.propertyAge) || 0,
                propertyFloor: parseInt(property.propertyFloor) || 1,
                bedrooms: parseInt(property.bedrooms) || 0,
                bathrooms: parseFloat(property.bathrooms) || 0,
                areaSqm: parseInt(property.areaSqm) || 0,
                areaSqft: areaSqft,
                garage: parseInt(property.garage) || 0,
                kitchen: parseInt(property.kitchen) || 0,
                address: property.address || '',
                city: property.city || '',
                state: property.state || property.province || '',
                zipCode: property.zipCode || property.postalCode || '',
                country: property.country || '',
                location: property.location || [property.city, property.state, property.country].filter(Boolean).join(', '),
                latitude: parseFloat(property.latitude) || 0,
                longitude: parseFloat(property.longitude) || 0,
                ownerId: property.ownerId || null,
                agentId: property.agentId || null,
                agent: property.agent || null,
                amenities: amenities,
                listedDate: property.listedDate,
                createdAt: property.createdAt,
                updatedAt: property.updatedAt,
                propertyImages: propertyImages,
                propertyVideos: property.propertyVideos || [],
                imageUrls: property.imageUrls || propertyImages.map(img => img.imageUrl),
                videoUrls: property.videoUrls || [],
                mainImage: mainImage,
                mainVideo: property.mainVideo || '',
                propertyType: property.propertyType || property.type || 'residential',
                squareFeet: areaSqft,
                pricePerSqft: property.pricePerSqft || (property.price && areaSqft ? property.price / areaSqft : 0)
            };
        } catch (error) {
            console.error('Error processing property data:', error, property);
            return null;
        }
    };

    // Enhanced agent fetching function
    const fetchAgentData = async (agentId) => {
        try {
            console.log('🔍 Fetching agent data for ID:', agentId);

            // Try to get agent from service
            let agentData;
            try {
                agentData = await agentService.getAgentById(agentId);
            } catch (serviceError) {
                console.warn('Agent service failed, trying alternative method:', serviceError);
                // Try alternative method if available
                if (agentService.getAgentWithFallback) {
                    agentData = await agentService.getAgentWithFallback(agentId);
                } else {
                    throw new Error('No agent data available');
                }
            }

            // If no agent data found, create fallback
            if (!agentData) {
                console.warn('No agent data returned, creating fallback agent');
                return createFallbackAgent(agentId);
            }

            // Ensure agent data has proper structure
            const processedAgent = {
                id: agentData.id || agentId,
                firstName: agentData.firstName || agentData.firstname || 'Unknown',
                lastName: agentData.lastName || agentData.lastname || 'Agent',
                email: agentData.email || '',
                profilePictureUrl: processAgentImageUrl(agentData.profilePictureUrl || agentData.imageUrl || agentData.profileImage || ''),
                cellPhoneNo: agentData.cellPhoneNo || agentData.phone || agentData.mobile || '',
                licenseNumber: agentData.licenseNumber || agentData.license || '',
                isVerified: agentData.isVerified || false,
                brokerageName: agentData.brokerageName || agentData.company || 'Real Estate Company',
                title: agentData.title || agentData.position || 'Real Estate Agent'
            };

            console.log('✅ Processed agent data:', processedAgent);
            return processedAgent;

        } catch (error) {
            console.error('❌ Error fetching agent data:', error);
            return createFallbackAgent(agentId);
        }
    };

    // Create fallback agent
    const createFallbackAgent = (agentId) => {
        return {
            id: agentId,
            firstName: 'Unknown',
            lastName: 'Agent',
            email: '',
            profilePictureUrl: '',
            cellPhoneNo: '',
            licenseNumber: '',
            isVerified: false,
            brokerageName: 'Real Estate Company',
            title: 'Real Estate Agent'
        };
    };

    useEffect(() => {
        const loadProperty = async () => {
            try {
                setLoading(true);
                console.log('DEBUG - Location state:', location.state);

                if (location.state?.propertyId) {
                    console.log('DEBUG - Loading property by ID:', location.state.propertyId);

                    // Fetch property directly from service
                    const propertyData = await propertyService.getProperty(location.state.propertyId);
                    const processedProperty = processPropertyData(propertyData);

                    if (!processedProperty) {
                        throw new Error('Failed to process property data');
                    }

                    setProperty(processedProperty);

                    // Enhanced agent fetching logic
                    let agentData = null;

                    // Check if agent data is already in property
                    if (processedProperty.agentid && processedProperty.agent.id) {
                        console.log('DEBUG - Using agent data from property object');
                        agentData = {
                            id: processedProperty.agent.id,
                            firstName: processedProperty.agent.firstName || processedProperty.agent.firstname || 'Unknown',
                            lastName: processedProperty.agent.lastName || processedProperty.agent.lastname || 'Agent',
                            email: processedProperty.agent.email || '',
                            profilePictureUrl: processAgentImageUrl(processedProperty.agent.profilePictureUrl || processedProperty.agent.imageUrl || ''),
                            cellPhoneNo: processedProperty.agent.cellPhoneNo || processedProperty.agent.phone || '',
                            licenseNumber: processedProperty.agent.licenseNumber || '',
                            isVerified: processedProperty.agent.isVerified || false,
                            brokerageName: processedProperty.agent.brokerageName || processedProperty.agent.company || 'Real Estate Company',
                            title: processedProperty.agent.title || 'Real Estate Agent'
                        };
                    }
                    // Fetch agent by ID if available
                    else if (processedProperty.agentId) {
                        console.log('DEBUG - Fetching agent by ID:', processedProperty.agentId);
                        agentData = await fetchAgentData(processedProperty.agentId);
                    }
                    // Check if agent data exists in raw property data
                    else if (propertyData.agent && typeof propertyData.agent === 'object') {
                        console.log('DEBUG - Using agent data from raw property data');
                        agentData = {
                            id: propertyData.agent.id || propertyData.agentId,
                            firstName: propertyData.agent.firstName || propertyData.agent.firstname || 'Unknown',
                            lastName: propertyData.agent.lastName || propertyData.agent.lastname || 'Agent',
                            email: propertyData.agent.email || '',
                            profilePictureUrl: processAgentImageUrl(propertyData.agent.profilePictureUrl || propertyData.agent.imageUrl || ''),
                            cellPhoneNo: propertyData.agent.cellPhoneNo || propertyData.agent.phone || '',
                            licenseNumber: propertyData.agent.licenseNumber || '',
                            isVerified: propertyData.agent.isVerified || false,
                            brokerageName: propertyData.agent.brokerageName || propertyData.agent.company || 'Real Estate Company',
                            title: propertyData.agent.title || 'Real Estate Agent'
                        };
                    } else {
                        console.log('DEBUG - No agent data available for this property');
                        agentData = null;
                    }

                    console.log('DEBUG - Final agent data to set:', agentData);
                    setAgent(agentData);

                } else {
                    message.error('No property data available');
                    navigate('/properties');
                }
            } catch (error) {
                console.error('Error loading property:', error);
                message.error('Failed to load property details');
                navigate('/properties');
            } finally {
                setLoading(false);
            }
        };

        loadProperty();
    }, [location, navigate]);

    // Debug logs
    console.log('DEBUG - Final property data:', property);
    console.log('DEBUG - Final agent data:', agent);
    console.log('DEBUG - Agent ID in property:', property?.agentId);

    if (loading) {
        return (
            <ConfigProvider theme={theme}>
                <Layout style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
                    <GlobalNavigation />
                    <Content style={{
                        background: '#ffffff',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <Spin size="large" tip="Loading property details..." />
                    </Content>
                </Layout>
            </ConfigProvider>
        );
    }

    if (!property) {
        return (
            <ConfigProvider theme={theme}>
                <Layout style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
                    <GlobalNavigation />
                    <Content style={{
                        background: '#ffffff',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'column'
                    }}>
                        <h2 style={{ color: '#001529' }}>Property not found</h2>
                        <Button
                            onClick={() => navigate('/properties')}
                            style={{
                                background: 'linear-gradient(135deg, #001529 0%, #003366 100%)',
                                border: 'none',
                                color: 'white'
                            }}
                        >
                            Back to Properties
                        </Button>
                    </Content>
                </Layout>
            </ConfigProvider>
        );
    }

    return (
        <ConfigProvider theme={theme}>
            <Layout style={{
                minHeight: '100vh',
                backgroundColor: '#ffffff'
            }}>
                <GlobalNavigation />
                <Content style={{
                    background: '#ffffff',
                    padding: '24px',
                    maxWidth: '1200px',
                    margin: '0 auto',
                    width: '100%'
                }}>
                    {/* Only show PropertyImageInfo when in property view */}
                    {currentView === 'property' && (
                        <div style={{ marginBottom: '40px' }}> {/* ADDED SPACING HERE */}
                            <PropertyImageInfo
                                property={property}
                                agent={agent}
                                onScheduleViewChange={handleScheduleViewChange}
                            />
                        </div>
                    )}
                    <PropertyLocation
                        property={property}
                        agent={agent}
                        onScheduleViewChange={handleScheduleViewChange}
                    />
                </Content>
                <Footer />
            </Layout>
        </ConfigProvider>
    );
};

export default BaseSeePropertySimple;