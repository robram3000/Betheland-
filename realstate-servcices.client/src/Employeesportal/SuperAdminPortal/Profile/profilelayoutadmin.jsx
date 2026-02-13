// ProfileLayoutAdmin.jsx - Enhanced Mobile Version with OTP Verification
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
    Col,
    Grid,
    Modal,
    Steps,
    Avatar
} from 'antd';
import {
    UserOutlined,
    LockOutlined,
    SafetyCertificateOutlined,
    CheckCircleOutlined,
    SecurityScanOutlined,
    SafetyOutlined,
    MailOutlined,
    PhoneOutlined
} from '@ant-design/icons';
import GlobalAdminTopbar from '../Navigation/GlobalAdminTopbar';
import ProfileAdmin from './ProfileAdmin';
import agentService from '../../AdminPortal/Creation_Agent/Services/AgentService';
import authService from '../../../Authpage/Services/LoginAuth';
import { otpService } from '../../../Register/Services/otpService';
import { forgotPasswordService } from '../../../Forgotpassword/Services/ForgotPasswordService';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Password } = Input;
const { useBreakpoint } = Grid;
const { Step } = Steps;

const ProfileLayoutAdmin = () => {
    const [activeTab, setActiveTab] = useState('information');
    const [currentProfile, setCurrentProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [securityLoading, setSecurityLoading] = useState(false);
    const [securityError, setSecurityError] = useState(null);
    const [updatingProfile, setUpdatingProfile] = useState(false);
    const screens = useBreakpoint();
    const isMobile = !screens.md;

    // OTP Verification States
    const [otpModalVisible, setOtpModalVisible] = useState(false);
    const [otpStep, setOtpStep] = useState(0); // 0: request OTP, 1: verify OTP, 2: change password
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [otpData, setOtpData] = useState({
        email: '',
        otpCode: '',
        newPassword: '',
        confirmPassword: '',
        currentPassword: ''
    });

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const [securityForm] = Form.useForm();
    const [otpForm] = Form.useForm();

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

    // OTP Verification Flow for Password Change
    const initiatePasswordChange = async (values) => {
        if (values.newPassword !== values.confirmPassword) {
            message.error('New passwords do not match!');
            return;
        }

        // Store password data for later use
        setOtpData({
            email: currentProfile?.email || '',
            newPassword: values.newPassword,
            confirmPassword: values.confirmPassword,
            currentPassword: values.currentPassword,
            otpCode: ''
        });

        // Show OTP modal and start verification process
        setOtpModalVisible(true);
        setOtpStep(0);
        setOtpVerified(false);
        setSecurityError(null);
    };

    const requestOTP = async () => {
        if (!currentProfile?.email) {
            message.error('Email not found');
            return;
        }

        setOtpLoading(true);
        try {
            await otpService.generateOTP(currentProfile.email);
            message.success('OTP sent to your email!');
            setOtpStep(1); // Move to verification step
        } catch (error) {
            console.error('OTP request error:', error);
            message.error('Failed to send OTP. Please try again.');
        } finally {
            setOtpLoading(false);
        }
    };

    const verifyOTP = async (values) => {
        if (!currentProfile?.email) {
            message.error('Email not found');
            return;
        }

        setOtpLoading(true);
        try {
            await otpService.verifyOTP(currentProfile.email, values.otpCode);
            message.success('OTP verified successfully!');
            setOtpVerified(true);
            setOtpStep(2); // Move to password change step
            setOtpData(prev => ({ ...prev, otpCode: values.otpCode }));
        } catch (error) {
            console.error('OTP verification error:', error);
            message.error('Invalid OTP. Please try again.');
        } finally {
            setOtpLoading(false);
        }
    };

    const executePasswordChange = async () => {
        if (!otpVerified) {
            message.error('Please verify OTP first');
            return;
        }

        setOtpLoading(true);
        try {
            // Use forgotPasswordService.resetPassword for password reset
            const result = await forgotPasswordService.resetPassword(
                otpData.email,
                otpData.newPassword,
                otpData.confirmPassword,
                otpData.otpCode
            );

            if (result && result.success) {
                message.success('Password changed successfully!');
                setOtpModalVisible(false);
                securityForm.resetFields();
                setOtpVerified(false);
                setOtpStep(0);
                setSecurityError(null);

                // Optional: Force logout for security
                setTimeout(() => {
                    message.info('Please login again with your new password');
                    // authService.logout();
                    // window.location.href = '/login';
                }, 2000);
            } else {
                throw new Error(result?.message || 'Password change failed');
            }
        } catch (error) {
            console.error('Password change error:', error);
            const errorMsg = error.message || 'Failed to change password. Please try again.';
            message.error(errorMsg);
            setSecurityError(errorMsg);
        } finally {
            setOtpLoading(false);
        }
    };

    const resendOTP = async () => {
        if (!currentProfile?.email) {
            message.error('Email not found');
            return;
        }

        setOtpLoading(true);
        try {
            await otpService.resendOTP(currentProfile.email);
            message.success('OTP resent to your email!');
        } catch (error) {
            console.error('OTP resend error:', error);
            message.error('Failed to resend OTP. Please try again.');
        } finally {
            setOtpLoading(false);
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

    // Mobile header with better spacing
    const renderHeader = () => {
        const getHeaderTitle = () => {
            switch (activeTab) {
                case 'information': return 'Profile Information';
                case 'security': return 'Security Settings';
                default: return 'My Profile';
            }
        };

        const getHeaderDescription = () => {
            switch (activeTab) {
                case 'information': return 'Update your personal and professional information';
                case 'security': return 'Change your password and manage security settings';
                default: return 'Manage your profile and security settings';
            }
        };

        return (
            <div style={{ marginBottom: isMobile ? 16 : 24 }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px'
                }}>
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
            </div>
        );
    };

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
                        onFinish={initiatePasswordChange}
                    >
                        <Form.Item
                            label="Current Password"
                            name="currentPassword"
                            rules={[{ required: true, message: 'Please enter your current password' }]}
                        >
                            <Password
                                prefix={<LockOutlined />}
                                placeholder="Enter current password"
                                size={isMobile ? "middle" : "large"}
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
                                size={isMobile ? "middle" : "large"}
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
                                size={isMobile ? "middle" : "large"}
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={securityLoading}
                                size={isMobile ? "middle" : "large"}
                                style={{ width: '100%' }}
                                icon={<SafetyOutlined />}
                            >
                                Verify & Change Password
                            </Button>
                        </Form.Item>

                        <Text type="secondary" style={{ fontSize: '12px', display: 'block', textAlign: 'center' }}>
                            You will need to verify via OTP before changing your password
                        </Text>
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
                                        key: 'information',
                                        label: (
                                            <span style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                fontSize: isMobile ? '14px' : '16px',
                                                fontWeight: 500
                                            }}>
                                                <UserOutlined />
                                                {isMobile ? 'Profile' : 'Profile Information'}
                                            </span>
                                        )
                                    },
                                    {
                                        key: 'security',
                                        label: (
                                            <span style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                fontSize: isMobile ? '14px' : '16px',
                                                fontWeight: 500
                                            }}>
                                                <SafetyCertificateOutlined />
                                                {isMobile ? 'Security' : 'Security Settings'}
                                            </span>
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
                            <Card
                                style={{
                                    border: '1px solid #f0f0f0',
                                    borderRadius: '12px',
                                    padding: 0
                                }}
                                bodyStyle={{ padding: 0 }}
                            >
                                {activeTab === 'information' ? (
                                    <ProfileAdmin
                                        profile={currentProfile}
                                        onSuccess={handleProfileUpdate}
                                        onCancel={() => { }} // No cancel for profile edit in this context
                                    />
                                ) : (
                                    <div style={{ padding: '24px' }}>
                                        <SecurityTab />
                                    </div>
                                )}
                            </Card>
                        </div>
                    </Content>
                </Layout>
            </Layout>

            {/* OTP Verification Modal */}
            <Modal
                title={
                    <div style={{ textAlign: 'center' }}>
                        <SafetyOutlined style={{ color: '#1a365d', marginRight: '8px' }} />
                        OTP Verification Required
                    </div>
                }
                open={otpModalVisible}
                onCancel={() => !otpLoading && setOtpModalVisible(false)}
                footer={null}
                width={400}
                closable={!otpLoading}
                maskClosable={!otpLoading}
            >
                <Steps current={otpStep} size="small" style={{ marginBottom: '20px' }}>
                    <Step title="Request" />
                    <Step title="Verify" />
                    <Step title="Change" />
                </Steps>

                {otpStep === 0 && (
                    <div style={{ textAlign: 'center' }}>
                        <Avatar
                            size={64}
                            icon={<MailOutlined />}
                            style={{ backgroundColor: '#1a365d', marginBottom: '16px' }}
                        />
                        <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                            Secure Password Change
                        </Text>
                        <Text type="secondary" style={{ display: 'block', marginBottom: '16px' }}>
                            We need to verify your identity before changing your password.
                        </Text>
                        <div style={{ marginTop: '16px' }}>
                            <Button
                                type="primary"
                                onClick={requestOTP}
                                loading={otpLoading}
                                size="large"
                                style={{
                                    backgroundColor: '#1a365d',
                                    borderColor: '#1a365d',
                                    width: '100%'
                                }}
                            >
                                Send OTP to {currentProfile?.email}
                            </Button>
                        </div>
                    </div>
                )}

                {otpStep === 1 && (
                    <Form
                        form={otpForm}
                        layout="vertical"
                        onFinish={verifyOTP}
                    >
                        <Form.Item
                            label="Enter OTP Code"
                            name="otpCode"
                            rules={[
                                { required: true, message: 'Please enter OTP code' },
                                { len: 6, message: 'OTP must be 6 digits' }
                            ]}
                        >
                            <Input
                                placeholder="Enter 6-digit OTP"
                                maxLength={6}
                                style={{
                                    textAlign: 'center',
                                    letterSpacing: '8px',
                                    fontSize: '16px',
                                    height: '40px'
                                }}
                            />
                        </Form.Item>

                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
                            <Button
                                onClick={resendOTP}
                                loading={otpLoading}
                                disabled={otpLoading}
                                size="middle"
                            >
                                Resend OTP
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={otpLoading}
                                size="middle"
                                style={{
                                    backgroundColor: '#1a365d',
                                    borderColor: '#1a365d'
                                }}
                            >
                                Verify OTP
                            </Button>
                        </div>
                    </Form>
                )}

                {otpStep === 2 && (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#52c41a', fontSize: '48px', marginBottom: '16px' }}>
                            ✓
                        </div>
                        <Text strong style={{ display: 'block', marginBottom: '16px' }}>
                            OTP Verified Successfully!
                        </Text>
                        <Text type="secondary" style={{ display: 'block', marginBottom: '16px' }}>
                            You can now change your password securely.
                        </Text>
                        <Button
                            type="primary"
                            onClick={executePasswordChange}
                            loading={otpLoading}
                            size="large"
                            style={{
                                backgroundColor: '#52c41a',
                                borderColor: '#52c41a',
                                width: '100%'
                            }}
                        >
                            Change Password Now
                        </Button>
                    </div>
                )}
            </Modal>
        </ConfigProvider>
    );
};

export default ProfileLayoutAdmin;