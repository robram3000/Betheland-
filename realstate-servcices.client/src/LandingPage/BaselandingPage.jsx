import React from 'react';
import { Layout } from 'antd';
import FirstSection from './FirstSection';
import SecondSection from './SecondSection';
import ThirdSection from './ThirdSection';
import { GlobalNavigation , Footer} from '../Navigation/index';

const { Content } = Layout;

const BaseLandingPage = () => {
    return (
        <Layout style={{ minHeight: '100vh' }}>
            <GlobalNavigation />
            <Content style={{ background: 'white' }}>
                <FirstSection />
                <SecondSection />
                <ThirdSection />
            </Content>
            <Footer />
        </Layout>
    );
};

export default BaseLandingPage;