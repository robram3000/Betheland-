// BaseProperty.jsx - Ensure proper provider order
import React from 'react';
import { Layout, ConfigProvider } from 'antd';
import PropertySearchPage from './PropertySearchPage';
import { GlobalNavigation, Footer } from '../Navigation/index';
import { PropertyDataProvider } from './Services/GetdataProperty';
import { WishlistDataProvider } from './Services/WishlistAdded';

const { Content } = Layout;

const theme = {
    token: {
        colorPrimary: '#1B3C53',
        borderRadius: 8,
        colorBgContainer: '#ffffff',
    },
};

const BaseProperty = () => {
    return (
        <ConfigProvider theme={theme}>
            <WishlistDataProvider>
                <PropertyDataProvider>
                    <Layout style={{
                        minHeight: '100vh',
                        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
                    }}>
                        <GlobalNavigation />
                        <Content style={{ background: 'transparent' }}>
                            <PropertySearchPage />
                        </Content>
                        <Footer />
                    </Layout>
                </PropertyDataProvider>
            </WishlistDataProvider>
        </ConfigProvider>
    );
};

export default BaseProperty;