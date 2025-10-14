
import React from 'react';
import { Layout } from 'antd';
import FirstSection from './FirstSection';
import SecondSection from './SecondSection';
import FeaturedProperties from './FeaturedProperties'; // Add this import
import ThirdSection from './ThirdSection';
import AgentsSection from './AgentsSection';
import RunningLetter from './RunningLetter';
import { GlobalNavigation, Footer } from '../Navigation/index';

const { Content } = Layout;

const BaseLandingPage = () => {
    return (
        <Layout style={{ minHeight: '100vh' }}>
            <GlobalNavigation />
            <RunningLetter />
            <Content style={{ background: '#f8f9fa' }}>
                <FirstSection />
                <SecondSection />
                <FeaturedProperties /> 
                <ThirdSection />
                <AgentsSection />
            </Content>
            <Footer />
        </Layout>
    );
};

export default BaseLandingPage;