// AuthLogLayout.jsx - Enhanced Mobile Version
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Layout, theme, ConfigProvider, Tabs, Badge, Button, Space, Typography, Card, Grid } from 'antd';
import {
    ArrowLeftOutlined,
    UserAddOutlined,
    HistoryOutlined,
    MonitorOutlined,
    TeamOutlined,
    CodeOutlined
} from '@ant-design/icons';
import GlobalAdminTopbar from '../Navigation/GlobalAdminTopbar';
import AuthPage from './AuthPage';
import LoginHistory from './LoginHistory';
import SecurityDashboard from './SecurityDashboard';
import UserManagement from './UserManagement';

const { Content } = Layout;
const { Title } = Typography;
const { useBreakpoint } = Grid;

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
        }
    ]),
    lockUser: (username) => Promise.resolve({ success: true }),
    unlockUser: (username) => Promise.resolve({ success: true }),
    deleteAuthEvent: (eventId) => Promise.resolve({ success: true })
};

const AuthLogLayout = () => {
    const [activeTab, setActiveTab] = useState('auth');
    const [failedAttempts, setFailedAttempts] = useState(0);
    const [activeSessions, setActiveSessions] = useState(0);
    const [securityAlerts, setSecurityAlerts] = useState(0);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedUser, setSelectedUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const screens = useBreakpoint();
    const isMobile = !screens.md;

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

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

    // Mobile header with better spacing
    const renderHeader = () => {
        const getHeaderTitle = () => {
            if (isEditing) return `Edit User: ${selectedUser?.username || 'unknown'}`;
            switch (activeTab) {
                case 'auth': return 'Authentication Log';
                case 'history': return 'Audit Trail';
                case 'management': return 'User Management';
                case 'dashboard': return 'Security Dashboard';
                default: return 'Security Console';
            }
        };

        const getHeaderDescription = () => {
            if (isEditing) return `Modifying user permissions and security settings`;
            switch (activeTab) {
                case 'auth': return 'Monitoring authentication events and login attempts';
                case 'history': return 'Reviewing historical security events and audit logs';
                case 'management': return 'Managing user accounts and access permissions';
                case 'dashboard': return 'Real-time security monitoring and threat detection';
                default: return 'Security management interface';
            }
        };

        const showBackButton = isEditing;

        return (
            <div style={{ marginBottom: isMobile ? 16 : 24 }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {showBackButton && (
                            <Button
                                icon={<ArrowLeftOutlined />}
                                onClick={handleBackToAuth}
                                style={{ border: 'none' }}
                                size={isMobile ? "small" : "middle"}
                            >
                                {isMobile ? 'Back' : 'Back to Auth Log'}
                            </Button>
                        )}
                        <div>
                            <Title level={isMobile ? 3 : 2} style={{
                                margin: 0,
                                color: '#1a365d',
                                fontSize: isMobile ? '20px' : '28px',
                                fontWeight: 600
                            }}>
                                {getHeaderTitle()}
                            </Title>
                            <p style={{
                                margin: '4px 0 0 0',
                                color: '#666',
                                fontSize: isMobile ? '14px' : '16px'
                            }}>
                                {getHeaderDescription()}
                            </p>
                        </div>
                    </div>
                    {activeTab === 'auth' && !isEditing && (
                        <Button
                            type="primary"
                            icon={<UserAddOutlined />}
                            onClick={handleCreateUser}
                            size={isMobile ? "middle" : "large"}
                        >
                            {isMobile ? 'Add User' : 'Add User'}
                        </Button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <ConfigProvider
            theme={{
                token: {
                    borderRadius: 8,
                    colorPrimary: '#1890ff',
                    colorInfo: '#1890ff',
                    colorSuccess: '#52c41a',
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

            <Layout style={{
                minHeight: '100vh',
                overflow: 'hidden'
            }}>
                <GlobalAdminTopbar />
                <Layout style={{
                    marginTop: isMobile ? 64 : 112,
                    marginLeft: 0,
                    height: `calc(100vh - ${isMobile ? 64 : 112}px)`,
                    overflow: 'auto'
                }}>
                    <Content
                        style={{
                            background: colorBgContainer,
                            minHeight: 'fit-content',
                            overflow: 'visible',
                            padding: isMobile ? '16px' : '30px'
                        }}
                    >
                        {/* Header Section */}
                        {renderHeader()}

                        {/* Horizontal Tabs */}
                        <Card
                            bodyStyle={{ padding: '0' }}
                            style={{
                                marginBottom: isMobile ? 16 : 24,
                                border: 'none',
                                boxShadow: 'none'
                            }}
                        >
                            <Tabs
                                activeKey={activeTab}
                                onChange={handleTabChange}
                                type="line"
                                size={isMobile ? "middle" : "large"}
                                style={{
                                    borderBottom: '1px solid #f0f0f0'
                                }}
                                items={[
                                    {
                                        key: 'auth',
                                        label: (
                                            <span style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                fontSize: isMobile ? '14px' : '16px',
                                                fontWeight: 500
                                            }}>
                                                <CodeOutlined />
                                                {isMobile ? 'Auth Log' : 'Authentication Log'}
                                            </span>
                                        )
                                    },
                                    {
                                        key: 'history',
                                        label: (
                                            <Badge count={failedAttempts} size="small" offset={[10, -5]} color="#ff4d4f">
                                                <span style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    fontSize: isMobile ? '14px' : '16px',
                                                    fontWeight: 500
                                                }}>
                                                    <HistoryOutlined />
                                                    {isMobile ? 'Audit' : 'Audit Trail'}
                                                </span>
                                            </Badge>
                                        )
                                    },
                                    {
                                        key: 'management',
                                        label: (
                                            <span style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                fontSize: isMobile ? '14px' : '16px',
                                                fontWeight: 500
                                            }}>
                                                <TeamOutlined />
                                                {isMobile ? 'Users' : 'User Management'}
                                            </span>
                                        )
                                    },
                                    {
                                        key: 'dashboard',
                                        label: (
                                            <Badge count={securityAlerts} size="small" offset={[10, -5]} color="#faad14">
                                                <span style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    fontSize: isMobile ? '14px' : '16px',
                                                    fontWeight: 500
                                                }}>
                                                    <MonitorOutlined />
                                                    {isMobile ? 'Dashboard' : 'Security Dashboard'}
                                                </span>
                                            </Badge>
                                        )
                                    }
                                ]}
                            />
                        </Card>

                        {/* Main Content Area - NO SCROLL */}
                        <div style={{
                            width: '100%',
                            overflow: 'visible'
                        }}>
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
                        </div>
                    </Content>
                </Layout>
            </Layout>
        </ConfigProvider>
    );
};

export default AuthLogLayout;