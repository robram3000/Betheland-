// BaseSeeProperty.jsx (updated with landing page colors)
import React, { useEffect, useState } from 'react';
import { Layout, ConfigProvider, Spin, message, Button } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import PropertyHeader from './PropertyHeader';
import PropertyGallery from './PropertyGallery';
import PropertyDetails from './PropertyDetails';
import PropertyAmenities from './PropertyAmenities';
import PropertyLocation from './PropertyLocation';
import { GlobalNavigation, Footer } from '../Navigation/index';
import { usePropertyData, PropertyDataProvider } from './Services/GetdataProperty';

const { Content } = Layout;

const theme = {
    token: {
        colorPrimary: '#001529', // Updated to match landing page dark blue
        borderRadius: 8,
        colorBgContainer: '#ffffff',
    },
};

// Create the main component that uses the hook
const BaseSeePropertyContent = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { selectedProperty, getPropertyById, loading, clearSelectedProperty } = usePropertyData();
    const [property, setProperty] = useState(null);

    useEffect(() => {
        const loadProperty = async () => {
            try {
                // Check if property data is passed via navigation state
                if (location.state?.property) {
                    setProperty(location.state.property);
                } else if (location.state?.propertyId) {
                    // Load property by ID if only ID is provided
                    await getPropertyById(location.state.propertyId);
                } else {
                    message.error('No property data available');
                    navigate('/properties');
                }
            } catch (error) {
                message.error('Failed to load property details');
                navigate('/properties');
            }
        };

        loadProperty();

        // Cleanup when component unmounts
        return () => {
            clearSelectedProperty();
        };
    }, [location, getPropertyById, navigate, clearSelectedProperty]);

    // Use selected property from context if available
    useEffect(() => {
        if (selectedProperty) {
            setProperty(selectedProperty);
        }
    }, [selectedProperty]);

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
                        <Spin size="large" />
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
                <Content style={{ background: '#ffffff' }}>
                    <PropertyHeader property={property} />
                    <PropertyGallery property={property} />
                    <PropertyDetails property={property} />
                    <PropertyAmenities property={property} />
                    <PropertyLocation property={property} />
                </Content>
                <Footer />
            </Layout>
        </ConfigProvider>
    );
};

// Wrap the component with the provider
const BaseSeeProperty = () => {
    return (
        <PropertyDataProvider>
            <BaseSeePropertyContent />
        </PropertyDataProvider>
    );
};

export default BaseSeeProperty;