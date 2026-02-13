// BaseChatAgent.jsx
import { Layout, ConfigProvider, Grid } from 'antd';
import ChatPageAgent from './Chatagent.jsx';
import GlobalAdminTopbar from '../Navigation/GlobalAdminTopbar';
import { useLocation } from 'react-router-dom';

const { Content } = Layout;
const { useBreakpoint } = Grid;

const BaseChatAgent = () => {
    const location = useLocation();
    const propertyChatData = location.state?.propertyChat;
    const screens = useBreakpoint();
    const isMobile = !screens.md;

    // Calculate dynamic heights based on mobile/desktop
    const topbarHeight = isMobile ? 64 : 112; // Mobile: 64px, Desktop: 64px + 48px
    const contentPadding = isMobile ? '0' : '0';

    return (
        <ConfigProvider
            theme={{
                token: {
                    borderRadius: 8,
                    colorPrimary: '#1a365d',
                    colorInfo: '#1a365d',
                    colorSuccess: '#1a365d',
                },
            }}
        >
            <Layout style={{
                minHeight: '100vh',
                overflow: 'hidden'
            }}>
                <GlobalAdminTopbar />
                <Layout style={{
                    marginTop: topbarHeight,
                    marginLeft: 0,
                    height: `calc(100vh - ${topbarHeight}px)`,
                    overflow: 'hidden'
                }}>
                    <Content
                        style={{
                            background: 'transparent',
                            minHeight: '100%',
                            overflow: 'hidden',
                            padding: contentPadding
                        }}
                    >
                        <ChatPageAgent propertyChatData={propertyChatData} />
                    </Content>
                </Layout>
            </Layout>
        </ConfigProvider>
    );
};

export default BaseChatAgent;