import BethelandIcon from '../assets/Betheland.png';

// AuthPage.jsx
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
    Spin
} from 'antd';
import {
    UserOutlined,
    LockOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import authService from './Services/LoginAuth';

const { Title, Text, Link } = Typography;
const { Content } = Layout;

const AuthPage = () => {
    const [loading, setLoading] = useState(false);
    const [showSpinner, setShowSpinner] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();

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
            const result = await authService.login(values.usernameOrEmail, values.password);

            if (result.success) {
                message.success('Welcome back to BeTheLand!');
                navigate('/properties');
            } else {
                message.error(result.message || 'Invalid credentials. Please try again.');
            }
        } catch (error) {
            console.error('Login error:', error);
            message.error('Something went wrong. Please try again.');
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
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Content style={{
                    padding: '20px',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Card
                        style={{
                            borderRadius: '16px',
                            boxShadow: '0 8px 32px rgba(27, 60, 83, 0.12)',
                            border: '1px solid #e2e8f0',
                            width: '100%',
                            maxWidth: '450px'
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

                        <Form
                            form={form}
                            name="login"
                            onFinish={onFinish}
                            layout="vertical"
                            size="large"
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
                                />
                            </Form.Item>

                            <Form.Item
                                name="password"
                                rules={[{ required: true, message: 'Please enter your password' }]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined style={{ color: '#64748b' }} />}
                                    placeholder="Password"
                                />
                            </Form.Item>

                            <Form.Item>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Checkbox>Remember me</Checkbox>
                                    <Link
                                        style={{ fontSize: '14px' }}
                                        onClick={handleForgotPassword}
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
                                    Sign In
                                </Button>
                            </Form.Item>

                            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                                <Text style={{ color: '#64748b' }}>
                                    Don't have an account?{' '}
                                    <Link
                                        style={{ fontWeight: 600 }}
                                        onClick={handleSignUp}
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