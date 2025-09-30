// BaseChat.jsx
import { Layout, ConfigProvider } from 'antd';
import ChatPage from './ChatPage';
import { GlobalNavigation } from '../Navigation/index'; // Remove Footer import

const { Content } = Layout;

const theme = {
    token: {
        colorPrimary: '#1B3C53',
        borderRadius: 0, // Remove border radius globally
        colorBgContainer: '#ffffff',
        colorBgLayout: 'transparent',
    },
    components: {
        Layout: {
            bodyBg: 'transparent',
            headerBg: '#ffffff',
        },
    },
};

const BaseChat = () => {
    return (
        <ConfigProvider theme={theme}>
            <Layout style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <GlobalNavigation />
                <Content style={{
                    background: 'transparent',
                    padding: 0,
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    justifyContent: 'center', 
                    alignItems: 'center' 
                }}>
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        padding: '0',
                        margin: '0',
                        width: '100%',
                        maxWidth: '1400px', 
                        overflow: 'hidden',
                        justifyContent: 'center' 
                    }}>
                        <ChatPage />
                    </div>
                </Content>
          
            </Layout>
        </ConfigProvider>
    );
};

export default BaseChat;