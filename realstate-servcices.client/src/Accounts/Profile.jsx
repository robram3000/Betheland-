// profile.jsx
import React, { useState } from 'react';
import { Card, Avatar, Descriptions, Button, Tag, Divider, Tabs, Form, Input, Modal, message, Alert } from 'antd';
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

    // Mock user data - Fields marked as READONLY should not be modifiable by users
    const userData = {
        // READONLY FIELDS (System-managed)
        id: 12345,
        baseMemberNo: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        username: 'johndoe_2023',
        role: 'User', // Changed from 'Premium User'
        status: 'Active',
        createdAt: 'January 15, 2023',
        updatedAt: 'February 20, 2024',

        // MODIFIABLE FIELDS (User can change)
        email: 'john.doe@example.com',
        firstName: 'John',
        middleName: 'Michael',
        lastName: 'Doe',
        suffix: 'Jr.',
        cellPhoneNo: '+1 (555) 123-4567',
        country: 'USA',
        city: 'New York',
        street: '123 Main Street',
        zipCode: '10001',
        profilePictureUrl: null
    };

    const onProfileFinish = (values) => {
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

        console.log('Submitting modifiable data:', modifiableData);
        message.success('Profile updated successfully!');
        // Handle profile update API call with only modifiable data
    };

    const onPasswordFinish = (values) => {
        console.log('Password change initiated:', values);
        setIsChangingPassword(true);
        // In real app, this would trigger OTP sending to email/phone
        showOtpModal();
    };

    const showOtpModal = () => {
        setIsOtpModalVisible(true);
        // Simulate sending OTP
        message.info('OTP sent to your registered email/phone');
    };

    const handleOtpSubmit = (values) => {
        console.log('OTP verification:', values);

        // Simulate OTP verification
        if (values.otp === '123456') {
            message.success('Password changed successfully!');
            setIsOtpModalVisible(false);
            setIsChangingPassword(false);
            passwordForm.resetFields();
            otpForm.resetFields();
        } else {
            message.error('Invalid OTP. Please try again.');
        }
    };

    const handleOtpCancel = () => {
        setIsOtpModalVisible(false);
        setIsChangingPassword(false);
        otpForm.resetFields();
    };

    const resendOtp = () => {
        message.info('New OTP sent to your registered email/phone');
    };

    // Helper to get full name
    const getFullName = () => {
        return `${userData.firstName} ${userData.middleName ? userData.middleName + ' ' : ''}${userData.lastName}${userData.suffix ? ' ' + userData.suffix : ''}`;
    };

    // Edit field functions
    const startEditing = (fieldName, currentValue) => {
        setEditingField(fieldName);
        setTempValues({
            ...tempValues,
            [fieldName]: currentValue
        });
    };

    const saveField = (fieldName) => {
        const newValue = tempValues[fieldName];
        console.log(`Saving ${fieldName}:`, newValue);

        // Update form values
        const currentValues = profileForm.getFieldsValue();
        profileForm.setFieldsValue({
            ...currentValues,
            [fieldName]: newValue
        });

        // In real app, you would make API call here to update the specific field
        message.success(`${fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} updated successfully!`);

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
                borderBottom: '1px solid #d9d9d9' // Changed to gray
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
                            <Button type="link" onClick={resendOtp}>
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
                    border: '1px solid #d9d9d9' // Added gray border
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
                    borderBottom: '1px solid #d9d9d9' // Added gray border
                }}>
                    <Avatar
                        size={80}
                        icon={<UserOutlined />}
                        src={userData.profilePictureUrl}
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
                                {userData.status}
                            </Tag>
                            <span style={{ opacity: 0.9 }}>{userData.role}</span>
                            <span style={{ opacity: 0.7, fontSize: '12px' }}>@{userData.username}</span>
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
                                        initialValues={{
                                            // Modifiable fields
                                            email: userData.email,
                                            firstName: userData.firstName,
                                            middleName: userData.middleName,
                                            lastName: userData.lastName,
                                            suffix: userData.suffix,
                                            cellPhoneNo: userData.cellPhoneNo,
                                            country: userData.country,
                                            city: userData.city,
                                            street: userData.street,
                                            zipCode: userData.zipCode
                                        }}
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
                                                border: '1px solid #d9d9d9' // Changed to gray
                                            }}>
                                                <h3 style={{ marginBottom: '16px', color: '#1B3C53' }}>
                                                    <UserOutlined style={{ marginRight: '8px' }} />
                                                    Personal Information
                                                </h3>

                                                <EditableField
                                                    fieldName="firstName"
                                                    label="First Name"
                                                    value={userData.firstName}
                                                    icon={UserOutlined}
                                                    rules={[{ required: true, message: 'First name is required' }]}
                                                />

                                                <EditableField
                                                    fieldName="middleName"
                                                    label="Middle Name"
                                                    value={userData.middleName}
                                                />

                                                <EditableField
                                                    fieldName="lastName"
                                                    label="Last Name"
                                                    value={userData.lastName}
                                                    rules={[{ required: true, message: 'Last name is required' }]}
                                                />

                                                <EditableField
                                                    fieldName="suffix"
                                                    label="Suffix"
                                                    value={userData.suffix}
                                                />

                                                <EditableField
                                                    fieldName="cellPhoneNo"
                                                    label="Phone Number"
                                                    value={userData.cellPhoneNo}
                                                    icon={PhoneOutlined}
                                                    rules={[{ required: true, message: 'Phone number is required' }]}
                                                />
                                            </div>

                                            {/* Address Information */}
                                            <div style={{
                                    
                                                padding: '20px',
                                                borderRadius: '8px',
                                                border: '1px solid #d9d9d9' // Changed to gray
                                            }}>
                                                <h3 style={{ marginBottom: '16px', color: '#1B3C53' }}>
                                                    <MailOutlined style={{ marginRight: '8px' }} />
                                                    Address Information
                                                </h3>

                                                <EditableField
                                                    fieldName="country"
                                                    label="Country"
                                                    value={userData.country}
                                                />

                                                <EditableField
                                                    fieldName="city"
                                                    label="City"
                                                    value={userData.city}
                                                />

                                                <EditableField
                                                    fieldName="street"
                                                    label="Street Address"
                                                    value={userData.street}
                                                />

                                                <EditableField
                                                    fieldName="zipCode"
                                                    label="Zip Code"
                                                    value={userData.zipCode}
                                                />
                                            </div>
                                        </div>

                                        <Form.Item style={{ marginTop: '24px', textAlign: 'right' }}>
                                            <Button
                                                type="primary"
                                                htmlType="submit"
                                                size="large"
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

                                    <Divider style={{ borderColor: '#d9d9d9' }} /> {/* Changed to gray */}

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