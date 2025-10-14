import BethelandIcon from '../assets/Betheland.png';
import React, { useState } from 'react';
import {
    Card,
    Form,
    Input,
    Button,
    Checkbox,
    Typography,
    message,
    Layout,
    ConfigProvider,
    Spin,
    Alert
} from 'antd';
import {
    UserOutlined,
    LockOutlined
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUser } from './Services/UserContextService';
import authService from './Services/LoginAuth';

const { Title, Text, Link } = Typography;
const { Content } = Layout;

const AuthPage = () => {
    const [loading, setLoading] = useState(false);
    const [showSpinner, setShowSpinner] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [error, setError] = useState('');

    const { login: contextLogin } = useUser();

    const theme = {
        token: {
            colorPrimary: '#1B3C53',
            borderRadius: 8,
        },
    };

    const getRedirectPath = (userRole) => {
        let role;

        if (typeof userRole === 'object') {
            role = userRole?.role || userRole?.userType || userRole?.roleType;
        } else {
            role = userRole;
        }

        const normalizedRole = role?.toString().toLowerCase();

        switch (normalizedRole) {
            case 'agent':
            case 'realestateagent':
                return '/portal/agent/all-properties';

            case 'admin':
            case 'administrator':
                return '/portal/admin';

            case 'superadmin':
            case 'super_admin':
            case 'super administrator':
                return '/portal/super-admin';

            case 'client':
            case 'customer':
            case 'buyer':
                return '/properties';

            default:
                return '/properties';
        }
    };

    const onFinish = async (values) => {
        setShowSpinner(true);
        setLoading(true);
        setError('');

        try {
            const result = await contextLogin(values.usernameOrEmail, values.password, values.rememberMe);

            if (result.success) {
                message.success('Welcome back to BeTheLand!');

                // Get user data directly from the context
                const currentUser = authService.getCurrentUser();

                // Use the user data from the login response directly
                const userRole = result.data?.userType || currentUser?.role || currentUser?.userType;
                const redirectPath = getRedirectPath(userRole);

                const returnUrl = searchParams.get('returnUrl');
                const finalDestination = returnUrl || redirectPath;

                // Add a small delay to ensure context is updated
                setTimeout(() => {
                    navigate(finalDestination, { replace: true });
                }, 100);

            } else {
                setError(result.message || 'Login failed');
                message.error(result.message || 'Login failed');
            }
        } catch (error) {
            console.error('❌ Login catch error:', error);
            const errorMsg = error?.message || 'Something went wrong. Please try again.';
            setError(errorMsg);
            message.error(errorMsg);
        } finally {
            setLoading(false);
            setShowSpinner(false);
        }
    };

    const handleForgotPassword = () => {
        navigate('/forgot-password/verify-email');
    };

    const handleSignUp = () => {
        navigate('/register/verify-email');
    };

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
                                Signing you in...
                            </Title>
                            <Text style={{
                                color: '#64748b',
                                textAlign: 'center',
                                marginTop: '8px'
                            }}>
                                Please wait while we sign you in
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
                {/* Enhanced Silver Animated Background */}
                <div className="silver-background">
                    {/* Silver Grid - More Visible */}
                    <div className="silver-grid-overlay"></div>

                    {/* Silver Property Dots - More Visible */}
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

                    {/* Silver Location Pins - More Visible */}
                    <div className="silver-location-pin" style={{ top: '20%', left: '15%' }}>📍</div>
                    <div className="silver-location-pin" style={{ top: '60%', right: '25%' }}>📍</div>
                    <div className="silver-location-pin" style={{ top: '40%', left: '80%' }}>📍</div>

                    {/* Silver Building Outlines - More Visible */}
                    <div className="silver-building-outline"></div>
                </div>

                {/* CSS Styles for Enhanced Silver Background */}
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

                    /* Enhanced Silver Grid */
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

                    /* Enhanced Silver Property Dots */
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

                    /* Enhanced Silver Location Pin */
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

                    /* Enhanced Silver Building Outline */
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
                    }

                    .silver-building-outline::before,
                    .silver-building-outline::after {
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
                    padding: '20px',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    zIndex: 1
                }}>
                    <Card
                        style={{
                            borderRadius: '16px',
                            boxShadow: '0 8px 32px rgba(27, 60, 83, 0.15)',
                            border: '1px solid #e2e8f0',
                            width: '100%',
                            maxWidth: '450px',
                            backgroundColor: 'rgba(255, 255, 255, 0.92)',
                            backdropFilter: 'blur(8px)'
                        }}
                        bodyStyle={{ padding: '32px' }}
                    >
                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <img
                                src={BethelandIcon}
                                alt="BeTheLand"
                                style={{
                                    height: '180px',
                                    objectFit: 'contain'
                                }}
                            />
                            <Text style={{
                                color: '#64748b',
                                fontSize: '16px',
                                display: 'block'
                            }}>
                                Sign in to your account
                            </Text>
                        </div>

                        {error && (
                            <Alert
                                message="Login Error"
                                description={error}
                                type="error"
                                showIcon
                                style={{
                                    marginBottom: '16px',
                                    borderRadius: '8px'
                                }}
                            />
                        )}

                        <Form
                            form={form}
                            name="login"
                            onFinish={onFinish}
                            layout="vertical"
                            size="large"
                            disabled={loading}
                        >
                            <Form.Item
                                name="usernameOrEmail"
                                rules={[
                                    { required: true, message: 'Please enter your username or email' }
                                ]}
                            >
                                <Input
                                    prefix={<UserOutlined style={{ color: '#64748b' }} />}
                                    placeholder="Username or email"
                                    disabled={loading}
                                />
                            </Form.Item>

                            <Form.Item
                                name="password"
                                rules={[{ required: true, message: 'Please enter your password' }]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined style={{ color: '#64748b' }} />}
                                    placeholder="Password"
                                    disabled={loading}
                                />
                            </Form.Item>

                            <Form.Item>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Form.Item name="rememberMe" valuePropName="checked" noStyle>
                                        <Checkbox disabled={loading}>Remember me</Checkbox>
                                    </Form.Item>
                                    <Link
                                        style={{ fontSize: '14px' }}
                                        onClick={handleForgotPassword}
                                        disabled={loading}
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                            </Form.Item>

                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    style={{
                                        width: '100%',
                                        height: '48px',
                                        borderRadius: '8px',
                                        fontSize: '16px',
                                        fontWeight: 600
                                    }}
                                >
                                    {loading ? 'Signing In...' : 'Sign In'}
                                </Button>
                            </Form.Item>

                            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                                <Text style={{ color: '#64748b' }}>
                                    Don't have an account?{' '}
                                    <Link
                                        style={{ fontWeight: 600 }}
                                        onClick={handleSignUp}
                                        disabled={loading}
                                    >
                                        Sign up
                                    </Link>
                                </Text>
                            </div>
                        </Form>

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
                </Content>
            </Layout>
        </ConfigProvider>
    );
};

export default AuthPage;