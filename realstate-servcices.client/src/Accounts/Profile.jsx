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
    Typography
} from 'antd';
import {
    UserOutlined,
    CameraOutlined,
    SaveOutlined,
    LockOutlined,
    MailOutlined,
    PhoneOutlined,
    EnvironmentOutlined,
    HomeOutlined
} from '@ant-design/icons';
import useProfile from './Services/useProfile';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

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
            console.log('🔄 Form fields set with address:', profileData.address); // Debug log
        }
    }, [profileData, form]);


    const handleProfileUpdate = async (values) => {
        const result = await updateProfile(values);
        if (result.success) {
            message.success('Profile updated successfully!');
        }
    };

    const handlePasswordChange = async (values) => {
        if (values.newPassword !== values.confirmPassword) {
            message.error('New passwords do not match!');
            return;
        }

        const result = await changePassword({
            currentPassword: values.currentPassword,
            newPassword: values.newPassword
        });

        if (result.success) {
            message.success('Password changed successfully!');
            passwordForm.resetFields();
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

    // Process image URL similar to GlobalNavigation
    const processImageUrl = (url) => {
        if (!url || typeof url !== 'string' || url.trim() === '') {
            return null;
        }

        // If it's already a full URL, return as is
        if (url.startsWith('http') || url.startsWith('//') || url.startsWith('blob:')) {
            return url;
        }

        // Handle different path formats
        if (url.startsWith('/uploads/')) {
            return `https://localhost:7075${url}`;
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
                                                        size="small"
                                                        placeholder="First name"
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
                                                        size="small"
                                                        placeholder="Middle"
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
                                                        size="small"
                                                        placeholder="Last name"
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
                                                        size="small"
                                                        dropdownStyle={{ fontSize: '12px' }}
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
                                                        size="small"
                                                        placeholder="Email"
                                                        disabled
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
                                                        size="small"
                                                        placeholder="Phone"
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
                                                size="small"
                                                dropdownStyle={{ fontSize: '12px' }}
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
                                                        size="small"
                                                        placeholder="Country"
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
                                                        size="small"
                                                        placeholder="City"
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
                                                        size="small"
                                                        placeholder="Street"
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
                                                        size="small"
                                                        placeholder="ZIP"
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
                                                size="small"
                                                placeholder="Full address"
                                                rows={2}
                                                showCount
                                                maxLength={200}
                                                style={{ fontSize: '12px' }}
                                            />
                                        </Form.Item>

                                        <Divider style={{ margin: '12px 0' }} />

                                        <Form.Item style={{ marginBottom: 0 }}>
                                            <Button
                                                type="primary"
                                                htmlType="submit"
                                                icon={<SaveOutlined />}
                                                size="small"
                                                loading={updating}
                                                style={{
                                                    height: '28px',
                                                    fontSize: '11px',
                                                    padding: '0 12px',
                                                    backgroundColor: '#1B3C53',
                                                    borderColor: '#1B3C53'
                                                }}
                                            >
                                                Update Profile
                                            </Button>
                                        </Form.Item>
                                    </Form>
                                </TabPane>

                                {/* Change Password Tab - Commented Out */}
                                {/*
                                <TabPane tab="Password" key="password">
                                    <Form
                                        form={passwordForm}
                                        layout="vertical"
                                        onFinish={handlePasswordChange}
                                        className="password-form"
                                    >
                                        <Divider style={{ margin: '0 0 12px 0' }}>
                                            <Text strong style={{ color: '#1B3C53', fontSize: '12px' }}>
                                                <LockOutlined /> Change Password
                                            </Text>
                                        </Divider>

                                        <Form.Item
                                            label={<span style={{ fontSize: '12px' }}>Current Password</span>}
                                            name="currentPassword"
                                            rules={[{ required: true, message: 'Please enter current password' }]}
                                            style={{ marginBottom: '8px' }}
                                        >
                                            <Input.Password
                                                size="small"
                                                placeholder="Current password"
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            label={<span style={{ fontSize: '12px' }}>New Password</span>}
                                            name="newPassword"
                                            rules={[
                                                { required: true, message: 'Please enter new password' },
                                                { min: 6, message: 'Min 6 characters' }
                                            ]}
                                            style={{ marginBottom: '8px' }}
                                        >
                                            <Input.Password
                                                size="small"
                                                placeholder="New password"
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            label={<span style={{ fontSize: '12px' }}>Confirm Password</span>}
                                            name="confirmPassword"
                                            rules={[
                                                { required: true, message: 'Please confirm password' },
                                                ({ getFieldValue }) => ({
                                                    validator(_, value) {
                                                        if (!value || getFieldValue('newPassword') === value) {
                                                            return Promise.resolve();
                                                        }
                                                        return Promise.reject(new Error('Passwords do not match'));
                                                    },
                                                }),
                                            ]}
                                            style={{ marginBottom: '12px' }}
                                        >
                                            <Input.Password
                                                size="small"
                                                placeholder="Confirm password"
                                            />
                                        </Form.Item>

                                        <Form.Item style={{ marginBottom: 0 }}>
                                            <Button
                                                type="primary"
                                                htmlType="submit"
                                                icon={<LockOutlined />}
                                                size="small"
                                                loading={updating}
                                                style={{
                                                    height: '28px',
                                                    fontSize: '11px',
                                                    padding: '0 12px',
                                                    backgroundColor: '#1B3C53',
                                                    borderColor: '#1B3C53'
                                                }}
                                            >
                                                Change Password
                                            </Button>
                                        </Form.Item>
                                    </Form>
                                </TabPane>
                                */}
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
        </div>
    );
};

export default ProfilePage;