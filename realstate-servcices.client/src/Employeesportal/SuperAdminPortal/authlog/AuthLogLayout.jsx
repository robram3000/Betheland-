// CLI-Themed AuthLogLayout.jsx with vertical tabs and terminal-style interface
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Layout, theme, ConfigProvider, Tabs, Badge, Button, Space, Typography, Card } from 'antd';
import {
    SecurityScanOutlined,
    LoginOutlined,
    UserAddOutlined,
    HistoryOutlined,
    DashboardOutlined,
    ArrowLeftOutlined,
    TerminalOutlined,
    LockOutlined,
    AuditOutlined
} from '@ant-design/icons';
import GlobalAdminNavigation from '../Navigation/GlobalAdminNavigation';
import GlobalAdminTopbar from '../Navigation/GlobalAdminTopbar';
import AuthPage from './AuthPage';
import LoginHistory from './LoginHistory';
import SecurityDashboard from './SecurityDashboard';
import UserManagement from './UserManagement';
import authService from './services/authService';

const { Content, Sider } = Layout;
const { TabPane } = Tabs;
const { Title, Text } = Typography;

const AuthLogLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState('auth');
    const [failedAttempts, setFailedAttempts] = useState(0);
    const [activeSessions, setActiveSessions] = useState(0);
    const [securityAlerts, setSecurityAlerts] = useState(0);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedUser, setSelectedUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const handleToggle = () => {
        setCollapsed(!collapsed);
    };

    const handleTabChange = (key) => {
        setActiveTab(key);
        setIsEditing(false);
        setSelectedUser(null);
    };

    const handleEditUser = (user) => {
        setSelectedUser(user);
        setIsEditing(true);
        setActiveTab('management');
    };

    const handleCreateUser = () => {
        setSelectedUser(null);
        setIsEditing(false);
        setActiveTab('management');
    };

    const handleBackToAuth = () => {
        setActiveTab('auth');
        setIsEditing(false);
        setSelectedUser(null);
    };

    const loadSecurityStats = async () => {
        try {
            const [attempts, sessions, alerts] = await Promise.all([
                authService.getFailedAttempts(),
                authService.getActiveSessions(),
                authService.getSecurityAlerts()
            ]);
            setFailedAttempts(attempts);
            setActiveSessions(sessions);
            setSecurityAlerts(alerts);
        } catch (error) {
            console.error('Error loading security stats:', error);
        }
    };

    useEffect(() => {
        loadSecurityStats();
    }, []);

    // Centralized SEO data management
    const getSeoData = () => {
        const baseTitle = "Betheland Security Console";
        const baseDescription = "Advanced authentication and security management platform";
        const baseUrl = window.location.origin;

        const tabConfig = {
            auth: {
                title: searchText
                    ? `Search: "${searchText}" - Authentication Logs | ${baseTitle}`
                    : statusFilter !== 'all'
                        ? `${getStatusDisplayName(statusFilter)} Auth Events | ${baseTitle}`
                        : `Authentication Console | ${baseTitle}`,
                description: searchText
                    ? `Search results for "${searchText}" in Betheland security authentication system. Monitor login attempts and security events.`
                    : 'Monitor and manage authentication events, login attempts, and security logs in Betheland security console.',
                keywords: "authentication, security logs, login monitoring, Betheland, security console, auth events",
                canonical: `${baseUrl}/security/auth`,
                ogImage: `${baseUrl}/images/auth-console-og.jpg`
            },
            history: {
                title: `Login History & Audit Trail | ${baseTitle}`,
                description: 'Comprehensive login history and audit trail monitoring in Betheland security management system. Track user activities and security events.',
                keywords: "login history, audit trail, security monitoring, user activity, Betheland, security audit",
                canonical: `${baseUrl}/security/history`,
                ogImage: `${baseUrl}/images/history-og.jpg`
            },
            management: {
                title: isEditing
                    ? `Edit User - ${selectedUser?.username || 'User'} | ${baseTitle}`
                    : `User Management | ${baseTitle}`,
                description: isEditing
                    ? `Edit user permissions and security settings for ${selectedUser?.username || 'user'} in Betheland security management system.`
                    : 'Manage user accounts, permissions, and security settings in Betheland authentication system.',
                keywords: isEditing ? "edit user, user permissions, security settings, Betheland" : "user management, account management, permissions, Betheland security",
                canonical: `${baseUrl}/security/${isEditing ? 'edit' : 'management'}`,
                ogImage: `${baseUrl}/images/${isEditing ? 'edit-user-og.jpg' : 'user-management-og.jpg'}`
            },
            dashboard: {
                title: `Security Dashboard | ${baseTitle}`,
                description: 'Real-time security dashboard with threat monitoring, active sessions, and security analytics for Betheland platform.',
                keywords: "security dashboard, threat monitoring, active sessions, security analytics, Betheland, real-time security",
                canonical: `${baseUrl}/security/dashboard`,
                ogImage: `${baseUrl}/images/dashboard-og.jpg`
            }
        };

        return tabConfig[activeTab] || {
            title: `Security Console | ${baseTitle}`,
            description: baseDescription,
            keywords: "security, authentication, Betheland, security management",
            canonical: `${baseUrl}/security`,
            ogImage: `${baseUrl}/images/security-og.jpg`
        };
    };

    const getStatusDisplayName = (status) => {
        const statusMap = {
            'success': 'Successful',
            'failed': 'Failed',
            'locked': 'Locked',
            'suspicious': 'Suspicious',
            'all': 'All Events'
        };
        return statusMap[status] || status;
    };

    // Handler to update filters from child components
    const updateFilters = (search, status) => {
        setSearchText(search || '');
        setStatusFilter(status || 'all');
    };

    // Handler for when auth events are updated
    const handleAuthUpdate = () => {
        loadSecurityStats();
        if (activeTab === 'management') {
            handleBackToAuth();
        }
    };

    const seoData = getSeoData();

    return (
        <ConfigProvider
            theme={{
                token: {
                    borderRadius: 8,
                    colorPrimary: '#00d4aa',
                    colorInfo: '#00d4aa',
                    colorSuccess: '#00d4aa',
                    colorBgContainer: '#0a0a0a',
                    colorText: '#00ff00',
                    colorBorder: '#00d4aa',
                },
                components: {
                    Tabs: {
                        itemSelectedColor: '#00ff00',
                        itemActiveColor: '#00ff00',
                        horizontalItemPadding: '12px 16px',
                    },
                    Layout: {
                        siderBg: '#111111',
                    },
                    Card: {
                        colorBgContainer: '#1a1a1a',
                    }
                },
            }}
        >
            {/* Centralized Helmet Management */}
            <Helmet>
                <title>{seoData.title}</title>
                <meta name="description" content={seoData.description} />
                <meta name="keywords" content={seoData.keywords} />
                <meta property="og:title" content={seoData.title} />
                <meta property="og:description" content={seoData.description} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={seoData.canonical} />
                <meta property="og:image" content={seoData.ogImage} />
                <meta property="og:site_name" content="Betheland Security Console" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={seoData.title} />
                <meta name="twitter:description" content={seoData.description} />
                <meta name="twitter:image" content={seoData.ogImage} />
                <meta name="robots" content="index, follow" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta name="theme-color" content="#00d4aa" />
                <link rel="canonical" href={seoData.canonical} />
            </Helmet>

            <Layout style={{ minHeight: '100vh', background: '#0a0a0a' }}>
                <GlobalAdminTopbar onToggle={handleToggle} collapsed={collapsed} />
                <Layout>
                    <GlobalAdminNavigation collapsed={collapsed} />
                    <Layout
                        style={{
                            marginLeft: collapsed ? 80 : 200,
                            marginTop: 52,
                            transition: 'all 0.2s',
                            background: '#0a0a0a'
                        }}
                    >
                        <Layout>
                            {/* CLI-Styled Vertical Tabs Sidebar */}
                            <Sider
                                width={240}
                                style={{
                                    background: '#111111',
                                    borderRadius: borderRadiusLG,
                                    boxShadow: '2px 0 8px rgba(0, 212, 170, 0.3)',
                                    borderRight: '1px solid #00d4aa'
                                }}
                            >
                                <div style={{ padding: '20px 0' }}>
                                    {/* Security Console Header */}
                                    <div style={{
                                        padding: '0 16px 16px 16px',
                                        borderBottom: '1px solid #00d4aa',
                                        marginBottom: '8px'
                                    }}>
                                        <Title
                                            level={4}
                                            style={{
                                                margin: 0,
                                                color: '#00ff00',
                                                fontSize: '16px',
                                                fontWeight: 600,
                                                fontFamily: 'monospace'
                                            }}
                                        >
                                            > SECURITY_CONSOLE
                                        </Title>
                                        <Text
                                            style={{
                                                margin: '4px 0 0 0',
                                                color: '#00d4aa',
                                                fontSize: '11px',
                                                lineHeight: 1.4,
                                                fontFamily: 'monospace'
                                            }}
                                        >
                                            $ authentication_management_system
                                        </Text>
                                    </div>

                                    <Tabs
                                        activeKey={activeTab}
                                        onChange={handleTabChange}
                                        tabPosition="left"
                                        type="line"
                                        size="middle"
                                        style={{
                                            width: '100%',
                                        }}
                                        tabBarStyle={{
                                            border: 'none',
                                            width: '100%',
                                            fontFamily: 'monospace'
                                        }}
                                    >
                                        <TabPane
                                            key="auth"
                                            tab={
                                                <span style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    fontFamily: 'monospace',
                                                    fontSize: '12px'
                                                }}>
                                                    <TerminalOutlined />
                                                    AUTH_LOG
                                                </span>
                                            }
                                        />
                                        <TabPane
                                            key="history"
                                            tab={
                                                <Badge count={failedAttempts} size="small" offset={[10, -5]} color="#ff4d4f">
                                                    <span style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        fontFamily: 'monospace',
                                                        fontSize: '12px'
                                                    }}>
                                                        <HistoryOutlined />
                                                        AUDIT_TRAIL
                                                    </span>
                                                </Badge>
                                            }
                                        />
                                        <TabPane
                                            key="management"
                                            tab={
                                                <span style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    fontFamily: 'monospace',
                                                    fontSize: '12px'
                                                }}>
                                                    <UserAddOutlined />
                                                    {isEditing ? 'EDIT_USER' : 'USER_MGMT'}
                                                </span>
                                            }
                                        />
                                        <TabPane
                                            key="dashboard"
                                            tab={
                                                <Badge count={securityAlerts} size="small" offset={[10, -5]} color="#faad14">
                                                    <span style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        fontFamily: 'monospace',
                                                        fontSize: '12px'
                                                    }}>
                                                        <DashboardOutlined />
                                                        DASHBOARD
                                                    </span>
                                                </Badge>
                                            }
                                        />
                                    </Tabs>

                                    {/* CLI Status Panel */}
                                    <Card
                                        size="small"
                                        style={{
                                            margin: '16px',
                                            background: '#1a1a1a',
                                            border: '1px solid #00d4aa',
                                            fontFamily: 'monospace'
                                        }}
                                        bodyStyle={{ padding: '12px' }}
                                    >
                                        <div style={{ color: '#00ff00', fontSize: '11px', marginBottom: '8px' }}>
                                            > SYSTEM_STATUS
                                        </div>
                                        <Space direction="vertical" size={2} style={{ width: '100%' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                                                <Text style={{ color: '#00d4aa' }}>Active Sessions:</Text>
                                                <Badge count={activeSessions} color="#00d4aa" />
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                                                <Text style={{ color: '#ff4d4f' }}>Failed Auth:</Text>
                                                <Badge count={failedAttempts} color="#ff4d4f" />
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                                                <Text style={{ color: '#faad14' }}>Alerts:</Text>
                                                <Badge count={securityAlerts} color="#faad14" />
                                            </div>
                                        </Space>
                                    </Card>
                                </div>
                            </Sider>

                            {/* Main Content Area with CLI Theme */}
                            <Content
                                style={{
                                    background: '#0a0a0a',
                                    margin: '16px 16px 16px 0',
                                    minHeight: 280,
                                    borderRadius: borderRadiusLG,
                                    overflow: 'hidden',
                                    padding: '24px',
                                    border: '1px solid #00d4aa',
                                    fontFamily: 'monospace'
                                }}
                            >
                                {/* CLI Header */}
                                <div style={{ marginBottom: 24 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            {isEditing && (
                                                <Button
                                                    icon={<ArrowLeftOutlined />}
                                                    onClick={handleBackToAuth}
                                                    style={{
                                                        border: '1px solid #00d4aa',
                                                        background: 'transparent',
                                                        color: '#00ff00',
                                                        fontFamily: 'monospace'
                                                    }}
                                                >
                                                    $ cd ../auth_log
                                                </Button>
                                            )}
                                            <div>
                                                <div style={{
                                                    color: '#00ff00',
                                                    fontSize: '14px',
                                                    marginBottom: '4px'
                                                }}>
                                                    > {(() => {
                                                        if (isEditing) return `EDIT_USER --username=${selectedUser?.username || 'unknown'}`;
                                                        switch (activeTab) {
                                                            case 'auth': return 'AUTHENTICATION_LOG';
                                                            case 'history': return 'AUDIT_TRAIL --history';
                                                            case 'management': return 'USER_MANAGEMENT';
                                                            case 'dashboard': return 'SECURITY_DASHBOARD --live';
                                                            default: return 'SECURITY_CONSOLE';
                                                        }
                                                    })()}
                                                </div>
                                                <div style={{
                                                    color: '#00d4aa',
                                                    fontSize: '12px'
                                                }}>
                                                    {(() => {
                                                        if (isEditing) return `Modifying user permissions and security settings`;
                                                        switch (activeTab) {
                                                            case 'auth': return 'Monitoring authentication events and login attempts';
                                                            case 'history': return 'Reviewing historical security events and audit logs';
                                                            case 'management': return 'Managing user accounts and access permissions';
                                                            case 'dashboard': return 'Real-time security monitoring and threat detection';
                                                            default: return 'Security management interface';
                                                        }
                                                    })()}
                                                </div>
                                            </div>
                                        </div>
                                        {activeTab === 'auth' && !isEditing && (
                                            <Button
                                                type="primary"
                                                icon={<UserAddOutlined />}
                                                onClick={handleCreateUser}
                                                style={{
                                                    background: '#00d4aa',
                                                    borderColor: '#00d4aa',
                                                    fontFamily: 'monospace',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                $ user_add
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* Render active tab content */}
                                {activeTab === 'auth' && (
                                    <AuthPage
                                        onFilterUpdate={updateFilters}
                                        onAuthUpdate={handleAuthUpdate}
                                        onEditUser={handleEditUser}
                                        onCreateUser={handleCreateUser}
                                    />
                                )}
                                {activeTab === 'history' && (
                                    <LoginHistory onUpdate={handleAuthUpdate} />
                                )}
                                {activeTab === 'management' && (
                                    <UserManagement
                                        user={selectedUser}
                                        onSuccess={handleAuthUpdate}
                                        onBack={handleBackToAuth}
                                    />
                                )}
                                {activeTab === 'dashboard' && (
                                    <SecurityDashboard onUpdate={handleAuthUpdate} />
                                )}
                            </Content>
                        </Layout>
                    </Layout>
                </Layout>
            </Layout>
        </ConfigProvider>
    );
};

export default AuthLogLayout;