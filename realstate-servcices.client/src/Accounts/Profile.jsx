// Profile.jsx
import React, { useState, useEffect } from 'react';
import { Card, Avatar, Descriptions, Button, Tag, Divider, Tabs, Form, Input, Modal, message, Alert, Spin } from 'antd';
import {
    UserOutlined,
    MailOutlined,
    CalendarOutlined,
    LockOutlined,
    SafetyOutlined,
    EyeInvisibleOutlined,
    EyeTwoTone,
    PhoneOutlined,
    IdcardOutlined,
    CrownOutlined,
    EditOutlined,
    SaveOutlined,
    CloseOutlined
} from '@ant-design/icons';

import { useUser } from '../Authpage/Services/UserContextService';
import useProfile from './Services/useProfile';

const { TabPane } = Tabs;

const ProfilePage = () => {
    const [activeTab, setActiveTab] = useState('1');
    const [profileForm] = Form.useForm();
    const [passwordForm] = Form.useForm();
    const [isOtpModalVisible, setIsOtpModalVisible] = useState(false);
    const [otpForm] = Form.useForm();
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [editingField, setEditingField] = useState(null);
    const [tempValues, setTempValues] = useState({});
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Use the UserContext and Profile hooks
    const { user, profile: contextProfile } = useUser();
    const {
        loading: profileLoading,
        updating,
        getProfile,
        updateProfile,
        updateField,
        changePassword,
        verifyOtp,
        resendOtp
    } = useProfile();

    // Fetch profile data when component mounts
    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                setLoading(true);
                const result = await getProfile();
                if (result.success) {
                    setProfileData(result.data);
                    // Set form initial values with real data
                    profileForm.setFieldsValue({
                        email: result.data.email,
                        firstName: result.data.firstName,
                        middleName: result.data.middleName,
                        lastName: result.data.lastName,
                        suffix: result.data.suffix,
                        cellPhoneNo: result.data.cellPhoneNo,
                        country: result.data.country,
                        city: result.data.city,
                        street: result.data.street,
                        zipCode: result.data.zipCode
                    });
                } else {
                    message.error(result.message || 'Failed to load profile');
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
                message.error('Failed to load profile data');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchProfileData();
        }
    }, [user, getProfile, profileForm]);

    // Update onProfileFinish to use real API
    const onProfileFinish = async (values) => {
        console.log('Profile update:', values);

        // Filter only modifiable fields for submission
        const modifiableData = {
            email: values.email,
            firstName: values.firstName,
            middleName: values.middleName,
            lastName: values.lastName,
            suffix: values.suffix,
            cellPhoneNo: values.cellPhoneNo,
            country: values.country,
            city: values.city,
            street: values.street,
            zipCode: values.zipCode
        };

        const result = await updateProfile(modifiableData);
        if (result.success) {
            // Update local state with new data
            setProfileData(prev => ({ ...prev, ...modifiableData }));
        }
    };

    // Update onPasswordFinish to use real API
    const onPasswordFinish = async (values) => {
        console.log('Password change initiated:', values);
        setIsChangingPassword(true);

        const result = await changePassword(values);
        if (result.success) {
            showOtpModal();
        } else {
            setIsChangingPassword(false);
        }
    };

    const showOtpModal = () => {
        setIsOtpModalVisible(true);
        message.info('OTP sent to your registered email/phone');
    };

    const handleOtpSubmit = async (values) => {
        console.log('OTP verification:', values);

        const result = await verifyOtp(values);
        if (result.success) {
            message.success('Password changed successfully!');
            setIsOtpModalVisible(false);
            setIsChangingPassword(false);
            passwordForm.resetFields();
            otpForm.resetFields();
        }
    };

    const handleOtpCancel = () => {
        setIsOtpModalVisible(false);
        setIsChangingPassword(false);
        otpForm.resetFields();
    };

    const handleResendOtp = async () => {
        const result = await resendOtp();
        if (result.success) {
            message.info('New OTP sent to your registered email/phone');
        }
    };

    // Helper to get full name
    const getFullName = () => {
        if (!profileData) return 'Loading...';
        return `${profileData.firstName || ''} ${profileData.middleName ? profileData.middleName + ' ' : ''}${profileData.lastName || ''}${profileData.suffix ? ' ' + profileData.suffix : ''}`.trim();
    };

    // Edit field functions - updated to use API
    const startEditing = (fieldName, currentValue) => {
        setEditingField(fieldName);
        setTempValues({
            ...tempValues,
            [fieldName]: currentValue
        });
    };

    const saveField = async (fieldName) => {
        const newValue = tempValues[fieldName];
        console.log(`Saving ${fieldName}:`, newValue);

        const result = await updateField(fieldName, newValue);
        if (result.success) {
            // Update form values
            const currentValues = profileForm.getFieldsValue();
            profileForm.setFieldsValue({
                ...currentValues,
                [fieldName]: newValue
            });

            // Update local state
            setProfileData(prev => ({
                ...prev,
                [fieldName]: newValue
            }));
        }

        setEditingField(null);
        setTempValues({});
    };

    const cancelEditing = () => {
        setEditingField(null);
        setTempValues({});
    };

    const handleTempValueChange = (fieldName, value) => {
        setTempValues({
            ...tempValues,
            [fieldName]: value
        });
    };

    // Loading state
    if (loading || profileLoading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '400px'
            }}>
                <Spin size="large" />
            </div>
        );
    }

    // Use real data from backend or fallback to context data
    const displayData = profileData || contextProfile || {};

    // Editable Field Component
    const EditableField = ({ fieldName, label, value, icon: Icon, type = 'text', rules = [] }) => {
        const isEditing = editingField === fieldName;
        const currentValue = isEditing ? tempValues[fieldName] : value;

        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 0',
                borderBottom: '1px solid #d9d9d9'
            }}>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                        {label}
                    </div>
                    {isEditing ? (
                        <Form.Item style={{ margin: 0 }} rules={rules}>
                            <Input
                                value={currentValue}
                                onChange={(e) => handleTempValueChange(fieldName, e.target.value)}
                                onPressEnter={() => saveField(fieldName)}
                                autoFocus
                                size="small"
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    ) : (
                        <div style={{
                            fontSize: '14px',
                            color: '#333',
                            padding: '4px 0',
                            minHeight: '24px'
                        }}>
                            {currentValue || 'Not set'}
                        </div>
                    )}
                </div>
                {!isEditing ? (
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => startEditing(fieldName, value)}
                        style={{
                            color: '#666',
                            opacity: 0.7,
                            transition: 'all 0.3s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = '1';
                            e.currentTarget.style.color = '#1890ff';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = '0.7';
                            e.currentTarget.style.color = '#666';
                        }}
                    />
                ) : (
                    <div style={{ display: 'flex', gap: '4px' }}>
                        <Button
                            type="text"
                            icon={<SaveOutlined />}
                            onClick={() => saveField(fieldName)}
                            style={{ color: '#52c41a' }}
                            size="small"
                            loading={updating}
                        />
                        <Button
                            type="text"
                            icon={<CloseOutlined />}
                            onClick={cancelEditing}
                            style={{ color: '#ff4d4f' }}
                            size="small"
                        />
                    </div>
                )}
            </div>
        );
    };

    return (
        <div style={{
            padding: '24px',
            maxWidth: '1000px',
            margin: '0 auto'
        }}>
            {/* OTP Verification Modal */}
            <Modal
                title="Verify OTP to Change Password"
                open={isOtpModalVisible}
                onCancel={handleOtpCancel}
                footer={null}
                centered
            >
                <div style={{ padding: '20px 0' }}>
                    <p style={{ marginBottom: '20px', color: '#666' }}>
                        For security reasons, please enter the 6-digit OTP sent to your registered email or phone number to complete the password change.
                    </p>

                    <Form
                        form={otpForm}
                        layout="vertical"
                        onFinish={handleOtpSubmit}
                    >
                        <Form.Item
                            label="Enter OTP"
                            name="otp"
                            rules={[
                                { required: true, message: 'Please input the OTP!' },
                                { len: 6, message: 'OTP must be 6 digits!' },
                                { pattern: /^\d+$/, message: 'OTP must contain only numbers!' }
                            ]}
                        >
                            <Input.OTP
                                length={6}
                                size="large"
                                style={{ justifyContent: 'center' }}
                            />
                        </Form.Item>

                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                            <Button type="link" onClick={handleResendOtp}>
                                Resend OTP
                            </Button>
                        </div>

                        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                            <Button
                                onClick={handleOtpCancel}
                                style={{ marginRight: '8px' }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={isChangingPassword}
                            >
                                Verify & Change Password
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </Modal>

            <Card
                style={{
                    boxShadow: '0 8px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 10px -2px rgba(0, 0, 0, 0.06)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1px solid #d9d9d9'
                }}
                bordered={false}
            >
                {/* Profile Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '32px',
                    background: 'linear-gradient(135deg, #1B3C53 0%, #2D5A7A 100%)',
                    color: 'white',
                    margin: '-24px -24px 0 -24px',
                    borderBottom: '1px solid #d9d9d9'
                }}>
                    <Avatar
                        size={80}
                        icon={<UserOutlined />}
                        src={displayData.profilePictureUrl}
                        style={{
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            border: '3px solid rgba(255,255,255,0.3)'
                        }}
                    />
                    <div style={{ marginLeft: '20px', flex: 1 }}>
                        <h2 style={{
                            color: 'white',
                            margin: '0 0 8px 0',
                            fontSize: '28px',
                            fontWeight: '600'
                        }}>
                            {getFullName()}
                        </h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                            <Tag
                                color="green"
                                style={{
                                    border: 'none',
                                    background: 'rgba(255,255,255,0.2)',
                                    color: 'white',
                                    fontWeight: '500'
                                }}
                            >
                                {displayData.status || 'Active'}
                            </Tag>
                            <span style={{ opacity: 0.9 }}>{displayData.role || user?.userType || 'User'}</span>
                            <span style={{ opacity: 0.7, fontSize: '12px' }}>@{displayData.username || user?.username}</span>
                        </div>
                    </div>
                </div>

                {/* Tabs Section */}
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    style={{ marginTop: '24px' }}
                    size="large"
                    items={[
                        {
                            key: '1',
                            label: (
                                <span>
                                    <UserOutlined style={{ marginRight: '8px' }} />
                                    Profile Information
                                </span>
                            ),
                            children: (
                                <div style={{ padding: '20px 0' }}>
                                    <Form
                                        form={profileForm}
                                        layout="vertical"
                                        onFinish={onProfileFinish}
                                    >
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: '1fr 1fr',
                                            gap: '16px',
                                            marginBottom: '24px'
                                        }}>
                                            {/* Personal Information */}
                                            <div style={{
                                                padding: '20px',
                                                borderRadius: '8px',
                                                border: '1px solid #d9d9d9'
                                            }}>
                                                <h3 style={{ marginBottom: '16px', color: '#1B3C53' }}>
                                                    <UserOutlined style={{ marginRight: '8px' }} />
                                                    Personal Information
                                                </h3>

                                                <EditableField
                                                    fieldName="firstName"
                                                    label="First Name"
                                                    value={displayData.firstName}
                                                    icon={UserOutlined}
                                                    rules={[{ required: true, message: 'First name is required' }]}
                                                />

                                                <EditableField
                                                    fieldName="middleName"
                                                    label="Middle Name"
                                                    value={displayData.middleName}
                                                />

                                                <EditableField
                                                    fieldName="lastName"
                                                    label="Last Name"
                                                    value={displayData.lastName}
                                                    rules={[{ required: true, message: 'Last name is required' }]}
                                                />

                                                <EditableField
                                                    fieldName="suffix"
                                                    label="Suffix"
                                                    value={displayData.suffix}
                                                />

                                                <EditableField
                                                    fieldName="cellPhoneNo"
                                                    label="Phone Number"
                                                    value={displayData.cellPhoneNo}
                                                    icon={PhoneOutlined}
                                                    rules={[{ required: true, message: 'Phone number is required' }]}
                                                />
                                            </div>

                                            {/* Address Information */}
                                            <div style={{
                                                padding: '20px',
                                                borderRadius: '8px',
                                                border: '1px solid #d9d9d9'
                                            }}>
                                                <h3 style={{ marginBottom: '16px', color: '#1B3C53' }}>
                                                    <MailOutlined style={{ marginRight: '8px' }} />
                                                    Address Information
                                                </h3>

                                                <EditableField
                                                    fieldName="country"
                                                    label="Country"
                                                    value={displayData.country}
                                                />

                                                <EditableField
                                                    fieldName="city"
                                                    label="City"
                                                    value={displayData.city}
                                                />

                                                <EditableField
                                                    fieldName="street"
                                                    label="Street Address"
                                                    value={displayData.street}
                                                />

                                                <EditableField
                                                    fieldName="zipCode"
                                                    label="Zip Code"
                                                    value={displayData.zipCode}
                                                />
                                            </div>
                                        </div>

                                        <Form.Item style={{ marginTop: '24px', textAlign: 'right' }}>
                                            <Button
                                                type="primary"
                                                htmlType="submit"
                                                size="large"
                                                loading={updating}
                                                style={{
                                                    backgroundColor: '#1B3C53',
                                                    borderColor: '#1B3C53',
                                                    padding: '0 32px',
                                                    height: '40px'
                                                }}
                                            >
                                                Save All Changes
                                            </Button>
                                        </Form.Item>
                                    </Form>

                                    <Divider style={{ borderColor: '#d9d9d9' }} />

                                    {/* Read-only fields (System-managed) */}
                                    <div style={{
                                        background: '#f9f9f9',
                                        padding: '20px',
                                        borderRadius: '8px',
                                        border: '1px solid #d9d9d9'
                                    }}>
                                        <h3 style={{ marginBottom: '16px', color: '#1B3C53' }}>
                                            <IdcardOutlined style={{ marginRight: '8px' }} />
                                            System Information (Read-only)
                                        </h3>
                                        <Descriptions column={1} size="small">
                                            <Descriptions.Item label="User ID">{displayData.id || user?.userId}</Descriptions.Item>
                                            <Descriptions.Item label="Member Number">{displayData.baseMemberNo}</Descriptions.Item>
                                            <Descriptions.Item label="Username">{displayData.username || user?.username}</Descriptions.Item>
                                            <Descriptions.Item label="Account Created">{displayData.createdAt}</Descriptions.Item>
                                            <Descriptions.Item label="Last Updated">{displayData.updatedAt}</Descriptions.Item>
                                        </Descriptions>
                                    </div>
                                </div>
                            )
                        },
                        {
                            key: '2',
                            label: (
                                <span>
                                    <LockOutlined style={{ marginRight: '8px' }} />
                                    Change Password
                                </span>
                            ),
                            children: (
                                <div style={{ padding: '20px 0', maxWidth: '500px' }}>
                                    <div style={{
                                        background: '#f0f7ff',
                                        padding: '16px',
                                        borderRadius: '8px',
                                        marginBottom: '24px',
                                        border: '1px solid #d9d9d9'
                                    }}>
                                        <SafetyOutlined style={{ color: '#1890ff', marginRight: '8px' }} />
                                        For security, OTP verification is required to change your password.
                                    </div>

                                    <Form
                                        form={passwordForm}
                                        layout="vertical"
                                        onFinish={onPasswordFinish}
                                    >
                                        <Form.Item
                                            label="Current Password"
                                            name="currentPassword"
                                            rules={[{ required: true, message: 'Please input your current password!' }]}
                                        >
                                            <Input.Password
                                                prefix={<LockOutlined />}
                                                placeholder="Enter current password"
                                                size="large"
                                                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            label="New Password"
                                            name="newPassword"
                                            rules={[
                                                { required: true, message: 'Please input new password!' },
                                                { min: 8, message: 'Password must be at least 8 characters!' }
                                            ]}
                                        >
                                            <Input.Password
                                                prefix={<SafetyOutlined />}
                                                placeholder="Enter new password"
                                                size="large"
                                                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            label="Confirm New Password"
                                            name="confirmPassword"
                                            rules={[
                                                { required: true, message: 'Please confirm your new password!' },
                                                ({ getFieldValue }) => ({
                                                    validator(_, value) {
                                                        if (!value || getFieldValue('newPassword') === value) {
                                                            return Promise.resolve();
                                                        }
                                                        return Promise.reject(new Error('The two passwords do not match!'));
                                                    },
                                                }),
                                            ]}
                                        >
                                            <Input.Password
                                                prefix={<SafetyOutlined />}
                                                placeholder="Confirm new password"
                                                size="large"
                                                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                                            />
                                        </Form.Item>

                                        <Form.Item style={{ marginTop: '32px', textAlign: 'right' }}>
                                            <Button
                                                type="primary"
                                                htmlType="submit"
                                                size="large"
                                                loading={isChangingPassword}
                                                style={{
                                                    backgroundColor: '#1B3C53',
                                                    borderColor: '#1B3C53',
                                                    padding: '0 32px',
                                                    height: '40px'
                                                }}
                                            >
                                                Change Password
                                            </Button>
                                        </Form.Item>
                                    </Form>
                                </div>
                            )
                        }
                    ]}
                />
            </Card>
        </div>
    );
};

export default ProfilePage;