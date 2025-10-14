// BaseSeeProperty.jsx (updated to pass agent data)
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
import { agentService } from './Services/GetAgent';

const { Content } = Layout;

const theme = {
    token: {
        colorPrimary: '#001529',
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
    const [agent, setAgent] = useState(null);
    const [loadingAgent, setLoadingAgent] = useState(false);

    // Fetch agent information when property is loaded
    const fetchAgent = async (propertyData) => {
        if (!propertyData?.agentId) {
            setAgent(null);
            return;
        }

        try {
            setLoadingAgent(true);
            const agentData = await agentService.getAgentById(propertyData.agentId);
            setAgent(agentData);
        } catch (error) {
            console.error('Error fetching agent:', error);
            setAgent(null);
        } finally {
            setLoadingAgent(false);
        }
    };

    useEffect(() => {
        const loadProperty = async () => {
            try {
                // Check if property data is passed via navigation state
                if (location.state?.property) {
                    const propertyData = location.state.property;
                    setProperty(propertyData);
                    await fetchAgent(propertyData);
                } else if (location.state?.propertyId) {
                    // Load property by ID if only ID is provided
                    const propertyData = await getPropertyById(location.state.propertyId);
                    await fetchAgent(propertyData);
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
            fetchAgent(selectedProperty);
        }
    }, [selectedProperty]);

    if (loading || loadingAgent) {
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
                    <PropertyHeader property={property} agent={agent} />
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