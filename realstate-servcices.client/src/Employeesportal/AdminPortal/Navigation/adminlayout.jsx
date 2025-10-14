import React, { useState, useEffect } from 'react';
import { Layout, theme, ConfigProvider, Drawer } from 'antd';
import GlobalAdminNavigation from './GlobalAdminNavigation';
import GlobalAdminTopbar from './GlobalAdminTopbar';

const { Content } = Layout;

const AdminLayout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileView, setMobileView] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    // Check screen size on mount and resize
    useEffect(() => {
        const checkScreenSize = () => {
            const isMobile = window.innerWidth < 768;
            setMobileView(isMobile);
            if (isMobile) {
                setCollapsed(true);
            }
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);

        return () => {
            window.removeEventListener('resize', checkScreenSize);
        };
    }, []);

    const handleToggle = () => {
        if (mobileView) {
            setDrawerVisible(!drawerVisible);
        } else {
            setCollapsed(!collapsed);
        }
    };

    const handleDrawerClose = () => {
        setDrawerVisible(false);
    };

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
            <Layout style={{ minHeight: '100vh' }}>
                <GlobalAdminTopbar
                    onToggle={handleToggle}
                    collapsed={collapsed}
                    mobileView={mobileView}
                />

                <Layout>
                    {/* Desktop Navigation */}
                    {!mobileView && (
                        <GlobalAdminNavigation
                            collapsed={collapsed}
                            onMenuClick={handleDrawerClose}
                        />
                    )}

                    {/* Mobile Navigation Drawer */}
                    {mobileView && (
                        <Drawer
                            title="Navigation"
                            placement="left"
                            onClose={handleDrawerClose}
                            open={drawerVisible}
                            bodyStyle={{
                                padding: 0,
                                backgroundColor: '#fff'
                            }}
                            width={280}
                            style={{
                                zIndex: 1001,
                            }}
                        >
                            <GlobalAdminNavigation
                                collapsed={false}
                                onMenuClick={handleDrawerClose}
                            />
                        </Drawer>
                    )}

                    <Layout
                        style={{
                            marginLeft: mobileView ? 0 : (collapsed ? 80 : 280),
                            marginTop: 64,
                            transition: 'all 0.2s',
                            background: '#f5f5f5',
                            padding: mobileView ? '0 12px' : '0 24px',
                        }}
                    >
                        <Content
                            style={{
                                background: colorBgContainer,
                                margin: mobileView ? '16px 0' : '24px 0',
                                minHeight: 280,
                                borderRadius: borderRadiusLG,
                                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                                border: '1px solid #f0f0f0',
                                maxWidth: '100%',
                                overflow: 'hidden',
                                padding: mobileView ? '16px' : '24px',
                            }}
                        >
                            {children}
                        </Content>
                    </Layout>
                </Layout>
            </Layout>
        </ConfigProvider>
    );
};

export default AdminLayout;