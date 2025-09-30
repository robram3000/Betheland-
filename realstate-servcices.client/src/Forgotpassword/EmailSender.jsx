// EmailSender.jsx
import React, { useState } from 'react';
import {
    MailOutlined,
    LoadingOutlined,
    SafetyOutlined,
    ClockCircleOutlined,
    LockOutlined,
    DownOutlined,
    UpOutlined
} from '@ant-design/icons';
import {
    Card,
    Button,
    Typography,
    Spin,
    message,
    Form,
    Input,
    Divider,
    Collapse,
    Layout,
    ConfigProvider
} from 'antd';
import { useNavigate } from 'react-router-dom';

import { forgotPasswordService } from './Services/ForgotPasswordService';

const { Title, Text, Link } = Typography;
const { Panel } = Collapse;
const { Content } = Layout;

const EmailSender = () => {
    const [loading, setLoading] = useState(false);
    const [showSpinner, setShowSpinner] = useState(false);
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const theme = {
        token: {
            colorPrimary: '#1B3C53',
            borderRadius: 8,
        },
    };

    const handleSendEmail = async (values) => {
        setShowSpinner(true);
        setLoading(true);

        try {
            // Step 1: Verify email exists in database
            const emailVerification = await forgotPasswordService.verifyEmail(values.email);

            if (emailVerification.success) {
                // Step 2: Generate OTP for password reset
                const otpResult = await forgotPasswordService.generatePasswordResetOTP(values.email);

                if (otpResult.success) {
                    localStorage.setItem('resetPasswordEmail', values.email);
                    localStorage.setItem('resetPasswordStep', 'otp-verification');
                    message.success('Password reset OTP sent successfully!');
                    navigate('/forgot-password/verify-otp');
                }
            }
        } catch (error) {
            console.error('Password reset initiation error:', error);
            message.error(error.message || 'Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
            setShowSpinner(false);
        }
    };

    // If spinner is showing, render only the spinner overlay
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
                                Sending reset code...
                            </Title>
                            <Text style={{
                                color: '#64748b',
                                textAlign: 'center',
                                marginTop: '8px'
                            }}>
                                Please wait while we send the verification code
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

    const infoSectionContent = (
        <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
            <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <SafetyOutlined style={{ color: '#1B3C53', fontSize: '16px', marginRight: '12px', marginTop: '2px' }} />
                    <div>
                        <Text strong style={{ color: '#1B3C53', display: 'block', marginBottom: '4px' }}>Two-Step Verification</Text>
                        <Text style={{ color: '#64748b', fontSize: '14px' }}>
                            We'll send a verification code to your email for security.
                        </Text>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <ClockCircleOutlined style={{ color: '#1B3C53', fontSize: '16px', marginRight: '12px', marginTop: '2px' }} />
                    <div>
                        <Text strong style={{ color: '#1B3C53', display: 'block', marginBottom: '4px' }}>Quick Process</Text>
                        <Text style={{ color: '#64748b', fontSize: '14px' }}>
                            Reset your password in just a few minutes.
                        </Text>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <LockOutlined style={{ color: '#1B3C53', fontSize: '16px', marginRight: '12px', marginTop: '2px' }} />
                    <div>
                        <Text strong style={{ color: '#1B3C53', display: 'block', marginBottom: '4px' }}>Account Protection</Text>
                        <Text style={{ color: '#64748b', fontSize: '14px' }}>
                            Ensure only you can access your real estate account.
                        </Text>
                    </div>
                </div>
            </div>

            <Divider style={{ margin: '16px 0', borderColor: '#e2e8f0' }} />

            <div>
                <Text strong style={{ color: '#1B3C53', display: 'block', marginBottom: '12px' }}>
                    What to Expect
                </Text>
                <div style={{ background: 'white', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <Text style={{ color: '#64748b', fontSize: '14px', display: 'block', marginBottom: '8px' }}>
                        After submitting your email:
                    </Text>
                    <ul style={{ color: '#64748b', fontSize: '13px', margin: 0, paddingLeft: '20px' }}>
                        <li>Receive a 6-digit verification code</li>
                        <li>Verify your identity</li>
                        <li>Create a new secure password</li>
                        <li>Regain access to your account</li>
                    </ul>
                </div>
            </div>

            <div style={{ marginTop: '16px', padding: '12px', background: '#1B3C53', borderRadius: '6px' }}>
                <Text style={{ color: 'white', fontSize: '12px' }}>
                    <SafetyOutlined style={{ marginRight: '6px' }} />
                    We prioritize the security of your real estate data and transactions.
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
                        {/* Header */}
                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                            <LockOutlined style={{
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
                                Reset Your Password
                            </Title>
                            <Text style={{
                                color: '#64748b',
                                fontSize: '14px',
                                marginTop: '8px',
                                display: 'block'
                            }}>
                                Enter your email to receive a password reset code
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
                                        <SafetyOutlined style={{ marginRight: '8px' }} />
                                        Secure Password Reset
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
                        <Form form={form} onFinish={handleSendEmail} layout="vertical">
                            <Form.Item
                                name="email"
                                label="Email Address"
                                rules={[
                                    { required: true, message: 'Please input your email!' },
                                    { type: 'email', message: 'Please enter a valid email!' }
                                ]}
                            >
                                <Input
                                    prefix={<MailOutlined style={{ color: '#64748b' }} />}
                                    placeholder="Enter your registered email address"
                                    size="large"
                                    style={{
                                        borderRadius: '8px',
                                        height: '48px'
                                    }}
                                />
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
                                >
                                    Send Reset Code
                                </Button>
                            </Form.Item>
                        </Form>

                        {/* Back to Login */}
                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                            <Button
                                type="link"
                                onClick={() => navigate('/login')}
                                style={{ color: '#1B3C53', fontWeight: 600, fontSize: '14px' }}
                            >
                                ← Back to Login
                            </Button>
                        </div>

                        {/* Progress Indicator */}
                        <div style={{ textAlign: 'center', marginTop: '15px' }}>
                            <Text style={{ color: '#64748b', fontSize: '12px' }}>
                                Step 1 of 3: Email Verification → OTP Verification → Password Reset
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
                </Content>
            </Layout>
        </ConfigProvider>
    );
};

export default EmailSender;