import React, { useState } from 'react';
import {
    UserOutlined,
    PhoneOutlined,
    LoadingOutlined,
    InfoCircleOutlined,
    SafetyOutlined,
    HeartOutlined,
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
    Select,
    message,
    Divider,
    Collapse,
    Layout,
    ConfigProvider
} from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Link } = Typography;
const { Option } = Select;
const { Panel } = Collapse;
const { Content } = Layout;

const BasicInformation = () => {
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

    const onFinish = async (values) => {
        setShowSpinner(true);
        setLoading(true);

        try {
            // Store all form data including middle name and suffix
            localStorage.setItem('basicInfo_firstName', values.firstName);
            localStorage.setItem('basicInfo_middleName', values.middleName || '');
            localStorage.setItem('basicInfo_lastName', values.lastName);
            localStorage.setItem('basicInfo_suffix', values.suffix || '');
            localStorage.setItem('basicInfo_phone', values.phone);
            localStorage.setItem('basicInfo_gender', values.gender);

            // Clean up any address fields that might exist from previous sessions
            localStorage.removeItem('basicInfo_country');
            localStorage.removeItem('basicInfo_city');
            localStorage.removeItem('basicInfo_street');
            localStorage.removeItem('basicInfo_zipCode');

            message.success('Basic information saved successfully!');
            navigate('/register/account-setup');
        } catch (error) {
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
                                Saving your information...
                            </Title>
                            <Text style={{
                                color: '#64748b',
                                textAlign: 'center',
                                marginTop: '8px'
                            }}>
                                Preparing your account setup
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
                    <HeartOutlined style={{ color: '#1B3C53', fontSize: '16px', marginRight: '12px', marginTop: '2px' }} />
                    <div>
                        <Text strong style={{ color: '#1B3C53', display: 'block', marginBottom: '4px' }}>Personalized Experience</Text>
                        <Text style={{ color: '#64748b', fontSize: '14px' }}>
                            We use your information to tailor property recommendations and services to your specific needs.
                        </Text>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <TeamOutlined style={{ color: '#1B3C53', fontSize: '16px', marginRight: '12px', marginTop: '2px' }} />
                    <div>
                        <Text strong style={{ color: '#1B3C53', display: 'block', marginBottom: '4px' }}>Better Agent Matching</Text>
                        <Text style={{ color: '#64748b', fontSize: '14px' }}>
                            Connect you with verified agents who understand your preferences and requirements.
                        </Text>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <SafetyOutlined style={{ color: '#1B3C53', fontSize: '16px', marginRight: '12px', marginTop: '2px' }} />
                    <div>
                        <Text strong style={{ color: '#1B3C53', display: 'block', marginBottom: '4px' }}>Secure & Private</Text>
                        <Text style={{ color: '#64748b', fontSize: '14px' }}>
                            Your data is protected with enterprise-grade security and will never be shared without your consent.
                        </Text>
                    </div>
                </div>
            </div>

            <Divider style={{ margin: '16px 0', borderColor: '#e2e8f0' }} />

            <div>
                <Text strong style={{ color: '#1B3C53', display: 'block', marginBottom: '12px' }}>
                    What's Next?
                </Text>
                <div style={{ background: 'white', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <Text style={{ color: '#64748b', fontSize: '14px', display: 'block', marginBottom: '8px' }}>
                        After completing this step, you'll set up your account credentials and gain access to:
                    </Text>
                    <ul style={{ color: '#64748b', fontSize: '13px', margin: 0, paddingLeft: '20px' }}>
                        <li>Personalized property alerts</li>
                        <li>Agent matching services</li>
                        <li>Market insights and trends</li>
                        <li>Virtual property tours</li>
                    </ul>
                </div>
            </div>

            <div style={{ marginTop: '16px', padding: '12px', background: '#1B3C53', borderRadius: '6px' }}>
                <Text style={{ color: 'white', fontSize: '12px' }}>
                    <SafetyOutlined style={{ marginRight: '6px' }} />
                    Your information is encrypted and secure. We comply with all data protection regulations.
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
                            <UserOutlined style={{
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
                                Basic Information
                            </Title>
                            <Text style={{
                                color: '#64748b',
                                fontSize: '14px',
                                marginTop: '8px',
                                display: 'block'
                            }}>
                                Complete your profile to unlock personalized real estate services
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
                                        <InfoCircleOutlined style={{ marginRight: '8px' }} />
                                        Why We Need This Information
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
                            {/* First Name Field */}
                            <Form.Item
                                name="firstName"
                                label="First Name"
                                tooltip="Your legal first name as it appears on official documents"
                                rules={[{ required: true, message: 'Please input your first name!' }]}
                            >
                                <Input
                                    prefix={<UserOutlined style={{ color: '#64748b' }} />}
                                    placeholder="Enter your first name"
                                    size="large"
                                    style={{
                                        borderRadius: '8px',
                                        height: '48px'
                                    }}
                                />
                            </Form.Item>

                            {/* Middle Name Field */}
                            <Form.Item
                                name="middleName"
                                label="Middle Name"
                                tooltip="Your middle name (optional)"
                            >
                                <Input
                                    placeholder="Enter your middle name"
                                    size="large"
                                    style={{
                                        borderRadius: '8px',
                                        height: '48px'
                                    }}
                                />
                            </Form.Item>

                            {/* Last Name Field */}
                            <Form.Item
                                name="lastName"
                                label="Last Name"
                                tooltip="Your legal last name as it appears on official documents"
                                rules={[{ required: true, message: 'Please input your last name!' }]}
                            >
                                <Input
                                    placeholder="Enter your last name"
                                    size="large"
                                    style={{
                                        borderRadius: '8px',
                                        height: '48px'
                                    }}
                                />
                            </Form.Item>

                            {/* Suffix Field */}
                            <Form.Item
                                name="suffix"
                                label="Suffix"
                                tooltip="e.g., Jr., Sr., III, etc. (optional)"
                            >
                                <Select
                                    placeholder="Select suffix"
                                    size="large"
                                    style={{
                                        borderRadius: '8px'
                                    }}
                                    allowClear
                                >
                                    <Option value="Jr.">Jr.</Option>
                                    <Option value="Sr.">Sr.</Option>
                                    <Option value="II">II</Option>
                                    <Option value="III">III</Option>
                                    <Option value="IV">IV</Option>
                                </Select>
                            </Form.Item>

                            {/* Phone Number Field - FIXED WITH VALIDATION */}
                            <Form.Item
                                name="phone"
                                label="Phone Number"
                                tooltip="Verified agents will contact you at this number"
                                rules={[
                                    { required: true, message: 'Please input your phone number!' },
                                    {
                                        pattern: /^[0-9]{11}$/,
                                        message: 'Phone number must be exactly 11 digits!'
                                    }
                                ]}
                            >
                                <Input
                                    prefix={<PhoneOutlined style={{ color: '#64748b' }} />}
                                    placeholder="Enter your 11-digit phone number"
                                    size="large"
                                    maxLength={11}
                                    style={{
                                        borderRadius: '8px',
                                        height: '48px'
                                    }}
                                />
                            </Form.Item>

                            {/* Gender Field */}
                            <Form.Item
                                name="gender"
                                label="Gender"
                                tooltip="Used for demographic analysis to improve our services"
                                rules={[{ required: true, message: 'Please select your gender!' }]}
                            >
                                <Select
                                    placeholder="Select your gender"
                                    size="large"
                                    style={{
                                        borderRadius: '8px'
                                    }}
                                >
                                    <Option value="male">Male</Option>
                                    <Option value="female">Female</Option>
                                    <Option value="other">Other</Option>
                                    <Option value="prefer-not-to-say">Prefer not to say</Option>
                                </Select>
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
                                    Continue to Account Setup
                                </Button>
                            </Form.Item>
                        </Form>

                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                            <Text style={{ color: '#64748b', fontSize: '12px' }}>
                                Step 3 of 4: Email Verification → OTP Verification → Basic Information → Account Setup
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

export default BasicInformation;