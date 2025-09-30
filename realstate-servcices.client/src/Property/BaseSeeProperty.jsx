// BaseSeeProperty.jsx (updated with consistent white backgrounds)
import React from 'react';
import { Layout, ConfigProvider } from 'antd';
import PropertyHeader from './PropertyHeader';
import PropertyGallery from './PropertyGallery';
import PropertyDetails from './PropertyDetails';
import PropertyAmenities from './PropertyAmenities';
import PropertyLocation from './PropertyLocation';
import { GlobalNavigation, Footer } from '../Navigation/index';

const { Content } = Layout;

const theme = {
    token: {
        colorPrimary: '#1B3C53',
        borderRadius: 8,
        colorBgContainer: '#ffffff',
    },
};

const BaseSeeProperty = () => {
    return (
        <ConfigProvider theme={theme}>
            <Layout style={{
                minHeight: '100vh',
                backgroundColor: '#ffffff'
            }}>
                <GlobalNavigation />
                <Content style={{ background: '#ffffff' }}>
                    <PropertyHeader />
                    <PropertyGallery />
                    <PropertyDetails />
                    <PropertyAmenities />
                    <PropertyLocation />
                </Content>
                <Footer />
            </Layout>
        </ConfigProvider>
    );
};

export default BaseSeeProperty;