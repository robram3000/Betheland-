// Updated ProfilePage.jsx - Enhanced Profile Picture Display
import React, { useState, useEffect } from 'react';
import {
    Card,
    Row,
    Col,
    Form,
    Input,
    Button,
    Select,
    Upload,
    Avatar,
    Divider,
    Tabs,
    message,
    Spin,
    Typography,
    Modal,
    Steps
} from 'antd';
import {
    UserOutlined,
    CameraOutlined,
    SaveOutlined,
    LockOutlined,
    MailOutlined,
    PhoneOutlined,
    EnvironmentOutlined,
    HomeOutlined,
    SafetyOutlined,
    MailOutlined as MailIcon
} from '@ant-design/icons';
import useProfile from './Services/useProfile';
import { otpService } from '../Register/Services/otpService';
import { forgotPasswordService } from '../Forgotpassword/Services/ForgotPasswordService';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { Step } = Steps;

const ProfilePage = () => {
    const {
        loading,
        updating,
        profileData,
        error,
        getProfile,
        updateProfile,
        changePassword,
        uploadProfilePicture
    } = useProfile();

    const [form] = Form.useForm();
    const [passwordForm] = Form.useForm();
    const [activeTab, setActiveTab] = useState('profile');
    const [profileImageError, setProfileImageError] = useState(false);

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

    useEffect(() => {
        getProfile();
    }, [getProfile]);

    useEffect(() => {
        console.log('📥 Profile data received:', profileData);
        if (profileData) {
            form.setFieldsValue({
                firstName: profileData.firstName,
                lastName: profileData.lastName,
                middleName: profileData.middleName,
                suffix: profileData.suffix,
                email: profileData.email,
                cellPhoneNo: profileData.cellPhoneNo,
                country: profileData.country,
                city: profileData.city,
                street: profileData.street,
                address: profileData.address,
                zipCode: profileData.zipCode,
                gender: profileData.gender,
            });
            console.log('🔄 Form fields set with address:', profileData.address);
        }
    }, [profileData, form]);


    const handleProfileUpdate = async (values) => {
        const result = await updateProfile(values);
        if (result.success) {
            message.success('Profile updated successfully!');
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
            email: profileData?.email || '',
            newPassword: values.newPassword,
            confirmPassword: values.confirmPassword,
            currentPassword: values.currentPassword,
            otpCode: ''
        });

        // Show OTP modal and start verification process
        setOtpModalVisible(true);
        setOtpStep(0);
        setOtpVerified(false);
    };

    const requestOTP = async () => {
        if (!profileData?.email) {
            message.error('Email not found');
            return;
        }

        setOtpLoading(true);
        try {
            await otpService.generateOTP(profileData.email);
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
        if (!profileData?.email) {
            message.error('Email not found');
            return;
        }

        setOtpLoading(true);
        try {
            await otpService.verifyOTP(profileData.email, values.otpCode);
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
                passwordForm.resetFields();
                setOtpVerified(false);
                setOtpStep(0);

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
        } finally {
            setOtpLoading(false);
        }
    };

    const resendOTP = async () => {
        if (!profileData?.email) {
            message.error('Email not found');
            return;
        }

        setOtpLoading(true);
        try {
            await otpService.resendOTP(profileData.email);
            message.success('OTP resent to your email!');
        } catch (error) {
            console.error('OTP resend error:', error);
            message.error('Failed to resend OTP. Please try again.');
        } finally {
            setOtpLoading(false);
        }
    };

    const handleProfilePictureUpload = async (file) => {
        const result = await uploadProfilePicture(file);
        if (result.success) {
            message.success('Profile picture updated successfully!');
            setProfileImageError(false);
        }
        return false;
    };

    const handleImageError = () => {
        setProfileImageError(true);
    };
    const processImageUrl = (url) => {
        if (!url || typeof url !== 'string' || url.trim() === '') {
            return null;
        }

        if (url.startsWith('http') || url.startsWith('//') || url.startsWith('blob:')) {
            return url;
        }

        if (url.startsWith('/uploads/')) {
            return `https://localhost:7080${url}`;
        }

        if (url.includes('.') && !url.startsWith('/')) {
            return `https://localhost:7075/uploads/profile-pictures/${url}`;
        }

        if (url.startsWith('uploads/')) {
            return `https://localhost:7075/${url}`;
        }

        return null;
    };

    const getProfilePictureUrl = () => {
        if (profileData?.profilePicture) {
            return processImageUrl(profileData.profilePicture);
        }
        return null;
    };

    const uploadProps = {
        beforeUpload: handleProfilePictureUpload,
        showUploadList: false,
        accept: 'image/*'
    };

    const getUserInitials = () => {
        if (profileData) {
            const { firstName, lastName } = profileData;
            const first = firstName?.[0] || '';
            const last = lastName?.[0] || '';
            return `${first}${last}`.toUpperCase();
        }
        return 'U';
    };

    if (loading && !profileData) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                <Spin size="large" />
            </div>
        );
    }

    const profilePictureUrl = getProfilePictureUrl();

    return (
        <div className="profile-page">
            <div className="profile-container">
                <Row justify="center">
                    <Col xs={24} sm={22} md={20} lg={18} xl={16} style={{ maxWidth: '600px' }}>
                        <Card
                            className="profile-card"
                            bodyStyle={{ padding: '16px' }}
                            style={{ margin: '16px 0' }}
                        >
                            {/* Enhanced Profile Picture Section */}
                            <div className="profile-header" style={{ textAlign: 'center', marginBottom: '12px' }}>
                                <div className="avatar-section">
                                    <Upload {...uploadProps}>
                                        <div className="avatar-upload" style={{
                                            display: 'inline-block',
                                            position: 'relative',
                                            cursor: 'pointer'
                                        }}>
                                            <Avatar
                                                size={80}
                                                icon={<UserOutlined />}
                                                src={profilePictureUrl && !profileImageError ? profilePictureUrl : null}
                                                onError={handleImageError}
                                                style={{
                                                    backgroundColor: (!profilePictureUrl || profileImageError) ? '#f0f2f5' : 'transparent',
                                                    border: '2px solid #1B3C53',
                                                    fontSize: '24px',
                                                    fontWeight: '600'
                                                }}
                                            >
                                                {(!profilePictureUrl || profileImageError) && getUserInitials()}
                                            </Avatar>
                                            <div className="avatar-overlay" style={{
                                                position: 'absolute',
                                                bottom: 0,
                                                right: 0,
                                                background: 'rgba(0,0,0,0.6)',
                                                borderRadius: '50%',
                                                width: '24px',
                                                height: '24px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                border: '2px solid white'
                                            }}>
                                                <CameraOutlined style={{ color: 'white', fontSize: '12px' }} />
                                            </div>
                                        </div>
                                    </Upload>
                                    <div className="user-info" style={{ marginTop: '12px' }}>
                                        <Title level={4} style={{ margin: '4px 0', color: '#1B3C53' }}>
                                            {profileData?.firstName} {profileData?.lastName} {profileData?.suffix && profileData.suffix}
                                        </Title>
                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                            <MailOutlined /> {profileData?.email}
                                        </Text>
                                        <br />
                                        <Text type="secondary" style={{ fontSize: '11px', color: '#666' }}>
                                            Click the camera icon to update profile picture
                                        </Text>
                                    </div>
                                </div>
                            </div>

                            <Divider style={{ margin: '16px 0' }} />

                            {/* Tabs Section */}
                            <Tabs
                                activeKey={activeTab}
                                onChange={setActiveTab}
                                className="profile-tabs"
                                size="small"
                            >
                                {/* Profile Information Tab */}
                                <TabPane tab="Profile" key="profile">
                                    <Form
                                        form={form}
                                        layout="vertical"
                                        onFinish={handleProfileUpdate}
                                        className="profile-form"
                                    >
                                        <Divider style={{ margin: '0 0 12px 0' }}>
                                            <Text strong style={{ color: '#1B3C53', fontSize: '12px' }}>
                                                <UserOutlined /> Personal Information
                                            </Text>
                                        </Divider>

                                        {/* Name Fields */}
                                        <Row gutter={[8, 8]}>
                                            <Col xs={24} sm={6}>
                                                <Form.Item
                                                    label={<span style={{ fontSize: '12px' }}>First Name</span>}
                                                    name="firstName"
                                                    rules={[{ required: true, message: 'Please enter first name' }]}
                                                    style={{ marginBottom: '8px' }}
                                                >
                                                    <Input
                                                        size="large"
                                                        placeholder="First name"
                                                        style={{ height: '60px', fontSize: '16px' }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} sm={6}>
                                                <Form.Item
                                                    label={<span style={{ fontSize: '12px' }}>Middle</span>}
                                                    name="middleName"
                                                    style={{ marginBottom: '8px' }}
                                                >
                                                    <Input
                                                        size="large"
                                                        placeholder="Middle"
                                                        style={{ height: '60px', fontSize: '16px' }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} sm={6}>
                                                <Form.Item
                                                    label={<span style={{ fontSize: '12px' }}>Last Name</span>}
                                                    name="lastName"
                                                    rules={[{ required: true, message: 'Please enter last name' }]}
                                                    style={{ marginBottom: '8px' }}
                                                >
                                                    <Input
                                                        size="large"
                                                        placeholder="Last name"
                                                        style={{ height: '60px', fontSize: '16px' }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} sm={6}>
                                                <Form.Item
                                                    label={<span style={{ fontSize: '12px' }}>Suffix</span>}
                                                    name="suffix"
                                                    style={{ marginBottom: '8px' }}
                                                >
                                                    <Select
                                                        placeholder="Suffix"
                                                        size="large"
                                                        dropdownStyle={{ fontSize: '12px' }}
                                                        style={{ height: '60px' }}
                                                    >
                                                        <Option value="Jr.">Jr.</Option>
                                                        <Option value="Sr.">Sr.</Option>
                                                        <Option value="II">II</Option>
                                                        <Option value="III">III</Option>
                                                        <Option value="IV">IV</Option>
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        {/* Contact Info */}
                                        <Row gutter={[8, 8]}>
                                            <Col xs={24} sm={12}>
                                                <Form.Item
                                                    label={<span style={{ fontSize: '12px' }}>Email</span>}
                                                    name="email"
                                                    style={{ marginBottom: '8px' }}
                                                >
                                                    <Input
                                                        size="large"
                                                        placeholder="Email"
                                                        disabled
                                                        style={{ height: '60px', fontSize: '16px' }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} sm={12}>
                                                <Form.Item
                                                    label={<span style={{ fontSize: '12px' }}>Phone</span>}
                                                    name="cellPhoneNo"
                                                    style={{ marginBottom: '8px' }}
                                                >
                                                    <Input
                                                        size="large"
                                                        placeholder="Phone"
                                                        style={{ height: '60px', fontSize: '16px' }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        <Form.Item
                                            label={<span style={{ fontSize: '12px' }}>Gender</span>}
                                            name="gender"
                                            style={{ marginBottom: '12px' }}
                                        >
                                            <Select
                                                placeholder="Gender"
                                                size="large"
                                                dropdownStyle={{ fontSize: '12px' }}
                                                style={{ height: '60px' }}
                                            >
                                                <Option value="male">Male</Option>
                                                <Option value="female">Female</Option>
                                                <Option value="other">Other</Option>
                                            </Select>
                                        </Form.Item>

                                        <Divider style={{ margin: '12px 0' }}>
                                            <Text strong style={{ color: '#1B3C53', fontSize: '12px' }}>
                                                <HomeOutlined /> Location Information
                                            </Text>
                                        </Divider>

                                        {/* Location Fields */}
                                        <Row gutter={[8, 8]}>
                                            <Col xs={24} sm={6}>
                                                <Form.Item
                                                    label={<span style={{ fontSize: '12px' }}>Country</span>}
                                                    name="country"
                                                    style={{ marginBottom: '8px' }}
                                                >
                                                    <Input
                                                        size="large"
                                                        placeholder="Country"
                                                        style={{ height: '60px', fontSize: '16px' }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} sm={6}>
                                                <Form.Item
                                                    label={<span style={{ fontSize: '12px' }}>City</span>}
                                                    name="city"
                                                    style={{ marginBottom: '8px' }}
                                                >
                                                    <Input
                                                        size="large"
                                                        placeholder="City"
                                                        style={{ height: '60px', fontSize: '16px' }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} sm={6}>
                                                <Form.Item
                                                    label={<span style={{ fontSize: '12px' }}>Street</span>}
                                                    name="street"
                                                    style={{ marginBottom: '8px' }}
                                                >
                                                    <Input
                                                        size="large"
                                                        placeholder="Street"
                                                        style={{ height: '60px', fontSize: '16px' }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} sm={6}>
                                                <Form.Item
                                                    label={<span style={{ fontSize: '12px' }}>ZIP Code</span>}
                                                    name="zipCode"
                                                    style={{ marginBottom: '8px' }}
                                                >
                                                    <Input
                                                        size="large"
                                                        placeholder="ZIP"
                                                        style={{ height: '60px', fontSize: '16px' }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        {/* Address Field */}
                                        <Form.Item
                                            label={<span style={{ fontSize: '12px' }}>Address</span>}
                                            name="address"
                                            style={{ marginBottom: '12px' }}
                                        >
                                            <Input.TextArea
                                                size="large"
                                                placeholder="Full address"
                                                rows={3}
                                                showCount
                                                maxLength={200}
                                                style={{
                                                    fontSize: '16px',
                                                    minHeight: '60px',
                                                    resize: 'vertical'
                                                }}
                                            />
                                        </Form.Item>

                                        <Divider style={{ margin: '12px 0' }} />

                                        <Form.Item style={{ marginBottom: 0 }}>
                                            <Button
                                                type="primary"
                                                htmlType="submit"
                                                icon={<SaveOutlined />}
                                                size="large"
                                                loading={updating}
                                                style={{
                                                    height: '50px',
                                                    fontSize: '16px',
                                                    padding: '0 24px',
                                                    backgroundColor: '#1B3C53',
                                                    borderColor: '#1B3C53'
                                                }}
                                            >
                                                Update Profile
                                            </Button>
                                        </Form.Item>
                                    </Form>
                                </TabPane>

                                {/* Change Password Tab with OTP Verification */}
                                <TabPane tab="Password" key="password">
                                    <Form
                                        form={passwordForm}
                                        layout="vertical"
                                        onFinish={initiatePasswordChange}
                                        className="password-form"
                                    >
                                        <Divider style={{ margin: '0 0 12px 0' }}>
                                            <Text strong style={{ color: '#1B3C53', fontSize: '12px' }}>
                                                <LockOutlined /> Change Password
                                            </Text>
                                        </Divider>

                                        <Form.Item
                                            label={<span style={{ fontSize: '14px' }}>Current Password</span>}
                                            name="currentPassword"
                                            rules={[{ required: true, message: 'Please enter current password' }]}
                                            style={{ marginBottom: '16px' }}
                                        >
                                            <Input.Password
                                                size="large"
                                                placeholder="Current password"
                                                style={{
                                                    height: '60px',
                                                    fontSize: '16px'
                                                }}
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            label={<span style={{ fontSize: '14px' }}>New Password</span>}
                                            name="newPassword"
                                            rules={[
                                                { required: true, message: 'Please enter new password' },
                                                { min: 8, message: 'Password must be at least 8 characters' }
                                            ]}
                                            style={{ marginBottom: '16px' }}
                                        >
                                            <Input.Password
                                                size="large"
                                                placeholder="New password"
                                                style={{
                                                    height: '60px',
                                                    fontSize: '16px'
                                                }}
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            label={<span style={{ fontSize: '14px' }}>Confirm New Password</span>}
                                            name="confirmPassword"
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
                                            style={{ marginBottom: '16px' }}
                                        >
                                            <Input.Password
                                                size="large"
                                                placeholder="Confirm new password"
                                                style={{
                                                    height: '60px',
                                                    fontSize: '16px'
                                                }}
                                            />
                                        </Form.Item>

                                        <Form.Item style={{ marginBottom: 0 }}>
                                            <Button
                                                type="primary"
                                                htmlType="submit"
                                                icon={<SafetyOutlined />}
                                                size="large"
                                                loading={updating}
                                                style={{
                                                    height: '50px',
                                                    fontSize: '16px',
                                                    padding: '0 24px',
                                                    backgroundColor: '#1B3C53',
                                                    borderColor: '#1B3C53',
                                                    width: '100%'
                                                }}
                                            >
                                                Verify & Change Password
                                            </Button>
                                        </Form.Item>

                                        <Text type="secondary" style={{
                                            fontSize: '12px',
                                            display: 'block',
                                            textAlign: 'center',
                                            marginTop: '12px'
                                        }}>
                                            You will need to verify via OTP before changing your password
                                        </Text>
                                    </Form>
                                </TabPane>

                            </Tabs>

                            {error && (
                                <div className="error-message" style={{ marginTop: '8px' }}>
                                    <Text type="danger" style={{ fontSize: '11px' }}>{error}</Text>
                                </div>
                            )}
                        </Card>
                    </Col>
                </Row>
            </div>

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
                            icon={<MailIcon />}
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
                                    width: '100%',
                                    height: '50px',
                                    fontSize: '16px'
                                }}
                            >
                                Send OTP to {profileData?.email}
                            </Button>
                        </div>
                    </div>
                )}

                {otpStep === 1 && (
                    <Form
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
                                    height: '60px'
                                }}
                            />
                        </Form.Item>

                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
                            <Button
                                onClick={resendOTP}
                                loading={otpLoading}
                                disabled={otpLoading}
                                size="large"
                                style={{ height: '50px', fontSize: '14px' }}
                            >
                                Resend OTP
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={otpLoading}
                                size="large"
                                style={{
                                    backgroundColor: '#1a365d',
                                    borderColor: '#1a365d',
                                    height: '50px',
                                    fontSize: '14px'
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
                                width: '100%',
                                height: '50px',
                                fontSize: '16px'
                            }}
                        >
                            Change Password Now
                        </Button>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ProfilePage;