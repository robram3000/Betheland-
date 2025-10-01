// Updated BaseProfile.jsx
import React from 'react';
import { Layout, ConfigProvider } from 'antd';
import ProfilePage from './Profile';
import { GlobalNavigation, Footer } from '../Navigation/index';
import { UserProvider } from '../Authpage/Services/UserContextService';

const { Content } = Layout;

const theme = {
    token: {
        colorPrimary: '#1B3C53',
        borderRadius: 8,
        colorBgContainer: '#ffffff',
    },
};

const BaseProfile = () => {
    return (
        <ConfigProvider theme={theme}>
            <UserProvider>
                <Layout style={{
                    minHeight: '100vh',
                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
                }}>
                    <GlobalNavigation />
                    <Content style={{ background: 'transparent' }}>
                        <ProfilePage />
                    </Content>
                    <Footer />
                </Layout>
            </UserProvider>
        </ConfigProvider>
    );
};

export default BaseProfile;