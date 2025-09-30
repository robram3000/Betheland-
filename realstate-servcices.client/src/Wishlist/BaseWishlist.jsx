// BaseWishlist.jsx
import React from 'react';
import { Layout, ConfigProvider } from 'antd';
import WishlistPage from './WishlistPage';
import { GlobalNavigation, Footer } from '../Navigation/index';

const { Content } = Layout;

const theme = {
    token: {
        colorPrimary: '#1B3C53',
        borderRadius: 8,
        colorBgContainer: '#ffffff',
    },
};

const BaseWishlist = () => {
    return (
        <ConfigProvider theme={theme}>
            <Layout style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
            }}>
                <GlobalNavigation />
                <Content style={{ background: 'transparent' }}>
                    <WishlistPage />
                </Content>
                <Footer />
            </Layout>
        </ConfigProvider>
    );
};

export default BaseWishlist;