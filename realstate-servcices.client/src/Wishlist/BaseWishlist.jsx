// BaseWishlist.jsx
import React from 'react';
import { Layout, ConfigProvider } from 'antd';
import WishlistPage from './WishlistPage';
import { GlobalNavigation, Footer } from '../Navigation/index';


console.log('GlobalNavigation component:', GlobalNavigation);  
console.log('Footer component:', Footer); 


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
            <Layout>
                <GlobalNavigation /> 
                <Content>
                    <WishlistPage />
                </Content>
                <Footer />  
            </Layout>
        </ConfigProvider>
    );
};
export default BaseWishlist;