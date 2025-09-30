import React, { useState } from 'react';
import {
    UserOutlined,
    LockOutlined,
    LoadingOutlined,
    CheckCircleOutlined,
    SafetyCertificateOutlined,
    CrownOutlined,
    StarOutlined,
    TeamOutlined,
    DownOutlined,
    UpOutlined
} from '@ant-design/icons';
import {
    Form,
    Input,
    Button,
    Card,
    Typography,
    Spin,
    message,
    Divider,
    Checkbox,
    Modal,
    Collapse,
    Layout,
    ConfigProvider
} from 'antd';
import { useNavigate } from 'react-router-dom';
import RegisterAccountServices from './Services/RegisterAccountServices';

const { Title, Text, Link } = Typography;
const { Panel } = Collapse;
const { Content } = Layout;

const AccountSetup = () => {
    const [loading, setLoading] = useState(false);
    const [showSpinner, setShowSpinner] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const theme = {
        token: {
            colorPrimary: '#1B3C53',
            borderRadius: 8,
        },
    };

    // In the onFinish function of AccountSetup.jsx, update the registrationData to only include what's actually in the form:

    const onFinish = async (values) => {
        setShowSpinner(true);
        setLoading(true);

        try {
            // Get stored data from previous steps
            const email = localStorage.getItem('verificationEmail');
            const otpCode = localStorage.getItem('otpCode');

            console.log('Registration Data:', {
                email: email,
                otpCode: otpCode,
                username: values.username
            });

            // Combine all registration data
            const registrationData = {
                email: email,
                username: values.username,
                password: values.password,
                firstName: localStorage.getItem('basicInfo_firstName') || '',
                lastName: localStorage.getItem('basicInfo_lastName') || '',
                cellPhoneNo: localStorage.getItem('basicInfo_phone') || '',
                gender: localStorage.getItem('basicInfo_gender') || '',
                country: '',
                city: '',
                street: '',
                zipCode: '',
                otpCode: otpCode // Ensure this is correctly set
            };

            // Call registration API
            const result = await RegisterAccountServices.registerClient(registrationData);

            if (result.success) {
                setCompleted(true);
                message.success('Account setup completed successfully! Welcome to BeTheLand Real Estate!');

                // Clear local storage
                localStorage.removeItem('verificationEmail');
                localStorage.removeItem('otpVerified');
                localStorage.removeItem('otpCode');
                localStorage.removeItem('basicInfo_firstName');
                localStorage.removeItem('basicInfo_lastName');
                localStorage.removeItem('basicInfo_phone');
                localStorage.removeItem('basicInfo_gender');

                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                message.error(result.message || 'Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Registration error:', error);
            message.error('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
            setShowSpinner(false);
        }
    };

    const showPrivacyPolicy = () => {
        setPrivacyModalVisible(true);
    };

    const PrivacyPolicyModal = () => (
        <Modal
            title="BeTheLand Privacy Policy & Terms of Service"
            open={privacyModalVisible}
            onCancel={() => setPrivacyModalVisible(false)}
            footer={[
                <Button key="close" onClick={() => setPrivacyModalVisible(false)}>
                    Close
                </Button>
            ]}
            width={700}
        >
            <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '10px' }}>
                <Title level={4}>Privacy Policy</Title>
                <Text>
                    At BeTheLand Real Estate, we are committed to protecting your privacy and ensuring the security of your personal information.
                    This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our services.
                </Text>

                <Title level={5} style={{ marginTop: '16px' }}>Information We Collect</Title>
                <Text>
                    We collect personal information that you provide to us when you register for an account, including your name, email address,
                    phone number, and other contact details. We also collect information about your property preferences and interactions with our platform.
                </Text>

                <Title level={5} style={{ marginTop: '16px' }}>How We Use Your Information</Title>
                <Text>
                    We use your information to provide and improve our services, personalize your experience, communicate with you about properties
                    and services, and comply with legal obligations.
                </Text>

                <Title level={4} style={{ marginTop: '24px' }}>Terms of Service</Title>
                <Text>
                    By using BeTheLand Real Estate services, you agree to these terms. You must be at least 18 years old to use our services.
                    You are responsible for maintaining the confidentiality of your account and password.
                </Text>
            </div>
        </Modal>
    );

    if (showSpinner) {
        return (
            <ConfigProvider theme={theme}>
                <Layout style={{
                    minHeight: '100vh',
                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Content style={{
                        padding: '20px',
                        width: '100%',
                        maxWidth: '450px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Card
                            style={{
                                borderRadius: '16px',
                                boxShadow: '0 8px 32px rgba(27, 60, 83, 0.12)',
                                border: '1px solid #e2e8f0',
                                width: '100%'
                            }}
                            bodyStyle={{
                                padding: '60px 32px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Spin
                                size="large"
                                indicator={
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        border: '4px solid #f0f0f0',
                                        borderTop: '4px solid #1B3C53',
                                        borderRadius: '50%',
                                        animation: 'spin 1s linear infinite'
                                    }} />
                                }
                                style={{
                                    marginBottom: '24px'
                                }}
                            />
                            <Title level={3} style={{
                                color: '#1B3C53',
                                margin: 0,
                                textAlign: 'center'
                            }}>
                                Setting up your account...
                            </Title>
                            <Text style={{
                                color: '#64748b',
                                textAlign: 'center',
                                marginTop: '8px'
                            }}>
                                Preparing your real estate services dashboard
                            </Text>
                        </Card>
                    </Content>
                </Layout>
                <style>
                    {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    `}
                </style>
            </ConfigProvider>
        );
    }

    if (completed) {
        return (
            <ConfigProvider theme={theme}>
                <Layout style={{
                    minHeight: '100vh',
                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Content style={{ padding: '20px', width: '100%', maxWidth: '500px' }}>
                        <Card
                            style={{
                                borderRadius: '16px',
                                boxShadow: '0 8px 32px rgba(27, 60, 83, 0.12)',
                                border: '1px solid #e2e8f0'
                            }}
                            bodyStyle={{ padding: '40px 32px', textAlign: 'center' }}
                        >
                            <CheckCircleOutlined style={{
                                fontSize: '64px',
                                color: '#52c41a',
                                marginBottom: '20px'
                            }} />
                            <Title level={2} style={{
                                color: '#1B3C53',
                                margin: 0,
                                fontWeight: 600,
                                marginBottom: '16px'
                            }}>
                                Welcome to BeTheLand!
                            </Title>
                            <Text style={{
                                color: '#64748b',
                                display: 'block',
                                marginBottom: '20px',
                                fontSize: '16px'
                            }}>
                                Your real estate account has been successfully created.
                            </Text>
                            <div style={{
                                background: '#f0f9ff',
                                padding: '16px',
                                borderRadius: '8px',
                                marginBottom: '20px',
                                border: '1px solid #e6f7ff'
                            }}>
                                <SafetyCertificateOutlined style={{ color: '#1B3C53', marginRight: '8px' }} />
                                <Text strong style={{ color: '#1B3C53' }}>
                                    Premium Real Estate Services Activated
                                </Text>
                            </div>
                            <Text style={{
                                color: '#64748b',
                                display: 'block',
                                marginBottom: '30px'
                            }}>
                                Redirecting you to your personalized dashboard...
                            </Text>
                            <Spin size="large" />
                        </Card>
                    </Content>
                </Layout>
            </ConfigProvider>
        );
    }

    const infoSectionContent = (
        <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
            <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <StarOutlined style={{ color: '#1B3C53', fontSize: '16px', marginRight: '12px', marginTop: '2px' }} />
                    <div>
                        <Text strong style={{ color: '#1B3C53', display: 'block', marginBottom: '4px' }}>Personalized Matches</Text>
                        <Text style={{ color: '#64748b', fontSize: '14px' }}>
                            Get property recommendations tailored to your preferences.
                        </Text>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <TeamOutlined style={{ color: '#1B3C53', fontSize: '16px', marginRight: '12px', marginTop: '2px' }} />
                    <div>
                        <Text strong style={{ color: '#1B3C53', display: 'block', marginBottom: '4px' }}>Expert Agents</Text>
                        <Text style={{ color: '#64748b', fontSize: '14px' }}>
                            Connect with verified real estate professionals.
                        </Text>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <SafetyCertificateOutlined style={{ color: '#1B3C53', fontSize: '16px', marginRight: '12px', marginTop: '2px' }} />
                    <div>
                        <Text strong style={{ color: '#1B3C53', display: 'block', marginBottom: '4px' }}>Secure Platform</Text>
                        <Text style={{ color: '#64748b', fontSize: '14px' }}>
                            Your data and transactions are protected.
                        </Text>
                    </div>
                </div>
            </div>

            <Divider style={{ margin: '16px 0', borderColor: '#e2e8f0' }} />

            <div>
                <Text strong style={{ color: '#1B3C53', display: 'block', marginBottom: '12px' }}>
                    Password Requirements
                </Text>
                <div style={{ background: 'white', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <Text style={{ color: '#64748b', fontSize: '14px', display: 'block', marginBottom: '8px' }}>
                        For your security, your password must contain:
                    </Text>
                    <ul style={{ color: '#64748b', fontSize: '13px', margin: 0, paddingLeft: '20px' }}>
                        <li>At least 8 characters</li>
                        <li>One uppercase letter</li>
                        <li>One lowercase letter</li>
                        <li>One number</li>
                    </ul>
                </div>
            </div>

            <div style={{ marginTop: '16px', padding: '12px', background: '#1B3C53', borderRadius: '6px' }}>
                <Text style={{ color: 'white', fontSize: '12px' }}>
                    <SafetyCertificateOutlined style={{ marginRight: '6px' }} />
                    Your password is encrypted and stored securely.
                </Text>
            </div>
        </div>
    );

    return (
        <ConfigProvider theme={theme}>
            <Layout style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Content style={{ padding: '20px', width: '100%', maxWidth: '500px' }}>
                    <Card
                        style={{
                            borderRadius: '16px',
                            boxShadow: '0 8px 32px rgba(27, 60, 83, 0.12)',
                            border: '1px solid #e2e8f0'
                        }}
                        bodyStyle={{ padding: '32px' }}
                    >
                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                            <CrownOutlined style={{
                                fontSize: '48px',
                                color: '#1B3C53',
                                marginBottom: '16px',
                                background: '#f0f9ff',
                                padding: '12px',
                                borderRadius: '50%'
                            }} />
                            <Title level={2} style={{
                                color: '#1B3C53',
                                margin: 0,
                                fontWeight: 600,
                                fontSize: '24px'
                            }}>
                                BeTheLand Real Estate
                            </Title>
                            <Text style={{
                                color: '#64748b',
                                fontSize: '14px',
                                marginTop: '8px',
                                display: 'block'
                            }}>
                                Complete Your Account Setup
                            </Text>
                        </div>

                        <Collapse
                            ghost
                            style={{
                                marginBottom: '20px',
                                background: '#f8fafc',
                                borderRadius: '8px'
                            }}
                            expandIconPosition="end"
                            expandIcon={({ isActive }) =>
                                isActive ?
                                    <UpOutlined style={{ color: '#1B3C53' }} /> :
                                    <DownOutlined style={{ color: '#1B3C53' }} />
                            }
                        >
                            <Panel
                                header={
                                    <Text strong style={{ color: '#1B3C53' }}>
                                        <CrownOutlined style={{ marginRight: '8px' }} />
                                        Premium Benefits & Security
                                    </Text>
                                }
                                key="1"
                                style={{
                                    border: 'none'
                                }}
                            >
                                {infoSectionContent}
                            </Panel>
                        </Collapse>

                        <Form form={form} onFinish={onFinish} layout="vertical">
                            <Form.Item
                                name="username"
                                label="Username"
                                rules={[
                                    { required: true, message: 'Please choose a username!' },
                                    { min: 3, message: 'Username must be at least 3 characters!' },
                                    { max: 20, message: 'Username must not exceed 20 characters!' },
                                    { pattern: /^[a-zA-Z0-9_]+$/, message: 'Username can only contain letters, numbers, and underscores!' }
                                ]}
                            >
                                <Input
                                    prefix={<UserOutlined style={{ color: '#64748b' }} />}
                                    placeholder="Choose your username"
                                    size="large"
                                    style={{
                                        borderRadius: '8px',
                                        height: '48px'
                                    }}
                                />
                            </Form.Item>

                            <Form.Item
                                name="password"
                                label="Password"
                                rules={[
                                    { required: true, message: 'Please input your password!' },
                                    { min: 8, message: 'Password must be at least 8 characters!' },
                                    { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number!' }
                                ]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined style={{ color: '#64748b' }} />}
                                    placeholder="Create a secure password"
                                    size="large"
                                    style={{
                                        borderRadius: '8px',
                                        height: '48px'
                                    }}
                                />
                            </Form.Item>

                            <Form.Item
                                name="confirmPassword"
                                label="Confirm Password"
                                dependencies={['password']}
                                rules={[
                                    { required: true, message: 'Please confirm your password!' },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('password') === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('The two passwords do not match!'));
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined style={{ color: '#64748b' }} />}
                                    placeholder="Confirm your password"
                                    size="large"
                                    style={{
                                        borderRadius: '8px',
                                        height: '48px'
                                    }}
                                />
                            </Form.Item>

                            <Form.Item
                                name="agreement"
                                valuePropName="checked"
                                rules={[
                                    {
                                        validator: (_, value) =>
                                            value ? Promise.resolve() : Promise.reject(new Error('You must accept the privacy policy and terms of service')),
                                    },
                                ]}
                            >
                                <Checkbox>
                                    I agree to the{' '}
                                    <Link onClick={showPrivacyPolicy} style={{ color: '#1B3C53' }}>
                                        Privacy Policy and Terms of Service
                                    </Link>
                                    {' '}of BeTheLand Real Estate Services
                                </Checkbox>
                            </Form.Item>

                            <Form.Item style={{ marginBottom: 0 }}>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    style={{
                                        width: '100%',
                                        height: '48px',
                                        borderRadius: '8px',
                                        fontSize: '16px',
                                        fontWeight: 600,
                                        marginTop: '8px'
                                    }}
                                    icon={<SafetyCertificateOutlined />}
                                >
                                    Activate Real Estate Account
                                </Button>
                            </Form.Item>
                        </Form>

                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                            <Text style={{ color: '#64748b', fontSize: '12px' }}>
                                Step 4 of 4: Email Verification → OTP Verification → Basic Information → Account Setup
                            </Text>
                        </div>

                        <div style={{
                            textAlign: 'center',
                            marginTop: '24px',
                            paddingTop: '16px',
                            borderTop: '1px solid #f1f5f9'
                        }}>
                            <Text style={{ color: '#64748b', fontSize: '12px', lineHeight: '1.4' }}>
                                By continuing, you agree to our{' '}
                                <Link style={{ fontSize: '12px' }}>Terms of Use</Link>{' '}
                                and acknowledge our{' '}
                                <Link style={{ fontSize: '12px' }}>Privacy Policy</Link>
                            </Text>
                        </div>
                    </Card>

                    <PrivacyPolicyModal />
                </Content>
            </Layout>
        </ConfigProvider>
    );
};

export default AccountSetup;