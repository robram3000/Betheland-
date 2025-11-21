// BaseChatAgent.jsx
import { Layout, ConfigProvider } from 'antd';
import ChatPageAgent from './Chatpage.jsx';
import  GlobalNavigation  from '../Navigation/GlobalAdminNavigation.jsx';
import { useLocation } from 'react-router-dom';

const { Content } = Layout;

const theme = {
    token: {
        colorPrimary: '#1B3C53',
        borderRadius: 0,
        colorBgContainer: '#ffffff',
        colorBgLayout: 'transparent',
    },
};

const BaseChatAgent = () => {
    const location = useLocation();
    const propertyChatData = location.state?.propertyChat;

    return (
        <ConfigProvider theme={theme}>
            <Layout style={{
                height: '100vh',
                overflow: 'hidden',
                margin: 0,
                padding: 0
            }}>
                <GlobalNavigation />
                <Content style={{
                    padding: 0,
                    margin: 0,
                    height: 'calc(100vh - 64px)',
                    overflow: 'hidden',
                    background: 'transparent'
                }}>
                    <ChatPageAgent propertyChatData={propertyChatData} />
                </Content>
            </Layout>
        </ConfigProvider>
    );
};

export default BaseChatAgent;