// BaseRatings.jsx
import React from 'react';
import { Layout, ConfigProvider, Button } from 'antd';
import RatingPage from './RatingPage';

const { Content } = Layout;

const theme = {
    token: {
        colorPrimary: '#1B3C53',
        borderRadius: 8,
        colorBgContainer: '#ffffff',
    },
};

const BaseRating = ({ appointment, onClose, user }) => {
    return (
        <ConfigProvider theme={theme}>
            <Layout style={{
                minHeight: 'auto',
                background: 'transparent'
            }}>
                <Content style={{ background: 'transparent' }}>
                    <RatingPage
                        appointment={appointment}
                        onClose={onClose}
                        user={user}
                    />
                    <div style={{ textAlign: 'center', marginTop: 16 }}>
                        {/* Optional: Add a close button here if needed */}
                    </div>
                </Content>
            </Layout>
        </ConfigProvider>
    );
};

export default BaseRating;