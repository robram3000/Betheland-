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

    const onFinish = async (values) => {
        setShowSpinner(true);
        setLoading(true);

        try {
            const email = localStorage.getItem('verificationEmail');
            const otpCode = localStorage.getItem('otpCode');

            const basicInfo = {
                firstName: localStorage.getItem('basicInfo_firstName'),
                middleName: localStorage.getItem('basicInfo_middleName'),
                lastName: localStorage.getItem('basicInfo_lastName'),
                suffix: localStorage.getItem('basicInfo_suffix'),
                phone: localStorage.getItem('basicInfo_phone'),
                gender: localStorage.getItem('basicInfo_gender')
            };

            const registrationData = {
                email: email,
                username: values.username,
                password: values.password,
                firstName: basicInfo.firstName || '',
                middleName: basicInfo.middleName || '',
                lastName: basicInfo.lastName || '',
                suffix: basicInfo.suffix || '',
                cellPhoneNo: basicInfo.phone || '',
                gender: basicInfo.gender || '',
                country: '',
                city: '',
                street: '',
                zipCode: '',
                otpCode: otpCode
            };

            const result = await RegisterAccountServices.registerClient(registrationData);

            if (result.success) {
                setCompleted(true);
                message.success('Account setup completed successfully! Welcome to BeTheLand Real Estate!');

                const keysToRemove = [
                    'verificationEmail',
                    'otpVerified',
                    'otpCode',
                    'basicInfo_firstName',
                    'basicInfo_middleName',
                    'basicInfo_lastName',
                    'basicInfo_suffix',
                    'basicInfo_phone',
                    'basicInfo_gender'
                ];

                keysToRemove.forEach(key => localStorage.removeItem(key));

                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                message.error(result.message || 'Registration failed. Please try again.');
            }
        } catch (error) {
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
                    background: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Silver Background */}
                    <div className="silver-background">
                        <div className="silver-grid-overlay"></div>
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div
                                key={`silver-dot-${i}`}
                                className="silver-property-dot"
                                style={{
                                    left: `${10 + i * 12}%`,
                                    top: `${20 + (i * 8) % 60}%`,
                                    animationDelay: `${i * 1.5}s`
                                }}
                            />
                        ))}
                        <div className="silver-location-pin" style={{ top: '20%', left: '15%' }}>📍</div>
                        <div className="silver-location-pin" style={{ top: '60%', right: '25%' }}>📍</div>
                        <div className="silver-location-pin" style={{ top: '40%', left: '80%' }}>📍</div>
                        <div className="silver-building-outline"></div>
                    </div>

                    <Content style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100vh',
                        padding: '20px'
                    }}>
                        <Card
                            style={{
                                borderRadius: '16px',
                                boxShadow: '0 8px 32px rgba(27, 60, 83, 0.12)',
                                border: '1px solid #e2e8f0',
                                width: '100%',
                                maxWidth: '450px',
                                backgroundColor: 'rgba(255, 255, 255, 0.92)',
                                backdropFilter: 'blur(8px)'
                            }}
                            bodyStyle={{
                                padding: '60px 32px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center'
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
                    background: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Silver Background */}
                    <div className="silver-background">
                        <div className="silver-grid-overlay"></div>
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div
                                key={`silver-dot-${i}`}
                                className="silver-property-dot"
                                style={{
                                    left: `${10 + i * 12}%`,
                                    top: `${20 + (i * 8) % 60}%`,
                                    animationDelay: `${i * 1.5}s`
                                }}
                            />
                        ))}
                        <div className="silver-location-pin" style={{ top: '20%', left: '15%' }}>📍</div>
                        <div className="silver-location-pin" style={{ top: '60%', right: '25%' }}>📍</div>
                        <div className="silver-location-pin" style={{ top: '40%', left: '80%' }}>📍</div>
                        <div className="silver-building-outline"></div>
                    </div>

                    <Content style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100vh',
                        padding: '20px'
                    }}>
                        <Card
                            style={{
                                borderRadius: '16px',
                                boxShadow: '0 8px 32px rgba(27, 60, 83, 0.12)',
                                border: '1px solid #e2e8f0',
                                width: '100%',
                                maxWidth: '500px',
                                backgroundColor: 'rgba(255, 255, 255, 0.92)',
                                backdropFilter: 'blur(8px)'
                            }}
                            bodyStyle={{
                                padding: '40px',
                                textAlign: 'center'
                            }}
                        >
                            <CheckCircleOutlined style={{
                                fontSize: '64px',
                                color: '#52c41a',
                                marginBottom: '24px'
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
                                fontSize: '16px',
                                display: 'block',
                                marginBottom: '32px',
                                lineHeight: '1.6'
                            }}>
                                Your real estate account has been successfully created. You can now log in with your new credentials.
                            </Text>
                            <Button
                                type="primary"
                                size="large"
                                onClick={() => navigate('/login')}
                                style={{
                                    height: '48px',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    fontWeight: 600,
                                    padding: '0 32px'
                                }}
                            >
                                Continue to Login
                            </Button>
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
                    <ul style={{ color: '#64748b', fontSize: '13px', margin: 0, paddingLeft: '20px' }}>
                        <li>At least 8 characters long</li>
                        <li>One uppercase letter (A-Z)</li>
                        <li>One lowercase letter (a-z)</li>
                        <li>One number (0-9)</li>
                        <li>No spaces allowed</li>
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
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Silver Background */}
                <div className="silver-background">
                    <div className="silver-grid-overlay"></div>
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div
                            key={`silver-dot-${i}`}
                            className="silver-property-dot"
                            style={{
                                left: `${10 + i * 12}%`,
                                top: `${20 + (i * 8) % 60}%`,
                                animationDelay: `${i * 1.5}s`
                            }}
                        />
                    ))}
                    <div className="silver-location-pin" style={{ top: '20%', left: '15%' }}>📍</div>
                    <div className="silver-location-pin" style={{ top: '60%', right: '25%' }}>📍</div>
                    <div className="silver-location-pin" style={{ top: '40%', left: '80%' }}>📍</div>
                    <div className="silver-building-outline"></div>
                </div>

                {/* CSS Styles for Silver Background */}
                <style>
                    {`
                    .silver-background {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        pointer-events: none;
                        background: white;
                    }

                    .silver-grid-overlay {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background-image: 
                            linear-gradient(rgba(192, 192, 192, 0.15) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(192, 192, 192, 0.15) 1px, transparent 1px);
                        background-size: 40px 40px;
                        animation: silverGridMove 25s linear infinite;
                    }

                    @keyframes silverGridMove {
                        0% {
                            transform: translate(0, 0);
                        }
                        100% {
                            transform: translate(40px, 40px);
                        }
                    }

                    .silver-property-dot {
                        position: absolute;
                        width: 8px;
                        height: 8px;
                        background: rgba(128, 128, 128, 0.4);
                        border-radius: 50%;
                        animation: silverDotPulse 3s ease-in-out infinite;
                        box-shadow: 0 0 10px rgba(192, 192, 192, 0.3);
                    }

                    @keyframes silverDotPulse {
                        0%, 100% {
                            transform: scale(1);
                            opacity: 0.4;
                        }
                        50% {
                            transform: scale(1.8);
                            opacity: 0.7;
                        }
                    }

                    .silver-location-pin {
                        position: absolute;
                        font-size: 28px;
                        animation: silverPinFloat 8s ease-in-out infinite;
                        opacity: 0.3;
                        filter: grayscale(1) brightness(0.8);
                    }

                    @keyframes silverPinFloat {
                        0%, 100% {
                            transform: translateY(0px) rotate(0deg);
                        }
                        25% {
                            transform: translateY(-15px) rotate(5deg);
                        }
                        50% {
                            transform: translateY(-5px) rotate(-5deg);
                        }
                        75% {
                            transform: translateY(-10px) rotate(3deg);
                        }
                    }

                    .silver-building-outline {
                        position: absolute;
                        bottom: 0;
                        left: 5%;
                        width: 90%;
                        height: 120px;
                        border-top: 2px solid rgba(192, 192, 192, 0.3);
                        background: linear-gradient(transparent, rgba(192, 192, 192, 0.1));
                    }

                    .silver-building-outline::before {
                        content: '';
                        position: absolute;
                        top: -100px;
                        left: 15%;
                        width: 80px;
                        height: 100px;
                        border: 2px solid rgba(192, 192, 192, 0.3);
                        border-bottom: none;
                        animation: buildingGlow 4s ease-in-out infinite alternate;
                    }

                    .silver-building-outline::after {
                        content: '';
                        position: absolute;
                        top: -150px;
                        right: 25%;
                        width: 60px;
                        height: 150px;
                        border: 2px solid rgba(192, 192, 192, 0.3);
                        border-bottom: none;
                        animation: buildingGlow 4s ease-in-out infinite alternate;
                    }

                    @keyframes buildingGlow {
                        0% {
                            opacity: 0.3;
                        }
                        100% {
                            opacity: 0.6;
                        }
                    }
                    `}
                </style>

                <Content style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    padding: '20px'
                }}>
                    <Card
                        style={{
                            borderRadius: '16px',
                            boxShadow: '0 8px 32px rgba(27, 60, 83, 0.12)',
                            border: '1px solid #e2e8f0',
                            width: '100%',
                            maxWidth: '500px',
                            backgroundColor: 'rgba(255, 255, 255, 0.92)',
                            backdropFilter: 'blur(8px)'
                        }}
                        bodyStyle={{ padding: '32px' }}
                    >
                        {/* Header */}
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

                        {/* Information Dropdown */}
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

                        {/* Form */}
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

                        {/* Progress Indicator */}
                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                            <Text style={{ color: '#64748b', fontSize: '12px' }}>
                                Step 4 of 4: Email Verification → OTP Verification → Basic Information → Account Setup
                            </Text>
                        </div>

                        {/* Footer Terms */}
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