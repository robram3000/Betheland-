import React, { useState, useEffect } from 'react';
import {
    SafetyCertificateOutlined,
    LoadingOutlined,
    MailOutlined,
    LockOutlined,
    ClockCircleOutlined,
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
    Collapse,
    Layout,
    ConfigProvider
} from 'antd';
import { useNavigate } from 'react-router-dom';
import RegisterAccountServices from './Services/RegisterAccountServices';

const { Title, Text, Link } = Typography;
const { Panel } = Collapse;
const { Content } = Layout;

const OTPVerification = () => {
    const [loading, setLoading] = useState(false);
    const [showSpinner, setShowSpinner] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const theme = {
        token: {
            colorPrimary: '#1B3C53',
            borderRadius: 8,
        },
    };

    useEffect(() => {
        const storedEmail = localStorage.getItem('verificationEmail');
        if (!storedEmail) {
            message.warning('Please verify your email first');
            navigate('/verify-email');
            return;
        }
        setEmail(storedEmail);
    }, [navigate]);

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [timeLeft]);

    const onFinish = async (values) => {
        setShowSpinner(true);
        setLoading(true);

        try {
            const result = await RegisterAccountServices.verifyOTP(email, values.otp);

            if (result.success) {
                message.success('OTP verified successfully!');
                localStorage.setItem('otpVerified', 'true');
                localStorage.setItem('otpCode', values.otp);
                navigate('/register/basic-info');
            } else {
                message.error(result.message || 'OTP verification failed. Please try again.');
            }
        } catch (error) {
            message.error('OTP verification failed. Please try again.');
        } finally {
            setLoading(false);
            setShowSpinner(false);
        }
    };

    const handleResendOTP = async () => {
        setResendLoading(true);
        try {
            const result = await RegisterAccountServices.resendOTP(email);

            if (result.success) {
                setTimeLeft(600); // Reset timer
                message.success('OTP sent successfully!');
            } else {
                message.error(result.message || 'Failed to resend OTP. Please try again.');
            }
        } catch (error) {
            message.error('Failed to resend OTP. Please try again.');
        } finally {
            setResendLoading(false);
        }
    };

    const handleBackToEmail = () => {
        localStorage.removeItem('verificationEmail');
        navigate('/verify-email');
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
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
                                Verifying OTP...
                            </Title>
                            <Text style={{
                                color: '#64748b',
                                textAlign: 'center',
                                marginTop: '8px'
                            }}>
                                Please wait while we verify your code
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
                    <SafetyCertificateOutlined style={{ color: '#1B3C53', fontSize: '16px', marginRight: '12px', marginTop: '2px' }} />
                    <div>
                        <Text strong style={{ color: '#1B3C53', display: 'block', marginBottom: '4px' }}>One-Time Password</Text>
                        <Text style={{ color: '#64748b', fontSize: '14px' }}>
                            This code is unique to your session and expires for security.
                        </Text>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <ClockCircleOutlined style={{ color: '#1B3C53', fontSize: '16px', marginRight: '12px', marginTop: '2px' }} />
                    <div>
                        <Text strong style={{ color: '#1B3C53', display: 'block', marginBottom: '4px' }}>Time Sensitive</Text>
                        <Text style={{ color: '#64748b', fontSize: '14px' }}>
                            Code expires in 10 minutes. You can request a new code if needed.
                        </Text>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <LockOutlined style={{ color: '#1B3C53', fontSize: '16px', marginRight: '12px', marginTop: '2px' }} />
                    <div>
                        <Text strong style={{ color: '#1B3C53', display: 'block', marginBottom: '4px' }}>Secure Verification</Text>
                        <Text style={{ color: '#64748b', fontSize: '14px' }}>
                            Protects your account from unauthorized access.
                        </Text>
                    </div>
                </div>
            </div>

            <Divider style={{ margin: '16px 0', borderColor: '#e2e8f0' }} />

            <div style={{ background: 'white', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                <Text strong style={{ color: '#1B3C53', display: 'block', marginBottom: '8px' }}>
                    <MailOutlined style={{ marginRight: '8px' }} />
                    Email Sent To:
                </Text>
                <Text style={{ color: '#64748b', display: 'block', wordBreak: 'break-all', marginBottom: '8px' }}>
                    {email}
                </Text>
                <Button
                    type="link"
                    size="small"
                    onClick={handleBackToEmail}
                    style={{ padding: 0, height: 'auto', fontWeight: '400', color: '#1B3C53' }}
                >
                    Change email address
                </Button>
            </div>

            <div style={{ padding: '12px', background: '#1B3C53', borderRadius: '6px' }}>
                <Text style={{ color: 'white', fontSize: '12px' }}>
                    <LockOutlined style={{ marginRight: '6px' }} />
                    Never share your OTP with anyone. BeTheLand will never ask for your code.
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
                            <SafetyCertificateOutlined style={{
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
                                Enter Verification Code
                            </Title>
                            <Text style={{
                                color: '#64748b',
                                fontSize: '14px',
                                marginTop: '8px',
                                display: 'block'
                            }}>
                                We've sent a 6-digit verification code to your email
                            </Text>
                        </div>

                        <div style={{
                            textAlign: 'center',
                            marginBottom: '20px',
                            padding: '12px',
                            background: '#fff7e6',
                            borderRadius: '8px',
                            border: '1px solid #ffd591'
                        }}>
                            <ClockCircleOutlined style={{ color: '#fa8c16', fontSize: '16px', marginRight: '8px' }} />
                            <Text strong style={{ color: '#fa8c16' }}>
                                Code expires in: {formatTime(timeLeft)}
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
                                        <LockOutlined style={{ marginRight: '8px' }} />
                                        OTP Security Information
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
                                name="otp"
                                label="6-Digit Verification Code"
                                rules={[
                                    { required: true, message: 'Please input the OTP code!' },
                                    { len: 6, message: 'OTP must be 6 digits!' }
                                ]}
                            >
                                <Input.OTP
                                    length={6}
                                    size="large"
                                    style={{ justifyContent: 'center' }}
                                    inputStyle={{
                                        width: '45px',
                                        height: '45px',
                                        fontSize: '18px',
                                        borderRadius: '8px',
                                        border: '1px solid #d9d9d9'
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
                                    Verify OTP
                                </Button>
                            </Form.Item>
                        </Form>

                        <Divider style={{ borderColor: '#e2e8f0', margin: '20px 0' }} />

                        <div style={{ textAlign: 'center' }}>
                            <Text style={{ color: '#64748b', fontSize: '14px', display: 'block', marginBottom: '12px' }}>
                                Didn't receive the code?
                            </Text>
                            <Button
                                type="link"
                                style={{ color: '#1B3C53', height: 'auto', fontWeight: 600, fontSize: '14px' }}
                                onClick={handleResendOTP}
                                loading={resendLoading}
                                disabled={resendLoading || timeLeft > 540}
                            >
                                Resend OTP {timeLeft > 540 ? `(available in ${formatTime(timeLeft - 540)})` : ''}
                            </Button>
                        </div>

                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                            <Text style={{ color: '#64748b', fontSize: '12px' }}>
                                Step 2 of 4: Email Verification → OTP Verification → Basic Information → Account Setup
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
                </Content>
            </Layout>
        </ConfigProvider>
    );
};

export default OTPVerification;