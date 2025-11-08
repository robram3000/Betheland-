import React from 'react';
import { Layout } from 'antd';
import FirstSection from './FirstSection';
import SecondSection from './SecondSection';
import FeaturedProperties from './FeaturedProperties';
import ThirdSection from './ThirdSection';
import AgentsSection from './AgentsSection';
import PartnershipSection from './PartnershipSection'; // Add this import
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
          
              
                <AgentsSection />
                <PartnershipSection /> 
                <SecondSection />
  
                <ThirdSection />
     
            </Content>
            <Footer />
        </Layout>
    );
};

export default BaseLandingPage;