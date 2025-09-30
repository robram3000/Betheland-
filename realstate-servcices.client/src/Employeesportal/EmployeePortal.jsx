// AuthPage.jsx
import React, { useState } from 'react';
import {
    Card,
    Form,
    Input,
    Button,
    Typography,
    message,
    Layout,
    ConfigProvider,
    Spin,
    Checkbox
} from 'antd';
import {
    UserOutlined,
    LockOutlined,
    CrownOutlined,
    TeamOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import authService from './Services/LoginAuth';
import BethelandIcon from '../assets/Betheland.png';

const { Title, Text, Link } = Typography;
const { Content } = Layout;

const EmployeePortal = () => {
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
                        bodyStyle={{ padding: '40px 32px' }}
                    >
                        {/* Logo Section */}
                        <div style={{
                            textAlign: 'center',
                            marginBottom: '10px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}>
                            <img
                                src={BethelandIcon}
                                alt="BeTheLand"
                                style={{
                                    width: '180px',
                                    height: '180px',
                                 
                                    borderRadius: '8px'
                                }}
                            />
                        </div>

                        {/* Employees Only Notice */}
                        <div style={{
                            background: '#fff3cd',
                            border: '1px solid #ffeaa7',
                            borderRadius: '8px',
                            padding: '12px 16px',
                            marginBottom: '24px',
                            textAlign: 'center'
                        }}>
                            <TeamOutlined style={{
                                color: '#856404',
                                marginRight: '8px'
                            }} />
                            <Text strong style={{
                                color: '#856404',
                                fontSize: '14px'
                            }}>
                                EMPLOYEES ONLY
                            </Text>
                            <Text style={{
                                color: '#856404',
                                fontSize: '12px',
                                display: 'block',
                                marginTop: '4px'
                            }}>
                                This portal is restricted to authorized BeTheLand employees only
                            </Text>
                        </div>

                        <Form
                            form={form}
                            name="login"
                            onFinish={onFinish}
                            layout="vertical"
                            size="large"
                            initialValues={{ remember: true }}
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
                                    style={{ textAlign: 'center' }}
                                />
                            </Form.Item>

                            <Form.Item
                                name="password"
                                rules={[{ required: true, message: 'Please enter your password' }]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined style={{ color: '#64748b' }} />}
                                    placeholder="Password"
                                    style={{ textAlign: 'center' }}
                                />
                            </Form.Item>

                            <Form.Item name="remember" valuePropName="checked">
                                <Checkbox
                                    style={{
                                        fontSize: '14px',
                                        color: '#64748b'
                                    }}
                                >
                                    Remember me
                                </Checkbox>
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
                                        fontWeight: 600,
                                        marginTop: '8px'
                                    }}
                                >
                                    Sign In
                                </Button>
                            </Form.Item>
                        </Form>

                        <div style={{
                            textAlign: 'center',
                            marginTop: '24px',
                            paddingTop: '24px',
                            borderTop: '1px solid #f1f5f9'
                        }}>
                            <Text style={{
                                color: '#64748b',
                                fontSize: '12px',
                                lineHeight: '1.4',
                                display: 'block'
                            }}>
                                Restricted access for authorized personnel only
                            </Text>
                        </div>
                    </Card>
                </Content>
            </Layout>
        </ConfigProvider>
    );
};

export default EmployeePortal;