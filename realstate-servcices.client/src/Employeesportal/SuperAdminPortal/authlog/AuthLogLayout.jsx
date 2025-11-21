// AuthLogLayout.jsx
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
    LockOutlined,
    AuditOutlined,
    CodeOutlined,
    MonitorOutlined,
    TeamOutlined
} from '@ant-design/icons';
import GlobalAdminNavigation from '../Navigation/GlobalAdminNavigation';
import GlobalAdminTopbar from '../Navigation/GlobalAdminTopbar';
import AuthPage from './AuthPage';
import LoginHistory from './LoginHistory';
import SecurityDashboard from './SecurityDashboard';
import UserManagement from './UserManagement';

const { Content, Sider } = Layout;
const { TabPane } = Tabs;
const { Title, Text } = Typography;

const mockAuthService = {
    getFailedAttempts: () => Promise.resolve(12),
    getActiveSessions: () => Promise.resolve(45),
    getSecurityAlerts: () => Promise.resolve(3),
    getAuthEvents: () => Promise.resolve([
        {
            id: 1,
            username: 'admin',
            status: 'success',
            type: 'login',
            ipAddress: '192.168.1.100',
            location: 'New York, US',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            timestamp: new Date().toISOString(),
            additionalInfo: { method: 'password', twoFactor: true }
        },
        {
            id: 2,
            username: 'john_doe',
            status: 'failed',
            type: 'login',
            ipAddress: '192.168.1.101',
            location: 'London, UK',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            timestamp: new Date(Date.now() - 300000).toISOString(),
            additionalInfo: { reason: 'Invalid password', attempts: 3 }
        },
        {
            id: 3,
            username: 'jane_smith',
            status: 'locked',
            type: 'login',
            ipAddress: '192.168.1.102',
            location: 'Tokyo, JP',
            userAgent: 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36',
            timestamp: new Date(Date.now() - 600000).toISOString(),
            additionalInfo: { lockedUntil: new Date(Date.now() + 3600000).toISOString() }
        }
    ]),
    lockUser: (username) => {
        console.log(`Locking user: ${username}`);
        return Promise.resolve({ success: true });
    },
    unlockUser: (username) => {
        console.log(`Unlocking user: ${username}`);
        return Promise.resolve({ success: true });
    },
    deleteAuthEvent: (eventId) => {
        console.log(`Deleting auth event: ${eventId}`);
        return Promise.resolve({ success: true });
    }
};

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
                mockAuthService.getFailedAttempts(),
                mockAuthService.getActiveSessions(),
                mockAuthService.getSecurityAlerts()
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

    const getSeoData = () => {
        const baseTitle = "Security Console";
        const baseDescription = "Authentication and security management platform";
        const baseUrl = window.location.origin;

        const tabConfig = {
            auth: {
                title: searchText
                    ? `Search: "${searchText}" - Authentication Logs | ${baseTitle}`
                    : statusFilter !== 'all'
                        ? `${getStatusDisplayName(statusFilter)} Auth Events | ${baseTitle}`
                        : `Authentication Console | ${baseTitle}`,
                description: searchText
                    ? `Search results for "${searchText}" in security authentication system. Monitor login attempts and security events.`
                    : 'Monitor and manage authentication events, login attempts, and security logs in security console.',
                keywords: "authentication, security logs, login monitoring, security console, auth events",
                canonical: `${baseUrl}/security/auth`,
                ogImage: `${baseUrl}/images/auth-console-og.jpg`
            },
            history: {
                title: `Login History & Audit Trail | ${baseTitle}`,
                description: 'Comprehensive login history and audit trail monitoring in security management system. Track user activities and security events.',
                keywords: "login history, audit trail, security monitoring, user activity, security audit",
                canonical: `${baseUrl}/security/history`,
                ogImage: `${baseUrl}/images/history-og.jpg`
            },
            management: {
                title: isEditing
                    ? `Edit User - ${selectedUser?.username || 'User'} | ${baseTitle}`
                    : `User Management | ${baseTitle}`,
                description: isEditing
                    ? `Edit user permissions and security settings for ${selectedUser?.username || 'user'} in security management system.`
                    : 'Manage user accounts, permissions, and security settings in authentication system.',
                keywords: isEditing ? "edit user, user permissions, security settings" : "user management, account management, permissions, security",
                canonical: `${baseUrl}/security/${isEditing ? 'edit' : 'management'}`,
                ogImage: `${baseUrl}/images/${isEditing ? 'edit-user-og.jpg' : 'user-management-og.jpg'}`
            },
            dashboard: {
                title: `Security Dashboard | ${baseTitle}`,
                description: 'Real-time security dashboard with threat monitoring, active sessions, and security analytics.',
                keywords: "security dashboard, threat monitoring, active sessions, security analytics, real-time security",
                canonical: `${baseUrl}/security/dashboard`,
                ogImage: `${baseUrl}/images/dashboard-og.jpg`
            }
        };

        return tabConfig[activeTab] || {
            title: `Security Console | ${baseTitle}`,
            description: baseDescription,
            keywords: "security, authentication, security management",
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

    const updateFilters = (search, status) => {
        setSearchText(search || '');
        setStatusFilter(status || 'all');
    };

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
                    colorPrimary: '#1890ff',
                    colorInfo: '#1890ff',
                    colorSuccess: '#52c41a',
                    colorBgContainer: '#ffffff',
                    colorText: '#000000',
                    colorBorder: '#d9d9d9',
                },
                components: {
                    Tabs: {
                        itemSelectedColor: '#1890ff',
                        itemActiveColor: '#1890ff',
                        horizontalItemPadding: '12px 16px',
                    },
                    Layout: {
                        siderBg: '#ffffff',
                    },
                    Card: {
                        colorBgContainer: '#ffffff',
                    }
                },
            }}
        >
            <Helmet>
                <title>{seoData.title}</title>
                <meta name="description" content={seoData.description} />
                <meta name="keywords" content={seoData.keywords} />
                <meta property="og:title" content={seoData.title} />
                <meta property="og:description" content={seoData.description} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={seoData.canonical} />
                <meta property="og:image" content={seoData.ogImage} />
                <meta property="og:site_name" content="Security Console" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={seoData.title} />
                <meta name="twitter:description" content={seoData.description} />
                <meta name="twitter:image" content={seoData.ogImage} />
                <meta name="robots" content="index, follow" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta name="theme-color" content="#1890ff" />
                <link rel="canonical" href={seoData.canonical} />
            </Helmet>

            <Layout style={{ minHeight: '100vh', background: '#ffffff' }}>
                <GlobalAdminTopbar onToggle={handleToggle} collapsed={collapsed} />
                <Layout>
                    <GlobalAdminNavigation collapsed={collapsed} />
                    <Layout
                        style={{
                            marginLeft: collapsed ? 80 : 200,
                            marginTop: 52,
                            transition: 'all 0.2s',
                            background: '#ffffff'
                        }}
                    >
                        <Layout>
                            <Sider
                                width={240}
                                style={{
                                    background: '#ffffff',
                                    borderRadius: borderRadiusLG,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                    borderRight: '1px solid #d9d9d9',
                                    position: 'sticky',
                                    top: 68,
                                    height: 'calc(100vh - 84px)',
                                    overflowY: 'auto',
                                    overflowX: 'hidden'
                                }}
                            >
                                <div style={{ padding: '20px 0' }}>
                                    <div style={{
                                        padding: '0 16px 16px 16px',
                                        borderBottom: '1px solid #d9d9d9',
                                        marginBottom: '8px'
                                    }}>
                                        <Title
                                            level={4}
                                            style={{
                                                margin: 0,
                                                color: '#000000',
                                                fontSize: '16px',
                                                fontWeight: 600
                                            }}
                                        >
                                            Security Console
                                        </Title>
                                        <Text
                                            style={{
                                                margin: '4px 0 0 0',
                                                color: '#666666',
                                                fontSize: '12px',
                                                lineHeight: 1.4
                                            }}
                                        >
                                            Authentication Management System
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
                                            width: '100%'
                                        }}
                                    >
                                        <TabPane
                                            key="auth"
                                            tab={
                                                <span style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px'
                                                }}>
                                                    <CodeOutlined />
                                                    Auth Log
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
                                                        gap: '8px'
                                                    }}>
                                                        <HistoryOutlined />
                                                        Audit Trail
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
                                                    gap: '8px'
                                                }}>
                                                    <TeamOutlined />
                                                    {isEditing ? 'Edit User' : 'User Management'}
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
                                                        gap: '8px'
                                                    }}>
                                                        <MonitorOutlined />
                                                        Dashboard
                                                    </span>
                                                </Badge>
                                            }
                                        />
                                    </Tabs>

                                    <Card
                                        size="small"
                                        style={{
                                            margin: '16px',
                                            background: '#ffffff',
                                            border: '1px solid #d9d9d9'
                                        }}
                                        bodyStyle={{ padding: '12px' }}
                                    >
                                        <div style={{ color: '#000000', fontSize: '12px', marginBottom: '8px' }}>
                                            System Status
                                        </div>
                                        <Space direction="vertical" size={2} style={{ width: '100%' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                                                <Text style={{ color: '#000000' }}>Active Sessions:</Text>
                                                <Badge count={activeSessions} color="#1890ff" />
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                                                <Text style={{ color: '#ff4d4f' }}>Failed Auth:</Text>
                                                <Badge count={failedAttempts} color="#ff4d4f" />
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                                                <Text style={{ color: '#faad14' }}>Alerts:</Text>
                                                <Badge count={securityAlerts} color="#faad14" />
                                            </div>
                                        </Space>
                                    </Card>
                                </div>
                            </Sider>

                            <Content
                                style={{
                                    background: '#ffffff',
                                    margin: '16px 16px 16px 0',
                                    minHeight: 280,
                                    borderRadius: borderRadiusLG,
                                    overflow: 'hidden',
                                    padding: '24px',
                                    border: '1px solid #d9d9d9'
                                }}
                            >
                                <div style={{ marginBottom: 24 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            {isEditing && (
                                                <Button
                                                    icon={<ArrowLeftOutlined />}
                                                    onClick={handleBackToAuth}
                                                    style={{
                                                        border: '1px solid #d9d9d9',
                                                        background: 'transparent',
                                                        color: '#000000'
                                                    }}
                                                >
                                                    Back to Auth Log
                                                </Button>
                                            )}
                                            <div>
                                                <div style={{
                                                    color: '#000000',
                                                    fontSize: '16px',
                                                    marginBottom: '4px',
                                                    fontWeight: 600
                                                }}>
                                                    {(() => {
                                                        if (isEditing) return `Edit User: ${selectedUser?.username || 'unknown'}`;
                                                        switch (activeTab) {
                                                            case 'auth': return 'Authentication Log';
                                                            case 'history': return 'Audit Trail';
                                                            case 'management': return 'User Management';
                                                            case 'dashboard': return 'Security Dashboard';
                                                            default: return 'Security Console';
                                                        }
                                                    })()}
                                                </div>
                                                <div style={{
                                                    color: '#666666',
                                                    fontSize: '14px'
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
                                                    background: '#1890ff',
                                                    borderColor: '#1890ff'
                                                }}
                                            >
                                                Add User
                                            </Button>
                                        )}
                                    </div>
                                </div>

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