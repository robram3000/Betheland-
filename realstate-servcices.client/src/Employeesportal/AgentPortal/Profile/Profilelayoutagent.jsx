// ProfileLayoutagent.jsx
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import {
    Layout,
    theme,
    ConfigProvider,
    Tabs,
    Card,
    Form,
    Input,
    Button,
    Space,
    Typography,
    Alert,
    message,
    Row,
    Col
} from 'antd';
import {
    UserOutlined,
    LockOutlined,
    SafetyCertificateOutlined,
    CheckCircleOutlined,
    SecurityScanOutlined
} from '@ant-design/icons';
import GlobalAdminNavigation from '../Navigation/GlobalAdminNavigation';
import GlobalAdminTopbar from '../Navigation/GlobalAdminTopbar';
import ProfileAdmin from './ProfileAgent';
import agentService from '../../AdminPortal/Creation_Agent/Services/AgentService';
import authService from '../../../Authpage/Services/LoginAuth';

const { Content, Sider } = Layout;
const { Title, Text } = Typography;
const { Password } = Input;

const ProfileLayoutagent = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState('information');
    const [currentProfile, setCurrentProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [securityLoading, setSecurityLoading] = useState(false);
    const [securityError, setSecurityError] = useState(null);
    const [updatingProfile, setUpdatingProfile] = useState(false);

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const [securityForm] = Form.useForm();

    // Load current user profile
    useEffect(() => {
        loadCurrentProfile();
    }, []);

    const loadCurrentProfile = async () => {
        try {
            // Get current user from auth service
            const currentUser = authService.getCurrentUser();

            if (!currentUser || !currentUser.userId) {
                console.error('No authenticated user found');
                message.error('Please login to view your profile');
                return;
            }

            console.log('Current user ID:', currentUser.userId);

            // Get agent profile using the user ID
            const profile = await agentService.getAgentByBaseMemberId(currentUser.userId);
            setCurrentProfile(profile);
            console.log('Loaded profile:', profile);

        } catch (error) {
            console.error('Error loading current profile:', error);
            message.error('Failed to load profile data');
        }
    };

    const handleToggle = () => {
        setCollapsed(!collapsed);
    };

    const handleTabChange = (key) => {
        setActiveTab(key);
        setSecurityError(null);
    };

    const handleProfileUpdate = async () => {
        setUpdatingProfile(true);

        try {
            // Show loading message
            message.loading('Updating profile...', 0);

            // Wait a moment to simulate processing (you can remove this if not needed)
            await new Promise(resolve => setTimeout(resolve, 500));

            // Show success message
            message.destroy(); // Remove loading message
            message.success('Profile updated successfully!');

            // Reload to get updated data
            await loadCurrentProfile();

        } catch (error) {
            // Handle errors
            message.destroy(); // Remove loading message
            console.error('Error during profile update:', error);
            message.error('Failed to update profile');
        } finally {
            setUpdatingProfile(false);
        }
    };

    const handlePasswordChange = async (values) => {
        setSecurityLoading(true);
        setSecurityError(null);

        try {
            // Call API to change password
            const result = await authService.changePassword({
                currentPassword: values.currentPassword,
                newPassword: values.newPassword
            });

            if (result && result.success) {
                message.success('Password changed successfully');
                securityForm.resetFields();
            } else {
                throw new Error(result?.message || 'Password change failed');
            }
        } catch (error) {
            console.error('Error changing password:', error);
            setSecurityError(error.message || 'Failed to change password');
            message.error('Failed to change password');
        } finally {
            setSecurityLoading(false);
        }
    };

    const getSeoData = () => {
        const baseTitle = "Betheland Profile Management";
        const baseDescription = "Manage your profile and security settings";
        const baseUrl = window.location.origin;

        return {
            title: `My Profile | ${baseTitle}`,
            description: baseDescription,
            keywords: "profile management, security settings, password change, Betheland",
            canonical: `${baseUrl}/profile`,
            ogImage: `${baseUrl}/images/profile-og.jpg`
        };
    };

    const seoData = getSeoData();

    const tabItems = [
        {
            key: 'information',
            label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <UserOutlined />
                    Information
                </span>
            ),
        },
        {
            key: 'security',
            label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <SafetyCertificateOutlined />
                    Security
                </span>
            ),
        },
    ];

    const SecurityTab = () => (
        <Row gutter={[16, 16]}>
            {/* Change Password Card - Left Side */}
            <Col xs={24} md={12}>
                <Card
                    title={
                        <Space>
                            <LockOutlined />
                            Change Password
                        </Space>
                    }
                    style={{ height: '100%' }}
                >
                    {securityError && (
                        <Alert
                            message="Error"
                            description={securityError}
                            type="error"
                            showIcon
                            closable
                            onClose={() => setSecurityError(null)}
                            style={{ marginBottom: 16 }}
                        />
                    )}

                    <Form
                        form={securityForm}
                        layout="vertical"
                        onFinish={handlePasswordChange}
                    >
                        <Form.Item
                            label="Current Password"
                            name="currentPassword"
                            rules={[{ required: true, message: 'Please enter your current password' }]}
                        >
                            <Password
                                prefix={<LockOutlined />}
                                placeholder="Enter current password"
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item
                            label="New Password"
                            name="newPassword"
                            rules={[
                                { required: true, message: 'Please enter new password' },
                                { min: 8, message: 'Password must be at least 8 characters' }
                            ]}
                        >
                            <Password
                                prefix={<LockOutlined />}
                                placeholder="Enter new password"
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item
                            label="Confirm New Password"
                            name="confirmPassword"
                            dependencies={['newPassword']}
                            rules={[
                                { required: true, message: 'Please confirm your new password' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('newPassword') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('The two passwords do not match'));
                                    },
                                }),
                            ]}
                        >
                            <Password
                                prefix={<LockOutlined />}
                                placeholder="Confirm new password"
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={securityLoading}
                                size="large"
                                style={{ width: '100%' }}
                            >
                                Change Password
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            </Col>

            {/* Security Tips Card - Right Side */}
            <Col xs={24} md={12}>
                <Card
                    title={
                        <Space>
                            <SecurityScanOutlined />
                            Security Tips
                        </Space>
                    }
                    style={{ height: '100%' }}
                >
                    <div style={{ lineHeight: 1.8 }}>
                        {[
                            {
                                icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
                                text: "Use a strong, unique password with mix of uppercase, lowercase, numbers and symbols"
                            },
                            {
                                icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
                                text: "Never share your password with anyone, including colleagues"
                            },
                            {
                                icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
                                text: "Change your password regularly every 3-6 months"
                            },
                            {
                                icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
                                text: "Use different passwords for different accounts and services"
                            },
                            {
                                icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
                                text: "Enable two-factor authentication for enhanced security"
                            }
                        ].map((tip, index) => (
                            <div
                                key={index}
                                style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    marginBottom: 12,
                                    padding: '8px 12px',
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: '6px',
                                    border: '1px solid #f0f0f0'
                                }}
                            >
                                <span style={{
                                    marginRight: 12,
                                    marginTop: 2,
                                    fontSize: '14px'
                                }}>
                                    {tip.icon}
                                </span>
                                <Text style={{
                                    fontSize: '14px',
                                    color: '#333',
                                    flex: 1
                                }}>
                                    {tip.text}
                                </Text>
                            </div>
                        ))}
                    </div>
                </Card>
            </Col>
        </Row>
    );

    return (
        <ConfigProvider
            theme={{
                token: {
                    borderRadius: 8,
                    colorPrimary: '#1a365d',
                    colorInfo: '#1a365d',
                    colorSuccess: '#1a365d',
                },
                components: {
                    Tabs: {
                        itemSelectedColor: '#1a365d',
                        itemActiveColor: '#1a365d',
                        horizontalItemPadding: '12px 16px',
                    },
                    Layout: {
                        siderBg: '#f8f9fa',
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
                <meta property="og:site_name" content="Betheland Profile Management" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={seoData.title} />
                <meta name="twitter:description" content={seoData.description} />
                <meta name="twitter:image" content={seoData.ogImage} />
                <meta name="robots" content="noindex, nofollow" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta name="theme-color" content="#1a365d" />
                <link rel="canonical" href={seoData.canonical} />
            </Helmet>

            <Layout style={{ minHeight: '100vh' }}>
                <GlobalAdminTopbar onToggle={handleToggle} collapsed={collapsed} />
                <Layout>
                    <GlobalAdminNavigation collapsed={collapsed} />
                    <Layout
                        style={{
                            marginLeft: collapsed ? 80 : 200,
                            marginTop: 52,
                            transition: 'all 0.2s',
                        }}
                    >
                        <Layout>
                            {/* Vertical Tabs Sidebar */}
                            <Sider
                                width={220}
                                style={{
                                    background: colorBgContainer,
                                    borderRadius: borderRadiusLG,
                                    boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)',
                                    borderRight: '1px solid #f0f0f0'
                                }}
                            >
                                <div style={{ padding: '20px 0' }}>
                                    {/* Profile Control Header */}
                                    <div style={{
                                        padding: '0 16px 16px 16px',
                                        borderBottom: '1px solid #f0f0f0',
                                        marginBottom: '8px'
                                    }}>
                                        <Title
                                            level={4}
                                            style={{
                                                margin: 0,
                                                color: '#1a365d',
                                                fontSize: '16px',
                                                fontWeight: 600
                                            }}
                                        >
                                            My Profile
                                        </Title>
                                        <Text style={{
                                            margin: '4px 0 0 0',
                                            color: '#666',
                                            fontSize: '12px',
                                            lineHeight: 1.4,
                                            display: 'block'
                                        }}>
                                            Manage your profile and security
                                        </Text>
                                    </div>

                                    <Tabs
                                        activeKey={activeTab}
                                        onChange={handleTabChange}
                                        tabPosition="left"
                                        type="line"
                                        size="middle"
                                        style={{ width: '100%' }}
                                        tabBarStyle={{ border: 'none', width: '100%' }}
                                        items={tabItems}
                                    />
                                </div>
                            </Sider>

                            {/* Main Content Area */}
                            <Content
                                style={{
                                    background: colorBgContainer,
                                    margin: '16px 16px 16px 0',
                                    minHeight: 280,
                                    borderRadius: borderRadiusLG,
                                    overflow: 'hidden',
                                    padding: '24px'
                                }}
                            >
                                {/* Header Section */}
                                <div style={{ marginBottom: 24 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div>
                                            <h1 style={{
                                                margin: 0,
                                                color: '#1a365d',
                                                fontSize: '24px',
                                                fontWeight: 600
                                            }}>
                                                {activeTab === 'information' ? 'Profile Information' : 'Security Settings'}
                                            </h1>
                                            <p style={{
                                                margin: '6px 0 0 0',
                                                color: '#666',
                                                fontSize: '14px'
                                            }}>
                                                {activeTab === 'information'
                                                    ? 'Update your personal and professional information'
                                                    : 'Change your password and manage security settings'
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Conditional Content Rendering */}
                                {activeTab === 'information' ? (
                                    <ProfileAdmin
                                        profile={currentProfile}
                                        onSuccess={handleProfileUpdate}
                                        onCancel={() => { }} // No cancel for profile edit in this context
                                    />
                                ) : (
                                    <SecurityTab />
                                )}
                            </Content>
                        </Layout>
                    </Layout>
                </Layout>
            </Layout>
        </ConfigProvider>
    );
};

export default ProfileLayoutagent;